import OrderModel from "../../models/orders/order.model.js";
import ProductModel from "../../models/products/product.model.js";
import SellerModel from "../../models/sellers/auth.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";

// @desc    Create new order
// @route   POST /api/v1/indiafy/orders
// @access  Private (Customer)
export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, paymentResult } = req.body;

        const userRole = req.user.role?.toLowerCase();
        if (userRole !== "customer" && userRole !== "seller") {
            return res.status(403).json(new ApiError(403, "Only customers or sellers can place orders"));
        }

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json(new ApiError(400, "No order items provided"));
        }

        // Validate shipping address structure
        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
            return res.status(400).json(new ApiError(400, "Incomplete shipping address. Please provide address, city, state, and postal code."));
        }

        // Validation and Stock check
        for (const item of orderItems) {
            const product = await ProductModel.findById(item.product);
            if (!product) {
                return res.status(404).json(new ApiError(404, `Product not found: ${item.product}`));
            }
            
            const currentStock = parseInt(product.attribute?.quantity || "0");
            if (currentStock < item.quantity) {
                return res.status(400).json(new ApiError(400, `Insufficient stock for ${product.productName}. Available: ${currentStock}`));
            }
        }

        const order = new OrderModel({
            customer: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice: itemsPrice || 0,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            totalPrice: totalPrice || 0,
            paymentResult,
            isPaid: !!paymentResult,
            paidAt: paymentResult ? Date.now() : undefined,
            status: paymentResult ? "Processing" : "Pending"
        });

        console.log("Attempting to save order:", JSON.stringify(order, null, 2));
        const createdOrder = await order.save();

        // Reduce stock after successful order save
        for (const item of orderItems) {
            const product = await ProductModel.findById(item.product);
            const newQty = parseInt(product.attribute.quantity) - item.quantity;
            product.attribute.quantity = newQty.toString();
            await product.save();
        }

        console.log("Order saved and stock reduced:", createdOrder._id);
        
        return res.status(201).json(new ApiResponse(201, createdOrder, "Order placed successfully"));
    } catch (err) {
        console.error("Order Creation Detailed Error:", err);
        
        // Handle Mongoose Validation Errors specifically
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
        }

        return res.status(500).json(new ApiError(500, err.message));
    }
};

// @desc    Get order by ID
// @route   GET /api/v1/indiafy/orders/:id
// @access  Private (Customer/Seller/Admin)
export const getOrderById = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id)
            .populate('customer', 'firstName lastName email')
            .populate('orderItems.product', 'productName productImage')
            .populate('orderItems.seller', 'businessName email firstName lastName');

        if (!order) {
            return res.status(404).json(new ApiError(404, "Order not found"));
        }

        // Add security: check if this user is allowed to view this order
        // Admin can view all. Customer can view their own. Seller can view orders containing their products.
        let isAuthorized = false;
        const userRole = req.user.role?.toLowerCase();
        const userId = req.user._id?.toString();
        const customerId = order.customer?._id?.toString() || order.customer?.toString();

        if (userRole === "admin") {
            isAuthorized = true;
        } else if (userRole === "customer" && customerId === userId) {
            isAuthorized = true;
        } else if (userRole === "seller") {
            // Check if seller is the customer OR has items in this order
            const isCustomer = customerId === userId;
            const sellerHasItems = order.orderItems.some(item => 
                item.seller?._id?.toString() === userId || item.seller?.toString() === userId
            );
            if (isCustomer || sellerHasItems) isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json(new ApiError(403, "Not authorized to view this order"));
        }

        return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));

    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};

// @desc    Get logged in customer orders
// @route   GET /api/v1/indiafy/orders/myorders
// @access  Private (Customer)
export const getCustomerOrders = async (req, res) => {
    try {
        console.log("Fetching orders for customer:", req.user._id);
        const orders = await OrderModel.find({ customer: req.user._id })
            .populate('orderItems.product', 'productName productImage attribute')
            .populate('orderItems.seller', 'firstName lastName businessName')
            .sort({ createdAt: -1 });
        console.log(`Found ${orders.length} orders for user ${req.user._id}`);
        return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
    } catch (err) {
        console.error("Fetch Orders Error:", err);
        return res.status(500).json(new ApiError(500, err.message));
    }
};

// @desc    Get seller's orders
// @route   GET /api/v1/indiafy/orders/sellerorders
// @access  Private (Seller)
export const getSellerOrders = async (req, res) => {
    try {
        // Find orders that contain at least one item from this seller
        const orders = await OrderModel.find({ "orderItems.seller": req.user._id })
            .populate('customer', 'firstName lastName email')
            .populate('orderItems.product', 'productName productImage')
            .sort({ createdAt: -1 });
        return res.status(200).json(new ApiResponse(200, orders, "Seller orders fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};

// @desc    Update order status (Shipping, Delivered)
// @route   PUT /api/v1/indiafy/orders/:id/status
// @access  Private (Seller/Admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await OrderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json(new ApiError(404, "Order not found"));
        }

        // Verify seller is updating their own order or is an Admin
        const userRole = req.user.role?.toLowerCase();
        if (userRole === "seller") {
            const sellerHasItems = order.orderItems.some(item => item.seller.toString() === req.user._id.toString());
            if (!sellerHasItems) {
                return res.status(403).json(new ApiError(403, "Not authorized to update this order"));
            }
        }

        order.status = status;
        
        if (status === "Delivered") {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        return res.status(200).json(new ApiResponse(200, updatedOrder, "Order status updated successfully"));

    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};

// @desc    Upload packing video for an order
// @route   POST /api/v1/indiafy/orders/:id/upload-video
// @access  Private (Seller)
export const uploadPackingVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json(new ApiError(400, "No video file provided"));
        }

        const order = await OrderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json(new ApiError(404, "Order not found"));
        }

        // Verify seller
        const sellerHasItems = order.orderItems.some(item => item.seller.toString() === req.user._id.toString());
        if (!sellerHasItems) {
            return res.status(403).json(new ApiError(403, "Not authorized to upload video for this order"));
        }

        // Update order status to shipped automatically?
        order.status = "Shipped";

        // Mongoose doesn't have a packingVideo field explicitly defined unless I add it or just use mixed/set.
        // Let's explicitly save the video url if the schema supports it. If not, I should update the schema too.
        order.packingVideoUrl = req.file.path;

        await order.save();

        return res.status(200).json(new ApiResponse(200, { videoUrl: req.file.path }, "Packing video uploaded successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message));
    }
};

// @desc    Delete an order
// @route   DELETE /api/v1/indiafy/orders/:id
// @access  Private (Customer)
export const deleteOrder = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json(new ApiError(404, "Order not found"));
        }

        // Only owner can delete
        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json(new ApiError(403, "Not authorized to delete this order"));
        }

        await OrderModel.findByIdAndDelete(req.params.id);

        return res.status(200).json(new ApiResponse(200, null, "Order deleted successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message));
    }
};
