import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { encrypt, decrypt, hashValue } from "../utils/encryption.js";

describe("Seller Onboarding & KYC Systems Tests", () => {
    
    beforeAll(async () => {
        const { databaseConfig } = await import("../config/db.config.js");
        await databaseConfig();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe("KYC Encryption Utility Tests", () => {
        it("should encrypt and decrypt values correctly", () => {
            const secretData = "9999-8888-7777";
            const cipher = encrypt(secretData);
            
            expect(cipher).not.toEqual(secretData);
            expect(cipher).toContain(":"); // Contains IV divider
            
            const plain = decrypt(cipher);
            expect(plain).toEqual(secretData);
        });

        it("should return the same string if decryption is called on non-encrypted format", () => {
            const plainText = "normal_plain_text";
            const plain = decrypt(plainText);
            expect(plain).toEqual(plainText);
        });

        it("should compute consistent blind index hashes for duplicate checks", () => {
            const rawGst = "22AAAAA0000A1Z5";
            const spacedGst = " 22AAAAA0000A1Z5  ";
            const lowercaseGst = "22aaaaa0000a1z5";

            const hash1 = hashValue(rawGst);
            const hash2 = hashValue(spacedGst);
            const hash3 = hashValue(lowercaseGst);

            expect(hash1).toEqual(hash2);
            expect(hash1).toEqual(hash3);
            expect(hash1.length).toEqual(64); // SHA-256 length is 64 hex chars
        });
    });

    describe("Seller Onboarding API Routes Protection Tests", () => {
        it("should protect onboarding apply route with 401 when no token is present", async () => {
            const res = await request(app)
                .post("/api/v1/indiafy/seller/applications/apply")
                .send({
                    nodeType: "QUICK_COMMERCE"
                });
            
            expect(res.statusCode).toEqual(401);
        });

        it("should protect application status route with 401 when no token is present", async () => {
            const res = await request(app)
                .get("/api/v1/indiafy/seller/applications/status/some_store_id");
            
            expect(res.statusCode).toEqual(401);
        });

        it("should protect admin approvals route with 401 when no token is present", async () => {
            const res = await request(app)
                .get("/api/v1/indiafy/admin/management/seller-applications");
            
            expect(res.statusCode).toEqual(401);
        });
    });
});
