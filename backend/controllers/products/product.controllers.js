import ProductModel from "../../models/products/product.model.js";
import OrderModel from "../../models/orders/order.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { seedDatabase } from "../../services/seeder.service.js";
import SellerNode from "../../models/sellerNodes/sellerNode.model.js";
import SellerModel from "../../models/sellers/auth.model.js";

// Helper to get active products from active stores
const getActiveFilterQuery = async (extraQuery = {}) => {
    // 1. Find all active sellers
    const activeSellers = await SellerModel.find({ status: "active" }).select("_id");
    const sellerIds = activeSellers.map(s => s._id);

    // 2. Find all active nodes of type LOCAL_RETAIL, WHOLESALE_B2B, or QUICK_COMMERCE
    const activeNodes = await SellerNode.find({
        status: "ACTIVE",
        nodeType: { $in: ["LOCAL_RETAIL", "WHOLESALE_B2B", "QUICK_COMMERCE"] }
    }).select("_id");
    const nodeIds = activeNodes.map(n => n._id);

    // 3. Build product query
    return {
        ...extraQuery,
        sellerId: { $in: sellerIds },
        nodeId: { $in: nodeIds },
        isActive: true,
        isDeleted: { $ne: true },
        $or: [
            { status: "ACTIVE" },
            { status: { $exists: false } }
        ]
    };
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

    const existingProduct = await ProductModel.findOne({ productSkuId });
    if (existingProduct) {
        throw new ApiError(400, "Product with this SKU already exists");
    }

    const approvedStoreQuery = nodeId
        ? { _id: nodeId, seller: req.user._id }
        : { seller: req.user._id, nodeType };
    const approvedStore = await SellerNode.findOne(approvedStoreQuery);
    if (!approvedStore || approvedStore.status !== "ACTIVE" || !approvedStore.isActive || !approvedStore.isLive) {
        throw new ApiError(403, "Store features are locked until admin approval.");
    }

    // Extract image URLs from multer req.files
    const productImage = req.files ? req.files.map(file => file.path) : [];

    if (productImage.length === 0) {
        throw new ApiError(400, "At least one product image is required");
    }

    const parsedAttribute = typeof attribute === "string" ? JSON.parse(attribute) : attribute;
    const finalStock = req.body.stock !== undefined ? Number(req.body.stock) : (parsedAttribute?.quantity !== undefined ? Number(parsedAttribute.quantity) : 0);
    if (parsedAttribute) {
        parsedAttribute.quantity = finalStock.toString();
    }

    const product = new ProductModel({
        sellerId: req.user._id,
        subCategoryId,
        categoryName,
        productName,
        productSkuId,
        productImage,
        attribute: parsedAttribute,
        stock: finalStock,
        shortDescription,
        description,
        nodeType: nodeType || "local",
        nodeId: nodeId || null
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

    if (sellerId) {
        query.sellerId = sellerId;
    }

    if (nodeType) {
        if (nodeType.toLowerCase() === "wholesale") {
            query.nodeType = { $in: ["WHOLESALE_B2B", "wholesale"] };
        } else if (nodeType.toLowerCase() === "quick-commerce" || nodeType.toLowerCase() === "quick_commerce") {
            query.nodeType = { $in: ["QUICK_COMMERCE", "quick-commerce"] };
        } else if (nodeType.toLowerCase() === "local" || nodeType.toLowerCase() === "local-retail" || nodeType.toLowerCase() === "local_retail") {
            query.nodeType = { $in: ["LOCAL_RETAIL", "local-retail"] };
        } else {
            query.nodeType = nodeType;
        }
    }

    if (nodeId) {
        query.nodeId = nodeId;
    }

    if (categoryName) {
        query.categoryName = { $regex: new RegExp(`^${categoryName}$`, "i") };
    }

    if (search) {
        query.productName = { $regex: search, $options: "i" };
    }

    // Auto-seed if query is for Sharma Mart and it has no products
    if (nodeId) {
        const node = await SellerNode.findById(nodeId);
        if (node && node.storeName.match(/Sharma Mart/i)) {
            const count = await ProductModel.countDocuments({ nodeId });
            if (count === 0) {
                await seedDatabase(false);
            }
        }
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
    if (product.sellerId.toString() !== req.user._id.toString() && userRole !== "admin") {
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
    if (product.sellerId.toString() !== req.user._id.toString() && userRole !== "admin") {
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
    const categoryNameRegex = new RegExp(`^${slug.replace(/-/g, " ")}$`, "i");
    
    const activeQuery = await getActiveFilterQuery({
        categoryName: { $regex: categoryNameRegex }
    });

    const products = await ProductModel.find(activeQuery)
        .populate("sellerId", "firstName lastName email")
        .populate("nodeId", "storeName nodeType status")
        .populate("subCategoryId", "subCategoryName")
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
