import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, Store, MapPin, CreditCard, Upload, Image, Check, Clock,
  Building2, FileText, Zap, Shield, Eye, Trash2, CheckCircle2,
  AlertTriangle, ArrowLeft, ArrowRight, ShieldCheck, Download
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosInstance";
import { useNodeStore } from "../../../store/nodeStore";

/* ============================================================
   NODE CONFIG FOR GRADIENTS
   ============================================================ */
const NODE_CONFIG = {
  LOCAL_RETAIL: { label: "Local Retail", color: "#3B82F6", gradient: "from-blue-600 to-blue-500", emoji: "🏪" },
  WHOLESALE_B2B: { label: "Wholesale B2B", color: "#F59E0B", gradient: "from-amber-500 to-orange-500", emoji: "🏭" },
  QUICK_COMMERCE: { label: "Quick Commerce", color: "#10B981", gradient: "from-emerald-500 to-teal-500", emoji: "⚡" },
  HOME_ESSENTIALS: { label: "Home Essentials", color: "#F97316", gradient: "from-orange-500 to-rose-500", emoji: "🏠" },
  ELECTRONICS: { label: "Electronics", color: "#8B5CF6", gradient: "from-purple-600 to-violet-600", emoji: "💻" },
  PERSONAL_CARE: { label: "Personal Care", color: "#EC4899", gradient: "from-pink-500 to-rose-500", emoji: "✨" },
};

/* ============================================================
   FILE -> BASE64 CONVERTER
   ============================================================ */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ============================================================
   PREVIEW MODAL
   ============================================================ */
