import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import CustomerModel from "../models/customers/auth.model.js";
import AdminModel from "../models/admins/auth.model.js";
import SupportConversation from "../models/support/supportConversation.model.js";
import SupportCallLog from "../models/support/supportCallLog.model.js";
import telephonyService from "../services/telephony/telephony.service.js";

describe("Support Telephony & Callbacks", () => {
  let customer, agent, customerToken, agentToken, conversation, callbackLog;
  const securityKey = process.env.SecurityKey || "test_dummy_key_2026";
  const agentCookie = "AdminAccessToken";

  beforeAll(async () => {
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    customer = await CustomerModel.create({
      firstName: "Phone",
      lastName: "Customer",
      email: `phone_${Date.now()}@test.com`,
      password: "password123",
      role: "Customer",
      securityKeyId: new mongoose.Types.ObjectId()
    });
    customerToken = jwt.sign({ _id: customer._id, role: "Customer" }, securityKey, { expiresIn: "1h" });

    agent = await AdminModel.create({
      firstName: "Call",
      lastName: "Agent",
      email: `callagent_${Date.now()}@test.com`,
      password: "password123",
      role: "admin",
      permissions: ["tickets:read", "tickets:write"],
      securityKeyId: new mongoose.Types.ObjectId()
    });
    agentToken = jwt.sign({ _id: agent._id, role: "support_manager" }, securityKey, { expiresIn: "1h" });
  });

  afterAll(async () => {
    if (customer) await CustomerModel.findByIdAndDelete(customer._id);
    if (agent) await AdminModel.findByIdAndDelete(agent._id);
    if (conversation) await SupportConversation.findByIdAndDelete(conversation._id);
    if (callbackLog) await SupportCallLog.findByIdAndDelete(callbackLog._id);
  });

  beforeEach(async () => {
    // Reset telephony config for tests
    process.env.TELEPHONY_ENABLED = "true";
    process.env.TELEPHONY_PROVIDER = "mock";
    telephonyService.enabled = true;
    telephonyService.providerName = "mock";
    telephonyService._initializeProvider();
    
    // Create fresh conversation and callback
    conversation = await SupportConversation.create({
      customerId: customer._id,
      customerTypeModel: "customer",
      subject: "Need a call",
      status: "open",
      ticketNumber: "TK" + Date.now()
    });

    callbackLog = await SupportCallLog.create({
      conversationId: conversation._id,
      customerId: customer._id,
      customerTypeModel: "customer",
      phone: "+1234567890",
      status: "assigned",
      agentId: agent._id // Agent is assigned
    });
  });

  afterEach(async () => {
    if (conversation) {
      await SupportConversation.deleteMany({ _id: conversation._id });
      await SupportCallLog.deleteMany({ conversationId: conversation._id });
    }
  });

  describe("Start Call Security", () => {
    it("should reject customer attempting to start call", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support/callbacks/${callbackLog._id}/start-call`)
        .set("Cookie", [`CustomerAccessToken=${customerToken}`]);
      
      expect(res.status).toBe(403);
    });

    it("should return TELEPHONY_DISABLED if disabled in env", async () => {
      telephonyService.enabled = false;
      const res = await request(app)
        .post(`/api/v1/indiafy/support/callbacks/${callbackLog._id}/start-call`)
        .set("Cookie", [`${agentCookie}=${agentToken}`]);
      
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("TELEPHONY_DISABLED");
    });

    it("should safely initiate a mock call", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support/callbacks/${callbackLog._id}/start-call`)
        .set("Cookie", [`${agentCookie}=${agentToken}`]);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.callback.status).toBe("calling");
      expect(res.body.callback.providerCallId).toMatch(/^mock_/);
      expect(res.body.callback.providerName).toBe("mock");
      expect(res.body.callback.startedAt).toBeDefined();
    });

    it("should reject Start Call if status is not assigned", async () => {
      await SupportCallLog.findByIdAndUpdate(callbackLog._id, { status: "queued", agentId: null });
      
      const res = await request(app)
        .post(`/api/v1/indiafy/support/callbacks/${callbackLog._id}/start-call`)
        .set("Cookie", [`${agentCookie}=${agentToken}`]);
      
      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/NOT_ALLOWED/i);
    });

    it("should reject Start Call if assigned to a different agent", async () => {
      const otherAgentId = new mongoose.Types.ObjectId();
      await SupportCallLog.findByIdAndUpdate(callbackLog._id, { agentId: otherAgentId });
      
      const res = await request(app)
        .post(`/api/v1/indiafy/support/callbacks/${callbackLog._id}/start-call`)
        .set("Cookie", [`${agentCookie}=${agentToken}`]);
      
      expect(res.status).toBe(409);
    });

    it("should enforce idempotency and prevent duplicate calls (race condition test)", async () => {
      // Simulate double click
      const req1 = request(app)
        .post(`/api/v1/indiafy/support/callbacks/${callbackLog._id}/start-call`)
        .set("Cookie", [`${agentCookie}=${agentToken}`]);
        
      const req2 = request(app)
        .post(`/api/v1/indiafy/support/callbacks/${callbackLog._id}/start-call`)
        .set("Cookie", [`${agentCookie}=${agentToken}`]);

      const [res1, res2] = await Promise.all([req1, req2]);

      const statuses = [res1.status, res2.status].sort();
      // One should succeed (200) and one should conflict (409)
      expect(statuses).toEqual([200, 409]);
    });

    it("should prevent arbitrary destination phone injection", async () => {
      // Revert status to assigned for test
      await SupportCallLog.findByIdAndUpdate(callbackLog._id, { status: "assigned" });

      const res = await request(app)
        .post(`/api/v1/indiafy/support/callbacks/${callbackLog._id}/start-call`)
        .set("Cookie", [`${agentCookie}=${agentToken}`])
        .send({ to: "+910000000000" });

      expect(res.status).toBe(200);
      
      // Since it's a mock provider, we don't have direct access to what it initiated,
      // but we can assert the db didn't change the phone number.
      const log = await SupportCallLog.findById(callbackLog._id);
      expect(log.phone).toBe("+1234567890"); // The original phone
    });
  });

  describe("Webhook Security & Processing", () => {
    it("should return TELEPHONY_DISABLED to webhook if disabled", async () => {
      telephonyService.enabled = false;
      const res = await request(app)
        .post(`/api/v1/indiafy/support/telephony/webhook`)
        .send({ anything: "test" });
      
      expect(res.status).toBe(200);
      expect(res.text).toBe("TELEPHONY_DISABLED");
    });

    it("should safely handle a valid webhook (Mock Provider)", async () => {
      // First update the callback to calling
      const mockCallId = "mock_12345_" + Date.now();
      await SupportCallLog.findByIdAndUpdate(callbackLog._id, { 
        status: "calling",
        providerCallId: mockCallId,
        startedAt: new Date()
      });

      const res = await request(app)
        .post(`/api/v1/indiafy/support/telephony/webhook`)
        .send({
          providerCallId: mockCallId,
          status: "connected",
          duration: 0
        });

      expect(res.status).toBe(200);
      expect(res.text).toBe("OK");

      // Verify db update
      const updatedLog = await SupportCallLog.findById(callbackLog._id);
      expect(updatedLog.status).toBe("connected");
    });

    it("should mark endedAt when webhook sends completed", async () => {
      const mockCallId = "mock_67890_" + Date.now();
      await SupportCallLog.findByIdAndUpdate(callbackLog._id, { 
        status: "connected",
        providerCallId: mockCallId,
        startedAt: new Date()
      });

      const res = await request(app)
        .post(`/api/v1/indiafy/support/telephony/webhook`)
        .send({
          providerCallId: mockCallId,
          status: "completed",
          duration: 120
        });

      expect(res.status).toBe(200);
      expect(res.text).toBe("OK");

      const updatedLog = await SupportCallLog.findById(callbackLog._id);
      expect(updatedLog.status).toBe("completed");
      expect(updatedLog.durationSeconds).toBe(120);
      expect(updatedLog.endedAt).toBeDefined();
    });

    it("should reject retrograde status updates from webhook", async () => {
      const mockCallId = "mock_ret_" + Date.now();
      await SupportCallLog.findByIdAndUpdate(callbackLog._id, { providerCallId: mockCallId });
      
      // First send completed
      await request(app)
        .post(`/api/v1/indiafy/support/telephony/webhook`)
        .send({
          providerCallId: mockCallId,
          status: "completed",
          signature: "valid"
        });

      // Now send retrograde calling
      const res = await request(app)
        .post(`/api/v1/indiafy/support/telephony/webhook`)
        .send({
          providerCallId: mockCallId,
          status: "calling",
          signature: "valid"
        });
        
      expect(res.status).toBe(200);
      
      const updatedLog = await SupportCallLog.findById(callbackLog._id);
      expect(updatedLog.status).toBe("completed"); // Should not revert to calling
    });

    it("should gracefully ignore webhooks for unknown calls without leaking info", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support/telephony/webhook`)
        .send({
          providerCallId: "mock_unknown",
          status: "connected"
        });

      expect(res.status).toBe(200);
      expect(res.text).toBe("Unknown call");
    });
  });
});
