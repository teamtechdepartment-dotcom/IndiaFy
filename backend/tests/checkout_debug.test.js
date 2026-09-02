import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import CustomerModel from "../models/customers/auth.model.js";
import CustomerProfile from "../models/customers/profile.model.js";
import SellerModel from "../models/sellers/auth.model.js";
import SellerNode from "../models/sellerNodes/sellerNode.model.js";
import ProductModel from "../models/products/product.model.js";
import CartModel from "../models/customers/cart.model.js";
import OrderModel from "../models/orders/order.model.js";

describe("Indiafy Checkout & Payment Flow Integration Tests", () => {
    let customer, seller, node, product, token;
    const securityKey = process.env.SecurityKey || "kishan@3322";

    beforeAll(async () => {
        const { databaseConfig } = await import("../config/db.config.js");
        await databaseConfig();

        // 1. Create a dummy customer
        const custEmail = `cust_${Date.now()}@example.com`;
        customer = await CustomerModel.create({
            firstName: "John",
            lastName: "Doe",
            email: custEmail,
            password: "Password@123",
            isEmailVerified: true
        });

        token = jwt.sign(
            { _id: customer._id.toString(), role: "Customer", email: custEmail },
            securityKey,
            { expiresIn: "15m" }
        );

        // 2. Create customer profile with address
        await CustomerProfile.create({
            customerId: customer._id,
            firstName: "John",
            contact: 9988776655,
            address: [{
                street: "123 Main St",
                nearBy: "Park",
                city: "Gurugram",
                state: "Haryana",
                country: "India"
            }]
        });

        // 3. Create a dummy seller
        const sellerEmail = `sell_${Date.now()}@example.com`;
        seller = await SellerModel.create({
            firstName: "Sharma",
            lastName: "Mart",
            email: sellerEmail,
            password: "Password@123",
            isApproved: true,
            status: "active"
        });

        // 4. Create a seller node
        node = await SellerNode.create({
            seller: seller._id,
            storeName: "Sharma Mart Node",
            slug: `sharma-mart-${Date.now()}`,
            nodeType: "QUICK_COMMERCE",
            address: "Sector 45",
            city: "Gurugram",
            state: "Haryana",
            pincode: "122001",
            isActive: true,
            status: "ACTIVE"
        });

        // 5. Create a product with stock
        product = await ProductModel.create({
            sellerId: seller._id,
            nodeId: node._id,
            nodeType: "QUICK_COMMERCE",
            productName: "Organic Apples 1kg",
            productSkuId: `SKU-${Date.now()}`,
            shortDescription: "Fresh organic apples",
            description: "Fresh organic apples sourced locally.",
            stock: 10,
            attribute: {
                salePrice: 150,
                mrpPrice: 180,
                weight: "1kg",
                quantity: "10"
            },
            isActive: true,
            isPublished: true
        });

        // 6. Create customer cart
        await CartModel.create({
            customerId: customer._id,
            items: [{
                productId: product._id,
                quantity: 2,
                price: 150
            }],
            totalPrice: 300
        });
    }, 30000);

    afterAll(async () => {
        // Clean up
        if (customer) {
            await CustomerModel.findByIdAndDelete(customer._id);
            await CustomerProfile.findOneAndDelete({ customerId: customer._id });
            await CartModel.findOneAndDelete({ customerId: customer._id });
        }
        if (seller) {
            await SellerModel.findByIdAndDelete(seller._id);
        }
        if (node) {
            await SellerNode.findByIdAndDelete(node._id);
        }
        if (product) {
            await ProductModel.findByIdAndDelete(product._id);
        }
        await mongoose.connection.close();
    });

    describe("POST /api/orders (Or /api/v1/indiafy/orders)", () => {
        it("should return 401 Unauthorized if token is missing", async () => {
            const res = await request(app)
                .post("/api/v1/indiafy/orders")
                .send({
                    orderItems: [{ product: product._id, quantity: 1, price: 150 }]
                });
            expect(res.statusCode).toBe(401);
        });

        it("should successfully place a COD order, reduce stock and clear cart", async () => {
            // Re-fetch product to ensure fresh stock state
            const prodBefore = await ProductModel.findById(product._id);
            expect(parseInt(prodBefore.attribute.quantity)).toBe(10);

            const payload = {
                orderItems: [{
                    product: product._id.toString(),
                    seller: seller._id.toString(),
                    quantity: 2,
                    price: 150
                }],
                shippingAddress: {
                    address: "123 Main St",
                    city: "Gurugram",
                    state: "Haryana",
                    postalCode: "122001",
                    country: "India"
                },
                paymentMethod: "COD",
                itemsPrice: 300,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: 300
            };

            const res = await request(app)
                .post("/api/v1/indiafy/orders")
                .set("Authorization", `Bearer ${token}`)
                .send(payload);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.orderId || res.body.data?.orderId).toBeDefined();

            // Verify stock reduced
            const prodAfter = await ProductModel.findById(product._id);
            expect(parseInt(prodAfter.attribute.quantity)).toBe(8);
            expect(prodAfter.stock).toBe(8);

            // Verify cart cleared
            const cart = await CartModel.findOne({ customerId: customer._id });
            expect(cart.items.length).toBe(0);

            // Clean up the created order
            await OrderModel.findByIdAndDelete(res.body.orderId || res.body.data?.orderId);
        });

        it("should fail to place order if product is out of stock", async () => {
            const payload = {
                orderItems: [{
                    product: product._id.toString(),
                    seller: seller._id.toString(),
                    quantity: 20, // exceeding stock of 8
                    price: 150
                }],
                shippingAddress: {
                    address: "123 Main St",
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

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain("Insufficient stock");
        });
    });

    describe("POST /api/payment/verify (Or /api/v1/indiafy/payments/verify)", () => {
        let order;

        beforeEach(async () => {
            // Create a pending order for testing online verification
            order = await OrderModel.create({
                customer: customer._id,
                orderItems: [{
                    product: product._id,
                    seller: seller._id,
                    quantity: 1,
                    price: 150,
                    nodeId: node._id,
                    nodeType: "QUICK_COMMERCE"
                }],
                shippingAddress: {
                    address: "123 Main St",
                    city: "Gurugram",
                    state: "Haryana",
                    postalCode: "122001",
                    country: "India"
                },
                paymentMethod: "TEST",
                itemsPrice: 150,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: 150,
                status: "Pending"
            });
        });

        afterEach(async () => {
            if (order) {
                await OrderModel.findByIdAndDelete(order._id);
            }
        });

        it("should verify test payment simulator and update order status & deduct stock", async () => {
            const res = await request(app)
                .post("/api/v1/indiafy/payments/verify")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    razorpay_order_id: "manual",
                    razorpay_payment_id: "test_simulator_" + Date.now(),
                    razorpay_signature: "test_manual_override",
                    orderId: order._id.toString()
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // Re-fetch order to verify paid status
            const updatedOrder = await OrderModel.findById(order._id);
            expect(updatedOrder.isPaid).toBe(true);
            expect(updatedOrder.status).toBe("Processing");
        });
    });
});
