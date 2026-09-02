import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import SellerModel from "../models/sellers/auth.model.js";
import SellerNode from "../models/sellerNodes/sellerNode.model.js";
import ProductModel from "../models/products/product.model.js";

describe("Indiafy Database-Driven Marketplace Tests", () => {
    let seller, activeNode, inactiveNode, productFromActiveStore, productFromInactiveStore;
    const securityKey = process.env.SecurityKey || "kishan@3322";

    beforeAll(async () => {
        const { databaseConfig } = await import("../config/db.config.js");
        await databaseConfig();

        // 1. Create a dummy seller
        const sellEmail = `marketplace_sell_${Date.now()}@example.com`;
        seller = await SellerModel.create({
            firstName: "Marketplace",
            lastName: "Seller",
            email: sellEmail,
            password: "password123",
            role: "Seller",
            status: "active"
        });

        // 2. Create active node
        activeNode = await SellerNode.create({
            seller: seller._id,
            storeName: "Active Store",
            slug: `active-store-${Date.now()}`,
            nodeType: "LOCAL_RETAIL",
            status: "ACTIVE",
            isActive: true,
            isLive: true,
            address: "Sector 45",
            city: "Gurugram",
            state: "Haryana",
            pincode: 122001,
            location: { type: "Point", coordinates: [77.0266, 28.4595] }
        });

        // 3. Create inactive node
        inactiveNode = await SellerNode.create({
            seller: seller._id,
            storeName: "Inactive Store",
            slug: `inactive-store-${Date.now()}`,
            nodeType: "LOCAL_RETAIL",
            status: "PENDING_REVIEW",
            isActive: false,
            isLive: false,
            address: "Sector 45",
            city: "Gurugram",
            state: "Haryana",
            pincode: 122001,
            location: { type: "Point", coordinates: [77.0266, 28.4595] }
        });

        // 4. Create active products with all required schema fields
        productFromActiveStore = await ProductModel.create({
            productName: "Product Active Store",
            productSkuId: `SKU-ACTIVE-${Date.now()}`,
            shortDescription: "Active short desc",
            description: "Active full description of the test product",
            categoryName: "Grocery",
            sellerId: seller._id,
            nodeId: activeNode._id,
            nodeType: "LOCAL_RETAIL",
            price: 100,
            attribute: { salePrice: 100, mrpPrice: 120, quantity: "50", weight: "500g" },
            stock: 50,
            isActive: true,
            isPublished: true,
            status: "ACTIVE"
        });

        productFromInactiveStore = await ProductModel.create({
            productName: "Product Inactive Store",
            productSkuId: `SKU-INACTIVE-${Date.now()}`,
            shortDescription: "Inactive short desc",
            description: "Inactive full description of the test product",
            categoryName: "Grocery",
            sellerId: seller._id,
            nodeId: inactiveNode._id,
            nodeType: "LOCAL_RETAIL",
            price: 150,
            attribute: { salePrice: 150, mrpPrice: 170, quantity: "50", weight: "500g" },
            stock: 50,
            isActive: true,
            isPublished: true,
            status: "ACTIVE"
        });
    }, 30000);

    afterAll(async () => {
        if (seller) await SellerModel.findByIdAndDelete(seller._id);
        if (activeNode) await SellerNode.findByIdAndDelete(activeNode._id);
        if (inactiveNode) await SellerNode.findByIdAndDelete(inactiveNode._id);
        if (productFromActiveStore) await ProductModel.findByIdAndDelete(productFromActiveStore._id);
        if (productFromInactiveStore) await ProductModel.findByIdAndDelete(productFromInactiveStore._id);
        await mongoose.connection.close();
    });

    test("GET /products returns active store products but NOT inactive store products", async () => {
        const res = await request(app)
            .get("/api/v1/indiafy/products")
            .expect(200);

        const products = res.body?.data || res.body;
        const activeIds = products.map(p => (p._id || p.id).toString());

        expect(activeIds).toContain(productFromActiveStore._id.toString());
        expect(activeIds).not.toContain(productFromInactiveStore._id.toString());
    });

    test("GET /products/search returns active store products in search results", async () => {
        const res = await request(app)
            .get("/api/v1/indiafy/products/search?q=Product")
            .expect(200);

        const products = res.body?.data || res.body;
        const activeIds = products.map(p => (p._id || p.id).toString());

        expect(activeIds).toContain(productFromActiveStore._id.toString());
        expect(activeIds).not.toContain(productFromInactiveStore._id.toString());
    });

    test("Deactivating seller status dynamically hides products in the marketplace", async () => {
        // Suspend/Deactivate seller status
        await SellerModel.findByIdAndUpdate(seller._id, { status: "suspended" });

        const res = await request(app)
            .get("/api/v1/indiafy/products")
            .expect(200);

        const products = res.body?.data || res.body;
        const activeIds = products.map(p => (p._id || p.id).toString());

        expect(activeIds).not.toContain(productFromActiveStore._id.toString());

        // Restore seller status
        await SellerModel.findByIdAndUpdate(seller._id, { status: "active" });
    });
});
