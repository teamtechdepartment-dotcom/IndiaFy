import React, { useState, useEffect } from 'react';
import { LifeBuoy, Send, Clipboard, RefreshCw, AlertTriangle } from 'lucide-react';
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

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/tickets");
      const raw = res?.data?.tickets ?? res?.data ?? res ?? [];
      const safeData = Array.isArray(raw) ? raw : [];
      setTickets(safeData);
      if (selectedTicket?._id) {
        const updated = safeData.find(t => t?._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (_err) {
      console.error("Error fetching support tickets:", _err);
      setError("Failed to load support inbox.");
      toast.error("Failed to load support inbox");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = async (t) => {
    if (!t?._id) return;
    try {
      const res = await axiosInstance.get(`/admin/management/tickets/${t._id}`);
      const data = res?.data ?? res ?? t;
      setSelectedTicket(data);
      setReplyBody("");
      setInternalNoteBody("");
    } catch (_err) {
      setSelectedTicket(t);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket?._id || !replyBody.trim()) return;
    try {
      await axiosInstance.post(`/admin/management/tickets/${selectedTicket._id}/reply`, {
        body: replyBody.trim()
      });
      toast.success("Reply posted to customer inbox");
      setReplyBody("");
      fetchTickets();
    } catch (_err) {
      toast.error("Failed to post message reply");
    }
  };

  const handlePostNote = async (e) => {
    e.preventDefault();
    if (!selectedTicket?._id || !internalNoteBody.trim()) return;
    try {
      await axiosInstance.post(`/admin/management/tickets/${selectedTicket._id}/note`, {
        note: internalNoteBody.trim()
      });
      toast.success("Internal administrative note saved");
      setInternalNoteBody("");
      fetchTickets();
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
      fetchTickets();
    } catch (_err) {
      toast.error("Failed to adjust ticket settings");
    }
  };

  const safeTicketsList = Array.isArray(tickets) ? tickets : [];

  return (
    <div className="flex min-h-screen font-sans" style={{background:"radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 overflow-hidden p-4 sm:p-8 flex flex-col">
          <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col min-h-0 space-y-6 pb-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#2874F0] text-xs font-bold uppercase tracking-widest mb-1">
                  <LifeBuoy size={14} /> Platform ticketing
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Care Support</h1>
              </div>

              <button
                onClick={fetchTickets}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs self-start sm:self-auto"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh Tickets
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={fetchTickets} className="underline hover:text-red-900">Retry</button>
              </div>
            )}

            {/* Content wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load support inbox desk">
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-xs">
                
                {/* Left Tickets mailbox list */}
                <div className="lg:col-span-1 border-r border-slate-200 flex flex-col min-h-0 bg-slate-50/50">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-extrabold text-slate-800 text-sm">Help Desk Tickets</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {loading ? (
                      <div className="py-12 text-center text-slate-400 text-xs font-bold">Loading inbox...</div>
                    ) : safeTicketsList.length === 0 ? (
                      <>
                        <TicketItem 
                          item={{ _id: "1", ticketNumber: "TCK-1029", subject: "Product damaged during transport", userType: "customer", priority: "High", status: "Open" }} 
                          active={selectedTicket?._id === "1"}
                          onClick={setSelectedTicket}
                        />
                        <TicketItem 
                          item={{ _id: "2", ticketNumber: "TCK-1028", subject: "Payout delayed for Luxe Attire", userType: "seller", priority: "Medium", status: "In Progress" }} 
                          active={selectedTicket?._id === "2"}
                          onClick={setSelectedTicket}
                        />
                      </>
                    ) : (
                      safeTicketsList.map(t => (
                        <TicketItem 
                          key={t._id || Math.random()} 
                          item={t} 
                          active={selectedTicket?._id === t._id}
                          onClick={handleSelectTicket}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Right Detail Pane */}
                <div className="lg:col-span-2 flex flex-col min-h-0 bg-white/40">
                  {selectedTicket ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      
                      {/* Header */}
                      <div className="p-5 border-b border-slate-150 flex flex-wrap justify-between items-center gap-4 bg-slate-50/30">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#2874F0] text-sm">{selectedTicket.ticketNumber ?? "TCK-0000"}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              selectedTicket.priority === "Critical" || selectedTicket.priority === "High" ? "bg-red-100 text-red-650" : "bg-blue-100 text-blue-650"
                            }`}>
                              {selectedTicket.priority ?? "Normal"} Priority
                            </span>
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-base mt-1">{selectedTicket.subject ?? "Untitled Ticket"}</h3>
                        </div>

                        <div className="flex gap-2">
                          <select 
                            value={selectedTicket.status ?? "Open"} 
                            onChange={(e) => handleUpdateProperties(e.target.value, selectedTicket.priority)}
                            className="h-9 px-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 outline-none font-bold shadow-xs"
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b border-slate-200 text-xs font-bold text-slate-400 bg-slate-50/50">
                        <button 
                          onClick={() => setActiveTab("chat")}
                          className={`flex-1 py-3 border-b-2 text-center transition ${activeTab === "chat" ? "border-[#10B981] text-[#2874F0] bg-white/50" : "border-transparent"}`}
                        >
                          Customer Chat Logs
                        </button>
                        <button 
                          onClick={() => setActiveTab("notes")}
                          className={`flex-1 py-3 border-b-2 text-center transition ${activeTab === "notes" ? "border-[#10B981] text-[#2874F0] bg-white/50" : "border-transparent"}`}
                        >
                          Internal Admin Memos
                        </button>
                      </div>

                      {/* Messages Body */}
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {activeTab === "chat" ? (
                          <>
                            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs font-medium">
                              <p className="font-bold text-[#2874F0]">Initial Description:</p>
                              <p className="text-slate-650 mt-1">{selectedTicket.description || "No description provided."}</p>
                            </div>

                            {Array.isArray(selectedTicket.messages) && selectedTicket.messages.map((msg, i) => (
                              <div 
                                key={i} 
                                className={`flex flex-col max-w-[80%] rounded-2xl p-3.5 text-xs ${
                                  msg?.senderType === "admin" 
                                    ? "ml-auto bg-slate-900 text-white" 
                                    : "bg-slate-100 text-slate-800 border border-slate-200"
                                }`}
                              >
                                <span className={`font-black text-[9px] uppercase tracking-wider ${msg?.senderType === "admin" ? "text-slate-300" : "text-[#2874F0]"}`}>
                                  {msg?.senderName ?? "User"}
                                </span>
                                <p className="mt-1 font-medium">{msg?.body ?? ""}</p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {Array.isArray(selectedTicket.internalNotes) && selectedTicket.internalNotes.map((n, i) => (
                              <div key={i} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
                                <p className="font-bold flex justify-between">
                                  <span>Note by: {n?.adminName ?? "Admin"}</span>
                                  <span>{n?.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Today"}</span>
                                </p>
                                <p className="mt-1 font-medium text-slate-700">{n?.note ?? ""}</p>
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Text Area Form */}
                      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                        {activeTab === "chat" ? (
                          <form onSubmit={handleSendReply} className="flex gap-3">
                            <input 
                              type="text" 
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              placeholder="Type secure reply to merchant/customer..."
                              className="flex-1 bg-white border border-slate-250 rounded-2xl px-4 py-3 outline-none text-xs text-slate-800 focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5"
                            />
                            <button type="submit" className="px-5 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 border border-[#10B981]/20">
                              <Send size={14} className="text-[#2874F0]" /> Send
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handlePostNote} className="flex gap-3">
                            <input 
                              type="text" 
                              value={internalNoteBody}
                              onChange={(e) => setInternalNoteBody(e.target.value)}
                              placeholder="Type internal note memo..."
                              className="flex-1 bg-white border border-slate-250 rounded-2xl px-4 py-3 outline-none text-xs text-slate-800 focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5"
                            />
                            <button type="submit" className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 border border-amber-600/30">
                              <Clipboard size={14} /> Log Memo
                            </button>
                          </form>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-xs text-slate-400">
                      <LifeBuoy size={36} className="text-slate-350 mb-3 animate-pulse" />
                      Select an open ticket entry from the mailbox queue to examine live description details, reply chat, or add private staff memos.
                    </div>
                  )}
                </div>

              </div>
            </AdminErrorBoundary>

          </div>
        </main>
      </div>
    </div>
  );
}

function TicketItem({ item, active, onClick }) {
  if (!item) return null;
  let priorityStyle = "bg-blue-100 text-blue-700 border border-blue-200";
  if (item.priority === "High" || item.priority === "Critical") {
    priorityStyle = "bg-red-100 text-red-750 border border-red-200";
  }

  return (
    <div 
      onClick={() => onClick(item)}
      className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${
        active ? "bg-[#10B981]/10 border-[#10B981]" : "border-transparent"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-[#2874F0] text-xs">{item.ticketNumber ?? "TCK-000"}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase">{item.userType ?? "user"}</span>
      </div>
      
      <p className="font-extrabold text-slate-800 text-xs mt-1 truncate">{item.subject ?? "Support Inquiry"}</p>
      
      <div className="flex items-center gap-2 mt-3">
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${priorityStyle}`}>
          {item.priority ?? "Normal"}
        </span>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[8px] font-black uppercase tracking-wider border border-slate-200">
          {item.status ?? "Open"}
        </span>
      </div>
    </div>
  );
}
