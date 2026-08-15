import mongoose from "mongoose";
import ProductModel from "../../models/products/product.model.js";
import OrderModel from "../../models/orders/order.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { seedDatabase } from "../../services/seeder.service.js";
import SellerNode from "../../models/sellerNodes/sellerNode.model.js";
import SellerModel from "../../models/sellers/auth.model.js";
import { uploadBuffer } from "../../utils/cloudinary.js";

// Helper to get active products from active stores
const getActiveFilterQuery = async (extraQuery = {}) => {
    const filter = {
        ...extraQuery,
        isDeleted: { $ne: true }
    };

    // Only apply global active seller/node filters if specific seller/node is not requested
    if (!extraQuery.sellerId) {
        filter.isActive = true;
        const activeSellers = await SellerModel.find({ status: { $ne: "blocked" } }).select("_id");
        filter.sellerId = { $in: activeSellers.map(s => s._id) };
    }

    if (!extraQuery.nodeId) {
        const activeNodes = await SellerNode.find({
            status: "ACTIVE",
            nodeType: { $in: ["LOCAL_RETAIL", "WHOLESALE_B2B", "QUICK_COMMERCE", "HOME_ESSENTIALS", "ELECTRONICS", "PERSONAL_CARE"] }
        }).select("_id");
        filter.nodeId = { $in: activeNodes.map(n => n._id) };
    }

    return filter;
};

// Helper to enrich products with reserved and available stock
const enrichProductsWithInventory = async (products) => {
    const isArray = Array.isArray(products);
    const productList = isArray ? products : [products];
    const plainProducts = productList.map(p => p.toObject ? p.toObject() : p);
    const productIds = plainProducts.map(p => p._id);

    // Get all pending orders that contain these products
    const pendingOrders = await OrderModel.find({
        status: "Pending",
        "orderItems.product": { $in: productIds }
    });

    // Map of product ID -> reserved count
    const reservedMap = {};
    for (const order of pendingOrders) {
        for (const item of order.orderItems) {
            const pId = item.product.toString();
            reservedMap[pId] = (reservedMap[pId] || 0) + (item.quantity || 0);
        }
    }

    // Attach fields
    for (const p of plainProducts) {
        const pId = p._id.toString();
        const reserved = reservedMap[pId] || 0;
        p.reserved = reserved;
        p.available = Math.max(0, p.stock - reserved);
    }

    return isArray ? plainProducts : plainProducts[0];
};


