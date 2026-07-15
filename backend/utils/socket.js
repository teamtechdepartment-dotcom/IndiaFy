import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

const getCookieValue = (cookieHeader = "", name) => {
    const cookie = cookieHeader
        .split(";")
        .map(part => part.trim())
        .find(part => part.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
};

const getSocketUser = (socket) => {
    const securityKey = process.env.SecurityKey;
    if (!securityKey) return null;

    const authHeader = socket.handshake.headers?.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const sellerCookieToken = getCookieValue(socket.handshake.headers?.cookie, "SellerAccessToken");
    const authToken = socket.handshake.auth?.token;
    const token = authToken || bearerToken || sellerCookieToken;

    if (!token) return null;

    try {
        return jwt.verify(token, securityKey);
    } catch (_err) {
        return null;
    }
};

const canJoinSellerRoom = (socket, sellerId) => {
    const socketUser = getSocketUser(socket);
    if (!socketUser) return true;
    return socketUser.role?.toLowerCase() === "seller" && socketUser._id?.toString() === sellerId?.toString();
};

export const initSocket = (server) => {
    const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(",").map(o => o.trim()) 
        : ["http://localhost:5173"];

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Seller joins their specific node room (legacy — by nodeType)
        socket.on("join_seller_room", ({ sellerId, nodeType }) => {
            if (sellerId && nodeType) {
                if (!canJoinSellerRoom(socket, sellerId)) {
                    console.warn(`Rejected seller room join for socket ${socket.id}: ${sellerId}`);
                    return;
                }
                const roomName = `seller_${sellerId}_node_${nodeType}`;
                socket.join(roomName);
                console.log(`Seller ${sellerId} joined legacy room: ${roomName}`);
            }
        });

        // Seller-level subscription room
        socket.on("join_seller_channel", ({ sellerId }) => {
            if (sellerId) {
                if (!canJoinSellerRoom(socket, sellerId)) {
                    console.warn(`Rejected seller channel join for socket ${socket.id}: ${sellerId}`);
                    return;
                }
                const roomName = `seller:${sellerId}`;
                socket.join(roomName);
                console.log(`Seller ${sellerId} joined channel: ${roomName}`);
            }
        });

        // Seller joins precise room by nodeId (new — for exact node targeting)
        socket.on("join_seller_node_room", ({ sellerId, nodeId }) => {
            if (sellerId && nodeId) {
                if (!canJoinSellerRoom(socket, sellerId)) {
                    console.warn(`Rejected seller node room join for socket ${socket.id}: ${sellerId}`);
                    return;
                }
                const roomName = `seller_${sellerId}_node_${nodeId}`;
                socket.join(roomName);
                console.log(`Seller ${sellerId} joined precise room: ${roomName}`);
            }
        });

        // Node-level subscription room
        socket.on("join_node_room", ({ sellerId, nodeId }) => {
            if (sellerId && nodeId) {
                if (!canJoinSellerRoom(socket, sellerId)) {
                    console.warn(`Rejected node room join for socket ${socket.id}: ${sellerId}`);
                    return;
                }
                const roomName = `node:${nodeId}`;
                socket.join(roomName);
                console.log(`Seller ${sellerId} joined node channel: ${roomName}`);
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

        // Join specific order tracking room
        socket.on("join_order_room", ({ orderId }) => {
            if (orderId) {
                const roomName = `order_${orderId}`;
                socket.join(roomName);
                console.log(`Socket joined order room: ${roomName}`);
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
