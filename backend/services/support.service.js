import mongoose from "mongoose";
import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import AuditLog from "../models/admins/auditLog.model.js";

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
  if (userRole === "admin" || userRole === "support_manager") {
    senderType = "admin";
  } else if (userRole === "seller") {
    senderType = "seller";
  }

  if (senderType !== "admin" && conversation.customerId.toString() !== user._id.toString()) {
    throw { status: 403, message: "Access denied", code: "SUPPORT_FORBIDDEN" };
  }

  const isInternalNote = messageType === "internal_note";
  
  if (isInternalNote && senderType !== "admin") {
    throw { status: 403, message: "Only support agents can create internal notes", code: "SUPPORT_FORBIDDEN" };
  }

  try {
    const message = await SupportMessage.create({
      conversationId,
      senderId: user._id,
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
