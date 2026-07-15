import { Router } from "express";
import { getProfile, updateProfile, addAddress, deleteAddress, deleteAccount } from "../../controllers/customers/profile.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard, { requireCustomer } from "../../middlewares/roleGuard.middleware.js";

const router = Router();

// Secure all profile routes
router.use(requiredLogin);

router.route("/")
    .get(roleGuard(["Customer", "Seller"]), getProfile)
    .put(roleGuard(["Customer", "Seller"]), updateProfile)
    .delete(roleGuard(["Customer", "Seller"]), deleteAccount);

router.route("/addresses")
    .post(requireCustomer, addAddress);

router.route("/addresses/:id")
    .delete(requireCustomer, deleteAddress);

export default router;
