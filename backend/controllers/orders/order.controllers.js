import OrderModel from "../../models/orders/order.model.js";
import ProductModel from "../../models/products/product.model.js";
import SellerModel from "../../models/sellers/auth.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getIO } from "../../utils/socket.js";

// @desc    Create new order
// @route   POST /api/v1/indiafy/orders
// @access  Private (Customer)
export const createOrder = asyncHandler(async (req, res) => {
    const { 
        orderItems, shippingAddress, paymentMethod, itemsPrice, 
        taxPrice, shippingPrice, totalPrice, paymentResult,
        isWholesaleOrder, billingDetails, poNotes, deliverySlot, scheduledDispatchDate, warehouseDispatch
    } = req.body;

    const userRole = req.user.role?.toLowerCase();
    if (userRole !== "customer" && userRole !== "seller") {
        throw new ApiError(403, "Only customers or sellers can place orders");
    }

    if (!orderItems || orderItems.length === 0) {
        throw new ApiError(400, "No order items provided");
    }

    // Validate shipping address structure
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
        throw new ApiError(400, "Incomplete shipping address. Please provide address, city, state, and postal code.");
    }

    // Validation and Stock check, plus attaching node data
    const enrichedOrderItems = [];
    for (const item of orderItems) {
        const product = await ProductModel.findById(item.product);
        if (!product) {
            throw new ApiError(404, `Product not found: ${item.product}`);
        }
        
        const currentStock = parseInt(product.attribute?.quantity || "0");
        if (currentStock < item.quantity) {
            throw new ApiError(400, `Insufficient stock for ${product.productName}. Available: ${currentStock}`);
        }

        enrichedOrderItems.push({
            ...item,
            nodeId: product.nodeId,
            nodeType: product.nodeType
        });
    }

    const order = new OrderModel({
        customer: req.user._id,
        orderItems: enrichedOrderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: itemsPrice || 0,
        taxPrice: taxPrice || 0,
        shippingPrice: shippingPrice || 0,
        totalPrice: totalPrice || 0,
        paymentResult,
        isPaid: !!paymentResult,
        paidAt: paymentResult ? Date.now() : undefined,
        status: paymentResult ? "Processing" : "Pending",
        // Wholesale B2B fields
        isWholesaleOrder: isWholesaleOrder || false,
        billingDetails,
        poNotes,
        deliverySlot,
        scheduledDispatchDate,
        warehouseDispatch
    });

    const createdOrder = await order.save();

    // Only reduce stock and emit socket if it's COD or already paid
    if (paymentMethod === "COD" || !!paymentResult) {
        for (const item of orderItems) {
            const product = await ProductModel.findById(item.product);
            const newQty = parseInt(product.attribute.quantity) - item.quantity;
            product.attribute.quantity = newQty.toString();
            await product.save();
        }

        // Emit Socket.IO Event to Seller Nodes
        try {
            const io = getIO();
            enrichedOrderItems.forEach(item => {
                const sellerId = item.seller.toString();
                const nodeType = item.nodeType || "local";
                const roomName = `seller_${sellerId}_node_${nodeType}`;
                
                console.log(`[Socket] Emitting NEW_ORDER to room: ${roomName}`);
                io.to(roomName).emit("NEW_ORDER", {
                    orderId: createdOrder._id,
                    totalPrice: createdOrder.totalPrice,
                    status: createdOrder.status,
                    createdAt: createdOrder.createdAt
                });
            });
        } catch (err) {
            console.error("Socket emission failed:", err.message);
        }
    }

    return res.status(201).json(new ApiResponse(201, createdOrder, "Order placed successfully"));
});

// @desc    Get order by ID
// @route   GET /api/v1/indiafy/orders/:id
// @access  Private (Customer/Seller/Admin)
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id)
        .populate('customer', 'firstName lastName email')
        .populate('orderItems.product', 'productName productImage')
        .populate('orderItems.seller', 'businessName email firstName lastName');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    let isAuthorized = false;
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user._id?.toString();
    const customerId = order.customer?._id?.toString() || order.customer?.toString();

    if (userRole === "admin") {
        isAuthorized = true;
    } else if (userRole === "customer" && customerId === userId) {
        isAuthorized = true;
    } else if (userRole === "seller") {
        const isCustomer = customerId === userId;
        const sellerHasItems = order.orderItems.some(item => 
            item.seller?._id?.toString() === userId || item.seller?.toString() === userId
        );
        if (isCustomer || sellerHasItems) isAuthorized = true;
    }

    if (!isAuthorized) {
        throw new ApiError(403, "Not authorized to view this order");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

// @desc    Get logged in customer orders
// @route   GET /api/v1/indiafy/orders/myorders
// @access  Private (Customer)
export const getCustomerOrders = asyncHandler(async (req, res) => {
    const orders = await OrderModel.find({ customer: req.user._id })
        .populate('orderItems.product', 'productName productImage attribute')
        .populate('orderItems.seller', 'firstName lastName businessName')
        .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// @desc    Get seller's orders
// @route   GET /api/v1/indiafy/orders/sellerorders
// @access  Private (Seller)
export const getSellerOrders = asyncHandler(async (req, res) => {
    const { nodeType } = req.query;
    
    let query = { "orderItems.seller": req.user._id };
    
    if (nodeType) {
        query["orderItems.nodeType"] = nodeType;
    }

    const orders = await OrderModel.find(query)
        .populate('customer', 'firstName lastName email')
        .populate('orderItems.product', 'productName productImage nodeType nodeId')
        .sort({ createdAt: -1 });
        
    return res.status(200).json(new ApiResponse(200, orders, "Seller orders fetched successfully"));
});

// @desc    Update order status (Shipping, Delivered)
// @route   PUT /api/v1/indiafy/orders/:id/status
// @access  Private (Seller/Admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const userRole = req.user.role?.toLowerCase();
    if (userRole === "seller") {
        const sellerHasItems = order.orderItems.some(item => item.seller.toString() === req.user._id.toString());
        if (!sellerHasItems) {
            throw new ApiError(403, "Not authorized to update this order");
        }
    }

    order.status = status;
    
    if (status === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    return res.status(200).json(new ApiResponse(200, updatedOrder, "Order status updated successfully"));
});

// @desc    Upload packing video for an order
// @route   POST /api/v1/indiafy/orders/:id/upload-video
// @access  Private (Seller)
export const uploadPackingVideo = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No video file provided");
    }

    const order = await OrderModel.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const sellerHasItems = order.orderItems.some(item => item.seller.toString() === req.user._id.toString());
    if (!sellerHasItems) {
        throw new ApiError(403, "Not authorized to upload video for this order");
    }

    order.status = "Shipped";
    order.packingVideoUrl = req.file.path;

    await order.save();

    return res.status(200).json(new ApiResponse(200, { videoUrl: req.file.path }, "Packing video uploaded successfully"));
});

// @desc    Delete an order
// @route   DELETE /api/v1/indiafy/orders/:id
// @access  Private (Customer)
export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.customer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this order");
    }

    await OrderModel.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, null, "Order deleted successfully"));
});
