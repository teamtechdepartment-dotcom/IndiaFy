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

describe("Seller Support Routing to Support Workspace Suite", () => {
  const securityKey = process.env.SecurityKey || process.env.JWT_SECRET || "test-key";

  let seller1Id, seller2Id, customerId;
  let supportMemberId, adminId;
  let seller1Token, seller2Token, customerToken;
  let supportMemberToken, adminToken;
  let createdConvId;

  beforeAll(async () => {
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    seller1Id = new mongoose.Types.ObjectId();
    seller2Id = new mongoose.Types.ObjectId();
    customerId = new mongoose.Types.ObjectId();
    supportMemberId = new mongoose.Types.ObjectId();
    adminId = new mongoose.Types.ObjectId();

    seller1Token = jwt.sign({ sellerId: seller1Id, role: "Seller" }, securityKey);
    seller2Token = jwt.sign({ sellerId: seller2Id, role: "Seller" }, securityKey);
    customerToken = jwt.sign({ _id: customerId, role: "customer" }, securityKey);

    supportMemberToken = jwt.sign(
      { _id: supportMemberId, name: "Pooja Support", role: "SupportMember", supportRole: "support_agent" },
      securityKey
    );
    adminToken = jwt.sign(
      { _id: adminId, role: "admin", permissions: ["tickets:read", "tickets:write"] },
      securityKey
    );

    // Seed test users
    await SellerModel.deleteMany({ _id: { $in: [seller1Id, seller2Id] } });
    await SellerModel.create([
      {
        _id: seller1Id,
        firstName: "Vikram",
        lastName: "Patel",
        email: `vikram.seller.${Date.now()}@test.com`,
        phone: "9876501234",
        storeName: "Patel Spices & Provisions",
        password: "hashedpassword123",
      },
      {
        _id: seller2Id,
        firstName: "Anjali",
        lastName: "Deshmukh",
        email: `anjali.seller.${Date.now()}@test.com`,
        phone: "9876505678",
        storeName: "Deshmukh Crafts",
        password: "hashedpassword123",
      },
    ]);

    await SupportMember.deleteMany({ _id: supportMemberId });
    await SupportMember.create({
      _id: supportMemberId,
      name: "Pooja Support",
      email: `pooja.support.${Date.now()}@indiafy.com`,
      role: "support_agent",
      status: "active",
      password: "hashedpassword123",
    });
  });

  afterAll(async () => {
    if (createdConvId) {
      await SupportConversation.deleteMany({ _id: createdConvId });
      await SupportMessage.deleteMany({ conversationId: createdConvId });
      await SupportTicket.deleteMany({ _id: createdConvId });
    }
    await SellerModel.deleteMany({ _id: { $in: [seller1Id, seller2Id] } });
    await SupportMember.deleteMany({ _id: supportMemberId });
  });

  // 1 & 2: A seller submits a new support message and the conversation persists in DB
  it("1. Seller creates a support conversation and it persists in database with seller identity", async () => {
    const res = await request(app)
      .post("/api/v1/indiafy/support/conversations")
      .set("Authorization", `Bearer ${seller1Token}`)
      .send({ subject: "Inventory Sync Issue with Warehouse" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.conversation).toBeDefined();
    createdConvId = res.body.conversation._id;
    expect(res.body.conversation.customerTypeModel).toBe("seller");
    expect(res.body.conversation.customerId.toString()).toBe(seller1Id.toString());

    // Seller sends a message
    const msgRes = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${createdConvId}/messages`)
      .set("Authorization", `Bearer ${seller1Token}`)
      .send({
        body: "Hello, our inventory count is showing 0 for SKU-9901 but warehouse has 45 units.",
        clientMessageId: `msg-${Date.now()}-seller1`,
      });

    expect(msgRes.status).toBe(201);
    expect(msgRes.body.success).toBe(true);
  });

  // 3. Corresponding ticket appears in /support-workspace/tickets for authorized support member
  it("2. The ticket appears in /support-workspace/tickets in the unassigned queue", async () => {
    const res = await request(app)
      .get("/api/v1/indiafy/support-workspace/tickets?limit=100")
      .set("Authorization", `Bearer ${supportMemberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const tickets = res.body.data?.tickets || [];
    const sellerTicket = tickets.find((t) => t._id.toString() === createdConvId.toString());

    expect(sellerTicket).toBeDefined();
    expect(sellerTicket.userType).toBe("seller");
    expect(sellerTicket.subject).toBe("Inventory Sync Issue with Warehouse");
    expect(sellerTicket.category).toBe("Seller Support");
    expect(sellerTicket.assignedMemberId).toBeNull();
  });

  // 4. Support member opens the ticket and sees the original seller message
  it("3. Support member can open ticket details and see the seller message", async () => {
    const res = await request(app)
      .get(`/api/v1/indiafy/support-workspace/tickets/${createdConvId}`)
      .set("Authorization", `Bearer ${supportMemberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const ticket = res.body.data;
    expect(ticket._id.toString()).toBe(createdConvId.toString());
    expect(ticket.messages).toBeDefined();
    expect(ticket.messages.length).toBeGreaterThanOrEqual(1);
    const firstMsg = ticket.messages[0];
    expect(firstMsg.body).toContain("inventory count is showing 0 for SKU-9901");
  });

  // Customer context resolves seller business details
  it("4. Support workspace customer-context resolves seller details and store name", async () => {
    const res = await request(app)
      .get(`/api/v1/indiafy/support-workspace/tickets/${createdConvId}/customer-context`)
      .set("Authorization", `Bearer ${supportMemberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const context = res.body.data;
    expect(context.customer).toBeDefined();
    expect(context.customer.name).toContain("Vikram");
  });

  // 5 & 6: Support member replies and seller can see the reply
  it("5. Support member replies in workspace, and the reply is visible in seller support chat", async () => {
    const replyRes = await request(app)
      .post(`/api/v1/indiafy/support-workspace/tickets/${createdConvId}/messages`)
      .set("Authorization", `Bearer ${supportMemberToken}`)
      .send({ body: "Hi Vikram, I checked your warehouse feed. Updating your stock to 45 now." });

    expect([200, 201]).toContain(replyRes.status);

    // Seller fetches conversation messages
    const sellerFetchRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${createdConvId}/messages`)
      .set("Authorization", `Bearer ${seller1Token}`);

    expect(sellerFetchRes.status).toBe(200);
    expect(sellerFetchRes.body.success).toBe(true);
    const msgs = sellerFetchRes.body.messages || [];
    const staffReply = msgs.find((m) => m.body.includes("Updating your stock to 45 now"));
    expect(staffReply).toBeDefined();
    expect(staffReply.senderType).toBe("admin");
  });

  // Internal note privacy: Staff adds note, seller CANNOT see it
  it("6. Staff internal note is recorded in workspace and hidden from seller", async () => {
    const noteRes = await request(app)
      .post(`/api/v1/indiafy/support-workspace/tickets/${createdConvId}/notes`)
      .set("Authorization", `Bearer ${supportMemberToken}`)
      .send({ note: "Confirmed warehouse webhook latency on node 4. Safe to resolve." });

    expect([200, 201]).toContain(noteRes.status);

    // Seller fetches messages: must NOT see internal note
    const sellerFetchRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${createdConvId}/messages`)
      .set("Authorization", `Bearer ${seller1Token}`);

    const sellerMsgs = sellerFetchRes.body.messages || [];
    const leakedNote = sellerMsgs.find((m) => m.body.includes("webhook latency on node 4"));
    expect(leakedNote).toBeUndefined();

    // Seller accessing ticket details directly: internal notes must be stripped
    const sellerTicketRes = await request(app)
      .get(`/api/v1/indiafy/support-workspace/tickets/${createdConvId}`)
      .set("Authorization", `Bearer ${seller1Token}`);

    expect(sellerTicketRes.body.data.internalNotes.length).toBe(0);
  });

  // Assignment to support member
  it("7. Support member can assign the ticket to themselves in workspace", async () => {
    const assignRes = await request(app)
      .post(`/api/v1/indiafy/support-workspace/tickets/${createdConvId}/assign`)
      .set("Authorization", `Bearer ${supportMemberToken}`)
      .send({ memberId: supportMemberId.toString() });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.assignedMemberId.toString()).toBe(supportMemberId.toString());

    // Filter queue by assignedTo=me
    const myTicketsRes = await request(app)
      .get("/api/v1/indiafy/support-workspace/tickets?assignedTo=me")
      .set("Authorization", `Bearer ${supportMemberToken}`);

    const myTickets = myTicketsRes.body.data?.tickets || [];
    expect(myTickets.some((t) => t._id.toString() === createdConvId.toString())).toBe(true);
  });

  // 7. Admin Help Desk can view the same ticket and complete history
  it("8. Admin Help Desk can view the same seller ticket and its complete history", async () => {
    const adminRes = await request(app)
      .get("/api/v1/indiafy/admin/management/tickets")
      .set("Cookie", [`AdminAccessToken=${adminToken}`]);

    expect(adminRes.status).toBe(200);
    const tickets = adminRes.body.data || [];
    const ticket = tickets.find((t) => t._id.toString() === createdConvId.toString());
    expect(ticket).toBeDefined();
    expect(ticket.userType).toBe("seller");

    const detailRes = await request(app)
      .get(`/api/v1/indiafy/admin/management/tickets/${createdConvId}`)
      .set("Cookie", [`AdminAccessToken=${adminToken}`]);

    expect(detailRes.status).toBe(200);
    const detail = detailRes.body.data;
    expect(detail.messages.some((m) => m.body.includes("Updating your stock to 45 now"))).toBe(true);
  });

  // 8. IDOR protection: A different unauthorized seller cannot access the ticket
  it("9. Another seller cannot access the conversation (IDOR protection)", async () => {
    const idorRes1 = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${createdConvId}`)
      .set("Authorization", `Bearer ${seller2Token}`);

    expect(idorRes1.status).toBe(403);

    const idorRes2 = await request(app)
      .get(`/api/v1/indiafy/support-workspace/tickets/${createdConvId}`)
      .set("Authorization", `Bearer ${seller2Token}`);

    expect(idorRes2.status).toBe(403);
  });
});
