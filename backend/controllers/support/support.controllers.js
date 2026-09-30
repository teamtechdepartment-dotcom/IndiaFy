import mongoose from "mongoose";
import ApiError from "../../utils/apiError.js";
import SupportConversation from "../../models/support/supportConversation.model.js";
import SupportMessage from "../../models/support/supportMessage.model.js";
import SupportAssignment from "../../models/support/supportAssignment.model.js";
import SupportCallLog from "../../models/support/supportCallLog.model.js";
import OrderModel from "../../models/orders/order.model.js";
import AdminModel from "../../models/admins/auth.model.js";
import AuditLog from "../../models/admins/auditLog.model.js";
import { createSupportMessage } from "../../services/support.service.js";
import telephonyService from "../../services/telephony/telephony.service.js";
import { getSocketIo } from "../../utils/support.socket.js";

const { ObjectId } = mongoose.Types;

export const createConversation = async (req, res, next) => {
  try {
    const { subject, orderId, storeId } = req.body;

    const userRole = (req.user?.role || "customer").toLowerCase();
    
    // For customers or sellers creating a ticket
    let customerId = req.user._id;
    let customerTypeModel = userRole === "seller" ? "seller" : "customer";

    // Validate Order Ownership
    if (orderId) {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json(new ApiError(400, "Invalid orderId format"));
      }
      const order = await OrderModel.findById(orderId).select("customer orderItems").lean();
      if (!order) {
        return res.status(404).json(new ApiError(404, "Order not found"));
      }

      if (userRole === "seller") {
        const isSellerInOrder = order.orderItems.some(
          (item) => item.seller?.toString() === customerId.toString()
        );
        if (!isSellerInOrder) {
          return res.status(403).json(new ApiError(403, "Access denied to this order"));
        }
      } else {
        if (order.customer.toString() !== customerId.toString()) {
          return res.status(403).json(new ApiError(403, "Access denied to this order"));
        }
      }
    }

    // Generate simple ticket number
    const count = await SupportConversation.countDocuments();
    const ticketNumber = `SUP-${Date.now().toString().slice(-6)}-${count + 1}`;

    const conversation = await SupportConversation.create({
      ticketNumber,
      customerId,
      customerTypeModel,
      orderId: orderId || null,
      storeId: storeId || null,
      subject,
      status: "open",
      priority: "Medium",
    });

    res.status(201).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userRole = (req.user?.role || "").toLowerCase();
    let filter = {};

    if (userRole === "admin" || userRole === "support_manager") {
      // Agents can see all or filter by assignedAgentId
      if (req.query.assignedToMe === "true") {
        filter.assignedAgentId = req.user._id;
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
    } else {
      // Customers/Sellers can only see their own
      filter.customerId = req.user._id;
      if (req.query.orderId) {
        filter.orderId = req.query.orderId;
      }
    }

    const conversations = await SupportConversation.find(filter)
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await SupportConversation.findById(id)
      .populate("customerId", "firstName lastName email createdAt isBlocked")
      .populate({
        path: "orderId",
        select: "orderItems totalPrice status paymentMethod createdAt shippingAddress",
        populate: {
          path: "orderItems.product",
          select: "name images price"
        }
      })
      .lean();

    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    const userRole = (req.user?.role || "").toLowerCase();
    
    // Authorization
    const isAdmin = userRole === "admin" || userRole === "support_manager";
    if (!isAdmin) {
      const convUserId = conversation.customerId?._id?.toString() || conversation.customerId?.toString();
      if (convUserId !== req.user._id.toString()) {
        return res.status(403).json(new ApiError(403, "Access denied to this conversation"));
      }
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before; // client passes oldest message ID they have

    const conversation = await SupportConversation.findById(id).lean();
    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    const userRole = (req.user?.role || "").toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "support_manager";
    if (!isAdmin) {
      if (conversation.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json(new ApiError(403, "Access denied"));
      }
    }

    let filter = { conversationId: id };
    if (!isAdmin) {
      filter.messageType = { $ne: "internal_note" };
    }
    
    if (before && mongoose.isValidObjectId(before)) {
      filter._id = { $lt: before };
    }

    const messages = await SupportMessage.find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({ 
      success: true, 
      messages: messages.reverse(), // send chronological order to frontend
      hasMore: messages.length === limit,
      cursor: messages.length > 0 ? messages[messages.length - 1]._id : null
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, clientMessageId, attachments, messageType } = req.body;

    const { message, isDuplicate } = await createSupportMessage(id, req.user, { body, clientMessageId, attachments, messageType });

    // Note: We could emit a socket broadcast here if we wanted to broadcast from REST,
    // but typically the client can listen to the Socket itself or rely on REST response.
    // For Phase 2, the requirement is to persist first, then broadcast. 
    // We will handle socket broadcasts inside the socket handler itself or emit from here.
    // The requirement: "Broadcast persisted message". We'll do it in socket.js for socket events.
    // For REST, if we need to emit to socket, we would need `getIO()`.

    res.status(isDuplicate ? 200 : 201).json({ success: true, message, duplicate: isDuplicate });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json(new ApiError(error.status, error.message));
    }
    next(error);
  }
};

export const assignConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const newAgent = agentId || req.user._id;

    // Validate Agent
    const admin = await AdminModel.findById(newAgent).select("role isActive").lean();
    if (!admin || admin.isActive === false) {
      return res.status(400).json(new ApiError(400, "Invalid or inactive support agent"));
    }

    let updated = false;
    let maxRetries = 3;
    let finalConv = null;

    while (maxRetries > 0 && !updated) {
      const conv = await SupportConversation.findById(id).lean();
      if (!conv) return res.status(404).json(new ApiError(404, "Not found"));

      if (conv.assignedAgentId?.toString() === newAgent.toString()) {
        finalConv = conv;
        updated = true;
        break;
      }

      // Optimistic concurrency check
      const result = await SupportConversation.updateOne(
        { _id: id, assignedAgentId: conv.assignedAgentId },
        { $set: { assignedAgentId: newAgent, status: "assigned" } }
      );

      if (result.modifiedCount === 1) {
        // We won the race
        if (conv.assignedAgentId) {
          await SupportAssignment.updateMany(
            { conversationId: id, status: "active", agentId: conv.assignedAgentId },
            { $set: { status: "transferred", unassignedAt: new Date(), reason: "Reassigned" } }
          );
        }

        await SupportAssignment.create({
          conversationId: id,
          agentId: newAgent,
          assignedBy: req.user._id,
          status: "active"
        });

        // Audit Logging
        await AuditLog.create({
          adminId: req.user._id,
          adminEmail: req.user.email || "support_api",
          action: "SUPPORT_CONVERSATION_ASSIGNED",
          targetResource: `SupportConversation:${id}`,
          beforeValue: { assignedAgentId: conv.assignedAgentId },
          afterValue: { assignedAgentId: newAgent }
        }).catch(err => console.error("Audit log failed:", err));

        finalConv = await SupportConversation.findById(id).lean();
        updated = true;
      } else {
        maxRetries--;
      }
    }

    if (!updated) {
      return res.status(409).json(new ApiError(409, "Conflict during assignment. Please try again."));
    }

    res.status(200).json({ success: true, conversation: finalConv });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const oldConversation = await SupportConversation.findById(id).lean();
    if (!oldConversation) return res.status(404).json(new ApiError(404, "Not found"));

    const updates = { status };
    if (status === "closed" || status === "resolved") {
      updates.closedAt = new Date();
    }

    const conversation = await SupportConversation.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { new: true }
    );

    if (status === "closed" || status === "resolved") {
      await SupportAssignment.updateMany(
        { conversationId: id, status: "active" },
        { $set: { status: "completed", unassignedAt: new Date() } }
      );
    }

    // Audit Logging
    await AuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email || "support_api",
      action: "SUPPORT_CONVERSATION_STATUS_UPDATE",
      targetResource: `SupportConversation:${id}`,
      beforeValue: { status: oldConversation.status },
      afterValue: { status }
    }).catch(err => console.error("Audit log failed:", err));

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                               CALLBACK SYSTEM                              */
/* -------------------------------------------------------------------------- */

