import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import SupportConversation from "../models/support/supportConversation.model.js";
import SupportCallLog from "../models/support/supportCallLog.model.js";
import AdminModel from "../models/admins/auth.model.js";
import CustomerAuth from "../models/customers/auth.model.js";
import OrderModel from "../models/orders/order.model.js";
import jwt from "jsonwebtoken";

// For brevity, we mock basic Auth
const MOCK_CUSTOMER_ID = new mongoose.Types.ObjectId();
const MOCK_AGENT_ID = new mongoose.Types.ObjectId();
const MOCK_AGENT_2_ID = new mongoose.Types.ObjectId();
const MOCK_CONV_ID = new mongoose.Types.ObjectId();

let customerToken;
let agentToken;
let agent2Token;

beforeAll(async () => {
  const { databaseConfig } = await import("../config/db.config.js");
  await databaseConfig();

  // Tokens
  customerToken = jwt.sign({ _id: MOCK_CUSTOMER_ID, role: "customer" }, process.env.SecurityKey || "test-key");
  agentToken = jwt.sign({ _id: MOCK_AGENT_ID, role: "admin", permissions: ["tickets:read", "tickets:write"] }, process.env.SecurityKey || "test-key");
  agent2Token = jwt.sign({ _id: MOCK_AGENT_2_ID, role: "admin", permissions: ["tickets:read", "tickets:write"] }, process.env.SecurityKey || "test-key");

  await CustomerAuth.create({ _id: MOCK_CUSTOMER_ID, email: "c1@test.com", password: "password", securityKeyId: new mongoose.Types.ObjectId() }).catch(() => {});
  await AdminModel.create({ _id: MOCK_AGENT_ID, email: "agent1@test.com", password: "password", role: "admin", permissions: ["tickets:read", "tickets:write"], securityKeyId: new mongoose.Types.ObjectId() }).catch(() => {});
  await AdminModel.create({ _id: MOCK_AGENT_2_ID, email: "agent2@test.com", password: "password", role: "admin", permissions: ["tickets:read", "tickets:write"], securityKeyId: new mongoose.Types.ObjectId() }).catch(() => {});

  // Clear models
  // removed global deletes

  // Seed Conv
  await SupportConversation.create({
    _id: MOCK_CONV_ID,
    customerId: MOCK_CUSTOMER_ID,
    customerTypeModel: "customer",
    ticketNumber: "TEST-001",
    status: "open",
    subject: "Callback Test",
  });
}, 30000);

afterAll(async () => {
  await SupportConversation.deleteMany({ _id: MOCK_CONV_ID });
  await SupportCallLog.deleteMany({ conversationId: MOCK_CONV_ID });
  await AdminModel.deleteMany({ _id: { $in: [MOCK_AGENT_ID, MOCK_AGENT_2_ID] } });
});

