import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import jwt from "jsonwebtoken";

import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import SupportTicket from "../models/admins/supportTicket.model.js";
import SupportMember from "../models/support/supportMember.model.js";
import SupportCallLog from "../models/support/supportCallLog.model.js";

describe("Permanent Ticket Deletion Suite (Admin Help Desk & Support Workspace)", () => {
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

  it("Admin should permanently delete a ticket and its conversation, messages, and call logs", async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const ticketNum = `TICK-${Date.now()}`;

    // 1. Create a ticket, conversation, message, and call log
    await SupportTicket.create({
      _id: ticketId,
      ticketNumber: ticketNum,
      userType: "customer",
      userId: customerId,
      userTypeModel: "customer",
      subject: "Test Ticket for Admin Deletion",
      description: "Test description for admin permanent deletion",
      status: "Open",
      priority: "Medium",
      customerEmail: "user@test.com",
      customerName: "Test User",
    });

    await SupportConversation.create({
      _id: ticketId,
      ticketNumber: ticketNum,
      customerTypeModel: "customer",
      subject: "Test Ticket for Admin Deletion",
      type: "customer",
      customerId,
      status: "open",
    });

    await SupportMessage.create({
      conversationId: ticketId,
      senderType: "customer",
      senderId: customerId,
      body: "Please help me with my order",
      clientMessageId: `msg-${Date.now()}-1`,
    });

    await SupportCallLog.create({
      conversationId: ticketId,
      customerId,
      customerTypeModel: "customer",
      phone: "+919999999999",
      status: "requested",
    });

    // 2. Perform deletion as Admin
    const res = await request(app)
      .delete(`/api/v1/indiafy/admin/management/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // 3. Verify permanent erasure
    const ticketAfter = await SupportTicket.findById(ticketId);
    const convAfter = await SupportConversation.findById(ticketId);
    const messagesAfter = await SupportMessage.find({ conversationId: ticketId });
    const callLogsAfter = await SupportCallLog.find({ conversationId: ticketId });

    expect(ticketAfter).toBeNull();
    expect(convAfter).toBeNull();
    expect(messagesAfter.length).toBe(0);
    expect(callLogsAfter.length).toBe(0);
  });

  it("Support Workspace Staff should permanently delete a ticket and its associated records", async () => {
    const ticketId = new mongoose.Types.ObjectId();
    const ticketNum = `TICK-${Date.now()}-2`;

    // 1. Create ticket, conversation, and message
    await SupportTicket.create({
      _id: ticketId,
      ticketNumber: ticketNum,
      userType: "customer",
      userId: customerId,
      userTypeModel: "customer",
      subject: "Test Ticket for Support Workspace Deletion",
      description: "Test description for support workspace deletion",
      status: "Open",
      priority: "High",
      customerEmail: "seller@test.com",
      customerName: "Test Seller",
    });

    await SupportConversation.create({
      _id: ticketId,
      ticketNumber: ticketNum,
      customerTypeModel: "customer",
      subject: "Test Ticket for Support Workspace Deletion",
      type: "customer",
      customerId,
      status: "open",
    });

    await SupportMessage.create({
      conversationId: ticketId,
      senderType: "admin",
      senderId: supportMemberId,
      body: "Staff note / reply",
      clientMessageId: `msg-${Date.now()}-2`,
    });

    // 2. Perform deletion as SupportMember
    const res = await request(app)
      .delete(`/api/v1/indiafy/support-workspace/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${supportMemberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // 3. Verify permanent erasure
    const ticketAfter = await SupportTicket.findById(ticketId);
    const convAfter = await SupportConversation.findById(ticketId);
    const messagesAfter = await SupportMessage.find({ conversationId: ticketId });

    expect(ticketAfter).toBeNull();
    expect(convAfter).toBeNull();
    expect(messagesAfter.length).toBe(0);
  });

  it("Deleting non-existent ticket should return 404", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/v1/indiafy/support-workspace/tickets/${nonExistentId}`)
      .set("Authorization", `Bearer ${supportMemberToken}`);

    expect(res.status).toBe(404);
  });

  it("Customer should be denied permission to delete tickets", async () => {
    const ticketId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/v1/indiafy/support-workspace/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it("Admin should permanently bulk delete multiple tickets", async () => {
    const id1 = new mongoose.Types.ObjectId();
    const id2 = new mongoose.Types.ObjectId();

    await SupportTicket.create([
      {
        _id: id1,
        ticketNumber: `TICK-BULK-1-${Date.now()}`,
        userType: "customer",
        userId: customerId,
        userTypeModel: "customer",
        subject: "Bulk Delete Admin 1",
        description: "Bulk delete description 1",
        status: "Open",
      },
      {
        _id: id2,
        ticketNumber: `TICK-BULK-2-${Date.now()}`,
        userType: "customer",
        userId: customerId,
        userTypeModel: "customer",
        subject: "Bulk Delete Admin 2",
        description: "Bulk delete description 2",
        status: "Open",
      },
    ]);

    await SupportConversation.create([
      {
        _id: id1,
        ticketNumber: `TICK-BULK-1-${Date.now()}`,
        customerTypeModel: "customer",
        subject: "Bulk Delete Admin 1",
        type: "customer",
        customerId,
        status: "open",
      },
      {
        _id: id2,
        ticketNumber: `TICK-BULK-2-${Date.now()}`,
        customerTypeModel: "customer",
        subject: "Bulk Delete Admin 2",
        type: "customer",
        customerId,
        status: "open",
      },
    ]);

    await SupportMessage.create([
      {
        conversationId: id1,
        senderType: "customer",
        senderId: customerId,
        body: "Message 1",
        clientMessageId: `msg-${Date.now()}-b1`,
      },
      {
        conversationId: id2,
        senderType: "customer",
        senderId: customerId,
        body: "Message 2",
        clientMessageId: `msg-${Date.now()}-b2`,
      },
    ]);

    const res = await request(app)
      .post("/api/v1/indiafy/admin/management/tickets/bulk-delete")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ids: [id1, id2] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deletedCount).toBe(2);

    const ticketsAfter = await SupportTicket.find({ _id: { $in: [id1, id2] } });
    const convsAfter = await SupportConversation.find({ _id: { $in: [id1, id2] } });
    const msgsAfter = await SupportMessage.find({ conversationId: { $in: [id1, id2] } });

    expect(ticketsAfter.length).toBe(0);
    expect(convsAfter.length).toBe(0);
    expect(msgsAfter.length).toBe(0);
  });

  it("Support Workspace Staff should permanently bulk delete multiple tickets", async () => {
    const id3 = new mongoose.Types.ObjectId();
    const id4 = new mongoose.Types.ObjectId();

    await SupportTicket.create([
      {
        _id: id3,
        ticketNumber: `TICK-BULK-3-${Date.now()}`,
        userType: "customer",
        userId: customerId,
        userTypeModel: "customer",
        subject: "Bulk Delete Staff 3",
        description: "Bulk delete description 3",
        status: "Open",
      },
      {
        _id: id4,
        ticketNumber: `TICK-BULK-4-${Date.now()}`,
        userType: "customer",
        userId: customerId,
        userTypeModel: "customer",
        subject: "Bulk Delete Staff 4",
        description: "Bulk delete description 4",
        status: "Open",
      },
    ]);

    await SupportConversation.create([
      {
        _id: id3,
        ticketNumber: `TICK-BULK-3-${Date.now()}`,
        customerTypeModel: "customer",
        subject: "Bulk Delete Staff 3",
        type: "customer",
        customerId,
        status: "open",
      },
      {
        _id: id4,
        ticketNumber: `TICK-BULK-4-${Date.now()}`,
        customerTypeModel: "customer",
        subject: "Bulk Delete Staff 4",
        type: "customer",
        customerId,
        status: "open",
      },
    ]);

    const res = await request(app)
      .post("/api/v1/indiafy/support-workspace/tickets/bulk-delete")
      .set("Authorization", `Bearer ${supportMemberToken}`)
      .send({ ticketIds: [id3, id4] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const ticketsAfter = await SupportTicket.find({ _id: { $in: [id3, id4] } });
    const convsAfter = await SupportConversation.find({ _id: { $in: [id3, id4] } });

    expect(ticketsAfter.length).toBe(0);
    expect(convsAfter.length).toBe(0);
  });

  it("Bulk delete with empty or invalid array returns 400", async () => {
    const res = await request(app)
      .post("/api/v1/indiafy/support-workspace/tickets/bulk-delete")
      .set("Authorization", `Bearer ${supportMemberToken}`)
      .send({ ticketIds: [] });

    expect(res.status).toBe(400);
  });
});
