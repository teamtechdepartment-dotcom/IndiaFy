import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import jwt from "jsonwebtoken";

import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import SupportCallLog from "../models/support/supportCallLog.model.js";
import CustomerAuth from "../models/customers/auth.model.js";
import CustomerProfile from "../models/customers/profile.model.js";
import AdminModel from "../models/admins/auth.model.js";
import AdminRole from "../models/admins/adminRole.model.js";
import SellerModel from "../models/sellers/auth.model.js";
import OrderModel from "../models/orders/order.model.js";
import { initSupportSocket } from "../utils/support.socket.js";

describe("Support System P0 Security Verification Suite", () => {
  const securityKey = process.env.SecurityKey || "test-key";

  // Identifiers
  let superAdminId, readAdminId, writeAdminId, bothAdminId, unauthAdminId, customAdminId;
  let customer1Id, customer2Id, seller1Id, seller2Id;
  let conv1Id, conv2Id, convSeller2Id, callLog1Id, orderId, orderSellerId;
  let customRoleId;

  // Tokens
  let superAdminToken, readAdminToken, writeAdminToken, bothAdminToken, unauthAdminToken, customAdminToken;
  let customer1Token, customer2Token, seller1Token, seller2Token;

  beforeAll(async () => {
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    superAdminId = new mongoose.Types.ObjectId();
    readAdminId = new mongoose.Types.ObjectId();
    writeAdminId = new mongoose.Types.ObjectId();
    bothAdminId = new mongoose.Types.ObjectId();
    unauthAdminId = new mongoose.Types.ObjectId();
    customAdminId = new mongoose.Types.ObjectId();

    customer1Id = new mongoose.Types.ObjectId();
    customer2Id = new mongoose.Types.ObjectId();
    seller1Id = new mongoose.Types.ObjectId();
    seller2Id = new mongoose.Types.ObjectId();

    conv1Id = new mongoose.Types.ObjectId();
    conv2Id = new mongoose.Types.ObjectId();
    convSeller2Id = new mongoose.Types.ObjectId();
    callLog1Id = new mongoose.Types.ObjectId();
    orderId = new mongoose.Types.ObjectId();
    orderSellerId = new mongoose.Types.ObjectId();
    customRoleId = new mongoose.Types.ObjectId();

    // Sign Tokens
    superAdminToken = jwt.sign({ _id: superAdminId, role: "SUPER_ADMIN" }, securityKey);
    readAdminToken = jwt.sign({ _id: readAdminId, role: "admin", permissions: ["tickets:read"] }, securityKey);
    writeAdminToken = jwt.sign({ _id: writeAdminId, role: "admin", permissions: ["tickets:write"] }, securityKey);
    bothAdminToken = jwt.sign({ _id: bothAdminId, role: "admin", permissions: ["tickets:read", "tickets:write"] }, securityKey);
    unauthAdminToken = jwt.sign({ _id: unauthAdminId, role: "admin", permissions: ["other:read"] }, securityKey);
    customAdminToken = jwt.sign({ _id: customAdminId, role: "tier1_support" }, securityKey);

    customer1Token = jwt.sign({ _id: customer1Id, role: "customer" }, securityKey);
    customer2Token = jwt.sign({ _id: customer2Id, role: "customer" }, securityKey);
    seller1Token = jwt.sign({ _id: seller1Id, role: "seller" }, securityKey);
    seller2Token = jwt.sign({ _id: seller2Id, role: "seller" }, securityKey);

    // Seed Custom Admin Role in Database (uppercase stored)
    await AdminRole.deleteMany({ roleName: { $regex: /tier1_support/i } });
    await AdminRole.create({
      _id: customRoleId,
      roleName: "tier1_support",
      description: "Tier 1 Support with read-only access",
      permissions: ["tickets:read"]
    });

    // Seed Admins
    await AdminModel.create([
      { _id: superAdminId, firstName: "Super", lastName: "Admin", email: "p0_super@test.com", password: "pwd", role: "super_admin", securityKeyId: new mongoose.Types.ObjectId() },
      { _id: readAdminId, firstName: "Read", lastName: "Admin", email: "p0_read@test.com", password: "pwd", role: "admin", permissions: ["tickets:read"], securityKeyId: new mongoose.Types.ObjectId() },
      { _id: writeAdminId, firstName: "Write", lastName: "Admin", email: "p0_write@test.com", password: "pwd", role: "admin", permissions: ["tickets:write"], securityKeyId: new mongoose.Types.ObjectId() },
      { _id: bothAdminId, firstName: "Both", lastName: "Admin", email: "p0_both@test.com", password: "pwd", role: "admin", permissions: ["tickets:read", "tickets:write"], securityKeyId: new mongoose.Types.ObjectId() },
      { _id: unauthAdminId, firstName: "Unauth", lastName: "Admin", email: "p0_unauth@test.com", password: "pwd", role: "admin", permissions: ["other:read"], securityKeyId: new mongoose.Types.ObjectId() },
      { _id: customAdminId, firstName: "Custom", lastName: "Admin", email: "p0_custom@test.com", password: "pwd", role: "tier1_support", securityKeyId: new mongoose.Types.ObjectId() }
    ]).catch(() => {});

    // Seed Customers with verified contacts
    await CustomerAuth.create([
      { _id: customer1Id, firstName: "C1", lastName: "User", email: "p0_c1@test.com", password: "pwd", securityKeyId: new mongoose.Types.ObjectId() },
      { _id: customer2Id, firstName: "C2", lastName: "User", email: "p0_c2@test.com", password: "pwd", securityKeyId: new mongoose.Types.ObjectId() }
    ]).catch(() => {});

    await CustomerProfile.create([
      { customerId: customer1Id, firstName: "C1", lastName: "User", contact: 9876543210, address: [{ street: "S1", nearBy: "N1", city: "Mumbai", state: "MH", country: "India" }] },
      { customerId: customer2Id, firstName: "C2", lastName: "User", contact: 9123456780, address: [{ street: "S2", nearBy: "N2", city: "Delhi", state: "DL", country: "India" }] }
    ]).catch(() => {});

    // Seed Sellers with authoritative phone numbers
    await SellerModel.create([
      { _id: seller1Id, firstName: "S1", lastName: "Seller", email: "p0_s1@test.com", phone: "9888811111", password: "pwd" },
      { _id: seller2Id, firstName: "S2", lastName: "Seller", email: "p0_s2@test.com", phone: "9888822222", password: "pwd" }
    ]).catch(() => {});

    // Seed Orders
    await OrderModel.create([
      {
        _id: orderId,
        customer: customer1Id,
        paymentMethod: "COD",
        itemsPrice: 200,
        taxPrice: 20,
        shippingPrice: 10,
        totalPrice: 230,
        orderItems: [
          { product: new mongoose.Types.ObjectId(), name: "Item S1", price: 100, quantity: 1, seller: seller1Id },
          { product: new mongoose.Types.ObjectId(), name: "Item S2", price: 100, quantity: 1, seller: seller2Id }
        ],
        shippingAddress: {
          address: "123 Secret Home St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "India"
        }
      },
      {
        _id: orderSellerId,
        customer: customer1Id,
        paymentMethod: "COD",
        itemsPrice: 200,
        taxPrice: 20,
        shippingPrice: 10,
        totalPrice: 230,
        orderItems: [
          { product: new mongoose.Types.ObjectId(), name: "Item S1", price: 100, quantity: 1, seller: seller1Id },
          { product: new mongoose.Types.ObjectId(), name: "Item S2", price: 100, quantity: 1, seller: seller2Id }
        ],
        shippingAddress: {
          address: "123 Secret Home St",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "India"
        }
      }
    ]).catch(() => {});

    // Seed Conversations
    await SupportConversation.create([
      {
        _id: conv1Id,
        customerId: customer1Id,
        customerTypeModel: "customer",
        ticketNumber: "P0-TICKET-001",
        subject: "Customer 1 Issue",
        status: "open",
        orderId: orderId
      },
      {
        _id: conv2Id,
        customerId: customer2Id,
        customerTypeModel: "customer",
        ticketNumber: "P0-TICKET-002",
        subject: "Customer 2 Issue",
        status: "open"
      },
      {
        _id: convSeller2Id,
        customerId: seller2Id,
        customerTypeModel: "seller",
        ticketNumber: "P0-TICKET-003",
        subject: "Seller 2 Ticket with Multi-vendor order",
        status: "open",
        orderId: orderSellerId
      }
    ]).catch(() => {});

    // Seed Call Log
    await SupportCallLog.create({
      _id: callLog1Id,
      conversationId: conv1Id,
      customerId: customer1Id,
      customerTypeModel: "customer",
      phone: "9876543210",
      status: "requested"
    }).catch(() => {});
  }, 30000);

  afterAll(async () => {
    await SupportConversation.deleteMany({ _id: { $in: [conv1Id, conv2Id, convSeller2Id] } });
    await SupportMessage.deleteMany({ conversationId: { $in: [conv1Id, conv2Id, convSeller2Id] } });
    await SupportCallLog.deleteMany({ conversationId: { $in: [conv1Id, conv2Id, convSeller2Id] } });
    await CustomerProfile.deleteMany({ customerId: { $in: [customer1Id, customer2Id] } });
    await CustomerAuth.deleteMany({ _id: { $in: [customer1Id, customer2Id] } });
    await AdminModel.deleteMany({ _id: { $in: [superAdminId, readAdminId, writeAdminId, bothAdminId, unauthAdminId, customAdminId] } });
    await AdminRole.deleteMany({ _id: customRoleId });
    await SellerModel.deleteMany({ _id: { $in: [seller1Id, seller2Id] } });
    await OrderModel.deleteMany({ _id: { $in: [orderId, orderSellerId] } });
  }, 30000);

  // 1 & 2. Callback cannot use arbitrary req.body.phone & uses authenticated account phone
  it("1 & 2. Callback cannot use arbitrary req.body.phone and securely uses authoritative account phone", async () => {
    // Delete existing active callback for conv2Id
    await SupportCallLog.deleteMany({ conversationId: conv2Id });

    // Customer requests callback with spoofed phone in body
    const spoofedPhone = "9990001111";
    const res = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${conv2Id}/callback`)
      .set("Cookie", [`CustomerAccessToken=${customer2Token}`])
      .send({ phone: spoofedPhone, requestedTimeWindow: "MORNING" });

    expect([200, 201]).toContain(res.status);

    const savedLog = await SupportCallLog.findOne({ conversationId: conv2Id });
    expect(savedLog).toBeDefined();
    // Must NOT match spoofed phone from body
    expect(savedLog.phone).not.toBe(spoofedPhone);
    // Must match authoritative phone from CustomerProfile (9123456780)
    expect(savedLog.phone).toBe("9123456780");
  });

  // 3. Unauthorized user cannot read Support conversation
  it("3. Unauthorized user cannot read Support conversation (missing tickets:read)", async () => {
    const res = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${conv1Id}`)
      .set("Cookie", [`AdminAccessToken=${unauthAdminToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Missing tickets:read/i);
  });

  // 4. Unauthorized user cannot send Support message
  it("4. Unauthorized user cannot send Support message (missing tickets:write)", async () => {
    const res = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${conv1Id}/messages`)
      .set("Cookie", [`AdminAccessToken=${readAdminToken}`])
      .send({ body: "Unauthorized message attempt", clientMessageId: "sec-msg-01" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Missing tickets:write/i);
  });

  // 5. Unauthorized user cannot mutate callback status
  it("5. Unauthorized user cannot mutate callback status", async () => {
    const res = await request(app)
      .put(`/api/v1/indiafy/support/callbacks/${callLog1Id}/status`)
      .set("Cookie", [`AdminAccessToken=${unauthAdminToken}`])
      .send({ status: "cancelled" });

    expect(res.status).toBe(403);
  });

  // 6. Unauthorized Socket.IO client cannot join protected Support room
  it("6. Unauthorized Socket.IO client cannot join protected Support room", async () => {
    let handlers = {};
    let emitted = [];
    let roomsJoined = new Set();
    const mockSocket = {
      id: "unauth-sock",
      rooms: new Set(),
      on: (evt, fn) => { handlers[evt] = fn; },
      emit: (evt, payload) => { emitted.push({ evt, payload }); },
      join: (room) => { roomsJoined.add(room); }
    };
    const mockIo = { to: () => ({ emit: () => {} }) };

    const unauthAgent = { _id: unauthAdminId, role: "admin", permissions: ["other:read"] };
    initSupportSocket(mockIo, mockSocket, unauthAgent);

    await handlers["support:conversation:join"]({ conversationId: conv1Id.toString() });

    expect(roomsJoined.has(`support_conversation:${conv1Id}`)).toBe(false);
    const err = emitted.find(e => e.evt === "support:error");
    expect(err).toBeDefined();
    expect(err.payload.code).toBe("SUPPORT_FORBIDDEN");
  });

  // 7. Unauthorized Socket.IO message creation is rejected
  it("7. Unauthorized Socket.IO message creation is rejected", async () => {
    let handlers = {};
    let emitted = [];
    const mockSocket = {
      id: "unauth-msg-sock",
      rooms: new Set([`support_conversation:${conv1Id}`]),
      on: (evt, fn) => { handlers[evt] = fn; },
      emit: (evt, payload) => { emitted.push({ evt, payload }); },
      join: () => {}
    };
    const mockIo = { to: () => ({ emit: () => {} }) };

    const readOnlyAgent = { _id: readAdminId, role: "admin", permissions: ["tickets:read"] };
    initSupportSocket(mockIo, mockSocket, readOnlyAgent);

    await handlers["support:message:send"]({ conversationId: conv1Id.toString(), body: "Test via socket", clientMessageId: "sock-msg-1" });

    const err = emitted.find(e => e.evt === "support:error");
    expect(err).toBeDefined();
    expect(err.payload.code).toBe("SUPPORT_FORBIDDEN");
  });

  // 8. Customer cannot access another customer's conversation (IDOR)
  it("8. Customer cannot access another customer's conversation", async () => {
    const res = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${conv1Id}`)
      .set("Cookie", [`CustomerAccessToken=${customer2Token}`]);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Access denied/i);
  });

  // 9. Seller cannot access another seller's protected Support data
  it("9. Seller cannot access another seller's protected items in multi-vendor order", async () => {
    // Seller 2 cannot access Customer 1's conversation directly
    const deniedRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${conv1Id}`)
      .set("Cookie", [`SellerAccessToken=${seller2Token}`]);
    expect(deniedRes.status).toBe(403);

    // In a multi-vendor order conversation where seller 2 is the participant:
    const allowedRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${convSeller2Id}`)
      .set("Cookie", [`SellerAccessToken=${seller2Token}`]);

    expect(allowedRes.status).toBe(200);
    // Competing seller 1's items are filtered out:
    const items = allowedRes.body.conversation.orderId.orderItems;
    expect(items.length).toBe(1);
    expect(items[0].seller.toString()).toBe(seller2Id.toString());
    expect(items[0].price).toBe(100);
    // Customer's street address is scrubbed:
    expect(allowedRes.body.conversation.orderId.shippingAddress.address).toBeUndefined();
    expect(allowedRes.body.conversation.orderId.shippingAddress.city).toBe("Mumbai");
  });

  // 10. Permission-based access works for allowed users
  it("10. Permission-based access works for allowed users (tickets:read and tickets:write)", async () => {
    // Read works with tickets:read
    const getRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${conv1Id}`)
      .set("Cookie", [`AdminAccessToken=${readAdminToken}`]);

    expect(getRes.status).toBe(200);
    expect(getRes.body.conversation._id).toBe(conv1Id.toString());

    // Write works with tickets:write
    const postRes = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${conv1Id}/messages`)
      .set("Cookie", [`AdminAccessToken=${writeAdminToken}`])
      .send({ body: "Authorized reply from agent", clientMessageId: "auth-msg-01" });

    expect(postRes.status).toBe(201);
    expect(postRes.body.success).toBe(true);
  });

  // 11. SUPER_ADMIN behavior remains correct
  it("11. SUPER_ADMIN wildcard allows reading and writing support resources", async () => {
    const getRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${conv1Id}`)
      .set("Cookie", [`AdminAccessToken=${superAdminToken}`]);

    expect(getRes.status).toBe(200);

    const postRes = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${conv1Id}/messages`)
      .set("Cookie", [`AdminAccessToken=${superAdminToken}`])
      .send({ body: "Super admin response", clientMessageId: "super-msg-01" });

    expect(postRes.status).toBe(201);
  });

  // 12. Custom-role permission behavior works from DB AdminRole
  it("12. Custom-role permission behavior works from database AdminRole model", async () => {
    // customAdminToken has role "tier1_support" which has tickets:read in DB
    const getRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${conv1Id}`)
      .set("Cookie", [`AdminAccessToken=${customAdminToken}`]);

    expect(getRes.status).toBe(200);

    // tier1_support does NOT have tickets:write, so posting message must fail
    const postRes = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${conv1Id}/messages`)
      .set("Cookie", [`AdminAccessToken=${customAdminToken}`])
      .send({ body: "Custom role write attempt", clientMessageId: "custom-msg-01" });

    expect(postRes.status).toBe(403);
    expect(postRes.body.message).toMatch(/Missing tickets:write/i);
  }, 30000);

  // 13. Invalid ObjectIds are rejected
  it("13. Invalid ObjectIds are rejected with 400 validation error", async () => {
    const res = await request(app)
      .get("/api/v1/indiafy/support/conversations/not-a-valid-mongo-id")
      .set("Cookie", [`AdminAccessToken=${superAdminToken}`]);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Validation Failed/i);
  });

  // 14. Invalid status transitions are rejected
  it("14. Invalid status transitions are rejected", async () => {
    const freshConvId = new mongoose.Types.ObjectId();
    const cb = await SupportCallLog.create({
      conversationId: freshConvId,
      customerId: customer1Id,
      customerTypeModel: "customer",
      phone: "9876543210",
      status: "requested"
    });

    // Attempt invalid jump from 'requested' straight to 'connected' (skipping queued/assigned/calling)
    const res = await request(app)
      .put(`/api/v1/indiafy/support/callbacks/${cb._id}/status`)
      .set("Cookie", [`AdminAccessToken=${bothAdminToken}`])
      .send({ status: "connected" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid status transition/i);

    await SupportCallLog.findByIdAndDelete(cb._id);
  });
});
