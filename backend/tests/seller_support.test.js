import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import jwt from "jsonwebtoken";

import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import SupportCallLog from "../models/support/supportCallLog.model.js";
import CustomerAuth from "../models/customers/auth.model.js";
import SellerModel from "../models/sellers/auth.model.js";
import AdminModel from "../models/admins/auth.model.js";
import OrderModel from "../models/orders/order.model.js";
import SupportTicket from "../models/admins/supportTicket.model.js";
import { getCustomerContext, getTicketDetails } from "../services/supportWorkspace.service.js";

describe("Seller Support Flow & customerId Validation Suite", () => {
  const securityKey = process.env.SecurityKey || process.env.JWT_SECRET || "test-key";

  let seller1Id, seller2Id;
  let customer1Id, customer2Id;
  let adminId;
  let seller1Token, seller2Token, seller1BearerToken;
  let customer1Token, customer2Token;
  let adminToken;
  let seller1OrderId;
  let createdSellerConvId;
  let createdCustomerConvId;

  beforeAll(async () => {
    const { databaseConfig } = await import("../config/db.config.js");
    await databaseConfig();

    seller1Id = new mongoose.Types.ObjectId();
    seller2Id = new mongoose.Types.ObjectId();
    customer1Id = new mongoose.Types.ObjectId();
    customer2Id = new mongoose.Types.ObjectId();
    adminId = new mongoose.Types.ObjectId();
    seller1OrderId = new mongoose.Types.ObjectId();

    // Standard tokens matching runtime format:
    // Seller token has { sellerId, role: "Seller" } exactly as issued by seller auth.controllers.js
    seller1Token = jwt.sign({ sellerId: seller1Id, role: "Seller" }, securityKey);
    seller1BearerToken = jwt.sign({ sellerId: seller1Id, role: "Seller" }, securityKey);
    seller2Token = jwt.sign({ sellerId: seller2Id, role: "Seller" }, securityKey);

    customer1Token = jwt.sign({ _id: customer1Id, role: "customer" }, securityKey);
    customer2Token = jwt.sign({ _id: customer2Id, role: "customer" }, securityKey);
    adminToken = jwt.sign({ _id: adminId, role: "admin", permissions: ["tickets:read", "tickets:write"] }, securityKey);

    // Clean up test sellers and customers if left over from previous runs
    await SellerModel.deleteMany({ email: { $in: ["rajesh.seller@test.com", "vikram.seller@test.com"] } });
    await CustomerAuth.deleteMany({ email: { $in: ["aarav.customer@test.com", "priya.customer@test.com"] } });

    // Seed sellers
    await SellerModel.create([
      {
        _id: seller1Id,
        firstName: "Rajesh",
        lastName: "Sharma",
        email: "rajesh.seller@test.com",
        phone: "9876543210",
        businessName: "Sharma Electronics",
        password: "hashedpassword123",
      },
      {
        _id: seller2Id,
        firstName: "Vikram",
        lastName: "Patel",
        email: "vikram.seller@test.com",
        phone: "9876543211",
        businessName: "Patel Traders",
        password: "hashedpassword123",
      },
    ]).catch(() => {});

    // Seed customers
    await CustomerAuth.create([
      {
        _id: customer1Id,
        firstName: "Aarav",
        lastName: "Mehta",
        email: "aarav.customer@test.com",
        password: "hashedpassword123",
        securityKeyId: new mongoose.Types.ObjectId(),
      },
      {
        _id: customer2Id,
        firstName: "Priya",
        lastName: "Kapoor",
        email: "priya.customer@test.com",
        password: "hashedpassword123",
        securityKeyId: new mongoose.Types.ObjectId(),
      },
    ]).catch(() => {});

    // Seed admin
    await AdminModel.create({
      _id: adminId,
      firstName: "Admin",
      lastName: "Support",
      email: "admin.support@test.com",
      password: "hashedpassword123",
      role: "admin",
      permissions: ["tickets:read", "tickets:write"],
      securityKeyId: new mongoose.Types.ObjectId(),
    }).catch(() => {});

    // Seed order containing seller 1 item
    await OrderModel.create({
      _id: seller1OrderId,
      customer: customer1Id,
      paymentMethod: "Online",
      itemsPrice: 500,
      taxPrice: 50,
      shippingPrice: 40,
      totalPrice: 590,
      orderItems: [
        {
          product: new mongoose.Types.ObjectId(),
          name: "LED Monitor",
          price: 500,
          quantity: 1,
          seller: seller1Id,
        },
      ],
      shippingAddress: {
        address: "45 MG Road",
        city: "Gurugram",
        state: "Haryana",
        postalCode: "122001",
        country: "India",
      },
    }).catch(() => {});
  }, 30000);

  afterAll(async () => {
    if (createdSellerConvId) {
      await SupportConversation.deleteOne({ _id: createdSellerConvId });
      await SupportMessage.deleteMany({ conversationId: createdSellerConvId });
      await SupportCallLog.deleteMany({ conversationId: createdSellerConvId });
    }
    if (createdCustomerConvId) {
      await SupportConversation.deleteOne({ _id: createdCustomerConvId });
      await SupportMessage.deleteMany({ conversationId: createdCustomerConvId });
    }
    await SellerModel.deleteMany({ _id: { $in: [seller1Id, seller2Id] } });
    await CustomerAuth.deleteMany({ _id: { $in: [customer1Id, customer2Id] } });
    await AdminModel.deleteOne({ _id: adminId });
    await OrderModel.deleteOne({ _id: seller1OrderId });
  });

  // 1. Authenticated seller can initialize or create a support conversation without customerId missing error
  it("1. Authenticated seller can create a support conversation and does not fail on customerId validation", async () => {
    const res = await request(app)
      .post("/api/v1/indiafy/support/conversations")
      .set("Cookie", [`SellerAccessToken=${seller1Token}`])
      .send({ subject: "Seller payout inquiry" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.conversation).toBeDefined();
    expect(res.body.conversation.ticketNumber).toMatch(/^SUP-/);

    createdSellerConvId = res.body.conversation._id;
  });

  // 2. The conversation records the correct seller identity and requester type
  it("2. The conversation correctly records seller identity and customerTypeModel as 'seller'", async () => {
    const conv = await SupportConversation.findById(createdSellerConvId).lean();
    expect(conv).toBeDefined();
    expect(conv.customerId.toString()).toBe(seller1Id.toString());
    expect(conv.customerTypeModel).toBe("seller");
    expect(["open", "assigned"]).toContain(conv.status);
  });

  // 3. Deduplication prevents duplicate conversation creation when support screen initializes repeatedly
  it("3. Deduplication prevents duplicate active conversations on repeated initialization", async () => {
    const duplicateRes = await request(app)
      .post("/api/v1/indiafy/support/conversations")
      .set("Cookie", [`SellerAccessToken=${seller1Token}`])
      .send({ subject: "Seller payout inquiry" });

    // Returns HTTP 200 with existing active conversation instead of creating duplicate
    expect(duplicateRes.status).toBe(200);
    expect(duplicateRes.body.success).toBe(true);
    expect(duplicateRes.body.conversation._id.toString()).toBe(createdSellerConvId.toString());

    // Verify database count for this seller is still 1
    const count = await SupportConversation.countDocuments({
      customerId: seller1Id,
      customerTypeModel: "seller",
      status: { $in: ["open", "assigned"] },
    });
    expect(count).toBe(1);
  });

  // 4. Authenticated seller can also create/initialize support via Bearer token
  it("4. Authenticated seller using Bearer authorization header can access support conversations", async () => {
    const res = await request(app)
      .get("/api/v1/indiafy/support/conversations")
      .set("Authorization", `Bearer ${seller1BearerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.conversations)).toBe(true);
    expect(res.body.conversations.length).toBeGreaterThanOrEqual(1);
    expect(res.body.conversations[0]._id.toString()).toBe(createdSellerConvId.toString());
  });

  // 5. Customer can still create and access customer support conversations
  it("5. Customer can still create and access customer support conversations independently", async () => {
    const res = await request(app)
      .post("/api/v1/indiafy/support/conversations")
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`])
      .send({ subject: "Customer delivery question" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.conversation.customerTypeModel).toBe("customer");
    expect(res.body.conversation.customerId.toString()).toBe(customer1Id.toString());

    createdCustomerConvId = res.body.conversation._id;

    // Customer can access their own conversation
    const getRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${createdCustomerConvId}`)
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`]);

    expect(getRes.status).toBe(200);
    expect(getRes.body.conversation._id.toString()).toBe(createdCustomerConvId.toString());
  });

  // 6. A seller cannot access another seller's conversations (IDOR protection)
  it("6. A seller cannot access another seller's conversations (IDOR protection)", async () => {
    const res = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${createdSellerConvId}`)
      .set("Cookie", [`SellerAccessToken=${seller2Token}`]);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Access denied/i);

    // Cannot read messages
    const msgRes = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${createdSellerConvId}/messages`)
      .set("Cookie", [`SellerAccessToken=${seller2Token}`]);

    expect(msgRes.status).toBe(403);

    // Cannot send messages
    const sendRes = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${createdSellerConvId}/messages`)
      .set("Cookie", [`SellerAccessToken=${seller2Token}`])
      .send({ body: "Unauthorized message attempt", clientMessageId: "unauth-msg-1" });

    expect(sendRes.status).toBe(403);
  });

  // 7. Customer cannot access a seller's conversation
  it("7. Customer cannot access a seller's conversation", async () => {
    const res = await request(app)
      .get(`/api/v1/indiafy/support/conversations/${createdSellerConvId}`)
      .set("Cookie", [`CustomerAccessToken=${customer1Token}`]);

    expect(res.status).toBe(403);
  });

  // 8. Unauthorized / unauthenticated requests are rejected
  it("8. Unauthorized requests without valid authentication are rejected with 401", async () => {
    const res = await request(app)
      .post("/api/v1/indiafy/support/conversations")
      .send({ subject: "No auth ticket" });

    expect(res.status).toBe(401);
  });

  // 9. Seller can send message in their own conversation
  it("9. Seller can send a message in their own conversation", async () => {
    const res = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${createdSellerConvId}/messages`)
      .set("Cookie", [`SellerAccessToken=${seller1Token}`])
      .send({
        body: "Hello, I need help with my payouts.",
        clientMessageId: "seller1-msg-001",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message.senderType).toBe("seller");
    expect(res.body.message.senderId.toString()).toBe(seller1Id.toString());
  });

  // 10. Seller can request a callback
  it("10. Seller can request a callback using their authoritative seller phone", async () => {
    const res = await request(app)
      .post(`/api/v1/indiafy/support/conversations/${createdSellerConvId}/callback`)
      .set("Cookie", [`SellerAccessToken=${seller1Token}`])
      .send({ requestedTimeWindow: "Morning (9 AM - 12 PM)" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.callback.customerTypeModel).toBe("seller");
    expect(res.body.callback.customerId.toString()).toBe(seller1Id.toString());
    expect(res.body.callback.phone).toBe("9876543210");
  });

  // 11. Admin Help Desk and Support Workspace can retrieve the seller support ticket
  it("11. Admin Help Desk can retrieve seller tickets with correct userType and details", async () => {
    const res = await request(app)
      .get("/api/v1/indiafy/admin/management/tickets")
      .set("Cookie", [`AdminAccessToken=${adminToken}`]);

    expect(res.status).toBe(200);
    const tickets = res.body.data || [];
    const sellerTicket = tickets.find((t) => t._id.toString() === createdSellerConvId.toString());
    expect(sellerTicket).toBeDefined();
    expect(sellerTicket.userType).toBe("seller");
    expect(sellerTicket.userId.toString()).toBe(seller1Id.toString());
  });

  // 12. Support Workspace getCustomerContext resolves seller profile
  it("12. Support Workspace getCustomerContext correctly resolves seller profile and business details", async () => {
    const ticket = await SupportTicket.create({
      ticketNumber: "TCK-SELLER-001",
      userType: "seller",
      userId: seller1Id,
      userTypeModel: "seller",
      customerName: "Rajesh Sharma",
      customerEmail: "rajesh.seller@test.com",
      subject: "Tax Invoice Question",
      description: "Need explanation regarding GST deduction",
      status: "Open",
    });

    const context = await getCustomerContext(ticket._id);
    expect(context).toBeDefined();
    expect(context.customer).toBeDefined();
    expect(context.customer.email).toBe("rajesh.seller@test.com");
    expect(context.customer.name).toBe("Rajesh Sharma");
    expect(context.customer.phone).toBe("9876543210");

    await SupportTicket.deleteOne({ _id: ticket._id });
  });
});
