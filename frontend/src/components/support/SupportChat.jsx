import React, { useState, useEffect, useRef } from "react";
import { Send, X, Loader, CheckCircle, Package, Phone } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
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
  const { user } = authStoreHook();

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
        // 1. Check existing
        let endpoint = `/indiafy/support/conversations`;
        const params = [];
        if (orderId) params.push(`orderId=${orderId}`);
        if (storeId) params.push(`storeId=${storeId}`);
        if (params.length > 0) endpoint += `?${params.join("&")}`;

        const res = await axiosInstance.get(endpoint);
        let conv = res.data.conversations?.[0];

        // 2. Create new if missing
        if (!conv) {
          const createRes = await axiosInstance.post(`/indiafy/support/conversations`, {
            subject: orderId ? `Order #${orderId.slice(-6)} Support` : defaultSubject,
            orderId,
            storeId,
          });
          conv = createRes.data.conversation;
        }

        if (isMounted) {
          setConversation(conv);
          fetchMessages(conv._id, 1);
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || "Failed to load support chat.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeConversation();

    return () => {
      isMounted = false;
    };
  }, [orderId, storeId, defaultSubject]);

  const fetchMessages = async (convId, pageNum = 1) => {
    try {
      const res = await axiosInstance.get(
        `/indiafy/support/conversations/${convId}/messages?page=${pageNum}&limit=30`
      );
      // Filter out internal notes just in case, though backend should do this
      const validMessages = res.data.messages.filter(m => m.messageType !== 'internal_note');
      
      setMessages((prev) => {
        const existing = pageNum === 1 ? [] : [...prev];
        const newIds = new Set(validMessages.map(m => m._id));
        const filteredExisting = existing.filter(m => !newIds.has(m._id));
        return [...validMessages, ...filteredExisting].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      });
      setHasMoreMessages(res.data.hasMore);
      setPage(res.data.currentPage);

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

  const handleSend = () => {
    if (!typingText.trim() || !activeConvId) return;

    const clientMessageId = uuidv4();
    const tempMsg = {
      _id: "temp-" + clientMessageId,
      body: typingText.trim(),
      clientMessageId,
      senderId: user._id,
      senderType: role,
      messageType: "customer", // Enforced client-side, also enforced backend
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    sendMessage(activeConvId, typingText.trim(), clientMessageId);
    setTypingText("");
    sendTypingStop(activeConvId);
    scrollToBottom();
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
      await axiosInstance.post(`/indiafy/support/conversations/${activeConvId}/callback`, {
        phone: callbackPhone.trim(),
      });
      setCallbackRequested(true);
      setShowCallbackForm(false);
    } catch (err) {
      console.error("Failed to request callback", err);
      // fallback or toast here
    } finally {
      setCallbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 justify-center items-center fixed sm:bottom-6 sm:right-6 bottom-0 right-0 left-0 z-50">
        <Loader className="w-8 h-8 animate-spin text-[#065F46]" />
        <p className="mt-4 text-sm text-gray-500">Connecting to Support...</p>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 justify-center items-center p-6 text-center fixed sm:bottom-6 sm:right-6 bottom-0 right-0 left-0 z-50">
        <div className="text-red-500 mb-2">Error</div>
        <p className="text-gray-700 text-sm">{error}</p>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] w-full max-w-md bg-white sm:rounded-lg shadow-2xl overflow-hidden border border-gray-200 flex-shrink-0 z-50 fixed sm:bottom-6 sm:right-6 bottom-0 right-0 left-0">
      {/* Header */}
      <div className="bg-[#065F46] text-white p-4 flex justify-between items-center shadow-sm">
        <div>
          <h3 className="font-semibold text-sm">IndiaFy Support</h3>
          {conversation && (
            <div className="text-xs text-[#065F46] bg-green-100/20 px-2 py-0.5 rounded inline-flex items-center mt-1 font-medium">
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></span>
              {isConnected ? "Connected" : "Reconnecting..."}
              <span className="mx-1.5">•</span>
              Ticket {conversation.ticketNumber}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeConvId && !callbackRequested && (
            <button
              onClick={() => setShowCallbackForm(!showCallbackForm)}
              className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors flex items-center text-xs font-medium"
              title="Request Callback"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
          {callbackRequested && (
            <div className="text-white/90 p-1.5 rounded flex items-center text-xs font-medium" title="Callback Requested">
              <CheckCircle className="w-4 h-4 mr-1 text-green-300" />
              Callback
            </div>
          )}
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showCallbackForm && (
        <div className="bg-[#065F46]/5 border-b border-[#065F46]/20 p-3 flex flex-col space-y-2 text-sm shadow-inner">
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
              className="px-3 py-1.5 bg-[#065F46] text-white rounded font-medium disabled:opacity-50 hover:bg-[#047857] transition-colors"
            >
              {callbackLoading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : "Request"}
            </button>
          </div>
        </div>
      )}

      {/* Order Context Banner */}
      {orderId && (
        <div className="bg-gray-50 border-b border-gray-200 p-2.5 px-4 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center font-medium">
            <Package className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            Order #{orderId.slice(-8).toUpperCase()}
          </div>
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
  );
}
