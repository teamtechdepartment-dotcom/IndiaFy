/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Loader,
  Send,
  LifeBuoy,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Package,
  FileText,
  Lock,
  RefreshCw,
  Tag,
  ChevronRight,
  Filter,
  CheckCheck,
  RotateCcw,
  UserCheck,
  Building,
  Shield,
  MessageSquare,
  HelpCircle,
  Trash2,
  X
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import { useSupportAuthStore } from "../../store/supportAuthStore";
import toast from "react-hot-toast";

export default function SupportWorkspace() {
  const adminAuth = useAdminAuthStore();
  const supportAuth = useSupportAuthStore();

  const currentUser = supportAuth.isAuthenticated && supportAuth.user
    ? supportAuth.user
    : adminAuth.user;

  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    inProgress: 0,
    waiting: 0,
    resolved: 0,
    assignedToMe: 0,
  });

  // Ticket Queue State
  const [tickets, setTickets] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all"); // "all", "me", "unassigned"
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);

  // Active Ticket State
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Customer Context State
  const [customerContext, setCustomerContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);

  // Staff list for assignments
  const [supportMembers, setSupportMembers] = useState([]);

  // Composer State
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Mobile layout tab
  const [mobilePane, setMobilePane] = useState("queue"); // "queue" | "chat" | "context"

  const messagesEndRef = useRef(null);

  // Scroll messages to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages, selectedTicket?.internalNotes]);

  // Load Dashboard Metrics
  const loadMetrics = async () => {
    try {
      const res = await axiosInstance.get("/support-workspace/dashboard");
      const data = res?.data || res;
      if (data) setMetrics(data);
    } catch (err) {
      console.warn("Failed to fetch support dashboard metrics:", err.message);
    }
  };

  // Load Support Members
  const loadMembers = async () => {
    try {
      const res = await axiosInstance.get("/support-workspace/members");
      const data = res?.data || res;
      if (Array.isArray(data)) setSupportMembers(data);
    } catch (err) {
      console.warn("Failed to fetch support members:", err.message);
    }
  };

  // Load Tickets Queue
  const loadTickets = useCallback(async (silent = false) => {
    if (!silent) setQueueLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (assignmentFilter !== "all") params.assignedTo = assignmentFilter;

      const res = await axiosInstance.get("/support-workspace/tickets", { params });
      const data = res?.data?.tickets || res?.tickets || [];
      setTickets(Array.isArray(data) ? data : []);

      // If nothing selected or selected ticket updated, refresh selection
      if (selectedTicketId) {
        const found = data.find((t) => t._id === selectedTicketId);
        if (found) {
          setSelectedTicket((prev) => ({
            ...prev,
            ...found,
            messages: prev?.messages || found.messages,
            internalNotes: prev?.internalNotes || found.internalNotes,
          }));
        }
      } else if (data.length > 0 && !selectedTicketId && window.innerWidth >= 768) {
        // Auto-select first ticket on desktop
        handleSelectTicket(data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load support tickets:", err);
      if (!silent) toast.error("Failed to load tickets queue");
    } finally {
      if (!silent) setQueueLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, assignmentFilter, selectedTicketId]);

  // Initial Data Load
  useEffect(() => {
    loadMetrics();
    loadMembers();
    loadTickets();
  }, []);

  // Reload queue when filters change
  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter, assignmentFilter]);

  // Select Ticket & Fetch Details + Customer Context
  const handleSelectTicket = async (ticketId) => {
    if (!ticketId) return;
    setSelectedTicketId(ticketId);
    setTicketLoading(true);
    setContextLoading(true);

    if (window.innerWidth < 768) {
      setMobilePane("chat");
    }

    try {
      const [ticketRes, contextRes] = await Promise.all([
        axiosInstance.get(`/support-workspace/tickets/${ticketId}`),
        axiosInstance.get(`/support-workspace/tickets/${ticketId}/customer-context`).catch(() => null),
      ]);

      const ticketData = ticketRes?.data || ticketRes;
      setSelectedTicket(ticketData);

      if (contextRes) {
        const contextData = contextRes?.data || contextRes;
        setCustomerContext(contextData);
      }
    } catch (err) {
      console.error("Error loading ticket details:", err);
      toast.error("Failed to load ticket details");
    } finally {
      setTicketLoading(false);
      setContextLoading(false);
    }
  };

  // Send Message or Internal Note
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!selectedTicketId || !text) return;

    setSending(true);
    setReplyText("");

    const isNote = isInternalNote;
    const actorName = currentUser?.name || `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() || "Support Staff";

    // Optimistic UI update
    if (isNote) {
      const optimisticNote = {
        adminName: actorName,
        note: text,
        createdAt: new Date().toISOString(),
      };
      setSelectedTicket((prev) =>
        prev ? { ...prev, internalNotes: [...(prev.internalNotes || []), optimisticNote] } : prev
      );
    } else {
      const optimisticMsg = {
        senderType: "admin",
        senderName: actorName,
        body: text,
        createdAt: new Date().toISOString(),
      };
      setSelectedTicket((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), optimisticMsg] } : prev
      );
    }

    try {
      if (isNote) {
        await axiosInstance.post(`/support-workspace/tickets/${selectedTicketId}/notes`, { note: text });
        toast.success("Internal note added");
      } else {
        await axiosInstance.post(`/support-workspace/tickets/${selectedTicketId}/messages`, { body: text });
        toast.success("Public reply dispatched");
      }

      // Silent sync
      const res = await axiosInstance.get(`/support-workspace/tickets/${selectedTicketId}`);
      const updated = res?.data || res;
      if (updated?._id) setSelectedTicket(updated);
      loadTickets(true);
      loadMetrics();
    } catch (err) {
      console.error("Failed to post message:", err);
      toast.error(isNote ? "Failed to save internal note" : "Failed to post reply");
    } finally {
      setSending(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicketId || !newStatus) return;
    try {
      await axiosInstance.patch(`/support-workspace/tickets/${selectedTicketId}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
      loadTickets(true);
      loadMetrics();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Update Priority
  const handleUpdatePriority = async (newPriority) => {
    if (!selectedTicketId || !newPriority) return;
    try {
      await axiosInstance.patch(`/support-workspace/tickets/${selectedTicketId}`, { priority: newPriority });
      toast.success(`Priority updated to ${newPriority}`);
      setSelectedTicket((prev) => (prev ? { ...prev, priority: newPriority } : prev));
      loadTickets(true);
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };



  // Resolve Ticket
  const handleResolveTicket = async () => {
    if (!selectedTicketId) return;
    try {
      const res = await axiosInstance.post(`/support-workspace/tickets/${selectedTicketId}/resolve`, {
        resolutionNotes,
      });
      const updated = res?.data || res;
      toast.success("Ticket resolved");
      setSelectedTicket(updated);
      setShowResolveModal(false);
      setResolutionNotes("");
      loadTickets(true);
      loadMetrics();
    } catch (err) {
      toast.error("Failed to resolve ticket");
    }
  };

  // Close Ticket & Automatically Refill Capacity
  const handleCloseTicket = async () => {
    if (!selectedTicketId) return;
    const reason = window.prompt("Enter reason for closing this ticket:");
    if (reason === null) return;
    try {
      const res = await axiosInstance.post(`/support-workspace/tickets/${selectedTicketId}/close`, {
        reason: reason.trim() || "Closed by Support Member",
      });
      const updated = res?.data || res;
      toast.success("Ticket closed and capacity refilled");
      setSelectedTicket(updated);
      loadTickets(true);
      loadMetrics();
    } catch (err) {
      toast.error("Failed to close ticket");
    }
  };

  // Reopen Ticket
  const handleReopenTicket = async () => {
    if (!selectedTicketId) return;
    try {
      const res = await axiosInstance.post(`/support-workspace/tickets/${selectedTicketId}/reopen`, {
        reason: "Customer requested further investigation",
      });
      const updated = res?.data || res;
      toast.success("Ticket reopened");
      setSelectedTicket(updated);
      loadTickets(true);
      loadMetrics();
    } catch (err) {
      toast.error("Failed to reopen ticket");
    }
  };

  // Delete Ticket Permanently
  const handleDeleteTicket = async () => {
    if (!selectedTicketId) return;
    const ok = window.confirm(
      "Are you sure you want to permanently delete this support ticket? All messages, notes, and activity history will be erased."
    );
    if (!ok) return;
    try {
      await axiosInstance.delete(`/support-workspace/tickets/${selectedTicketId}`);
      toast.success("Ticket permanently deleted");
      setSelectedTicketId(null);
      setSelectedTicket(null);
      loadTickets(false);
      loadMetrics();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete ticket");
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedTicketIds.length === tickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(tickets.map((t) => t._id).filter(Boolean));
    }
  };

  const handleToggleSelectTicket = (id, e) => {
    e?.stopPropagation?.();
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedTicketIds.length === 0) return;
    const count = selectedTicketIds.length;
    const ok = window.confirm(
      `Are you sure you want to permanently delete these ${count} support ticket${count > 1 ? "s" : ""}? All associated messages, notes, and activity history will be erased.`
    );
    if (!ok) return;
    try {
      await axiosInstance.post("/support-workspace/tickets/bulk-delete", {
        ticketIds: selectedTicketIds,
      });
      toast.success(`${count} ticket${count > 1 ? "s" : ""} permanently deleted`);
      if (selectedTicketId && selectedTicketIds.includes(selectedTicketId)) {
        setSelectedTicketId(null);
        setSelectedTicket(null);
      }
      setSelectedTicketIds([]);
      loadTickets(false);
      loadMetrics();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to bulk delete tickets");
    }
  };

  // Combine and sort messages and internal notes chronologically for support members
  const allChronologicalItems = [];
  if (selectedTicket) {
    (selectedTicket.messages || []).forEach((m) => {
      allChronologicalItems.push({
        type: "message",
        _id: m._id || m.createdAt,
        senderType: m.senderType,
        senderName: m.senderName,
        body: m.body,
        attachments: m.attachments || [],
        createdAt: m.createdAt,
      });
    });

    (selectedTicket.internalNotes || []).forEach((n) => {
      allChronologicalItems.push({
        type: "internal_note",
        _id: n._id || n.createdAt,
        senderName: n.adminName,
        body: n.note,
        createdAt: n.createdAt,
      });
    });

    allChronologicalItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-sans select-none">
      
      {/* 1. TOP METRICS BAR */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Total:</span>
            <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">{metrics.total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">Open:</span>
            <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{metrics.open}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-700 font-semibold">My Active Workload:</span>
            <span className="font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {metrics.assignedToMe ?? 0} / 3
            </span>
            <span className="text-[10px] text-blue-600 font-bold hidden sm:inline">
              ({Math.max(0, 3 - (metrics.assignedToMe || 0))} slots free)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-700 font-semibold">In Progress:</span>
            <span className="font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{metrics.inProgress || metrics.assigned}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Resolved:</span>
            <span className="font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{metrics.resolved}</span>
          </div>
        </div>

        <button
          onClick={() => {
            loadMetrics();
            loadTickets();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <RefreshCw size={12} className={queueLoading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* MOBILE PANE SWITCHER */}
      <div className="md:hidden flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setMobilePane("queue")}
          className={`flex-1 py-2 text-xs font-bold text-center border-b-2 ${
            mobilePane === "queue" ? "border-emerald-600 text-emerald-800" : "border-transparent text-slate-500"
          }`}
        >
          Queue ({tickets.length})
        </button>
        <button
          onClick={() => setMobilePane("chat")}
          className={`flex-1 py-2 text-xs font-bold text-center border-b-2 ${
            mobilePane === "chat" ? "border-emerald-600 text-emerald-800" : "border-transparent text-slate-500"
          }`}
        >
          Conversation
        </button>
        <button
          onClick={() => setMobilePane("context")}
          className={`flex-1 py-2 text-xs font-bold text-center border-b-2 ${
            mobilePane === "context" ? "border-emerald-600 text-emerald-800" : "border-transparent text-slate-500"
          }`}
        >
          Customer Context
        </button>
      </div>

      {/* 2. THREE-PANE MAIN WORKSPACE */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* PANE A: TICKET INBOX QUEUE */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-white flex-shrink-0 ${
            mobilePane !== "queue" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/50">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket #, customer, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadTickets()}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting">Waiting</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Queues</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Select All & Bulk Actions Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-semibold select-none">
                <input
                  type="checkbox"
                  checked={tickets.length > 0 && selectedTicketIds.length === tickets.length}
                  onChange={handleToggleSelectAll}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer h-3.5 w-3.5"
                />
                <span className="text-[11px]">Select All ({tickets.length})</span>
              </label>

              {selectedTicketIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketIds([])}
                    className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                    title="Permanently Delete Selected Tickets"
                  >
                    <Trash2 size={11} /> Delete ({selectedTicketIds.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {queueLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Loader size={20} className="animate-spin text-emerald-600" />
                <span>Loading tickets queue...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <LifeBuoy size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No tickets found</p>
                <p className="text-[11px] mt-1 text-slate-400">All customer tickets matching criteria have been addressed.</p>
              </div>
            ) : (
              tickets.map((t) => {
                const isActive = t._id === selectedTicketId;
                const isHigh = t.priority === "High" || t.priority === "Critical";
                const isSelected = selectedTicketIds.includes(t._id);
                return (
                  <div
                    key={t._id}
                    onClick={() => handleSelectTicket(t._id)}
                    className={`p-3 cursor-pointer transition-colors border-l-4 ${
                      isActive
                        ? "bg-emerald-50/70 border-emerald-600"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectTicket(t._id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer h-3.5 w-3.5"
                          title="Select Ticket"
                        />
                        <span className="font-extrabold text-xs text-blue-700 tracking-tight">
                          {t.ticketNumber}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 truncate mb-1">
                      {t.subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 truncate mb-2">
                      {t.customerName || t.customerEmail || "Customer"}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
                          isHigh
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {t.priority || "Medium"}
                      </span>

                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {t.status || "Open"}
                      </span>

                      {t.category && (
                        <span className="text-[9px] font-medium text-slate-500 truncate max-w-[120px]">
                          • {t.category}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANE B: CONVERSATION AREA */}
        <div
          className={`flex-1 flex flex-col bg-white overflow-hidden ${
            mobilePane !== "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {ticketLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Loader size={24} className="animate-spin text-emerald-600" />
              <span>Loading conversation...</span>
            </div>
          ) : !selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-8 text-center">
              <LifeBuoy size={40} className="text-slate-300 mb-3" />
              <h3 className="font-bold text-sm text-slate-700">No Ticket Selected</h3>
              <p className="text-slate-500 max-w-sm mt-1">
                Select an active ticket from the inbox queue to view conversation history, internal notes, and customer account details.
              </p>
            </div>
          ) : (
            <>
              {/* Ticket Top Action Bar */}
              <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-blue-700">{selectedTicket.ticketNumber}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">{selectedTicket.category || "General Support"}</span>
                  </div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                    {selectedTicket.subject}
                  </h2>
                </div>

                {/* Status & Assignment Controls */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* Status Dropdown */}
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>

                  {/* Priority Dropdown */}
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>



                  {/* Resolve / Reopen Button */}
                  {selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? (
                    <button
                      onClick={handleReopenTicket}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold transition shadow-xs cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Reopen
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowResolveModal(true)}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition shadow-xs cursor-pointer"
                      >
                        <CheckCheck size={12} />
                        Resolve
                      </button>
                      <button
                        onClick={handleCloseTicket}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded font-bold transition shadow-xs cursor-pointer"
                        title="Close Ticket & Free Capacity"
                      >
                        <X size={12} />
                        Close
                      </button>
                    </>
                  )}

                  {/* Delete Permanently Button */}
                  <button
                    onClick={handleDeleteTicket}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded font-bold transition shadow-xs cursor-pointer text-xs"
                    title="Permanently Delete Ticket"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Conversation Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-100/50">
                {allChronologicalItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    No messages yet in this ticket.
                  </div>
                ) : (
                  allChronologicalItems.map((item, idx) => {
                    const isStaff = item.senderType === "admin";
                    const isInternal = item.type === "internal_note";

                    if (isInternal) {
                      return (
                        <div
                          key={item._id || idx}
                          className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 shadow-xs max-w-xl mx-auto my-2"
                        >
                          <div className="flex items-center justify-between text-amber-900 font-extrabold text-xs mb-1.5 pb-1 border-b border-amber-200">
                            <span className="flex items-center gap-1.5">
                              <Lock size={13} className="text-amber-700" />
                              Internal Staff Note • {item.senderName}
                            </span>
                            <span className="text-[10px] text-amber-700 font-normal">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
                            {item.body}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item._id || idx}
                        className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-extrabold text-slate-700">
                            {isStaff ? `${item.senderName} (Staff)` : item.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div
                          className={`max-w-xl rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                            isStaff
                              ? "bg-emerald-600 text-white rounded-tr-none"
                              : "bg-white text-slate-900 border border-slate-200 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{item.body}</p>
                          {Array.isArray(item.attachments) && item.attachments.length > 0 && (
                            <div className="mt-2 space-y-1.5 pt-1.5 border-t border-white/20">
                              {item.attachments.map((att, attIdx) => {
                                const url = typeof att === "string" ? att : att?.url;
                                const isImg = /\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i.test(url);
                                const isPdf = /\.pdf(\?.*)?$/i.test(url);
                                return (
                                  <div key={attIdx} className="rounded overflow-hidden">
                                    {isImg ? (
                                      <a href={url} target="_blank" rel="noopener noreferrer">
                                        <img src={url} alt="attachment" className="max-h-48 rounded object-cover border border-slate-200/40" />
                                      </a>
                                    ) : (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-1.5 py-1 px-2 rounded text-[11px] font-bold ${
                                          isStaff ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-800"
                                        }`}
                                      >
                                        <FileText size={13} /> View Attachment ({isPdf ? "PDF" : "Document"})
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
                {/* Note vs Public Mode Toggle */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(false)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-md transition ${
                        !isInternalNote
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Public Reply (Customer Visible)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(true)}
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md transition ${
                        isInternalNote
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Lock size={12} />
                      Internal Staff Note
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    {isInternalNote ? "⚠️ Hidden from customer" : "Visible in customer support portal"}
                  </span>
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? "Add private internal note for support staff..."
                        : "Type public reply to customer..."
                    }
                    className={`flex-1 p-2.5 text-xs rounded-xl border focus:outline-none transition resize-none ${
                      isInternalNote
                        ? "bg-amber-50/50 border-amber-300 focus:border-amber-500 text-amber-950 placeholder-amber-700/50"
                        : "bg-slate-50 border-slate-200 focus:border-emerald-600 text-slate-900"
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />

                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className={`px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center transition shadow-xs disabled:opacity-40 cursor-pointer ${
                      isInternalNote
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* PANE C: CUSTOMER CONTEXT PANEL */}
        <div
          className={`w-full md:w-80 lg:w-88 border-l border-slate-200 bg-white flex flex-col flex-shrink-0 overflow-y-auto ${
            mobilePane !== "context" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-emerald-700" />
              Customer Information
            </h3>
          </div>

          {contextLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Loader size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
              Loading customer context...
            </div>
          ) : !customerContext ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No context loaded for this ticket.
            </div>
          ) : (
            <div className="p-4 space-y-5 text-xs">
              {/* Customer Profile Card */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    {customerContext.customer?.name?.[0] || "C"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {customerContext.customer?.name}
                    </h4>
                    <p className="text-slate-500 text-[11px]">
                      {customerContext.customer?.email}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verified Email:</span>
                    <span className="font-bold text-slate-800">
                      {customerContext.customer?.isEmailVerified ? "Yes ✓" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Status:</span>
                    <span className="font-bold text-emerald-700">
                      {customerContext.customer?.isBlocked ? "Suspended" : "Active"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Member Since:</span>
                    <span className="font-bold text-slate-800">
                      {customerContext.customer?.memberSince
                        ? new Date(customerContext.customer.memberSince).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Past Support Cases:</span>
                    <span className="font-bold text-blue-700">
                      {customerContext.pastTicketsCount} previous
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Section */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Package size={13} className="text-slate-600" />
                  Recent Orders ({customerContext.recentOrders?.length || 0})
                </h4>

                {customerContext.recentOrders?.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No recent orders on record.</p>
                ) : (
                  <div className="space-y-2">
                    {customerContext.recentOrders.map((ord) => (
                      <div
                        key={ord._id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-[11px] space-y-1"
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-slate-800">#{ord.orderNumber}</span>
                          <span className="text-emerald-700 font-extrabold">₹{ord.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>Status: <strong className="text-slate-700">{ord.orderStatus}</strong></span>
                          <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ticket Audit Timeline */}
              {selectedTicket?.auditLogs?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <h4 className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={13} className="text-slate-600" />
                    Activity & Audit Log
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTicket.auditLogs.map((log, i) => (
                      <div key={log._id || i} className="text-[10px] border-l-2 border-slate-300 pl-2 py-0.5 space-y-0.5">
                        <div className="flex justify-between text-slate-600 font-bold">
                          <span>{log.action?.replace("_", " ")}</span>
                          <span className="text-slate-400 font-normal">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-slate-500 truncate">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Resolve Ticket #{selectedTicket?.ticketNumber}</h3>
            <p className="text-xs text-slate-500">
              Provide resolution notes explaining how this support ticket was handled. The notes will be emailed to the customer and recorded in the audit log.
            </p>

            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Refund initiated, tracking details updated, replacement shipped..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveTicket}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
