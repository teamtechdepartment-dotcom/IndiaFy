import Razorpay from "razorpay";
import crypto from "crypto";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import OrderModel from "../../models/orders/order.model.js";
import SellerOrder from "../../models/orders/sellerOrder.model.js";
import ProductModel from "../../models/products/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// @desc    Create Razorpay order
// @route   POST /api/v1/indiafy/payments/create-order
// @access  Private (Customer)
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { amount, orderId } = req.body; // Amount in INR, optional orderId

    if (!amount || isNaN(amount)) {
        throw new ApiError(400, "Valid amount is required");
    }

    // Safety check for test accounts: amounts > 10 Lakhs might fail
    const key_id = process.env.Razorpay_Key_Id;
    const key_secret = process.env.Razorpay_Key_Secret;

    if (!key_id || !key_secret) {
        if (process.env.NODE_ENV === "production") {
            throw new ApiError(500, "Razorpay credentials are not defined in production.");
        }
    }

    const activeKeyId = key_id || "rzp_test_Sm5HFLdh2qH4N1";
    const activeSecret = key_secret || "CIXwT8ZWQYU6j19hIqzmgeX1";

    if (amount > 1000000 && activeKeyId.includes("test")) {
        console.warn("Test Amount Warning: Amount is very high for a test account. This might be blocked by Razorpay.");
    }

    const instance = new Razorpay({
        key_id: activeKeyId,
        key_secret: activeSecret,
    });

    const options = {
        amount: Math.round(amount * 100), // Ensure it's an integer in paise
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
        notes: orderId ? { mongoOrderId: orderId } : {}
    };

    console.log("Creating Razorpay Order with options:", JSON.stringify(options));
    
    let order;
    try {
        order = await instance.orders.create(options);
    } catch (err) {
        const errorMessage = err.description || err.message || "Failed to create Razorpay order";
        throw new ApiError(500, `Razorpay Error: ${errorMessage}`, [err]);
    }

    if (!order) {
        throw new ApiError(500, "Razorpay response was empty");
    }

    return res.status(200).json(new ApiResponse(200, order, "Razorpay order created successfully"));
});

// @desc    Verify Razorpay payment
// @route   POST /api/v1/indiafy/payments/verify
// @access  Private (Customer)
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const key_secret = process.env.Razorpay_Key_Secret;
    const key_id = process.env.Razorpay_Key_Id;

    if (!key_secret || !key_id) {
        if (process.env.NODE_ENV === "production") {
            throw new ApiError(500, "Razorpay API keys are not configured on the production server.");
        }
    }

    const activeSecret = key_secret || "CIXwT8ZWQYU6j19hIqzmgeX1";
    const activeKeyId = key_id || "rzp_test_Sm5HFLdh2qH4N1";

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", activeSecret)
        .update(sign.toString())
        .digest("hex");

    // Simulator payments are only valid while the active Razorpay key is a test key.
    // This lets deployed test-mode builds behave like localhost without opening a bypass for live keys.
    const isKeyInTestMode = activeKeyId.includes("test") || activeKeyId.startsWith("rzp_test");
    const hasOverrideParameters = razorpay_signature === "test_manual_override" || razorpay_order_id === "manual";
    const isSimulatorPaymentId = typeof razorpay_payment_id === "string" && (
        razorpay_payment_id.startsWith("test_simulator_") ||
        razorpay_payment_id.startsWith("manual_")
    );
    
    const isTestSimulatorVerified = isKeyInTestMode && hasOverrideParameters && isSimulatorPaymentId;

    if (razorpay_signature !== expectedSign && !isTestSimulatorVerified) {
        throw new ApiError(400, "Invalid payment signature. Live transaction verification failed.");
    }

    // If verification passes, update the Order in the database
    const order = await OrderModel.findById(orderId);
    
    if (order) {
        // Check if order was already paid to prevent double decrement (Idempotency Lock)
        if (order.isPaid) {
            return res.status(200).json(new ApiResponse(200, { verified: true }, "Payment already verified"));
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: razorpay_payment_id,
            status: "success",
            update_time: new Date().toISOString(),
        };
        
        // Advance order status from Pending to Processing
        order.status = "Processing";

        await order.save();
        await SellerOrder.updateMany(
            { parentOrderId: order._id },
            { $set: { paymentStatus: "Paid", orderStatus: "Processing" } }
        );

        // 1. Deduct Stock atomically to prevent overselling race conditions
        for (const item of order.orderItems) {
            const updatedProduct = await ProductModel.findOneAndUpdate(
                { _id: item.product },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );
            if (updatedProduct) {
                updatedProduct.attribute.quantity = Math.max(0, updatedProduct.stock).toString();
                await updatedProduct.save();
            }
        }

        // Clear customer cart
        const { default: CartModel } = await import("../../models/customers/cart.model.js");
        await CartModel.findOneAndUpdate(
            { customerId: order.customer },
            { $set: { items: [], totalPrice: 0 } }
        );

        // 2. Emit Socket.IO Event to Seller Nodes
        try {
            const io = await import("../../utils/socket.js").then(m => m.getIO());
            order.orderItems.forEach(item => {
                const sellerId = item.seller.toString();
                const nodeType = item.nodeType || "local";
                const roomName = `seller_${sellerId}_node_${nodeType}`;
                
                console.log(`[Socket] Emitting NEW_ORDER to room: ${roomName}`);
                io.to(roomName).emit("NEW_ORDER", {
                    orderId: order._id,
                    totalPrice: order.totalPrice,
                    status: order.status,
                    createdAt: order.createdAt
                });
            });
        } catch (err) {
            console.error("Socket emission failed in payment verify:", err.message);
        }

        // 3. Send email/SMS notifications
        const { sendOrderNotifications } = await import("../../utils/orderNotification.js");
        sendOrderNotifications(order).catch(err => {
            console.error("[Notification] Verification notifications failed:", err);
        });
    }

    return res.status(200).json(new ApiResponse(200, { verified: true }, "Payment verified & Stock synced"));
});

