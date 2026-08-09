import mongoose from "mongoose";
import OrderModel from "../../models/orders/order.model.js";
import ProductModel from "../../models/products/product.model.js";
import SellerModel from "../../models/sellers/auth.model.js";
import SellerNode from "../../models/sellerNodes/sellerNode.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getIO } from "../../utils/socket.js";
import { sendOrderNotifications } from "../../utils/orderNotification.js";
import { emitOrderNotification } from "../../utils/emitOrderNotification.js";
import SellerOrder from "../../models/orders/sellerOrder.model.js";
import { createSellerOrderMappings } from "../../utils/createSellerOrderMappings.js";
import { uploadBuffer, uploadVideoBuffer } from "../../utils/cloudinary.js";

// @desc    Create new order
// @route   POST /api/v1/indiafy/orders
// @access  Private (Customer)
export const createOrder = asyncHandler(async (req, res, next) => {
    try {
        const { 
            orderItems, shippingAddress, paymentMethod, itemsPrice, 
            taxPrice, shippingPrice, totalPrice, paymentResult,
            isWholesaleOrder, billingDetails, poNotes, deliverySlot, scheduledDispatchDate, warehouseDispatch
        } = req.body;

        // Trace logging
        console.log(`[Checkout Trace] Request received at POST /api/orders`);
        console.log(`[Checkout Trace] User ID: ${req.user?._id}, Role: ${req.user?.role}`);
        console.log(`[Checkout Trace] Payment Method: ${paymentMethod}`);
        console.log(`[Checkout Trace] Payload:`, JSON.stringify(req.body));

        // STEP 4: Verify authentication
        if (!req.user) {
            console.error("[Checkout Error] Authentication missing: req.user is undefined");
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Please log in to complete the purchase.",
                errorCode: "UNAUTHORIZED"
            });
        }

        const userRole = req.user.role?.toLowerCase();
        if (userRole !== "customer" && userRole !== "seller") {
            console.error(`[Checkout Error] Role forbidden: ${userRole}`);
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only customers or sellers can place orders.",
                errorCode: "FORBIDDEN"
            });
        }

        // STEP 3: Validate request payload
        if (!orderItems || orderItems.length === 0) {
            console.error("[Checkout Error] Request payload contains no order items");
            return res.status(400).json({
                success: false,
                message: "Invalid payload: No order items provided.",
                errorCode: "EMPTY_ORDER_ITEMS"
            });
        }

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
            console.error("[Checkout Error] Request payload shipping address is incomplete", shippingAddress);
            return res.status(400).json({
                success: false,
                message: "Invalid payload: Incomplete shipping address. Please provide address, city, state, and postal code.",
                errorCode: "INCOMPLETE_ADDRESS"
            });
        }

        // STEP 6: Validate MongoDB collections / Cart exists
        const { default: CartModel } = await import("../../models/customers/cart.model.js");
        const customerCart = await CartModel.findOne({ customerId: req.user._id });
        
        console.log(`[Checkout Trace] Customer Cart ID: ${customerCart?._id || "None"}`);

        // Validation and Stock check, plus attaching node data
        const enrichedOrderItems = [];
        for (const item of orderItems) {
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
                console.error(`[Checkout Error] Invalid Product ObjectId: ${item.product}`);
                return res.status(400).json({
                    success: false,
                    message: `Invalid Product reference: ${item.product}`,
                    errorCode: "INVALID_PRODUCT_ID"
                });
            }

            const product = await ProductModel.findById(item.product);
            if (!product) {
                console.error(`[Checkout Error] Product not found in database: ${item.product}`);
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`,
                    errorCode: "PRODUCT_NOT_FOUND"
                });
            }

            if (!product.isActive || product.isDeleted) {
                console.error(`[Checkout Error] Product is not active/deleted: ${product.productName}`);
                return res.status(400).json({
                    success: false,
                    message: `Product is currently unavailable: ${product.productName}`,
                    errorCode: "PRODUCT_UNAVAILABLE"
                });
            }

            // Verify Seller Node active status
            const sellerNode = await SellerNode.findById(product.nodeId);
            if (!sellerNode || sellerNode.isDeactivated) {
                console.error(`[Checkout Error] Seller Node is missing or deactivated: ${product.nodeId}`);
                return res.status(400).json({
                    success: false,
                    message: "The retail store for this product is currently closed or deactivated.",
                    errorCode: "STORE_INACTIVE"
                });
            }

            // Verify Seller active status
            const seller = await SellerModel.findById(product.sellerId);
            if (!seller || (seller.status && seller.status.toLowerCase() === "blocked")) {
                console.error(`[Checkout Error] Seller is blocked: ${product.sellerId}`);
                return res.status(400).json({
                    success: false,
                    message: "The seller of this product is currently unavailable.",
                    errorCode: "SELLER_INACTIVE"
                });
            }

            // STEP 7: Validate stock
            const currentStock = product.stock !== undefined && product.stock !== null ? product.stock : parseInt(product.attribute?.quantity || "0");
            if (currentStock < item.quantity) {
                console.error(`[Checkout Error] Insufficient stock for ${product.productName}. Available: ${currentStock}, Ordered: ${item.quantity}`);
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.productName}. Available: ${currentStock}`,
                    errorCode: "OUT_OF_STOCK"
                });
            }

            enrichedOrderItems.push({
                product: product._id,
                seller: product.sellerId,
                quantity: item.quantity,
                price: item.price,
                nodeId: product.nodeId,
                nodeType: product.nodeType,
                isWholesale: product.isWholesale || false,
                gstAmount: item.gstAmount || 0
            });

            console.log(`[Seller Mapping Trace] Product ${product._id} -> seller ${product.sellerId}, node ${product.nodeId}, nodeType ${product.nodeType}`);
        }

        // Generate dynamic Order Number
        const orderNumber = `IND-${Date.now()}`;

        // STEP 9: Create order
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
            status: "Pending",
            isWholesaleOrder: isWholesaleOrder || false,
            billingDetails,
            poNotes,
            deliverySlot,
            scheduledDispatchDate,
            warehouseDispatch
        });

        // Attach custom orderNumber parameter bypass Mongoose schema strict check
        order.set("orderNumber", orderNumber, { strict: false });

        const createdOrder = await order.save();
        console.log(`[Checkout Trace] Saved Order ID: ${createdOrder._id}, Order Number: ${orderNumber}`);

        const customerSnapshot = { firstName: req.user?.firstName, lastName: req.user?.lastName };
        const sellerOrderMappings = await createSellerOrderMappings(createdOrder, enrichedOrderItems, customerSnapshot);
        console.log(`[Seller Mapping] Created ${sellerOrderMappings.length} seller order mapping(s) for order ${createdOrder._id}`);

        // Real-time socket notification (fire-and-forget, covers both COD and online payment)
        try {
            const io = getIO();
            emitOrderNotification(
                io,
                createdOrder,
                enrichedOrderItems,
                customerSnapshot
            );
        } catch (socketErr) {
            console.error("[emitOrderNotification] Failed to get IO instance:", socketErr.message);
        }

        // STEP 8: Validate payment. If COD, create order, deduct stock, clear cart
        if (paymentMethod === "COD") {
            // STEP 10: Inventory, clear customer cart, notifications, invoice
            for (const item of enrichedOrderItems) {
                const product = await ProductModel.findById(item.product);
                if (product) {
                    const newQty = Math.max(0, parseInt(product.attribute.quantity || "0") - item.quantity);
                    product.attribute.quantity = newQty.toString();
                    product.stock = newQty;
                    await product.save();
                    console.log(`[Inventory Update] Stock updated for product ${product.productName}. Remaining: ${newQty}`);
                }
            }

            // Clear database cart
            if (customerCart) {
                customerCart.items = [];
                customerCart.totalPrice = 0;
                await customerCart.save();
                console.log(`[Cart Clear Result] Cleared database cart for customer: ${req.user._id}`);
            }

            // Email notifications (fire-and-forget)
            sendOrderNotifications(createdOrder).catch(err => {
                console.error("[Notification] Failed to send order notifications:", err);
            });
        }

        // STEP 11: Return HTTP 201
        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: createdOrder._id,
            orderNumber: orderNumber
        });

    } catch (error) {
        // STEP 2 & 13 & 15: Wrap error with full debugging details
        console.error(">>> HTTP 500 ERROR caught in Order Controller:");
        console.error("Error Message:", error.message);
        console.error("Stack Trace:", error.stack);
        console.error("Request Body:", JSON.stringify(req.body, null, 2));
        console.error("User ID:", req.user?._id);
        console.error("Store/Seller ID:", req.body?.orderItems?.[0]?.seller);
        console.error("Cart ID:", req.body?.cartId);
        console.error("Payment Method:", req.body?.paymentMethod);
        console.error("Order Payload:", JSON.stringify(req.body));

        return res.status(500).json({
            success: false,
            message: error.message || "An internal error occurred during order creation.",
            errorCode: "INTERNAL_SERVER_ERROR"
        });
    }
});

