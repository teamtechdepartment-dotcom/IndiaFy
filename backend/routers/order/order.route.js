import { Router } from "express";
import { createOrder, getOrderById, getCustomerOrders, getSellerOrders, updateOrderStatus, uploadPackingVideo, deleteOrder } from "../../controllers/orders/order.controllers.js";
import { uploadPackingVideoMiddleware } from "../../middlewares/uploadVideo.middleware.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard from "../../middlewares/roleGuard.middleware.js";

const router = Router();

// All order routes are protected and require login
router.use(requiredLogin);

// Customer routes (Now accessible by Sellers too for testing/buying)
router.route("/").post(roleGuard(["Customer", "Seller"]), createOrder);
router.route("/myorders").get(roleGuard(["Customer", "Seller"]), getCustomerOrders);

// Seller routes
router.route("/sellerorders").get(roleGuard(["Seller"]), getSellerOrders);
router.route("/:id/status").put(roleGuard(["Seller", "Admin"]), updateOrderStatus);
router.route("/:id/upload-video").post(roleGuard(["Seller"]), uploadPackingVideoMiddleware, uploadPackingVideo);

// Shared route (Security is handled inside the controller)
router.route("/:id")
    .get(getOrderById)
    .delete(deleteOrder);

export default router;
