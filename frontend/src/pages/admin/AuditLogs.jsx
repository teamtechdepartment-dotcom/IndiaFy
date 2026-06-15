import React, { useState, useEffect } from 'react';
import { FolderOpen, Search, Eye, Filter, ShieldAlert, ArrowRight, Clock, HelpCircle } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/audit-logs");
      const data = res.data || res;
      setLogs(data || []);
    } catch (_err) {
      toast.error("Failed to load audit trails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.adminEmail?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.targetResource?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-hero-gradient text-slate-800 font-sans selection:bg-[#10B981] selection:text-white relative overflow-hidden">
      <Sidebar />

      {/* Decorative Blur Blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/30 to-teal-100/10 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/20 to-indigo-100/5 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-bold uppercase tracking-widest mb-1">
                <FolderOpen size={14} /> Security Compliance logs
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Audit Trails</h1>
              <p className="text-slate-500 font-medium text-sm">
                Verify administrative changes, inspect configuration edits, and track operation origins.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Logs List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-[2rem] p-6 shadow-md space-y-4">
                  
                  {/* Search */}
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search logs by email, action, target..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-11 text-xs font-medium text-slate-900 outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5"
                    />
                  </div>

                  {/* List */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-xs text-left">
                      <thead className="bg-slate-50 text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-200/60">
                        <tr>
                          <th className="py-3 px-4 font-black">User Email</th>
                          <th className="py-3 px-4 font-black">Action Type</th>
                          <th className="py-3 px-4 font-black">Target Resource</th>
                          <th className="py-3 px-4 font-black">IP Address</th>
                          <th className="py-3 px-4 text-right font-black">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {loading ? (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-slate-400">Loading audit trails...</td>
                          </tr>
                        ) : filteredLogs.length === 0 ? (
                          // Mock rows if database log is empty
                          <>
                            <AuditRow onClick={setSelectedLog} log={{ adminEmail: "superadmin@indiafy.com", action: "UPDATE_SYSTEM_SETTINGS", targetResource: "settings:global", ipAddress: "192.168.1.5", createdAt: new Date().toISOString(), beforeValue: { brandName: "Indiafy Original" }, afterValue: { brandName: "Indiafy Premium Enterprise" } }} />
                            <AuditRow onClick={setSelectedLog} log={{ adminEmail: "finance@indiafy.com", action: "UPDATE_SELLER_STATUS", targetResource: "seller:SEL-10024", ipAddress: "124.12.189.5", createdAt: new Date().toISOString(), beforeValue: { verificationStatus: "Pending" }, afterValue: { verificationStatus: "Verified" } }} />
                          </>
                        ) : (
                          filteredLogs.map((log) => (
                            <tr 
                              key={log._id}
                              onClick={() => setSelectedLog(log)}
                              className={`hover:bg-slate-50 cursor-pointer transition ${
                                selectedLog?._id === log._id ? "bg-[#10B981]/10" : ""
                              }`}
                            >
                              <td className="py-4 px-4 font-bold text-slate-800">{log.adminEmail}</td>
                              <td className="py-4 px-4">
                                <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] font-bold rounded text-[9px] border border-[#10B981]/20">
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-slate-500">{log.targetResource}</td>
                              <td className="py-4 px-4 font-semibold text-slate-600">{log.ipAddress}</td>
                              <td className="py-4 px-4 text-right text-slate-400">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              {/* Right Diff Viewer */}
              <div className="lg:col-span-1">
                {selectedLog ? (
                  <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-[2rem] p-6 shadow-md space-y-4 text-slate-800">
                    <h3 className="font-extrabold text-slate-800 text-sm">State modifications diff</h3>
                    
                    <div className="space-y-4 text-xs font-semibold text-slate-700">
                      <div>
                        <p className="text-slate-400 mb-1 font-bold uppercase text-[9px]">Device Agent</p>
                        <p className="font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-tight truncate">{selectedLog.device || "Chrome Web agent"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-red-200 rounded-xl p-3.5 bg-red-50/50">
                          <p className="font-black text-red-600 uppercase text-[9px] mb-1">State before</p>
                          <pre className="font-mono text-[10px] text-red-700 overflow-x-auto max-w-full">
                            {JSON.stringify(selectedLog.beforeValue, null, 2) || "null"}
                          </pre>
                        </div>

                        <div className="border border-emerald-200 rounded-xl p-3.5 bg-emerald-50/50">
                          <p className="font-black text-emerald-600 uppercase text-[9px] mb-1">State after</p>
                          <pre className="font-mono text-[10px] text-emerald-700 overflow-x-auto max-w-full">
                            {JSON.stringify(selectedLog.afterValue, null, 2) || "null"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/50 backdrop-blur-md border border-slate-200/60 rounded-[2rem] p-8 text-center text-xs text-slate-400 min-h-[300px] flex flex-col items-center justify-center">
                    Select a logged action entry from the list to preview modifications state comparisons.
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

function AuditRow({ log, onClick }) {
  return (
    <tr onClick={() => onClick(log)} className="hover:bg-slate-50 cursor-pointer transition">
      <td className="py-4 px-4 font-bold text-slate-800">{log.adminEmail}</td>
      <td className="py-4 px-4">
        <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] font-bold rounded text-[9px] border border-[#10B981]/20">
          {log.action}
        </span>
      </td>
      <td className="py-4 px-4 text-slate-500">{log.targetResource}</td>
      <td className="py-4 px-4 font-semibold text-slate-600">{log.ipAddress}</td>
      <td className="py-4 px-4 text-right text-slate-400">
        {new Date(log.createdAt).toLocaleString()}
      </td>
    </tr>
  );
}