// @desc    Get order by ID
// @route   GET /api/v1/indiafy/orders/:id
// @access  Private (Customer/Seller/Admin)
export const getOrderById = asyncHandler(async (req, res) => {
    let sellerOrder = null; // hoisted so auth check can use sellerOrder.sellerId

    let order = await OrderModel.findById(req.params.id)
        .populate('customer', 'firstName lastName email')
        .populate({
            path: 'orderItems.product',
            select: 'productName productImage nodeType nodeId shortDescription description',
            populate: {
                path: 'nodeId',
                model: 'SellerNode',
                select: 'storeName businessName nodeType logo address city state pincode phone supportPhone'
            }
        })
        .populate('orderItems.seller', 'businessName email firstName lastName')
        .populate({
            path: 'orderItems.nodeId',
            model: 'SellerNode',
            select: 'storeName businessName nodeType logo address city state pincode phone supportPhone'
        });

    if (!order) {
        sellerOrder = await SellerOrder.findById(req.params.id);
        if (sellerOrder) {
            order = await OrderModel.findById(sellerOrder.parentOrderId)
                .populate('customer', 'firstName lastName email')
                .populate({
                    path: 'orderItems.product',
                    select: 'productName productImage nodeType nodeId shortDescription description',
                    populate: {
                        path: 'nodeId',
                        model: 'SellerNode',
                        select: 'storeName businessName nodeType logo address city state pincode phone supportPhone'
                    }
                })
                .populate('orderItems.seller', 'businessName email firstName lastName')
                .populate({
                    path: 'orderItems.nodeId',
                    model: 'SellerNode',
                    select: 'storeName businessName nodeType logo address city state pincode phone supportPhone'
                });
        }
    }

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    let isAuthorized = false;
    const userRole = req.user.role?.toLowerCase();
    const userId = (req.user._id || req.user.sellerId || req.user.id || "").toString();
    const customerId = (order.customer?._id || order.customer || "").toString();

    if (userRole === "admin") {
        isAuthorized = true;
    } else if (userRole === "customer" && customerId === userId) {
        isAuthorized = true;
    } else if (userRole === "seller") {
        const isCustomer = customerId === userId;
        const sellerHasItems = order.orderItems.some(item => {
            const itemSellerId = (item.seller?._id || item.seller || "").toString();
            return itemSellerId === userId;
        });

        if (!sellerOrder && order._id) {
            sellerOrder = await SellerOrder.findOne({ parentOrderId: order._id, sellerId: userId });
        }

        const isSellerOrderOwner = sellerOrder && (sellerOrder.sellerId?._id || sellerOrder.sellerId || "").toString() === userId;
        if (isCustomer || sellerHasItems || isSellerOrderOwner) isAuthorized = true;
    }

    if (!isAuthorized) {
        throw new ApiError(403, "Not authorized to view this order");
    }

    let responseOrder = order.toObject();

    // If the user is only authorized because they are a seller of some items, filter out other sellers' items
    if (userRole === "seller" && customerId !== userId) {
        const sellerItems = responseOrder.orderItems.filter(item => {
            const itemSellerId = (item.seller?._id || item.seller || "").toString();
            return itemSellerId === userId;
        });
        // If no items match by seller field, fall back to sellerOrder items (all items belong to this seller's node)
        responseOrder.orderItems = sellerItems.length > 0 ? sellerItems : responseOrder.orderItems;
        const sellerTotal = responseOrder.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        responseOrder.totalPrice = sellerTotal;
    }

    return res.status(200).json(new ApiResponse(200, responseOrder, "Order fetched successfully"));
});


