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
        throw new ApiError(500, "Razorpay credentials are not defined in the server configuration.");
    }

    const instance = new Razorpay({
        key_id: key_id,
        key_secret: key_secret,
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
        throw new ApiError(500, "Razorpay API keys are not configured on the server.");
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", key_secret)
        .update(sign.toString())
        .digest("hex");

    // Simulator payments are only valid while the active Razorpay key is a test key.
    // This lets deployed test-mode builds behave like localhost without opening a bypass for live keys.
    const isKeyInTestMode = key_id.includes("test") || key_id.startsWith("rzp_test");
    const hasOverrideParameters = razorpay_signature === "test_manual_override" || razorpay_order_id === "manual";
    const isSimulatorPaymentId = typeof razorpay_payment_id === "string" && (
        razorpay_payment_id.startsWith("test_simulator_") ||
        razorpay_payment_id.startsWith("manual_")
    );
    
    const isTestSimulatorVerified = isKeyInTestMode && hasOverrideParameters && isSimulatorPaymentId;

    if (razorpay_signature !== expectedSign && !isTestSimulatorVerified) {
        throw new ApiError(400, "Invalid payment signature. Live transaction verification failed.");
    }

    // 1. Transaction initialization
    const session = await mongoose.startSession();
    let useTransaction = true;
    try {
        session.startTransaction();
    } catch (err) {
        useTransaction = false;
    }

    try {
        let order;
        if (useTransaction) {
            order = await OrderModel.findOne({ _id: orderId }).session(session);
        } else {
            // Atomic lock with 5-minute timeout for non-transactional environments
            order = await OrderModel.findOneAndUpdate(
                {
                    _id: orderId,
                    isPaid: false,
                    $or: [
                        { "paymentLock.isLocked": { $ne: true } },
                        { "paymentLock.lockedUntil": { $lt: new Date() } }
                    ]
                },
                {
                    $set: {
                        "paymentLock.isLocked": true,
                        "paymentLock.lockedUntil": new Date(Date.now() + 5 * 60000)
                    }
                },
                { new: true }
            );
        }

        if (!order) {
            if (useTransaction) await session.abortTransaction();
            session.endSession();
            return res.status(200).json(new ApiResponse(200, { verified: true }, "Payment already verified or processing"));
        }

        if (useTransaction && order.isPaid) {
            await session.abortTransaction();
            session.endSession();
            return res.status(200).json(new ApiResponse(200, { verified: true }, "Payment already verified"));
        }

        // Initialize idempotency array if missing (still keeping for backwards compat or extra safety)
        if (!order.deductedStockItems) order.deductedStockItems = [];

        // Deduct Stock idempotently
        const { default: ProductModel } = await import("../../models/products/product.model.js");
        for (const item of order.orderItems) {
            const prodIdStr = item.product.toString();
            // Transactional or atomic processedPaymentOrderIds guarantee
            const updatedProduct = await ProductModel.findOneAndUpdate(
                { 
                    _id: item.product,
                    // If not using transactions, atomically guarantee exactly-once per order ID
                    ...(useTransaction ? {} : { processedPaymentOrderIds: { $ne: orderId.toString() } })
                },
                { 
                    $inc: { stock: -item.quantity },
                    $push: { processedPaymentOrderIds: orderId.toString() }
                },
                { new: true, session: useTransaction ? session : null }
            );
            
            if (updatedProduct) {
                updatedProduct.attribute.quantity = Math.max(0, updatedProduct.stock).toString();
                await updatedProduct.save({ session: useTransaction ? session : null });
                if (!order.deductedStockItems.includes(prodIdStr)) {
                    order.deductedStockItems.push(prodIdStr);
                }
            }
        }

        // Finalize order state
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: razorpay_payment_id,
            status: "success",
            update_time: new Date().toISOString(),
        };
        order.paymentLock = { isLocked: false, lockedUntil: undefined };
        // We do NOT change order.status here. We leave it as "Pending" (or whatever it was).
        // The seller's LiveOrders will pick it up as "Pending".
        await order.save({ session: useTransaction ? session : null });

        await SellerOrder.updateMany(
            { parentOrderId: order._id },
            { $set: { paymentStatus: "Paid", orderStatus: "Processing" } },
            { session: useTransaction ? session : null }
        );

        const { default: CartModel } = await import("../../models/customers/cart.model.js");
        await CartModel.findOneAndUpdate(
            { customerId: order.customer },
            { $set: { items: [], totalPrice: 0 } },
            { session: useTransaction ? session : null }
        );

        if (useTransaction) {
            await session.commitTransaction();
        }
        session.endSession();

        // 2. Emit Socket.IO Event to Seller Nodes
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
            console.error("Socket emission failed in payment verify:", err.message);
        }

        // 3. Send email/SMS notifications
        const { sendOrderNotifications } = await import("../../utils/orderNotification.js");
        sendOrderNotifications(order).catch(err => {
            console.error("[Notification] Verification notifications failed:", err);
        });

    } catch (error) {
        if (useTransaction) {
            await session.abortTransaction();
        }
        session.endSession();
        throw error;
    }

    return res.status(200).json(new ApiResponse(200, { verified: true }, "Payment verified & Stock synced"));
});