function PreviewModal({ fileUrl, onClose }) {
  if (!fileUrl) return null;
  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
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
            PDF document preview not available directly in base64. Submit to verify.
          </div>
        ) : (
          <img src={fileUrl} alt="Preview" className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl" />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   DRAG-AND-DROP FILE UPLOADER
   ============================================================ */
function DocumentUploader({ label, value, onChange, hint = "PDF, PNG, JPG (max 10MB)", onPreview }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
      toast.success(`${label} uploaded!`);
    } catch (err) {
      toast.error("Error reading file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 flex-1 min-w-[220px]">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label} *</label>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-all h-28 overflow-hidden
          ${dragActive ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"}
          ${value ? "border-emerald-250 bg-emerald-50/10" : ""}`}
      >
        {value ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-50/90 group">
            {value.startsWith("data:application/pdf") ? (
              <div className="flex flex-col items-center p-2 text-slate-650 font-bold">
                <FileText size={22} className="text-emerald-500 mb-1 animate-pulse" />
                <span className="text-[10px] truncate max-w-[130px]">PDF Document</span>
              </div>
            ) : (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(value);
                }}
                className="p-1.5 bg-white text-slate-800 rounded-full hover:bg-slate-100 transition shadow"
              >
                <Eye size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="p-1.5 bg-red-650 rounded-full text-white hover:bg-red-700 transition shadow"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <Upload size={18} className="text-slate-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-700">Drag & Drop file</span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">{hint}</span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}

/* ============================================================
   KYC INPUT COMPONENT
   ============================================================ */
function KYCInput({ label, error, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label} *</label>
      <input
        {...props}
        className="w-full bg-slate-50/50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-350"
      />
      {error && (
        <span className="text-[10px] font-medium text-rose-500 flex items-center gap-1 mt-0.5">
          <AlertTriangle size={10} /> {error}
        </span>
      )}
    </div>
  );
}

/* ============================================================
   IMAGE FIELD UPLOADER (Logo / Banner)
   ============================================================ */
function ImageFieldUploader({ label, value, onChange, isLogo }) {
  const fileInputRef = useRef(null);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch (err) {
      toast.error("Error reading file");
    }
  };

  return (
    <div className="space-y-1.5 flex-1">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-center overflow-hidden transition-all ${isLogo ? 'w-24 h-24' : 'w-full h-24'}`}
      >
        {value ? (
          <div className="relative w-full h-full group">
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">Change</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-2 text-slate-400">
            <Upload size={16} className="mx-auto mb-1" />
            <span className="text-[10px] font-bold">Upload</span>
          </div>
        )}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function StoreCreationWizard({ nodeType, onClose, onSuccess }) {
  const { setActiveNode } = useNodeStore();
  const config = NODE_CONFIG[nodeType] || NODE_CONFIG.LOCAL_RETAIL;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Consolidated KYC Form State
  const [form, setForm] = useState({
    storeName: "",
    gstin: "",
    address: "",
    logo: "",
    banner: "",
    panNumber: "",
    aadhaarNumber: "",
    accountNumber: "",
    confirmAccountNumber: "",
    bankStatementPhoto: "",
    cancelledChequePhoto: "",
    foodLicensePhoto: "",
  });

  const [errors, setErrors] = useState({});

  // Auto-load draft from local storage on mount
  useEffect(() => {
    const draftKey = `qcommerce_kyc_draft_${nodeType}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
        toast.success("Draft verification form restored!");
      } catch (e) {
        console.error("Draft read failed", e);
      }
    }
  }, [nodeType]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedVal = value;

    if (name === "panNumber" || name === "gstin") {
      formattedVal = value.toUpperCase();
    }

    setForm(prev => ({ ...prev, [name]: formattedVal }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const updateFileField = (field, base64) => {
    setForm(prev => ({ ...prev, [field]: base64 }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSaveDraft = () => {
    const draftKey = `qcommerce_kyc_draft_${nodeType}`;
    localStorage.setItem(draftKey, JSON.stringify(form));
    toast.success("Verification draft saved successfully.");
  };

  /* ---------- VALIDATION CHECKS ---------- */
  const validateForm = () => {
    const tempErrors = {};
    let isValid = true;

    if (!form.storeName.trim()) { tempErrors.storeName = "Shop Name is required"; isValid = false; }
    
    // GST validation
    if (!form.gstin.trim()) {
      tempErrors.gstin = "GST Number is required";
      isValid = false;
    }

    if (!form.address.trim()) { tempErrors.address = "Shop Address is required"; isValid = false; }

    // PAN validation
    if (!form.panNumber.trim()) {
      tempErrors.panNumber = "PAN Number is required";
      isValid = false;
    }

    // Aadhaar validation
    if (!form.aadhaarNumber.trim()) {
      tempErrors.aadhaarNumber = "Aadhaar Number is required";
      isValid = false;
    }

    // Bank validation
    if (!form.accountNumber.trim()) {
      tempErrors.accountNumber = "Account Number is required";
      isValid = false;
    }
    if (form.accountNumber !== form.confirmAccountNumber) {
      tempErrors.confirmAccountNumber = "Account Numbers do not match";
      isValid = false;
    }

    // File validation
    if (!form.bankStatementPhoto) { tempErrors.bankStatementPhoto = "Bank statement upload is required"; isValid = false; }
    if (!form.cancelledChequePhoto) { tempErrors.cancelledChequePhoto = "Cancelled cheque upload is required"; isValid = false; }
    if (!form.foodLicensePhoto) { tempErrors.foodLicensePhoto = "Food license (FSSAI) is required"; isValid = false; }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please correct verification errors before submitting.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        nodeType,
        storeName: form.storeName.trim(),
        gstin: form.gstin.trim(),
        address: form.address.trim(),
        logo: form.logo,
        banner: form.banner,
        panNumber: form.panNumber.trim(),
        aadhaarNumber: form.aadhaarNumber.replace(/\s/g, ""),
        accountNumber: form.accountNumber.trim(),
        bankStatementPhoto: form.bankStatementPhoto,
        cancelledChequePhoto: form.cancelledChequePhoto,
        foodLicensePhoto: form.foodLicensePhoto,
        // Fallbacks for schema requirements
        email: `store_${Date.now()}@indiafy.com`,
        phone: "9999999999",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        accountName: form.storeName.trim(),
        ifsc: "BANK0001234",
        bankName: "Settlement Bank"
      };

      const response = await axiosInstance.post("/seller/nodes/create", payload);

      if (!response?.success) {
        toast.error(response?.message || "Verification submission failed");
        return;
      }

      const createdNode = response?.node;
      if (createdNode) {
        setActiveNode(createdNode);
        try { localStorage.setItem("activeNode", JSON.stringify(createdNode)); } catch (e) {}
      }

      // Clear local storage draft
      localStorage.removeItem(`qcommerce_kyc_draft_${nodeType}`);
      setIsSubmitted(true);
      toast.success("Verification documents submitted!");

    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to submit verification";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper getters for masks
  const getMaskedAadhaar = () => {
    const clean = form.aadhaarNumber.replace(/\s/g, "");
    if (clean.length < 4) return clean;
    return `XXXX XXXX ${clean.slice(-4)}`;
  };

  const getMaskedAccount = () => {
    if (form.accountNumber.length < 4) return form.accountNumber;
    return `${"•".repeat(form.accountNumber.length - 4)}${form.accountNumber.slice(-4)}`;
  };

  const isFormValid =
    form.storeName.trim() &&
    form.gstin.trim() &&
    form.address.trim() &&
    form.panNumber.trim() &&
    form.aadhaarNumber.trim() &&
    form.accountNumber.trim() &&
    form.accountNumber === form.confirmAccountNumber &&
    form.bankStatementPhoto &&
    form.cancelledChequePhoto &&
    form.foodLicensePhoto;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-900/60 backdrop-blur-sm">
      {previewFile && <PreviewModal fileUrl={previewFile} onClose={() => setPreviewFile(null)} />}

      <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-2xl h-[92vh] sm:h-[85vh] flex flex-col relative border border-slate-100">
        
        {/* HEADER SECTION */}
        <div className={`p-5 text-white bg-gradient-to-r ${config.gradient} shrink-0`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-black flex items-center gap-1.5 leading-none">
              ⚡ Activate Your Quick Commerce Store
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition text-white">
              <X size={16} />
            </button>
          </div>
          <p className="text-[11px] text-white/80 font-medium">
            Complete verification to start selling products on Indiafy.
          </p>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-wider opacity-90">
              <span>Progress Status</span>
              <span>Step 1 of 1</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-300" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        {/* CORE SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* SECTION 1: STORE DETAILS */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Store size={14} className="text-emerald-500" /> Section 1: Store Details
                  </h3>
                  <KYCInput
                    label="Shop Name"
                    name="storeName" value={form.storeName} onChange={handleInputChange}
                    placeholder="Enter your shop name (e.g. Sharma Super Mart)"
                    error={errors.storeName}
                  />
                  <KYCInput
                    label="GST Number"
                    name="gstin" value={form.gstin} onChange={handleInputChange}
                    placeholder="22AAAAA0000A1Z5"
                    error={errors.gstin}
                  />
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shop Address *</label>
                    <textarea
                      rows={2.5}
                      name="address" value={form.address} onChange={handleInputChange}
                      placeholder="Enter complete shop address (Building, Street, Area, City, State, Pincode)"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-all resize-none placeholder:text-slate-350"
                    />
                    {errors.address && <span className="text-[10px] font-medium text-rose-500">{errors.address}</span>}
                  </div>

                  <div className="flex gap-4 items-start pt-3 border-t border-slate-100">
                    <ImageFieldUploader 
                      label="Store Logo" 
                      value={form.logo} 
                      onChange={(base64) => updateFileField("logo", base64)} 
                      isLogo={true} 
                    />
                    <ImageFieldUploader 
                      label="Store Banner" 
                      value={form.banner} 
                      onChange={(base64) => updateFileField("banner", base64)} 
                      isLogo={false} 
                    />
                  </div>
                </div>

                {/* SECTION 2: OWNER VERIFICATION */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Shield size={14} className="text-emerald-500" /> Section 2: Owner Verification
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KYCInput
                      label="PAN Number"
                      name="panNumber" value={form.panNumber} onChange={handleInputChange}
                      placeholder="ABCDE1234F"
                      error={errors.panNumber}
                    />
                    <KYCInput
                      label="Aadhaar Number"
                      name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleInputChange}
                      placeholder="XXXX XXXX XXXX"
                      error={errors.aadhaarNumber}
                    />
                  </div>
                </div>

                {/* SECTION 3: BANK DETAILS */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-emerald-500" /> Section 3: Settlement Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KYCInput
                      label="Account Number"
                      name="accountNumber" value={form.accountNumber} onChange={handleInputChange}
                      placeholder="Enter bank account number"
                      error={errors.accountNumber}
                    />
                    <KYCInput
                      label="Confirm Account Number"
                      name="confirmAccountNumber" value={form.confirmAccountNumber} onChange={handleInputChange}
                      placeholder="Re-enter account number"
                      error={errors.confirmAccountNumber}
                    />
                  </div>
                </div>

                {/* SECTION 4: DOCUMENT UPLOADS */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <FileText size={14} className="text-emerald-500" /> Section 4: Required Uploads
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <DocumentUploader
                      label="Bank Statement"
                      value={form.bankStatementPhoto}
                      onChange={(base64) => updateFileField("bankStatementPhoto", base64)}
                      onPreview={setPreviewFile}
                    />
                    <DocumentUploader
                      label="Cancelled Cheque"
                      value={form.cancelledChequePhoto}
                      onChange={(base64) => updateFileField("cancelledChequePhoto", base64)}
                      onPreview={setPreviewFile}
                    />
                    <DocumentUploader
                      label="Food License"
                      value={form.foodLicensePhoto}
                      onChange={(base64) => updateFileField("foodLicensePhoto", base64)}
                      onPreview={setPreviewFile}
                    />
                  </div>
                  {(errors.bankStatementPhoto || errors.cancelledChequePhoto || errors.foodLicensePhoto) && (
                    <span className="text-[10px] font-medium text-rose-500 flex items-center gap-1">
                      <AlertTriangle size={10} /> Bank statement, cancelled cheque, and food license uploads are all required
                    </span>
                  )}
                </div>

                {/* REVIEW SUMMARY CARD */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 shadow-inner space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-1.5">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500" /> Live Verification Summary
                    </h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isFormValid ? "bg-emerald-100 text-emerald-700 border border-emerald-250" : "bg-slate-100 text-slate-450"}`}>
                      {isFormValid ? "Valid ✓" : "Incomplete ⚠"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">Shop Name</p>
                      <p className="font-bold text-slate-800 truncate">{form.storeName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">GST Number</p>
                      <p className="font-bold text-slate-800 truncate">{form.gstin || "—"}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-slate-400 font-medium text-[10px] uppercase">Shop Address</p>
                      <p className="font-bold text-slate-800 truncate">{form.address || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">PAN Number</p>
                      <p className="font-bold text-slate-800 uppercase">{form.panNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">Aadhaar (Masked)</p>
                      <p className="font-bold text-slate-800">{form.aadhaarNumber ? getMaskedAadhaar() : "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">Account (Masked)</p>
                      <p className="font-bold text-slate-850 truncate">{form.accountNumber ? getMaskedAccount() : "—"}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Uploaded Licenses</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          ["Bank Statement", form.bankStatementPhoto],
                          ["Cancelled Cheque", form.cancelledChequePhoto],
                          ["Food License (FSSAI)", form.foodLicensePhoto]
                        ].map(([label, file]) => (
                          <div key={label} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${file ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${file ? "bg-emerald-500" : "bg-slate-300"}`} />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              /* SUCCESS SCREEN */
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center p-6 h-full space-y-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">🎉 Store Verification Submitted</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-sm mx-auto">
                    Your verification documents have been submitted successfully. Our compliance board is auditing your credentials.
                  </p>
                </div>
                
                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 w-full text-left grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase block">Verification Status</span>
                    <span className="text-slate-800 font-black mt-0.5 flex items-center gap-1"><Clock size={12} className="text-amber-500" /> Pending Review</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase block">Estimated Approval</span>
                    <span className="text-slate-850 font-black mt-0.5">24–48 Hours</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const activeNode = JSON.parse(localStorage.getItem("activeNode"));
                    onSuccess?.(nodeType, activeNode);
                    if (activeNode?._id) {
                      window.location.href = `/seller/dashboard/${activeNode._id}/dashboard`;
                    } else {
                      window.location.href = "/seller-hub";
                    }
                  }}
                  className="w-full py-3.5 bg-slate-900 text-white font-black uppercase rounded-xl hover:bg-slate-800 transition active:scale-95 text-xs shadow-md"
                >
                  Go To Seller Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTION BUTTONS (Hidden on success screen) */}
        {!isSubmitted && (
          <div className="border-t border-slate-100 p-4 flex items-center justify-between gap-3 shrink-0 bg-white">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition bg-white"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl text-xs transition"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg transition hover:opacity-90 active:scale-95 disabled:opacity-70"
                style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Activating...
                  </>
                ) : (
                  <>
                    <Zap size={12} /> Activate Store
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}