export const requestCallback = async (req, res, next) => {
  try {
    const { id } = req.params; // conversationId
    const { phone, requestedTimeWindow = "ASAP", preferredTime, notes } = req.body;

    if (!phone) {
      return res.status(400).json(new ApiError(400, "Phone number is required"));
    }

    const conversation = await SupportConversation.findById(id);
    if (!conversation) {
      return res.status(404).json(new ApiError(404, "Conversation not found"));
    }

    const userRole = (req.user?.role || "customer").toLowerCase();
    const isCustomerOrSeller = userRole === "customer" || userRole === "seller";
    
    if (isCustomerOrSeller) {
      const convUserId = conversation.customerId?._id?.toString() || conversation.customerId?.toString();
      if (convUserId !== req.user._id.toString()) {
        return res.status(403).json(new ApiError(403, "Access denied"));
      }
    }

    // Check for existing active callback to prevent duplicates
    const existingCallback = await SupportCallLog.findOne({
      conversationId: id,
      status: { $in: ["requested", "queued", "assigned", "calling", "connected"] }
    });

    if (existingCallback) {
      return res.status(200).json({
        success: true,
        message: "Active callback already exists",
        callback: existingCallback
      });
    }

    try {
      const callbackLog = await SupportCallLog.findOneAndUpdate(
        {
          conversationId: id,
          status: { $in: ["requested", "queued", "assigned", "calling", "connected"] }
        },
        {
          $setOnInsert: {
            customerId: req.user._id,
            customerTypeModel: userRole === "seller" ? "seller" : "customer",
            phone,
            requestedTimeWindow,
            preferredTime,
            notes,
            status: "requested"
          }
        },
        { upsert: true, new: true, returnDocument: 'after' }
      );

      // We don't easily know if it was inserted or found via Mongoose easily, but it's idempotent.
      // Update SLA metadata in conversation (safe to do repeatedly for now)
      await SupportConversation.updateOne(
        { _id: id },
        { $set: { callbackRequestedAt: new Date() } }
      );

      // Audit Logging
      await AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email || "system@indiafy.com",
        action: "SUPPORT_CALLBACK_REQUESTED",
        targetResource: `SupportCallLog:${callbackLog._id}`,
      }).catch(err => console.error("Audit log failed:", err));

      res.status(201).json({ success: true, callback: callbackLog });
    } catch (err) {
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export const getCallbacks = async (req, res, next) => {
  try {
    const userRole = (req.user?.role || "").toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "support_manager";
    
    let filter = {};
    if (isAdmin) {
      if (req.query.status) {
        filter.status = req.query.status;
      } else {
        filter.status = { $in: ["requested", "queued", "assigned"] }; // default view for agents
      }
    } else {
      filter.customerId = req.user._id;
      if (req.query.conversationId) {
        filter.conversationId = req.query.conversationId;
      }
    }

    const callbacks = await SupportCallLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, callbacks });
  } catch (error) {
    next(error);
  }
};

