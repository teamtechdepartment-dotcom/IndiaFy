import { useEffect, useRef, useState, useCallback } from "react";
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

let globalSupportSocket = null;

export const useSupportSocket = (activeConversationId, callbacks = {}, authStoreHook = useAdminAuthStore) => {
  const { isAuthenticated, token } = authStoreHook();
  const [isConnected, setIsConnected] = useState(false);
  
  const callbacksRef = useRef(callbacks);
  
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!globalSupportSocket || !globalSupportSocket.connected) {
      globalSupportSocket = io(getSocketURL(), {
        withCredentials: true,
        auth: { token: token || undefined },
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });
    }

    const socket = globalSupportSocket;

    const handleConnect = () => {
      setIsConnected(true);
      console.log("[SupportSocket] Connected");
      
      // On connect/reconnect, we must re-join the active room if we have one
      if (activeConversationId) {
        socket.emit("support:conversation:join", { conversationId: activeConversationId });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("[SupportSocket] Disconnected");
    };

    const handleNewMessage = (data) => {
      if (callbacksRef.current.onNewMessage) {
        callbacksRef.current.onNewMessage(data);
      }
    };

    const handleMessageDelivered = (data) => {
      if (callbacksRef.current.onMessageDelivered) {
        callbacksRef.current.onMessageDelivered(data);
      }
    };

    const handleMessageRead = (data) => {
      if (callbacksRef.current.onMessageRead) {
        callbacksRef.current.onMessageRead(data);
      }
    };

    const handleTypingStart = (data) => {
      if (callbacksRef.current.onTypingStart) {
        callbacksRef.current.onTypingStart(data);
      }
    };

    const handleTypingStop = (data) => {
      if (callbacksRef.current.onTypingStop) {
        callbacksRef.current.onTypingStop(data);
      }
    };

    const handleError = (err) => {
      console.error("[SupportSocket] Error:", err);
      if (callbacksRef.current.onError) {
        callbacksRef.current.onError(err);
      }
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("support:message:new", handleNewMessage);
    socket.on("support:message:delivered", handleMessageDelivered);
    socket.on("support:message:read", handleMessageRead);
    socket.on("support:typing:start", handleTypingStart);
    socket.on("support:typing:stop", handleTypingStop);
    socket.on("support:error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("support:message:new", handleNewMessage);
      socket.off("support:message:delivered", handleMessageDelivered);
      socket.off("support:message:read", handleMessageRead);
      socket.off("support:typing:start", handleTypingStart);
      socket.off("support:typing:stop", handleTypingStop);
      socket.off("support:error", handleError);
    };
  }, [isAuthenticated, token, activeConversationId]);

  // Handle active conversation switching cleanly
  useEffect(() => {
    if (globalSupportSocket && globalSupportSocket.connected) {
      return () => {
        if (activeConversationId) {
          globalSupportSocket.emit("support:conversation:leave", { conversationId: activeConversationId });
        }
      };
    }
  }, [activeConversationId]);

  const sendMessage = useCallback((conversationId, body, clientMessageId, attachments = [], messageType = "customer") => {
    if (globalSupportSocket && globalSupportSocket.connected) {
      globalSupportSocket.emit("support:message:send", { conversationId, body, clientMessageId, attachments, messageType });
    }
  }, []);

  const sendTypingStart = useCallback((conversationId) => {
    if (globalSupportSocket && globalSupportSocket.connected) {
      globalSupportSocket.emit("support:typing:start", { conversationId });
    }
  }, []);

  const sendTypingStop = useCallback((conversationId) => {
    if (globalSupportSocket && globalSupportSocket.connected) {
      globalSupportSocket.emit("support:typing:stop", { conversationId });
    }
  }, []);

  const sendReadReceipt = useCallback((conversationId, messageId) => {
    if (globalSupportSocket && globalSupportSocket.connected) {
      globalSupportSocket.emit("support:message:read", { conversationId, messageId });
    }
  }, []);

  return { 
    isConnected, 
    sendMessage, 
    sendTypingStart, 
    sendTypingStop, 
    sendReadReceipt 
  };
};
