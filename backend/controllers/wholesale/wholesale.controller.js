import productModel from "../../models/products/product.model.js";
import customerProfile from "../../models/sellers/profile.model.js";

// @desc    Get all wholesale products
// @route   GET /api/wholesale/products
export const getWholesaleProducts = async (req, res) => {
    try {
        const { category, minQty, maxPrice, search } = req.query;
        let query = { nodeType: "wholesale" };

        if (category) {
            query.businessCategory = category;
        }

        if (search) {
            query.productName = { $regex: search, $options: "i" };
        }

        const products = await productModel.find(query)
            .populate('sellerId', 'firstName lastName')
            .sort({ createdAt: -1 });

        // If minQty is provided, filter out products that require a higher minimum order
        let filteredProducts = products;
        if (minQty) {
            const qty = parseInt(minQty);
            filteredProducts = products.filter(p => p.minimumOrderQty <= qty);
        }

        res.status(200).json({
            success: true,
            count: filteredProducts.length,
            data: filteredProducts
        });
    } catch (error) {
        console.error("Error in getWholesaleProducts:", error);
        res.status(500).json({ success: false, message: "Server Error fetching wholesale products." });
    }
};

// @desc    Get all wholesale distributors/sellers
// @route   GET /api/wholesale/distributors
export const getWholesaleDistributors = async (req, res) => {
    try {
        const distributors = await customerProfile.find({ sellerType: "wholesale" })
            .populate('customerId', 'email isVerified');

        res.status(200).json({
            success: true,
            count: distributors.length,
            data: distributors
        });
    } catch (error) {
        console.error("Error in getWholesaleDistributors:", error);
        res.status(500).json({ success: false, message: "Server Error fetching wholesale distributors." });
    }
};

// @desc    Get single wholesale product details
// @route   GET /api/wholesale/products/:id
export const getWholesaleProductById = async (req, res) => {
    try {
        const product = await productModel.findOne({ _id: req.params.id, nodeType: "wholesale" })
            .populate('sellerId', 'firstName lastName contact address');

        if (!product) {
            return res.status(404).json({ success: false, message: "Wholesale product not found" });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error("Error in getWholesaleProductById:", error);
        res.status(500).json({ success: false, message: "Server Error fetching wholesale product." });
    }
};