describe("Callback Race Conditions & State Machine", () => {
  afterEach(async () => {
    await SupportCallLog.deleteMany({ conversationId: MOCK_CONV_ID });
  });

  it("should prevent duplicate active callbacks (Duplicate Race Condition)", async () => {
    // Fire two requests concurrently
    const req1 = request(app)
      .post(`/api/v1/indiafy/support/conversations/${MOCK_CONV_ID}/callback`)
      .set("Cookie", [`CustomerAccessToken=${customerToken}`])
      .send({ phone: "1234567890" });

    const req2 = request(app)
      .post(`/api/v1/indiafy/support/conversations/${MOCK_CONV_ID}/callback`)
      .set("Cookie", [`CustomerAccessToken=${customerToken}`])
      .send({ phone: "1234567890" });

    const [res1, res2] = await Promise.all([req1, req2]);

    // One should succeed 201, the other might succeed 200 (idempotent due to duplicate key catch)
    expect([201, 200]).toContain(res1.status);
    expect([201, 200]).toContain(res2.status);

    const activeCallbacks = await SupportCallLog.find({ conversationId: MOCK_CONV_ID });
    expect(activeCallbacks.length).toBe(1); // EXACTLY ONE
  });

  it("should prevent double agent assignment (Assignment Race Condition)", async () => {
    // Create a fresh callback for this test
    const callback = await SupportCallLog.create({
      conversationId: MOCK_CONV_ID,
      customerId: MOCK_CUSTOMER_ID,
      customerTypeModel: "customer",
      phone: "1234567890",
      status: "requested"
    });

    // Both agents try to assign at the same time
    const assign1 = request(app)
      .post(`/api/v1/indiafy/support/callbacks/${callback._id}/assign`)
      .set("Cookie", [`AdminAccessToken=${agentToken}`])
      .send({ agentId: MOCK_AGENT_ID });

    const assign2 = request(app)
      .post(`/api/v1/indiafy/support/callbacks/${callback._id}/assign`)
      .set("Cookie", [`AdminAccessToken=${agent2Token}`])
      .send({ agentId: MOCK_AGENT_2_ID });

    const [res1, res2] = await Promise.all([assign1, assign2]);

    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(409); // Conflict for the loser

    const updated = await SupportCallLog.findById(callback._id);
    expect(updated.status).toBe("assigned");
    expect(
      updated.agentId.toString() === MOCK_AGENT_ID.toString() ||
      updated.agentId.toString() === MOCK_AGENT_2_ID.toString()
    ).toBe(true);
  });

  it("should enforce callback status transitions (completed -> calling is forbidden)", async () => {
    // Create a fresh callback in assigned state for this test
    const callback = await SupportCallLog.create({
      conversationId: MOCK_CONV_ID,
      customerId: MOCK_CUSTOMER_ID,
      customerTypeModel: "customer",
      phone: "1234567890",
      status: "assigned",
      agentId: MOCK_AGENT_ID
    });

    // Move to calling
    await request(app)
      .put(`/api/v1/indiafy/support/callbacks/${callback._id}/status`)
      .set("Cookie", [`AdminAccessToken=${agentToken}`])
      .send({ status: "calling" });

    // Move to connected
    await request(app)
      .put(`/api/v1/indiafy/support/callbacks/${callback._id}/status`)
      .set("Cookie", [`AdminAccessToken=${agentToken}`])
      .send({ status: "connected" });

    // Agent completes it
    await request(app)
      .put(`/api/v1/indiafy/support/callbacks/${callback._id}/status`)
      .set("Cookie", [`AdminAccessToken=${agentToken}`])
      .send({ status: "completed" });

    // Try to move backward to calling
    const res = await request(app)
      .put(`/api/v1/indiafy/support/callbacks/${callback._id}/status`)
      .set("Cookie", [`AdminAccessToken=${agentToken}`])
      .send({ status: "calling" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid status transition/i);
  });

  it("should securely isolate customers so they cannot cancel another customer's callback", async () => {
    const OTHER_CUSTOMER = new mongoose.Types.ObjectId();
    const otherCustomerToken = jwt.sign({ _id: OTHER_CUSTOMER, role: "customer" }, process.env.SecurityKey || "test-key");
    await CustomerAuth.create({ _id: OTHER_CUSTOMER, email: "other@test.com", password: "password", securityKeyId: new mongoose.Types.ObjectId() }).catch(() => {});
    
    // Seed new active callback
    const newCallback = await SupportCallLog.create({
      conversationId: MOCK_CONV_ID,
      customerId: MOCK_CUSTOMER_ID,
      customerTypeModel: "customer",
      phone: "999",
      status: "requested"
    });

    const res = await request(app)
      .put(`/api/v1/indiafy/support/callbacks/${newCallback._id}/status`)
      .set("Cookie", [`CustomerAccessToken=${otherCustomerToken}`])
      .send({ status: "cancelled" });

    expect(res.status).toBe(403);
  });
});