// @desc    Get logged in customer orders
// @route   GET /api/v1/indiafy/orders/myorders
// @access  Private (Customer)
export const getCustomerOrders = asyncHandler(async (req, res) => {
    const orders = await OrderModel.find({ customer: req.user._id })
        .populate({
            path: 'orderItems.product',
            select: 'productName productImage attribute nodeType nodeId shortDescription description',
            populate: {
                path: 'nodeId',
                model: 'SellerNode',
                select: 'storeName businessName nodeType logo address city state pincode phone supportPhone'
            }
        })
        .populate('orderItems.seller', 'firstName lastName businessName')
        .populate({
            path: 'orderItems.nodeId',
            model: 'SellerNode',
            select: 'storeName businessName nodeType logo address city state pincode phone supportPhone'
        })
        .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// @desc    Get seller's orders
// @route   GET /api/v1/indiafy/orders/sellerorders
// @access  Private (Seller)
export const getSellerOrders = asyncHandler(async (req, res) => {
    const {
        nodeType,
        nodeId,
        status,
        search,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 50
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const rawSellerId = req.user._id || req.user.sellerId || req.user.id;
    const sellerIdObj = mongoose.Types.ObjectId.isValid(rawSellerId) ? new mongoose.Types.ObjectId(rawSellerId) : rawSellerId;

    const mappingQuery = {
        sellerId: { $in: [sellerIdObj, String(rawSellerId)] }
    };

    if (nodeId && mongoose.Types.ObjectId.isValid(nodeId)) {
        mappingQuery.nodeId = { $in: [new mongoose.Types.ObjectId(nodeId), String(nodeId)] };
    } else if (nodeType) {
        const normalized = nodeType.toUpperCase().replace(/-/g, "_");
        if (normalized.includes("HOME")) {
            mappingQuery.nodeType = { $in: ["HOME_ESSENTIALS", "home-essentials", "home_essentials"] };
        } else if (normalized.includes("WHOLESALE")) {
            mappingQuery.nodeType = { $in: ["WHOLESALE_B2B", "wholesale"] };
        } else if (normalized.includes("QUICK")) {
            mappingQuery.nodeType = { $in: ["QUICK_COMMERCE", "quick-commerce"] };
        } else if (normalized.includes("LOCAL")) {
            mappingQuery.nodeType = { $in: ["LOCAL_RETAIL", "local-retail", "local"] };
        } else if (normalized.includes("ELECTRONIC")) {
            mappingQuery.nodeType = { $in: ["ELECTRONICS", "electronics"] };
        } else if (normalized.includes("PERSONAL")) {
            mappingQuery.nodeType = { $in: ["PERSONAL_CARE", "personal-care", "personal_care"] };
        } else {
            mappingQuery.nodeType = { $regex: new RegExp(`^${nodeType.replace(/_/g, "[-_]")}$`, "i") };
        }
    }

    if (status && status !== "all") {
        mappingQuery.orderStatus = status;
    }

    if (dateFrom || dateTo) {
        mappingQuery.createdAt = {};
        if (dateFrom) mappingQuery.createdAt.$gte = new Date(dateFrom);
        if (dateTo) mappingQuery.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
        const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        mappingQuery.$or = [
            { orderNumber: searchRegex },
            { customerName: searchRegex }
        ];
    }

    const sortField = ["createdAt", "updatedAt", "totalAmount", "orderStatus"].includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const [sellerOrders, total] = await Promise.all([
        SellerOrder.find(mappingQuery)
            .populate("customerId", "firstName lastName email")
            .populate("parentOrderId", "shippingAddress status isPaid paymentMethod createdAt updatedAt")
            .populate("items.product", "productName productImage shortDescription description nodeType nodeId")
            .sort({ [sortField]: sortDirection })
            .skip(skip)
            .limit(parsedLimit)
            .lean(),
        SellerOrder.countDocuments(mappingQuery)
    ]);

    let mappedOrders = sellerOrders.map((sellerOrder) => ({
        _id: sellerOrder._id,
        sellerOrderId: sellerOrder._id,
        parentOrderId: sellerOrder.parentOrderId?._id || sellerOrder.parentOrderId,
        orderNumber: sellerOrder.orderNumber,
        customer: sellerOrder.customerId,
        customerName: sellerOrder.customerName,
        shippingAddress: sellerOrder.parentOrderId?.shippingAddress,
        paymentMethod: sellerOrder.paymentMethod,
        isPaid: sellerOrder.paymentStatus === "Paid",
        status: sellerOrder.orderStatus,
        totalPrice: sellerOrder.totalAmount,
        orderItems: sellerOrder.items.map((item) => ({
            product: item.product,
            seller: sellerOrder.sellerId,
            quantity: item.quantity,
            price: item.price,
            gstAmount: item.gstAmount || 0,
            nodeId: sellerOrder.nodeId,
            nodeType: sellerOrder.nodeType
        })),
        itemCount: sellerOrder.itemCount,
        sellerId: sellerOrder.sellerId,
        storeId: sellerOrder.storeId,
        nodeId: sellerOrder.nodeId,
        nodeType: sellerOrder.nodeType,
        createdAt: sellerOrder.createdAt,
        updatedAt: sellerOrder.updatedAt
    }));

    if (mappedOrders.length === 0 && parsedPage === 1 && !search && !dateFrom && !dateTo) {
        const fallbackQuery = { "orderItems.seller": rawSellerId };

        if (nodeId) {
            fallbackQuery["orderItems.nodeId"] = nodeId;
        } else if (nodeType) {
            fallbackQuery["orderItems.nodeType"] = nodeType;
        }
        if (status && status !== "all") {
            fallbackQuery.status = status;
        }

        const legacyOrders = await OrderModel.find(fallbackQuery)
            .populate("customer", "firstName lastName email")
            .populate("orderItems.product", "productName productImage nodeType nodeId")
            .sort({ createdAt: sortDirection })
            .limit(parsedLimit)
            .lean();

        mappedOrders = legacyOrders.map((order) => {
            const sellerItems = order.orderItems.filter((item) => {
                const sellerMatches = (item.seller?._id || item.seller || "").toString() === rawSellerId.toString();
                const nodeMatches = nodeId ? item.nodeId?.toString() === nodeId.toString() : true;
                return sellerMatches && nodeMatches;
            });
            const sellerTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            return {
                ...order,
                parentOrderId: order._id,
                orderItems: sellerItems,
                totalPrice: sellerTotal,
                itemCount: sellerItems.reduce((acc, item) => acc + item.quantity, 0),
                sellerId: rawSellerId,
                nodeId: sellerItems[0]?.nodeId,
                storeId: sellerItems[0]?.nodeId,
                nodeType: sellerItems[0]?.nodeType
            };
        });
    }


    return res.status(200).json({
        statusCode: 200,
        data: mappedOrders,
        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            pages: Math.ceil(total / parsedLimit)
        },
        message: "Seller orders fetched successfully",
        success: true
    });
});

// @desc    Update order status (Shipping, Delivered)
// @route   PUT /api/v1/indiafy/orders/:id/status
// @access  Private (Seller/Admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Processing", "Accepted", "Packed", "Shipped", "Dispatched", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid order status");
    }

    let order = await OrderModel.findById(req.params.id);
    let sellerOrder = null;

    if (!order) {
        sellerOrder = await SellerOrder.findById(req.params.id);
        if (sellerOrder) {
            order = await OrderModel.findById(sellerOrder.parentOrderId);
        }
    }

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const userRole = req.user.role?.toLowerCase();
    const rawSellerId = (req.user._id || req.user.sellerId || req.user.id || "").toString();
    if (userRole === "seller") {
        const sellerHasItems = sellerOrder
            ? sellerOrder.sellerId.toString() === rawSellerId
            : order.orderItems.some(item => item.seller.toString() === rawSellerId);
        if (!sellerHasItems) {
            throw new ApiError(403, "Not authorized to update this order");
        }
    }

    const previousStatus = sellerOrder?.orderStatus || order.status;
    const isTransitioningToCancelled = status?.toLowerCase() === "cancelled" && previousStatus?.toLowerCase() !== "cancelled";
    if (isTransitioningToCancelled) {
        const stockWasDecremented = order.paymentMethod === "COD" || order.isPaid;
        if (stockWasDecremented) {
            const cancellableItems = sellerOrder
                ? order.orderItems.filter(item =>
                    item.seller.toString() === sellerOrder.sellerId.toString() &&
                    item.nodeId?.toString() === sellerOrder.nodeId.toString()
                )
                : order.orderItems;

            for (const item of cancellableItems) {
                const product = await ProductModel.findById(item.product);
                if (product) {
                    const currentStock = product.stock || 0;
                    const newStock = currentStock + item.quantity;
                    product.stock = newStock;
                    if (product.attribute) {
                        product.attribute.quantity = newStock.toString();
                    }
                    await product.save();
                    console.log(`[Inventory Restore] Order status updated to Cancelled. Restored ${item.quantity} units for product ${product.productName}. New Stock: ${newStock}`);
                }
            }
        }
    }

    if (sellerOrder) {
        sellerOrder.orderStatus = status;
        await sellerOrder.save();

        const siblingOrders = await SellerOrder.find({ parentOrderId: order._id }).select("orderStatus");
        const siblingStatuses = siblingOrders.map(item => item._id.toString() === sellerOrder._id.toString() ? status : item.orderStatus);
        const allSame = siblingStatuses.length > 0 && siblingStatuses.every(itemStatus => itemStatus === status);

        if (allSame) {
            order.status = status;
        } else if (["Accepted", "Packed", "Shipped", "Dispatched"].includes(status)) {
            order.status = "Processing";
        } else if (status === "Delivered" && siblingStatuses.every(itemStatus => itemStatus === "Delivered")) {
            order.status = "Delivered";
        } else if (status === "Cancelled" && siblingStatuses.every(itemStatus => itemStatus === "Cancelled")) {
            order.status = "Cancelled";
        }
    } else {
        order.status = status;
        await SellerOrder.updateMany(
            { parentOrderId: order._id, ...(userRole === "seller" ? { sellerId: rawSellerId } : {}) },
            { $set: { orderStatus: status } }
        );
    }
    
    if (order.status === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Emit live status update to anyone tracking this order
    try {
        const io = getIO();
        io.to(`order_${order._id}`).emit("ORDER_STATUS_UPDATED", {
            orderId: order._id,
            sellerOrderId: sellerOrder?._id,
            status: order.status,
            sellerStatus: sellerOrder?.orderStatus,
            isDelivered: order.isDelivered,
            deliveredAt: order.deliveredAt
        });
    } catch (socketErr) {
        console.error("Socket emit failure on order status update:", socketErr.message);
    }

    return res.status(200).json(new ApiResponse(200, sellerOrder || updatedOrder, "Order status updated successfully"));
});