export const updateCallbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const userRole = (req.user?.role || "").toLowerCase();
    const isAdmin = userRole === "admin" || userRole === "support_manager";

    const callbackLog = await SupportCallLog.findById(id);
    if (!callbackLog) {
      return res.status(404).json(new ApiError(404, "Callback request not found"));
    }

    // Customer/Seller can only cancel their own callback if it's not already in progress
    if (!isAdmin) {
      if (status !== "cancelled") {
        return res.status(403).json(new ApiError(403, "Customers can only cancel callbacks"));
      }
      if (callbackLog.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json(new ApiError(403, "Access denied"));
      }
      if (["calling", "connected", "completed", "failed", "missed"].includes(callbackLog.status)) {
        return res.status(400).json(new ApiError(400, "Cannot cancel a callback that is already processed"));
      }
    }

    // Define valid transitions for agents
    const validTransitions = {
      requested: ["queued", "assigned", "cancelled"],
      queued: ["assigned", "cancelled"],
      assigned: ["calling", "cancelled", "missed"],
      calling: ["connected", "missed", "failed"],
      connected: ["completed", "failed"],
      completed: [],
      missed: [],
      cancelled: [],
      failed: []
    };

    if (isAdmin && !validTransitions[callbackLog.status].includes(status)) {
      return res.status(400).json(new ApiError(400, `Invalid status transition from ${callbackLog.status} to ${status}`));
    }

    const updates = { status };
    if (notes) updates.notes = notes;
    if (status === "calling" || status === "connected") updates.startedAt = new Date();
    if (["completed", "failed", "missed", "cancelled"].includes(status)) updates.endedAt = new Date();

    const updatedCallback = await SupportCallLog.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    // Update conversation SLA metadata if completed
    if (status === "completed") {
      await SupportConversation.updateOne(
        { _id: callbackLog.conversationId },
        { $set: { callbackCompletedAt: new Date() } }
      );
    }

    if (isAdmin) {
      await AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email || "system@indiafy.com",
        action: "SUPPORT_CALLBACK_STATUS_UPDATE",
        targetResource: `SupportCallLog:${id}`,
        beforeValue: { status: callbackLog.status },
        afterValue: { status }
      }).catch(err => console.error("Audit log failed:", err));
    }

    res.status(200).json({ success: true, callback: updatedCallback });
  } catch (error) {
    next(error);
  }
};

