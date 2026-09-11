import { Router } from "express";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard from "../../middlewares/roleGuard.middleware.js";
import permissionGuard from "../../middlewares/permissionGuard.middleware.js";
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  toggleCampaignStatus,
  addProductsToCampaign,
  removeProductFromCampaign,
  getEligibleProducts,
} from "../../controllers/admins/campaign.controllers.js";

const router = Router();

// Protect all admin campaign endpoints
router.use(requiredLogin);
router.use(roleGuard(["Admin"]));

// Eligible products for selector
router.get("/products/eligible", permissionGuard("campaigns:read"), getEligibleProducts);

// Campaigns CRUD
router.get("/", permissionGuard("campaigns:read"), getCampaigns);
router.post("/", permissionGuard("campaigns:write"), createCampaign);

router.get("/:id", permissionGuard("campaigns:read"), getCampaignById);
router.put("/:id", permissionGuard("campaigns:write"), updateCampaign);
router.delete("/:id", permissionGuard("campaigns:write"), deleteCampaign);

// Campaign status & product management
router.patch("/:id/status", permissionGuard("campaigns:write"), toggleCampaignStatus);
router.post("/:id/activate", permissionGuard("campaigns:write"), (req, res, next) => {
  req.body.status = "active";
  return toggleCampaignStatus(req, res, next);
});
router.post("/:id/disable", permissionGuard("campaigns:write"), (req, res, next) => {
  req.body.status = "disabled";
  return toggleCampaignStatus(req, res, next);
});
router.post("/:id/products", permissionGuard("campaigns:write"), addProductsToCampaign);
router.delete("/:id/products/:productId", permissionGuard("campaigns:write"), removeProductFromCampaign);

export default router;
