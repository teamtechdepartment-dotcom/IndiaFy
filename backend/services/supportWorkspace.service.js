import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import SupportTicket from "../models/admins/supportTicket.model.js";
import SupportMember from "../models/support/supportMember.model.js";
import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import SupportCallLog from "../models/support/supportCallLog.model.js";
import CustomerModel from "../models/customers/auth.model.js";
import SellerModel from "../models/sellers/auth.model.js";
import OrderModel from "../models/orders/order.model.js";
import { passwordDecryption } from "../utils/bcrypt.js";
import { queueEmail } from "./emailService.js";
import { getSocketIo, emitSupportEvent } from "../utils/support.socket.js";
import { SUPPORT_CONFIG } from "../config/support.config.js";

// Status mapping helpers
export const mapConversationStatusToTicketStatus = (convStatus) => {
  switch (convStatus) {
    case "open":
      return "Open";
    case "assigned":
      return "Assigned";
    case "in_progress":
      return "In Progress";
    case "waiting_customer":
      return "Waiting";
    case "waiting_agent":
      return "In Progress";
    case "escalated":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return "Open";
  }
};

export const mapTicketStatusToConversationStatus = (ticketStatus) => {
  switch (ticketStatus) {
    case "Open":
      return "open";
    case "Assigned":
      return "assigned";
    case "In Progress":
      return "in_progress";
    case "Waiting":
      return "waiting_customer";
    case "Resolved":
      return "resolved";
    case "Closed":
      return "closed";
    default:
      return "open";
  }
};

// Seamless synchronization helper: keeps SupportConversation and SupportTicket 1-to-1 in sync
export const syncConversationToTicket = async (convDoc) => {
  if (!convDoc) return null;
  const conv = convDoc.toObject ? convDoc.toObject() : convDoc;
  const isSeller = (conv.customerTypeModel || "").toLowerCase() === "seller";

  let customerName = isSeller ? "Seller Partner" : "Customer";
  let customerEmail = "";
  let customerPhone = "";

  if (conv.customerId) {
    if (isSeller) {
      const seller = await SellerModel.findById(conv.customerId).select("firstName lastName email phone storeName").lean();
      if (seller) {
        customerName = `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || seller.storeName || "Seller Partner";
        customerEmail = seller.email || "";
        customerPhone = seller.phone || "";
      }
    } else {
      const customer = await CustomerModel.findById(conv.customerId).select("firstName lastName email phone").lean();
      if (customer) {
        customerName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Customer";
        customerEmail = customer.email || "";
        customerPhone = customer.phone || "";
      }
    }
  }

  // Fetch messages and internal notes from SupportMessage collection
  const msgs = await SupportMessage.find({ conversationId: conv._id }).sort({ createdAt: 1 }).lean();

  const formattedMessages = [];
  const formattedNotes = [];

  for (const m of msgs) {
    if (m.messageType === "internal_note") {
      formattedNotes.push({
        _id: m._id,
        adminId: m.senderId,
        adminName: "Support Staff",
        note: m.body,
        createdAt: m.createdAt,
      });
    } else {
      const isStaff = m.senderType === "admin";
      formattedMessages.push({
        _id: m._id,
        senderType: isStaff ? "admin" : (m.senderType === "seller" ? "seller" : "user"),
        senderId: m.senderId,
        senderName: isStaff ? "Support Staff" : (m.senderType === "seller" ? customerName : "Customer"),
        body: m.body,
        attachments: Array.isArray(m.attachments) ? m.attachments.map((a) => (typeof a === "string" ? a : a.url)) : [],
        createdAt: m.createdAt,
      });
    }
  }

  const status = mapConversationStatusToTicketStatus(conv.status);
  const subject = conv.subject || (isSeller ? "Seller Support Request" : "Customer Support Request");
  const description = formattedMessages.length > 0 ? formattedMessages[0].body : subject;

  // Preserve existing assigned member reference on SupportTicket if conv does not specify one
  let existingTicket = null;
  try {
    existingTicket = await SupportTicket.findById(conv._id).select("assignedMemberId assignedTo assignedMemberName assignedAt queueStatus status").lean();
  } catch (_) {}

  const effectiveAssignedMemberId = conv.assignedAgentId || existingTicket?.assignedMemberId || null;
  const effectiveAssignedTo = conv.assignedAgentId || existingTicket?.assignedTo || null;
  const effectiveAssignedMemberName = existingTicket?.assignedMemberName || "";
  const effectiveAssignedAt = conv.assignedAt || existingTicket?.assignedAt || (effectiveAssignedMemberId ? new Date() : null);
  const effectiveQueueStatus = effectiveAssignedMemberId ? "assigned" : (status === "Resolved" || status === "Closed" ? "completed" : "pending_assignment");

  const updateDoc = {
    ticketNumber: conv.ticketNumber || `TCK-${conv._id.toString().slice(-6).toUpperCase()}`,
    userType: isSeller ? "seller" : "customer",
    userId: conv.customerId,
    userTypeModel: isSeller ? "seller" : "customer",
    subject,
    description,
    status,
    priority: conv.priority || "Medium",
    category: isSeller ? "Seller Support" : "General Inquiry",
    orderId: conv.orderId || null,
    customerName,
    customerEmail,
    customerPhone,
    messages: formattedMessages,
    internalNotes: formattedNotes,
    sourceChannel: conv.channel === "callback" ? "callback" : (isSeller ? "seller_support" : "customer_support"),
    queueStatus: effectiveQueueStatus,
    assignedAt: effectiveAssignedAt,
    assignedMemberId: effectiveAssignedMemberId,
    assignedTo: effectiveAssignedTo,
    assignedMemberName: effectiveAssignedMemberName,
    updatedAt: conv.updatedAt || conv.createdAt || new Date(),
  };

  const ticket = await SupportTicket.findOneAndUpdate(
    { _id: conv._id },
    {
      $set: updateDoc,
      $setOnInsert: {
        _id: conv._id,
        createdAt: conv.createdAt || new Date(),
        auditLogs: [
          {
            action: "TICKET_CREATED",
            performedBy: conv.customerId,
            performedByName: customerName,
            performedByRole: conv.customerTypeModel || "customer",
            details: `Ticket synchronized from ${conv.customerTypeModel || "customer"} conversation`,
            createdAt: conv.createdAt || new Date(),
          },
        ],
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return ticket;
};

export const syncRecentConversations = async () => {
  try {
    const conversations = await SupportConversation.find({})
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
    if (!conversations || conversations.length === 0) return;

    const convIds = conversations.map((c) => c._id);
    const existingTickets = await SupportTicket.find({ _id: { $in: convIds } })
      .select("_id")
      .lean();
    const existingSet = new Set(existingTickets.map((t) => t._id.toString()));

    for (const conv of conversations) {
      if (!existingSet.has(conv._id.toString())) {
        await syncConversationToTicket(conv);
      }
    }
  } catch (err) {
    console.error("Error in syncRecentConversations:", err);
  }
};

// Helper for signing JWT tokens
const signSupportToken = (member) => {
  const secret = process.env.SecurityKey || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT Secret missing in environment");
  return jwt.sign(
    {
      _id: member._id,
      name: member.name,
      email: member.email,
      role: "SupportMember",
      supportRole: member.role,
    },
    secret,
    { expiresIn: "7d" }
  );
};

// ==========================================
// 1. AUTHENTICATION & MEMBER MANAGEMENT
// ==========================================

export const loginSupportMember = async (email, password) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw { status: 400, message: "Email and password are required" };
  }

  const member = await SupportMember.findOne({ email: cleanEmail });
  if (!member) {
    throw { status: 401, message: "Invalid email or password" };
  }

  if (member.status === "inactive") {
    throw { status: 403, message: "Account has been deactivated. Please contact an administrator." };
  }

  if (member.status === "invited") {
    throw { status: 403, message: "Account not activated. Please use the invitation link sent to your email to set your password." };
  }

  const isMatch = await passwordDecryption(password, member.password);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }

  member.lastLoginAt = new Date();
  await member.save();

  const token = signSupportToken(member);

  return {
    token,
    user: {
      _id: member._id,
      name: member.name,
      email: member.email,
      role: "SupportMember",
      supportRole: member.role,
      status: member.status,
      assignedTicketsCount: member.assignedTicketsCount,
    },
  };
};

export const createSupportMember = async ({ name, email, role = "support_member", password = "", adminUser }) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim();
  const cleanPassword = String(password || "").trim();

  if (!cleanEmail || !cleanName) {
    throw { status: 400, message: "Name and email are required" };
  }

  const existing = await SupportMember.findOne({ email: cleanEmail });
  if (existing) {
    throw { status: 409, message: "A support member with this email already exists" };
  }

  const invitationToken = crypto.randomBytes(32).toString("hex");
  const invitationTokenExpires = new Date(Date.now() + 48 * 3600 * 1000); // 48 hours

  const isDirectPassword = Boolean(cleanPassword && cleanPassword.length >= 6);

  const member = await SupportMember.create({
    name: cleanName,
    email: cleanEmail,
    role: ["support_lead", "support_agent"].includes(role) ? role : "support_member",
    status: isDirectPassword ? "active" : "invited",
    password: isDirectPassword ? cleanPassword : "",
    invitationToken: isDirectPassword ? null : invitationToken,
    invitationTokenExpires: isDirectPassword ? null : invitationTokenExpires,
    createdBy: adminUser?._id || null,
  });

  // Construct invite link
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const setupUrl = `${clientUrl}/support-workspace?setupToken=${invitationToken}`;

  // Send invitation email
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #065F46;">Indiafy Support Team Invitation</h2>
      <p>Hello <strong>${cleanName}</strong>,</p>
      <p>You have been invited to join the <strong>Indiafy Customer Support Team</strong> as a <strong>${member.role.replace("_", " ")}</strong>.</p>
      <p>Please click the button below to set up your password and access the Support Workspace:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${setupUrl}" style="background-color: #065F46; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Set Up Your Password
        </a>
      </div>
      <p style="color: #666; font-size: 13px;">This setup link will expire in 48 hours. If you did not expect this invitation, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Indiafy Support Workspace. All rights reserved.</p>
    </div>
  `;

  await queueEmail(cleanEmail, "Invitation to Indiafy Support Workspace", html).catch((err) => {
    console.warn("Failed to queue invitation email:", err.message);
  });

  return {
    member: {
      _id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: member.status,
      createdAt: member.createdAt,
    },
    setupUrl,
    token: invitationToken,
  };
};

export const setupMemberPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw { status: 400, message: "Token and new password are required" };
  }
  if (newPassword.length < 6) {
    throw { status: 400, message: "Password must be at least 6 characters" };
  }

  const member = await SupportMember.findOne({
    invitationToken: token,
    invitationTokenExpires: { $gt: new Date() },
  });

  if (!member) {
    throw { status: 400, message: "Invalid or expired invitation token" };
  }

  member.password = newPassword; // Pre-save hook hashes it
  member.status = "active";
  member.invitationToken = null;
  member.invitationTokenExpires = null;
  member.lastLoginAt = new Date();
  await member.save();

  const authToken = signSupportToken(member);

  return {
    token: authToken,
    user: {
      _id: member._id,
      name: member.name,
      email: member.email,
      role: "SupportMember",
      supportRole: member.role,
      status: member.status,
    },
  };
};

export const listSupportMembers = async () => {
  const members = await SupportMember.find({})
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })
    .lean();

  // Populate dynamic active ticket count for each member
  const counts = await SupportTicket.aggregate([
    {
      $match: {
        status: { $in: ["Open", "Assigned", "In Progress", "Waiting"] },
        assignedMemberId: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$assignedMemberId",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    if (c._id) countMap[c._id.toString()] = c.count;
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  return members.map((m) => ({
    ...m,
    setupUrl: m.invitationToken ? `${clientUrl}/support-workspace?setupToken=${m.invitationToken}` : null,
    assignedTicketsCount: countMap[m._id.toString()] || 0,
  }));
};

export const updateSupportMember = async (id, updates, adminUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: "Invalid member ID" };
  }

  const member = await SupportMember.findById(id);
  if (!member) {
    throw { status: 404, message: "Support member not found" };
  }

  if (updates.name) member.name = String(updates.name).trim();
  if (updates.role && ["support_member", "support_lead", "support_agent"].includes(updates.role)) {
    member.role = updates.role;
  }
  if (updates.status && ["active", "inactive"].includes(updates.status)) {
    member.status = updates.status;
  }

  await member.save();

  // If member activated, process queue to assign waiting tickets
  if (updates.status === "active") {
    try {
      await processSupportQueue();
    } catch (_qErr) {}
  } else if (updates.status === "inactive") {
    // When deactivated, unassign member's active tickets and re-queue
    await SupportTicket.updateMany(
      { assignedMemberId: member._id, status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES } },
      { $set: { assignedMemberId: null, assignedTo: null, assignedMemberName: "", status: "Open", queueStatus: "pending_assignment" } }
    );
    try {
      await processSupportQueue();
    } catch (_qErr) {}
  }

  return {
    _id: member._id,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    updatedAt: member.updatedAt,
  };
};

