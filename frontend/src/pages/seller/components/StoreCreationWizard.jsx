/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Loader2, Store, CreditCard, Upload, Check, Clock,
  FileText, Zap, Shield, Eye, Trash2, CheckCircle2, AlertTriangle,
  ArrowLeft, ArrowRight, User, Building
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosInstance";
import { useNodeStore } from "../../../store/nodeStore";

const NODE_CONFIG = {
  LOCAL_RETAIL: {
    label: "Local Retail Store", subtitle: "Neighbourhood shop for everyday customers",
    color: "#2563EB", lightBg: "#EFF6FF", gradient: "from-blue-600 via-blue-500 to-indigo-500",
    emoji: "🏪", accent: "blue",
    steps: ["Store Details", "Owner & KYC", "Business & Bank", "Documents"],
  },
  WHOLESALE_B2B: {
    label: "Wholesale B2B Hub", subtitle: "Bulk supplier for businesses & retailers",
    color: "#D97706", lightBg: "#FFFBEB", gradient: "from-amber-500 via-orange-500 to-yellow-500",
    emoji: "🏭", accent: "amber",
    steps: ["Store Details", "Owner & KYC", "Business & Bank", "Documents"],
  },
  QUICK_COMMERCE: {
    label: "Quick Commerce Node", subtitle: "Ultra-fast delivery within 30 minutes",
    color: "#059669", lightBg: "#ECFDF5", gradient: "from-emerald-500 via-teal-500 to-green-500",
    emoji: "⚡", accent: "emerald",
    steps: ["Store Details", "Owner & KYC", "Business & Bank", "Documents"],
  },
  HOME_ESSENTIALS: {
    label: "Home Essentials Store", subtitle: "Daily essentials delivered to doorstep",
    color: "#EA580C", lightBg: "#FFF7ED", gradient: "from-orange-500 via-red-500 to-rose-500",
    emoji: "🏠", accent: "orange",
    steps: ["Store Details", "Owner & KYC", "Business & Bank", "Documents"],
  },
  ELECTRONICS: {
    label: "Electronics Store", subtitle: "Gadgets, devices & tech accessories",
    color: "#7C3AED", lightBg: "#F5F3FF", gradient: "from-purple-600 via-violet-600 to-indigo-600",
    emoji: "💻", accent: "purple",
    steps: ["Store Details", "Owner & KYC", "Business & Bank", "Documents"],
  },
  PERSONAL_CARE: {
    label: "Personal Care Store", subtitle: "Beauty, wellness & self-care products",
    color: "#DB2777", lightBg: "#FDF2F8", gradient: "from-pink-500 via-rose-500 to-fuchsia-500",
    emoji: "✨", accent: "pink",
    steps: ["Store Details", "Owner & KYC", "Business & Bank", "Documents"],
  },
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function PreviewModal({ fileUrl, onClose }) {
  if (!fileUrl) return null;
  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 bg-slate-900 text-white rounded-full hover:bg-slate-700 transition">
          <X size={16} />
        </button>
        {fileUrl.startsWith("data:application/pdf") || fileUrl.endsWith(".pdf") ? (
          <div className="h-64 flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-6">
            <FileText size={40} className="text-slate-400 mb-2" />
            <p className="font-semibold text-sm">PDF preview not available. File is uploaded.</p>
          </div>
        ) : (
          <img src={fileUrl} alt="Preview" className="max-h-[80vh] w-auto max-w-full object-contain" />
        )}
      </div>
    </div>
  );
}

function FormInput({ label, required = true, error, hint, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[11px] text-slate-400 -mt-0.5">{hint}</p>}
      <input
        {...props}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-slate-800 bg-white outline-none transition-all placeholder:text-slate-300 focus:ring-2 focus:ring-offset-0 ${error ? "border-red-400 focus:ring-red-200 focus:border-red-500" : "border-slate-200 focus:ring-slate-200 focus:border-slate-400"}`}
      />
      {error && <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1"><AlertTriangle size={10} /> {error}</span>}
    </div>
  );
}

function FormTextarea({ label, required = true, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        {...props}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium text-slate-800 bg-white outline-none transition-all resize-none placeholder:text-slate-300 focus:ring-2 focus:ring-offset-0 ${error ? "border-red-400 focus:ring-red-200 focus:border-red-500" : "border-slate-200 focus:ring-slate-200 focus:border-slate-400"}`}
      />
      {error && <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1"><AlertTriangle size={10} /> {error}</span>}
    </div>
  );
}

