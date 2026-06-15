import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { verifyPayment } from "./controllers/payments/payment.controllers.js";

async function testVerify() {
    try {
        await mongoose.connect(process.env.MongoDb_Url);
        console.log("Connected to MongoDB successfully!");

        // Simulate Express request and response
        const req = {
            body: {
                razorpay_order_id: "manual",
                razorpay_payment_id: "test_simulator_manual_" + Date.now(),
                razorpay_signature: "test_manual_override",
                orderId: "6a2ff6fbcddd9fe34e528170" // the pending order ID
            },
            user: {
                _id: "6a2557f7cf857699dbbcb09d",
                role: "Customer"
            }
        };

        const res = {
            status: function(code) {
                console.log("Response Status Code:", code);
                return this;
            },
            json: function(data) {
                console.log("Response JSON:", JSON.stringify(data, null, 2));
                return this;
            }
        };

        console.log("Invoking verifyPayment...");
        // In the controller, verifyPayment is wrapped in asyncHandler.
        // Let's call the controller function.
        // Express asyncHandler returns a function (req, res, next)
        await verifyPayment(req, res, (err) => {
            if (err) {
                console.error("Next received error:", err);
            } else {
                console.log("Next called with no error");
            }
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testVerify();