export const deleteSupportMember = async (id, adminUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: "Invalid member ID" };
  }

  const member = await SupportMember.findById(id);
  if (!member) {
    throw { status: 404, message: "Support member not found" };
  }

  // 1. Unassign all tickets currently assigned to this member and return to queue
  await SupportTicket.updateMany(
    { assignedMemberId: member._id },
    { $set: { assignedMemberId: null, assignedTo: null, assignedStaff: null, assignedMemberName: "", status: "Open", queueStatus: "pending_assignment" } }
  );

  // 2. Unassign from SupportConversation if applicable
  await SupportConversation.updateMany(
    { $or: [{ assignedMemberId: member._id }, { assignedStaff: member._id }, { assignedAgentId: member._id }] },
    { $set: { assignedMemberId: null, assignedStaff: null, assignedAgentId: null, status: "open" } }
  );

  // 3. Delete member permanently from DB
  await SupportMember.deleteOne({ _id: member._id });

  // Trigger queue so remaining active members can pick up newly unassigned tickets
  try {
    await processSupportQueue();
  } catch (_qErr) {}

  return { success: true, deletedMemberId: id };
};

export const resendMemberInvitation = async (id, adminUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { status: 400, message: "Invalid member ID" };
  }

  const member = await SupportMember.findById(id);
  if (!member) {
    throw { status: 404, message: "Support member not found" };
  }

  const invitationToken = crypto.randomBytes(32).toString("hex");
  member.invitationToken = invitationToken;
  member.invitationTokenExpires = new Date(Date.now() + 48 * 3600 * 1000);
  member.status = "invited";
  await member.save();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const setupUrl = `${clientUrl}/support-workspace?setupToken=${invitationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #065F46;">Indiafy Support Team Invitation Resent</h2>
      <p>Hello <strong>${member.name}</strong>,</p>
      <p>Your invitation to the <strong>Indiafy Customer Support Team</strong> has been renewed.</p>
      <p>Please click the button below to set up your password and access the workspace:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${setupUrl}" style="background-color: #065F46; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Set Up Your Password
        </a>
      </div>
      <p style="color: #666; font-size: 13px;">This setup link will expire in 48 hours.</p>
    </div>
  `;

  await queueEmail(member.email, "Your Indiafy Support Workspace Invitation", html).catch(() => {});

  return { success: true, setupUrl };
};

