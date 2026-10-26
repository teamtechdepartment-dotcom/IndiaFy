import React, { useState, useEffect, useRef } from "react";
import { Send, X, Loader, CheckCircle, Package, Phone } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useSellerAuthStore } from "../../store/sellerAuthStore";
import { useSupportSocket } from "../../hooks/useSupportSocket";

export default function SupportChat({
  orderId,
  storeId,
  role = "customer",
  onClose,
  defaultSubject = "Support Request",
}) {
  const authStoreHook = role === "seller" ? useSellerAuthStore : useAuthStore;
  const { user, token } = authStoreHook();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingText, setTypingText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  
  // Callback states
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState(user?.phone || "");
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [callbackLoading, setCallbackLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const activeConvId = conversation?._id || null;

  const getRequestConfig = (customParams = {}) => {
    const headers = {};
    const effectiveToken =
      token ||
      (role === "seller"
        ? localStorage.getItem("sellerAccessToken") || (JSON.parse(localStorage.getItem("indiafy-seller-auth-storage") || "{}")?.state?.token)
        : localStorage.getItem("customerAccessToken") || (JSON.parse(localStorage.getItem("indiafy-auth-storage") || "{}")?.state?.token));

    if (effectiveToken) {
      headers.Authorization = `Bearer ${effectiveToken}`;
    }
    return {
      headers,
      params: customParams,
    };
  };

  const {
    isConnected,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    sendReadReceipt,
  } = useSupportSocket(
    activeConvId,
    {
      onNewMessage: (data) => {
        if (data.message.conversationId === activeConvId) {
          // If the message is an internal note, this shouldn't happen, but just in case:
          if (data.message.messageType === "internal_note") return;

          setMessages((prev) => {
            const exists = prev.find(
              (m) =>
                m._id === data.message._id ||
                (m.clientMessageId &&
                  m.clientMessageId === data.message.clientMessageId)
            );
            if (exists) {
              return prev.map((m) =>
                m.clientMessageId === data.message.clientMessageId
                  ? data.message
                  : m
              );
            }
            return [...prev, data.message];
          });
          
          if (document.visibilityState === "visible") {
            sendReadReceipt(activeConvId, data.message._id);
          }
          scrollToBottom();
        }
      },
      onMessageDelivered: (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === data.clientMessageId
              ? { ...m, _id: data.messageId, delivered: true }
              : m
          )
        );
      },
      onMessageRead: (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId ? { ...m, readAt: data.readAt } : m
          )
        );
      },
      onTypingStart: (data) => {
        if (data.conversationId === activeConvId) {
          setTypingUsers((prev) => ({ ...prev, [data.userId]: data.name }));
        }
      },
      onTypingStop: (data) => {
        if (data.conversationId === activeConvId) {
          setTypingUsers((prev) => {
            const newObj = { ...prev };
            delete newObj[data.userId];
            return newObj;
          });
        }
      },
      onError: (err) => {
        console.error("Socket error", err);
      },
    },
    authStoreHook
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  useEffect(() => {
    let isMounted = true;
    const initializeConversation = async () => {
      try {
        setLoading(true);
        setError(null);

        const isValidMongoId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
        const validOrderId = isValidMongoId(orderId) ? orderId : null;
        const validStoreId = isValidMongoId(storeId) ? storeId : null;

        // 1. Check existing
        const params = {};
        if (validOrderId) params.orderId = validOrderId;
        if (validStoreId) params.storeId = validStoreId;
        if (role === "seller") params.role = "seller";

        const res = await axiosInstance.get(`/support/conversations`, getRequestConfig(params));
        const conversations = res?.conversations || res?.data?.conversations || [];
        let conv = conversations[0];

        // 2. Create new if missing
        if (!conv) {
          const payload = {
            subject: validOrderId 
              ? `Order #${validOrderId.slice(-6)} Support` 
              : (role === "seller" ? "Seller Support Request" : defaultSubject),
          };
          if (validOrderId) payload.orderId = validOrderId;
          if (validStoreId) payload.storeId = validStoreId;

          const createRes = await axiosInstance.post(`/support/conversations`, payload, getRequestConfig());
          conv = createRes?.conversation || createRes?.data?.conversation;
        }

        if (isMounted) {
          if (!conv?._id) {
            throw new Error("Unable to establish support session.");
          }
          setConversation(conv);
          fetchMessages(conv._id, 1);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("[SupportChat] Failed to initialize support conversation:", err);
        const status = err.response?.status;
        let errorMessage = "Failed to load support chat.";
        if (status === 401) {
          errorMessage = "Session expired. Please log in again to access support.";
        } else if (status === 403) {
          errorMessage = "You are not authorized to access this support conversation.";
        } else if (status === 404) {
          errorMessage = "Support service is currently unavailable. Please try again later.";
        } else if (status >= 500) {
          errorMessage = "Support server encountered an error. Please try again shortly.";
        } else if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeConversation();

    return () => {
      isMounted = false;
    };
  }, [orderId, storeId, role, defaultSubject, token]);

  const fetchMessages = async (convId, pageNum = 1) => {
    try {
      const res = await axiosInstance.get(
        `/support/conversations/${convId}/messages`,
        getRequestConfig({ page: pageNum, limit: 30 })
      );
      const rawMessages = res?.messages || res?.data?.messages || [];
      // Filter out internal notes just in case, though backend should do this
      const validMessages = rawMessages.filter(m => m.messageType !== 'internal_note');
      
      setMessages((prev) => {
        const existing = pageNum === 1 ? [] : [...prev];
        const newIds = new Set(validMessages.map(m => m._id));
        const filteredExisting = existing.filter(m => !newIds.has(m._id));
        return [...validMessages, ...filteredExisting].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
      setHasMoreMessages(res?.hasMore ?? res?.data?.hasMore ?? false);
      setPage(res?.currentPage ?? res?.data?.currentPage ?? pageNum);

      if (pageNum === 1) {
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMoreMessages) {
      fetchMessages(activeConvId, page + 1);
    }
  };

  const handleSend = async () => {
    const text = typingText.trim();
    if (!text || !activeConvId) return;

    const clientMessageId = uuidv4();
    const tempMsg = {
      _id: "temp-" + clientMessageId,
      body: text,
      clientMessageId,
      senderId: user?._id || user?.sellerId,
      senderType: role,
      messageType: "customer",
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setTypingText("");
    sendTypingStop(activeConvId);
    scrollToBottom();

    // 1. Send via WebSocket if connected
    try {
      sendMessage(activeConvId, text, clientMessageId);
    } catch (_sErr) {
      console.warn("[SupportChat] Socket send error:", _sErr);
    }

    // 2. Guaranteed persistence in database via HTTP POST
    try {
      const res = await axiosInstance.post(
        `/support/conversations/${activeConvId}/messages`,
        {
          body: text,
          clientMessageId,
          messageType: "customer",
        },
        getRequestConfig()
      );
      const savedMsg = res?.message || res?.data?.message;
      if (savedMsg) {
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId
              ? { ...savedMsg, delivered: true }
              : m
          )
        );
      }
    } catch (err) {
      console.error("[SupportChat] Failed to send message via HTTP:", err);
      toast.error(err.response?.data?.message || "Failed to send message. Please retry.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setTypingText(e.target.value);

    if (activeConvId) {
      sendTypingStart(activeConvId);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop(activeConvId);
      }, 2000);
    }
  };

  const handleRequestCallback = async () => {
    if (!callbackPhone.trim() || !activeConvId) return;
    setCallbackLoading(true);
    try {
      const res = await axiosInstance.post(
        `/support/conversations/${activeConvId}/callback`,
        { phone: callbackPhone.trim() },
        getRequestConfig()
      );
      setCallbackRequested(true);
      setShowCallbackForm(false);
      toast.success(res.data?.message || "Callback requested! Support team will call you shortly.");
    } catch (err) {
      console.error("Failed to request callback", err);
      const errMsg = err.response?.data?.message || "Failed to request callback. Please try again.";
      toast.error(errMsg);
    } finally {
      setCallbackLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[140] sm:hidden" 
          onClick={onClose} 
          aria-hidden="true" 
        />
        <div className="flex flex-col h-[320px] sm:h-[360px] w-full sm:w-[410px] max-w-full sm:max-w-[calc(100vw-3rem)] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 justify-center items-center fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 z-[150] p-6 text-center">
          <Loader className="w-8 h-8 animate-spin text-[#065F46]" />
          <p className="mt-4 text-sm font-semibold text-gray-600">Connecting to Support...</p>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[140] sm:hidden" 
          onClick={onClose} 
          aria-hidden="true" 
        />
        <div className="flex flex-col h-[320px] sm:h-[360px] w-full sm:w-[410px] max-w-full sm:max-w-[calc(100vw-3rem)] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 justify-center items-center p-6 text-center fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 z-[150]">
          <div className="text-red-500 font-bold mb-2 text-sm">Support Unavailable</div>
          <p className="text-gray-600 text-xs px-4">{error}</p>
          <button
            onClick={onClose}
            className="mt-5 px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[140] sm:hidden transition-opacity" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <div className="flex flex-col h-[85dvh] sm:h-[min(580px,calc(100dvh-6rem))] max-h-[calc(100dvh-1.5rem)] w-full sm:w-[410px] max-w-full sm:max-w-[calc(100vw-3rem)] bg-white rounded-t-2xl sm:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden border border-gray-200/90 flex-shrink-0 z-[150] fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 transition-all duration-200">
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 bg-white/40 rounded-full mx-auto mt-2 sm:hidden absolute top-0 left-1/2 -translate-x-1/2 z-20" />

        {/* Header */}
        <div className="bg-[#065F46] text-white px-4 py-3 sm:py-3.5 flex justify-between items-center shadow-sm shrink-0 relative z-10 pt-4 sm:pt-3.5">
          <div className="min-w-0 pr-2">
            <h3 className="font-bold text-sm tracking-tight truncate">IndiaFy Support</h3>
            {conversation && (
              <div className="text-emerald-100 bg-white/15 px-2.5 py-0.5 rounded-full inline-flex items-center mt-1 text-[11px] font-medium tracking-wide">
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
                    isConnected ? "bg-emerald-300" : "bg-red-400"
                  }`}
                ></span>
                <span className="truncate">{isConnected ? "Connected" : "Reconnecting..."}</span>
                <span className="mx-1.5 opacity-60">•</span>
                <span className="truncate font-semibold">{conversation.ticketNumber}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {activeConvId && !callbackRequested && (
              <button
                onClick={() => setShowCallbackForm(!showCallbackForm)}
                className="text-white/90 hover:text-white hover:bg-white/15 p-2 rounded-lg transition-colors flex items-center text-xs font-semibold cursor-pointer"
                title="Request Callback"
                aria-label="Request Callback"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
            {callbackRequested && (
              <div className="text-white/90 p-1.5 rounded flex items-center text-xs font-medium" title="Callback Requested">
                <CheckCircle className="w-4 h-4 mr-1 text-emerald-300" />
                <span className="hidden xs:inline">Callback</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer active:scale-95"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showCallbackForm && (
          <div className="bg-[#065F46]/5 border-b border-[#065F46]/20 p-3 flex flex-col space-y-2 text-sm shadow-inner shrink-0">
            <p className="text-gray-700 text-xs font-medium">Request a callback from our support team</p>
            <div className="flex space-x-2">
              <input
                type="tel"
                placeholder="Your Phone Number"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#065F46] focus:ring-1 focus:ring-[#065F46]/50 text-sm"
                value={callbackPhone}
                onChange={(e) => setCallbackPhone(e.target.value)}
              />
              <button
                onClick={handleRequestCallback}
                disabled={callbackLoading || !callbackPhone.trim()}
                className="px-3 py-1.5 bg-[#065F46] text-white rounded font-medium disabled:opacity-50 hover:bg-[#047857] transition-colors cursor-pointer"
              >
                {callbackLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : "Request"}
              </button>
            </div>
          </div>
        )}

        {/* Order Context Banner */}
        {orderId && (
          <div className="bg-gray-50 border-b border-gray-200 py-2 px-4 flex items-center justify-between text-xs text-gray-700 font-semibold shrink-0">
            <div className="flex items-center min-w-0 pr-2">
              <Package className="w-3.5 h-3.5 mr-1.5 text-emerald-700 shrink-0" />
              <span className="truncate">Order #{orderId.slice(-8).toUpperCase()}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300/60 px-2 py-0.5 rounded-full shrink-0">
              Linked
            </span>
          </div>
        )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-[#f1f2f4] space-y-4"
      >
        {hasMoreMessages && (
          <div className="text-center pb-2">
            <Loader className="w-4 h-4 animate-spin inline text-gray-400" />
          </div>
        )}
        
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 bg-gray-200/50 inline-block px-3 py-1 rounded-full">
            Support Chat Started
          </p>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.senderId === user._id;
          return (
            <div
              key={msg._id || i}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[1.25rem] px-4 py-2 text-sm shadow-sm ${
                  isMe
                    ? "bg-[#065F46] text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                } ${msg.optimistic ? "opacity-70" : ""}`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.body}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 mt-1 flex items-center space-x-1 px-1">
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMe && msg.readAt && (
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                )}
                {isMe && msg.delivered && !msg.readAt && (
                  <CheckCircle className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
          );
        })}
        {Object.keys(typingUsers).length > 0 && (
          <div className="text-xs text-gray-500 italic">
            Support is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200">
        {!isConnected && (
          <div className="text-[10px] text-red-500 mb-1 px-1 text-center font-medium">
            Connection lost. Attempting to reconnect...
          </div>
        )}
        <div className="flex items-end bg-gray-50 border border-gray-300 rounded-xl overflow-hidden focus-within:border-[#065F46] focus-within:ring-1 focus-within:ring-[#065F46]/50">
          <textarea
            value={typingText}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 max-h-32 min-h-[44px] p-3 bg-transparent resize-none focus:outline-none text-sm"
            rows={1}
            disabled={!isConnected}
          />
          <button
            onClick={handleSend}
            disabled={!typingText.trim() || !isConnected}
            className="p-3 text-[#065F46] disabled:text-gray-400 hover:bg-gray-200/50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
