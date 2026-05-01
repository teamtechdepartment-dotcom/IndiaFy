import { Router } from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, getAvailableCategories } from "../../controllers/products/product.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard from "../../middlewares/roleGuard.middleware.js";
import { uploadProductImages } from "../../middlewares/upload.middleware.js";

const router = Router();

// Public routes (Customers can browse products without logging in, but typically they would)
router.route("/").get(getAllProducts);
router.route("/categories").get(getAvailableCategories);
router.route("/:id").get(getProductById);

// Protected routes (Only Sellers and Admins)
// We chain requiredLogin to ensure they have a valid token, then roleGuard to ensure they are a Seller or Admin
router.route("/")
    .post(requiredLogin, roleGuard(["Seller", "Admin"]), uploadProductImages, createProduct);

router.route("/:id")
    .put(requiredLogin, roleGuard(["Seller", "Admin"]), updateProduct)
    .delete(requiredLogin, roleGuard(["Seller", "Admin"]), deleteProduct);

export default router;
