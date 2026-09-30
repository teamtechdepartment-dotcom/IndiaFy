import request from "supertest";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "http";
import Client from "socket.io-client";
import jwt from "jsonwebtoken";

import app from "../app.js";
import { initSupportSocket } from "../utils/support.socket.js";
import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import CustomerModel from "../models/customers/auth.model.js";
import OrderModel from "../models/orders/order.model.js";
import AdminModel from "../models/admins/auth.model.js";
import AuditLog from "../models/admins/auditLog.model.js";

const TEST_SECRET = process.env.SecurityKey || "test-secret";

describe("Support Context & Internal Notes", () => {
  let io, server, adminSocket, customerSocket;
  let admin, customer1, customer2, order;
  let adminToken, customer1Token, customer2Token;
  let conversation1, conversation2;

  beforeAll(async () => {
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    // 1. Start Server for socket testing
    server = createServer(app);
    io = new Server(server);
    
    io.on("connection", (socket) => {
      const token = socket.handshake.auth.token;
      let user = null;
      if (token) {
        user = jwt.verify(token, TEST_SECRET);
      }
      initSupportSocket(io, socket, user);
    });

    await new Promise((resolve) => {
      server.listen(() => {
        resolve();
      });
    });

    const port = server.address().port;

    // 2. Setup Data
    admin = await AdminModel.create({
      firstName: "Admin", email: "admin@test.com", password: "pwd", role: "ADMIN", permissions: ["tickets:write"], securityKeyId: new mongoose.Types.ObjectId()
    });
    adminToken = jwt.sign({ _id: admin._id, role: "admin", permissions: admin.permissions }, TEST_SECRET);

    customer1 = await CustomerModel.create({
      firstName: "Cust1", email: "cust1@test.com", password: "pwd"
    });
    customer1Token = jwt.sign({ _id: customer1._id, role: "customer" }, TEST_SECRET);

    customer2 = await CustomerModel.create({
      firstName: "Cust2", email: "cust2@test.com", password: "pwd"
    });
    customer2Token = jwt.sign({ _id: customer2._id, role: "customer" }, TEST_SECRET);

    order = await OrderModel.create({
      customer: customer1._id,
      orderItems: [],
      shippingAddress: { address: "123", city: "C", state: "S", postalCode: "000", country: "IN" },
      paymentMethod: "TEST",
      itemsPrice: 100, taxPrice: 0, shippingPrice: 0, totalPrice: 100
    });

    conversation1 = await SupportConversation.create({
      ticketNumber: "TCK-1000",
      customerId: customer1._id,
      customerTypeModel: "customer",
      orderId: order._id,
      subject: "Help with order",
      status: "open",
    });

    conversation2 = await SupportConversation.create({
      ticketNumber: "TCK-1001",
      customerId: customer2._id,
      customerTypeModel: "customer",
      subject: "General inquiry",
      status: "open",
    });

    // 3. Setup Sockets
    adminSocket = Client(`http://localhost:${port}`, { auth: { token: adminToken } });
    customerSocket = Client(`http://localhost:${port}`, { auth: { token: customer1Token } });

    await Promise.all([
      new Promise(resolve => adminSocket.on("connect", resolve)),
      new Promise(resolve => customerSocket.on("connect", resolve))
    ]);
  }, 30000);

  afterAll(async () => {
    io.close();
    server.close();
    if (adminSocket) adminSocket.disconnect();
    if (customerSocket) customerSocket.disconnect();

    if (admin) await AdminModel.findByIdAndDelete(admin._id);
    if (customer1) await CustomerModel.deleteMany({ _id: { $in: [customer1._id, customer2?._id].filter(Boolean) } });
    if (order) await OrderModel.findByIdAndDelete(order._id);
    if (conversation1) await SupportConversation.deleteMany({ _id: { $in: [conversation1._id, conversation2?._id].filter(Boolean) } });
    if (conversation1) await SupportMessage.deleteMany({ conversationId: { $in: [conversation1._id, conversation2?._id].filter(Boolean) } });
    if (admin) await AuditLog.deleteMany({ adminId: admin._id });
  });

  describe("REST Context Isolation", () => {
    it("Admin gets safe context", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${conversation1._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.conversation.customerId.firstName).toBe("Cust1");
      expect(res.body.conversation.customerId.password).toBeUndefined(); // Safe
      
      expect(res.body.conversation.orderId.totalPrice).toBe(100);
      expect(res.body.conversation.orderId.paymentResult).toBeUndefined(); // Safe
    });

    it("Customer gets own safe context", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${conversation1._id}`)
        .set("Authorization", `Bearer ${customer1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.conversation.customerId._id).toBe(customer1._id.toString());
    });

    it("Customer cannot access another's context", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${conversation1._id}`)
        .set("Authorization", `Bearer ${customer2Token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Internal Notes Logic", () => {
    it("Admin can create internal note via REST", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support/conversations/${conversation1._id}/messages`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          body: "This is an internal note",
          clientMessageId: "note-1",
          messageType: "internal_note"
        });

      expect(res.status).toBe(201);
      expect(res.body.message.messageType).toBe("internal_note");
    });

    it("Customer cannot create internal note via REST", async () => {
      const res = await request(app)
        .post(`/api/v1/indiafy/support/conversations/${conversation1._id}/messages`)
        .set("Authorization", `Bearer ${customer1Token}`)
        .send({
          body: "Sneaky internal note",
          clientMessageId: "sneaky-1",
          messageType: "internal_note"
        });

      expect(res.status).toBe(403);
    });

    it("Customer message fetch excludes internal notes", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${conversation1._id}/messages`)
        .set("Authorization", `Bearer ${customer1Token}`);

      expect(res.status).toBe(200);
      const messages = res.body.messages;
      const notes = messages.filter(m => m.messageType === "internal_note");
      expect(notes.length).toBe(0);
    });

    it("Admin message fetch includes internal notes", async () => {
      const res = await request(app)
        .get(`/api/v1/indiafy/support/conversations/${conversation1._id}/messages`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const messages = res.body.messages;
      const notes = messages.filter(m => m.messageType === "internal_note");
      expect(notes.length).toBeGreaterThan(0);
    });

    it("Internal notes write to Audit Log", async () => {
      const log = await AuditLog.findOne({ action: "CREATE_INTERNAL_NOTE", adminId: admin._id });
      expect(log).not.toBeNull();
    });
  });

  describe("Socket Broadcast Isolation", () => {
    it("Internal notes broadcast ONLY to admin socket, not customer socket", async () => {
      // 1. Both join room
      const adminPromise = new Promise(resolve => adminSocket.once("support:conversation:joined", resolve));
      adminSocket.emit("support:conversation:join", { conversationId: conversation1._id.toString() });
      await adminPromise;

      const customerPromise = new Promise(resolve => customerSocket.once("support:conversation:joined", resolve));
      customerSocket.emit("support:conversation:join", { conversationId: conversation1._id.toString() });
      await customerPromise;

      // 2. Setup listeners
      let adminReceived = false;
      let customerReceived = false;

      adminSocket.on("support:message:new", (data) => {
        if (data.message.clientMessageId === "socket-note-1") adminReceived = true;
      });

      customerSocket.on("support:message:new", (data) => {
        if (data.message.clientMessageId === "socket-note-1") customerReceived = true;
      });

      // 3. Admin sends internal note
      adminSocket.emit("support:message:send", {
        conversationId: conversation1._id.toString(),
        body: "Socket internal note",
        clientMessageId: "socket-note-1",
        messageType: "internal_note"
      });

      // 4. Wait
      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(adminReceived).toBe(true);
      expect(customerReceived).toBe(false);
    });
  });
});