// ==========================================
// AUTOMATED WORKLOAD & QUEUE ENGINE
// ==========================================

export const calculateMemberWorkloads = async () => {
  const capacity = SUPPORT_CONFIG.DEFAULT_MEMBER_CAPACITY;
  const members = await SupportMember.find({})
    .select("_id name email role status lastLoginAt")
    .sort({ createdAt: 1 })
    .lean();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [activeCounts, resolvedCounts, closedCounts, activeTickets] = await Promise.all([
    SupportTicket.aggregate([
      {
        $match: {
          assignedMemberId: { $ne: null },
          status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
        },
      },
      {
        $group: {
          _id: "$assignedMemberId",
          count: { $sum: 1 },
          oldestTicket: { $min: "$createdAt" },
          lastActivity: { $max: "$updatedAt" },
        },
      },
    ]),
    SupportTicket.aggregate([
      {
        $match: {
          assignedMemberId: { $ne: null },
          status: "Resolved",
          resolvedAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: "$assignedMemberId",
          count: { $sum: 1 },
        },
      },
    ]),
    SupportTicket.aggregate([
      {
        $match: {
          assignedMemberId: { $ne: null },
          status: "Closed",
          updatedAt: { $gte: todayStart },
        },
      },
      {
        $group: {
          _id: "$assignedMemberId",
          count: { $sum: 1 },
        },
      },
    ]),
    SupportTicket.find({
      assignedMemberId: { $ne: null },
      status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
    })
      .select("_id ticketNumber subject priority status customerName sourceChannel createdAt assignedAt")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const activeMap = {};
  const oldestMap = {};
  const activityMap = {};
  activeCounts.forEach((c) => {
    if (c._id) {
      const k = c._id.toString();
      activeMap[k] = c.count;
      oldestMap[k] = c.oldestTicket;
      activityMap[k] = c.lastActivity;
    }
  });

  const resolvedMap = {};
  resolvedCounts.forEach((c) => {
    if (c._id) resolvedMap[c._id.toString()] = c.count;
  });

  const closedMap = {};
  closedCounts.forEach((c) => {
    if (c._id) closedMap[c._id.toString()] = c.count;
  });

  return members.map((m) => {
    const k = m._id.toString();
    const activeWorkload = activeMap[k] || 0;
    const isEligible = m.status === "active";
    const availableSlots = isEligible ? Math.max(0, capacity - activeWorkload) : 0;
    const memberTickets = activeTickets.filter((t) => t.assignedMemberId && t.assignedMemberId.toString() === k);

    return {
      _id: m._id,
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
      isEligible,
      activeWorkload,
      capacity,
      maxCapacity: capacity,
      availableSlots,
      resolvedCountToday: resolvedMap[k] || 0,
      closedCountToday: closedMap[k] || 0,
      oldestActiveTicket: oldestMap[k] || null,
      lastActivity: activityMap[k] || m.lastLoginAt || null,
      currentAssignedTickets: memberTickets,
    };
  });
};

export const processSupportQueue = async () => {
  const capacity = SUPPORT_CONFIG.DEFAULT_MEMBER_CAPACITY;
  const priorityOrder = { Critical: 1, High: 2, Medium: 3, Low: 4 };

  // 1. Identify eligible active support members
  const eligibleMembers = await SupportMember.find({ status: "active" })
    .select("_id name email role")
    .lean();

  if (!eligibleMembers.length) {
    return { assignedCount: 0, reason: "No eligible active support members available" };
  }

  // 2. Query eligible queued tickets across all channels (Customer, Seller, and Contact Us)
  const pendingTickets = await SupportTicket.find({
    status: { $nin: SUPPORT_CONFIG.TERMINAL_STATUSES },
    assignedMemberId: null,
    queueStatus: { $in: ["pending_assignment", "retry_required"] },
  })
    .sort({ createdAt: 1 })
    .limit(50)
    .lean();

  if (!pendingTickets.length) {
    return { assignedCount: 0, reason: "No pending queued tickets" };
  }

  // Sort by Priority (Critical > High > Medium > Low) then FIFO (createdAt)
  pendingTickets.sort((a, b) => {
    const pA = priorityOrder[a.priority] || 3;
    const pB = priorityOrder[b.priority] || 3;
    if (pA !== pB) return pA - pB;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  let assignedCount = 0;

  for (const ticket of pendingTickets) {
    // Authoritatively calculate active workloads from persisted records
    const workloads = await SupportTicket.aggregate([
      {
        $match: {
          assignedMemberId: { $in: eligibleMembers.map((m) => m._id) },
          status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
        },
      },
      {
        $group: {
          _id: "$assignedMemberId",
          count: { $sum: 1 },
          lastAssigned: { $max: "$assignedAt" },
        },
      },
    ]);

    const workloadMap = {};
    const lastAssignedMap = {};
    workloads.forEach((w) => {
      if (w._id) {
        workloadMap[w._id.toString()] = w.count;
        lastAssignedMap[w._id.toString()] = w.lastAssigned;
      }
    });

    // Identify members with available capacity
    const availableMembers = eligibleMembers
      .map((m) => {
        const k = m._id.toString();
        return {
          ...m,
          activeWorkload: workloadMap[k] || 0,
          lastAssigned: lastAssignedMap[k] || new Date(0),
        };
      })
      .filter((m) => m.activeWorkload < capacity);

    if (!availableMembers.length) {
      // All eligible members are at capacity. Stop assigning remaining tickets.
      break;
    }

    // Fair workload distribution:
    // 1) Lowest active workload
    // 2) Least recently assigned
    // 3) Deterministic tie-breaker: ascending member _id string
    availableMembers.sort((a, b) => {
      if (a.activeWorkload !== b.activeWorkload) {
        return a.activeWorkload - b.activeWorkload;
      }
      const tA = new Date(a.lastAssigned).getTime();
      const tB = new Date(b.lastAssigned).getTime();
      if (tA !== tB) return tA - tB;
      return a._id.toString().localeCompare(b._id.toString());
    });

    const chosenMember = availableMembers[0];

    // Concurrency protection: Atomically claim the ticket
    const claimed = await SupportTicket.findOneAndUpdate(
      {
        _id: ticket._id,
        assignedMemberId: null,
        status: { $nin: SUPPORT_CONFIG.TERMINAL_STATUSES },
        queueStatus: { $in: ["pending_assignment", "retry_required"] },
      },
      {
        $set: {
          queueStatus: "processing",
        },
      },
      { returnDocument: "after" }
    );

    if (!claimed) {
      // Already claimed by a concurrent worker
      continue;
    }

    // Atomic double-check: verify member has not exceeded capacity in a race condition
    const freshMemberCount = await SupportTicket.countDocuments({
      assignedMemberId: chosenMember._id,
      status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
    });

    if (freshMemberCount >= capacity) {
      // Concurrently saturated, revert claim to pending
      await SupportTicket.updateOne(
        { _id: ticket._id, queueStatus: "processing" },
        { $set: { queueStatus: "pending_assignment" } }
      );
      continue;
    }

    try {
      // Persist assignment metadata and audit event
      claimed.assignedMemberId = chosenMember._id;
      claimed.assignedTo = chosenMember._id;
      claimed.assignedMemberName = chosenMember.name;
      claimed.assignedAt = new Date();
      claimed.status = "Assigned";
      claimed.queueStatus = "assigned";
      claimed.auditLogs.push({
        action: "TICKET_AUTO_ASSIGNED",
        performedByName: "Automated Workload Engine",
        performedByRole: "system",
        details: `Automatically assigned to ${chosenMember.name} (workload ${freshMemberCount + 1}/${capacity})`,
        createdAt: new Date(),
      });

      await claimed.save();

      // Sync to SupportConversation
      try {
        await SupportConversation.updateOne(
          { _id: claimed._id },
          {
            $set: {
              assignedAgentId: chosenMember._id,
              assignedAt: new Date(),
              status: "assigned",
            },
          }
        );
      } catch (_cErr) {}

      // Emit Real-time Socket.IO notifications
      emitSupportEvent("support:ticket:assigned", {
        ticketId: claimed._id,
        ticketNumber: claimed.ticketNumber,
        memberId: chosenMember._id,
        memberName: chosenMember.name,
        status: "Assigned",
      });

      emitSupportEvent(
        "support:member:new_assignment",
        {
          ticketId: claimed._id,
          ticketNumber: claimed.ticketNumber,
          subject: claimed.subject,
          priority: claimed.priority,
        },
        `support_member:${chosenMember._id}`
      );

      assignedCount += 1;
    } catch (saveErr) {
      console.error("[processSupportQueue] Assignment persistence error:", saveErr);
      const attempts = (claimed.queueAttempts || 0) + 1;
      const isExhausted = attempts >= SUPPORT_CONFIG.MAX_QUEUE_RETRIES;
      await SupportTicket.updateOne(
        { _id: ticket._id },
        {
          $set: {
            queueStatus: isExhausted ? "failed" : "retry_required",
            queueAttempts: attempts,
            lastQueueError: saveErr.message || "Assignment persistence error",
          },
        }
      );
    }
  }

  return { assignedCount };
};

export const reconcileSupportQueue = async () => {
  // 1. Recover tickets stuck in "processing" for > 5 minutes
  const stuckThreshold = new Date(Date.now() - 5 * 60 * 1000);
  const stuckReset = await SupportTicket.updateMany(
    {
      queueStatus: "processing",
      updatedAt: { $lt: stuckThreshold },
    },
    {
      $set: { queueStatus: "pending_assignment" },
      $inc: { queueAttempts: 1 },
    }
  );

  // 2. Ensure all unassigned active tickets are pending assignment
  const unassignedReset = await SupportTicket.updateMany(
    {
      assignedMemberId: null,
      status: { $nin: SUPPORT_CONFIG.TERMINAL_STATUSES },
      queueStatus: { $nin: ["pending_assignment", "processing", "retry_required"] },
    },
    {
      $set: { queueStatus: "pending_assignment" },
    }
  );

  // 3. Process the queue
  const result = await processSupportQueue();
  const workloads = await calculateMemberWorkloads();

  return {
    stuckRecovered: stuckReset.modifiedCount,
    recoveredStuckTickets: stuckReset.modifiedCount,
    unassignedReconciled: unassignedReset.modifiedCount,
    assignedCount: result.assignedCount,
    workloads,
  };
};

// ==========================================
// 2. TICKETS LIFECYCLE
// ==========================================

export const createTicket = async ({
  userId,
  userType = "customer",
  customerName,
  customerEmail,
  customerPhone,
  subject,
  description,
  category = "General Inquiry",
  priority = "Medium",
  orderId = null,
  attachments = [],
}) => {
  if (!subject || !description) {
    throw { status: 400, message: "Subject and description are required" };
  }

  const cleanEmail = String(customerEmail || "").trim().toLowerCase();
  const cleanSubject = String(subject).trim();
  const cleanDescription = String(description).trim();

  // Determine user reference
  let resolvedUserId = userId;
  if (!resolvedUserId && cleanEmail) {
    if (userType === "seller") {
      const seller = await SellerModel.findOne({ email: cleanEmail }).select("_id firstName lastName").lean();
      if (seller) {
        resolvedUserId = seller._id;
        if (!customerName) customerName = `${seller.firstName} ${seller.lastName || ""}`.trim();
      }
    } else {
      const customer = await CustomerModel.findOne({ email: cleanEmail }).select("_id firstName lastName").lean();
      if (customer) {
        resolvedUserId = customer._id;
        if (!customerName) customerName = `${customer.firstName} ${customer.lastName || ""}`.trim();
      }
    }
  }

  // Prevent duplicate tickets on rapid retries (within 60 seconds)
  const recentDuplicate = await SupportTicket.findOne({
    customerEmail: cleanEmail,
    subject: cleanSubject,
    description: cleanDescription,
    createdAt: { $gte: new Date(Date.now() - 60000) },
  });
  if (recentDuplicate) {
    return recentDuplicate;
  }

  // Fallback to a system-safe ObjectId if anonymous/guest
  if (!resolvedUserId) {
    resolvedUserId = new mongoose.Types.ObjectId();
  }

  const ticketNumber = `TCK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const initialMessageId = new mongoose.Types.ObjectId();
  const initialMessage = {
    _id: initialMessageId,
    senderType: userType === "seller" ? "seller" : "user",
    senderId: resolvedUserId,
    senderName: customerName || (userType === "seller" ? "Seller Partner" : "Customer"),
    body: cleanDescription,
    attachments: attachments || [],
    createdAt: new Date(),
  };

  // Determine channel and normalize requester type
  const isGuest = userType === "guest" || (!userId && userType !== "seller") || cleanSubject.toLowerCase().includes("contact");
  const effectiveUserType = userType === "seller" ? "seller" : (isGuest ? "guest" : "customer");
  let sourceChannel = "customer_support";
  if (effectiveUserType === "seller") sourceChannel = "seller_support";
  else if (effectiveUserType === "guest") sourceChannel = "contact_us";

  const ticket = await SupportTicket.create({
    ticketNumber,
    userType: effectiveUserType,
    userId: resolvedUserId,
    userTypeModel: effectiveUserType,
    sourceChannel,
    customerName: customerName || (effectiveUserType === "seller" ? "Seller Partner" : (isGuest ? "Visitor" : "Customer")),
    customerEmail: cleanEmail,
    customerPhone: customerPhone || "",
    subject: cleanSubject,
    description: cleanDescription,
    category,
    priority: ["Low", "Medium", "High", "Critical"].includes(priority) ? priority : "Medium",
    status: "Open",
    queueStatus: "pending_assignment",
    assignedMemberId: null,
    assignedTo: null,
    orderId: orderId && mongoose.Types.ObjectId.isValid(orderId) ? orderId : null,
    messages: [initialMessage],
    auditLogs: [
      {
        action: "TICKET_CREATED",
        performedBy: resolvedUserId,
        performedByName: customerName || (isGuest ? "Visitor" : "Customer"),
        performedByRole: effectiveUserType,
        details: `Ticket created with subject: ${cleanSubject} via ${sourceChannel}`,
        createdAt: new Date(),
      },
    ],
  });

  // Create matching SupportConversation and SupportMessage with identical _id for 1-to-1 sync
  try {
    const conv = await SupportConversation.create({
      _id: ticket._id,
      ticketNumber,
      customerId: resolvedUserId,
      customerTypeModel: effectiveUserType === "seller" ? "seller" : "customer",
      orderId: orderId && mongoose.Types.ObjectId.isValid(orderId) ? orderId : null,
      subject: cleanSubject,
      status: "open",
      priority: ["Low", "Medium", "High", "Critical"].includes(priority) ? priority : "Medium",
      lastMessageAt: new Date(),
      messageCount: 1,
    });
    const clientMsgId = `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const msg = await SupportMessage.create({
      _id: initialMessageId,
      conversationId: ticket._id,
      senderId: resolvedUserId,
      senderType: effectiveUserType === "seller" ? "seller" : "customer",
      messageType: "customer",
      body: cleanDescription,
      attachments: attachments ? attachments.map((a) => (typeof a === "string" ? { url: a } : a)) : [],
      clientMessageId: clientMsgId,
    });
    conv.lastMessageId = msg._id;
    await conv.save();
  } catch (_convErr) {
    console.warn("Could not create matching SupportConversation for ticket:", _convErr.message);
  }

  // Auto-assignment engine triggers reliably for all incoming tickets (Customer, Seller, and Contact Us)
  try {
    await processSupportQueue();
  } catch (_qErr) {
    console.warn("Auto-assignment engine error on ticket creation:", _qErr.message);
  }

  const assignedTicket = await SupportTicket.findById(ticket._id)
    .populate("assignedMemberId", "name email role")
    .populate("assignedTo", "name email role")
    .lean();

  return assignedTicket || ticket;
};

export const listTickets = async ({
  search,
  status,
  category,
  priority,
  assignedTo,
  page = 1,
  limit = 25,
  user,
}) => {
  // Sync recent conversations so seller conversations appear seamlessly as tickets
  await syncRecentConversations();

  const query = {};

  if (status && status !== "all") {
    // Standardize status queries
    const s = String(status).toLowerCase();
    if (s === "open") query.status = "Open";
    else if (s === "assigned") query.status = "Assigned";
    else if (s.includes("progress")) query.status = "In Progress";
    else if (s === "waiting") query.status = "Waiting";
    else if (s === "resolved") query.status = "Resolved";
    else if (s === "closed") query.status = "Closed";
    else query.status = status;
  }

  if (category && category !== "all") {
    query.category = category;
  }

  if (priority && priority !== "all") {
    query.priority = priority;
  }

  if (assignedTo) {
    if (assignedTo === "unassigned") {
      query.assignedMemberId = null;
      query.assignedTo = null;
    } else if (assignedTo === "me" && user?._id) {
      query.$or = [
        { assignedMemberId: user._id },
        { assignedTo: user._id },
      ];
    } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.$or = [
        { assignedMemberId: assignedTo },
        { assignedTo: assignedTo },
      ];
    }
  }

  if (search) {
    const cleanSearch = String(search).trim();
    const regex = new RegExp(cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { ticketNumber: regex },
      { subject: regex },
      { customerEmail: regex },
      { customerName: regex },
      { description: regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 25));
  const skip = (pageNum - 1) * pageSize;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("assignedMemberId", "name email role")
      .populate("assignedTo", "name email role")
      .populate("orderId", "_id orderNumber orderStatus totalAmount createdAt")
      .lean(),
    SupportTicket.countDocuments(query),
  ]);

  return {
    tickets,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / pageSize),
    limit: pageSize,
  };
};