// @desc    Get Razorpay Key ID
// @route   GET /api/v1/indiafy/payments/get-key
// @access  Private (Customer/Seller)
export const getRazorpayKey = asyncHandler(async (req, res) => {
    const key_id = process.env.Razorpay_Key_Id;
    if (!key_id) {
        if (process.env.NODE_ENV === "production") {
            throw new ApiError(500, "Razorpay Key ID is not configured on production.");
        }
    }
    const activeKeyId = key_id || "rzp_test_Sm5HFLdh2qH4N1";
    return res.status(200).json(new ApiResponse(200, { key: activeKeyId }, "Razorpay Key ID fetched successfully"));
});

// @desc    Razorpay Webhook for payment capture events
// @route   POST /api/v1/indiafy/payments/webhook
// @access  Public (Called by Razorpay)
export const razorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.Razorpay_Webhook_Secret || "test_secret";

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature !== digest && process.env.NODE_ENV === "production") {
        return res.status(400).json(new ApiError(400, "Invalid webhook signature"));
    }

    const { event, payload } = req.body;

    if (event === "payment.captured" || event === "order.paid") {
        const paymentEntity = payload.payment.entity;
        const razorpay_payment_id = paymentEntity.id;
        const mongoOrderId = paymentEntity.notes?.mongoOrderId;

        if (mongoOrderId) {
            const order = await OrderModel.findById(mongoOrderId);
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: razorpay_payment_id,
                    status: "success",
                    update_time: new Date().toISOString(),
                };
                order.status = "Processing";
                await order.save();
                await SellerOrder.updateMany(
                    { parentOrderId: order._id },
                    { $set: { paymentStatus: "Paid", orderStatus: "Processing" } }
                );

                // Deduct stock atomically to prevent overselling
                for (const item of order.orderItems) {
                    const updatedProduct = await ProductModel.findOneAndUpdate(
                        { _id: item.product },
                        { $inc: { stock: -item.quantity } },
                        { new: true }
                    );
                    if (updatedProduct) {
                        updatedProduct.attribute.quantity = Math.max(0, updatedProduct.stock).toString();
                        await updatedProduct.save();
                    }
                }

                // Clear customer cart
                const { default: CartModel } = await import("../../models/customers/cart.model.js");
                await CartModel.findOneAndUpdate(
                    { customerId: order.customer },
                    { $set: { items: [], totalPrice: 0 } }
                );

                // Send email/SMS notifications
                const { sendOrderNotifications } = await import("../../utils/orderNotification.js");
                sendOrderNotifications(order).catch(err => {
                    console.error("[Notification] Webhook notifications failed:", err);
                });

                // Emit Socket.IO Event
                try {
                    const io = await import("../../utils/socket.js").then(m => m.getIO());
                    order.orderItems.forEach(item => {
                        const sellerId = item.seller.toString();
                        const nodeType = item.nodeType || "local";
                        const roomName = `seller_${sellerId}_node_${nodeType}`;
                        io.to(roomName).emit("NEW_ORDER", {
                            orderId: order._id,
                            totalPrice: order.totalPrice,
                            status: order.status,
                            createdAt: order.createdAt
                        });
                    });
                } catch (err) {
                    console.error("Socket emission failed in payment webhook:", err.message);
                }
            }
        }
    }

    return res.status(200).json(new ApiResponse(200, { received: true }, "Webhook processed successfully"));
});
