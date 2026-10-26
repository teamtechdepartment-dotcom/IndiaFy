import mongoose from "mongoose";
import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import SupportTicket from "../models/admins/supportTicket.model.js";
import AuditLog from "../models/admins/auditLog.model.js";
import { checkUserPermission } from "../middlewares/permissionGuard.middleware.js";

export const createSupportMessage = async (conversationId, user, payload) => {
  const { body, clientMessageId, attachments, messageType } = payload;

  if (!body || !clientMessageId) {
    throw { status: 400, message: "Body and clientMessageId required", code: "SUPPORT_INVALID_MESSAGE" };
  }
  
  if (body.length > 5000) {
    throw { status: 400, message: "Message body exceeds 5000 characters", code: "SUPPORT_INVALID_MESSAGE" };
  }
  
  if (clientMessageId.length > 128) {
    throw { status: 400, message: "clientMessageId exceeds 128 characters", code: "SUPPORT_INVALID_MESSAGE" };
  }
  
  if (attachments && Array.isArray(attachments)) {
    if (attachments.length > 10) {
      throw { status: 400, message: "Maximum 10 attachments allowed", code: "SUPPORT_INVALID_MESSAGE" };
    }
    for (const att of attachments) {
      if (!att.url || typeof att.url !== "string" || !att.url.startsWith("http")) {
         throw { status: 400, message: "Invalid attachment URL", code: "SUPPORT_INVALID_MESSAGE" };
      }
    }
  }

  const conversation = await SupportConversation.findById(conversationId);
  if (!conversation) {
    throw { status: 404, message: "Conversation not found", code: "SUPPORT_CONVERSATION_NOT_FOUND" };
  }

  const userRole = (user?.role || "").toLowerCase();
  
  // Auth Check
  let senderType = "customer";
  if (
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "support_manager" ||
    userRole === "support_member" ||
    userRole === "supportmember" ||
    userRole === "support_lead" ||
    userRole === "support_agent"
  ) {
    senderType = "admin";
  } else if (userRole === "seller") {
    senderType = "seller";
  }

  const rawPrincipalId = senderType === "seller"
    ? (user?.sellerId || user?._id || user?.id)
    : (user?._id || user?.id || user?.customerId);
  const principalId = rawPrincipalId ? rawPrincipalId.toString() : "";

  if (senderType === "admin") {
    const hasWrite = await checkUserPermission(user, "tickets:write");
    if (!hasWrite) {
      throw { status: 403, message: "Access denied: Missing tickets:write permission", code: "SUPPORT_FORBIDDEN" };
    }
  } else {
    const convCustomerId = (conversation.customerId?._id || conversation.customerId || "").toString();
    if (!principalId || convCustomerId !== principalId) {
      throw { status: 403, message: "Access denied", code: "SUPPORT_FORBIDDEN" };
    }
  }

  const isInternalNote = messageType === "internal_note";
  
  if (isInternalNote && senderType !== "admin") {
    throw { status: 403, message: "Only support agents can create internal notes", code: "SUPPORT_FORBIDDEN" };
  }

  try {
    const message = await SupportMessage.create({
      conversationId,
      senderId: new mongoose.Types.ObjectId(principalId),
      senderType,
      messageType: isInternalNote ? "internal_note" : "customer",
      body,
      attachments: attachments || [],
      clientMessageId,
    });

    if (!isInternalNote) {
      // Update conversation only for customer-visible messages
      conversation.lastMessageAt = new Date();
      conversation.lastMessageId = message._id;
      conversation.messageCount += 1;
      
      if (senderType === "admin") {
        conversation.status = "waiting_customer";
      } else {
        conversation.status = conversation.assignedAgentId ? "waiting_agent" : "open";
      }
      
      await conversation.save();
    } else {
      // Audit log the internal note creation securely
      try {
        await AuditLog.create({
          adminId: user._id,
          adminEmail: user.email || "support@indiafy",
          action: "CREATE_INTERNAL_NOTE",
          targetResource: `conversation:${conversationId}`,
          ipAddress: "127.0.0.1",
          device: "system",
          location: "Localhost",
          afterValue: { messageId: message._id }
        });
      } catch (auditErr) {
        console.error("Failed to audit log internal note", auditErr);
      }
    }

    // Synchronize to SupportTicket for unified workspace visibility
    try {
      const ticketSenderType = senderType === "admin" ? "admin" : (senderType === "seller" ? "seller" : "user");
      const ticketSenderName = senderType === "admin"
        ? (user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Support Staff")
        : (senderType === "seller" ? "Seller Partner" : "Customer");

      if (!isInternalNote) {
        const isAssigned = Boolean(conversation.assignedAgentId);
        const newTicketStatus = !isAssigned
          ? "Open"
          : (senderType === "admin" ? "Waiting" : "In Progress");

        const updateSet = {
          status: newTicketStatus,
          updatedAt: new Date(),
        };
        if (!isAssigned) {
          updateSet.queueStatus = "pending_assignment";
        }

        await SupportTicket.findByIdAndUpdate(conversationId, {
          $push: {
            messages: {
              _id: message._id,
              senderType: ticketSenderType,
              senderId: message.senderId,
              senderName: ticketSenderName,
              body: message.body,
              attachments: attachments ? attachments.map((a) => (typeof a === "string" ? a : a.url)) : [],
              createdAt: message.createdAt || new Date(),
            },
          },
          $set: updateSet,
        });
      } else {
        await SupportTicket.findByIdAndUpdate(conversationId, {
          $push: {
            internalNotes: {
              adminId: user._id,
              adminName: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Support Staff",
              note: body,
              createdAt: message.createdAt || new Date(),
            },
          },
          $set: { updatedAt: new Date() },
        });
      }
    } catch (_syncErr) {
      console.warn("Could not sync message to SupportTicket:", _syncErr.message);
    }

    return { message, isDuplicate: false, conversation };
  } catch (err) {
    if (err.code === 11000) {
      // Idempotency: duplicate message. Return success for the existing one.
      const existing = await SupportMessage.findOne({ conversationId, senderId: user._id, clientMessageId });
      return { message: existing, isDuplicate: true, conversation };
    }
    throw err;
  }
};