export const getTicketDetails = async (ticketId, user) => {
  let ticket = null;
  if (mongoose.Types.ObjectId.isValid(ticketId)) {
    ticket = await SupportTicket.findById(ticketId)
      .populate("assignedMemberId", "name email role")
      .populate("assignedTo", "name email role")
      .populate("orderId")
      .lean();

    if (!ticket) {
      const conv = await SupportConversation.findById(ticketId);
      if (conv) {
        await syncConversationToTicket(conv);
        ticket = await SupportTicket.findById(ticketId)
          .populate("assignedMemberId", "name email role")
          .populate("assignedTo", "name email role")
          .populate("orderId")
          .lean();
      }
    }
  }
  if (!ticket) {
    ticket = await SupportTicket.findOne({ ticketNumber: ticketId })
      .populate("assignedMemberId", "name email role")
      .populate("assignedTo", "name email role")
      .populate("orderId")
      .lean();
  }

  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  // Authorization check: If customer/seller, must own the ticket and MUST NOT see internal notes!
  const userRole = (user?.role || "").toLowerCase();
  const isSupportOrAdmin =
    userRole === "supportmember" ||
    userRole === "support_member" ||
    userRole === "support_lead" ||
    userRole === "support_agent" ||
    userRole === "admin" ||
    userRole === "super_admin";

  if (!isSupportOrAdmin) {
    const principalId = (user?._id || user?.sellerId || user?.id || "").toString();
    if (!principalId || !ticket.userId || ticket.userId.toString() !== principalId) {
      throw { status: 403, message: "Unauthorized access to this ticket" };
    }
    // Strip internal notes for customers / sellers
    ticket.internalNotes = [];
  }

  return ticket;
};

