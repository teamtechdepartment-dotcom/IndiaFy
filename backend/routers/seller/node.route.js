import express from "express";

import {
  createSellerNode,
  getSellerNodeById,
  getSellerNodes,
  updateSellerNode,
  deleteSellerNode,
  getNodeAnalytics,
} from "../../controllers/sellers/node.controllers.js";

import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import { requireSeller } from "../../middlewares/roleGuard.middleware.js";
import { dashboardGuard } from "../../middlewares/dashboardGuard.middleware.js";

const router = express.Router();

// Apply seller authorization to all node management routes
router.use(requiredLogin);
router.use(requireSeller);

/* =========================================================
   CREATE NODE
   POST /seller/nodes/create
========================================================= */
router.post("/create", createSellerNode);

/* =========================================================
   GET ALL SELLER NODES
   GET /seller/nodes
========================================================= */
router.get("/", getSellerNodes);

/* =========================================================
   GET NODE ANALYTICS
   GET /seller/nodes/:nodeId/analytics
   (must be before /:nodeId to avoid conflict)
========================================================= */
router.get("/:nodeId/analytics", dashboardGuard, getNodeAnalytics);

/* =========================================================
   GET SINGLE NODE
   GET /seller/nodes/:nodeId
========================================================= */
router.get("/:nodeId", getSellerNodeById);

/* =========================================================
   UPDATE NODE
   PUT /seller/nodes/:nodeId
========================================================= */
router.put("/:nodeId", dashboardGuard, updateSellerNode);

/* =========================================================
   DELETE NODE
   DELETE /seller/nodes/:nodeId
========================================================= */
router.delete("/:nodeId", dashboardGuard, deleteSellerNode);

export default router;