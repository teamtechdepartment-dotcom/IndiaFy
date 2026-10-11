import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader, Send, Phone, CheckCircle, User, FileText, Settings, X, MoreVertical, Lock } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import { useSupportSocket } from "../../hooks/useSupportSocket";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

const SupportWorkspace = () => {
  const { user } = useAdminAuthStore();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [queueMode, setQueueMode] = useState("chats"); // "chats" | "callbacks"
  const [agentStatus, setAgentStatus] = useState("online");
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeConvDetails, setActiveConvDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messageCursor, setMessageCursor] = useState(null);
  
  const [queueLoading, setQueueLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [typing, setTyping] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [queueFilter, setQueueFilter] = useState("unassigned");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [mobilePane, setMobilePane] = useState("queue"); // queue | chat | context
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load Queue
  const loadQueue = useCallback(async (filter = queueFilter, search = searchQuery) => {
    try {
      setQueueLoading(true);
      
      const params = {};
      
      // Map frontend filters to backend supported params (Phase 1/2 backend params)
      // "unassigned", "assigned", "waiting", "priority"
      if (filter === "unassigned") {
        params.status = "open";
      } else if (filter === "assigned_me") {
        params.assignedToMe = "true";
      } else if (filter === "waiting") {
        params.status = "waiting_agent";
      } else if (filter === "escalated") {
        params.status = "escalated";
      }
      
      // Search - documented as missing backend support if not fully supported, but we pass it
      if (search) {
        params.search = search;
      }
      
      const res = await axiosInstance.get('/support/conversations', { params });
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load queue");
    } finally {
      setQueueLoading(false);
    }
  }, [queueFilter, searchQuery]);

  // Load Callbacks
  const loadCallbacks = useCallback(async () => {
    try {
      setQueueLoading(true);
      const res = await axiosInstance.get('/support/callbacks');
      setCallbacks(res.data.callbacks || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load callbacks");
    } finally {
      setQueueLoading(false);
    }
  }, []);

  // Initial Queue Load
  useEffect(() => {
    if (queueMode === "chats") {
      loadQueue();
    } else {
      loadCallbacks();
    }
  }, [loadQueue, loadCallbacks, queueMode]);

  // Load Chat
  useEffect(() => {
    if (!activeConvId) return;
    
    const loadConversation = async () => {
      try {
        setChatLoading(true);
        // Load Details
        const detailRes = await axiosInstance.get(`/support/conversations/${activeConvId}`);
        setActiveConvDetails(detailRes.data.conversation);
        
        // Load Messages
        const msgRes = await axiosInstance.get(`/support/conversations/${activeConvId}/messages?limit=50`);
        setMessages(msgRes.data.messages || []);
        setHasMoreMessages(msgRes.data.hasMore);
        setMessageCursor(msgRes.data.cursor);
        
        // Reset state
        setTyping("");
        setTypingUsers({});
        
        if (window.innerWidth < 768) setMobilePane("chat");
        
      } catch (err) {
        console.error(err);
        toast.error("Failed to load conversation");
      } finally {
        setChatLoading(false);
      }
    };
    
    loadConversation();
  }, [activeConvId]);

  // Scroll to bottom when messages load initial or new message arrives
  useEffect(() => {
    if (messagesEndRef.current && !hasMoreMessages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, hasMoreMessages]);

  // Load Older Messages
  const handleScroll = async () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop } = messagesContainerRef.current;
    
    if (scrollTop === 0 && hasMoreMessages && messageCursor) {
      try {
        // preserve scroll pos
        const oldScrollHeight = messagesContainerRef.current.scrollHeight;
        
        const msgRes = await axiosInstance.get(`/support/conversations/${activeConvId}/messages?limit=50&before=${messageCursor}`);
        
        const newMessages = msgRes.data.messages || [];
        setMessages(prev => [...newMessages, ...prev]);
        setHasMoreMessages(msgRes.data.hasMore);
        setMessageCursor(msgRes.data.cursor);
        
        // restore scroll
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - oldScrollHeight;
          }
        }, 0);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Socket
  const { isConnected, sendMessage, sendTypingStart, sendTypingStop, sendReadReceipt } = useSupportSocket(activeConvId, {
    onNewMessage: (data) => {
      if (data.message.conversationId === activeConvId) {
        setMessages(prev => {
          // Prevent duplicates if optimistic
          if (prev.find(m => m.clientMessageId === data.message.clientMessageId)) return prev;
          return [...prev, data.message];
        });
        
        // Send read receipt if we are focused
        if (document.visibilityState === 'visible') {
          sendReadReceipt(activeConvId, data.message._id);
        }
      }
      
      // Update queue snippet
      setConversations(prev => prev.map(c => 
        c._id === data.message.conversationId 
          ? { ...c, lastMessageAt: data.message.createdAt, messageCount: c.messageCount + 1 }
          : c
      ));
    },
    onMessageDelivered: (data) => {
      setMessages(prev => prev.map(m => 
        m.clientMessageId === data.clientMessageId 
          ? { ...m, _id: data.messageId, delivered: true }
          : m
      ));
    },
    onMessageRead: (data) => {
      setMessages(prev => prev.map(m => 
        m._id === data.messageId ? { ...m, readAt: data.readAt } : m
      ));
    },
    onTypingStart: (data) => {
      if (data.conversationId === activeConvId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.name }));
      }
    },
    onTypingStop: (data) => {
      if (data.conversationId === activeConvId) {
        setTypingUsers(prev => {
          const newObj = { ...prev };
          delete newObj[data.userId];
          return newObj;
        });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Socket Error");
    }
  });

  const handleSend = () => {
    if (!typing.trim() || !activeConvId) return;
    
    const clientMessageId = uuidv4();
    const tempMsg = {
      _id: 'temp-' + clientMessageId,
      body: typing.trim(),
      clientMessageId,
      senderId: user._id,
      senderType: 'admin',
      messageType: isInternalNote ? 'internal_note' : 'customer',
      createdAt: new Date().toISOString(),
      optimistic: true
    };
    
    setMessages(prev => [...prev, tempMsg]);
    sendMessage(activeConvId, typing.trim(), clientMessageId, [], isInternalNote ? 'internal_note' : 'customer');
    setTyping("");
    sendTypingStop(activeConvId);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setTyping(e.target.value);
    
    if (activeConvId) {
      sendTypingStart(activeConvId);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop(activeConvId);
      }, 2000);
    }
  };
  
  const handleAssignToMe = async () => {
    if (!activeConvId) return;
    try {
      await axiosInstance.post(`/support/conversations/${activeConvId}/assign`, { agentId: user._id });
      toast.success("Assigned to you");
      loadQueue();
      setActiveConvDetails(prev => ({ ...prev, assignedAgentId: user._id }));
    } catch (err) {
      toast.error("Failed to assign");
    }
  };

  // UI Components
  const QueuePane = () => (
    <div className={`flex flex-col h-full border-r border-gray-200 bg-white md:w-80 lg:w-96 flex-shrink-0 ${mobilePane === "queue" ? "w-full absolute inset-0 z-10" : "hidden md:flex"}`}>
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Support Workspace</h2>
          <select 
            value={agentStatus} 
            onChange={(e) => setAgentStatus(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-[#065F46]"
          >
            <option value="online">🟢 Online</option>
            <option value="away">🟡 Away</option>
            <option value="offline">⚪ Offline</option>
          </select>
        </div>
        
        <div className="flex space-x-2 mb-3">
          <button 
            className={`flex-1 py-1.5 text-xs font-medium rounded ${queueMode === "chats" ? "bg-[#065F46] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setQueueMode("chats")}
          >
            Live Chats
          </button>
          <button 
            className={`flex-1 py-1.5 text-xs font-medium rounded ${queueMode === "callbacks" ? "bg-[#065F46] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setQueueMode("callbacks")}
          >
            Callbacks
          </button>
        </div>
        <div className="relative mb-3">
          <input 
            type="text" 
            placeholder="Search ticket, order, customer..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#065F46]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => loadQueue()}
            onKeyDown={(e) => e.key === 'Enter' && loadQueue()}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        </div>
        <select 
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#065F46]"
          value={queueFilter}
          onChange={(e) => setQueueFilter(e.target.value)}
        >
          <option value="all">All Active</option>
          <option value="unassigned">Unassigned</option>
          <option value="assigned_me">Assigned to Me</option>
          <option value="waiting">Waiting on Agent</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {queueLoading ? (
          <div className="flex justify-center p-8"><Loader className="w-6 h-6 animate-spin text-[#065F46]" /></div>
        ) : queueMode === "chats" && conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No conversations found.</div>
        ) : queueMode === "callbacks" && callbacks.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No active callbacks.</div>
        ) : queueMode === "chats" ? (
          <div className="divide-y divide-gray-100">
            {conversations.map(conv => (
              <div 
                key={conv._id}
                onClick={() => setActiveConvId(conv._id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${activeConvId === conv._id ? 'bg-[#065F46]/5 border-l-4 border-[#065F46]' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-gray-900 truncate pr-2">
                    {conv.subject || `Order #${conv.orderId?.slice(-6) || 'General'}`}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium flex-shrink-0">
                    {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })},{" "}
                    {new Date(conv.lastMessageAt || conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 truncate">{conv.customerId?.name || 'Customer'}</span>
                  {conv.priority === 'high' && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-sm font-medium">HIGH</span>}
                </div>
              </div>
            ))}
          </div>
        ) : queueMode === "callbacks" ? (
          <div className="divide-y divide-gray-100">
            {callbacks.map(cb => (
              <div 
                key={cb._id}
                onClick={() => setActiveConvId(cb.conversationId)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${activeConvId === cb.conversationId ? 'bg-[#065F46]/5 border-l-4 border-[#065F46]' : 'border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-gray-900 truncate pr-2 flex items-center">
                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                    Callback ({cb.status})
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium flex-shrink-0">
                    {new Date(cb.requestedAt || cb.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })},{" "}
                    {new Date(cb.requestedAt || cb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-mono text-gray-600 truncate">{cb.phone}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{cb.requestedTimeWindow}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );

  const ChatPane = () => (
    <div className={`flex flex-col h-full bg-white flex-1 ${mobilePane === "chat" ? "w-full absolute inset-0 z-20" : "hidden md:flex"}`}>
      {activeConvId ? (
        <>
          {/* Header */}
          <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between flex-shrink-0 bg-white">
            <div className="flex items-center">
              <button className="md:hidden mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setMobilePane("queue")}>
                <Search className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                  {activeConvDetails?.subject || 'Support Conversation'}
                </h3>
                <div className="text-xs text-gray-500 flex flex-wrap items-center mt-0.5 gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>{activeConvDetails?.status === 'open' ? 'Open' : activeConvDetails?.status}</span>
                  <span>•</span>
                  <span className="font-mono text-gray-600">{activeConvDetails?.ticketNumber || activeConvDetails?._id}</span>
                  {activeConvDetails?.createdAt && (
                    <>
                      <span>•</span>
                      <span className="text-gray-500 font-medium">
                        📅 {new Date(activeConvDetails.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })},{" "}
                        {new Date(activeConvDetails.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setMobilePane("context")}>
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 bg-[#f1f2f4] space-y-4"
          >
            {chatLoading ? (
               <div className="flex justify-center p-8"><Loader className="w-6 h-6 animate-spin text-[#065F46]" /></div>
            ) : (
              <>
                {hasMoreMessages && (
                  <div className="text-center pb-2"><Loader className="w-4 h-4 animate-spin inline text-gray-400" /></div>
                )}
                {messages.map((msg, i) => {
                  const isAgent = msg.senderType === 'admin' || msg.senderType === 'support_manager';
                  const isInternal = msg.messageType === 'internal_note';
                  return (
                    <div key={msg._id || i} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${
                        isInternal ? 'bg-amber-100 text-amber-900 rounded-br-none border border-amber-300' :
                        isAgent ? 'bg-[#065F46] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                      } ${msg.optimistic ? 'opacity-70' : ''}`}>
                        {isInternal && <div className="text-[10px] uppercase font-bold text-amber-700 mb-1 flex items-center"><Lock className="w-3 h-3 mr-1"/> Internal Note</div>}
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 flex items-center space-x-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })},{" "}
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isAgent && !isInternal && msg.readAt && <CheckCircle className="w-3 h-3 text-blue-500" />}
                        {isAgent && !isInternal && msg.delivered && !msg.readAt && <CheckCircle className="w-3 h-3 text-gray-400" />}
                      </div>
                    </div>
                  );
                })}
                {Object.keys(typingUsers).length > 0 && (
                  <div className="text-xs text-gray-500 italic">
                    {Object.values(typingUsers).join(", ")} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center mb-2 px-1">
               <label className="flex items-center cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} className="mr-2 rounded text-amber-600 focus:ring-amber-500" />
                  <Lock className="w-3 h-3 mr-1 text-amber-600" /> Make Internal Note (Hidden from Customer)
               </label>
            </div>
            <div className={`flex items-end bg-gray-50 border rounded-lg overflow-hidden focus-within:ring-1 ${isInternalNote ? 'border-amber-300 focus-within:border-amber-500 focus-within:ring-amber-500/50 bg-amber-50/30' : 'border-gray-300 focus-within:border-[#065F46] focus-within:ring-[#065F46]/50'}`}>
              <textarea
                value={typing}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Shift+Enter for new line)"
                className="flex-1 max-h-32 min-h-[2.5rem] p-3 bg-transparent resize-none focus:outline-none text-sm"
                rows={1}
                disabled={chatLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!typing.trim() || chatLoading}
                className="p-3 text-[#065F46] disabled:text-gray-400 hover:bg-gray-100 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-[#f1f2f4]">
          <Search className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-medium text-gray-500">No Conversation Selected</p>
          <p className="text-sm mt-2">Select a conversation from the queue to start support.</p>
        </div>
      )}
    </div>
  );

  const ContextPane = () => (
    <div className={`flex flex-col h-full bg-white border-l border-gray-200 lg:w-72 xl:w-80 flex-shrink-0 ${mobilePane === "context" ? "w-full absolute inset-0 z-30" : "hidden lg:flex"}`}>
      {activeConvId ? (
        <>
          <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between lg:justify-start">
             <button className="lg:hidden mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setMobilePane("chat")}>
                <X className="w-5 h-5" />
              </button>
            <h3 className="font-semibold text-gray-800">Customer Context</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Action Bar */}
            <div className="space-y-2">
               {!activeConvDetails?.assignedAgentId || activeConvDetails.assignedAgentId !== user._id ? (
                  <button onClick={handleAssignToMe} className="w-full py-2 bg-[#065F46] hover:bg-[#044c38] text-white text-sm font-medium rounded transition-colors shadow-sm">
                    Assign to Me
                  </button>
               ) : (
                  <div className="w-full py-2 bg-green-50 text-green-800 text-sm font-medium rounded border border-green-200 text-center flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> Assigned to You
                  </div>
               )}
               {(() => {
                 const activeCallback = callbacks.find(cb => cb.conversationId === activeConvId);
                 if (activeCallback) {
                   return (
                     <div className="w-full p-3 bg-amber-50 text-amber-900 text-sm font-medium rounded border border-amber-200">
                       <div className="flex items-center mb-2">
                         <Phone className="w-4 h-4 mr-2" /> Callback Requested
                       </div>
                       <div className="text-xs font-mono bg-white p-1 mb-2 border border-amber-100 rounded text-center">
                         {activeCallback.phone}
                       </div>
                       <div className="flex gap-2">
                         <button 
                           onClick={async () => {
                             try {
                               await axiosInstance.post(`/support/callbacks/${activeCallback._id}/start-call`);
                               loadCallbacks();
                               toast.success("Calling customer\u2026");
                             } catch(err) { const code = err?.response?.data?.message || "Failed to initiate call"; toast.error(code); }
                           }}
                           className="flex-1 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs transition-colors"
                         >
                           Start Call
                         </button>
                         <button 
                           onClick={async () => {
                             try {
                               await axiosInstance.put(`/support/callbacks/${activeCallback._id}/status`, { status: "completed" });
                               loadCallbacks();
                               toast.success("Callback marked completed");
                             } catch(err) { toast.error("Failed"); }
                           }}
                           className="flex-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                         >
                           Resolve
                         </button>
                       </div>
                     </div>
                   );
                 } else {
                   return (
                     <button className="w-full py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded border border-gray-300 transition-colors shadow-sm flex items-center justify-center opacity-50 cursor-not-allowed" title="Phase 4 functionality">
                        <Phone className="w-4 h-4 mr-2" /> Request Callback
                     </button>
                   );
                 }
               })()}
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center"><User className="w-3 h-3 mr-1" /> Customer</h4>
              {activeConvDetails?.customerId && typeof activeConvDetails.customerId === 'object' ? (
                <div className="bg-gray-50 p-3 rounded text-sm border border-gray-100">
                  <div className="grid grid-cols-[80px_1fr] gap-1 mb-1">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{activeConvDetails.customerId.firstName} {activeConvDetails.customerId.lastName}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1 mb-1">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-900 truncate" title={activeConvDetails.customerId.email}>{activeConvDetails.customerId.email || '-'}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-gray-500">Phone</span>
                    <span className="text-gray-900">{activeConvDetails.customerId.phoneNumber || '-'}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-1 mt-1">
                    <span className="text-gray-500">Language</span>
                    <span className="text-gray-900">{activeConvDetails.customerId.preferredLanguage || 'English'}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded text-sm border border-gray-100">
                   <div className="grid grid-cols-[80px_1fr] gap-1 mb-1">
                    <span className="text-gray-500">ID</span>
                    <span className="font-mono text-xs truncate">{activeConvDetails?.customerId || '-'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center"><FileText className="w-3 h-3 mr-1" /> Order Reference</h4>
              <div className="bg-gray-50 p-3 rounded text-sm border border-gray-100">
                {activeConvDetails?.orderId && typeof activeConvDetails.orderId === 'object' ? (
                   <>
                    <div className="grid grid-cols-[80px_1fr] gap-1 mb-1">
                      <span className="text-gray-500">Order ID</span>
                      <span className="font-medium text-[#065F46] hover:underline cursor-pointer truncate" title={activeConvDetails.orderId._id}>#{activeConvDetails.orderId._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-1 mb-1">
                      <span className="text-gray-500">Status</span>
                      <span className="text-gray-900 capitalize font-medium">{activeConvDetails.orderId.status || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-1 mb-1">
                      <span className="text-gray-500">Total</span>
                      <span className="text-gray-900">₹{activeConvDetails.orderId.totalAmount?.toLocaleString() || '0'}</span>
                    </div>
                  </>
                ) : activeConvDetails?.orderId ? (
                   <div className="grid grid-cols-[80px_1fr] gap-1 mb-1">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono text-xs truncate">{activeConvDetails?.orderId}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No order linked</span>
                )}
              </div>
            </div>
            
             {/* Ticket Details */}
             <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center"><Settings className="w-3 h-3 mr-1" /> Properties</h4>
              <div className="bg-gray-50 p-3 rounded text-sm border border-gray-100">
                <div className="grid grid-cols-[80px_1fr] gap-1 mb-2">
                  <span className="text-gray-500">Category</span>
                  <span className="capitalize">{activeConvDetails?.category}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-1 mb-2">
                  <span className="text-gray-500">Channel</span>
                  <span className="capitalize">{activeConvDetails?.channel}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-1 mb-2">
                  <span className="text-gray-500">Priority</span>
                  <span className="capitalize">{activeConvDetails?.priority}</span>
                </div>
                {activeConvDetails?.createdAt && (
                  <div className="grid grid-cols-[80px_1fr] gap-1 mb-2">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900 font-medium text-xs">
                      {new Date(activeConvDetails.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })},{" "}
                      {new Date(activeConvDetails.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {activeConvDetails?.updatedAt && (
                  <div className="grid grid-cols-[80px_1fr] gap-1">
                    <span className="text-gray-500">Updated</span>
                    <span className="text-gray-900 font-medium text-xs">
                      {new Date(activeConvDetails.updatedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })},{" "}
                      {new Date(activeConvDetails.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center bg-gray-50">
          <p className="text-sm">Context will appear here</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex w-full h-full relative overflow-hidden bg-[#f1f2f4]">
      <QueuePane />
      <ChatPane />
      <ContextPane />
    </div>
  );
};

export default SupportWorkspace;
