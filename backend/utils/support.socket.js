import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import { createSupportMessage } from "../services/support.service.js";
import mongoose from "mongoose";

// Simple in-memory rate limiter per socket
const rateLimits = new Map();
let socketIoInstance = null;

export const getSocketIo = () => socketIoInstance;
const checkRateLimit = (socketId, event, limit, windowMs) => {
    const key = `${socketId}:${event}`;
    const now = Date.now();
    let data = rateLimits.get(key) || { count: 0, resetAt: now + windowMs };
    
    if (now > data.resetAt) {
        data = { count: 0, resetAt: now + windowMs };
    }
    data.count += 1;
    rateLimits.set(key, data);
    
    return data.count > limit;
};

export const initSupportSocket = (io, socket, socketUser) => {
    if (!socketIoInstance) socketIoInstance = io;

    const emitError = (code, message) => {
        socket.emit("support:error", { code, message });
    };

    socket.on("support:conversation:join", async (payload) => {
        if (!socketUser) {
            return emitError("SUPPORT_AUTH_REQUIRED", "Authentication required");
        }
        
        const { conversationId } = payload || {};
        if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
            return emitError("SUPPORT_INVALID_MESSAGE", "Invalid conversationId");
        }
        
        try {
            const conv = await SupportConversation.findById(conversationId).select("customerId assignedAgentId status").lean();
            if (!conv) {
                return emitError("SUPPORT_CONVERSATION_NOT_FOUND", "Conversation not found");
            }
            
            const role = (socketUser.role || "customer").toLowerCase();
            const isAdmin = role === "admin" || role === "support_manager";
            
            if (!isAdmin && conv.customerId.toString() !== socketUser._id.toString()) {
                return emitError("SUPPORT_FORBIDDEN", "Not authorized for this conversation");
            }
            
            // Agent authorization check
            if (isAdmin && socketUser.permissions && !socketUser.permissions.includes("tickets:write") && !socketUser.permissions.includes("tickets:read")) {
                return emitError("SUPPORT_FORBIDDEN", "Agent unauthorized for support");
            }

            const roomName = `support_conversation:${conversationId}`;
            socket.join(roomName);
            
            if (isAdmin) {
                socket.join(`${roomName}:agents`);
            }
            
            socket.emit("support:conversation:joined", { conversationId });
        } catch (error) {
            emitError("SUPPORT_INTERNAL_ERROR", "Internal server error");
        }
    });

    socket.on("support:conversation:leave", (payload) => {
        const { conversationId } = payload || {};
        if (conversationId) {
            const roomName = `support_conversation:${conversationId}`;
            socket.leave(roomName);
            socket.leave(`${roomName}:agents`);
            socket.emit("support:conversation:left", { conversationId });
        }
    });

    socket.on("support:message:send", async (payload) => {
        if (!socketUser) return emitError("SUPPORT_AUTH_REQUIRED", "Authentication required");
        
        if (checkRateLimit(socket.id, "message:send", 30, 60000)) {
            return emitError("SUPPORT_RATE_LIMITED", "Too many messages");
        }
        
        const { conversationId, body, clientMessageId, attachments, messageType } = payload || {};
        const roomName = `support_conversation:${conversationId}`;
        
        if (!socket.rooms.has(roomName)) {
            return emitError("SUPPORT_FORBIDDEN", "You must join the conversation room first");
        }
        
        try {
            const { message, isDuplicate } = await createSupportMessage(conversationId, socketUser, { body, clientMessageId, attachments, messageType });
            
            // Broadcast persisted message
            if (message.messageType === "internal_note") {
                io.to(`${roomName}:agents`).emit("support:message:new", { message, isDuplicate });
            } else {
                io.to(roomName).emit("support:message:new", { message, isDuplicate });
            }
            
            // Mark as delivered for the sender acknowledging persistence
            socket.emit("support:message:delivered", { messageId: message._id, clientMessageId: message.clientMessageId });
        } catch (error) {
            if (error.code) {
                emitError(error.code, error.message);
            } else {
                emitError("SUPPORT_INTERNAL_ERROR", "Internal server error");
            }
        }
    });

    socket.on("support:typing:start", (payload) => {
        if (!socketUser) return;
        if (checkRateLimit(socket.id, "typing", 20, 10000)) return;
        
        const { conversationId } = payload || {};
        const roomName = `support_conversation:${conversationId}`;
        
        if (socket.rooms.has(roomName)) {
            socket.to(roomName).emit("support:typing:start", { 
                conversationId, 
                userId: socketUser._id,
                name: socketUser.firstName || "User"
            });
        }
    });

    socket.on("support:typing:stop", (payload) => {
        if (!socketUser) return;
        if (checkRateLimit(socket.id, "typing", 20, 10000)) return;
        
        const { conversationId } = payload || {};
        const roomName = `support_conversation:${conversationId}`;
        
        if (socket.rooms.has(roomName)) {
            socket.to(roomName).emit("support:typing:stop", { 
                conversationId, 
                userId: socketUser._id 
            });
        }
    });

    socket.on("support:message:read", async (payload) => {
        if (!socketUser) return;
        
        const { conversationId, messageId } = payload || {};
        const roomName = `support_conversation:${conversationId}`;
        
        if (!socket.rooms.has(roomName)) {
            return emitError("SUPPORT_FORBIDDEN", "You must join the conversation room first");
        }
        
        if (!mongoose.isValidObjectId(messageId)) {
            return emitError("SUPPORT_INVALID_MESSAGE", "Invalid messageId");
        }

        try {
            const updated = await SupportMessage.findOneAndUpdate(
                { _id: messageId, conversationId, readAt: null },
                { $set: { readAt: new Date() } },
                { new: true }
            );

            if (updated) {
                io.to(roomName).emit("support:message:read", {
                    conversationId,
                    messageId: updated._id,
                    readAt: updated.readAt,
                    readBy: socketUser._id
                });
            }
        } catch (err) {
            // Ignore
        }
    });
    
    socket.on("disconnect", () => {
        rateLimits.delete(`${socket.id}:message:send`);
        rateLimits.delete(`${socket.id}:typing`);
    });
};
