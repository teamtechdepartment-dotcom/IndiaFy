/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy,
  Send,
  Clipboard,
  RefreshCw,
  AlertTriangle,
  Phone,
  PhoneCall,
  Users,
  Plus,
  Shield,
  CheckCircle2,
  X,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Activity,
  Wrench,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function SupportInbox() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [internalNoteBody, setInternalNoteBody] = useState("");
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'notes'

  // Server-side Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Enterprise Database Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    today: 0,
    last7Days: 0,
    unassigned: 0,
    assigned: 0,
    inProgress: 0,
    waiting: 0,
    resolved: 0,
    closed: 0,
    reopened: 0,
    highPriority: 0,
  });

  // Workload Monitoring State
  const [workloads, setWorkloads] = useState([]);
  const [workloadSummary, setWorkloadSummary] = useState(null);
  const [reconcilingQueue, setReconcilingQueue] = useState(false);
  const [memberModalTab, setMemberModalTab] = useState("workload"); // 'workload' | 'members'

  // Support Team Management State
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [supportMembers, setSupportMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("support_member");
  const [creatingMember, setCreatingMember] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);

  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages, selectedTicket?.internalNotes, activeTab]);

  const fetchTickets = async (silent = false, customParams = {}) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const activePage = customParams.page ?? page;
      const activeLimit = customParams.limit ?? limit;
      const activeStatus = customParams.status ?? statusFilter;
      const activePriority = customParams.priority ?? priorityFilter;
      const activeSearch = customParams.search ?? searchQuery;

      const params = {
        page: activePage,
        limit: activeLimit,
      };
      if (activeStatus && activeStatus !== "all") params.status = activeStatus;
      if (activePriority && activePriority !== "all") params.priority = activePriority;
      if (activeSearch && activeSearch.trim()) params.search = activeSearch.trim();

      const res = await axiosInstance.get("/admin/management/tickets", { params });
      const raw = res?.data?.data?.tickets ?? res?.data?.data ?? res?.data?.tickets ?? res?.data ?? [];
      const safeData = Array.isArray(raw) ? raw : [];
      setTickets(safeData);

      if (res?.data?.pagination) {
        setPagination(res.data.pagination);
      } else {
        setPagination(prev => ({ ...prev, page: activePage, limit: activeLimit, total: safeData.length }));
      }

      if (res?.data?.metrics) {
        setMetrics(res.data.metrics);
      }

      if (selectedTicket?._id) {
        const updated = safeData.find(t => t?._id === selectedTicket._id);
        if (updated) {
          setSelectedTicket(prev => ({
            ...prev,
            ...updated,
            messages: prev?.messages || updated.messages,
            internalNotes: prev?.internalNotes || updated.internalNotes,
          }));
        }
      }
    } catch (_err) {
      console.error("Error fetching support tickets:", _err);
      if (!silent) {
        setError("Failed to load support inbox.");
        toast.error("Failed to load support inbox");
        setTickets([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const fetchWorkloads = async () => {
    try {
      const res = await axiosInstance.get("/admin/management/support-workload");
      const data = res?.data?.data || res?.data;
      if (data?.workloads) {
        setWorkloads(data.workloads);
        setWorkloadSummary(data.summary);
      }
    } catch (_err) {
      console.warn("Failed to fetch support workloads:", _err);
    }
  };

  const handleReconcileQueue = async () => {
    setReconcilingQueue(true);
    try {
      const res = await axiosInstance.post("/admin/management/queue/reconcile");
      const data = res?.data?.data || res?.data;
      toast.success(
        `Queue reconciled! Recovered ${data?.stuckRecovered || 0} stuck tickets and assigned ${data?.assignedCount || 0} queued tickets.`
      );
      fetchTickets(true);
      fetchWorkloads();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reconcile queue");
    } finally {
      setReconcilingQueue(false);
    }
  };

  const handleAdminResolve = async (ticketId) => {
    const notes = window.prompt("Enter resolution notes for this ticket:");
    if (!notes || !notes.trim()) return;
    try {
      await axiosInstance.post(`/admin/management/tickets/${ticketId}/resolve`, {
        resolutionNotes: notes.trim(),
      });
      toast.success("Ticket resolved successfully");
      fetchTickets(true);
      fetchWorkloads();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resolve ticket");
    }
  };

  const handleAdminClose = async (ticketId) => {
    const reason = window.prompt("Enter reason for closing ticket:");
    if (reason === null) return;
    try {
      await axiosInstance.post(`/admin/management/tickets/${ticketId}/close`, {
        reason: reason.trim() || "Closed by Admin",
      });
      toast.success("Ticket closed successfully");
      fetchTickets(true);
      fetchWorkloads();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to close ticket");
    }
  };

  const handleAdminReopen = async (ticketId) => {
    const reason = window.prompt("Enter reason for reopening ticket:");
    if (!reason || !reason.trim()) return;
    try {
      await axiosInstance.post(`/admin/management/tickets/${ticketId}/reopen`, {
        reason: reason.trim(),
      });
      toast.success("Ticket reopened successfully");
      fetchTickets(true);
      fetchWorkloads();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reopen ticket");
    }
  };

  useEffect(() => {
    fetchTickets(false);
    fetchWorkloads();
  }, [page, limit, statusFilter, priorityFilter]);

  const handleSelectTicket = async (t) => {
    if (!t?._id) return;
    try {
      const res = await axiosInstance.get(`/admin/management/tickets/${t._id}`);
      const data = res?.data?.data ?? res?.data?.ticket ?? res?.data ?? t;
      setSelectedTicket(data?._id ? data : t);
      setReplyBody("");
      setInternalNoteBody("");
    } catch (_err) {
      setSelectedTicket(t);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    const text = replyBody.trim();
    if (!selectedTicket?._id || !text) return;

    setReplyBody("");

    // Optimistic message update so UI updates immediately without flickering
    const optimisticMessage = {
      body: text,
      senderType: "admin",
      senderName: "Admin Support",
      createdAt: new Date().toISOString()
    };

    setSelectedTicket(prev => prev ? {
      ...prev,
      messages: [...(prev.messages || []), optimisticMessage]
    } : prev);

    try {
      await axiosInstance.post(`/admin/management/tickets/${selectedTicket._id}/reply`, {
        body: text
      });
      toast.success("Reply posted to customer inbox");

      // Silently fetch fresh ticket details for sync
      try {
        const detailRes = await axiosInstance.get(`/admin/management/tickets/${selectedTicket._id}`);
        const data = detailRes?.data?.data ?? detailRes?.data?.ticket ?? detailRes?.data ?? detailRes;
        if (data?._id) setSelectedTicket(data);
      } catch (_) {}

      // Silently update ticket queue in background without reloading spinner
      fetchTickets(true);
    } catch (_err) {
      toast.error("Failed to post message reply");
    }
  };

  const handlePostNote = async (e) => {
    e.preventDefault();
    const text = internalNoteBody.trim();
    if (!selectedTicket?._id || !text) return;

    setInternalNoteBody("");

    // Optimistic note update
    const optimisticNote = {
      note: text,
      adminName: "Admin",
      createdAt: new Date().toISOString()
    };

    setSelectedTicket(prev => prev ? {
      ...prev,
      internalNotes: [...(prev.internalNotes || []), optimisticNote]
    } : prev);

    try {
      await axiosInstance.post(`/admin/management/tickets/${selectedTicket._id}/note`, {
        note: text
      });
      toast.success("Internal administrative note saved");

      try {
        const detailRes = await axiosInstance.get(`/admin/management/tickets/${selectedTicket._id}`);
        const data = detailRes?.data?.data ?? detailRes?.data?.ticket ?? detailRes?.data ?? detailRes;
        if (data?._id) setSelectedTicket(data);
      } catch (_) {}

      fetchTickets(true);
    } catch (_err) {
      toast.error("Failed to log internal note");
    }
  };

  const handleUpdateProperties = async (status, priority) => {
    if (!selectedTicket?._id) return;
    try {
      await axiosInstance.put(`/admin/management/tickets/${selectedTicket._id}/properties`, {
        status,
        priority
      });
      toast.success("Ticket properties updated");
      setSelectedTicket(prev => prev ? { ...prev, status, priority } : prev);
      fetchTickets(true);
    } catch (_err) {
      toast.error("Failed to adjust ticket settings");
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!ticketId) return;
    const ok = window.confirm(
      "Are you sure you want to permanently delete this support ticket? All messages, notes, and activity records will be permanently erased."
    );
    if (!ok) return;
    try {
      await axiosInstance.delete(`/admin/management/tickets/${ticketId}`);
      toast.success("Ticket permanently deleted");
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      if (selectedTicket?._id === ticketId) setSelectedTicket(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete ticket");
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedTicketIds.length === safeTicketsList.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(safeTicketsList.map((t) => t._id).filter(Boolean));
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
      `Are you sure you want to permanently delete these ${count} support ticket${count > 1 ? "s" : ""}? All associated messages, notes, and activity records will be permanently erased.`
    );
    if (!ok) return;
    try {
      await axiosInstance.post("/admin/management/tickets/bulk-delete", {
        ids: selectedTicketIds,
      });
      toast.success(`${count} ticket${count > 1 ? "s" : ""} permanently deleted`);
      setTickets((prev) => prev.filter((t) => !selectedTicketIds.includes(t._id)));
      if (selectedTicket && selectedTicketIds.includes(selectedTicket._id)) {
        setSelectedTicket(null);
      }
      setSelectedTicketIds([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to bulk delete tickets");
    }
  };

  const fetchSupportMembers = async () => {
    setMembersLoading(true);
    try {
      const res = await axiosInstance.get("/support-workspace/members");
      const list = res?.data || res || [];
      if (Array.isArray(list)) setSupportMembers(list);
    } catch (_err) {
      console.warn("Failed to fetch support members:", _err);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportMembers();
  }, []);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (newMemberPassword.trim() && newMemberPassword.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setCreatingMember(true);
    try {
      await axiosInstance.post("/support-workspace/members", {
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        role: newMemberRole,
        password: newMemberPassword.trim(),
      });
      if (newMemberPassword.trim()) {
        toast.success(`Support member "${newMemberName}" created & activated! Password configured.`);
      } else {
        toast.success("Support member invited! Invitation setup link generated.");
      }
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberPassword("");
      fetchSupportMembers();
    } catch (_err) {
      toast.error(_err?.response?.data?.message || "Failed to create support member");
    } finally {
      setCreatingMember(false);
    }
  };

  const handleCopySetupLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success("Setup link copied to clipboard! Share it with the agent.");
  };

  const handleToggleMemberStatus = async (member) => {
    const nextStatus = member.status === "active" ? "inactive" : "active";
    try {
      await axiosInstance.patch(`/support-workspace/members/${member._id}`, {
        status: nextStatus,
      });
      toast.success(`Member status changed to ${nextStatus}`);
      fetchSupportMembers();
    } catch (_err) {
      toast.error("Failed to update member status");
    }
  };

  const handleResendInvite = async (memberId) => {
    try {
      await axiosInstance.post(`/support-workspace/members/${memberId}/invite`);
      toast.success("Invitation link resent");
    } catch (_err) {
      toast.error("Failed to resend invitation");
    }
  };

  const handleDeleteMember = async (member) => {
    if (!member?._id) return;
    const confirmMsg = `Are you sure you want to permanently delete support member "${member.name}" (${member.email})?\n\nThis will unassign any active tickets assigned to them and permanently remove this user account.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingMemberId(member._id);
    try {
      try {
        await axiosInstance.delete(`/admin/management/support-members/${member._id}`);
      } catch (_adminErr) {
        await axiosInstance.delete(`/support-workspace/members/${member._id}`);
      }
      toast.success(`Support member "${member.name}" permanently deleted.`);
      setSupportMembers((prev) => prev.filter((m) => m._id !== member._id));
      if (selectedTicket?.assignedMemberId?._id === member._id || selectedTicket?.assignedMemberId === member._id) {
        setSelectedTicket((prev) => (prev ? { ...prev, assignedMemberId: null, assignedStaff: null } : prev));
      }
      fetchTickets(true);
    } catch (err) {
      console.error("Failed to delete support member:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete support member");
    } finally {
      setDeletingMemberId(null);
    }
  };

  const handleAssignTicket = async (memberId) => {
    if (!selectedTicket?._id) return;
    try {
      await axiosInstance.post(`/support-workspace/tickets/${selectedTicket._id}/assign`, {
        memberId: memberId || null,
      });
      toast.success(memberId ? "Ticket assigned to support member" : "Ticket unassigned");
      setSelectedTicket((prev) => (prev ? { ...prev, assignedMemberId: memberId } : prev));
      fetchTickets(true);
      fetchSupportMembers();
    } catch (_err) {
      toast.error("Failed to assign ticket");
    }
  };

  const safeTicketsList = Array.isArray(tickets) ? tickets : [];

  return (
    <div className="flex min-h-screen h-screen max-h-screen w-full overflow-hidden font-sans selection:bg-orange-500 selection:text-white" style={{ background: "var(--admin-page-bg)" }}>
      <Sidebar />

      <section className="flex-1 min-w-0 w-full flex flex-col h-screen max-h-screen min-h-0 overflow-hidden">
        <Header />

        <div className="flex-grow min-h-0 w-full flex flex-col overflow-hidden px-4 sm:px-6 pb-4 pt-0">
          <div className="w-full flex-grow min-h-0 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 flex-shrink-0 mb-2.5 w-full">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#2874F0] dark:text-[#38BDF8] text-[10px] font-bold uppercase tracking-widest">
                  <LifeBuoy size={12} /> Platform ticketing
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Customer Care Support</h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleReconcileQueue}
                  disabled={reconcilingQueue}
                  className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  title="Reconcile queue and self-heal stuck tickets"
                >
                  <Wrench size={13} className={reconcilingQueue ? "animate-spin" : ""} />
                  {reconcilingQueue ? "Reconciling..." : "Reconcile Queue"}
                </button>
                <button
                  onClick={() => {
                    fetchSupportMembers();
                    fetchWorkloads();
                    setShowMembersModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Manage Support Members and Workload Monitoring"
                >
                  <Users size={13} />
                  Support Team ({supportMembers.length})
                </button>
                <Link
                  to="/support-workspace"
                  className="flex items-center justify-center gap-1.5 bg-[#065F46] hover:bg-emerald-800 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-xs"
                  title="Open Support Workspace with Callbacks & Live Chats"
                >
                  <PhoneCall size={13} />
                  Live Support & Call Queue
                </Link>
                <button
                  onClick={() => {
                    fetchTickets(false);
                    fetchWorkloads();
                  }}
                  className="flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition shadow-xs cursor-pointer"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Enterprise Database Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-2.5 flex-shrink-0">
              <div className="p-2 rounded-xl bg-white dark:bg-[#080E21] border border-gray-200/80 dark:border-white/10 shadow-xs">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Total Tickets</p>
                <p className="text-sm sm:text-base font-black text-gray-900 dark:text-white">{metrics.total || pagination.total || safeTicketsList.length}</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#080E21] border border-gray-200/80 dark:border-white/10 shadow-xs">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Today</p>
                <p className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300">{metrics.today || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#080E21] border border-gray-200/80 dark:border-white/10 shadow-xs">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Last 7 Days</p>
                <p className="text-sm sm:text-base font-black text-blue-700 dark:text-blue-300">{metrics.last7Days || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-xs">
                <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase">Unassigned</p>
                <p className="text-sm sm:text-base font-black text-amber-800 dark:text-amber-200">{metrics.unassigned || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 shadow-xs">
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">In Progress</p>
                <p className="text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300">{metrics.inProgress || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 shadow-xs">
                <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">Waiting</p>
                <p className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-300">{metrics.waiting || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/40 shadow-xs">
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase">Resolved</p>
                <p className="text-sm sm:text-base font-black text-teal-700 dark:text-teal-300">{metrics.resolved || 0}</p>
              </div>
              <div className="p-2 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 shadow-xs">
                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase">High Priority</p>
                <p className="text-sm sm:text-base font-black text-red-700 dark:text-red-300">{metrics.highPriority || 0}</p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs font-semibold flex-shrink-0 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={() => fetchTickets(false)} className="underline hover:text-red-900 dark:hover:text-red-100 cursor-pointer">Retry</button>
              </div>
            )}

            {/* Content wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load support inbox desk">
              <div 
                className="flex-grow min-h-0 w-full bg-white dark:bg-[#080E21] border border-gray-200/90 dark:border-white/10 rounded-2xl lg:rounded-3xl overflow-hidden shadow-xs"
                style={{ display: "flex", flexDirection: "row", height: "100%" }}
              >
                
                {/* Left Tickets mailbox list */}
                <div 
                  className="w-80 xl:w-96 shrink-0 border-r border-gray-200 dark:border-white/10 flex flex-col min-h-0 bg-gray-50/70 dark:bg-[#060A18]/80 overflow-hidden"
                  style={{ height: "100%", maxHeight: "100%" }}
                >
                  <div className="p-2.5 sm:p-3 border-b border-gray-200 dark:border-white/10 flex-shrink-0 bg-white/70 dark:bg-[#080E21]/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={safeTicketsList.length > 0 && selectedTicketIds.length === safeTicketsList.length}
                          onChange={handleToggleSelectAll}
                          className="rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500 cursor-pointer h-3.5 w-3.5"
                          title="Select All Tickets on Page"
                        />
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm">Help Desk Tickets</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#2874F0] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-800/50">
                        {pagination.total || safeTicketsList.length} total
                      </span>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search tickets, email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setPage(1);
                              fetchTickets(false, { page: 1, search: searchQuery });
                            }
                          }}
                          className="w-full pl-7 pr-2 py-1 text-[11px] rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                        className="py-1 px-1.5 text-[11px] font-semibold rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                        title="Filter by status"
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting">Waiting</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                        <option value="reopened">Reopened</option>
                        <option value="unassigned">Unassigned</option>
                      </select>
                      <select
                        value={priorityFilter}
                        onChange={(e) => {
                          setPriorityFilter(e.target.value);
                          setPage(1);
                        }}
                        className="py-1 px-1.5 text-[11px] font-semibold rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                        title="Filter by priority"
                      >
                        <option value="all">Priority</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  {selectedTicketIds.length > 0 && (
                    <div className="px-3 py-2 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/40 flex items-center justify-between text-xs flex-shrink-0">
                      <span className="font-bold text-red-700 dark:text-red-300">
                        {selectedTicketIds.length} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTicketIds([])}
                          className="text-[11px] text-gray-600 dark:text-gray-400 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkDelete}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                          title="Permanently Delete Selected Tickets"
                        >
                          <Trash2 size={12} /> Delete ({selectedTicketIds.length})
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex-grow min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5" style={{ scrollbarWidth: "thin" }}>
                    {loading ? (
                      <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-xs font-bold">Loading inbox...</div>
                    ) : safeTicketsList.length === 0 ? (
                      <div className="py-16 px-4 text-center text-gray-400 dark:text-gray-500 text-xs font-semibold">
                        No support tickets currently matching query.
                      </div>
                    ) : (
                      safeTicketsList.map(t => (
                        <TicketItem 
                          key={t._id || Math.random()} 
                          item={t} 
                          active={selectedTicket?._id === t._id}
                          onClick={handleSelectTicket}
                          isSelected={selectedTicketIds.includes(t._id)}
                          onToggleSelect={(e) => handleToggleSelectTicket(t._id, e)}
                        />
                      ))
                    )}
                  </div>

                  {/* Server-Side Pagination Controls */}
                  <div className="p-2 border-t border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#080E21]/90 flex items-center justify-between text-xs flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-[11px]">
                      <span>Rows:</span>
                      <select
                        value={limit}
                        onChange={(e) => {
                          const newLimit = parseInt(e.target.value, 10);
                          setLimit(newLimit);
                          setPage(1);
                        }}
                        className="px-1.5 py-0.5 text-xs font-bold rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                        Page {pagination.page || page} / {pagination.totalPages || 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={(pagination.page || page) <= 1 || loading}
                          className="p-1 rounded border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                          title="Previous Page"
                        >
                          <ChevronLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPage(p => p + 1)}
                          disabled={(pagination.page || page) >= (pagination.totalPages || 1) || loading}
                          className="p-1 rounded border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                          title="Next Page"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Detail Pane */}
                <section 
                  className="flex-grow min-w-0 flex flex-col min-h-0 bg-white dark:bg-[#080E21] overflow-hidden"
                  style={{ height: "100%", maxHeight: "100%" }}
                >
                  {selectedTicket ? (
                    <article className="flex-grow flex flex-col min-h-0 overflow-hidden" style={{ height: "100%" }}>
                      
                      {/* Ticket Header (Pinned at top of detail pane) */}
                      <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-white/10 flex flex-wrap justify-between items-center gap-2 bg-gray-50/60 dark:bg-[#060A18]/60 flex-shrink-0">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-[#2874F0] dark:text-[#38BDF8] text-xs sm:text-sm">{selectedTicket.ticketNumber ?? "TCK-0000"}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              selectedTicket.priority === "Critical" || selectedTicket.priority === "High" ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40" : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                            }`}>
                              {selectedTicket.priority ?? "Normal"} Priority
                            </span>
                            {(selectedTicket.createdAt || selectedTicket.updatedAt) && (
                              <span className="text-[10px] text-gray-600 dark:text-slate-300 font-semibold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-white/10">
                                📅 {formatDateTime(selectedTicket.createdAt || selectedTicket.updatedAt)}
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm mt-0.5">{selectedTicket.subject ?? "Untitled Ticket"}</h3>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={selectedTicket.assignedMemberId?._id || selectedTicket.assignedMemberId || ""}
                            onChange={(e) => handleAssignTicket(e.target.value)}
                            className="h-8 px-2 text-xs border border-gray-200 dark:border-white/15 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none font-bold shadow-xs cursor-pointer"
                            title="Assign to Support Member"
                          >
                            <option value="">👤 Unassigned Staff</option>
                            {supportMembers.map((m) => (
                              <option key={m._id} value={m._id}>
                                👤 {m.name} ({m.role?.replace("_", " ")})
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              setShowMembersModal(true);
                              fetchSupportMembers();
                            }}
                            className="h-8 px-2.5 text-xs border border-indigo-200 dark:border-indigo-900/40 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Manage & Permanently Delete Staff Members"
                          >
                            <Users size={12} />
                            <span className="hidden sm:inline">Manage Staff</span>
                          </button>

                          <select
                            value={selectedTicket.priority ?? "Medium"}
                            onChange={(e) => handleUpdateProperties(selectedTicket.status, e.target.value)}
                            className="h-8 px-2 text-xs border border-gray-200 dark:border-white/15 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none font-bold shadow-xs cursor-pointer"
                            title="Change Priority"
                          >
                            <option value="Critical">Critical Priority</option>
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                          </select>

                          <select 
                            value={selectedTicket.status ?? "Open"} 
                            onChange={(e) => handleUpdateProperties(e.target.value, selectedTicket.priority)}
                            className="h-8 px-2 text-xs border border-gray-200 dark:border-white/15 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none font-bold shadow-xs cursor-pointer"
                          >
                            <option value="Open">Open</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Waiting">Waiting</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                            <option value="Reopened">Reopened</option>
                          </select>

                          {["Resolved", "Closed"].includes(selectedTicket.status) ? (
                            <button
                              type="button"
                              onClick={() => handleAdminReopen(selectedTicket._id)}
                              className="h-8 px-2.5 text-xs border border-amber-200 dark:border-amber-800 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                              title="Reopen Resolved Ticket"
                            >
                              <RotateCcw size={12} />
                              <span>Reopen</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAdminResolve(selectedTicket._id)}
                                className="h-8 px-2.5 text-xs border border-emerald-200 dark:border-emerald-800 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                                title="Resolve Ticket with Notes"
                              >
                                <CheckCircle2 size={12} />
                                <span>Resolve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdminClose(selectedTicket._id)}
                                className="h-8 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                                title="Close Ticket & Refill Queue"
                              >
                                <X size={12} />
                                <span>Close</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteTicket(selectedTicket._id)}
                            className="h-8 px-2.5 text-xs border border-red-200 dark:border-red-900/40 rounded bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                            title="Permanently Delete Ticket"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Call Request Banner if present */}
                      {selectedTicket.callback && (
                        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 px-3 sm:px-3.5 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-2 text-amber-950 dark:text-amber-200 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                              <Phone size={13} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-[11px] text-amber-950 dark:text-amber-200 uppercase tracking-wide">Customer Call Request</span>
                                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                                  {selectedTicket.callback.status || "requested"}
                                </span>
                                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                                  ({selectedTicket.callback.requestedTimeWindow || "ASAP"})
                                </span>
                              </div>
                              <p className="text-[11px] font-mono font-bold text-gray-900 dark:text-white">
                                📞 Contact Phone: {selectedTicket.callback.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium hidden sm:inline">
                              Requested: {formatDateTime(selectedTicket.callback.requestedAt || selectedTicket.callback.createdAt)}
                            </span>
                            <a 
                              href={`tel:${selectedTicket.callback.phone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold transition shadow-xs"
                            >
                              <Phone size={11} /> Call Customer
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Tabs */}
                      <div className="flex border-b border-gray-200 dark:border-white/10 text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-50/50 dark:bg-[#060A18]/50 flex-shrink-0">
                        <button 
                          onClick={() => setActiveTab("chat")}
                          className={`flex-1 py-2 sm:py-2.5 border-b-2 text-center transition cursor-pointer ${activeTab === "chat" ? "border-[#10B981] text-[#2874F0] dark:text-[#38BDF8] bg-white dark:bg-[#080E21]" : "border-transparent hover:text-gray-900 dark:hover:text-white"}`}
                        >
                          Customer Chat Logs
                        </button>
                        <button 
                          onClick={() => setActiveTab("notes")}
                          className={`flex-1 py-2 sm:py-2.5 border-b-2 text-center transition cursor-pointer ${activeTab === "notes" ? "border-[#10B981] text-[#2874F0] dark:text-[#38BDF8] bg-white dark:bg-[#080E21]" : "border-transparent hover:text-gray-900 dark:hover:text-white"}`}
                        >
                          Internal Admin Memos
                        </button>
                      </div>

                      {/* Messages Body (Scrollable inside, never overflows container) */}
                      <div ref={messagesContainerRef} className="flex-grow min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5" style={{ scrollbarWidth: "thin" }}>
                        {activeTab === "chat" ? (
                          <>
                            <div className="bg-gray-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs font-medium text-gray-800 dark:text-slate-200">
                              <p className="font-bold text-[#2874F0] dark:text-[#38BDF8]">Initial Description:</p>
                              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{selectedTicket.description || "No description provided."}</p>
                            </div>

                            {Array.isArray(selectedTicket.messages) && selectedTicket.messages.map((msg, i) => (
                              <div 
                                key={i} 
                                className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs shadow-xs ${
                                  msg?.senderType === "admin" 
                                    ? "ml-auto bg-[#065F46] text-white" 
                                    : "bg-gray-100 dark:bg-slate-800/80 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-white/10"
                                }`}
                              >
                                <div className="flex justify-between items-center gap-4">
                                  <span className={`font-black text-[9px] uppercase tracking-wider ${msg?.senderType === "admin" ? "text-emerald-200" : "text-[#2874F0] dark:text-[#38BDF8]"}`}>
                                    {msg?.senderName ?? "User"}
                                  </span>
                                  {msg?.createdAt && (
                                    <span className={`text-[10px] font-medium ${msg?.senderType === "admin" ? "text-emerald-100/75" : "text-gray-500 dark:text-slate-400"}`}>
                                      {formatDateTime(msg.createdAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 font-medium">{msg?.body ?? ""}</p>
                                {Array.isArray(msg?.attachments) && msg.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {msg.attachments.map((att, aIdx) => {
                                      const url = typeof att === "string" ? att : att?.url;
                                      const isImg = /\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i.test(url);
                                      const isPdf = /\.pdf(\?.*)?$/i.test(url);
                                      return (
                                        <div key={aIdx} className="rounded overflow-hidden max-w-xs mt-1">
                                          {isImg ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                              <img src={url} alt="attachment" className="max-h-36 rounded object-cover border border-white/20" />
                                            </a>
                                          ) : (
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 p-1 text-[11px] underline font-bold"
                                            >
                                              📄 View Document ({isPdf ? "PDF" : "File"})
                                            </a>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {Array.isArray(selectedTicket.internalNotes) && selectedTicket.internalNotes.map((n, i) => (
                              <div key={i} className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
                                <p className="font-bold flex justify-between">
                                  <span>Note by: {n?.adminName ?? "Admin"}</span>
                                  <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                                    {n?.createdAt ? formatDateTime(n.createdAt) : "Today"}
                                  </span>
                                </p>
                                <p className="mt-0.5 font-medium text-gray-800 dark:text-slate-200">{n?.note ?? ""}</p>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Text Area Form (Pinned at Bottom, ALWAYS visible) */}
                      <div className="p-2.5 sm:p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50/95 dark:bg-[#060A18]/95 shrink-0">
                        {activeTab === "chat" ? (
                          <form onSubmit={handleSendReply} className="flex gap-2">
                            <input 
                              type="text" 
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              placeholder="Type secure reply to merchant/customer..."
                              className="flex-1 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 outline-none text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5 shadow-xs"
                            />
                            <button 
                              type="submit" 
                              disabled={!replyBody.trim()}
                              className="px-4 py-2 bg-[#065F46] hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 border border-[#10B981]/20 shadow-xs transition cursor-pointer"
                            >
                              <Send size={13} className="text-white" /> Send
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handlePostNote} className="flex gap-2">
                            <input 
                              type="text" 
                              value={internalNoteBody}
                              onChange={(e) => setInternalNoteBody(e.target.value)}
                              placeholder="Type internal note memo..."
                              className="flex-1 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 outline-none text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5 shadow-xs"
                            />
                            <button 
                              type="submit" 
                              disabled={!internalNoteBody.trim()}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 border border-amber-600/30 shadow-xs transition cursor-pointer"
                            >
                              <Clipboard size={13} /> Log Memo
                            </button>
                          </form>
                        )}
                      </div>

                    </article>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-xs text-gray-400 dark:text-gray-500 min-h-0">
                      <LifeBuoy size={36} className="text-slate-350 dark:text-slate-600 mb-3 animate-pulse" />
                      Select an open ticket entry from the mailbox queue to examine live description details, reply chat, or add private staff memos.
                    </div>
                  )}
                </section>

              </div>
            </AdminErrorBoundary>

          </div>
        </div>
      </section>

      {/* Support Team Management Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B132B] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Support Team Management</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Create, invite, and manage support member credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-200 dark:border-white/10 gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMemberModalTab("workload")}
                className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                  memberModalTab === "workload"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <Activity size={14} />
                Workload & Capacity ({workloads.length})
              </button>
              <button
                type="button"
                onClick={() => setMemberModalTab("members")}
                className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                  memberModalTab === "members"
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <Users size={14} />
                Staff Accounts & Invite ({supportMembers.length})
              </button>
            </div>

            {memberModalTab === "workload" ? (
              <div className="space-y-4">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-gray-50 dark:bg-[#060A18] rounded-xl border border-gray-200 dark:border-white/10">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Active Staff</span>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
                      {workloadSummary?.activeMembers ?? workloads.filter(w => w.isEligible).length}
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                    <span className="text-[10px] text-blue-600 font-bold uppercase">Assigned Workload</span>
                    <p className="text-sm font-extrabold text-blue-700 dark:text-blue-300 mt-0.5">
                      {workloadSummary?.totalActiveAssigned ?? workloads.reduce((sum, w) => sum + (w.activeWorkload || 0), 0)} tickets
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Total Capacity</span>
                    <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {workloadSummary?.totalCapacity ?? (workloads.filter(w => w.isEligible).length * 3)} slots
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-[10px] text-amber-600 font-bold uppercase">Unassigned Queue</span>
                    <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">
                      {workloadSummary?.unassignedQueueCount ?? metrics.unassigned ?? 0} queued
                    </p>
                  </div>
                </div>

                {/* Member Workload Table */}
                <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
                  <div className="bg-gray-100/70 dark:bg-[#060A18] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 grid grid-cols-12 gap-2">
                    <div className="col-span-4">Support Member</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Active Workload</div>
                    <div className="col-span-3 text-right">Resolved Today</div>
                  </div>
                  {workloads.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">No support members registered in workload engine.</div>
                  ) : (
                    workloads.map((w) => {
                      const isFull = (w.activeWorkload || 0) >= (w.capacity || 3);
                      return (
                        <div key={w._id} className="p-3 bg-white dark:bg-[#080E21] grid grid-cols-12 gap-2 items-center text-xs">
                          <div className="col-span-4">
                            <p className="font-extrabold text-gray-900 dark:text-white truncate">{w.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">{w.email}</p>
                          </div>
                          <div className="col-span-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              w.isEligible
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                : "bg-gray-100 dark:bg-white/10 text-gray-500"
                            }`}>
                              {w.isEligible ? "Eligible" : "Inactive"}
                            </span>
                          </div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-black ${isFull ? "text-red-600" : "text-emerald-600"}`}>
                                {w.activeWorkload || 0} / {w.capacity || 3}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                ({w.availableSlots || 0} free)
                              </span>
                            </div>
                            {w.oldestActiveTicket && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Oldest: {formatDateTime(w.oldestActiveTicket)}
                              </p>
                            )}
                          </div>
                          <div className="col-span-3 text-right font-bold text-gray-800 dark:text-gray-200">
                            {w.resolvedCountToday || 0} resolved
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <>
            {/* Invite Form */}
            <form onSubmit={handleCreateMember} className="bg-gray-50 dark:bg-[#060A18] p-4 rounded-xl border border-gray-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Add or Invite Support Member</h4>
                <span className="text-[10px] text-gray-400">Set password to activate immediately, or leave blank for invite link</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080E21] text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Member Email *"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080E21] text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Password (optional, min 6)"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080E21] text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080E21] text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="support_member">Support Member</option>
                  <option value="support_lead">Support Lead</option>
                  <option value="support_agent">Support Agent</option>
                </select>
              </div>
              <div className="flex justify-between items-center pt-1">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {newMemberPassword.trim() ? "⚡ Account will be active immediately with this password." : "✉️ Member will receive an email setup link to create their password."}
                </p>
                <button
                  type="submit"
                  disabled={creatingMember}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Plus size={13} />
                  {creatingMember ? "Processing..." : newMemberPassword.trim() ? "Create & Activate Member" : "Send Invitation Link"}
                </button>
              </div>
            </form>

            {/* Members Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Active & Invited Staff ({supportMembers.length})</h4>
              {membersLoading ? (
                <div className="py-8 text-center text-xs text-gray-400">Loading team...</div>
              ) : supportMembers.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">No support members created yet. Use form above to invite team members.</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                  {supportMembers.map((m) => (
                    <div key={m._id} className="p-3 bg-white dark:bg-[#080E21] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 dark:text-white">{m.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                            {m.role?.replace("_", " ")}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            m.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : m.status === "invited"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{m.email} • {m.assignedTicketsCount || 0} active tickets</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {m.status === "invited" && m.setupUrl && (
                          <button
                            type="button"
                            onClick={() => handleCopySetupLink(m.setupUrl)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                            title="Copy setup link to share directly"
                          >
                            Copy Setup Link
                          </button>
                        )}
                        {m.status === "invited" && (
                          <button
                            type="button"
                            onClick={() => handleResendInvite(m._id)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 transition cursor-pointer"
                          >
                            Resend Email
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleMemberStatus(m)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded border transition cursor-pointer ${
                            m.status === "active"
                              ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {m.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(m)}
                          disabled={deletingMemberId === m._id}
                          className="px-2.5 py-1 text-[11px] font-bold rounded border border-red-200 dark:border-red-900/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 transition cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                          title="Permanently Delete Support Member"
                        >
                          <Trash2 size={12} />
                          <span>{deletingMemberId === m._id ? "Deleting..." : "Delete Permanently"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (_e) {
    return String(dateStr);
  }
};

function TicketItem({ item, active, onClick, isSelected, onToggleSelect }) {
  if (!item) return null;
  let priorityStyle = "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40";
  if (item.priority === "High" || item.priority === "Critical") {
    priorityStyle = "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40";
  }

  const dateStr = item.updatedAt || item.createdAt;

  return (
    <div 
      onClick={() => onClick(item)}
      className={`p-3 sm:p-3.5 cursor-pointer hover:bg-gray-100/70 dark:hover:bg-white/5 transition-colors border-l-4 ${
        active ? "bg-[#10B981]/10 dark:bg-[#10B981]/15 border-[#10B981]" : "border-transparent"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500 cursor-pointer h-3.5 w-3.5 shrink-0"
            title="Select Ticket"
          />
          <span className="font-extrabold text-[#2874F0] dark:text-[#38BDF8] text-xs">{item.ticketNumber ?? "TCK-000"}</span>
        </div>
        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase">{item.userType ?? "user"}</span>
      </div>
      
      <p className="font-extrabold text-gray-900 dark:text-slate-100 text-xs mt-0.5 truncate">{item.subject ?? "Support Inquiry"}</p>
      
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${priorityStyle}`}>
            {item.priority ?? "Normal"}
          </span>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded text-[8px] font-black uppercase tracking-wider border border-gray-200 dark:border-white/10">
            {item.status ?? "Open"}
          </span>
          {item.callback && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50 flex items-center gap-0.5">
              <Phone size={9} /> Call Req
            </span>
          )}
        </div>
        {dateStr && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold whitespace-nowrap">
            {formatDateTime(dateStr)}
          </span>
        )}
      </div>
    </div>
  );
}
