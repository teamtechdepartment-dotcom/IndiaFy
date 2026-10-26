import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import jwt from "jsonwebtoken";

import SupportTicket from "../models/admins/supportTicket.model.js";
import SupportMember from "../models/support/supportMember.model.js";

describe("Permanent Support Member Deletion Suite", () => {
  const securityKey = process.env.SecurityKey || process.env.JWT_SECRET || "test-key";

  let adminId, supportMemberId, customerId;
  let adminToken, supportMemberToken, customerToken;

  beforeAll(async () => {
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    adminId = new mongoose.Types.ObjectId();
    supportMemberId = new mongoose.Types.ObjectId();
    customerId = new mongoose.Types.ObjectId();

    adminToken = jwt.sign(
      { _id: adminId, email: "admin@indiafy.com", role: "admin", permissions: ["tickets:read", "tickets:write"] },
      securityKey
    );

    supportMemberToken = jwt.sign(
      { _id: supportMemberId, name: "Staff Member", role: "SupportMember", supportRole: "support_agent" },
      securityKey
    );

    customerToken = jwt.sign(
      { _id: customerId, role: "customer" },
      securityKey
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("Admin should permanently delete a support member and unassign their tickets", async () => {
    // 1. Create a dummy support member
    const memberId = new mongoose.Types.ObjectId();
    await SupportMember.create({
      _id: memberId,
      name: "Pooja Support Test",
      email: `pooja_test_${Date.now()}@indiafy.com`,
      role: "support_agent",
      status: "active",
    });

    // 2. Create a ticket assigned to this member
    const ticketId = new mongoose.Types.ObjectId();
    await SupportTicket.create({
      _id: ticketId,
      ticketNumber: `TICK-MEMBER-${Date.now()}`,
      userType: "customer",
      userId: customerId,
      userTypeModel: "customer",
      subject: "Test Assignment to Pooja",
      description: "Testing member deletion",
      status: "Open",
      priority: "High",
      assignedMemberId: memberId,
    });

    // 3. Call DELETE /api/v1/indiafy/support-workspace/members/:id as Admin
    const res = await request(app)
      .delete(`/api/v1/indiafy/support-workspace/members/${memberId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // 4. Verify member is removed from DB
    const deletedMember = await SupportMember.findById(memberId);
    expect(deletedMember).toBeNull();

    // 5. Verify ticket assignedMemberId is unassigned (null)
    const updatedTicket = await SupportTicket.findById(ticketId);
    expect(updatedTicket.assignedMemberId).toBeNull();

    // Cleanup ticket
    await SupportTicket.findByIdAndDelete(ticketId);
  });

  it("Non-admin user (customer) should be forbidden from deleting support members", async () => {
    const memberId = new mongoose.Types.ObjectId();
    await SupportMember.create({
      _id: memberId,
      name: "Musk Support Test",
      email: `musk_test_${Date.now()}@indiafy.com`,
      role: "support_member",
      status: "active",
    });

    const res = await request(app)
      .delete(`/api/v1/indiafy/support-workspace/members/${memberId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);

    // Cleanup
    await SupportMember.findByIdAndDelete(memberId);
  });

  it("Admin should permanently delete a support member via /admin/management/support-members route", async () => {
    const memberId = new mongoose.Types.ObjectId();
    await SupportMember.create({
      _id: memberId,
      name: "Admin Route Delete Test",
      email: `admin_route_test_${Date.now()}@indiafy.com`,
      role: "support_lead",
      status: "active",
    });

    const res = await request(app)
      .delete(`/api/v1/indiafy/admin/management/support-members/${memberId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await SupportMember.findById(memberId);
    expect(deleted).toBeNull();
  });
});
