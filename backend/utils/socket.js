import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { initSupportSocket } from "./support.socket.js";

let io;

const getCookieValue = (cookieHeader = "", name) => {
    const cookie = cookieHeader
        .split(";")
        .map(part => part.trim())
        .find(part => part.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
};

export const getSocketUser = (socket) => {
    const securityKey = process.env.SecurityKey;
    if (!securityKey) return null;

    const authHeader = socket.handshake.headers?.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const cookieHeader = socket.handshake.headers?.cookie;
    const referer = socket.handshake.headers?.referer || "";
    const isSellerReferer = referer.includes("/seller");
    const customerCookieToken = getCookieValue(cookieHeader, "CustomerAccessToken") || getCookieValue(cookieHeader, "customerAccessToken");
    const sellerCookieToken = getCookieValue(cookieHeader, "SellerAccessToken") || getCookieValue(cookieHeader, "sellerAccessToken");
    const adminCookieToken = getCookieValue(cookieHeader, "AccessToken") || getCookieValue(cookieHeader, "adminAccessToken");
    const supportCookieToken = getCookieValue(cookieHeader, "SupportAccessToken") || getCookieValue(cookieHeader, "supportAccessToken");
    const authToken = socket.handshake.auth?.token;
    
    let token = authToken || bearerToken;
    if (!token) {
        if (isSellerReferer && sellerCookieToken) {
            token = sellerCookieToken;
        } else {
            token = customerCookieToken || sellerCookieToken || adminCookieToken || supportCookieToken;
        }
    }

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, securityKey);
        if (decoded && typeof decoded === "object") {
            const principalId = decoded._id || decoded.sellerId || decoded.id || decoded.userId;
            if (principalId) {
                if (!decoded._id) decoded._id = principalId;
                if (!decoded.sellerId && (decoded.role || "").toLowerCase() === "seller") {
                    decoded.sellerId = principalId;
                }
            }
        }
        return decoded;
    } catch (_err) {
        return null;
    }
};

const canJoinSellerRoom = (socket, sellerId) => {
    const socketUser = getSocketUser(socket);
    if (!socketUser) return false;
    const role = (socketUser.role || "").toLowerCase();
    const principalId = (socketUser._id || socketUser.sellerId || socketUser.id || "").toString();
    const isSeller = role === "seller" && principalId === sellerId?.toString();
    const isAdmin = role === "admin" || role === "super_admin" || role === "support_manager";
    return isSeller || isAdmin;
};

export const initSocket = (server) => {
    const allowedOrigins = process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(",").map(o => o.trim()) 
        : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:3001"];

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Admin joins global administrative command center room
        socket.on("join_admin_room", () => {
            const socketUser = getSocketUser(socket);
            const role = (socketUser?.role || "").toLowerCase();
            if (!socketUser || (role !== "admin" && role !== "super_admin" && role !== "support_manager")) {
                console.warn(`Rejected unauthorized admin_room join for socket ${socket.id}`);
                return;
            }
            socket.join("admin_room");
            console.log(`Socket ${socket.id} joined admin_room`);
        });

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
                const socketUser = getSocketUser(socket);
                if (!socketUser) {
                    console.warn(`Rejected unauthenticated customer room join for socket ${socket.id}`);
                    return;
                }
                const role = (socketUser.role || "").toLowerCase();
                const isAdmin = role === "admin" || role === "super_admin" || role === "support_manager";
                const isOwner = socketUser._id?.toString() === customerId?.toString();
                if (!isAdmin && !isOwner) {
                    console.warn(`Rejected unauthorized customer room join for socket ${socket.id}: ${customerId}`);
                    return;
                }
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

        // Initialize support features for this socket
        initSupportSocket(io, socket, getSocketUser(socket));
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
