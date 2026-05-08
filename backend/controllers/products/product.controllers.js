import ProductModel from "../../models/products/product.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// @desc    Create a new product
// @route   POST /api/v1/indiafy/products
// @access  Private (Seller only)
export const createProduct = asyncHandler(async (req, res) => {
    const { subCategoryId, categoryName, productName, productSkuId, attribute, shortDescription, description, nodeType, nodeId } = req.body;

    // Ensure user is a seller
    const userRole = req.user.role?.toLowerCase();
    if (userRole !== "seller") {
        throw new ApiError(403, "Only sellers can create products");
    }

    const existingProduct = await ProductModel.findOne({ productSkuId });
    if (existingProduct) {
        throw new ApiError(400, "Product with this SKU already exists");
    }

    // Extract image URLs from multer req.files
    const productImage = req.files ? req.files.map(file => file.path) : [];

    if (productImage.length === 0) {
        throw new ApiError(400, "At least one product image is required");
    }

    const product = new ProductModel({
        sellerId: req.user._id,
        subCategoryId,
        categoryName,
        productName,
        productSkuId,
        productImage,
        attribute: typeof attribute === "string" ? JSON.parse(attribute) : attribute, // Handle FormData parsing
        shortDescription,
        description,
        nodeType: nodeType || "local",
        nodeId: nodeId || null
    });

    const savedProduct = await product.save();
    return res.status(201).json(new ApiResponse(201, savedProduct, "Product created successfully"));
});

// @desc    Get all products (with optional filtering)
// @route   GET /api/v1/indiafy/products
// @access  Public / Customer
export const getAllProducts = asyncHandler(async (req, res) => {
    const { subCategory, search, sellerId, nodeType, nodeId } = req.query;
    let query = {};

    if (subCategory) {
        query.subCategoryId = subCategory;
    }

    if (sellerId) {
        query.sellerId = sellerId;
    }

    if (nodeType) {
        query.nodeType = nodeType;
    }

    if (nodeId) {
        query.nodeId = nodeId;
    }

    if (search) {
        query.productName = { $regex: search, $options: "i" };
    }

    const products = await ProductModel.find(query)
        .populate("sellerId", "firstName lastName email")
        .populate("subCategoryId", "subCategoryName")
        .limit(50);
    
    return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
});

// @desc    Get product by ID
// @route   GET /api/v1/indiafy/products/:id
// @access  Public / Customer
export const getProductById = asyncHandler(async (req, res) => {
    const product = await ProductModel.findById(req.params.id).populate("sellerId", "firstName lastName email");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
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

    const updatedProduct = await ProductModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
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
