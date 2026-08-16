import { Router } from "express";
import { trackInteractions, getProfile } from "../../controllers/customers/interaction.controllers.js";
import optionalLogin from "../../middlewares/optionalLogin.middleware.js";

const router = Router();

// Track interactions (accepts batch requests)
router.post("/batch", optionalLogin, trackInteractions);

// Get interest profile (for testing/verification)
router.get("/profile", optionalLogin, getProfile);

export default router;
