/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useSellerAuthStore } from "../store/sellerAuthStore";
import { useOrderStore } from "../store/orderStore";
import { useNotificationStore } from "../store/notificationStore";
import toast from "react-hot-toast";

const getSocketURL = () => {
    return import.meta.env.VITE_API_URL || "http://localhost:8000";
};

// Singleton socket reference — shared across all components using this hook
// This prevents multiple socket connections when DashboardLayout re-renders
let globalSocket = null;
let currentRoomKey = null;

/**
 * useSellerSocket — connects to the socket server and joins the precise
 * seller_${sellerId}_node_${nodeId} room. Handles ORDER_CREATED events.
 *
 * @param {string} sellerId   - Seller's MongoDB _id
 * @param {string} nodeId     - Active SellerNode _id
 * @param {string} nodeType   - e.g. "LOCAL_RETAIL" (also joins legacy room)
 */
export const useSellerSocket = (sellerId, nodeId, nodeType) => {
    const socketRef = useRef(null);
    const processedOrderIdsRef = useRef(new Set());
    const { isAuthenticated, token } = useSellerAuthStore();
    const { fetchSellerOrders } = useOrderStore();
    const { incrementBadge, addNotification, fetchUnreadCounts } = useNotificationStore();

    // Stable join helper so we can call it on reconnect
    const joinRooms = useCallback((socket) => {
        if (!sellerId || !nodeId) return;

        socket.emit("join_seller_channel", { sellerId });
        socket.emit("join_node_room", { sellerId, nodeId });
        // New precise room
        socket.emit("join_seller_node_room", { sellerId, nodeId });
        // Legacy room (backward compat with existing useSocket)
        if (nodeType) {
            socket.emit("join_seller_room", { sellerId, nodeType });
        }
    }, [sellerId, nodeId, nodeType]);

    useEffect(() => {
        if (!isAuthenticated || !sellerId || !nodeId) return;

        const roomKey = `${sellerId}::${nodeId}`;

        // Disconnect previous socket before creating the active seller-room connection.
        if (globalSocket) {
            globalSocket.disconnect();
            globalSocket = null;
        }

        currentRoomKey = roomKey;

        const socket = io(getSocketURL(), {
            withCredentials: true,
            auth: token ? { token } : undefined,
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
        });

        socketRef.current = socket;
        globalSocket = socket;

        socket.on("connect", () => {
            console.log(`[SellerSocket] Connected: ${socket.id}`);
            joinRooms(socket);
            // Re-sync unread count from API on (re)connect
            fetchUnreadCounts([nodeId]);
            // Re-fetch current orders on reconnect
            if (nodeType) {
                fetchSellerOrders(nodeType, nodeId);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`[SellerSocket] Disconnected: ${reason}`);
        });

        socket.on("reconnect", () => {
            console.log("[SellerSocket] Reconnected, rejoining rooms...");
            joinRooms(socket);
        });

        // ─── ORDER_CREATED (new system) ──────────────────────────────────────
        socket.on("ORDER_CREATED", (data) => {
            console.log("[SellerSocket] ORDER_CREATED received:", data);

            // Only process notifications for this node
            if (data.nodeId && data.nodeId !== nodeId) return;

            const orderKey = data.orderId ? `${nodeId}:${data.orderId.toString()}` : null;
            if (orderKey) {
                if (processedOrderIdsRef.current.has(orderKey)) return;
                processedOrderIdsRef.current.add(orderKey);
            }

            // Increment badge counter
            incrementBadge(nodeId);

            // Add to in-memory notification list
            addNotification({
                ...data,
                receivedAt: new Date().toISOString(),
            });

            // Refresh orders list
            if (nodeType) {
                fetchSellerOrders(nodeType, nodeId);
            }

            // Visual + audio notification
            toast.success(
                `🛎️ New Order! ₹${data.totalAmount?.toLocaleString("en-IN") || data.totalPrice || 0} from ${data.customerName || "a customer"}`,
                {
                    duration: 6000,
                    position: "top-right",
                    style: {
                        background: "#0f172a",
                        color: "#f8fafc",
                        fontWeight: "700",
                        borderRadius: "16px",
                        fontSize: "14px",
                    },
                }
            );

            // Play notification sound (only when page is visible)
            if (document.visibilityState === "visible") {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = ctx.createOscillator();
                    const gainNode = ctx.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    oscillator.type = "sine";
                    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.4);
                } catch (_e) {
                    // AudioContext may be blocked — silently ignore
                }
            }
        });

        // Also handle legacy NEW_ORDER event for backward compatibility
        socket.on("NEW_ORDER", (data) => {
            console.log("[SellerSocket] Legacy NEW_ORDER received:", data);
            const orderKey = data.orderId ? `${nodeId}:${data.orderId.toString()}` : null;
            if (orderKey) {
                if (processedOrderIdsRef.current.has(orderKey)) return;
                processedOrderIdsRef.current.add(orderKey);
            }
            incrementBadge(nodeId);
            if (nodeType) {
                fetchSellerOrders(nodeType, nodeId);
            }
        });

        socket.on("connect_error", (err) => {
            console.warn("[SellerSocket] Connection error:", err.message);
        });

        return () => {
            socket.off("ORDER_CREATED");
            socket.off("NEW_ORDER");
            socket.disconnect();
            if (globalSocket === socket) {
                globalSocket = null;
                currentRoomKey = null;
            }
        };
    }, [isAuthenticated, token, sellerId, nodeId, nodeType]);

    return socketRef.current;
};

export default useSellerSocket;
