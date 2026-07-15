import { Router } from "express";
import { createRazorpayOrder, verifyPayment, getRazorpayKey, razorpayWebhook } from "../../controllers/payments/payment.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import { requireCustomer } from "../../middlewares/roleGuard.middleware.js";

const router = Router();

// Public webhook route (called by Razorpay)
router.route("/webhook").post(razorpayWebhook);

// Only customers should be creating payments for orders
router.use(requiredLogin);
router.use(requireCustomer);

router.route("/get-key").get(getRazorpayKey);
router.route("/create-order").post(createRazorpayOrder);
router.route("/verify").post(verifyPayment);
router.route("/").post(createRazorpayOrder);

export default router;
