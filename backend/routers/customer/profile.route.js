import { Router } from "express";
import { getProfile, updateProfile, addAddress, deleteAddress } from "../../controllers/customers/profile.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard from "../../middlewares/roleGuard.middleware.js";

const router = Router();

// Secure all profile routes
router.use(requiredLogin);
router.use(roleGuard(["Customer", "Seller"]));

router.route("/")
    .get(getProfile)
    .put(updateProfile);

router.route("/addresses")
    .post(addAddress);

router.route("/addresses/:id")
    .delete(deleteAddress);

export default router;
