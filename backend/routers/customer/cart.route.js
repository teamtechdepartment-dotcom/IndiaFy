import { Router } from "express";
import { addToCart, getCart, removeFromCart, clearCart } from "../../controllers/customers/cart.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import { requireCustomer } from "../../middlewares/roleGuard.middleware.js";

const router = Router();

// Protect all cart routes
router.use(requiredLogin);
router.use(requireCustomer);

router.route("/").get(getCart);
router.route("/add").post(addToCart);
router.route("/remove/:productId").delete(removeFromCart);
router.route("/clear").delete(clearCart);

export default router;