export const assignTicket = async (ticketId, memberId, actor) => {
  let ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      ticket = await syncConversationToTicket(conv);
    }
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  let memberName = "Unassigned";
  let targetMemberId = null;

  if (memberId && mongoose.Types.ObjectId.isValid(memberId)) {
    const member = await SupportMember.findById(memberId);
    if (!member) {
      throw { status: 404, message: "Support member not found" };
    }
    if (member.status !== "active") {
      throw { status: 400, message: "Cannot assign ticket to inactive or unverified support member" };
    }

    const isAlreadyAssignedToThisMember = ticket.assignedMemberId && ticket.assignedMemberId.toString() === member._id.toString();
    if (!isAlreadyAssignedToThisMember) {
      // Enforce configured capacity (default 3)
      const currentMemberWorkload = await SupportTicket.countDocuments({
        assignedMemberId: member._id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
        _id: { $ne: ticket._id },
      });

      if (currentMemberWorkload >= SUPPORT_CONFIG.DEFAULT_MEMBER_CAPACITY) {
        throw {
          status: 400,
          message: `Support member "${member.name}" has reached maximum active capacity (${SUPPORT_CONFIG.DEFAULT_MEMBER_CAPACITY} tickets)`,
        };
      }
    }

    targetMemberId = member._id;
    memberName = member.name;
    ticket.assignedMemberId = targetMemberId;
    ticket.assignedTo = targetMemberId;
    ticket.assignedMemberName = memberName;
    ticket.assignedAt = new Date();
    ticket.queueStatus = "assigned";
    if (ticket.status === "Open" || ticket.status === "Reopened") {
      ticket.status = "Assigned";
    }
  } else {
    // Unassigning ticket
    ticket.assignedMemberId = null;
    ticket.assignedTo = null;
    ticket.assignedMemberName = "";
    ticket.assignedAt = null;
    ticket.status = "Open";
    ticket.queueStatus = "pending_assignment";
  }

  ticket.auditLogs.push({
    action: "TICKET_ASSIGNED",
    performedBy: actor?._id,
    performedByName: actor?.name || actor?.firstName || "Staff",
    performedByRole: actor?.role || "support",
    details: targetMemberId ? `Assigned to ${memberName}` : "Ticket unassigned",
    createdAt: new Date(),
  });

  await ticket.save();

  // Also sync assignment to SupportConversation if present
  try {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      conv.assignedAgentId = targetMemberId;
      if (targetMemberId && conv.status === "open") {
        conv.status = "assigned";
      } else if (!targetMemberId && conv.status === "assigned") {
        conv.status = "open";
      }
      await conv.save();
    }
  } catch (_cErr) {}

  // If ticket unassigned, trigger queue engine so an eligible member can pick it up
  if (!targetMemberId) {
    try {
      await processSupportQueue();
    } catch (_qErr) {}
  }

  // Socket notification
  emitSupportEvent("support:ticket:assigned", {
    ticketId: ticket._id,
    ticketNumber: ticket.ticketNumber,
    memberId: targetMemberId,
    memberName,
    status: ticket.status,
  });

  return ticket;
};

