import express from "express";
import { 
    getWholesaleProducts, 
    getWholesaleDistributors, 
    getWholesaleProductById 
} from "../../controllers/wholesale/wholesale.controller.js";

const router = express.Router();

// Wholesale Catalog Routes
router.get("/products", getWholesaleProducts);
router.get("/products/:id", getWholesaleProductById);

// Wholesale Distributor Routes
router.get("/distributors", getWholesaleDistributors);

export default router;
