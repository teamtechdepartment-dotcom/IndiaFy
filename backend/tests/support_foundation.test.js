import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import CustomerAuth from "../models/customers/auth.model.js";
import OrderModel from "../models/orders/order.model.js";
import AdminModel from "../models/admins/auth.model.js";
import jwt from "jsonwebtoken";

describe("Support Foundation Implementation", () => {
  let customer1Token, customer2Token, adminToken;
  let customer1Id, customer2Id, adminId, admin2Id;
  let order1Id;

  beforeAll(async () => {
    // Setup users & tokens for testing (mock data)
    customer1Id = new mongoose.Types.ObjectId();
    customer2Id = new mongoose.Types.ObjectId();
    adminId = new mongoose.Types.ObjectId();
    admin2Id = new mongoose.Types.ObjectId();
    order1Id = new mongoose.Types.ObjectId();

    const securityKey = process.env.SecurityKey || "test-key";
    
    customer1Token = jwt.sign({ _id: customer1Id, role: "customer" }, securityKey);
    customer2Token = jwt.sign({ _id: customer2Id, role: "customer" }, securityKey);
    adminToken = jwt.sign({ _id: adminId, role: "admin", permissions: ["tickets:write"] }, securityKey);
    
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    await AdminModel.deleteMany({ email: { $in: ["admin1@test.com", "admin2@test.com"] } });

    await AdminModel.create({
      _id: adminId,
      firstName: "Test",
      lastName: "Admin",
      email: "admin1@test.com",
      password: "password123",
      role: "admin",
      isActive: true,
      securityKeyId: new mongoose.Types.ObjectId()
    });
    
    await AdminModel.create({
      _id: admin2Id,
      firstName: "Test2",
      lastName: "Admin2",
      email: "admin2@test.com",
      password: "password123",
      role: "admin",
      isActive: true,
      securityKeyId: new mongoose.Types.ObjectId()
    });

    await OrderModel.create({
      _id: order1Id,
      customer: customer1Id,
      paymentMethod: "COD",
      itemsPrice: 100,
      taxPrice: 10,
      shippingPrice: 0,
      totalPrice: 110,
      isPaid: false,
      isDelivered: false,
      shippingAddress: { address: "1", city: "1", state: "1", postalCode: "1", country: "1" }
    });
  });

  afterAll(async () => {
    if (convId) {
      await SupportConversation.deleteOne({ _id: convId });
      await SupportMessage.deleteMany({ conversationId: convId });
    }
    await OrderModel.deleteOne({ _id: order1Id });
    await AdminModel.deleteMany({ _id: { $in: [adminId, admin2Id] } });
  });

  let convId;

  it("Customer can create a conversation with own order", async () => {
    const res = await request(app)
      .post("/api/v1/indiafy/support/conversations")
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`])
      .send({ subject: "Missing Item in Order", orderId: order1Id });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.conversation.ticketNumber).toMatch(/SUP-/);
    convId = res.body.conversation._id;
  });

  it("Customer cannot create conversation with another customer's order", async () => {
    const res = await request(app)
      .post("/api/v1/indiafy/support/conversations")
      .set("Cookie", [`CustomerAccessToken=${customer2Token}`])
      .send({ subject: "Missing Item in Order", orderId: order1Id });

    expect(res.status).toBe(403);
  });

  it("Validation fails for oversized subject", async () => {
    const res = await request(app)
      .post("/api/v1/indiafy/support/conversations")
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`])
      .send({ subject: "A".repeat(300) });

    expect(res.status).toBe(400);
  });

  it("Customer can see their own conversations", async () => {
    const res = await request(app)
      .get("/api/v1/indiafy/support/conversations")
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`]);

    expect(res.status).toBe(200);
    expect(res.body.conversations.length).toBe(1);
    expect(res.body.conversations[0]._id).toBe(convId.toString());
  });

  it("Customer cannot see another customer's conversation", async () => {
    const res = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${convId}`)
      .set("Cookie", [`CustomerAccessToken=${customer2Token}`]);

    expect(res.status).toBe(403);
  });

  it("Customer can send a message", async () => {
    const res = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${convId}/messages`)
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`])
      .send({
        body: "Where is my item?",
        clientMessageId: "msg-12345"
      });

    expect(res.status).toBe(201);
    expect(res.body.message.body).toBe("Where is my item?");
  });

  it("Duplicate clientMessageId handles idempotency safely", async () => {
    const res = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${convId}/messages`)
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`])
      .send({
        body: "Where is my item?",
        clientMessageId: "msg-12345"
      });

    // Should return 200 OK and duplicate flag rather than 500
    expect(res.status).toBe(200);
    expect(res.body.duplicate).toBe(true);
  });

  it("Admin can fetch conversations via agent auth", async () => {
    const res = await request(app)
      .get("/api/v1/indiafy/support/conversations")
      .set("Cookie", [`AdminAccessToken=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.conversations.length).toBeGreaterThanOrEqual(1);
  });

  it("Assigning conversation handles concurrency safely (Race Condition Test)", async () => {
    // Both agents try to assign themselves simultaneously
    const req1 = request(app)
      .post(`/api/v1/indiafy/support/conversations/${convId}/assign`)
      .set("Cookie", [`AdminAccessToken=${adminToken}`])
      .send({ agentId: adminId });
      
    const req2 = request(app)
      .post(`/api/v1/indiafy/support/conversations/${convId}/assign`)
      .set("Cookie", [`AdminAccessToken=${adminToken}`])
      .send({ agentId: admin2Id });

    const [res1, res2] = await Promise.all([req1, req2]);
    
    // One should succeed, the other might succeed or fail depending on OCC,
    // but the final state must be consistent with only one agent.
    const finalConv = await SupportConversation.findById(convId);
    expect(finalConv.assignedAgentId).toBeDefined();

    // Ensure only one active assignment exists for this conversation
    const activeAssignments = await mongoose.model("support_Assignment").find({
      conversationId: convId,
      status: "active"
    });
    
    expect(activeAssignments.length).toBe(1);
    expect(activeAssignments[0].agentId.toString()).toBe(finalConv.assignedAgentId.toString());
  });

  it("Pagination handles cursors properly", async () => {
    const res = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${convId}/messages?limit=1`)
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`]);
      
    expect(res.status).toBe(200);
    expect(res.body.messages.length).toBe(1);
    expect(res.body.hasMore).toBeDefined();
  });

});
