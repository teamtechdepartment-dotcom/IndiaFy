import ProductModel from "../../models/products/product.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";

// @desc    Create a new product
// @route   POST /api/v1/indiafy/products
// @access  Private (Seller only)
export const createProduct = async (req, res) => {
    try {
        const { subCategoryId, categoryName, productName, productSkuId, attribute, shortDescription, description } = req.body;

        // Ensure user is a seller
        const userRole = req.user.role?.toLowerCase();
        if (userRole !== "seller") {
            return res.status(403).json(new ApiError(403, "Only sellers can create products"));
        }

        const existingProduct = await ProductModel.findOne({ productSkuId });
        if (existingProduct) {
            return res.status(400).json(new ApiError(400, "Product with this SKU already exists"));
        }

        // Extract image URLs from multer req.files
        const productImage = req.files ? req.files.map(file => file.path) : [];

        if (productImage.length === 0) {
            return res.status(400).json(new ApiError(400, "At least one product image is required"));
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
            description
        });

        const savedProduct = await product.save();
        return res.status(201).json(new ApiResponse(201, savedProduct, "Product created successfully"));

    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};

// @desc    Get all products (with optional filtering)
// @route   GET /api/v1/indiafy/products
// @access  Public / Customer
export const getAllProducts = async (req, res) => {
    try {
        const { subCategory, search, sellerId } = req.query;
        let query = {};

        if (subCategory) {
            query.subCategoryId = subCategory;
        }

        if (sellerId) {
            query.sellerId = sellerId;
        }

        if (search) {
            query.productName = { $regex: search, $options: "i" };
        }

        const products = await ProductModel.find(query)
            .populate("sellerId", "firstName lastName email")
            .populate("subCategoryId", "subCategoryName")
            .limit(50);
        
        return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};

// @desc    Get product by ID
// @route   GET /api/v1/indiafy/products/:id
// @access  Public / Customer
export const getProductById = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id).populate("sellerId", "firstName lastName email");

        if (!product) {
            return res.status(404).json(new ApiError(404, "Product not found"));
        }

        return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};

// @desc    Update a product
// @route   PUT /api/v1/indiafy/products/:id
// @access  Private (Seller only)
export const updateProduct = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json(new ApiError(404, "Product not found"));
        }

        // Only the seller who created the product (or an admin) can update it
        const userRole = req.user.role?.toLowerCase();
        if (product.sellerId.toString() !== req.user._id.toString() && userRole !== "admin") {
            return res.status(403).json(new ApiError(403, "Not authorized to update this product"));
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return res.status(200).json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};

// @desc    Get all unique categories that have products
// @route   GET /api/v1/indiafy/products/categories
// @access  Public
export const getAvailableCategories = async (req, res) => {
    try {
        // Since the current model doesn't have a direct 'category' string, 
        // and uses subCategoryId, we might want to return unique categories 
        // that are actually used in products.
        // For now, let's return some defaults or try to aggregate if possible.
        
        // If the user is using 'categoryName' in the frontend, maybe we should add it to the model.
        // But for a quick "Dynamic" feel, let's aggregate subCategoryId if it exists.
        
        const categories = await ProductModel.distinct("categoryName"); // Assuming we'll add this field or it's being used
        
        // If empty, let's return some defaults that match the UI for now but can be grown
        if (categories.length === 0) {
            return res.status(200).json(new ApiResponse(200, ["Spices", "Grains", "Beverages", "Electronics", "Fashion"], "Default categories fetched"));
        }

        return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message));
    }
};

// @desc    Delete a product
// @route   DELETE /api/v1/indiafy/products/:id
// @access  Private (Seller/Admin only)
export const deleteProduct = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json(new ApiError(404, "Product not found"));
        }

        const userRole = req.user.role?.toLowerCase();
        if (product.sellerId.toString() !== req.user._id.toString() && userRole !== "admin") {
            return res.status(403).json(new ApiError(403, "Not authorized to delete this product"));
        }

        await ProductModel.findByIdAndDelete(req.params.id);

        return res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};