export const updateTicketProperties = async (ticketId, { status, priority, category }, actor) => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  const changes = [];
  if (status && ["Open", "Assigned", "In Progress", "Waiting", "Resolved", "Closed", "Reopened"].includes(status)) {
    changes.push(`status: ${ticket.status} -> ${status}`);
    ticket.status = status;
    if (status === "Resolved") {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = actor?._id;
      ticket.queueStatus = "completed";
    } else if (status === "Closed") {
      ticket.closedAt = new Date();
      ticket.closedBy = actor?._id;
      ticket.queueStatus = "completed";
    }
  }

  if (priority && ["Low", "Medium", "High", "Critical"].includes(priority)) {
    changes.push(`priority: ${ticket.priority} -> ${priority}`);
    ticket.priority = priority;
  }

  if (category) {
    changes.push(`category: ${ticket.category} -> ${category}`);
    ticket.category = category;
  }

  if (changes.length > 0) {
    ticket.auditLogs.push({
      action: "TICKET_UPDATED",
      performedBy: actor?._id,
      performedByName: actor?.name || actor?.firstName || "Staff",
      performedByRole: actor?.role || "support",
      details: changes.join(", "),
      createdAt: new Date(),
    });
  }

  await ticket.save();

  // Sync status to SupportConversation
  try {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      if (status === "Closed") {
        conv.status = "closed";
        conv.closedAt = new Date();
      } else if (status === "Resolved") {
        conv.status = "resolved";
        conv.resolvedAt = new Date();
      } else if (status) {
        conv.status = mapTicketStatusToConversationStatus(status);
      }
      await conv.save();
    }
  } catch (_cErr) {}

  // If status changed to a terminal state (Resolved or Closed), refill freed slot
  if (status === "Resolved" || status === "Closed") {
    try {
      await processSupportQueue();
    } catch (_qErr) {}
  }

  return ticket;
};

export const closeTicket = async (ticketId, reason = "", actor) => {
  let ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      ticket = await syncConversationToTicket(conv);
    }
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  ticket.status = "Closed";
  ticket.queueStatus = "completed";
  ticket.closedAt = new Date();
  ticket.closedBy = actor?._id;

  ticket.auditLogs.push({
    action: "TICKET_CLOSED",
    performedBy: actor?._id,
    performedByName: actor?.name || actor?.firstName || "Staff",
    performedByRole: actor?.role || "support",
    details: reason ? `Ticket closed: ${reason}` : "Ticket marked as closed",
    createdAt: new Date(),
  });

  await ticket.save();

  // Sync to SupportConversation if present
  try {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      conv.status = "closed";
      conv.closedAt = new Date();
      await conv.save();
    }
  } catch (_cErr) {}

  // Automatic slot refill: closing frees capacity for this member and triggers next queued ticket
  try {
    await processSupportQueue();
  } catch (_qErr) {
    console.warn("Queue refill error on close:", _qErr.message);
  }

  // Real-time broadcast
  emitSupportEvent("support:ticket:closed", {
    ticketId: ticket._id,
    ticketNumber: ticket.ticketNumber,
    closedBy: actor?._id,
    closedAt: ticket.closedAt,
  });

  return ticket;
};

export const resolveTicket = async (ticketId, resolutionNotes = "", actor) => {
  let ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      ticket = await syncConversationToTicket(conv);
    }
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  ticket.status = "Resolved";
  ticket.queueStatus = "completed";
  ticket.resolutionNotes = resolutionNotes;
  ticket.resolvedAt = new Date();
  ticket.resolvedBy = actor?._id;

  ticket.auditLogs.push({
    action: "TICKET_RESOLVED",
    performedBy: actor?._id,
    performedByName: actor?.name || actor?.firstName || "Staff",
    performedByRole: actor?.role || "support",
    details: resolutionNotes ? `Resolution: ${resolutionNotes}` : "Marked as resolved",
    createdAt: new Date(),
  });

  await ticket.save();

  // Sync to SupportConversation if present
  try {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      conv.status = "resolved";
      conv.resolvedAt = new Date();
      await conv.save();
    }
  } catch (_cErr) {}

  // Automatic slot refill: resolving frees capacity for this member and triggers next queued ticket
  try {
    await processSupportQueue();
  } catch (_qErr) {
    console.warn("Queue refill error on resolve:", _qErr.message);
  }

  // Real-time broadcast
  emitSupportEvent("support:ticket:resolved", {
    ticketId: ticket._id,
    ticketNumber: ticket.ticketNumber,
    resolvedBy: actor?._id,
  });

  // Send email notification to customer if email is available
  if (ticket.customerEmail) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #065F46;">Your Indiafy Support Ticket Has Been Resolved</h2>
        <p>Hello <strong>${ticket.customerName || "Customer"}</strong>,</p>
        <p>Your support ticket <strong>#${ticket.ticketNumber}</strong> ("${ticket.subject}") has been marked as <strong>Resolved</strong>.</p>
        ${resolutionNotes ? `<p><strong>Resolution Details:</strong><br/>${resolutionNotes}</p>` : ""}
        <p>If you still have questions or need further assistance, you can reply directly to reopen the ticket.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Indiafy Support.</p>
      </div>
    `;
    queueEmail(ticket.customerEmail, `Resolved: Ticket #${ticket.ticketNumber}`, html).catch(() => {});
  }

  return ticket;
};

export const reopenTicket = async (ticketId, reason = "", actor) => {
  let ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      ticket = await syncConversationToTicket(conv);
    }
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  // Capacity policy on reopening: Reopened tickets consume active capacity.
  // Verify if assigned member has available capacity (< 3) and is active.
  let keepAssigned = false;
  if (ticket.assignedMemberId) {
    const member = await SupportMember.findById(ticket.assignedMemberId).lean();
    if (member && member.status === "active") {
      const activeWorkload = await SupportTicket.countDocuments({
        assignedMemberId: member._id,
        status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
        _id: { $ne: ticket._id },
      });
      if (activeWorkload < SUPPORT_CONFIG.DEFAULT_MEMBER_CAPACITY) {
        keepAssigned = true;
      }
    }
  }

  ticket.status = "In Progress";
  if (keepAssigned) {
    ticket.queueStatus = "assigned";
  } else {
    // If original member is at capacity or inactive: unassign and queue for fair auto-assignment
    ticket.assignedMemberId = null;
    ticket.assignedTo = null;
    ticket.assignedMemberName = "";
    ticket.assignedAt = null;
    ticket.queueStatus = "pending_assignment";
  }

  ticket.reopenedAt = new Date();
  ticket.reopenReason = reason;

  ticket.auditLogs.push({
    action: "TICKET_REOPENED",
    performedBy: actor?._id,
    performedByName: actor?.name || actor?.firstName || "Staff",
    performedByRole: actor?.role || "support",
    details: reason
      ? `Reopened: ${reason}${!keepAssigned ? " (re-queued for assignment due to capacity limit)" : ""}`
      : `Ticket reopened${!keepAssigned ? " (re-queued for assignment due to capacity limit)" : ""}`,
    createdAt: new Date(),
  });

  await ticket.save();

  // Sync to SupportConversation if present
  try {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      conv.status = "in_progress";
      conv.assignedAgentId = ticket.assignedMemberId;
      await conv.save();
    }
  } catch (_cErr) {}

  // If re-queued, process queue immediately to assign to next available member
  if (!keepAssigned) {
    try {
      await processSupportQueue();
    } catch (_qErr) {}
  }

  emitSupportEvent("support:ticket:reopened", {
    ticketId: ticket._id,
    ticketNumber: ticket.ticketNumber,
    assignedMemberId: ticket.assignedMemberId,
  });

  return ticket;
};

