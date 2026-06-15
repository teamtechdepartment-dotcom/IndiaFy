import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, ShieldCheck, FileText, CheckCircle2, AlertTriangle,
  X, Eye, Download, RefreshCw, Clock, Building2, MapPin,
  CreditCard, Shield, Settings2, Package, Sparkles, LogOut, ArrowLeft,
  ChevronRight, Calendar, Activity, Info
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosInstance";
import { useNodeStore } from "../../../store/nodeStore";

/* ============================================================
   STATUS STYLES MAPPING
   ============================================================ */
const STATUS_STYLES = {
  Approved: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    desc: "Verification complete and verified."
  },
  "In Review": {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    desc: "Under review by our compliance team."
  },
  Pending: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Info,
    desc: "Verification queued, awaiting document review."
  },
  "Action Required": {
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    icon: AlertTriangle,
    desc: "Documents rejected or mismatched. Please replace files."
  },
  Rejected: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: ShieldAlert,
    desc: "Compliance check failed. Contact partner helpline."
  }
};

/* ============================================================
   IMAGE PREVIEW MODAL
   ============================================================ */
function PreviewModal({ fileUrl, onClose }) {
  if (!fileUrl) return null;
  return (
    <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden p-2 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900 transition-colors text-white rounded-full z-10"
        >
          <X size={20} />
        </button>
        {fileUrl.startsWith("data:application/pdf") || fileUrl.endsWith(".pdf") ? (
          <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-slate-100 text-slate-500 font-bold p-6">
            <FileText size={48} className="text-slate-400 mb-2" />
            PDF document preview not available directly in base64. Download to view.
          </div>
        ) : (
          <img src={fileUrl} alt="Preview" className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl" />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function VerificationDashboard({ node }) {
  const { updateActiveNode } = useNodeStore();
  const [activeTab, setActiveTab] = useState("tracker"); // tracker, document, history
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Local state copy of node data for reactive rendering
  const [nodeData, setNodeData] = useState(node);

  useEffect(() => {
    setNodeData(node);
  }, [node]);

  // Read current verification status tracker or define default if empty
  const status = nodeData?.verificationStatus || {
    business: "Pending",
    address: "Pending",
    bank: "Pending",
    documents: "Pending",
    compliance: "Pending",
    storeApproval: "Pending"
  };

  /* ----------------------------------------------------------
     SIMULATED ACTIONS FOR AUDIT LOG MOCKS
     ---------------------------------------------------------- */
  const [historyLogs, setHistoryLogs] = useState([
    { id: 1, action: "Store Onboarding Submitted", time: new Date(node.createdAt).toLocaleString(), user: "System" },
    { id: 2, action: "Business validation status initialized to Pending", time: new Date(node.createdAt).toLocaleString(), user: "Compliance Bot" },
    { id: 3, action: "IFSC code matching test passed", time: new Date(node.createdAt).toLocaleString(), user: "Settlement Bot" }
  ]);

  const addLog = (action) => {
    setHistoryLogs(prev => [
      { id: Date.now(), action, time: new Date().toLocaleString(), user: "Merchant Sandbox Console" },
      ...prev
    ]);
  };

  /* ----------------------------------------------------------
     SIMULATE ADMIN REVIEW & STATUS CHANGE
     ---------------------------------------------------------- */
  const handleSimulateStatus = async (stage, newStatus) => {
    setIsLoading(true);
    try {
      const updatedStatus = { ...status, [stage]: newStatus };
      
      // If storeApproval is Approved, or all are Approved, flip isVerified to true
      let isVerified = nodeData.isVerified;
      if (stage === "storeApproval" && newStatus === "Approved") {
        isVerified = true;
      }

      const res = await axiosInstance.put(`/seller/nodes/${nodeData._id}`, {
        verificationStatus: updatedStatus,
        isVerified: isVerified
      });

      if (res?.success && res?.node) {
        setNodeData(res.node);
        updateActiveNode(res.node);
        addLog(`Changed ${stage} status to ${newStatus}`);
        toast.success(`${stage} status updated to ${newStatus}`);

        if (isVerified) {
          setShowCelebration(true);
        }
      }
    } catch (err) {
      toast.error("Failed to update verification status simulation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateApproveAll = async () => {
    setIsLoading(true);
    try {
      const updatedStatus = {
        business: "Approved",
        address: "Approved",
        bank: "Approved",
        documents: "Approved",
        compliance: "Approved",
        storeApproval: "Approved"
      };

      const res = await axiosInstance.put(`/seller/nodes/${nodeData._id}`, {
        verificationStatus: updatedStatus,
        isVerified: true
      });

      if (res?.success && res?.node) {
        setNodeData(res.node);
        updateActiveNode(res.node);
        addLog("Approved entire store credentials sandbox review");
        toast.success("Congratulations! Store approved completely.");
        setShowCelebration(true);
      }
    } catch (err) {
      toast.error("Failed to simulate store approval");
    } finally {
      setIsLoading(false);
    }
  };

  /* ----------------------------------------------------------
     DOCUMENT CENTER - DYNAMIC REPLACE
     ---------------------------------------------------------- */
  const handleReplaceFile = async (field, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;
      setIsLoading(true);
      try {
        const res = await axiosInstance.put(`/seller/nodes/${nodeData._id}`, {
          [field]: base64,
          // Reverting approval statuses back to In Review upon replace
          verificationStatus: {
            ...status,
            documents: "In Review",
            compliance: "In Review",
            storeApproval: "Pending"
          }
        });

        if (res?.success && res?.node) {
          setNodeData(res.node);
          updateActiveNode(res.node);
          addLog(`Replaced document: ${field}`);
          toast.success("Document updated. Resubmitted for compliance audit.");
        }
      } catch (err) {
        toast.error("Failed to replace document");
      } finally {
        setIsLoading(false);
      }
    };
  };

  /* ----------------------------------------------------------
     DOCUMENT CENTER - DOWNLOAD MOCK
     ---------------------------------------------------------- */
  const handleDownload = (base64Data, filename) => {
    if (!base64Data) {
      toast.error("File details not found");
      return;
    }
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download initiated!");
  };

  return (
    <div className="relative space-y-6 max-w-6xl mx-auto pb-20">
      
      {/* CELEBRATION MODAL ON SUCCESSFUL APPROVAL */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full text-center border border-slate-100 shadow-2xl relative space-y-6 overflow-hidden"
            >
              {/* Confetti Animation Elements */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-4 rounded"
                    style={{
                      backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"][i % 5],
                      top: "20%",
                      left: `${10 + i * 8}%`
                    }}
                    animate={{
                      y: [0, 400],
                      x: [0, (Math.random() - 0.5) * 100],
                      rotate: [0, 360],
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>

              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <Sparkles size={40} className="fill-current" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Onboarding Verified!</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Compliance review check verified successfully! Your store <span className="font-extrabold text-slate-800">"{nodeData.storeName}"</span> is activated and live on the Indiafy Marketplace catalog network.
                </p>
              </div>

              <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 text-left space-y-1.5">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">UNLOCKED CHANNELS</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-650">
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Storefront Listings</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Real-time Live Dispatch</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Financial Settlement</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Operational Analytics</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCelebration(false);
                  window.location.reload(); // Reload dashboard router context
                }}
                className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-95 text-xs flex items-center justify-center gap-2"
              >
                Enter Active Dashboard <ChevronRight size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCUMENT PREVIEW LIGHTBOX */}
      {previewFile && <PreviewModal fileUrl={previewFile} onClose={() => setPreviewFile(null)} />}

      {/* DEVELOPER SANDBOX SIMULATION REVIEW CONTROLLER PANEL */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings2 size={18} className="text-indigo-600 animate-spin-slow" />
            <div>
              <p className="text-sm font-black text-slate-900">Developer Sandbox — Verification Review Controller</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Simulate actual admin governance panel actions in real-time.</p>
            </div>
          </div>
          <button
            onClick={handleSimulateApproveAll}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10 hover:opacity-95 transition flex items-center gap-1.5"
          >
            <Sparkles size={12} className="fill-current" /> Auto-Approve Entire Store
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: "business", label: "Business Stage" },
            { id: "address", label: "Address Stage" },
            { id: "bank", label: "Bank Settlement" },
            { id: "documents", label: "Documents" },
            { id: "compliance", label: "Compliance" },
            { id: "storeApproval", label: "Final Approval" }
          ].map(stage => (
            <div key={stage.id} className="border border-slate-100 p-2.5 rounded-xl bg-slate-50/20 text-center space-y-2">
              <span className="text-[10px] font-black text-slate-700 block truncate">{stage.label}</span>
              <select
                disabled={isLoading}
                value={status[stage.id] || "Pending"}
                onChange={(e) => handleSimulateStatus(stage.id, e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] font-bold outline-none cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Action Required">Action Required</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* CORE HEADER SECTION */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            {nodeData.logo ? (
              <img src={nodeData.logo} alt="Store Logo" className="w-full h-full object-cover" />
            ) : (
              <Package size={28} className="text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{nodeData.storeName || "Onboarding Verification"}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                Awaiting Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-normal font-medium max-w-md">
              Node Type: <span className="font-bold text-slate-750">{nodeData.nodeType?.replace(/_/g, " ")}</span> • Registration ID: {nodeData._id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 border-t border-slate-100 pt-4 md:border-none md:pt-0">
          <button
            onClick={() => window.location.href = "/seller-hub"}
            className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white"
          >
            <ArrowLeft size={14} /> Exit to Hub
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {[
          { id: "tracker", label: "Verification Tracker", icon: Activity },
          { id: "document", label: "Document Management Center", icon: FileText },
          { id: "history", label: "Audit Logs & History", icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all relative border-b-2
                ${active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"}`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT CAROUSEL/GRID */}
      <AnimatePresence mode="wait">
        {activeTab === "tracker" && (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { id: "business", label: "Business Verification", desc: "GSTIN registration check, PAN number match, and proprietorship verification", icon: Building2 },
              { id: "address", label: "Store Location Verification", desc: "GPS geocoding audit, pin matching, and store front signage photo review", icon: MapPin },
              { id: "bank", label: "Settlement Account Validation", desc: "IFSC registry verification, micro-deposit verification, and cheque confirmation", icon: CreditCard },
              { id: "documents", label: "Compliance Document Check", desc: "Establishment records, trade permits, and local state tax declaration reviews", icon: Shield },
              { id: "compliance", label: "Regulatory Licensing Review", desc: "FSSAI food license audit, drug control board declarations, and MSME certificate reviews", icon: Settings2 },
              { id: "storeApproval", label: "Store Approval & Launch", desc: "Final system-wide onboarding review parameters check and account activation", icon: Sparkles }
            ].map(stage => {
              const currentStatus = status[stage.id] || "Pending";
              const Style = STATUS_STYLES[currentStatus];
              const StatusIcon = Style.icon;
              const StageIcon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                        <StageIcon size={20} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${Style.bg}`}>
                        <StatusIcon size={10} className="shrink-0" /> {currentStatus}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{stage.label}</h3>
                      <p className="text-slate-450 text-[11px] leading-relaxed mt-1 font-medium">{stage.desc}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Auditor Comments</span>
                    <p className="text-slate-500 text-[10px] mt-0.5 font-medium italic">
                      {currentStatus === "Approved" ? "✓ Validation passed. Ready for release." :
                       currentStatus === "In Review" ? "⌛ Automated OCR checks completed. Verifying signature." :
                       currentStatus === "Action Required" ? "⚠ Document scan blurry. Please replace the document." :
                       "Awaiting review of legal credentials."}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === "document" && (
          <motion.div
            key="document"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm"
          >
            <div>
              <h3 className="text-sm font-black text-slate-900">Document Management Center</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Verify, replace, or download currently active regulatory document filings.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-2">
                    <th className="pb-3">Document Name</th>
                    <th className="pb-3">Upload Status</th>
                    <th className="pb-3">Verification Stage</th>
                    <th className="pb-3">Expiry Tracking</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { label: "GST Certificate File", key: "gstCertificatePhoto", stage: "compliance", expires: "Expires in 365 Days" },
                    { label: "PAN Card Document", key: "panCardPhoto", stage: "business", expires: "Never Expires" },
                    { id: 1, label: "Aadhaar Card Front", key: "aadhaarFrontPhoto", stage: "business", expires: "Never Expires" },
                    { id: 2, label: "Aadhaar Card Back", key: "aadhaarBackPhoto", stage: "business", expires: "Never Expires" },
                    { label: "Cancelled Cheque Scan", key: "cancelledChequePhoto", stage: "bank", expires: "Never Expires" },
                    { label: "Owner Selfie Image", key: "ownerSelfiePhoto", stage: "compliance", expires: "Never Expires" },
                    { label: "Storefront Photo", key: "storeFrontPhoto", stage: "address", expires: "Re-verify in 2 Years" }
                  ].map((doc, idx) => {
                    const hasFile = !!nodeData[doc.key];
                    const stageStatus = status[doc.stage] || "Pending";
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-550 shrink-0">
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-[12px]">{doc.label}</p>
                              <p className="text-[10px] text-slate-400 font-medium">regulatory-filing-{doc.key.slice(-5)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            hasFile ? "bg-emerald-50 text-emerald-600 border border-emerald-150" : "bg-rose-50 text-rose-600 border border-rose-150"
                          }`}>
                            {hasFile ? "Uploaded" : "Missing"}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="font-bold text-slate-700">{doc.stage.charAt(0).toUpperCase() + doc.stage.slice(1)}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Stage Status: {stageStatus}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-slate-600 font-medium flex items-center gap-1 text-[11px]">
                            <Calendar size={12} className="text-slate-400" /> {doc.expires}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-1">
                          {hasFile && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPreviewFile(nodeData[doc.key])}
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg hover:text-slate-900 transition-colors border border-slate-100"
                                title="Preview File"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(nodeData[doc.key], `${doc.key}.png`)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg hover:text-slate-900 transition-colors border border-slate-100"
                                title="Download File"
                              >
                                <Download size={13} />
                              </button>
                            </>
                          )}
                          <label className="p-2 bg-slate-50 hover:bg-slate-100 text-emerald-600 rounded-lg cursor-pointer transition-colors border border-slate-100 inline-block font-bold" title="Replace Document">
                            <RefreshCw size={13} className="inline" />
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => handleReplaceFile(doc.key, e.target.files[0])}
                            />
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm"
          >
            <div>
              <h3 className="text-sm font-black text-slate-900">Compliance Audit logs</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Log records showing document verification state history and replacement timestamps.</p>
            </div>

            <div className="relative border-l-2 border-slate-100 pl-5 space-y-5 py-2">
              {historyLogs.map(log => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-500 shadow-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.time}</span>
                    <p className="text-slate-800 font-bold text-xs mt-0.5">{log.action}</p>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">Triggered by: {log.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
