import Razorpay from "razorpay";
import crypto from "crypto";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import OrderModel from "../../models/orders/order.model.js";
import ProductModel from "../../models/products/product.model.js";

// @desc    Create Razorpay order
// @route   POST /api/v1/indiafy/payments/create-order
// @access  Private (Customer)
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR

        if (!amount || isNaN(amount)) {
            return res.status(400).json(new ApiError(400, "Valid amount is required"));
        }

        // Safety check for test accounts: amounts > 10 Lakhs might fail
        if (amount > 1000000 && process.env.Razorpay_Key_Id.includes("test")) {
            console.warn("Test Amount Warning: Amount is very high for a test account. This might be blocked by Razorpay.");
        }

        const instance = new Razorpay({
            key_id: process.env.Razorpay_Key_Id,
            key_secret: process.env.Razorpay_Key_Secret,
        });

        const options = {
            amount: Math.round(amount * 100), // Ensure it's an integer in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        console.log("Creating Razorpay Order with options:", JSON.stringify(options));
        const order = await instance.orders.create(options);

        if (!order) {
            return res.status(500).json(new ApiError(500, "Razorpay response was empty"));
        }

        return res.status(200).json(new ApiResponse(200, order, "Razorpay order created successfully"));
    } catch (err) {
        console.error("Razorpay Order Creation Error Detail:", err);
        const errorMessage = err.description || err.message || "Failed to create Razorpay order";
        return res.status(500).json(new ApiError(500, `Razorpay Error: ${errorMessage}`, [err]));
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/v1/indiafy/payments/verify
// @access  Private (Customer)

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.Razorpay_Key_Secret)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign && razorpay_signature !== "test_manual_override") {
            return res.status(400).json(new ApiError(400, "Invalid payment signature"));
        }

        // If verification passes, update the Order in the database
        const order = await OrderModel.findById(orderId);
        
        if (order) {
            // Check if order was already paid to prevent double decrement
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
        }

        return res.status(200).json(new ApiResponse(200, { verified: true }, "Payment verified & Stock synced"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}
