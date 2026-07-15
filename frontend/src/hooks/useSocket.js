/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSellerAuthStore } from '../store/sellerAuthStore';
import { useOrderStore } from '../store/orderStore';
import { toast } from 'react-toastify';

// The URL where your socket server is running
// E.g., 'http://localhost:8000' or 'https://your-backend.com'
const getSocketURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
        return "https://indiafy-1.onrender.com";
    }
    return "http://localhost:8000";
};

export const useSocket = (activeNode) => {
    const socketRef = useRef(null);
    const { user, isAuthenticated } = useSellerAuthStore();
    const { fetchSellerOrders } = useOrderStore();

    useEffect(() => {
        if (isAuthenticated && user?._id && activeNode) {
            // Initialize socket connection
            socketRef.current = io(getSocketURL(), {
                withCredentials: true,
            });

            const socket = socketRef.current;

            socket.on("connect", () => {
                console.log("Connected to live server");
                // Join the specific node room
                socket.emit("join_seller_room", {
                    sellerId: user._id,
                    nodeType: activeNode
                });
            });

            // Listen for new orders
            socket.on("NEW_ORDER", (data) => {
                toast.success(`New order received: ₹${data.totalPrice}!`, {
                    icon: "🛎️",
                    autoClose: false
                });
                // Optimistically fetch latest orders for this node
                fetchSellerOrders(activeNode);
            });

            return () => {
                if (socket) {
                    socket.disconnect();
                }
            };
        }
    }, [isAuthenticated, user?._id, activeNode, fetchSellerOrders]);

    return socketRef.current;
};