function DocumentUploader({ label, value, onChange, onPreview, error, optional = false, id }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error(`${label}: File exceeds 10MB`); return; }
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) { toast.error(`${label}: Only JPG, PNG, WEBP, PDF allowed`); return; }
    setIsReading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      await new Promise(r => setTimeout(r, 250));
      onChange(previewUrl, file);
      toast.success(`${label} uploaded!`);
    } catch { toast.error("Error reading file"); }
    finally { setIsReading(false); }
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };

  return (
    <div id={id} className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
        {label}
        {optional ? <span className="ml-1 text-[10px] font-normal text-slate-400 normal-case">(optional)</span> : <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
        onClick={() => !isReading && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center h-24 text-center ${dragActive ? "border-blue-400 bg-blue-50" : "hover:border-slate-400 hover:bg-slate-50"} ${value ? "border-emerald-400 bg-emerald-50/30" : error ? "border-red-400 bg-red-50/30" : "border-slate-200 bg-slate-50/50"}`}
      >
        {isReading ? (
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <Loader2 size={18} className="animate-spin text-blue-500" />
            <span className="text-[11px] font-semibold">Scanning...</span>
          </div>
        ) : value ? (
          <div className="absolute inset-0 group">
            {value.startsWith("blob:") ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-emerald-600">
                <FileText size={22} className="mb-1" />
                <span className="text-[11px] font-bold">File Uploaded ✓</span>
              </div>
            ) : (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); onPreview(value); }} className="p-1.5 bg-white text-slate-800 rounded-full hover:bg-slate-100 shadow"><Eye size={12} /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(""); }} className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"><Trash2 size={12} /></button>
            </div>
          </div>
        ) : (
          <>
            <Upload size={18} className="text-slate-400 mb-1" />
            <span className="text-xs font-bold text-slate-600">Click or drag & drop</span>
            <span className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG (max 10MB)</span>
          </>
        )}
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>
      {error && <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1"><AlertTriangle size={10} />{error}</span>}
    </div>
  );
}

function ImageUploader({ label, value, onChange, aspect = "banner", error, id }) {
  const fileInputRef = useRef(null);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error(`${label}: File exceeds 10MB`); return; }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error(`${label}: Only JPG, PNG, WEBP allowed`); return; }
    try { const base64 = await fileToBase64(file); onChange(base64, file); }
    catch { toast.error("Error reading file"); }
  };
  const isSquare = aspect === "square";
  return (
    <div id={id} className={`flex flex-col gap-1.5 ${isSquare ? "w-28 shrink-0" : "flex-1 min-w-0"}`}>
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}<span className="text-red-500 ml-0.5">*</span></label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${error ? "border-red-400 bg-red-50" : value ? "border-emerald-400 bg-emerald-50/30" : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-50"} ${isSquare ? "h-28 w-28" : "h-28 w-full"}`}
      >
        {value ? (
          <div className="relative w-full h-full group">
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[11px] text-white font-bold">Change</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 p-2">
            <Upload size={18} className="mx-auto mb-1" />
            <span className="text-[11px] font-bold block">Upload Image</span>
            <span className="text-[10px]">JPG, PNG, WEBP</span>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {error && <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1"><AlertTriangle size={10} />{error}</span>}
    </div>
  );
}

function StepProgress({ steps, currentStep, color }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${done ? "border-transparent" : active ? "border-white text-white bg-white/20" : "border-white/30 text-white/50"}`}
                style={done ? { backgroundColor: "rgba(255,255,255,0.9)", color } : {}}
              >
                {done ? <Check size={12} style={{ color }} /> : <span>{idx + 1}</span>}
              </div>
              <span className={`text-[9px] font-bold mt-0.5 hidden sm:block whitespace-nowrap ${active ? "text-white" : done ? "text-white/80" : "text-white/40"}`}>{step}</span>
            </div>
            {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 transition-all ${done ? "bg-white/80" : "bg-white/20"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SectionTitle({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, color }}>
        <Icon size={14} />
      </div>
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">{label}</h3>
    </div>
  );
}

function NodeInfoBadge({ config }) {
  return (
    <div className="rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: `${config.color}30`, background: config.lightBg }}>
      <span className="text-2xl">{config.emoji}</span>
      <div>
        <p className="text-xs font-black" style={{ color: config.color }}>{config.label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{config.subtitle}</p>
      </div>
    </div>
  );
}

export default function StoreCreationWizard({ nodeType, onClose, onSuccess }) {
  const { setActiveNode } = useNodeStore();
  const config = NODE_CONFIG[nodeType] || NODE_CONFIG.LOCAL_RETAIL;

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const bodyRef = useRef(null);

  const [form, setForm] = useState({
    storeName: "", storeDescription: "", address: "", city: "", state: "", pincode: "",
    ownerFullName: "", ownerEmail: "", ownerPhone: "", aadhaarNumber: "", panNumber: "",
    gstNumber: "", bankAccountNumber: "", confirmBankAccountNumber: "", ifscCode: "", bankName: "",
    aadhaarFront: "", aadhaarBack: "", panCard: "", gstCertificate: "",
    cancelledCheque: "", bankStatement: "", storePhoto: "", storeBanner: ""
  });
  const [errors, setErrors] = useState({});
  const [fileObjects, setFileObjects] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(`indiafy_kyc_draft_${nodeType}`);
    if (saved) { try { setForm(JSON.parse(saved)); toast.success("Draft restored!"); } catch { } }
  }, [nodeType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (["panNumber", "gstNumber", "ifscCode"].includes(name)) val = value.toUpperCase();
    setForm(prev => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const updateFileField = (field, previewUrl, rawFile) => {
    setForm(prev => ({ ...prev, [field]: previewUrl }));
    if (rawFile) setFileObjects(prev => ({ ...prev, [field]: rawFile }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleSaveDraft = () => {
    const textDraft = {
      storeName: form.storeName, storeDescription: form.storeDescription, address: form.address,
      city: form.city, state: form.state, pincode: form.pincode, ownerFullName: form.ownerFullName,
      ownerEmail: form.ownerEmail, ownerPhone: form.ownerPhone, aadhaarNumber: form.aadhaarNumber,
      panNumber: form.panNumber, gstNumber: form.gstNumber, bankAccountNumber: form.bankAccountNumber,
      confirmBankAccountNumber: form.confirmBankAccountNumber, ifscCode: form.ifscCode, bankName: form.bankName
    };
    try { localStorage.setItem(`indiafy_kyc_draft_${nodeType}`, JSON.stringify(textDraft)); toast.success("Draft saved!"); } catch { }
  };

  const validateStep = (step) => {
    const e = {};
    if (step === 0) {
      if (!form.storeName.trim()) e.storeName = "Store name is required";
      if (!form.storeDescription.trim()) e.storeDescription = "Description is required";
      if (!form.address.trim()) e.address = "Address is required";
      if (!form.city.trim()) e.city = "City is required";
      if (!form.state.trim()) e.state = "State is required";
      if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Valid 6-digit pincode required";
    }
    if (step === 1) {
      if (!form.ownerFullName.trim()) e.ownerFullName = "Full name is required";
      if (!form.ownerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) e.ownerEmail = "Valid email required";
      if (!form.ownerPhone.trim() || !/^\d{10}$/.test(form.ownerPhone.trim())) e.ownerPhone = "10-digit mobile number required";
      if (!form.aadhaarNumber.trim() || form.aadhaarNumber.replace(/\s/g, "").length !== 12) e.aadhaarNumber = "Valid 12-digit Aadhaar required";
      if (!form.panNumber.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.trim())) e.panNumber = "Valid PAN required (e.g. ABCDE1234F)";
    }
    if (step === 2) {
      if (!form.gstNumber.trim() || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.trim())) e.gstNumber = "Valid 15-char GSTIN required";
      if (!form.bankName.trim()) e.bankName = "Bank name is required";
      if (!form.bankAccountNumber.trim()) e.bankAccountNumber = "Account number is required";
      if (form.bankAccountNumber !== form.confirmBankAccountNumber) e.confirmBankAccountNumber = "Account numbers don't match";
      if (!form.ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim())) e.ifscCode = "Valid IFSC required (e.g. SBIN0001234)";
    }
    if (step === 3) {
      if (!form.aadhaarFront) e.aadhaarFront = "Aadhaar front scan required";
      if (!form.aadhaarBack) e.aadhaarBack = "Aadhaar back scan required";
      if (!form.panCard) e.panCard = "PAN card scan required";
      if (!form.gstCertificate) e.gstCertificate = "GST certificate required";
      if (!form.cancelledCheque) e.cancelledCheque = "Cancelled cheque required";
      if (!form.bankStatement) e.bankStatement = "Bank statement required";
      if (!form.storePhoto) e.storePhoto = "Store photo required";
      if (!form.storeBanner) e.storeBanner = "Store banner required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) { toast.error("Please fill all required fields."); return; }
    setCurrentStep(s => s + 1);
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (currentStep === 0) { onClose(); return; }
    setCurrentStep(s => s - 1);
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) { toast.error("Please upload all required documents."); return; }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setUploadProgress(10);
    toast.dismiss();
    const loadingToastId = toast.loading("Submitting application...");
    try {
      await new Promise(r => setTimeout(r, 400));
      setUploadProgress(35);
      const formData = new FormData();
      formData.append("nodeType", nodeType);
      formData.append("storeName", form.storeName.trim());
      formData.append("storeDescription", form.storeDescription.trim());
      formData.append("address", form.address.trim());
      formData.append("city", form.city.trim());
      formData.append("state", form.state.trim());
      formData.append("pincode", form.pincode.trim());
      formData.append("latitude", "0");
      formData.append("longitude", "0");
      formData.append("ownerFullName", form.ownerFullName.trim());
      formData.append("ownerEmail", form.ownerEmail.trim());
      formData.append("ownerPhone", form.ownerPhone.trim());
      formData.append("aadhaarNumber", form.aadhaarNumber.replace(/\s/g, ""));
      formData.append("panNumber", form.panNumber.trim().toUpperCase());
      formData.append("gstNumber", form.gstNumber.trim().toUpperCase());
      formData.append("foodLicenseNumber", "");
      formData.append("businessType", "Proprietorship");
      formData.append("bankAccountNumber", form.bankAccountNumber.trim());
      formData.append("ifscCode", form.ifscCode.trim().toUpperCase());
      formData.append("bankName", form.bankName.trim());
      Object.keys(fileObjects).forEach((field) => { if (fileObjects[field]) formData.append(field, fileObjects[field]); });
      const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");
      ["aadhaarFront", "aadhaarBack", "panCard", "gstCertificate", "cancelledCheque", "bankStatement", "storePhoto", "storeBanner"].forEach(f => {
        if (!fileObjects[f] && form[f] && !isBlobUrl(form[f])) formData.append(f, form[f]);
      });
      setUploadProgress(65);
      const response = await axiosInstance.post("/seller/store/submit", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUploadProgress(90);
      toast.dismiss(loadingToastId);
      if (!response?.success) { toast.error(response?.message || "Submission failed"); return; }
      setUploadProgress(100);
      localStorage.removeItem(`indiafy_kyc_draft_${nodeType}`);
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (_error) {
      console.error(_error);
      toast.dismiss(loadingToastId);
      toast.error(_error?.response?.data?.message || _error?.message || "Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) return (
      <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <SectionTitle icon={Store} label="Store Information" color={config.color} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Store / Shop Name" name="storeName" value={form.storeName} onChange={handleInputChange}
              placeholder={`e.g. ${config.label.split(" ")[0]} Mart`} error={errors.storeName} />
            <FormInput label="City" name="city" value={form.city} onChange={handleInputChange}
              placeholder="e.g. New Delhi" error={errors.city} />
          </div>
          <FormTextarea label="Store Description" name="storeDescription" value={form.storeDescription} onChange={handleInputChange}
            rows={2} placeholder={`Briefly describe what your store offers...`} error={errors.storeDescription} />
          <FormTextarea label="Full Shop Address" name="address" value={form.address} onChange={handleInputChange}
            rows={2} placeholder="Building no., Street name, Locality / Area" error={errors.address} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="State" name="state" value={form.state} onChange={handleInputChange}
              placeholder="e.g. Delhi" error={errors.state} />
            <FormInput label="Pincode" name="pincode" value={form.pincode} onChange={handleInputChange}
              placeholder="110001" maxLength={6} error={errors.pincode} />
          </div>
        </div>
        <NodeInfoBadge config={config} />
      </motion.div>
    );

    if (currentStep === 1) return (
      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <SectionTitle icon={User} label="Owner Information" color={config.color} />
          <FormInput label="Owner Full Name" name="ownerFullName" value={form.ownerFullName} onChange={handleInputChange}
            placeholder="e.g. Rajesh Kumar Sharma" error={errors.ownerFullName} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Email Address" name="ownerEmail" type="email" value={form.ownerEmail} onChange={handleInputChange}
              placeholder="owner@example.com" error={errors.ownerEmail} />
            <FormInput label="Mobile Number" name="ownerPhone" type="tel" value={form.ownerPhone} onChange={handleInputChange}
              placeholder="10-digit e.g. 9876543210" maxLength={10} error={errors.ownerPhone} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <SectionTitle icon={Shield} label="KYC Details" color={config.color} />
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <span className="text-base shrink-0">🔒</span>
            <p className="text-xs text-slate-600 font-medium">Your KYC data is encrypted end-to-end. Only accessed for identity verification.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Aadhaar Number" name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleInputChange}
              placeholder="12-digit Aadhaar" maxLength={14} hint="Exactly 12 digits" error={errors.aadhaarNumber} />
            <FormInput label="PAN Card Number" name="panNumber" value={form.panNumber} onChange={handleInputChange}
              placeholder="e.g. ABCDE1234F" maxLength={10} hint="10-character alphanumeric" error={errors.panNumber} />
          </div>
        </div>
      </motion.div>
    );

    if (currentStep === 2) return (
      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <SectionTitle icon={Building} label="Business Details" color={config.color} />
          <FormInput label="GSTIN Number" name="gstNumber" value={form.gstNumber} onChange={handleInputChange}
            placeholder="e.g. 22AAAAA0000A1Z5" maxLength={15} hint="15-character GST Identification Number" error={errors.gstNumber} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <SectionTitle icon={CreditCard} label="Bank Account Details" color={config.color} />
          <FormInput label="Bank Name" name="bankName" value={form.bankName} onChange={handleInputChange}
            placeholder="e.g. State Bank of India" error={errors.bankName} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Account Number" name="bankAccountNumber" type="password" value={form.bankAccountNumber} onChange={handleInputChange}
              placeholder="Enter account number" error={errors.bankAccountNumber} />
            <FormInput label="Confirm Account Number" name="confirmBankAccountNumber" value={form.confirmBankAccountNumber} onChange={handleInputChange}
              placeholder="Re-enter account number" error={errors.confirmBankAccountNumber} />
          </div>
          <FormInput label="IFSC Code" name="ifscCode" value={form.ifscCode} onChange={handleInputChange}
            placeholder="e.g. SBIN0001234" maxLength={11} hint="11-character code on your passbook" error={errors.ifscCode} />
        </div>
      </motion.div>
    );

    if (currentStep === 3) return (
      <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <SectionTitle icon={FileText} label="Identity Documents" color={config.color} />
          <p className="text-xs text-slate-500 font-medium">Upload clear, readable scans. PDF, JPG, PNG or WEBP accepted. Max 10MB each.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DocumentUploader label="Aadhaar Card — Front" value={form.aadhaarFront} onChange={(u, f) => updateFileField("aadhaarFront", u, f)} onPreview={setPreviewFile} error={errors.aadhaarFront} id="uploader-aadhaarFront" />
            <DocumentUploader label="Aadhaar Card — Back" value={form.aadhaarBack} onChange={(u, f) => updateFileField("aadhaarBack", u, f)} onPreview={setPreviewFile} error={errors.aadhaarBack} id="uploader-aadhaarBack" />
            <DocumentUploader label="PAN Card" value={form.panCard} onChange={(u, f) => updateFileField("panCard", u, f)} onPreview={setPreviewFile} error={errors.panCard} id="uploader-panCard" />
            <DocumentUploader label="GST Certificate" value={form.gstCertificate} onChange={(u, f) => updateFileField("gstCertificate", u, f)} onPreview={setPreviewFile} error={errors.gstCertificate} id="uploader-gstCertificate" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <SectionTitle icon={CreditCard} label="Bank Documents" color={config.color} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DocumentUploader label="Cancelled Cheque" value={form.cancelledCheque} onChange={(u, f) => updateFileField("cancelledCheque", u, f)} onPreview={setPreviewFile} error={errors.cancelledCheque} id="uploader-cancelledCheque" />
            <DocumentUploader label="Bank Statement (3 months)" value={form.bankStatement} onChange={(u, f) => updateFileField("bankStatement", u, f)} onPreview={setPreviewFile} error={errors.bankStatement} id="uploader-bankStatement" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <SectionTitle icon={Store} label="Store Images" color={config.color} />
          <p className="text-xs text-slate-500 font-medium">Upload your store front photo and a banner for your online store profile.</p>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <ImageUploader label="Store Front Photo" value={form.storePhoto} onChange={(u, f) => updateFileField("storePhoto", u, f)} aspect="square" error={errors.storePhoto} id="uploader-storePhoto" />
            <ImageUploader label="Store Banner Image" value={form.storeBanner} onChange={(u, f) => updateFileField("storeBanner", u, f)} aspect="banner" error={errors.storeBanner} id="uploader-storeBanner" />
          </div>
        </div>
      </motion.div>
    );
    return null;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      {previewFile && <PreviewModal fileUrl={previewFile} onClose={() => setPreviewFile(null)} />}

      <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: "95dvh" }}>

        {/* HEADER */}
        <div className={`bg-gradient-to-br ${config.gradient} px-5 pt-5 pb-4 shrink-0`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{config.emoji}</span>
                <span className="text-white font-black text-base leading-tight">{config.label}</span>
              </div>
              <p className="text-white/75 text-xs font-medium">{config.subtitle}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition text-white shrink-0">
              <X size={16} />
            </button>
          </div>
          {!isSubmitted && (
            <>
              <StepProgress steps={config.steps} currentStep={currentStep} color={config.color} />
              {isSubmitting && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-white/80">
                    <span>Uploading encrypted records...</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* BODY */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {!isSubmitted ? renderStepContent() : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-8 gap-5">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
                  style={{ background: config.lightBg, color: config.color }}>
                  <CheckCircle2 size={44} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Application Submitted!</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Your <strong>{config.label}</strong> application is now under admin review. You will be notified once it is approved.
                  </p>
                </div>
                <div className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Status</span>
                    <span className="flex items-center gap-1.5 text-amber-600 font-bold text-sm"><Clock size={14} /> Pending Review</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Review Time</span>
                    <span className="text-slate-700 font-bold text-sm">24–48 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Node Type</span>
                    <span className="font-bold text-sm" style={{ color: config.color }}>{config.emoji} {config.label}</span>
                  </div>
                </div>
                <button onClick={() => { window.location.href = "/seller-hub"; }}
                  className="w-full py-3.5 rounded-xl font-black text-white text-sm shadow-lg hover:opacity-90 transition active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}>
                  Go to Seller Hub
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        {!isSubmitted && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-5 flex items-center justify-between gap-3 shrink-0">
            <button onClick={goBack} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">
              <ArrowLeft size={14} /> {currentStep === 0 ? "Cancel" : "Back"}
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleSaveDraft}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition hidden sm:block">
                Save Draft
              </button>
              {currentStep < config.steps.length - 1 ? (
                <button onClick={goNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow transition hover:opacity-90 active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}>
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow transition hover:opacity-90 active:scale-95 disabled:opacity-70"
                  style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}>
                  {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Zap size={14} /> Submit Application</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