// ==========================================
// 3. CONVERSATIONS & INTERNAL NOTES
// ==========================================

export const addTicketMessage = async (ticketId, actor, { body, attachments = [] }) => {
  if (!body || !String(body).trim()) {
    throw { status: 400, message: "Message body cannot be empty" };
  }

  let ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      ticket = await syncConversationToTicket(conv);
    }
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  const isStaff =
    actor?.role === "SupportMember" ||
    actor?.role === "ADMIN" ||
    actor?.role === "Admin" ||
    actor?.role === "super_admin";

  const senderType = isStaff ? "admin" : (ticket.userType === "seller" ? "seller" : "user");
  const senderName = isStaff
    ? actor?.name || `${actor?.firstName || ""} ${actor?.lastName || ""}`.trim() || "Support Staff"
    : ticket.customerName || (ticket.userType === "seller" ? "Seller Partner" : "Customer");

  const message = {
    senderType,
    senderId: actor?._id,
    senderName,
    body: String(body).trim(),
    attachments: Array.isArray(attachments) ? attachments : [],
  };

  ticket.messages.push(message);

  if (!ticket.assignedMemberId) {
    ticket.status = "Open";
    ticket.queueStatus = "pending_assignment";
  } else if (isStaff) {
    ticket.status = "Waiting"; // Waiting on customer
  } else {
    ticket.status = "In Progress"; // Customer/Seller replied, agent needs to act
  }

  await ticket.save();

  // If this ticket corresponds to a SupportConversation, create SupportMessage and broadcast via socket
  try {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      const clientMessageId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const suppMsg = await SupportMessage.create({
        conversationId: conv._id,
        senderId: actor?._id,
        senderType: isStaff ? "admin" : (ticket.userType === "seller" ? "seller" : "customer"),
        messageType: "customer",
        body: String(body).trim(),
        attachments: Array.isArray(attachments) ? attachments.map((a) => (typeof a === "string" ? { url: a } : a)) : [],
        clientMessageId,
      });

      conv.lastMessageAt = new Date();
      conv.lastMessageId = suppMsg._id;
      conv.messageCount += 1;
      conv.status = isStaff ? "waiting_customer" : "waiting_agent";
      await conv.save();

      const io = getSocketIo();
      if (io) {
        const roomName = `support_conversation:${conv._id}`;
        io.to(roomName).emit("support:message:new", { message: suppMsg, isDuplicate: false });
      }
    }
  } catch (_convMsgErr) {
    console.error("Error creating SupportMessage from addTicketMessage:", _convMsgErr);
  }

  // If staff replied, notify customer
  if (isStaff && ticket.customerEmail) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #065F46;">New Reply on Ticket #${ticket.ticketNumber}</h2>
        <p>Hello <strong>${ticket.customerName || "Customer"}</strong>,</p>
        <p>Our support team has posted a reply on your ticket <strong>"${ticket.subject}"</strong>:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #065F46; margin: 15px 0;">
          <p style="margin: 0; color: #333;">${body}</p>
        </div>
        <p>You can view and reply to this message directly in your Indiafy account.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Indiafy Support.</p>
      </div>
    `;
    queueEmail(ticket.customerEmail, `Update on Ticket #${ticket.ticketNumber}`, html).catch(() => {});
  }

  return message;
};

