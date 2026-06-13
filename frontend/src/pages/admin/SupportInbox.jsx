import React, { useState, useEffect } from 'react';
import { LifeBuoy, Search, Mail, User, ShieldAlert, Plus, Send, Clipboard, MessageSquare, UserCheck } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function SupportInbox() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [internalNoteBody, setInternalNoteBody] = useState("");
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'notes'

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/tickets");
      const data = res.data || res;
      setTickets(data || []);
      if (selectedTicket) {
        // Refresh selected
        const updated = (data || []).find(t => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      toast.error("Failed to load support inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = async (t) => {
    try {
      const res = await axiosInstance.get(`/admin/management/tickets/${t._id}`);
      setSelectedTicket(res.data || res);
      setReplyBody("");
      setInternalNoteBody("");
    } catch (err) {
      toast.error("Failed to load ticket details");
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    try {
      await axiosInstance.post(`/admin/management/tickets/${selectedTicket._id}/reply`, {
        body: replyBody
      });
      toast.success("Reply posted to customer inbox");
      setReplyBody("");
      fetchTickets();
    } catch (err) {
      toast.error("Failed to post message reply");
    }
  };

  const handlePostNote = async (e) => {
    e.preventDefault();
    if (!internalNoteBody.trim()) return;
    try {
      await axiosInstance.post(`/admin/management/tickets/${selectedTicket._id}/note`, {
        note: internalNoteBody
      });
      toast.success("Internal administrative note saved");
      setInternalNoteBody("");
      fetchTickets();
    } catch (err) {
      toast.error("Failed to log internal note");
    }
  };

  const handleUpdateProperties = async (status, priority) => {
    try {
      await axiosInstance.put(`/admin/management/tickets/${selectedTicket._id}/properties`, {
        status,
        priority
      });
      toast.success("Ticket properties updated");
      fetchTickets();
    } catch (err) {
      toast.error("Failed to adjust ticket settings");
    }
  };

  return (
    <div className="flex min-h-screen bg-hero-gradient text-slate-800 font-sans selection:bg-[#10B981] selection:text-white relative overflow-hidden">
      <Sidebar />

      {/* Decorative Blur Blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/30 to-teal-100/10 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/20 to-indigo-100/5 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Header />

        <main className="flex-1 overflow-hidden p-4 sm:p-8 flex flex-col">
          <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col min-h-0 space-y-6 pb-4">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-bold uppercase tracking-widest mb-1">
                <LifeBuoy size={14} /> Platform ticketing
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Care Support</h1>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-md">
              
              {/* Left Tickets mailbox list */}
              <div className="lg:col-span-1 border-r border-slate-200 flex flex-col min-h-0 bg-slate-50/50">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-extrabold text-slate-800 text-sm">Help Desk Tickets</h3>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {loading ? (
                    <div className="py-10 text-center text-slate-400 text-xs font-bold">Loading inbox...</div>
                  ) : tickets.length === 0 ? (
                    // Mock tickets if empty database
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
                    tickets.map(t => (
                      <TicketItem 
                        key={t._id} 
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
                          <span className="font-black text-[#10B981] text-sm">{selectedTicket.ticketNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            selectedTicket.priority === "Critical" || selectedTicket.priority === "High" ? "bg-red-100 text-red-650" : "bg-blue-100 text-blue-650"
                          }`}>
                            {selectedTicket.priority} Priority
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-base mt-1">{selectedTicket.subject}</h3>
                      </div>

                      <div className="flex gap-2">
                        <select 
                          value={selectedTicket.status} 
                          onChange={(e) => handleUpdateProperties(e.target.value, selectedTicket.priority)}
                          className="h-9 px-2 text-xs border border-slate-205 rounded-xl bg-white text-slate-800 outline-none font-bold shadow-sm"
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
                        className={`flex-1 py-3 border-b-2 text-center transition ${activeTab === "chat" ? "border-[#10B981] text-[#10B981] bg-white/50" : "border-transparent"}`}
                      >
                        Customer Chat Logs
                      </button>
                      <button 
                        onClick={() => setActiveTab("notes")}
                        className={`flex-1 py-3 border-b-2 text-center transition ${activeTab === "notes" ? "border-[#10B981] text-[#10B981] bg-white/50" : "border-transparent"}`}
                      >
                        Internal Admin Memos
                      </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                      {activeTab === "chat" ? (
                        <>
                          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs font-medium">
                            <p className="font-bold text-[#10B981]">Initial Description:</p>
                            <p className="text-slate-650 mt-1">{selectedTicket.description || "The merchant did not supply details."}</p>
                          </div>

                          {(selectedTicket.messages || []).map((msg, i) => (
                            <div 
                              key={i} 
                              className={`flex flex-col max-w-[80%] rounded-2xl p-3.5 text-xs ${
                                msg.senderType === "admin" 
                                  ? "ml-auto bg-gradient-to-r from-emerald-500 to-[#10B981] text-white" 
                                  : "bg-slate-100 text-slate-800 border border-slate-200"
                              }`}
                            >
                              <span className={`font-black text-[9px] uppercase tracking-wider ${msg.senderType === "admin" ? "text-slate-100" : "text-[#10B981]"}`}>{msg.senderName}</span>
                              <p className="mt-1 font-medium">{msg.body}</p>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {(selectedTicket.internalNotes || []).map((n, i) => (
                            <div key={i} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
                              <p className="font-bold flex justify-between">
                                <span>Note by: {n.adminName}</span>
                                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                              </p>
                              <p className="mt-1 font-medium text-slate-700">{n.note}</p>
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
                          <button type="submit" className="px-5 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 border border-[#10B981]/20">
                            <Send size={14} className="text-[#10B981]" /> Send
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

          </div>
        </main>
      </div>
    </div>
  );
}

function TicketItem({ item, active, onClick }) {
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
        <span className="font-extrabold text-[#10B981] text-xs">{item.ticketNumber}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase">{item.userType}</span>
      </div>
      
      <p className="font-extrabold text-slate-800 text-xs mt-1 truncate">{item.subject}</p>
      
      <div className="flex items-center gap-2 mt-3">
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${priorityStyle}`}>
          {item.priority}
        </span>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[8px] font-black uppercase tracking-wider border border-slate-200">
          {item.status}
        </span>
      </div>
    </div>
  );
}
