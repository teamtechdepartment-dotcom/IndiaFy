import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import jwt from "jsonwebtoken";

import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import SupportTicket from "../models/admins/supportTicket.model.js";
import SupportMember from "../models/support/supportMember.model.js";
import CustomerAuth from "../models/customers/auth.model.js";
import AdminModel from "../models/admins/auth.model.js";
import { processSupportQueue, reconcileSupportQueue, calculateMemberWorkloads } from "../services/supportWorkspace.service.js";
import { SUPPORT_CONFIG } from "../config/support.config.js";

describe("Enterprise Support Queue & Automatic Workload Management Suite", () => {
  const securityKey = process.env.SecurityKey || process.env.JWT_SECRET || "test-key";

  let member1Id, member2Id, inactiveMemberId, adminId;
  let member1Token, member2Token, adminToken;
  let testCustomer1Id, testCustomer1Token;

  const createdTicketIds = [];
  const createdMemberIds = [];

  beforeAll(async () => {
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    member1Id = new mongoose.Types.ObjectId();
    member2Id = new mongoose.Types.ObjectId();
    inactiveMemberId = new mongoose.Types.ObjectId();
    adminId = new mongoose.Types.ObjectId();
    testCustomer1Id = new mongoose.Types.ObjectId();

    createdMemberIds.push(member1Id, member2Id, inactiveMemberId);

    member1Token = jwt.sign(
      { _id: member1Id, name: "Aarav Support", email: "aarav@test.com", role: "SupportMember", supportRole: "support_agent" },
      securityKey
    );
    member2Token = jwt.sign(
      { _id: member2Id, name: "Diya Support", email: "diya@test.com", role: "SupportMember", supportRole: "support_agent" },
      securityKey
    );
    adminToken = jwt.sign(
      { _id: adminId, role: "admin", permissions: ["tickets:read", "tickets:write"] },
      securityKey
    );
    testCustomer1Token = jwt.sign({ _id: testCustomer1Id, role: "customer" }, securityKey);

    await CustomerAuth.create({
      _id: testCustomer1Id,
      firstName: "Kavita",
      lastName: "Shah",
      email: `kavita.${Date.now()}@test.com`,
      password: "password123",
    });

    // Clean up any stale unassigned pending tickets from previous runs
    await SupportTicket.deleteMany({ queueStatus: { $in: ["pending_assignment", "retry_required"] } });

    // Create 2 active members and 1 inactive member
    await SupportMember.create([
      {
        _id: member1Id,
        name: "Aarav Support",
        email: `aarav.${Date.now()}@support.test`,
        password: "hashedpassword123",
        role: "support_agent",
        status: "active",
      },
      {
        _id: member2Id,
        name: "Diya Support",
        email: `diya.${Date.now()}@support.test`,
        password: "hashedpassword123",
        role: "support_agent",
        status: "active",
      },
      {
        _id: inactiveMemberId,
        name: "Rahul Inactive",
        email: `rahul.${Date.now()}@support.test`,
        password: "hashedpassword123",
        role: "support_agent",
        status: "inactive",
      },
    ]);
  }, 30000);

  afterAll(async () => {
    if (createdTicketIds.length > 0) {
      await SupportTicket.deleteMany({ _id: { $in: createdTicketIds } });
      await SupportConversation.deleteMany({ _id: { $in: createdTicketIds } });
      await SupportMessage.deleteMany({ conversationId: { $in: createdTicketIds } });
    }
    if (createdMemberIds.length > 0) {
      await SupportMember.deleteMany({ _id: { $in: createdMemberIds } });
    }
    await SupportMember.updateMany(
      { _id: { $nin: [member1Id, member2Id, inactiveMemberId] } },
      { $set: { status: "active" } }
    );
    await CustomerAuth.deleteMany({ _id: testCustomer1Id });
  });

  // ==========================================================================
  describe("1. Capacity Enforcement (Max 3 Active Tickets Per Member)", () => {
    it("1.1 Inactive members do not receive tickets from queue", async () => {
      const workloads = await calculateMemberWorkloads();
      const inactive = workloads.find((w) => w._id.toString() === inactiveMemberId.toString());
      expect(inactive).toBeDefined();
      expect(inactive.isEligible).toBe(false);
      expect(inactive.availableSlots).toBe(0);
    });

    it("1.2 Assigns exactly 3 active tickets to Member 1 and no more than 3", async () => {
      // Temporarily deactivate external test members so only Member 1 and Member 2 are evaluated
      await SupportMember.updateMany(
        { _id: { $nin: [member1Id, member2Id, inactiveMemberId] }, status: "active" },
        { $set: { status: "inactive" } }
      );

      // Create 4 customer tickets
      for (let i = 1; i <= 4; i++) {
        const ticket = await SupportTicket.create({
          ticketNumber: `TCK-CAP-${i}-${Date.now()}`,
          userType: "customer",
          userId: testCustomer1Id,
          customerName: "Kavita Shah",
          customerEmail: "kavita@test.com",
          subject: `Capacity test inquiry #${i}`,
          description: `Testing capacity limit constraint on assignment #${i}`,
          status: "Open",
          priority: "Medium",
          queueStatus: "pending_assignment",
        });
        createdTicketIds.push(ticket._id);
      }

      // Process queue for Member 1 specifically by setting member2 as full
      // Temporarily give member2 3 tickets so all incoming go to member1
      for (let j = 1; j <= 3; j++) {
        const t = await SupportTicket.create({
          ticketNumber: `TCK-M2-${j}-${Date.now()}`,
          userType: "customer",
          userId: testCustomer1Id,
          customerName: "Kavita Shah",
          customerEmail: "kavita@test.com",
          subject: `Member 2 dummy ticket ${j}`,
          description: "Dummy ticket to fill member 2 capacity",
          status: "Assigned",
          priority: "Low",
          queueStatus: "assigned",
          assignedMemberId: member2Id,
          assignedAt: new Date(),
        });
        createdTicketIds.push(t._id);
      }

      // Now process queue: Member 1 has 0/3, Member 2 has 3/3 (full)
      await processSupportQueue();

      // Check Member 1 active tickets
      const m1Count = await SupportTicket.countDocuments({
        assignedMemberId: member1Id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
      });

      // Member 1 must have at most 3 tickets (capacity limit)
      expect(m1Count).toBe(SUPPORT_CONFIG.DEFAULT_MEMBER_CAPACITY);
      expect(m1Count).toBe(3);

      // The 4th ticket must remain in pending_assignment queue because both members are now at capacity (3/3)
      const remainingUnassigned = await SupportTicket.countDocuments({
        _id: { $in: createdTicketIds },
        assignedMemberId: null,
        queueStatus: "pending_assignment",
      });
      expect(remainingUnassigned).toBe(1);
    });
  });

  // ==========================================================================
  describe("2. Automatic Slot Refill on Ticket Resolution", () => {
    it("2.1 Resolving an active ticket drops workload and refills with next queued ticket", async () => {
      // Find one of Member 1's assigned tickets
      const m1Ticket = await SupportTicket.findOne({
        assignedMemberId: member1Id,
        status: { $in: ["Open", "Assigned"] },
      });
      expect(m1Ticket).toBeDefined();

      // Member resolves the ticket via Support Workspace API
      const resolveRes = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${m1Ticket._id}/resolve`)
        .set("Authorization", `Bearer ${member1Token}`)
        .send({ resolutionNotes: "Issue investigated and resolved with customer." });

      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.data.status).toBe("Resolved");

      // Verify the resolved ticket does NOT consume active capacity
      const activeAfterResolve = await SupportTicket.countDocuments({
        assignedMemberId: member1Id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
      });

      // The freed slot must have been automatically refilled with the queued 4th ticket!
      // So active workload remains at 3
      expect(activeAfterResolve).toBe(3);

      // The unassigned ticket count for our test tickets must now be 0
      const remainingUnassigned = await SupportTicket.countDocuments({
        _id: { $in: createdTicketIds },
        assignedMemberId: null,
        queueStatus: "pending_assignment",
      });
      expect(remainingUnassigned).toBe(0);
    });

    it("2.2 Sending a message reply does NOT free capacity", async () => {
      const activeTicket = await SupportTicket.findOne({
        assignedMemberId: member1Id,
        status: { $in: ["Open", "Assigned"] },
      });
      expect(activeTicket).toBeDefined();

      const replyRes = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${activeTicket._id}/messages`)
        .set("Authorization", `Bearer ${member1Token}`)
        .send({ body: "Checking in on your issue, please provide details." });

      expect(replyRes.status).toBe(201);

      const m1Count = await SupportTicket.countDocuments({
        assignedMemberId: member1Id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
      });
      expect(m1Count).toBe(3); // Still 3
    });
  });

  // ==========================================================================
  describe("3. Concurrency & Idempotency Safeguards", () => {
    it("3.1 Concurrent queue processing does not assign any ticket twice or exceed capacity", async () => {
      // Create 5 new pending tickets
      const batchIds = [];
      for (let i = 1; i <= 5; i++) {
        const t = await SupportTicket.create({
          ticketNumber: `TCK-CONC-${i}-${Date.now()}`,
          userType: "customer",
          userId: testCustomer1Id,
          customerName: "Kavita Shah",
          customerEmail: "kavita@test.com",
          subject: `Concurrency batch ticket #${i}`,
          description: "High concurrency stress test ticket",
          status: "Open",
          priority: "High",
          queueStatus: "pending_assignment",
        });
        batchIds.push(t._id);
        createdTicketIds.push(t._id);
      }

      // Free up 2 slots on Member 2
      const m2Tickets = await SupportTicket.find({
        assignedMemberId: member2Id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
      }).limit(2);

      for (const t of m2Tickets) {
        await SupportTicket.findByIdAndUpdate(t._id, {
          status: "Resolved",
          resolutionNotes: "Batch resolved for concurrency test",
        });
      }

      // Run 5 parallel queue processing calls concurrently
      await Promise.all([
        processSupportQueue(),
        processSupportQueue(),
        processSupportQueue(),
        processSupportQueue(),
        processSupportQueue(),
      ]);

      // Check member 2 workload
      const m2FinalCount = await SupportTicket.countDocuments({
        assignedMemberId: member2Id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
      });

      // Member 2 capacity must NOT exceed 3
      expect(m2FinalCount).toBeLessThanOrEqual(3);

      // Verify no ticket in batch was assigned to multiple members
      for (const tId of batchIds) {
        const doc = await SupportTicket.findById(tId).lean();
        if (doc.assignedMemberId) {
          expect(doc.queueStatus).toBe("assigned");
        }
      }
    });
  });

  // ==========================================================================
  describe("4. Admin Monitoring, Pagination & Server-Side Filtering", () => {
    it("4.1 Default page size is 50 and returns pagination metadata", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/admin/management/tickets")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.limit).toBe(50);
      expect(res.body.pagination.page).toBe(1);
    });

    it("4.2 Supports page size 25 and 100", async () => {
      const res25 = await request(app)
        .get("/api/v1/indiafy/admin/management/tickets?limit=25")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res25.status).toBe(200);
      expect(res25.body.pagination.limit).toBe(25);

      const res100 = await request(app)
        .get("/api/v1/indiafy/admin/management/tickets?limit=100")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res100.status).toBe(200);
      expect(res100.body.pagination.limit).toBe(100);
    });

    it("4.3 Rejects or caps unbounded page sizes > 100", async () => {
      const res999 = await request(app)
        .get("/api/v1/indiafy/admin/management/tickets?limit=999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res999.status).toBe(200);
      // Backend must safely cap to maximum 100
      expect(res999.body.pagination.limit).toBe(100);
    });

    it("4.4 Server-side filtering by status and priority", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/admin/management/tickets?status=resolved")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const tickets = res.body.data;
      tickets.forEach((t) => {
        expect(t.status).toBe("Resolved");
      });
    });

    it("4.5 Real database metrics returned in response", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/admin/management/tickets")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const metrics = res.body.metrics;
      expect(metrics).toBeDefined();
      expect(typeof metrics.total).toBe("number");
      expect(typeof metrics.today).toBe("number");
      expect(typeof metrics.last7Days).toBe("number");
      expect(typeof metrics.unassigned).toBe("number");
      expect(typeof metrics.resolved).toBe("number");
      expect(typeof metrics.highPriority).toBe("number");
    });

    it("4.6 Admin Workload Monitoring endpoint (/support-workload)", async () => {
      const res = await request(app)
        .get("/api/v1/indiafy/admin/management/support-workload")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.workloads).toBeDefined();
      expect(Array.isArray(res.body.data.workloads)).toBe(true);

      const m1 = res.body.data.workloads.find((w) => w._id.toString() === member1Id.toString());
      expect(m1).toBeDefined();
      expect(m1.maxCapacity).toBe(3);
      expect(m1.isEligible).toBe(true);
      expect(typeof m1.activeWorkload).toBe("number");
    });
  });

  // ==========================================================================
  describe("5. Queue Reconciliation & Self-Healing", () => {
    it("5.1 Reconciles orphaned unassigned tickets and returns audit report", async () => {
      // Create a ticket stuck in 'processing'
      const stuckTicket = await SupportTicket.create({
        ticketNumber: `TCK-STUCK-${Date.now()}`,
        userType: "customer",
        userId: testCustomer1Id,
        customerName: "Kavita Shah",
        customerEmail: "kavita@test.com",
        subject: "Stuck queue processing ticket",
        description: "Simulating a worker crash during processing",
        status: "Open",
        priority: "Medium",
        queueStatus: "processing",
        updatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      });
      createdTicketIds.push(stuckTicket._id);
      // Raw update to preserve historical timestamp bypassing mongoose timestamp middleware
      await SupportTicket.collection.updateOne(
        { _id: stuckTicket._id },
        { $set: { updatedAt: new Date(Date.now() - 10 * 60 * 1000) } }
      );

      const report = await reconcileSupportQueue();
      expect(report).toBeDefined();
      expect(report.recoveredStuckTickets).toBeGreaterThanOrEqual(1);

      // Verify the stuck ticket was reset to pending_assignment or assigned
      const refreshed = await SupportTicket.findById(stuckTicket._id).lean();
      expect(["pending_assignment", "assigned"]).toContain(refreshed.queueStatus);
    });
  });

  // ==========================================================================
  describe("6. Automatic Slot Refill on Ticket Closure & Contact Us Queueing", () => {
    it("6.1 Closing an active ticket drops workload and refills with next queued ticket", async () => {
      // Clear any prior unassigned pending tickets to test clean FIFO transition
      await SupportTicket.deleteMany({ assignedMemberId: null, queueStatus: { $in: ["pending_assignment", "retry_required"] } });

      // Find one of Member 1's active tickets
      const m1Ticket = await SupportTicket.findOne({
        assignedMemberId: member1Id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
      });
      expect(m1Ticket).toBeDefined();

      // Create a queued ticket waiting for capacity
      const queuedTicket = await SupportTicket.create({
        ticketNumber: `TCK-CLOSE-REFILL-${Date.now()}`,
        userType: "customer",
        userId: testCustomer1Id,
        customerName: "Kavita Shah",
        customerEmail: "kavita@test.com",
        subject: "Ticket waiting for closed refill",
        description: "Must be assigned when an active ticket is closed",
        status: "Open",
        priority: "High",
        queueStatus: "pending_assignment",
      });
      createdTicketIds.push(queuedTicket._id);

      // Support member closes their active ticket via Support Workspace API
      const closeRes = await request(app)
        .post(`/api/v1/indiafy/support-workspace/tickets/${m1Ticket._id}/close`)
        .set("Authorization", `Bearer ${member1Token}`)
        .send({ reason: "Issue finalized and resolved with buyer." });

      expect(closeRes.status).toBe(200);
      expect(closeRes.body.data.status).toBe("Closed");

      // Verify closed ticket does not consume active capacity
      const closedDoc = await SupportTicket.findById(m1Ticket._id).lean();
      expect(closedDoc.status).toBe("Closed");
      expect(closedDoc.queueStatus).toBe("completed");

      // Verify the queued ticket was automatically assigned to the freed slot!
      const assignedQueued = await SupportTicket.findById(queuedTicket._id).lean();
      expect(assignedQueued.status).toBe("Assigned");
      expect(assignedQueued.queueStatus).toBe("assigned");
      expect(assignedQueued.assignedMemberId.toString()).toBe(member1Id.toString());
    });

    it("6.2 Contact Us inquiry enters central queue and triggers auto-assignment", async () => {
      // Clear any prior unassigned pending tickets to test clean FIFO transition
      await SupportTicket.deleteMany({ assignedMemberId: null, queueStatus: { $in: ["pending_assignment", "retry_required"] } });

      // Temporarily give member1 only 2 tickets so a slot is free
      const activeM1 = await SupportTicket.find({
        assignedMemberId: member1Id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
      });
      if (activeM1.length >= 3) {
        await SupportTicket.updateOne({ _id: activeM1[0]._id }, { $set: { status: "Closed", queueStatus: "completed" } });
      }

      // Guest submits Contact Us form
      const contactRes = await request(app)
        .post("/api/v1/indiafy/support-workspace/tickets")
        .send({
          customerName: "Anita Sharma",
          customerEmail: "anita.contact@test.com",
          subject: "Contact Us General Inquiry",
          description: "Need help with product delivery to rural area",
          category: "General Inquiry",
          priority: "Medium",
        });

      expect(contactRes.status).toBe(201);
      const contactTicket = contactRes.body.data;
      createdTicketIds.push(contactTicket._id);

      // Verify Contact Us ticket entered queue and was automatically assigned to available member
      const dbTicket = await SupportTicket.findById(contactTicket._id).lean();
      expect(dbTicket).toBeDefined();
      expect(dbTicket.sourceChannel).toBe("contact_us");
      expect(dbTicket.status).toBe("Assigned");
      expect(dbTicket.assignedMemberId).toBeDefined();
      expect(dbTicket.assignedMemberId.toString()).toBe(member1Id.toString());
    });
  });
});
