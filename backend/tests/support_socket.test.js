import { initSupportSocket } from "../utils/support.socket.js";
import SupportConversation from "../models/support/supportConversation.model.js";
import SupportMessage from "../models/support/supportMessage.model.js";
import mongoose from "mongoose";

describe("Support Socket Tests", () => {
    let mockIo, mockSocket, mockUser;
    let handlers = {};
    let emittedEvents = [];
    let roomsJoined = new Set();
    let roomsLeft = new Set();
    
    let convId;

    beforeAll(async () => {
        const { databaseConfig } = await import("../config/db.config.js");
        await databaseConfig();

        const conv = await SupportConversation.create({
            ticketNumber: "TEST-SOCK-1",
            customerId: new mongoose.Types.ObjectId(),
            customerTypeModel: "customer",
            subject: "Socket Test",
            status: "open",
            priority: "Medium"
        });
        convId = conv._id.toString();
        mockUser = { _id: conv.customerId, role: "customer" };
    });

    afterAll(async () => {
        if (convId) {
            await SupportConversation.deleteOne({ _id: convId });
            await SupportMessage.deleteMany({ conversationId: convId });
        }
    });

    beforeEach(() => {
        handlers = {};
        emittedEvents = [];
        roomsJoined = new Set();
        roomsLeft = new Set();
        
        mockIo = {
            to: (room) => ({
                emit: (event, payload) => emittedEvents.push({ type: "io", room, event, payload })
            })
        };
        
        mockSocket = {
            id: "test-socket-1",
            on: (event, callback) => {
                handlers[event] = callback;
            },
            emit: (event, payload) => {
                emittedEvents.push({ type: "socket", event, payload });
            },
            join: (room) => {
                roomsJoined.add(room);
                mockSocket.rooms.add(room);
            },
            leave: (room) => {
                roomsLeft.add(room);
                mockSocket.rooms.delete(room);
            },
            to: (room) => ({
                emit: (event, payload) => emittedEvents.push({ type: "socket_to", room, event, payload })
            }),
            rooms: new Set()
        };
    });

    it("1. Unauthenticated socket rejected", async () => {
        initSupportSocket(mockIo, mockSocket, null);
        await handlers["support:conversation:join"]({ conversationId: convId });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent).toBeDefined();
        expect(errorEvent.payload.code).toBe("SUPPORT_AUTH_REQUIRED");
    });

    it("2. Customer can join own conversation", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        await handlers["support:conversation:join"]({ conversationId: convId });
        
        expect(roomsJoined.has(`support_conversation:${convId}`)).toBe(true);
        expect(emittedEvents.some(e => e.event === "support:conversation:joined")).toBe(true);
    });

    it("3. Customer cannot join another customer's conversation", async () => {
        const otherUser = { _id: new mongoose.Types.ObjectId(), role: "customer" };
        initSupportSocket(mockIo, mockSocket, otherUser);
        await handlers["support:conversation:join"]({ conversationId: convId });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent.payload.code).toBe("SUPPORT_FORBIDDEN");
        expect(roomsJoined.has(`support_conversation:${convId}`)).toBe(false);
    });

    it("4. Agent with valid support permission can join authorized conversation", async () => {
        const agent = { _id: new mongoose.Types.ObjectId(), role: "admin", permissions: ["tickets:write"] };
        initSupportSocket(mockIo, mockSocket, agent);
        await handlers["support:conversation:join"]({ conversationId: convId });
        
        expect(roomsJoined.has(`support_conversation:${convId}`)).toBe(true);
    });

    it("5. Unauthorized user cannot join support conversation", async () => {
        const badAgent = { _id: new mongoose.Types.ObjectId(), role: "admin", permissions: ["other:read"] };
        initSupportSocket(mockIo, mockSocket, badAgent);
        await handlers["support:conversation:join"]({ conversationId: convId });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent.payload.code).toBe("SUPPORT_FORBIDDEN");
    });

    it("6. Invalid conversation ID rejected", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        await handlers["support:conversation:join"]({ conversationId: "bad-id" });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent.payload.code).toBe("SUPPORT_INVALID_MESSAGE");
    });

    it("7. Socket message without authentication rejected", async () => {
        initSupportSocket(mockIo, mockSocket, null);
        await handlers["support:message:send"]({ conversationId: convId, body: "test", clientMessageId: "123" });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent.payload.code).toBe("SUPPORT_AUTH_REQUIRED");
    });

    it("8. Socket message to unauthorized conversation rejected (must join room first)", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        await handlers["support:message:send"]({ conversationId: convId, body: "test", clientMessageId: "123" });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent.payload.code).toBe("SUPPORT_FORBIDDEN");
    });

    it("9. Valid message persists", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        await handlers["support:conversation:join"]({ conversationId: convId });
        emittedEvents = []; // clear join events
        
        await handlers["support:message:send"]({ 
            conversationId: convId, 
            body: "test message", 
            clientMessageId: "MSG-1" 
        });
        
        const ioBroadcast = emittedEvents.find(e => e.type === "io" && e.event === "support:message:new");
        expect(ioBroadcast).toBeDefined();
        expect(ioBroadcast.payload.message.body).toBe("test message");
        expect(ioBroadcast.payload.isDuplicate).toBe(false);
        
        const deliveryEvent = emittedEvents.find(e => e.type === "socket" && e.event === "support:message:delivered");
        expect(deliveryEvent).toBeDefined();
        expect(deliveryEvent.payload.clientMessageId).toBe("MSG-1");
        
        const count = await SupportMessage.countDocuments({ clientMessageId: "MSG-1" });
        expect(count).toBe(1);
    });

    it("10. Duplicate clientMessageId does not create duplicate message", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        mockSocket.rooms.add(`support_conversation:${convId}`);
        
        await handlers["support:message:send"]({ 
            conversationId: convId, 
            body: "test message", 
            clientMessageId: "MSG-1" // same ID as previous test
        });
        
        const ioBroadcast = emittedEvents.find(e => e.type === "io" && e.event === "support:message:new");
        expect(ioBroadcast.payload.isDuplicate).toBe(true);
        
        const count = await SupportMessage.countDocuments({ clientMessageId: "MSG-1" });
        expect(count).toBe(1);
    });

    it("11. Read receipt cannot target another conversation", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        
        // Not joined the room, should fail
        await handlers["support:message:read"]({ conversationId: convId, messageId: new mongoose.Types.ObjectId() });
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent.payload.code).toBe("SUPPORT_FORBIDDEN");
    });

    it("12. Typing event cannot be emitted into unauthorized room", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        // Did not join room
        await handlers["support:typing:start"]({ conversationId: convId });
        expect(emittedEvents.length).toBe(0);
    });

    it("13. Oversized message rejected", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        mockSocket.rooms.add(`support_conversation:${convId}`);
        
        await handlers["support:message:send"]({ 
            conversationId: convId, 
            body: "A".repeat(5001), 
            clientMessageId: "MSG-2" 
        });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent).toBeDefined();
        expect(errorEvent.payload.code).toBe("SUPPORT_INVALID_MESSAGE");
    });

    it("14. Invalid attachment payload rejected", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        mockSocket.rooms.add(`support_conversation:${convId}`);
        
        await handlers["support:message:send"]({ 
            conversationId: convId, 
            body: "test", 
            clientMessageId: "MSG-3",
            attachments: [{ url: "not-a-url" }] 
        });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent).toBeDefined();
        expect(errorEvent.payload.code).toBe("SUPPORT_INVALID_MESSAGE");
    });

    it("15. Rate limiting works", async () => {
        initSupportSocket(mockIo, mockSocket, mockUser);
        mockSocket.rooms.add(`support_conversation:${convId}`);
        
        // Exceed rate limit of 30 messages/minute
        const promises = [];
        for (let i = 0; i < 35; i++) {
            promises.push(handlers["support:message:send"]({ 
                conversationId: convId, 
                body: "test", 
                clientMessageId: `MSG-RL-${i}` 
            }));
        }
        await Promise.all(promises);
        
        const rateLimitEvents = emittedEvents.filter(e => e.event === "support:error" && e.payload.code === "SUPPORT_RATE_LIMITED");
        expect(rateLimitEvents.length).toBeGreaterThan(0);
    });

    it("16. Reconnection requires room reauthorization", async () => {
        // Since we don't save connected rooms across reconnects to memory (clean disconnect handling),
        // we just verify that clearing the set (disconnecting) forces them to re-join.
        initSupportSocket(mockIo, mockSocket, mockUser);
        
        // Mock disconnect
        handlers["disconnect"]();
        mockSocket.rooms.clear();
        
        // Attempt to send message after "reconnect" without joining
        await handlers["support:message:send"]({ 
            conversationId: convId, 
            body: "test", 
            clientMessageId: "MSG-RECONNECT" 
        });
        
        const errorEvent = emittedEvents.find(e => e.event === "support:error");
        expect(errorEvent).toBeDefined();
        expect(errorEvent.payload.code).toBe("SUPPORT_FORBIDDEN");
    });
});
