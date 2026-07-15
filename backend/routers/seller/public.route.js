import express from "express";
import { getPublicStores } from "../../controllers/sellers/node.controllers.js";

const router = express.Router();

/* =========================================================
   GET ALL PUBLIC STORES (No auth required)
   GET /public/stores
   Used by homepage marketplace and store discovery pages
========================================================= */
router.get("/stores", getPublicStores);

export default router;
