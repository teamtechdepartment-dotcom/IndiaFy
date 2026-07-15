import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";

// Describe Authentication Tests
describe("Authentication Flow Tests", () => {
    
    // Setup and Teardown
    beforeAll(async () => {
        const { databaseConfig } = await import("../config/db.config.js");
        await databaseConfig();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let customerAccessToken = "";
    let customerRefreshToken = "";

    it("should fail to login with non-existent user", async () => {
        const res = await request(app)
            .post("/api/v1/indiafy/customer/auth/login")
            .send({
                email: "nonexistent_test@example.com",
                password: "Password@123"
            });
        
        expect(res.statusCode).toEqual(404);
        expect(res.body.success).toBe(false);
    });

    it("should protect profile route with 401 when no token", async () => {
        const res = await request(app)
            .get("/api/v1/indiafy/customer/profile");
        
        expect(res.statusCode).toEqual(401);
    });

    it("should return 401 when refresh token is invalid", async () => {
        const res = await request(app)
            .post("/api/v1/indiafy/customer/auth/refresh")
            .send({ refreshToken: "invalid.token.here" });

        expect(res.statusCode).toEqual(401);
    });

    // We can test more endpoints using mocks if needed, but integration tests
    // require an active database and properly seeded data which varies per env.
});
