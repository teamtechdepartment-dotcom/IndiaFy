import { Router } from "express";
import { createRazorpayOrder, verifyPayment } from "../../controllers/payments/payment.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard from "../../middlewares/roleGuard.middleware.js";

const router = Router();

// Only customers should be creating payments for orders
router.use(requiredLogin);
router.use(roleGuard(["Customer", "Seller"]));

router.route("/create-order").post(createRazorpayOrder);
router.route("/verify").post(verifyPayment);

export default router;
