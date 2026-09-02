import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import SellerModel from "../models/sellers/auth.model.js";
import AdminModel from "../models/admins/auth.model.js";
import SecurityKeyModel from "../models/admins/securityKey.model.js";
import SellerApplication from "../models/sellers/sellerApplication.model.js";
import SellerNode from "../models/sellerNodes/sellerNode.model.js";
import Notification from "../models/notifications/notification.model.js";
import EmailQueue from "../models/notifications/emailQueue.model.js";
import SellerProfileModel from "../models/sellers/profile.model.js";

describe("Seller Activation & Admin Approval E2E Integration Tests", () => {
    let sellerId;
    let sellerToken;
    let sellerId2;
    let sellerToken2;
    let adminId;
    let adminToken;
    let securityKeyId;

    const securityKey = process.env.SecurityKey || "kishan@3322";

    const base64MockFile = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    beforeAll(async () => {
        const { databaseConfig } = await import("../config/db.config.js");
        await databaseConfig();
        // 1. Create or find dummy security key for SUPER_ADMIN role
        let secKeyObj = await SecurityKeyModel.findOne({ role: "SUPER_ADMIN" });
        if (!secKeyObj) {
            secKeyObj = await SecurityKeyModel.create({
                role: "SUPER_ADMIN",
                key: "dummy_sec_key_hash"
            });
        }
        securityKeyId = secKeyObj._id;

        // 2. Create mock admin user
        const admin = await AdminModel.create({
            email: `admin_e2e_${Date.now()}@example.com`,
            password: "Password123",
            firstName: "Admin",
            lastName: "E2E",
            role: "SUPER_ADMIN",
            securityKeyId
        });
        adminId = admin._id;
        adminToken = jwt.sign({ _id: adminId, role: "Admin", email: admin.email }, securityKey, { expiresIn: "1d" });

        // 3. Create mock seller user 1
        const seller1 = await SellerModel.create({
            firstName: "SellerOne",
            lastName: "E2E",
            email: `seller_e2e_1_${Date.now()}@example.com`,
            password: "Password123"
        });
        sellerId = seller1._id;
        sellerToken = jwt.sign({ _id: sellerId, role: "Seller", email: seller1.email }, securityKey, { expiresIn: "1d" });

        // 4. Create mock seller user 2
        const seller2 = await SellerModel.create({
            firstName: "SellerTwo",
            lastName: "E2E",
            email: `seller_e2e_2_${Date.now()}@example.com`,
            password: "Password123"
        });
        sellerId2 = seller2._id;
        sellerToken2 = jwt.sign({ _id: sellerId2, role: "Seller", email: seller2.email }, securityKey, { expiresIn: "1d" });

        // Clean up any stale profiles with identical contacts
        await SellerProfileModel.deleteMany({ contact: { $in: [9876543211, 9876543222] } });
    }, 60000);

    afterAll(async () => {
        // Cleanup all records created during test
        await SellerModel.deleteMany({ email: /_e2e_/ });
        await AdminModel.deleteMany({ email: /_e2e_/ });
        await SellerApplication.deleteMany({ ownerEmail: /_e2e_/ });
        await SellerProfileModel.deleteMany({ contact: { $in: [9876543211, 9876543222] } });
        if (sellerId) {
            await SellerProfileModel.deleteMany({ customerId: { $in: [sellerId, sellerId2] } });
            await SellerNode.deleteMany({ seller: { $in: [sellerId, sellerId2] } });
            await Notification.deleteMany({ recipientId: { $in: [sellerId, sellerId2] } });
        }
        await EmailQueue.deleteMany({ to: { $in: ["jsmith80769@gmail.com", `seller_e2e_1_${Date.now()}@example.com`] } });
        
        await mongoose.connection.close();
    }, 60000);

    it("should successfully submit seller application form", async () => {
        const uniqueGst = "07ABCDE" + Math.floor(1000 + Math.random() * 9000) + "F1Z5";
        const uniquePan = "ABCDE" + Math.floor(1000 + Math.random() * 9000) + "F";
        const uniqueAadhaar = "1111" + Math.floor(10000000 + Math.random() * 90000000);

        const res = await request(app)
            .post("/api/v1/indiafy/seller/applications/apply")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({
                nodeType: "QUICK_COMMERCE",
                storeName: "E2E Test Store",
                storeDescription: "E2E Quick Commerce dark store",
                address: "Plot 100, Sector 44",
                city: "Gurugram",
                state: "Haryana",
                pincode: "122003",
                latitude: "28.4595",
                longitude: "77.0266",
                ownerFullName: "Seller One",
                ownerEmail: `seller_e2e_1_owner@example.com`,
                ownerPhone: "9876543211",
                aadhaarNumber: uniqueAadhaar,
                panNumber: uniquePan,
                gstNumber: uniqueGst,
                foodLicenseNumber: "12345678901234",
                businessType: "Proprietorship",
                bankAccountNumber: "987654321012",
                ifscCode: "SBIN0001234",
                bankName: "State Bank of India",
                aadhaarFront: base64MockFile,
                aadhaarBack: base64MockFile,
                panCard: base64MockFile,
                gstCertificate: base64MockFile,
                foodLicense: base64MockFile,
                cancelledCheque: base64MockFile,
                bankStatement: base64MockFile,
                storePhoto: base64MockFile,
                storeBanner: base64MockFile
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.application).toBeDefined();

        const storeId = res.body.application.storeId;

        // Verify database state for newly created store (isActive = false, isVerified = false, status = pending)
        const storeNode = await SellerNode.findById(storeId);
        expect(storeNode).toBeDefined();
        expect(storeNode.status).toEqual("PENDING_REVIEW");
        expect(storeNode.isActive).toBe(false);
        expect(storeNode.isVerified).toBe(false);
        expect(storeNode.isLive).toBe(false);

        // Verify Email Queue record is inserted
        const emailQueued = await EmailQueue.findOne({ to: "jsmith80769@gmail.com", subject: "New Seller Application Received" });
        expect(emailQueued).toBeDefined();
        expect(emailQueued.status).toBeDefined();
    }, 60000);

    it("should prevent duplicate seller application for the same nodeType", async () => {
        const uniqueGst = "07ABCDE" + Math.floor(1000 + Math.random() * 9000) + "F1Z5";
        const uniquePan = "ABCDE" + Math.floor(1000 + Math.random() * 9000) + "F";
        const uniqueAadhaar = "1111" + Math.floor(10000000 + Math.random() * 90000000);

        const res = await request(app)
            .post("/api/v1/indiafy/seller/applications/apply")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({
                nodeType: "QUICK_COMMERCE",
                storeName: "E2E Test Store Duplicate",
                storeDescription: "Another quick commerce dark store",
                address: "Plot 100, Sector 44",
                city: "Gurugram",
                state: "Haryana",
                pincode: "122003",
                latitude: "28.4595",
                longitude: "77.0266",
                ownerFullName: "Seller One",
                ownerEmail: `seller_e2e_1_owner_dup@example.com`,
                ownerPhone: "9876543212",
                aadhaarNumber: uniqueAadhaar,
                panNumber: uniquePan,
                gstNumber: uniqueGst,
                foodLicenseNumber: "12345678901234",
                businessType: "Proprietorship",
                bankAccountNumber: "987654321012",
                ifscCode: "SBIN0001234",
                bankName: "State Bank of India",
                aadhaarFront: base64MockFile,
                aadhaarBack: base64MockFile,
                panCard: base64MockFile,
                gstCertificate: base64MockFile,
                foodLicense: base64MockFile,
                cancelledCheque: base64MockFile,
                bankStatement: base64MockFile,
                storePhoto: base64MockFile,
                storeBanner: base64MockFile
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("already have a pending or approved application");
    }, 60000);

    it("should prevent onboarding duplicate identity details (same GST number)", async () => {
        // Create application for seller 2 using same GST details as already in use
        const existingApp = await SellerApplication.findOne({ userId: sellerId });
        expect(existingApp).toBeDefined();

        const uniquePan = "ABCDE" + Math.floor(1000 + Math.random() * 9000) + "F";
        const uniqueAadhaar = "1111" + Math.floor(10000000 + Math.random() * 90000000);

        const res = await request(app)
            .post("/api/v1/indiafy/seller/applications/apply")
            .set("Authorization", `Bearer ${sellerToken2}`)
            .send({
                nodeType: "QUICK_COMMERCE",
                storeName: "E2E Test Store 2",
                storeDescription: "Duplicate GST testing",
                address: "Plot 101, Sector 44",
                city: "Gurugram",
                state: "Haryana",
                pincode: "122003",
                latitude: "28.4595",
                longitude: "77.0266",
                ownerFullName: "Seller Two",
                ownerEmail: `seller_e2e_2_owner@example.com`,
                ownerPhone: "9876543222",
                aadhaarNumber: uniqueAadhaar,
                panNumber: uniquePan,
                gstNumber: existingApp.gstNumber, // duplicate GST
                foodLicenseNumber: "12345678901234",
                businessType: "Proprietorship",
                bankAccountNumber: "987654321099",
                ifscCode: "SBIN0001234",
                bankName: "State Bank of India",
                aadhaarFront: base64MockFile,
                aadhaarBack: base64MockFile,
                panCard: base64MockFile,
                gstCertificate: base64MockFile,
                foodLicense: base64MockFile,
                cancelledCheque: base64MockFile,
                bankStatement: base64MockFile,
                storePhoto: base64MockFile,
                storeBanner: base64MockFile
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("GST Number has already been registered");
    }, 60000);

    it("should allow admin to view pending applications", async () => {
        const res = await request(app)
            .get("/api/v1/indiafy/admin/management/seller-applications?status=pending")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.applications.length).toBeGreaterThan(0);
    });

    it("should decrypt sensitive KYC details for admin preview", async () => {
        const existingApp = await SellerApplication.findOne({ userId: sellerId });
        expect(existingApp).toBeDefined();

        const res = await request(app)
            .get(`/api/v1/indiafy/admin/management/seller-applications/${existingApp._id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        // Decrypted verification assertions (must not be encrypted string format containing ':')
        expect(res.body.data.aadhaarNumber).not.toContain(":");
        expect(res.body.data.panNumber).not.toContain(":");
        expect(res.body.data.bankAccountNumber).not.toContain(":");
        expect(res.body.data.aadhaarNumber.length).toEqual(12);
        expect(res.body.data.panNumber.length).toEqual(10);
    });

    it("should allow admin to request more information", async () => {
        const existingApp = await SellerApplication.findOne({ userId: sellerId });
        expect(existingApp).toBeDefined();

        const res = await request(app)
            .put(`/api/v1/indiafy/admin/management/seller-applications/${existingApp._id}/request-info`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                comments: "PAN Card is blurry, please re-upload."
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        const updatedApp = await SellerApplication.findById(existingApp._id);
        expect(updatedApp.status).toEqual("CHANGES_REQUESTED");
        expect(updatedApp.rejectionReason).toEqual("PAN Card is blurry, please re-upload.");
    });

    it("should allow seller to get application status page", async () => {
        const existingApp = await SellerApplication.findOne({ userId: sellerId });
        expect(existingApp).toBeDefined();

        const res = await request(app)
            .get(`/api/v1/indiafy/seller/applications/status/${existingApp.storeId}`)
            .set("Authorization", `Bearer ${sellerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.application.status).toEqual("CHANGES_REQUESTED");
    });

    it("should allow seller to resubmit/overwrite document for information requests", async () => {
        const existingApp = await SellerApplication.findOne({ userId: sellerId });
        expect(existingApp).toBeDefined();

        // Resubmit by sending apply payload with updated values
        const res = await request(app)
            .post("/api/v1/indiafy/seller/applications/apply")
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({
                nodeType: existingApp.nodeType,
                storeName: existingApp.storeName,
                storeDescription: existingApp.storeDescription,
                address: existingApp.address,
                city: existingApp.city,
                state: existingApp.state,
                pincode: existingApp.pincode,
                latitude: "28.4595",
                longitude: "77.0266",
                ownerFullName: existingApp.ownerName,
                ownerEmail: existingApp.ownerEmail,
                ownerPhone: existingApp.ownerPhone,
                aadhaarNumber: "111122223333", // dummy placeholders to bypass encrypt step
                panNumber: "ABCDE1234F",
                gstNumber: existingApp.gstNumber, // same GST is ok since we are overwriting our own pending app
                foodLicenseNumber: "12345678901234",
                businessType: "Proprietorship",
                bankAccountNumber: "987654321012",
                ifscCode: "SBIN0001234",
                bankName: "State Bank of India",
                // Overwrite blurry PAN document
                panCard: base64MockFile,
                aadhaarFront: existingApp.documents.aadhaarFront,
                aadhaarBack: existingApp.documents.aadhaarBack,
                gstCertificate: existingApp.documents.gstCertificate,
                foodLicense: existingApp.documents.foodLicense,
                cancelledCheque: existingApp.documents.cancelledCheque,
                bankStatement: existingApp.documents.bankStatement,
                storePhoto: existingApp.storePhoto,
                storeBanner: existingApp.storeBanner
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);

        const updatedApp = await SellerApplication.findById(existingApp._id);
        expect(updatedApp.status).toEqual("PENDING_REVIEW");
    }, 60000);

    it("should allow admin to approve store node and make it active/live", async () => {
        const existingApp = await SellerApplication.findOne({ userId: sellerId });
        expect(existingApp).toBeDefined();

        const res = await request(app)
            .put(`/api/v1/indiafy/admin/management/seller-applications/${existingApp._id}/approve`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        // Verify application status is approved
        const updatedApp = await SellerApplication.findById(existingApp._id);
        expect(updatedApp.status).toEqual("ACTIVE");

        // Verify linked store (SellerNode) status is approved and active/live
        const storeNode = await SellerNode.findById(existingApp.storeId);
        expect(storeNode.status).toEqual("ACTIVE");
        expect(storeNode.isActive).toBe(true);
        expect(storeNode.isVerified).toBe(true);
        expect(storeNode.isLive).toBe(true);

        // Verify Approval Notification
        const notification = await Notification.findOne({ recipientId: sellerId, type: "approved" });
        expect(notification).toBeDefined();

        // Verify Approval Email queued
        const emailQueued = await EmailQueue.findOne({ to: existingApp.ownerEmail, subject: "Your Store Has Been Approved" });
        expect(emailQueued).toBeDefined();
    });
});
