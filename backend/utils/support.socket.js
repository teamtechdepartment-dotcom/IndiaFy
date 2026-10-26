import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import { createSupportMessage } from "../services/support.service.js";
import { checkUserPermission } from "../middlewares/permissionGuard.middleware.js";
import mongoose from "mongoose";

// Simple in-memory rate limiter keyed by user/socket identity
const rateLimits = new Map();
let socketIoInstance = null;

export const getSocketIo = () => socketIoInstance;

export const emitSupportEvent = (event, data, room = null) => {
    if (!socketIoInstance) return;
    try {
        if (room) {
            socketIoInstance.to(room).emit(event, data);
        } else {
            socketIoInstance.to("support_admin_room").emit(event, data);
        }
    } catch (_err) {
        // Socket broadcast errors must not break main transaction
    }
};

// Rate limiter disabled per user request
const checkRateLimit = () => false;

export const initSupportSocket = (io, socket, socketUser) => {
    if (!socketIoInstance) socketIoInstance = io;

    // Join global support staff and member personal room if staff
    if (socketUser) {
        const role = (socketUser.role || "customer").toLowerCase();
        const isStaff =
            role === "admin" ||
            role === "super_admin" ||
            role === "support_member" ||
            role === "supportmember" ||
            role === "support_lead" ||
            role === "support_agent" ||
            role === "support_manager";
        if (isStaff) {
            socket.join("support_admin_room");
            const memberId = socketUser._id || socketUser.id;
            if (memberId) {
                socket.join(`support_member:${memberId.toString()}`);
            }
        }
    }

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
            const isCustomerOrSeller = role === "customer" || role === "seller";
            const isAdmin = !isCustomerOrSeller;
            
            const principalId = (socketUser._id || socketUser.sellerId || socketUser.id || "").toString();
            const convCustomerId = (conv.customerId?._id || conv.customerId || "").toString();
            if (!isAdmin && convCustomerId !== principalId) {
                return emitError("SUPPORT_FORBIDDEN", "Not authorized for this conversation");
            }
            
            // Agent authorization check (P0-02 & P0-03 audit fix)
            if (isAdmin) {
                const hasRead = await checkUserPermission(socketUser, "tickets:read");
                const hasWrite = await checkUserPermission(socketUser, "tickets:write");
                if (!hasRead && !hasWrite) {
                    return emitError("SUPPORT_FORBIDDEN", "Agent unauthorized for support");
                }
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
        
        const userKey = (socketUser._id || socketUser.sellerId || socketUser.id || socket.id).toString();
        if (checkRateLimit(userKey, "message:send", 30, 60000)) {
            return emitError("SUPPORT_RATE_LIMITED", "Too many messages");
        }
        
        const { conversationId, body, clientMessageId, attachments, messageType } = payload || {};
        const roomName = `support_conversation:${conversationId}`;
        
        if (!socket.rooms.has(roomName)) {
            return emitError("SUPPORT_FORBIDDEN", "You must join the conversation room first");
        }

        const role = (socketUser.role || "customer").toLowerCase();
        const isCustomerOrSeller = role === "customer" || role === "seller";
        const isAdmin = !isCustomerOrSeller;
        if (isAdmin) {
            const hasWrite = await checkUserPermission(socketUser, "tickets:write");
            if (!hasWrite) {
                return emitError("SUPPORT_FORBIDDEN", "Missing tickets:write permission");
            }
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
        const userKey = socketUser._id?.toString() || socket.id;
        if (checkRateLimit(userKey, "typing", 20, 10000)) return;
        
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
        const userKey = socketUser._id?.toString() || socket.id;
        if (checkRateLimit(userKey, "typing", 20, 10000)) return;
        
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
                { returnDocument: 'after' }
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
        const userKey = socketUser?._id?.toString() || socket.id;
        rateLimits.delete(`${userKey}:message:send`);
        rateLimits.delete(`${userKey}:typing`);
        rateLimits.delete(`${socket.id}:message:send`);
        rateLimits.delete(`${socket.id}:typing`);
    });
};
