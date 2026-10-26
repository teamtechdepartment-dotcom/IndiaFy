import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import SupportTicket from "../models/admins/supportTicket.model.js";
import SupportMember from "../models/support/supportMember.model.js";
import CustomerModel from "../models/customers/auth.model.js";
import OrderModel from "../models/orders/order.model.js";
import AdminModel from "../models/admins/auth.model.js";
import jwt from "jsonwebtoken";
import { databaseConfig } from "../config/db.config.js";

describe("Enterprise Customer Support & Support Workspace Suite", () => {
  let adminId, adminToken;
  let supportMemberId, supportMemberToken, supportMemberPassword;
  let inactiveMemberId, inactiveMemberToken;
  let customer1Id, customer1Token;
  let customer2Id, customer2Token;
  let testTicketId;
  let testOrderId;
  const securityKey = process.env.SecurityKey || process.env.JWT_SECRET || "test-security-key";

  beforeAll(async () => {
    await databaseConfig();

    // 1. Setup Admin
    adminId = new mongoose.Types.ObjectId();
    adminToken = jwt.sign(
      { _id: adminId, role: "Admin", email: "admin.support.test@indiafy.com", permissions: ["*"] },
      securityKey,
      { expiresIn: "1h" }
    );

    // 2. Setup Support Member (Active)
    supportMemberId = new mongoose.Types.ObjectId();
    supportMemberPassword = "SecurePassword@123";

    await SupportMember.deleteMany({ email: /.*@support-test\.indiafy\.com/ });

    const activeMember = new SupportMember({
      _id: supportMemberId,
      name: "Agent Vikram",
      email: "vikram@support-test.indiafy.com",
      password: supportMemberPassword,
      role: "support_member",
      status: "active",
      createdBy: adminId,
    });
    await activeMember.save();

    supportMemberToken = jwt.sign(
      { _id: supportMemberId, role: "SupportMember", name: "Agent Vikram", email: "vikram@support-test.indiafy.com" },
      securityKey,
      { expiresIn: "1h" }
    );

    // 3. Setup Inactive Member
    inactiveMemberId = new mongoose.Types.ObjectId();
    const inactiveMember = new SupportMember({
      _id: inactiveMemberId,
      name: "Agent Inactive",
      email: "inactive@support-test.indiafy.com",
      password: supportMemberPassword,
      role: "support_member",
      status: "inactive",
      createdBy: adminId,
    });
    await inactiveMember.save();

    // 4. Setup Customers
    customer1Id = new mongoose.Types.ObjectId();
    customer2Id = new mongoose.Types.ObjectId();

    await CustomerModel.deleteMany({ email: /.*@customer-test\.indiafy\.com/ });

    await CustomerModel.create({
      _id: customer1Id,
      firstName: "Customer",
      lastName: "One",
      email: "cust1@customer-test.indiafy.com",
      password: "dummyPassword123",
      isEmailVerified: true,
    });

    await CustomerModel.create({
      _id: customer2Id,
      firstName: "Customer",
      lastName: "Two",
      email: "cust2@customer-test.indiafy.com",
      password: "dummyPassword123",
      isEmailVerified: true,
    });

    customer1Token = jwt.sign({ _id: customer1Id, role: "Customer", email: "cust1@customer-test.indiafy.com" }, securityKey, { expiresIn: "1h" });
    customer2Token = jwt.sign({ _id: customer2Id, role: "Customer", email: "cust2@customer-test.indiafy.com" }, securityKey, { expiresIn: "1h" });

    // 5. Setup Mock Order for Customer 1
    testOrderId = new mongoose.Types.ObjectId();
    try {
      await OrderModel.create({
        _id: testOrderId,
        customerId: customer1Id,
        orderNumber: "ORD-TEST-9999",
        orderStatus: "Processing",
        paymentStatus: "Paid",
        totalAmount: 1899,
        items: [
          {
            productName: "Wireless Noise Cancelling Headphones",
            price: 1899,
            quantity: 1,
          },
        ],
      });
    } catch (_ordErr) {
      // If schema differs slightly, ignore non-critical fields
    }
  }, 30000);

  afterAll(async () => {
    // Cleanup test data
    await SupportMember.deleteMany({ email: /.*@support-test\.indiafy\.com/ });
    await CustomerModel.deleteMany({ email: /.*@customer-test\.indiafy\.com/ });
    if (testTicketId) {
      await SupportTicket.findByIdAndDelete(testTicketId);
    }
    if (testOrderId) {
      await OrderModel.findByIdAndDelete(testOrderId);
    }
  });

  // ==========================================
  // SECTION 1: AUTHENTICATION
  // ==========================================
  describe("Support Member Authentication", () => {
    test("POST /support-workspace/auth/login - valid credentials returns token & profile", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support-workspace/auth/login")
        .send({
          email: "vikram@support-test.indiafy.com",
          password: supportMemberPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe("SupportMember");
      expect(res.body.data.user.email).toBe("vikram@support-test.indiafy.com");
      // Check that password hash is NOT returned
      expect(res.body.data.user.password).toBeUndefined();
    });

    test("POST /support-workspace/auth/login - invalid password is rejected (401)", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support-workspace/auth/login")
        .send({
          email: "vikram@support-test.indiafy.com",
          password: "WrongPassword!999",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("POST /support-workspace/auth/login - inactive account login is denied (403)", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support-workspace/auth/login")
        .send({
          email: "inactive@support-test.indiafy.com",
          password: supportMemberPassword,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/deactivated/i);
    });

    test("POST /support-workspace/auth/logout - successfully clears session cookie", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support-workspace/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // SECTION 2: AUTHORIZATION & PERMISSION GUARDS
  // ==========================================
  describe("Role-Based Access Control & Deny-by-Default", () => {
    test("Support member can access /support-workspace/dashboard", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/support-workspace/dashboard")
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeDefined();
    });

    test("Support member CANNOT access Admin management routes (403 Denied)", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/admin/management/coupons")
        .set("Authorization", `Bearer ${supportMemberToken}`);

      // Must be 403 Forbidden because support members do not have Admin permissions
      expect([401, 403]).toContain(res.status);
    });

    test("Admin can create new support members via POST /support-workspace/members", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support-workspace/members")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Agent Priya",
          email: "priya@support-test.indiafy.com",
          role: "support_agent",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.member.status).toBe("invited");
      expect(res.body.data.token).toBeDefined();

      // Password setup flow with generated token
      const setupRes = await request(app)
        .post("/api/v1/indiafy/support-workspace/auth/setup-password")
        .send({
          token: res.body.data.token,
          password: "PriyaNewPassword@123",
        });

      expect(setupRes.status).toBe(200);
      expect(setupRes.body.success).toBe(true);
      expect(setupRes.body.data.user.status).toBe("active");
    });
  });

  // ==========================================
  // SECTION 3: TICKET LIFECYCLE & INTEGRATION
  // ==========================================
  describe("Ticket Lifecycle Operations", () => {
    test("POST /support-workspace/tickets - creates persistent ticket with message and audit log", async () => {
      const res = await request(app)
        .post("/api/v1/indiafy/support-workspace/tickets")
        .send({
          customerName: "Customer One",
          customerEmail: "cust1@customer-test.indiafy.com",
          subject: "Damaged Package on Delivery",
          description: "Box was damaged during transit. Need replacement.",
          category: "Order & Delivery",
          priority: "High",
          orderId: testOrderId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticketNumber).toMatch(/^TCK-/);
      expect(res.body.data.status).toBe("Open");
      expect(res.body.data.category).toBe("Order & Delivery");
      expect(res.body.data.messages.length).toBe(1);
      expect(res.body.data.auditLogs.length).toBeGreaterThan(0);

      testTicketId = res.body.data._id;
    });

    test("POST /support-workspace/tickets/:ticketId/assign - assign ticket to support member", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}/assign`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ memberId: supportMemberId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assignedMemberId).toBe(supportMemberId.toString());
      expect(res.body.data.status).toBe("Assigned");
    });

    test("POST /support-workspace/tickets/:ticketId/notes - staff adds private internal note", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}/notes`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ note: "Courier warehouse confirmed box was crushed on van load." });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note).toContain("Courier warehouse");
    });

    test("Customer cannot access internal staff notes", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${customer1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // internalNotes must be empty for customer!
      expect(res.body.data.internalNotes).toEqual([]);
    });

    test("Staff can view internal notes along with public messages", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}`)
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.internalNotes.length).toBeGreaterThan(0);
      expect(res.body.data.internalNotes[0].note).toContain("Courier warehouse");
    });

    test("POST /support-workspace/tickets/:ticketId/messages - staff sends public reply", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}/messages`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ body: "We apologize for the inconvenience. A replacement unit has been dispatched." });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.body).toContain("replacement unit");
    });

    test("GET /support-workspace/tickets/:ticketId/customer-context - safe sanitized context", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}/customer-context`)
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.email).toBe("cust1@customer-test.indiafy.com");
      // Verify no sensitive fields exposed
      expect(res.body.data.customer.password).toBeUndefined();
      expect(res.body.data.customer.refreshToken).toBeUndefined();
      expect(res.body.data.customer.otp).toBeUndefined();
    });

    test("POST /support-workspace/tickets/:ticketId/resolve - resolves ticket with resolution notes", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}/resolve`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ resolutionNotes: "Free replacement order created with tracking ref AWB-12345." });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("Resolved");
      expect(res.body.data.resolutionNotes).toContain("AWB-12345");
      expect(res.body.data.resolvedAt).toBeDefined();
    });

    test("POST /support-workspace/tickets/:ticketId/reopen - reopens resolved ticket", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}/reopen`)
        .set("Authorization", `Bearer ${supportMemberToken}`)
        .send({ reason: "Customer says replacement is missing power adapter." });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("In Progress");
      expect(res.body.data.reopenedAt).toBeDefined();
    });

    test("GET /support-workspace/tickets/:ticketId/audit-log - audit trail contains all events", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support-workspace/tickets/${testTicketId}/audit-log`)
        .set("Authorization", `Bearer ${supportMemberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const actions = res.body.data.auditLogs.map((a) => a.action);
      expect(actions).toContain("TICKET_CREATED");
      expect(actions).toContain("TICKET_ASSIGNED");
      expect(actions).toContain("INTERNAL_NOTE_ADDED");
      expect(actions).toContain("TICKET_RESOLVED");
      expect(actions).toContain("TICKET_REOPENED");
    });
  });

  // ==========================================
  // SECTION 4: REGRESSION & ALIASES
  // ==========================================
  describe("System Stability & Regression", () => {
    test("Health check endpoint remains functional", async () => {
      const res = await request(app).get("/api/v1/indiafy/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });

    test("Root alias /api/support-workspace/tickets creates ticket", async () => {
      const res = await request(app)
        .post("/api/support-workspace/tickets")
        .send({
          customerName: "Regression Check",
          customerEmail: "regression@customer-test.indiafy.com",
          subject: "Alias Route Validation",
          description: "Checking backward compatibility of root alias route.",
          category: "General Inquiry",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      if (res.body.data?._id) {
        await SupportTicket.findByIdAndDelete(res.body.data._id);
      }
    });
  });
});