export const assignCallback = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Only support agents can self-assign or assign others
    const agentId = req.body.agentId || req.user._id;

    // Use atomic update to prevent assignment race condition
    const callbackLog = await SupportCallLog.findOneAndUpdate(
      { 
        _id: id, 
        status: { $in: ["requested", "queued"] } 
      },
      { 
        $set: { 
          agentId, 
          status: "assigned" 
        } 
      },
      { new: true }
    );

    if (!callbackLog) {
      // It might be already assigned, or in a state that cannot be assigned
      const existing = await SupportCallLog.findById(id);
      if (!existing) {
        return res.status(404).json(new ApiError(404, "Callback request not found"));
      }
      return res.status(409).json(new ApiError(409, "Callback is already assigned or cannot be assigned"));
    }

    await AuditLog.create({
      adminId: req.user._id,
      adminEmail: req.user.email || "system@indiafy.com",
      action: "SUPPORT_CALLBACK_ASSIGNED",
      targetResource: `SupportCallLog:${id}`,
      afterValue: { agentId }
    }).catch(err => console.error("Audit log failed:", err));

    res.status(200).json({ success: true, callback: callbackLog });
  } catch (error) {
    next(error);
  }
};

export const startCallbackCall = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!telephonyService.isEnabled()) {
      return res.status(400).json(new ApiError(400, "TELEPHONY_DISABLED"));
    }

    // Atomic update to ensure only ONE click can trigger the call
    // Requires the status to be "assigned" and the agentId to match the current user
    const callbackLog = await SupportCallLog.findOneAndUpdate(
      { 
        _id: id, 
        status: "assigned",
        agentId: req.user._id
      },
      { 
        $set: { 
          status: "calling",
          startedAt: new Date()
        } 
      },
      { new: true }
    );

    if (!callbackLog) {
      return res.status(409).json(new ApiError(409, "CALL_ALREADY_IN_PROGRESS_OR_NOT_ALLOWED"));
    }

    // Now make the call via Provider
    try {
      const callResult = await telephonyService.initiateCall({
        to: callbackLog.phone,
        from: "SupportSystem", 
        callbackId: callbackLog._id.toString(),
        agentId: req.user._id.toString(),
        idempotencyKey: callbackLog._id.toString(), // Provider idempotency
      });

      // Atomically store the providerCallId
      const finalLog = await SupportCallLog.findByIdAndUpdate(
        callbackLog._id,
        {
          $set: {
            providerCallId: callResult.providerCallId,
            providerName: telephonyService.providerName
          }
        },
        { new: true }
      ).populate("customerId", "firstName lastName email").populate("agentId", "firstName lastName email");

      // Notify the room
      const io = getSocketIo();
      if (io) {
        io.to(callbackLog.conversationId.toString()).emit("support:callback:calling", {
          callback: finalLog
        });
      }

      return res.status(200).json({ success: true, callback: finalLog });
    } catch (providerError) {
      // Transition to failed — do NOT roll back to assigned.
      // Rolling back to assigned would allow agents to retry, risking double initiation.
      // The callback is now terminal at "failed" for this attempt.
      await SupportCallLog.findByIdAndUpdate(callbackLog._id, {
        $set: { status: "failed", endedAt: new Date() }
      });
      return res.status(502).json(new ApiError(502, "CALL_FAILED", [providerError.message]));
    }
  } catch (error) {
    next(error);
  }
};

