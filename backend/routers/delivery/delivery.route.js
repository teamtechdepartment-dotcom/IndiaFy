import { Router } from "express";
import { getDeliveryDashboard } from "../../controllers/delivery/delivery.controller.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import { requireDeliveryPartner } from "../../middlewares/roleGuard.middleware.js";

const router = Router();

// Apply Delivery Partner protection globally to this router
router.use(requiredLogin);
router.use(requireDeliveryPartner);

router.route("/dashboard").get(getDeliveryDashboard);

export default router;