// @desc    Upload packing video for an order
// @route   POST /api/v1/indiafy/orders/:id/upload-video
// @access  Private (Seller)
export const uploadPackingVideo = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No video file provided");
    }

    const rawSellerId = (req.user._id || req.user.sellerId || req.user.id || "").toString();

    let order = await OrderModel.findById(req.params.id);
    let sellerOrder = null;

    if (!order) {
        sellerOrder = await SellerOrder.findById(req.params.id);
        if (sellerOrder) {
            order = await OrderModel.findById(sellerOrder.parentOrderId);
        }
    }

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const sellerHasItems = sellerOrder
        ? (sellerOrder.sellerId?._id || sellerOrder.sellerId || "").toString() === rawSellerId
        : order.orderItems.some(item => (item.seller?._id || item.seller || "").toString() === rawSellerId);

    if (req.user.role?.toLowerCase() === "seller" && !sellerHasItems) {
        throw new ApiError(403, "Not authorized to upload video for this order");
    }

    let videoUrl = "";
    try {
        if (req.file.buffer) {
            // Use uploadVideoBuffer with explicit resource_type: "video" for proper Cloudinary handling
            const result = await uploadVideoBuffer(req.file.buffer, "indiafy_packing_videos");
            videoUrl = result.secure_url;
        } else if (req.file.path) {
            videoUrl = req.file.path;
        }
    } catch (uploadErr) {
        console.error("Packing video Cloudinary upload failed:", uploadErr.message);
        // Fallback: store as data URL (only if buffer is small enough)
        if (req.file.buffer && req.file.buffer.length < 5 * 1024 * 1024) {
            videoUrl = `data:${req.file.mimetype || 'video/webm'};base64,${req.file.buffer.toString('base64')}`;
        } else {
            throw new ApiError(500, "Video upload failed. Please try again with a shorter recording.");
        }
    }

    order.status = "Shipped";
    order.packingVideoUrl = videoUrl;
    await order.save();

    if (sellerOrder) {
        sellerOrder.orderStatus = "Shipped";
        await sellerOrder.save();
    }

    // Emit packing video uploaded event to live tracking room
    try {
        const io = getIO();
        io.to(`order_${order._id}`).emit("ORDER_STATUS_UPDATED", {
            orderId: order._id,
            status: "Shipped",
            packingVideoUrl: order.packingVideoUrl
        });
    } catch (socketErr) {
        console.error("Socket emit failure on packing video upload:", socketErr.message);
    }

    return res.status(200).json(new ApiResponse(200, { videoUrl }, "Packing video uploaded successfully"));
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

    // Restrict cancellation to Pending or Paid statuses only (not Processing, Shipped, or Delivered)
    const nonCancellableStates = ["processing", "shipped", "delivered"];
    if (nonCancellableStates.includes(order.status?.toLowerCase())) {
        throw new ApiError(400, `Cannot cancel order at this stage. Current status is: ${order.status}`);
    }

    // Restore stock if it was already decremented (COD or Paid)
    const stockWasDecremented = order.paymentMethod === "COD" || order.isPaid;
    if (stockWasDecremented) {
        for (const item of order.orderItems) {
            const product = await ProductModel.findById(item.product);
            if (product) {
                const currentStock = product.stock || 0;
                const newStock = currentStock + item.quantity;
                product.stock = newStock;
                if (product.attribute) {
                    product.attribute.quantity = newStock.toString();
                }
                await product.save();
                console.log(`[Inventory Restore] Order deleted/cancelled. Restored ${item.quantity} units for product ${product.productName}. New Stock: ${newStock}`);
            }
        }
    }

    await OrderModel.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, null, "Order deleted successfully"));
});