export const handleTelephonyWebhook = async (req, res, next) => {
  try {
    if (!telephonyService.isEnabled()) {
      return res.status(200).send("TELEPHONY_DISABLED"); // Always return 200 to webhook
    }

    const isValid = telephonyService.verifyWebhookSignature(req);
    if (!isValid) {
      return res.status(401).send("Invalid signature");
    }

    const payload = telephonyService.normalizeWebhook(req.body);
    if (!payload || !payload.providerCallId) {
      return res.status(400).send("Invalid payload");
    }

    // Map provider statuses directly to our enum if possible. 
    // Usually a provider adapter takes care of mapping to our known statuses:
    // "calling", "connected", "completed", "failed", "missed", "cancelled"
    
    // We only update if the new status represents forward progress
    // or if we receive duration / recordings.
    
    // Find the call by authoritative providerCallId
    const callbackLog = await SupportCallLog.findOne({ providerCallId: payload.providerCallId });
    if (!callbackLog) {
      return res.status(200).send("Unknown call"); 
    }

    const terminalStatuses = ["completed", "failed", "missed", "cancelled"];
    
    // Reject retrograde state transitions
    if (terminalStatuses.includes(callbackLog.status) && !terminalStatuses.includes(payload.status)) {
      return res.status(200).send("OK"); // Acknowledge but ignore retrograde event
    }
    
    if (callbackLog.status === "connected" && payload.status === "calling") {
      return res.status(200).send("OK");
    }

    const updates = {
      status: payload.status,
    };

    if (payload.durationSeconds) updates.durationSeconds = payload.durationSeconds;
    // recordingUrl is explicitly disabled for security and data privacy.
    if (["completed", "failed", "missed", "cancelled"].includes(payload.status) && !callbackLog.endedAt) {
        updates.endedAt = new Date();
    }
    
    if (payload.status === "connected" && !callbackLog.startedAt) {
        updates.startedAt = new Date();
    }

    const finalLog = await SupportCallLog.findByIdAndUpdate(
      callbackLog._id,
      { $set: updates },
      { new: true }
    ).populate("customerId", "firstName lastName email").populate("agentId", "firstName lastName email");

    const io = getSocketIo();
    if (io) {
      io.to(callbackLog.conversationId.toString()).emit(`support:callback:${payload.status}`, {
        callback: finalLog
      });
    }

    // 200 OK so provider doesn't retry
    return res.status(200).send("OK");
  } catch (error) {
    // Returning 500 might trigger provider retries, which is usually correct for unexpected internal errors
    next(error);
  }
};
