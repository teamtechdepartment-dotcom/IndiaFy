import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAdminAuthStore } from "../store/adminAuthStore";

const getSocketURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1")
  ) {
    return "https://indiafy-1.onrender.com";
  }
  return "http://localhost:8000";
};

let globalAdminSocket = null;

export const useAdminSocket = (onEvent) => {
  const { isAuthenticated, token } = useAdminAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!globalAdminSocket || !globalAdminSocket.connected) {
      globalAdminSocket = io(getSocketURL(), {
        withCredentials: true,
        auth: { token: token || undefined },
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });
    }

    const socket = globalAdminSocket;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit("join_admin_room");
      console.log("[AdminSocket] Connected & joined admin_room");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("[AdminSocket] Disconnected from live server");
    };

    const handleOrderCreated = (data) => {
      console.log("[AdminSocket] Real-time ORDER_CREATED event received:", data);
      if (onEventRef.current) {
        onEventRef.current("ORDER_CREATED", data);
      }
    };

    const handleOrderStatusUpdated = (data) => {
      console.log("[AdminSocket] Real-time ORDER_STATUS_UPDATED event received:", data);
      if (onEventRef.current) {
        onEventRef.current("ORDER_STATUS_UPDATED", data);
      }
    };

    const handleApplicationSubmitted = (data) => {
      console.log("[AdminSocket] Real-time SELLER_APPLICATION_SUBMITTED received:", data);
      if (onEventRef.current) {
        onEventRef.current("SELLER_APPLICATION_SUBMITTED", data);
      }
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("ORDER_CREATED", handleOrderCreated);
    socket.on("ORDER_STATUS_UPDATED", handleOrderStatusUpdated);
    socket.on("SELLER_APPLICATION_SUBMITTED", handleApplicationSubmitted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("ORDER_CREATED", handleOrderCreated);
      socket.off("ORDER_STATUS_UPDATED", handleOrderStatusUpdated);
      socket.off("SELLER_APPLICATION_SUBMITTED", handleApplicationSubmitted);
    };
  }, [isAuthenticated, token]);

  return { isConnected, socket: globalAdminSocket };
};
