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

const router = express.Router();

/* =========================================================
   CREATE NODE
   POST /seller/nodes/create
========================================================= */
router.post("/create", requiredLogin, createSellerNode);

/* =========================================================
   GET ALL SELLER NODES
   GET /seller/nodes
========================================================= */
router.get("/", requiredLogin, getSellerNodes);

/* =========================================================
   GET NODE ANALYTICS
   GET /seller/nodes/:nodeId/analytics
   (must be before /:nodeId to avoid conflict)
========================================================= */
router.get("/:nodeId/analytics", requiredLogin, getNodeAnalytics);

/* =========================================================
   GET SINGLE NODE
   GET /seller/nodes/:nodeId
========================================================= */
router.get("/:nodeId", requiredLogin, getSellerNodeById);

/* =========================================================
   UPDATE NODE
   PUT /seller/nodes/:nodeId
========================================================= */
router.put("/:nodeId", requiredLogin, updateSellerNode);

/* =========================================================
   DELETE NODE
   DELETE /seller/nodes/:nodeId
========================================================= */
router.delete("/:nodeId", requiredLogin, deleteSellerNode);

export default router;