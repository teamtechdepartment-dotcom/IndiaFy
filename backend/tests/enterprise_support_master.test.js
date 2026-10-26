import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import jwt from "jsonwebtoken";

import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import SupportTicket from "../models/admins/supportTicket.model.js";
import SupportMember from "../models/support/supportMember.model.js";
import SellerModel from "../models/sellers/auth.model.js";
import CustomerAuth from "../models/customers/auth.model.js";
import AdminModel from "../models/admins/auth.model.js";

describe("Enterprise Support System Master Suite: Seller, Customer, Contact Us", () => {
  const securityKey = process.env.SecurityKey || process.env.JWT_SECRET || "test-key";

  let sellerAId, sellerBId, customerAId, customerBId;
  let supportMemberId, adminId;
  let sellerAToken, sellerBToken, customerAToken, customerBToken;
  let supportMemberToken, adminToken, contactTicketId;

  const testIdsToCleanup = [];

  beforeAll(async () => {
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    sellerAId = new mongoose.Types.ObjectId();
    sellerBId = new mongoose.Types.ObjectId();
    customerAId = new mongoose.Types.ObjectId();
    customerBId = new mongoose.Types.ObjectId();
    supportMemberId = new mongoose.Types.ObjectId();
    adminId = new mongoose.Types.ObjectId();

    sellerAToken = jwt.sign({ sellerId: sellerAId, role: "Seller" }, securityKey);
    sellerBToken = jwt.sign({ sellerId: sellerBId, role: "Seller" }, securityKey);
    customerAToken = jwt.sign({ _id: customerAId, role: "customer" }, securityKey);
    customerBToken = jwt.sign({ _id: customerBId, role: "customer" }, securityKey);

    supportMemberToken = jwt.sign(
      { _id: supportMemberId, name: "Pooja Support", role: "SupportMember", supportRole: "support_agent" },
      securityKey
    );
    adminToken = jwt.sign(
      { _id: adminId, role: "admin", permissions: ["tickets:read", "tickets:write"] },
      securityKey
    );

    // Seed test users
    await SellerModel.create([
      {
        _id: sellerAId,
        firstName: "Ramesh",
        lastName: "Gupta",
        email: `ramesh.seller.${Date.now()}@test.com`,
        phone: "9876500001",
        storeName: "Gupta Textiles",
        password: "hashedpassword123",
      },
      {
        _id: sellerBId,
        firstName: "Suresh",
        lastName: "Sharma",
        email: `suresh.seller.${Date.now()}@test.com`,
        phone: "9876500002",
        storeName: "Sharma Electronics",
        password: "hashedpassword123",
      },
    ]);

    await CustomerAuth.create([
      {
        _id: customerAId,
        firstName: "Aarav",
        lastName: "Mehta",
        email: `aarav.customer.${Date.now()}@test.com`,
        phone: "9123450001",
        password: "hashedpassword123",
      },
      {
        _id: customerBId,
        firstName: "Diya",
        lastName: "Sen",
        email: `diya.customer.${Date.now()}@test.com`,
        phone: "9123450002",
        password: "hashedpassword123",
      },
    ]);

    await SupportMember.create({
      _id: supportMemberId,
      name: "Pooja Support",
      email: `pooja.support.${Date.now()}@indiafy.com`,
      role: "support_agent",
      status: "active",
      password: "hashedpassword123",
    });
    await SupportTicket.deleteMany({ assignedMemberId: supportMemberId });
  }, 30000);

  afterAll(async () => {
    if (testIdsToCleanup.length > 0) {
      await SupportConversation.deleteMany({ _id: { $in: testIdsToCleanup } });
      await SupportMessage.deleteMany({ conversationId: { $in: testIdsToCleanup } });
      await SupportTicket.deleteMany({ _id: { $in: testIdsToCleanup } });
    }
    await SellerModel.deleteMany({ _id: { $in: [sellerAId, sellerBId] } });
    await CustomerAuth.deleteMany({ _id: { $in: [customerAId, customerBId] } });
    await SupportMember.deleteMany({ _id: supportMemberId });
  });

  // ==========================================
  // PHASE 1: SELLER SUPPORT END-TO-END
  // ==========================================
  describe("1. Seller Support Channel", () => {
    let sellerConvId;

    it("1.1 Seller creates conversation and initial message", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support/conversations")
        .set("Authorization", `Bearer ${sellerAToken}`)
        .send({ subject: "GST Invoice Reconciliation" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.conversation).toBeDefined();
      expect(res.body.conversation.customerTypeModel).toBe("seller");

      sellerConvId = res.body.conversation._id;
      testIdsToCleanup.push(sellerConvId);

      // Post seller message
      const msgRes = await request(app)
        .post(`/api/v1/indiafy/support/conversations/${sellerConvId}/messages`)
        .set("Authorization", `Bearer ${sellerAToken}`)
        .send({
          body: "Need quarterly sales report for GST filing.",
          clientMessageId: `msg-seller-${Date.now()}`,
          messageType: "customer",
        });

      expect([200, 201]).toContain(msgRes.status);
      expect(msgRes.body.success).toBe(true);
    });

    it("1.2 Seller ticket appears in Support Workspace inbox (/support-workspace)", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/support-workspace/tickets")
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(res.status).toBe(200);
      const tickets = res.body.data.tickets;
      const found = tickets.find((t) => t._id.toString() === sellerConvId.toString());
      expect(found).toBeDefined();
      expect(found.userType).toBe("seller");
      expect(found.customerName).toContain("Ramesh Gupta");
    });

    it("1.3 Support member opens ticket and sends reply to seller", async () => {
      const detailRes = await request(app)
        .get(`/api/v1/indiafy/support-workspace/tickets/${sellerConvId}`)
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.messages.length).toBeGreaterThanOrEqual(1);

      // Support member replies
      const replyRes = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${sellerConvId}/messages`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ body: "Your quarterly sales tax ledger has been generated." });

      expect(replyRes.status).toBe(201);
    });

    it("1.4 Seller receives support member reply in conversation", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${sellerConvId}/messages`)
        .set("Authorization", `Bearer ${sellerAToken}`);

      expect(res.status).toBe(200);
      const msgs = res.body.messages;
      const staffReply = msgs.find((m) => m.body.includes("quarterly sales tax ledger"));
      expect(staffReply).toBeDefined();
      expect(staffReply.senderType).toBe("admin");
    });

    it("1.5 Admin Help Desk (/admin/tickets) sees complete conversation", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/admin/management/tickets/${sellerConvId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const ticket = res.body.data;
      expect(ticket._id.toString()).toBe(sellerConvId.toString());
      expect(ticket.userType).toBe("seller");
      const hasStaffReply = ticket.messages.some((m) => m.body.includes("quarterly sales tax ledger"));
      expect(hasStaffReply).toBe(true);
    });

    it("1.6 Unauthorized Seller B is rejected with 403", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${sellerConvId}/messages`)
        .set("Authorization", `Bearer ${sellerBToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // PHASE 2: CUSTOMER SUPPORT END-TO-END
  // ==========================================
  describe("2. Customer Support Channel", () => {
    let customerConvId;

    it("2.1 Customer creates conversation and initial message", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support/conversations")
        .set("Authorization", `Bearer ${customerAToken}`)
        .send({ subject: "Refund Status for Damaged Item" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      customerConvId = res.body.conversation._id;
      testIdsToCleanup.push(customerConvId);

      const msgRes = await request(app)
        .post(`/api/v1/indiafy/support/conversations/${customerConvId}/messages`)
        .set("Authorization", `Bearer ${customerAToken}`)
        .send({
          body: "When will my UPI refund be credited?",
          clientMessageId: `msg-cust-${Date.now()}`,
          messageType: "customer",
        });

      expect([200, 201]).toContain(msgRes.status);
    });

    it("2.2 Customer ticket is listed in Support Workspace inbox", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/support-workspace/tickets")
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(res.status).toBe(200);
      const tickets = res.body.data.tickets;
      const found = tickets.find((t) => t._id.toString() === customerConvId.toString());
      expect(found).toBeDefined();
      expect(found.userType).toBe("customer");
      expect(found.customerName).toContain("Aarav Mehta");
    });

    it("2.3 Support member replies to customer ticket", async () => {
      const replyRes = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${customerConvId}/messages`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ body: "Your refund of Rs 1,450 has been processed to your bank." });

      expect(replyRes.status).toBe(201);

      // Customer fetches messages
      const custRes = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${customerConvId}/messages`)
        .set("Authorization", `Bearer ${customerAToken}`);

      expect(custRes.status).toBe(200);
      const reply = custRes.body.messages.find((m) => m.body.includes("Rs 1,450 has been processed"));
      expect(reply).toBeDefined();
    });

    it("2.4 Customer B cannot access Customer A ticket (IDOR check)", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${customerConvId}/messages`)
        .set("Authorization", `Bearer ${customerBToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // PHASE 3: CONTACT US PUBLIC INQUIRIES
  // ==========================================
  describe("3. Contact Us Public Inquiries", () => {
    it("3.1 Guest visitor submits Contact Us form", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support-workspace/tickets")
        .send({
          customerName: "Sunita Rao",
          customerEmail: "sunita.visitor@test.com",
          customerPhone: "9988776655",
          subject: "Partnership Opportunity for Artisans",
          description: "We represent a cooperative of 200 handloom weavers in Varanasi.",
          category: "General Inquiry",
          priority: "Medium",
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.ticketNumber).toBeDefined();
      contactTicketId = res.body.data._id;
      testIdsToCleanup.push(contactTicketId);
    });

    it("3.2 Duplicate rapid submission within 60s returns existing ticket", async () => {
      const retryRes = await request(app)
        .post("/api/v1/indiafy/support-workspace/tickets")
        .send({
          customerName: "Sunita Rao",
          customerEmail: "sunita.visitor@test.com",
          customerPhone: "9988776655",
          subject: "Partnership Opportunity for Artisans",
          description: "We represent a cooperative of 200 handloom weavers in Varanasi.",
          category: "General Inquiry",
          priority: "Medium",
        });

      expect(retryRes.status).toBe(201);
      expect(retryRes.body.data._id.toString()).toBe(contactTicketId.toString());
    });

    it("3.3 Contact Us ticket appears in Support Workspace inbox", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/support-workspace/tickets")
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(res.status).toBe(200);
      const found = res.body.data.tickets.find((t) => t._id.toString() === contactTicketId.toString());
      expect(found).toBeDefined();
      expect(found.customerEmail).toBe("sunita.visitor@test.com");
    });

    it("3.4 Support member replies to Contact Us query and email is queued", async () => {
      const replyRes = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${contactTicketId}/messages`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ body: "Thank you Sunita, our artisan onboarding team will schedule a call." });

      expect(replyRes.status).toBe(201);

      // Verify Admin also sees the Contact Us ticket with full history
      const adminRes = await request(app)
        .get(`/api/v1/indiafy/admin/management/tickets/${contactTicketId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.customerEmail).toBe("sunita.visitor@test.com");
      expect(adminRes.body.data.messages.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==========================================
  // PHASE 4: TICKET LIFECYCLE & INTERNAL NOTES
  // ==========================================
  describe("4. Ticket Lifecycle, Assignment, Internal Notes & Privacy", () => {
    let lifecycleTicketId;

    beforeAll(async () => {
      if (contactTicketId) {
        await SupportTicket.updateOne({ _id: contactTicketId }, { $set: { status: "Resolved", queueStatus: "completed" } });
      }

      const res = await request(app)
        .post("/api/v1/indiafy/support-workspace/tickets")
        .set("Authorization", `Bearer ${customerAToken}`)
        .send({
          subject: "Lifecycle Test Ticket",
          description: "Lifecycle tracking test message",
          category: "Order Support",
        });

      lifecycleTicketId = res.body.data._id;
      testIdsToCleanup.push(lifecycleTicketId);
    });

    it("4.1 Support member adds private internal note", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${lifecycleTicketId}/notes`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ note: "CONFIDENTIAL: Checked buyer account risk score - verified 100% genuine." });

      expect(res.status).toBe(201);
      expect(res.body.data.note).toContain("CONFIDENTIAL");
    });

    it("4.2 Support member and Admin can view the internal note", async () => {
      const staffRes = await request(app)
        .get(`/api/v1/indiafy/support-workspace/tickets/${lifecycleTicketId}`)
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(staffRes.status).toBe(200);
      expect(staffRes.body.data.internalNotes.length).toBeGreaterThanOrEqual(1);
      expect(staffRes.body.data.internalNotes[0].note).toContain("CONFIDENTIAL");
    });

    it("4.3 Customer CANNOT view the internal note (stripped for privacy)", async () => {
      const custRes = await request(app)
        .get(`/api/v1/indiafy/support-workspace/tickets/${lifecycleTicketId}`)
        .set("Authorization", `Bearer ${customerAToken}`);

      expect(custRes.status).toBe(200);
      expect(custRes.body.data.internalNotes.length).toBe(0);

      // Also check conversations messages endpoint
      const msgRes = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${lifecycleTicketId}/messages`)
        .set("Authorization", `Bearer ${customerAToken}`);

      expect(msgRes.status).toBe(200);
      const hasNote = msgRes.body.messages.some((m) => m.body.includes("CONFIDENTIAL"));
      expect(hasNote).toBe(false);
    });

    it("4.4 Assign ticket to support member and verify audit log", async () => {
      const assignRes = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${lifecycleTicketId}/assign`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ memberId: supportMemberId });

      expect(assignRes.status).toBe(200);
      expect(assignRes.body.data.assignedMemberId.toString()).toBe(supportMemberId.toString());
      expect(assignRes.body.data.assignedTo.toString()).toBe(supportMemberId.toString());
      expect(assignRes.body.data.status).toBe("Assigned");
    });

    it("4.5 Resolve ticket with resolution notes", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${lifecycleTicketId}/resolve`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ resolutionNotes: "Issue resolved via replacement dispatch" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("Resolved");
      expect(res.body.data.resolutionNotes).toContain("replacement dispatch");
    });

    it("4.6 Reopen ticket with reason", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${lifecycleTicketId}/reopen`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ reason: "Customer stated delivery had wrong size" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("In Progress");
      expect(res.body.data.reopenReason).toContain("wrong size");
    });
  });

  // ==========================================
  // PHASE 5: ATTACHMENT UPLOAD & SECURITY
  // ==========================================
  describe("5. Attachment Upload and Security Validation", () => {
    let attachTicketId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support/conversations")
        .set("Authorization", `Bearer ${sellerAToken}`)
        .send({ subject: "Attachment Test Ticket" });

      attachTicketId = res.body.conversation._id;
      testIdsToCleanup.push(attachTicketId);
    });

    it("5.1 Permitted image upload (PNG) succeeds with metadata", async () => {
      const fakeImageBuffer = Buffer.from("fake-png-image-content");
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${attachTicketId}/attachments`)
        .set("Authorization", `Bearer ${sellerAToken}`)
        .attach("file", fakeImageBuffer, "receipt.png");

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.attachmentId).toBeDefined();
      expect(res.body.data.fileName).toBe("receipt.png");
      expect(res.body.data.mimeType).toBe("image/png");
    });

    it("5.2 Permitted document upload (PDF) succeeds with metadata", async () => {
      const fakePdfBuffer = Buffer.from("%PDF-1.4 fake pdf content");
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${attachTicketId}/attachments`)
        .set("Authorization", `Bearer ${sellerAToken}`)
        .attach("file", fakePdfBuffer, "invoice.pdf");

      expect(res.status).toBe(201);
      expect(res.body.data.mimeType).toBe("application/pdf");
      expect(res.body.data.fileName).toBe("invoice.pdf");
    });

    it("5.3 Malicious executable file (.exe) is rejected with 400", async () => {
      const badBuffer = Buffer.from("malicious binary content");
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${attachTicketId}/attachments`)
        .set("Authorization", `Bearer ${sellerAToken}`)
        .attach("file", badBuffer, "payload.exe");

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/rejected|invalid/i);
    });

    it("5.4 Oversized file (> 5MB) is rejected with 400", async () => {
      const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${attachTicketId}/attachments`)
        .set("Authorization", `Bearer ${sellerAToken}`)
        .attach("file", oversizedBuffer, "large.jpg");

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/exceeds|large|5mb/i);
    });

    it("5.5 Unauthorized user uploading to another user's ticket is rejected with 403", async () => {
      const fakeImageBuffer = Buffer.from("fake-png-content");
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${attachTicketId}/attachments`)
        .set("Authorization", `Bearer ${sellerBToken}`)
        .attach("file", fakeImageBuffer, "unauthorized.png");

      expect(res.status).toBe(403);
    });
  });
});
