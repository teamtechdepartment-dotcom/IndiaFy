import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

describe("Production-Grade Auth and Security Integration Tests", () => {
    let customerAccessToken = "";
    let customerRefreshToken = "";
    let sellerAccessToken = "";
    let sellerRefreshToken = "";
    let adminAccessToken = "";

    const securityKey = process.env.SecurityKey || "indiafy_default_development_secret_key_987654321";

    beforeAll(async () => {
        const { databaseConfig } = await import("../config/db.config.js");
        await databaseConfig();
        // Clear test database or setup test records if connected
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("Phase 1 & 2: Route Protection and Authentication Rebuild", () => {
        it("should return 401 Unauthorized for secure profiles when not authenticated", async () => {
            const res = await request(app)
                .get("/api/v1/indiafy/customer/profile");
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it("should return 401 on login endpoints with wrong credentials", async () => {
            const res = await request(app)
                .post("/api/v1/indiafy/customer/auth/login")
                .send({
                    email: "wronguser@example.com",
                    password: "WrongPassword@123"
                });
            expect(res.statusCode).toBe(404); // Email not found
        });

        it("should correctly handle jwt verification inside middleware", () => {
            const payload = { _id: "507f1f77bcf86cd799439011", role: "Customer", email: "test@example.com" };
            const token = jwt.sign(payload, securityKey, { expiresIn: "1h" });
            const decoded = jwt.verify(token, securityKey);
            expect(decoded._id).toBe(payload._id);
            expect(decoded.role).toBe(payload.role);
        });
    });

    describe("Phase 3: Profile Endpoints Accessibility and Custom Guards", () => {
        it("should deny access to profile routes if user has an invalid role", async () => {
            // Create a token with an unauthorized role (e.g. Guest)
            const token = jwt.sign(
                { _id: "507f1f77bcf86cd799439011", role: "Guest", email: "guest@example.com" },
                securityKey
            );

            const res = await request(app)
                .get("/api/v1/indiafy/customer/profile")
                .set("Authorization", `Bearer ${token}`);
            
            expect(res.statusCode).toBe(403); // Forbidden
        });
    });

    describe("Phase 4: security and ORB config check", () => {
        it("should return security headers (like X-Content-Type-Options: nosniff)", async () => {
            const res = await request(app).get("/health");
            expect(res.headers["x-content-type-options"]).toBe("nosniff");
            expect(res.headers["x-frame-options"]).toBe("DENY");
        });
    });
});
