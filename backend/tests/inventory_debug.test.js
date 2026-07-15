import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import CustomerModel from "../models/customers/auth.model.js";
import SellerModel from "../models/sellers/auth.model.js";
import SellerNode from "../models/sellerNodes/sellerNode.model.js";
import ProductModel from "../models/products/product.model.js";
import OrderModel from "../models/orders/order.model.js";
import CartModel from "../models/customers/cart.model.js";

describe("Indiafy Inventory Management & Stock Badges Integration Tests", () => {
    let customer, seller, node, product, token, sellerToken;
    const securityKey = process.env.SecurityKey || "indiafy_default_development_secret_key_987654321";

    beforeAll(async () => {
        const { databaseConfig } = await import("../config/db.config.js");
        await databaseConfig();

        // 1. Create a dummy customer
        const custEmail = `cust_${Date.now()}@example.com`;
        customer = await CustomerModel.create({
            firstName: "Inventory",
            lastName: "Tester",
            email: custEmail,
            password: "password123",
            role: "Customer"
        });
        token = jwt.sign({ _id: customer._id, role: "Customer" }, securityKey, { expiresIn: "1h" });

        // 2. Create a dummy seller
        const sellEmail = `sell_${Date.now()}@example.com`;
        seller = await SellerModel.create({
            firstName: "Inventory",
            lastName: "Seller",
            email: sellEmail,
            password: "password123",
            role: "Seller"
        });
        sellerToken = jwt.sign({ _id: seller._id, role: "Seller" }, securityKey, { expiresIn: "1h" });

        // 3. Create a seller node
        node = await SellerNode.create({
            seller: seller._id,
            storeName: "Inventory Test Kirana",
            slug: `inventory-test-kirana-${Date.now()}`,
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
    }, 30000);

    afterAll(async () => {
        if (customer) await CustomerModel.findByIdAndDelete(customer._id);
        if (seller) await SellerModel.findByIdAndDelete(seller._id);
        if (node) await SellerNode.findByIdAndDelete(node._id);
        if (product) await ProductModel.findByIdAndDelete(product._id);
        await mongoose.connection.close();
    });

    it("should successfully create a product with synchronized stock and attribute.quantity", async () => {
        const payload = {
            subCategoryId: new mongoose.Types.ObjectId().toString(),
            categoryName: "Grocery",
            productName: "Test Honey 500g",
            productSkuId: `SKU-HONEY-${Date.now()}`,
            shortDescription: "Pure test honey",
            description: "Pure organic test honey",
            nodeType: "LOCAL_RETAIL",
            nodeId: node._id.toString(),
            stock: 150,
            attribute: {
                salePrice: 200,
                mrpPrice: 250,
                weight: "500g",
                quantity: "150"
            }
        };

        const pngBuffer = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "base64"
        );

        const res = await request(app)
            .post("/api/v1/indiafy/products")
            .set("Authorization", `Bearer ${sellerToken}`)
            .field("subCategoryId", payload.subCategoryId)
            .field("categoryName", payload.categoryName)
            .field("productName", payload.productName)
            .field("productSkuId", payload.productSkuId)
            .field("shortDescription", payload.shortDescription)
            .field("description", payload.description)
            .field("nodeType", payload.nodeType)
            .field("nodeId", payload.nodeId)
            .field("stock", payload.stock)
            .field("attribute", JSON.stringify(payload.attribute))
            .attach("productImage", pngBuffer, "honey.png");

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.stock).toBe(150);
        expect(res.body.data.attribute.quantity).toBe("150");

        product = await ProductModel.findById(res.body.data._id);
        expect(product).toBeDefined();
        expect(product.stock).toBe(150);
        expect(product.attribute.quantity).toBe("150");
    });

    it("should update a product stock and quantity together in PUT API", async () => {
        const res = await request(app)
            .put(`/api/v1/indiafy/products/${product._id}`)
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({
                stock: 120
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.stock).toBe(120);
        expect(res.body.data.attribute.quantity).toBe("120");

        const updated = await ProductModel.findById(product._id);
        expect(updated.stock).toBe(120);
        expect(updated.attribute.quantity).toBe("120");
    });

    it("should return stock, reserved, and available fields in GET API", async () => {
        const res = await request(app)
            .get(`/api/v1/indiafy/products/${product._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.stock).toBe(120);
        expect(res.body.data.reserved).toBeDefined();
        expect(res.body.data.available).toBeDefined();
        expect(res.body.data.available).toBe(120);
    });

    it("should calculate reserved stock from pending orders and return correct available count", async () => {
        // Create a pending order for 5 units of this product
        const pendingOrder = await OrderModel.create({
            customer: customer._id,
            orderItems: [{
                product: product._id,
                name: product.productName,
                quantity: 5,
                price: 200,
                seller: seller._id,
                nodeType: "LOCAL_RETAIL"
            }],
            shippingAddress: {
                address: "456 Test Way",
                city: "Gurugram",
                state: "Haryana",
                postalCode: "122001",
                country: "India"
            },
            paymentMethod: "TEST",
            itemsPrice: 1000,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 1000,
            status: "Pending",
            isPaid: false
        });

        const res = await request(app)
            .get(`/api/v1/indiafy/products/${product._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.stock).toBe(120);
        expect(res.body.data.reserved).toBe(5);
        expect(res.body.data.available).toBe(115);

        // Clean up pending order
        await OrderModel.findByIdAndDelete(pendingOrder._id);
    });

    it("should decrease stock automatically upon placing a COD order and restore it when cancelled/deleted", async () => {
        // Place COD order
        const payload = {
            orderItems: [{
                product: product._id.toString(),
                seller: seller._id.toString(),
                quantity: 10,
                price: 200
            }],
            shippingAddress: {
                address: "456 Test Way",
                city: "Gurugram",
                state: "Haryana",
                postalCode: "122001",
                country: "India"
            },
            paymentMethod: "COD",
            itemsPrice: 2000,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 2000
        };

        // Create cart first to prevent validation failures
        await CartModel.create({
            customerId: customer._id,
            items: [{
                productId: product._id,
                quantity: 10,
                price: 200
            }],
            totalPrice: 2000
        });

        const res = await request(app)
            .post("/api/v1/indiafy/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(payload);

        expect(res.statusCode).toBe(201);
        const orderId = res.body.orderId || res.body.data?.orderId;

        // Verify stock decreased by 10
        const afterOrder = await ProductModel.findById(product._id);
        expect(afterOrder.stock).toBe(110);
        expect(afterOrder.attribute.quantity).toBe("110");

        // Cancel/delete order
        const deleteRes = await request(app)
            .delete(`/api/v1/indiafy/orders/${orderId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleteRes.statusCode).toBe(200);

        // Verify stock restored
        const afterCancel = await ProductModel.findById(product._id);
        expect(afterCancel.stock).toBe(120);
        expect(afterCancel.attribute.quantity).toBe("120");

        // Clean up cart
        await CartModel.findOneAndDelete({ customerId: customer._id });
    });

    it("should restore stock automatically when order status is updated to Cancelled", async () => {
        // Set up cart
        await CartModel.create({
            customerId: customer._id,
            items: [{
                productId: product._id,
                quantity: 15,
                price: 200
            }],
            totalPrice: 3000
        });

        // Place COD order for 15 units (reduces stock to 105)
        const payload = {
            orderItems: [{
                product: product._id.toString(),
                seller: seller._id.toString(),
                quantity: 15,
                price: 200
            }],
            shippingAddress: {
                address: "456 Test Way",
                city: "Gurugram",
                state: "Haryana",
                postalCode: "122001",
                country: "India"
            },
            paymentMethod: "COD",
            itemsPrice: 3000,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 3000
        };

        const res = await request(app)
            .post("/api/v1/indiafy/orders")
            .set("Authorization", `Bearer ${token}`)
            .send(payload);

        const orderId = res.body.orderId || res.body.data?.orderId;

        const afterOrder = await ProductModel.findById(product._id);
        expect(afterOrder.stock).toBe(105);

        // Update status to Cancelled (via Seller/Admin)
        const updateRes = await request(app)
            .put(`/api/v1/indiafy/orders/${orderId}/status`)
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({ status: "Cancelled" });

        expect(updateRes.statusCode).toBe(200);

        // Verify stock is restored to 120
        const afterCancelStatus = await ProductModel.findById(product._id);
        expect(afterCancelStatus.stock).toBe(120);
        expect(afterCancelStatus.attribute.quantity).toBe("120");

        // Cleanup
        await OrderModel.findByIdAndDelete(orderId);
        await CartModel.findOneAndDelete({ customerId: customer._id });
    });
});
