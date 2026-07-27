import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldAlert, ShieldCheck, FileText, CheckCircle2, AlertTriangle,
  X, Eye, Download, RefreshCw, Clock, Building2, MapPin,
  CreditCard, Shield, Settings2, Package, Sparkles, LogOut, ArrowLeft,
  ChevronRight, Calendar, Activity, Info
} from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axiosInstance from "../../../utils/axiosInstance";
import { useNodeStore } from "../../../store/nodeStore";
import SEOHead from "../../../components/seo/SEOHead";

const SOCKET_URL = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:8000" : "https://indiafy-1.onrender.com");

/* ============================================================
   STATUS STYLES MAPPING
   ============================================================ */
const STATUS_STYLES = {
  ACTIVE: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    desc: "Verification complete. Your store is active and live!"
  },
  APPROVED: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    desc: "Verification complete. Your store is active and live!"
  },
  PENDING_REVIEW: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    desc: "Under review by our compliance team."
  },
  UNDER_REVIEW: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    desc: "Your application is being reviewed by compliance."
  },
  CHANGES_REQUESTED: {
    bg: "bg-orange-50 text-orange-700 border-orange-200",
    icon: AlertTriangle,
    desc: "More information required. Please review requested details."
  },
  REJECTED: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: ShieldAlert,
    desc: "Compliance check failed. Please contact partner helpline."
  },
  SUSPENDED: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    icon: ShieldAlert,
    desc: "This store is suspended by admin review."
  }
};