// @desc    Get Razorpay Key ID
// @route   GET /api/v1/indiafy/payments/get-key
// @access  Private (Customer/Seller)
export const getRazorpayKey = asyncHandler(async (req, res) => {
    const key_id = process.env.Razorpay_Key_Id;
    if (!key_id) {
        throw new ApiError(500, "Razorpay Key ID is not configured on the server.");
    }
    return res.status(200).json(new ApiResponse(200, { key: key_id }, "Razorpay Key ID fetched successfully"));
});

// @desc    Razorpay Webhook for payment capture events
// @route   POST /api/v1/indiafy/payments/webhook
// @access  Public (Called by Razorpay)
export const razorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.Razorpay_Webhook_Secret;

    if (!webhookSecret) {
        throw new ApiError(500, "Razorpay Webhook Secret is not configured on the server.");
    }

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature !== digest) {
        return res.status(400).json(new ApiError(400, "Invalid webhook signature"));
    }

    const { event, payload } = req.body;

    if (event === "payment.captured" || event === "order.paid") {
        const paymentEntity = payload.payment.entity;
        const razorpay_payment_id = paymentEntity.id;
        const mongoOrderId = paymentEntity.notes?.mongoOrderId;

        if (mongoOrderId) {
            // 1. Transaction initialization
            const session = await mongoose.startSession();
            let useTransaction = true;
            try {
                session.startTransaction();
            } catch (err) {
                useTransaction = false;
            }

            try {
                let order;
                if (useTransaction) {
                    order = await OrderModel.findOne({ _id: mongoOrderId }).session(session);
                } else {
                    // Atomic lock with 5-minute timeout for non-transactional environments
                    order = await OrderModel.findOneAndUpdate(
                        {
                            _id: mongoOrderId,
                            isPaid: false,
                            $or: [
                                { "paymentLock.isLocked": { $ne: true } },
                                { "paymentLock.lockedUntil": { $lt: new Date() } }
                            ]
                        },
                        {
                            $set: {
                                "paymentLock.isLocked": true,
                                "paymentLock.lockedUntil": new Date(Date.now() + 5 * 60000)
                            }
                        },
                        { new: true }
                    );
                }

                if (!order || (useTransaction && order.isPaid)) {
                    if (useTransaction) await session.abortTransaction();
                    session.endSession();
                    return res.status(200).json(new ApiResponse(200, { received: true }, "Payment already processed or processing"));
                }

                // Initialize idempotency array if missing
                if (!order.deductedStockItems) order.deductedStockItems = [];

                // Deduct stock idempotently
                const { default: ProductModel } = await import("../../models/products/product.model.js");
                for (const item of order.orderItems) {
                    const prodIdStr = item.product.toString();
                    const updatedProduct = await ProductModel.findOneAndUpdate(
                        { 
                            _id: item.product,
                            // Exactly-once guarantee fallback for non-transactional
                            ...(useTransaction ? {} : { processedPaymentOrderIds: { $ne: mongoOrderId.toString() } })
                        },
                        { 
                            $inc: { stock: -item.quantity },
                            $push: { processedPaymentOrderIds: mongoOrderId.toString() }
                        },
                        { new: true, session: useTransaction ? session : null }
                    );
                    if (updatedProduct) {
                        updatedProduct.attribute.quantity = Math.max(0, updatedProduct.stock).toString();
                        await updatedProduct.save({ session: useTransaction ? session : null });
                        if (!order.deductedStockItems.includes(prodIdStr)) {
                            order.deductedStockItems.push(prodIdStr);
                        }
                    }
                }

                // Finalize order state
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: razorpay_payment_id,
                    status: "success",
                    update_time: new Date().toISOString(),
                };
                order.paymentLock = { isLocked: false, lockedUntil: undefined };
                await order.save({ session: useTransaction ? session : null });

                await SellerOrder.updateMany(
                    { parentOrderId: order._id },
                    { $set: { paymentStatus: "Paid", orderStatus: "Processing" } },
                    { session: useTransaction ? session : null }
                );

                // Clear customer cart
                const { default: CartModel } = await import("../../models/customers/cart.model.js");
                await CartModel.findOneAndUpdate(
                    { customerId: order.customer },
                    { $set: { items: [], totalPrice: 0 } },
                    { session: useTransaction ? session : null }
                );

                if (useTransaction) {
                    await session.commitTransaction();
                }
                session.endSession();

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

            } catch (error) {
                if (useTransaction) {
                    await session.abortTransaction();
                }
                session.endSession();
                throw error;
            }
        }
    }

    return res.status(200).json(new ApiResponse(200, { received: true }, "Webhook processed successfully"));
});