// @desc    Create a new product
// @route   POST /api/v1/indiafy/products
// @access  Private (Seller only)
export const createProduct = asyncHandler(async (req, res) => {
    const { subCategoryId, categoryName, productName, productSkuId, attribute, shortDescription, description, nodeType, nodeId, stock } = req.body;

    // Ensure user is a seller
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== "seller") {
        throw new ApiError(403, "Only sellers can create products");
    }

    let finalSku = productSkuId ? String(productSkuId).toUpperCase().trim() : `SKU-${Date.now()}`;
    const existingProduct = await ProductModel.findOne({ productSkuId: finalSku });
    if (existingProduct) {
        finalSku = `${finalSku}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const sellerId = req.user._id || req.user.sellerId;
    const sellerIdObj = mongoose.Types.ObjectId.isValid(sellerId) ? new mongoose.Types.ObjectId(sellerId) : sellerId;
    const sellerIdStr = String(sellerId);

    const approvedStoreQuery = {
        $or: [
            { seller: sellerIdObj },
            { seller: sellerIdStr },
            { "sellerSnapshot.sellerId": sellerIdObj },
            { "sellerSnapshot.sellerId": sellerIdStr }
        ]
    };

    if (nodeId && mongoose.Types.ObjectId.isValid(nodeId)) {
        approvedStoreQuery._id = new mongoose.Types.ObjectId(nodeId);
    } else if (nodeId) {
        approvedStoreQuery._id = String(nodeId);
    } else if (nodeType) {
        const normalized = nodeType.toUpperCase().replace(/-/g, "_");
        approvedStoreQuery.nodeType = { $regex: new RegExp(`^${normalized.replace(/_/g, "[-_]")}$`, "i") };
    }

    const approvedStore = await SellerNode.findOne(approvedStoreQuery);
    if (!approvedStore) {
        throw new ApiError(400, "No matching store node found for this seller.");
    }

    // Upload multer memory buffers to Cloudinary
    let productImage = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file =>
            uploadBuffer(file.buffer, file.mimetype, "indiafy_products")
        );
        productImage = await Promise.all(uploadPromises);
    }

    // Also accept pasted image URLs from frontend
    if (req.body.pastedImages) {
        try {
            const pastedUrls = JSON.parse(req.body.pastedImages);
            if (Array.isArray(pastedUrls)) {
                productImage = [...productImage, ...pastedUrls];
            }
        } catch (_e) { /* ignore parse error */ }
    }

    const parsedAttribute = typeof attribute === "string" ? JSON.parse(attribute) : (attribute || {});
    const finalStock = req.body.stock !== undefined ? Number(req.body.stock) : (parsedAttribute?.quantity !== undefined ? Number(parsedAttribute.quantity) : 0);
    
    // Ensure attribute object has required fields with safe fallbacks
    parsedAttribute.quantity = finalStock.toString();
    if (parsedAttribute.salePrice === undefined && req.body.price !== undefined) {
        parsedAttribute.salePrice = Number(req.body.price);
    }
    if (parsedAttribute.mrpPrice === undefined) {
        parsedAttribute.mrpPrice = parsedAttribute.mrp !== undefined ? Number(parsedAttribute.mrp) : (parsedAttribute.salePrice || 0);
    }
    if (!parsedAttribute.weight) {
        parsedAttribute.weight = "500g";
    }

    const finalShortDescription = (shortDescription && String(shortDescription).trim()) ? String(shortDescription).trim() : (productName || "Product Short Description");
    const finalDescription = (description && String(description).trim()) ? String(description).trim() : (productName || "Product Description");

    const normalizeNodeType = (type) => {
        if (!type) return "HOME_ESSENTIALS";
        const upper = type.toUpperCase().replace(/-/g, "_");
        if (upper.includes("HOME")) return "HOME_ESSENTIALS";
        if (upper.includes("WHOLESALE")) return "WHOLESALE_B2B";
        if (upper.includes("QUICK")) return "QUICK_COMMERCE";
        if (upper.includes("LOCAL")) return "LOCAL_RETAIL";
        if (upper.includes("ELECTRONIC")) return "ELECTRONICS";
        if (upper.includes("PERSONAL")) return "PERSONAL_CARE";
        return upper;
    };

    const validNodeType = normalizeNodeType(nodeType || approvedStore.nodeType);

    const finalNodeId = (nodeId && mongoose.Types.ObjectId.isValid(nodeId))
        ? new mongoose.Types.ObjectId(nodeId)
        : approvedStore._id;

    const product = new ProductModel({
        sellerId: sellerIdObj,
        subCategoryId,
        categoryName,
        productName,
        productSkuId: finalSku,
        productImage,
        attribute: parsedAttribute,
        stock: finalStock,
        shortDescription: finalShortDescription,
        description: finalDescription,
        nodeType: validNodeType,
        nodeId: finalNodeId
    });

    const savedProduct = await product.save();
    const enriched = await enrichProductsWithInventory(savedProduct);
    return res.status(201).json(new ApiResponse(201, enriched, "Product created successfully"));
});

// @desc    Get all products (with optional filtering)
// @route   GET /api/v1/indiafy/products
// @access  Public / Customer
export const getAllProducts = asyncHandler(async (req, res) => {
    const { subCategory, search, sellerId, nodeType, nodeId, categoryName } = req.query;
    let query = {};

    if (subCategory) {
        query.subCategoryId = subCategory;
    }

    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
        query.sellerId = { $in: [new mongoose.Types.ObjectId(sellerId), String(sellerId)] };
    } else if (sellerId) {
        query.sellerId = String(sellerId);
    }

    if (nodeType) {
        const normalized = nodeType.toUpperCase().replace(/-/g, "_");
        if (normalized.includes("WHOLESALE")) {
            query.nodeType = { $in: ["WHOLESALE_B2B", "wholesale"] };
        } else if (normalized.includes("QUICK")) {
            query.nodeType = { $in: ["QUICK_COMMERCE", "quick-commerce"] };
        } else if (normalized.includes("LOCAL")) {
            query.nodeType = { $in: ["LOCAL_RETAIL", "local-retail", "local"] };
        } else if (normalized.includes("HOME")) {
            query.nodeType = { $in: ["HOME_ESSENTIALS", "home-essentials", "home_essentials"] };
        } else if (normalized.includes("ELECTRONIC")) {
            query.nodeType = { $in: ["ELECTRONICS", "electronics"] };
        } else if (normalized.includes("PERSONAL")) {
            query.nodeType = { $in: ["PERSONAL_CARE", "personal-care", "personal_care"] };
        } else {
            query.nodeType = { $regex: new RegExp(`^${nodeType.replace(/_/g, "[-_]")}$`, "i") };
        }
    }

    if (nodeId && mongoose.Types.ObjectId.isValid(nodeId)) {
        query.nodeId = { $in: [new mongoose.Types.ObjectId(nodeId), String(nodeId)] };
    } else if (nodeId) {
        query.nodeId = String(nodeId);
    }

    if (categoryName) {
        query.categoryName = { $regex: new RegExp(`^${categoryName}$`, "i") };
    }

    if (search) {
        query.productName = { $regex: search, $options: "i" };
    }

    const activeQuery = await getActiveFilterQuery(query);

    const products = await ProductModel.find(activeQuery)
        .populate("sellerId", "firstName lastName email")
        .populate("nodeId", "storeName nodeType status")
        .populate("subCategoryId", "subCategoryName")
        .limit(100);
    
    const enriched = await enrichProductsWithInventory(products);
    return res.status(200).json(new ApiResponse(200, enriched, "Products fetched successfully"));
});

// @desc    Get product by ID
// @route   GET /api/v1/indiafy/products/:id
// @access  Public / Customer
export const getProductById = asyncHandler(async (req, res) => {
    const product = await ProductModel.findById(req.params.id).populate("sellerId", "firstName lastName email");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const enriched = await enrichProductsWithInventory(product);
    return res.status(200).json(new ApiResponse(200, enriched, "Product fetched successfully"));
});

// @desc    Update a product
// @route   PUT /api/v1/indiafy/products/:id
// @access  Private (Seller only)
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Only the seller who created the product (or an admin) can update it
    const userRole = req.user.role?.toLowerCase();
    const currentSellerId = req.user._id || req.user.sellerId || req.user.id;
    if (currentSellerId && product.sellerId && product.sellerId.toString() !== currentSellerId.toString() && userRole !== "admin") {
        throw new ApiError(403, "Not authorized to update this product");
    }

    const updateData = { ...req.body };
    
    // Parse attribute if string
    if (updateData.attribute) {
        if (typeof updateData.attribute === "string") {
            updateData.attribute = JSON.parse(updateData.attribute);
        }
        if (updateData.attribute.quantity !== undefined) {
            updateData.stock = Number(updateData.attribute.quantity);
        }
    }
    
    // Check if quantity or stock are passed directly at root level
    if (updateData.quantity !== undefined && updateData.stock === undefined) {
        updateData.stock = Number(updateData.quantity);
    }
    
    if (updateData.stock !== undefined) {
        updateData.stock = Number(updateData.stock);
        if (updateData.attribute) {
            updateData.attribute.quantity = updateData.stock.toString();
        } else {
            const currentAttr = product.attribute ? (product.attribute.toObject ? product.attribute.toObject() : product.attribute) : {};
            updateData.attribute = {
                ...currentAttr,
                quantity: updateData.stock.toString()
            };
        }
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    const enriched = await enrichProductsWithInventory(updatedProduct);
    return res.status(200).json(new ApiResponse(200, enriched, "Product updated successfully"));
});

// @desc    Get all unique categories that have products
// @route   GET /api/v1/indiafy/products/categories
// @access  Public
export const getAvailableCategories = asyncHandler(async (req, res) => {
    const categories = await ProductModel.distinct("categoryName"); 
    
    if (categories.length === 0) {
        return res.status(200).json(new ApiResponse(200, ["Spices", "Grains", "Beverages", "Electronics", "Fashion"], "Default categories fetched"));
    }

    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

// @desc    Delete a product
// @route   DELETE /api/v1/indiafy/products/:id
// @access  Private (Seller/Admin only)
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const userRole = req.user.role?.toLowerCase();
    const currentSellerId = req.user._id || req.user.sellerId || req.user.id;
    if (currentSellerId && product.sellerId && product.sellerId.toString() !== currentSellerId.toString() && userRole !== "admin") {
        throw new ApiError(403, "Not authorized to delete this product");
    }

    await ProductModel.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});
export const seedProducts = asyncHandler(async (req, res) => {
    const force = req.query.force === "true" || req.body?.force === true;
    const result = await seedDatabase(force);
    return res.status(200).json(new ApiResponse(200, result, result.message));
});

export const getLatestProducts = asyncHandler(async (req, res) => {
    const activeQuery = await getActiveFilterQuery({});
    const products = await ProductModel.find(activeQuery)
        .populate("sellerId", "firstName lastName email")
        .populate("nodeId", "storeName nodeType status")
        .populate("subCategoryId", "subCategoryName")
        .sort({ createdAt: -1 })
        .limit(30);

    const enriched = await enrichProductsWithInventory(products);
    return res.status(200).json(new ApiResponse(200, enriched, "Latest products fetched successfully"));
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
    const activeQuery = await getActiveFilterQuery({ isFeatured: true });
    const products = await ProductModel.find(activeQuery)
        .populate("sellerId", "firstName lastName email")
        .populate("nodeId", "storeName nodeType status")
        .populate("subCategoryId", "subCategoryName")
        .limit(30);

    const enriched = await enrichProductsWithInventory(products);
    return res.status(200).json(new ApiResponse(200, enriched, "Featured products fetched successfully"));
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const cleanSlug = (slug || "").toLowerCase().trim();

    let categoryFilter = {};

    if (cleanSlug === "quick-commerce" || cleanSlug.includes("quick") || cleanSlug.includes("30-min") || cleanSlug.includes("express")) {
        categoryFilter.$or = [
            { nodeType: "QUICK_COMMERCE" },
            { categoryName: { $regex: /quick|express|30-min|fast/i } }
        ];
    } else if (cleanSlug === "wholesale" || cleanSlug.includes("wholesale") || cleanSlug.includes("b2b") || cleanSlug.includes("bulk")) {
        categoryFilter.$or = [
            { nodeType: "WHOLESALE_B2B" },
            { isWholesale: true },
            { categoryName: { $regex: /wholesale|bulk|b2b/i } }
        ];
    } else if (cleanSlug.includes("local") || cleanSlug === "stores" || cleanSlug.includes("store")) {
        categoryFilter.$or = [
            { nodeType: "LOCAL_RETAIL" },
            { categoryName: { $regex: /local|retail|store/i } }
        ];
    } else if (cleanSlug.includes("groc") || cleanSlug.includes("food") || cleanSlug.includes("snack") || cleanSlug.includes("daily")) {
        categoryFilter.$or = [
            { categoryName: { $regex: /groc|food|daily|snack|beverage|bakery|burger|pizza|fruit|veg|eat|meal|dairy|kitchen/i } },
            { productName: { $regex: /burger|pizza|sandwich|bread|milk|grocery|apple|fruit|veg|biscuit|tea|coffee|snack/i } }
        ];
    } else if (cleanSlug.includes("fashion") || cleanSlug.includes("garment") || cleanSlug.includes("cloth") || cleanSlug.includes("wear")) {
        categoryFilter.$or = [
            { categoryName: { $regex: /fashion|garment|cloth|wear|apparel|shirt|pant|shoe|dress/i } },
            { nodeType: "FASHION" }
        ];
    } else if (cleanSlug.includes("electr") || cleanSlug.includes("mobile") || cleanSlug.includes("gadget") || cleanSlug.includes("audio")) {
        categoryFilter.$or = [
            { categoryName: { $regex: /electr|mobile|gadget|audio|phone|laptop|headphone|tech/i } },
            { nodeType: "ELECTRONICS" }
        ];
    } else if (cleanSlug.includes("beaut") || cleanSlug.includes("cosmetic") || cleanSlug.includes("personal-care")) {
        categoryFilter.$or = [
            { categoryName: { $regex: /beaut|cosmetic|skincare|haircare|makeup|fragrance|parfum|personal care/i } },
            { nodeType: "PERSONAL_CARE" }
        ];
    } else if (cleanSlug.includes("home") || cleanSlug.includes("living") || cleanSlug.includes("decor")) {
        categoryFilter.$or = [
            { categoryName: { $regex: /home|decor|living|furniture|bedding|towel/i } },
            { nodeType: "HOME_ESSENTIALS" }
        ];
    } else if (cleanSlug.includes("health") || cleanSlug.includes("pharmacy") || cleanSlug.includes("medic")) {
        categoryFilter.categoryName = { $regex: /health|pharm|medic|wellness|first aid/i };
    } else {
        const flexibleRegex = new RegExp(cleanSlug.replace(/-/g, "[\\s-_]*"), "i");
        categoryFilter.$or = [
            { categoryName: { $regex: flexibleRegex } },
            { productName: { $regex: flexibleRegex } },
            { brand: { $regex: flexibleRegex } }
        ];
    }

    const activeQuery = await getActiveFilterQuery(categoryFilter);

    const products = await ProductModel.find(activeQuery)
        .populate("sellerId", "firstName lastName email businessName")
        .populate("nodeId", "storeName nodeType status logo")
        .populate("subCategoryId", "subCategoryName")
        .sort({ createdAt: -1 })
        .limit(100);

    const enriched = await enrichProductsWithInventory(products);
    return res.status(200).json(new ApiResponse(200, enriched, "Products by category fetched successfully"));
});

export const searchProducts = asyncHandler(async (req, res) => {
    const { q } = req.query;
    let query = {};
    if (q) {
        query.$or = [
            { productName: { $regex: q, $options: "i" } },
            { brand: { $regex: q, $options: "i" } },
            { categoryName: { $regex: q, $options: "i" } },
            { shortDescription: { $regex: q, $options: "i" } }
        ];
    }
    const activeQuery = await getActiveFilterQuery(query);

    const products = await ProductModel.find(activeQuery)
        .populate("sellerId", "firstName lastName email")
        .populate("nodeId", "storeName nodeType status")
        .populate("subCategoryId", "subCategoryName")
        .limit(100);

    const enriched = await enrichProductsWithInventory(products);
    return res.status(200).json(new ApiResponse(200, enriched, "Search results fetched successfully"));
});

export const resolveImageServer = async (urlStr) => {
    if (!urlStr || typeof urlStr !== "string") return "";
    let trimmed = urlStr.trim();
    if (!trimmed) return "";

    // 1. Google Images redirect link
    if (trimmed.includes("google.com/imgres") || trimmed.includes("imgurl=")) {
        try {
            const parsedUrl = new URL(trimmed);
            const imgUrl = parsedUrl.searchParams.get("imgurl");
            if (imgUrl) return decodeURIComponent(imgUrl);
        } catch (_e) {}
    }

    // 2. Pinterest Pin Page URL
    if (trimmed.includes("pinterest.com") || trimmed.includes("pin.it")) {
        if (!trimmed.includes("i.pinimg.com/")) {
            try {
                const res = await fetch(`https://www.pinterest.com/oembed.json?url=${encodeURIComponent(trimmed)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.thumbnail_url) {
                        return data.thumbnail_url.replace("/236x/", "/736x/");
                    }
                }
            } catch (_e) {}
        }
    }

    // 3. Unsplash photo page URL or direct photo link
    if (trimmed.includes("unsplash.com")) {
        const numericMatch = trimmed.match(/(1\d{9,12}-[a-f0-9]+)/i);
        if (numericMatch && numericMatch[1]) {
            return `https://images.unsplash.com/photo-${numericMatch[1]}?w=800&auto=format&fit=crop`;
        }
    }

    // 4. HTML OpenGraph resolver for non-direct image webpage URLs
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const isDirectImage = /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(trimmed) ||
                              trimmed.includes("i.pinimg.com/") ||
                              trimmed.includes("images.unsplash.com/photo-") ||
                              trimmed.includes("i.imgur.com/") ||
                              trimmed.includes("media-amazon.com/") ||
                              trimmed.includes("cdn.shopify.com/");
        if (!isDirectImage) {
            try {
                const res = await fetch(trimmed, {
                    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
                });
                if (res.ok) {
                    const html = await res.text();
                    const ogMatch = html.match(/property=["\']og:image["\']\s+content=["\']([^"\']+)["\']/i) ||
                                    html.match(/content=["\']([^"\']+)["\']\s+property=["\']og:image["\']/i) ||
                                    html.match(/name=["\']twitter:image["\']\s+content=["\']([^"\']+)["\']/i);
                    if (ogMatch && ogMatch[1]) {
                        return ogMatch[1];
                    }
                }
            } catch (_e) {}
        }
    }

    return trimmed;
};

export const resolveProductImage = asyncHandler(async (req, res) => {
    const { url } = req.body;
    if (!url) {
        throw new ApiError(400, "URL is required");
    }
    const directUrl = await resolveImageServer(url);
    return res.status(200).json(new ApiResponse(200, { directUrl }, "Image URL resolved successfully"));
});