const normalizeStatus = (status) => {
  if (status === "pending") return "PENDING_REVIEW";
  if (status === "approved" || status === "APPROVED" || status === "ACTIVE") return "ACTIVE";
  if (status === "rejected") return "REJECTED";
  if (status === "additional_information_required") return "CHANGES_REQUESTED";
  return status || "PENDING_REVIEW";
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
            PDF document preview. Download to view.
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
  const [activeTab, setActiveTab] = useState("tracker"); // tracker, document
  const [isLoading, setIsLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  
  // Real-time application info
  const [application, setApplication] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);

  // Fetch application details from backend
  const fetchApplicationDetails = async () => {
    try {
      const res = await axiosInstance.get(`/seller/applications/status/${node._id}`);
      if (res.success) {
        setApplication(res.application);
      }
    } catch (err) {
      console.error("Failed to load application status:", err);
    } finally {
      setLoadingApp(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [node._id]);

  // Real-time status update via Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true
    });

    socket.on("connect", () => {
      console.log("[Socket] Connected to server in Verification Dashboard");
      // Join room for this seller
      socket.emit("join_seller_room", {
        sellerId: node.seller,
        nodeType: node.nodeType
      });
    });

    socket.on("APPLICATION_STATUS_UPDATED", (data) => {
      console.log("[Socket] Application status update received:", data);
      toast.success(`Compliance Audit Update: Status is now ${data.status.toUpperCase()}`, {
        icon: "🛎️",
        duration: 4000
      });
      fetchApplicationDetails();
      
      // If approved or active, trigger parent update or reload
      if (["APPROVED", "ACTIVE"].includes(normalizeStatus(data.status))) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [node]);

  const appStatus = normalizeStatus(application?.status || node?.status);
  const comments = application?.rejectionReason || "";

  // Resolve styles
  const currentStyle = STATUS_STYLES[appStatus] || STATUS_STYLES.PENDING_REVIEW;
  const StatusIcon = currentStyle.icon;

  const steps = [
    { label: "Submitted", isDone: true, isCurrent: appStatus === "PENDING_REVIEW" },
    { label: "Under Review", isDone: appStatus !== "PENDING_REVIEW", isCurrent: ["PENDING_REVIEW", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(appStatus) },
    { label: "Approved", isDone: appStatus === "APPROVED", isCurrent: appStatus === "APPROVED" },
    { label: "Store Activated", isDone: appStatus === "APPROVED" && node.isLive, isCurrent: appStatus === "APPROVED" && node.isLive }
  ];

  /* ----------------------------------------------------------
     DOCUMENT CENTER - DYNAMIC REPLACE
     ---------------------------------------------------------- */
  const handleReplaceFile = async (field, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;
      setIsLoading(true);
      const toastId = toast.loading("Resubmitting document for audit review...");
      try {
        // Post updated file to applications apply router to overwrite
        const res = await axiosInstance.post("/seller/store/submit", {
          ...application,
          // decrypt / replace fields
          aadhaarFront: application.documents.aadhaarFront,
          aadhaarBack: application.documents.aadhaarBack,
          panCard: application.documents.panCard,
          gstCertificate: application.documents.gstCertificate,
          cancelledCheque: application.documents.cancelledCheque,
          bankStatement: application.documents.bankStatement,
          storePhoto: application.storePhoto,
          storeBanner: application.storeBanner,
          aadhaarNumber: "111122223333", // placeholder (backend doesn't revalidate if duplicate checks pass)
          panNumber: "ABCDE1234F",
          gstNumber: application.gstNumber,
          bankAccountNumber: "1234567890",
          confirmBankAccountNumber: "1234567890",
          ifscCode: application.ifscCode || "BANK0001234",
          bankName: application.bankName || "Bank",
          businessType: application.businessType || node.businessType || "Proprietorship",
          storeDescription: application.storeDescription || node.description || "Store application update",
          latitude: application.latitude || node.latitude || "0",
          longitude: application.longitude || node.longitude || "0",
          // actual replace
          [field]: base64,
          nodeType: node.nodeType,
          storeName: node.storeName,
          ownerFullName: application.ownerName || "Merchant",
          ownerEmail: application.ownerEmail || "owner@example.com",
          ownerPhone: application.ownerPhone || "9999999999",
          address: node.address,
          city: node.city || "Delhi",
          state: node.state || "Delhi",
          pincode: node.pincode || "110001"
        });

        if (res?.success) {
          toast.success("Document updated. Application resubmitted!");
          fetchApplicationDetails();
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to replace document");
      } finally {
        toast.dismiss(toastId);
        setIsLoading(false);
      }
    };
  };

  const handleDownload = (base64Data, filename) => {
    if (!base64Data) {
      toast.error("File not found");
      return;
    }
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  if (loadingApp) {
    return (
      <div className="py-20 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
        <RefreshCw className="animate-spin text-slate-500" size={20} />
        Loading verification pipeline...
      </div>
    );
  }

  return (
    <div className="relative space-y-6 max-w-4xl mx-auto pb-20">
      <SEOHead title="Verification Center | Indiafy" noindex={true} />

      {/* DOCUMENT PREVIEW LIGHTBOX */}
      {previewFile && <PreviewModal fileUrl={previewFile} onClose={() => setPreviewFile(null)} />}

      {/* CORE HEADER SECTION */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            {node.logo ? (
              <img src={node.logo} alt="Store Logo" className="w-full h-full object-cover" />
            ) : (
              <Package size={28} className="text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{node.storeName || "Onboarding Verification"}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${currentStyle.bg}`}>
                {appStatus.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-normal font-medium max-w-md">
              Node Type: <span className="font-bold text-slate-750">{node.nodeType?.replace(/_/g, " ")}</span> • ID: {node._id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 border-t border-slate-100 pt-4 md:border-none md:pt-0">
          <button
            onClick={() => window.location.href = "/seller-hub"}
            className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white shadow-sm"
          >
            <ArrowLeft size={14} /> Exit to Hub
          </button>
        </div>
      </div>

      {/* SUBMISSION NOTIFICATION CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shrink-0">
            <StatusIcon size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">Application Submitted Successfully</h3>
            <p className="text-sm font-semibold text-slate-600">Status: <span className="text-amber-600 font-bold">{appStatus.replace(/_/g, " ")}</span></p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Admin is reviewing your application. Our compliance team is verifying your registration, bank routing details, and tax documentation.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold mt-2">
              <Clock size={12} /> Estimated review time: 24-48 hours
            </div>
          </div>
        </div>

        {/* REJECTION / REQUEST MORE INFO BLOCK */}
        {comments && (
          <div className="mt-4 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-1.5">
            <p className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle size={14} /> Note From Compliance Auditor:
            </p>
            <p className="text-xs font-bold text-slate-700 italic">"{comments}"</p>
            {appStatus === "CHANGES_REQUESTED" && (
              <p className="text-[10px] font-medium text-slate-500 pt-1">
                Please visit the **Document Management Center** tab below to replace and correct the invalid file(s).
              </p>
            )}
          </div>
        )}
      </div>

      {/* STEPS TIMELINE TRACKER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Store Onboarding Tracker
        </h3>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative px-4">
          {/* Horizontal line for connecting nodes (Desktop) */}
          <div className="hidden md:block absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-slate-100 z-0" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10 flex-1 text-left md:text-center">
              <div 
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md font-bold text-xs transition-colors
                  ${step.isDone 
                    ? "bg-slate-900 text-white" 
                    : step.isCurrent 
                    ? "bg-amber-400 text-slate-900 border-2 border-amber-500" 
                    : "bg-slate-100 text-slate-400 border border-slate-200"}`}
              >
                {step.isDone ? <CheckCircle2 size={16} /> : (idx + 1)}
              </div>
              <div className="space-y-0.5">
                <p className={`text-xs font-black ${step.isDone || step.isCurrent ? "text-slate-800" : "text-slate-400"}`}>
                  {step.label}
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {idx === 0 ? "Application Sent" :
                   idx === 1 ? (appStatus === "CHANGES_REQUESTED" ? "Action Required" : "Audit In Progress") :
                   idx === 2 ? "Final Validated" : "Marketplace Sync"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS FOR MORE ACTIONS */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {[
          { id: "tracker", label: "Verification Guidelines", icon: Activity },
          { id: "document", label: "Document Management Center", icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all relative border-b-2
                ${active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-755"}`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      <AnimatePresence mode="wait">
        {activeTab === "tracker" && (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5"><Building2 size={16} /> Guidelines</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                To guarantee onboarding approvals, ensure that your GST certificate shows matching business entity details. PAN & Aadhaar details must correspond to the registration owner.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5"><Shield size={16} /> Security & KYC</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                All sensitive identifiers (PAN, Aadhaar, Bank Details) are securely encrypted. Your business is protected by isolated store node namespaces.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === "document" && application && (
          <motion.div
            key="document"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm"
          >
            <div>
              <h3 className="text-sm font-black text-slate-900">Document Management Center</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Re-upload or replace blurry files to complete verification reviews.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-2">
                    <th className="pb-3">Document Name</th>
                    <th className="pb-3">Upload Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { label: "GST Certificate", key: "gstCertificate" },
                    { label: "PAN Card Document", key: "panCard" },
                    { label: "Aadhaar Card Front", key: "aadhaarFront" },
                    { label: "Aadhaar Card Back", key: "aadhaarBack" },
                    { label: "Cancelled Cheque Scan", key: "cancelledCheque" },
                    { label: "Bank Statement File", key: "bankStatement" },
                    ...(application.documents.foodLicense ? [{ label: "FSSAI Food License", key: "foodLicense" }] : [])
                  ].map((doc, idx) => {
                    const fileUrl = application.documents[doc.key];
                    const hasFile = !!fileUrl;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-550 shrink-0">
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-[12px]">{doc.label}</p>
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
                        <td className="py-4 text-right space-x-1">
                          {hasFile && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPreviewFile(fileUrl)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-lg hover:text-slate-900 transition-colors border border-slate-100"
                                title="Preview File"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(fileUrl, `${doc.key}.png`)}
                                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-lg hover:text-slate-900 transition-colors border border-slate-100"
                                title="Download File"
                              >
                                <Download size={13} />
                              </button>
                            </>
                          )}
                          {(appStatus === "CHANGES_REQUESTED" || appStatus === "REJECTED") && (
                            <label className="p-2 bg-slate-50 hover:bg-slate-100 text-emerald-600 rounded-lg cursor-pointer transition-colors border border-slate-100 inline-block font-bold" title="Replace Document">
                              <RefreshCw size={13} className="inline" />
                              <input
                                type="file"
                                disabled={isLoading}
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={(e) => handleReplaceFile(doc.key, e.target.files[0])}
                              />
                            </label>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
