import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Seller joins their specific node room
        socket.on("join_seller_room", ({ sellerId, nodeType }) => {
            if (sellerId && nodeType) {
                const roomName = `seller_${sellerId}_node_${nodeType}`;
                socket.join(roomName);
                console.log(`Seller ${sellerId} joined room: ${roomName}`);
            }
        });

        // Customer joins their specific room
        socket.on("join_customer_room", ({ customerId }) => {
            if (customerId) {
                const roomName = `customer_${customerId}`;
                socket.join(roomName);
                console.log(`Customer ${customerId} joined room: ${roomName}`);
            }
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
