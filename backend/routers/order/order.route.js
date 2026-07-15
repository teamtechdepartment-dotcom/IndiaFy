import { Router } from "express";
import { createOrder, getOrderById, getCustomerOrders, getSellerOrders, updateOrderStatus, uploadPackingVideo, deleteOrder } from "../../controllers/orders/order.controllers.js";
import { uploadPackingVideoMiddleware } from "../../middlewares/uploadVideo.middleware.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard, { requireCustomer, requireSeller } from "../../middlewares/roleGuard.middleware.js";
import { dashboardGuard } from "../../middlewares/dashboardGuard.middleware.js";

const router = Router();

// All order routes are protected and require login
router.use(requiredLogin);

// Customer routes (Accessible ONLY to Customer)
router.route("/").post(requireCustomer, createOrder);
router.route("/myorders").get(requireCustomer, getCustomerOrders);

// Seller routes (Accessible ONLY to Seller)
router.route("/sellerorders").get(requireSeller, dashboardGuard, getSellerOrders);
router.route("/:id/status").put(roleGuard(["Seller", "Admin"]), updateOrderStatus);
router.route("/:id/upload-video").post(requireSeller, uploadPackingVideoMiddleware, uploadPackingVideo);

// Shared route (Security is handled inside the controller, verified roles)
router.route("/:id")
    .get(roleGuard(["Customer", "Seller", "Admin"]), getOrderById)
    .delete(roleGuard(["Customer", "Seller", "Admin"]), deleteOrder);

export default router;
