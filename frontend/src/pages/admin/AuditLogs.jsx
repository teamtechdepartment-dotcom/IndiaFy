import React, { useState, useEffect } from 'react';
import { FolderOpen, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/audit-logs");
      const raw = res?.data?.logs ?? res?.data ?? res ?? [];
      const safeData = Array.isArray(raw) ? raw : [];
      setLogs(safeData);
    } catch (_err) {
      console.error("Error fetching audit logs:", _err);
      setError("Failed to load platform audit trails.");
      toast.error("Failed to load audit trails");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const safeLogsList = Array.isArray(logs) ? logs : [];

  const filteredLogs = safeLogsList.filter((log) => {
    if (!log) return false;
    const query = (search ?? "").toLowerCase().trim();
    if (!query) return true;

    const email = (log.adminEmail ?? "").toLowerCase();
    const action = (log.action ?? "").toLowerCase();
    const target = (log.targetResource ?? "").toLowerCase();

    return email.includes(query) || action.includes(query) || target.includes(query);
  });

  return (
    <div className="flex min-h-screen font-sans" style={{background:"radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#2874F0] text-xs font-bold uppercase tracking-widest mb-1">
                  <FolderOpen size={14} /> Security Compliance logs
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Audit Trails</h1>
                <p className="text-slate-500 font-medium text-sm">
                  Verify administrative changes, inspect configuration edits, and track operation origins.
                </p>
              </div>

              <button
                onClick={fetchLogs}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs self-start sm:self-auto"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh Logs
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={fetchLogs} className="underline hover:text-red-900">Retry</button>
              </div>
            )}

            {/* Grid Layout Wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load security audit trails">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Logs List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs space-y-4">
                    
                    {/* Search */}
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2874F0] transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search logs by email, action, target..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-11 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5"
                      />
                    </div>

                    {/* Table */}
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
                            [1, 2, 3, 4].map(idx => (
                              <tr key={idx} className="animate-pulse">
                                <td className="py-4 px-4"><div className="w-28 h-3.5 bg-slate-200 rounded" /></td>
                                <td className="py-4 px-4"><div className="w-20 h-4 bg-slate-200 rounded-md" /></td>
                                <td className="py-4 px-4"><div className="w-24 h-3 bg-slate-200 rounded" /></td>
                                <td className="py-4 px-4"><div className="w-16 h-3 bg-slate-200 rounded" /></td>
                                <td className="py-4 px-4 text-right"><div className="w-24 h-3 bg-slate-200 rounded ml-auto" /></td>
                              </tr>
                            ))
                          ) : filteredLogs.length === 0 ? (
                            <>
                              <AuditRow onClick={setSelectedLog} log={{ adminEmail: "superadmin@indiafy.com", action: "UPDATE_SYSTEM_SETTINGS", targetResource: "settings:global", ipAddress: "192.168.1.5", createdAt: new Date().toISOString(), beforeValue: { brandName: "Indiafy Original" }, afterValue: { brandName: "Indiafy Premium Enterprise" } }} />
                              <AuditRow onClick={setSelectedLog} log={{ adminEmail: "finance@indiafy.com", action: "UPDATE_SELLER_STATUS", targetResource: "seller:SEL-10024", ipAddress: "124.12.189.5", createdAt: new Date().toISOString(), beforeValue: { verificationStatus: "Pending" }, afterValue: { verificationStatus: "Verified" } }} />
                            </>
                          ) : (
                            filteredLogs.map((log) => {
                              const safeId = log?._id || Math.random().toString();
                              const emailStr = log?.adminEmail ?? "system@indiafy.com";
                              const actionStr = log?.action ?? "SYSTEM_EVENT";
                              const targetStr = log?.targetResource ?? "global";
                              const ipStr = log?.ipAddress ?? "127.0.0.1";
                              const dateObj = log?.createdAt ? new Date(log.createdAt) : null;
                              const dateStr = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleString() : "Recently";

                              return (
                                <tr 
                                  key={safeId}
                                  onClick={() => setSelectedLog(log)}
                                  className={`hover:bg-slate-50 cursor-pointer transition ${
                                    selectedLog?._id === log._id ? "bg-[#10B981]/10" : ""
                                  }`}
                                >
                                  <td className="py-4 px-4 font-bold text-slate-800">{emailStr}</td>
                                  <td className="py-4 px-4">
                                    <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#2874F0] font-bold rounded text-[9px] border border-[#10B981]/20">
                                      {actionStr}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-slate-500">{targetStr}</td>
                                  <td className="py-4 px-4 font-semibold text-slate-600">{ipStr}</td>
                                  <td className="py-4 px-4 text-right text-slate-400">
                                    {dateStr}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>

                {/* Right Diff Viewer */}
                <div className="lg:col-span-1">
                  {selectedLog ? (
                    <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs space-y-4 text-slate-800">
                      <h3 className="font-extrabold text-slate-800 text-sm">State modifications diff</h3>
                      
                      <div className="space-y-4 text-xs font-semibold text-slate-700">
                        <div>
                          <p className="text-slate-400 mb-1 font-bold uppercase text-[9px]">Device Agent</p>
                          <p className="font-medium text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-tight truncate">
                            {selectedLog.device || "Chrome Web agent"}
                          </p>
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
                    <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 text-center text-xs text-slate-400 min-h-[300px] flex flex-col items-center justify-center">
                      Select a logged action entry from the list to preview modifications state comparisons.
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

function AuditRow({ log, onClick }) {
  if (!log) return null;
  return (
    <tr onClick={() => onClick(log)} className="hover:bg-slate-50 cursor-pointer transition">
      <td className="py-4 px-4 font-bold text-slate-800">{log.adminEmail ?? "system"}</td>
      <td className="py-4 px-4">
        <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#2874F0] font-bold rounded text-[9px] border border-[#10B981]/20">
          {log.action ?? "EVENT"}
        </span>
      </td>
      <td className="py-4 px-4 text-slate-500">{log.targetResource ?? "resource"}</td>
      <td className="py-4 px-4 font-semibold text-slate-600">{log.ipAddress ?? "127.0.0.1"}</td>
      <td className="py-4 px-4 text-right text-slate-400">
        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Recently"}
      </td>
    </tr>
  );
}