export const addInternalNote = async (ticketId, actor, noteText) => {
  if (!noteText || !String(noteText).trim()) {
    throw { status: 400, message: "Note text cannot be empty" };
  }

  const isStaff =
    actor?.role === "SupportMember" ||
    actor?.role === "ADMIN" ||
    actor?.role === "Admin" ||
    actor?.role === "super_admin";

  if (!isStaff) {
    throw { status: 403, message: "Only support staff can create internal notes" };
  }

  let ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      ticket = await syncConversationToTicket(conv);
    }
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  const staffName = actor?.name || `${actor?.firstName || ""} ${actor?.lastName || ""}`.trim() || "Support Staff";

  const note = {
    adminId: actor?._id,
    adminName: staffName,
    note: String(noteText).trim(),
    createdAt: new Date(),
  };

  ticket.internalNotes.push(note);

  ticket.auditLogs.push({
    action: "INTERNAL_NOTE_ADDED",
    performedBy: actor?._id,
    performedByName: staffName,
    performedByRole: actor?.role || "support",
    details: "Internal staff note recorded",
    createdAt: new Date(),
  });

  await ticket.save();

  // If conversation exists, record internal note in SupportMessage
  try {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      const clientMessageId = `ws-note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const noteMsg = await SupportMessage.create({
        conversationId: conv._id,
        senderId: actor?._id,
        senderType: "admin",
        messageType: "internal_note",
        body: String(noteText).trim(),
        clientMessageId,
      });

      const io = getSocketIo();
      if (io) {
        const roomName = `support_conversation:${conv._id}`;
        io.to(`${roomName}:agents`).emit("support:message:new", { message: noteMsg, isDuplicate: false });
      }
    }
  } catch (_noteErr) {
    console.error("Error creating internal note SupportMessage:", _noteErr);
  }

  return note;
};

// ==========================================
// 4. CUSTOMER CONTEXT & DASHBOARD
// ==========================================

export const getCustomerContext = async (ticketId) => {
  let ticket = await SupportTicket.findById(ticketId).lean();
  if (!ticket) {
    const conv = await SupportConversation.findById(ticketId).lean();
    if (conv) {
      await syncConversationToTicket(conv);
      ticket = await SupportTicket.findById(ticketId).lean();
    }
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  let customer = null;
  if (ticket.userId && mongoose.Types.ObjectId.isValid(ticket.userId)) {
    if (ticket.userType === "seller") {
      const seller = await SellerModel.findById(ticket.userId)
        .select("firstName lastName email isEmailVerified status createdAt phone")
        .lean();
      if (seller) {
        customer = {
          _id: seller._id,
          name: `${seller.firstName} ${seller.lastName || ""}`.trim(),
          email: seller.email,
          phone: seller.phone,
          isEmailVerified: seller.isEmailVerified,
          isBlocked: seller.status === "blocked" || seller.status === "suspended",
          memberSince: seller.createdAt,
        };
      }
    } else {
      customer = await CustomerModel.findById(ticket.userId)
        .select("firstName lastName email isEmailVerified isBlocked createdAt")
        .lean();
    }
  }

  if (!customer && ticket.customerEmail) {
    if (ticket.userType === "seller") {
      const seller = await SellerModel.findOne({ email: ticket.customerEmail })
        .select("firstName lastName email isEmailVerified status createdAt phone")
        .lean();
      if (seller) {
        customer = {
          _id: seller._id,
          name: `${seller.firstName} ${seller.lastName || ""}`.trim(),
          email: seller.email,
          phone: seller.phone,
          isEmailVerified: seller.isEmailVerified,
          isBlocked: seller.status === "blocked" || seller.status === "suspended",
          memberSince: seller.createdAt,
        };
      }
    } else {
      customer = await CustomerModel.findOne({ email: ticket.customerEmail })
        .select("firstName lastName email isEmailVerified isBlocked createdAt")
        .lean();
    }
  }

  // Safe minimal customer info
  const safeCustomer = customer
    ? {
        _id: customer._id,
        name: customer.name || `${customer.firstName} ${customer.lastName || ""}`.trim(),
        email: customer.email,
        phone: customer.phone || "N/A",
        isEmailVerified: customer.isEmailVerified,
        isBlocked: customer.isBlocked,
        memberSince: customer.memberSince || customer.createdAt,
      }
    : {
        name: ticket.customerName || (ticket.userType === "seller" ? "Seller Partner" : "Customer"),
        email: ticket.customerEmail || "N/A",
        phone: ticket.customerPhone || "N/A",
        isEmailVerified: false,
        memberSince: ticket.createdAt,
      };

  // Recent orders query with strict data minimization
  let recentOrders = [];
  const customerId = customer?._id || (ticket.userType === "customer" ? ticket.userId : null);

  if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
    recentOrders = await OrderModel.find({ customerId })
      .select("orderNumber orderStatus paymentStatus totalAmount createdAt items")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  } else if (ticket.userType === "seller" && ticket.userId && mongoose.Types.ObjectId.isValid(ticket.userId)) {
    recentOrders = await OrderModel.find({ "orderItems.seller": ticket.userId })
      .select("orderNumber orderStatus paymentStatus totalAmount createdAt items")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  // Count past tickets
  const pastTicketsCount = await SupportTicket.countDocuments({
    $or: [
      { userId: customerId },
      { customerEmail: ticket.customerEmail },
    ],
    _id: { $ne: ticket._id },
  });

  return {
    customer: safeCustomer,
    recentOrders: recentOrders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber || o._id.toString().slice(-8).toUpperCase(),
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      itemCount: o.items?.length || 0,
    })),
    pastTicketsCount,
    ticketSummary: {
      _id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt,
      orderId: ticket.orderId,
    },
  };
};

export const getDashboardMetrics = async (user) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    total,
    open,
    assigned,
    inProgress,
    waiting,
    resolved,
    closed,
    reopened,
    unassigned,
    highPriority,
    today,
    last7Days,
    last30Days,
  ] = await Promise.all([
    SupportTicket.countDocuments({}),
    SupportTicket.countDocuments({ status: "Open" }),
    SupportTicket.countDocuments({ status: "Assigned" }),
    SupportTicket.countDocuments({ status: "In Progress" }),
    SupportTicket.countDocuments({ status: "Waiting" }),
    SupportTicket.countDocuments({ status: "Resolved" }),
    SupportTicket.countDocuments({ status: "Closed" }),
    SupportTicket.countDocuments({ $or: [{ status: "Reopened" }, { reopenedAt: { $ne: null } }] }),
    SupportTicket.countDocuments({ assignedMemberId: null, status: { $nin: ["Resolved", "Closed"] } }),
    SupportTicket.countDocuments({ priority: { $in: ["High", "Critical"] }, status: { $nin: ["Resolved", "Closed"] } }),
    SupportTicket.countDocuments({ createdAt: { $gte: todayStart } }),
    SupportTicket.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    SupportTicket.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  let assignedToMe = 0;
  if (user?._id) {
    assignedToMe = await SupportTicket.countDocuments({
      status: { $in: SUPPORT_CONFIG.ACTIVE_STATUSES },
      $or: [{ assignedMemberId: user._id }, { assignedTo: user._id }],
    });
  }

  // Category breakdown
  const categoryStats = await SupportTicket.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const capacity = SUPPORT_CONFIG.DEFAULT_MEMBER_CAPACITY;

  return {
    total,
    open,
    assigned,
    inProgress,
    waiting,
    resolved,
    closed,
    reopened,
    unassigned,
    highPriority,
    today,
    last7Days,
    last30Days,
    capacity,
    assignedToMe,
    availableSlots: Math.max(0, capacity - assignedToMe),
    categories: categoryStats.map((c) => ({
      category: c._id || "General Inquiry",
      count: c.count,
    })),
  };
};

export const getTicketAuditLog = async (ticketId) => {
  const ticket = await SupportTicket.findById(ticketId).select("auditLogs ticketNumber").lean();
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }
  return {
    ticketNumber: ticket.ticketNumber,
    auditLogs: ticket.auditLogs || [],
  };
};

export const uploadAttachmentService = async ({ ticketId, user, file }) => {
  if (!file) {
    throw { status: 400, message: "No file provided" };
  }

  // 1. Size check: 5MB max
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw { status: 400, message: "Attachment exceeds maximum size of 5MB" };
  }

  // 2. MIME type check
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw { status: 400, message: "Invalid file type. Only JPEG, PNG, WEBP, and PDF files are allowed" };
  }

  // 3. Extension check: reject executable or malicious extensions
  const forbiddenExts = [
    ".exe", ".bat", ".cmd", ".sh", ".php", ".js", ".mjs", ".html", ".htm",
    ".py", ".pl", ".rb", ".jar", ".vbs", ".scr", ".pif", ".svg"
  ];
  const origName = (file.originalname || "").toLowerCase();
  for (const ext of forbiddenExts) {
    if (origName.endsWith(ext)) {
      throw { status: 400, message: "Executable or malicious file types are strictly rejected" };
    }
  }

  // 4. Ticket verification and authorization
  let ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    const conv = await SupportConversation.findById(ticketId);
    if (conv) {
      ticket = await syncConversationToTicket(conv);
    }
  }
  if (!ticket) {
    throw { status: 404, message: "Ticket not found" };
  }

  const role = (user?.role || "").toLowerCase();
  const isStaff =
    role === "supportmember" ||
    role === "support_member" ||
    role === "support_lead" ||
    role === "support_agent" ||
    role === "admin" ||
    role === "super_admin";

  if (!isStaff) {
    const principalId = (user?._id || user?.sellerId || user?.id || "").toString();
    if (!principalId || !ticket.userId || ticket.userId.toString() !== principalId) {
      throw { status: 403, message: "Unauthorized access to this ticket" };
    }
  }

  // 5. Upload to Cloudinary or secure storage reference
  let url = "";
  const attachmentId = "att-" + crypto.randomBytes(8).toString("hex");

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      const { uploadBuffer } = await import("../utils/cloudinary.js");
      url = await uploadBuffer(file.buffer, file.mimetype, "support-attachments");
    } catch (cErr) {
      console.warn("Cloudinary upload failed, falling back to secure URL reference:", cErr.message);
      url = `https://storage.indiafy.com/support/attachments/${attachmentId}-${encodeURIComponent(file.originalname)}`;
    }
  } else {
    url = `https://storage.indiafy.com/support/attachments/${attachmentId}-${encodeURIComponent(file.originalname)}`;
  }

  return {
    attachmentId,
    url,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    ticketId: ticket._id,
    uploadedBy: user?._id || user?.sellerId,
    uploadedByRole: role,
    createdAt: new Date(),
  };
};

export const deleteTicketPermanently = async (ticketId, actor) => {
  const ticket = await SupportTicket.findById(ticketId);
  const conv = await SupportConversation.findById(ticketId);

  if (!ticket && !conv) {
    throw { status: 404, message: "Ticket not found" };
  }

  await Promise.all([
    SupportTicket.deleteMany({ _id: ticketId }),
    SupportConversation.deleteMany({ _id: ticketId }),
    SupportMessage.deleteMany({ conversationId: ticketId }),
    SupportCallLog.deleteMany({ conversationId: ticketId }),
  ]);

  return { deletedId: ticketId };
};

export const bulkDeleteTicketsPermanently = async (ticketIds, actor) => {
  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    throw { status: 400, message: "Please provide a non-empty array of ticket IDs" };
  }

  const validIds = ticketIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (validIds.length === 0) {
    throw { status: 400, message: "No valid ticket IDs provided" };
  }

  const result = await Promise.all([
    SupportTicket.deleteMany({ _id: { $in: validIds } }),
    SupportConversation.deleteMany({ _id: { $in: validIds } }),
    SupportMessage.deleteMany({ conversationId: { $in: validIds } }),
    SupportCallLog.deleteMany({ conversationId: { $in: validIds } }),
  ]);

  return {
    deletedCount: result[0]?.deletedCount || validIds.length,
    deletedIds: validIds,
  };
};


