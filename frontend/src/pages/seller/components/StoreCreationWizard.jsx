/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden p-3 flex flex-col items-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Eye size={16} className="text-emerald-500" /> Document Preview
          </span>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full transition-colors font-bold"
          >
            <X size={18} />
          </button>
        </div>
        {fileUrl.startsWith("data:application/pdf") || fileUrl.endsWith(".pdf") ? (
          <iframe title="PDF Document Preview" src={fileUrl} className="w-full h-[75vh] rounded-2xl bg-slate-50 border border-slate-200" />
        ) : (
          <img src={fileUrl} alt="Preview" className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl bg-slate-50" />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   DRAG-AND-DROP FILE UPLOADER WITH VALIDATIONS & BASE64 PREVIEW
   ============================================================ */
function DocumentUploader({ label, value, onChange, hint = "PDF, PNG, JPG (max 10MB)", onPreview, error, id }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;

    // 1. File size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${label}: File exceeds 10MB limit`);
      return;
    }

    // 2. MIME type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`${label}: Only JPG, PNG, WEBP, and PDF documents are allowed.`);
      return;
    }

    setIsReading(true);
    const toastId = toast.loading(`Scanning & processing ${file.name}...`);
    
    try {
      const base64Url = await fileToBase64(file);
      toast.dismiss(toastId);
      onChange(base64Url, file);
      toast.success(`${label} loaded & verified!`);
    } catch (_err) {
      toast.dismiss(toastId);
      toast.error("Error reading file");
    } finally {
      setIsReading(false);
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
    <div id={id} className="space-y-1.5 flex-1 min-w-[220px]">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label} *</label>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (isReading) return;
          if (value && onPreview) {
            onPreview(value);
          } else if (!value) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all h-32 overflow-hidden
          ${value ? "cursor-default border-emerald-300 bg-emerald-50/10" : "cursor-pointer border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 p-4"}
          ${dragActive ? "border-emerald-500 bg-emerald-50/50" : ""}
          ${error ? "border-red-400 bg-red-50/10" : ""}`}
      >
        {isReading ? (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin text-brand-accent mb-1" size={20} />
            <span className="text-[10px] font-bold">Scanning Document...</span>
          </div>
        ) : value ? (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-100 group select-none">
            {value.startsWith("data:application/pdf") || value.endsWith(".pdf") ? (
              <div 
                onClick={() => onPreview && onPreview(value)}
                className="flex flex-col items-center justify-center p-2 text-slate-700 font-bold cursor-pointer w-full h-full hover:bg-slate-200/50 transition pb-10"
              >
                <FileText size={28} className="text-emerald-600 mb-1" />
                <span className="text-[11px] truncate max-w-[170px] text-slate-800">PDF Document Uploaded</span>
                <span className="text-[9px] text-emerald-600 font-bold">Tap to Preview</span>
              </div>
            ) : (
              <div 
                onClick={() => onPreview && onPreview(value)}
                className="w-full h-full relative cursor-pointer overflow-hidden pb-8 bg-slate-200/50 flex items-center justify-center"
              >
                <img src={value} alt={label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            {/* Always visible, tap-safe bottom control bar */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 flex items-center justify-between gap-1 z-20 border-t border-slate-800"
            >
              <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> Ready
              </span>
              <div className="flex items-center gap-1.5">
                {onPreview && (
                  <button
                    type="button"
                    onClick={() => onPreview(value)}
                    title="View Full Preview"
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 active:scale-95"
                  >
                    <Eye size={11} /> View
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change Document"
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition shadow flex items-center gap-1 active:scale-95"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  title="Remove Document"
                  className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition shadow flex items-center justify-center active:scale-95"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Upload size={20} className="text-slate-400 mb-1" />
            <span className="text-[11px] font-black text-slate-700">Drag & Drop file</span>
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
      {error && <span className="text-[10px] text-red-500 font-bold block mt-0.5">{error}</span>}
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
        className={`w-full bg-slate-50/50 border focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-350
          ${error ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-slate-400"}`}
      />
      {error && (
        <span className="text-[10px] font-medium text-rose-500 flex items-center gap-1 mt-0.5 animate-pulse">
          <AlertTriangle size={10} /> {error}
        </span>
      )}
    </div>
  );
}

/* ============================================================
   IMAGE FIELD UPLOADER (Store Photo / Banner)
   ============================================================ */
function ImageFieldUploader({ label, value, onChange, isLogo, error, id, onPreview }) {
  const fileInputRef = useRef(null);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${label}: File exceeds 10MB limit`);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`${label}: Only JPG, PNG, and WEBP image uploads are allowed.`);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onChange(base64, file);
    } catch (_err) {
      toast.error("Error reading file");
    }
  };

  return (
    <div id={id} className="space-y-1.5 flex-1 min-w-[140px]">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label} *</label>
      <div 
        onClick={() => {
          if (value && onPreview) {
            onPreview(value);
          } else if (!value) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all h-28 
          ${value ? "cursor-default border-emerald-300 bg-emerald-50/10" : "cursor-pointer border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"}
          ${error ? "border-red-400" : ""}
          ${isLogo ? 'w-28' : 'w-full'}`}
      >
        {value ? (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-100 group select-none">
            <div 
              onClick={() => onPreview && onPreview(value)}
              className="w-full h-full relative cursor-pointer overflow-hidden pb-7 bg-slate-200/50 flex items-center justify-center"
            >
              <img src={value} alt={label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            {/* Always visible bottom control bar */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 bg-slate-900/90 backdrop-blur-md px-2 py-1 flex items-center justify-between gap-1 z-20 border-t border-slate-800"
            >
              <span className="text-[9px] text-emerald-400 font-extrabold flex items-center gap-0.5 uppercase tracking-wider">
                <CheckCircle2 size={10} />
              </span>
              <div className="flex items-center gap-1">
                {onPreview && (
                  <button
                    type="button"
                    onClick={() => onPreview(value)}
                    title="View Preview"
                    className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold rounded transition flex items-center gap-0.5 active:scale-95"
                  >
                    <Eye size={10} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change Image"
                  className="px-1.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold rounded transition shadow flex items-center gap-0.5 active:scale-95"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange("", null)}
                  title="Remove Image"
                  className="p-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded transition shadow flex items-center justify-center active:scale-95"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-2 text-slate-400">
            <Upload size={16} className="mx-auto mb-1" />
            <span className="text-[10px] font-bold text-slate-700">Upload</span>
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
      {error && <p className="text-[10px] text-red-500 font-bold mt-0.5">{error}</p>}
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedNode, setSubmittedNode] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Consolidated Onboarding & KYC Form State
  const [form, setForm] = useState({
    storeName: "",
    storeDescription: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    ownerFullName: "",
    ownerEmail: "",
    ownerPhone: "",
    aadhaarNumber: "",
    panNumber: "",
    gstNumber: "",
    foodLicenseNumber: "",
    sellsPackagedFood: false,
    businessType: "Proprietorship",
    bankAccountNumber: "",
    confirmBankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    // Upload base64 buffers
    aadhaarFront: "",
    aadhaarBack: "",
    panCard: "",
    gstCertificate: "",
    foodLicense: "",
    cancelledCheque: "",
    bankStatement: "",
    storePhoto: "",
    storeBanner: ""
  });

  const [errors, setErrors] = useState({});

  // Restore draft form state
  useEffect(() => {
    const draftKey = `indiafy_kyc_draft_${nodeType}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
        toast.success("Draft verification form restored!");
      } catch (_e) {}
    }
  }, [nodeType]);

  // Auto-detect location on mount if not already present
  useEffect(() => {
    // Only attempt if we don't already have coordinates (e.g. from draft)
    if (!form.latitude && !form.longitude) {
      handleDetectLocation();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedVal = type === "checkbox" ? checked : value;

    if (name === "panNumber" || name === "gstNumber") {
      formattedVal = (value || "").toUpperCase();
    }

    setForm(prev => ({ ...prev, [name]: formattedVal }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const [fileObjects, setFileObjects] = useState({});

  const updateFileField = (field, previewUrl, rawFile) => {
    setForm(prev => ({ ...prev, [field]: previewUrl }));
    if (rawFile) {
      setFileObjects(prev => ({ ...prev, [field]: rawFile }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsDetectingLocation(true);
    const toastId = toast.loading("Detecting your current shop location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        toast.dismiss(toastId);
        toast.success("Shop location detected successfully!");
        setIsDetectingLocation(false);
      },
      (err) => {
        toast.dismiss(toastId);
        toast.error(`Could not detect location: ${err.message || "Permission denied"}`);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleSaveDraft = () => {
    const draftKey = `indiafy_kyc_draft_${nodeType}`;
    const textDraft = {
      storeName: form.storeName,
      storeDescription: form.storeDescription,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      latitude: form.latitude,
      longitude: form.longitude,
      ownerFullName: form.ownerFullName,
      ownerEmail: form.ownerEmail,
      ownerPhone: form.ownerPhone,
      aadhaarNumber: form.aadhaarNumber,
      panNumber: form.panNumber,
      gstNumber: form.gstNumber,
      foodLicenseNumber: form.foodLicenseNumber,
      businessType: form.businessType,
      bankAccountNumber: form.bankAccountNumber,
      ifscCode: form.ifscCode,
      bankName: form.bankName,
    };
    try {
      localStorage.setItem(draftKey, JSON.stringify(textDraft));
      toast.success("Verification form text draft saved.");
    } catch (_e) {
      console.warn("Draft save warning:", _e);
    }
  };

  /* ---------- FORM VALIDATIONS ---------- */
  const validateForm = () => {
    const tempErrors = {};
    const missing = [];
    let isValid = true;

    // Store Info
    if (!form.storeName || !form.storeName.trim()) { 
      tempErrors.storeName = "Store Name is required"; 
      missing.push("Store Name");
      isValid = false; 
    }
    if (!form.storeDescription || !form.storeDescription.trim()) { 
      tempErrors.storeDescription = "Store Description is required"; 
      missing.push("Store Description");
      isValid = false; 
    }
    if (!form.address || !form.address.trim()) { 
      tempErrors.address = "Shop Address is required"; 
      missing.push("Shop Address");
      isValid = false; 
    }
    if (!form.city || !form.city.trim()) { 
      tempErrors.city = "City is required"; 
      missing.push("City");
      isValid = false; 
    }
    if (!form.state || !form.state.trim()) { 
      tempErrors.state = "State is required"; 
      missing.push("State");
      isValid = false; 
    }
    if (!form.pincode || !form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) { 
      tempErrors.pincode = "Enter a valid 6-digit Pincode"; 
      missing.push("Pincode (6-digit)");
      isValid = false; 
    }
    if (form.latitude && form.latitude.toString().trim() !== "" && isNaN(form.latitude)) { 
      tempErrors.latitude = "Latitude must be a number"; 
      missing.push("Latitude (number)");
      isValid = false; 
    }
    if (form.longitude && form.longitude.toString().trim() !== "" && isNaN(form.longitude)) { 
      tempErrors.longitude = "Longitude must be a number"; 
      missing.push("Longitude (number)");
      isValid = false; 
    }

    // Owner Info
    if (!form.ownerFullName || !form.ownerFullName.trim()) { 
      tempErrors.ownerFullName = "Owner Name is required"; 
      missing.push("Owner Name");
      isValid = false; 
    }
    if (!form.ownerEmail || !form.ownerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) { 
      tempErrors.ownerEmail = "Enter a valid email address"; 
      missing.push("Owner Email");
      isValid = false; 
    }
    if (!form.ownerPhone || !form.ownerPhone.trim() || !/^\d{10}$/.test(form.ownerPhone.trim())) { 
      tempErrors.ownerPhone = "Enter a 10-digit mobile number"; 
      missing.push("Owner Phone (10-digit)");
      isValid = false; 
    }
    if (!form.aadhaarNumber || !form.aadhaarNumber.trim() || form.aadhaarNumber.replace(/\s/g, "").length !== 12) { 
      tempErrors.aadhaarNumber = "Aadhaar must be exactly 12 digits"; 
      missing.push("Aadhaar Number (12-digit)");
      isValid = false; 
    }
    if (!form.panNumber || !form.panNumber.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.trim().toUpperCase())) { 
      tempErrors.panNumber = "Enter a valid 10-character PAN number"; 
      missing.push("PAN Number (10-character)");
      isValid = false; 
    }

    // Business Info
    if (!form.gstNumber || !form.gstNumber.trim() || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.trim().toUpperCase())) { 
      tempErrors.gstNumber = "Enter a valid 15-character GSTIN"; 
      missing.push("GST Number (15-character)");
      isValid = false; 
    }
    if (!form.bankAccountNumber || !form.bankAccountNumber.trim()) { 
      tempErrors.bankAccountNumber = "Account number is required"; 
      missing.push("Bank Account Number");
      isValid = false; 
    }
    if (form.bankAccountNumber !== form.confirmBankAccountNumber) { 
      tempErrors.confirmBankAccountNumber = "Account numbers do not match"; 
      missing.push("Confirm Bank Account Number Match");
      isValid = false; 
    }
    if (!form.ifscCode || !form.ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim().toUpperCase())) { 
      tempErrors.ifscCode = "Enter a valid IFSC code (e.g. SBIN0001234)"; 
      missing.push("IFSC Code (valid)");
      isValid = false; 
    }
    if (!form.bankName || !form.bankName.trim()) { 
      tempErrors.bankName = "Bank name is required"; 
      missing.push("Bank Name");
      isValid = false; 
    }

    // Upload Files Check
    if (!form.aadhaarFront) { tempErrors.aadhaarFront = "Aadhaar Front scan required"; missing.push("Aadhaar Front Scan"); isValid = false; }
    if (!form.aadhaarBack) { tempErrors.aadhaarBack = "Aadhaar Back scan required"; missing.push("Aadhaar Back Scan"); isValid = false; }
    if (!form.panCard) { tempErrors.panCard = "PAN Card scan required"; missing.push("PAN Card Scan"); isValid = false; }
    if (!form.gstCertificate) { tempErrors.gstCertificate = "GST Certificate scan required"; missing.push("GST Certificate Scan"); isValid = false; }
    if (!form.cancelledCheque) { tempErrors.cancelledCheque = "Cancelled Cheque scan required"; missing.push("Cancelled Cheque Scan"); isValid = false; }
    if (!form.bankStatement) { tempErrors.bankStatement = "Bank Statement scan required"; missing.push("Bank Statement Scan"); isValid = false; }
    if (!form.storePhoto) { tempErrors.storePhoto = "Store front photo required"; missing.push("Store Photo"); isValid = false; }
    if (!form.storeBanner) { tempErrors.storeBanner = "Store banner image required"; missing.push("Store Banner"); isValid = false; }

    // Food License required if selling packaged food items
    if (form.sellsPackagedFood && !form.foodLicense) {
      tempErrors.foodLicense = "Food License (FSSAI) is mandatory for stores selling packaged food items";
      missing.push("Food License Scan");
      isValid = false;
    }

    setErrors(tempErrors);
    return { isValid, errors: tempErrors, missing };
  };

  /* ---------- SUBMIT FORM ACTION ---------- */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    const { isValid, errors: tempErrors, missing } = validateForm();
    if (!isValid) {
      toast.dismiss();
      
      const errorMsg = (
        <div className="space-y-1.5 text-left text-xs max-h-60 overflow-y-auto">
          <p className="font-black uppercase tracking-wider text-rose-500">Missing / Invalid Fields:</p>
          <ul className="list-disc pl-4 space-y-0.5 font-bold">
            {missing.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      );
      toast.error(errorMsg, { duration: 4000, id: "validation-errors" });

      // Automatically scroll to the first invalid field and focus it
      setTimeout(() => {
        const firstErrorField = Object.keys(tempErrors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus();
          } else {
            // Check by ID (e.g. uploader container)
            const uploaderElement = document.getElementById(`uploader-${firstErrorField}`);
            if (uploaderElement) {
              uploaderElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }
      }, 100);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);
    toast.dismiss();
    const loadingToastId = toast.loading("Submitting onboarding details...");

    let progressInterval = null;

    try {
      setUploadProgress(25);

      const formData = new FormData();
      formData.append("nodeType", nodeType);
      formData.append("storeName", form.storeName.trim());
      formData.append("storeDescription", form.storeDescription.trim());
      formData.append("address", form.address.trim());
      formData.append("city", form.city.trim());
      formData.append("state", form.state.trim());
      formData.append("pincode", form.pincode.trim());
      formData.append("latitude", form.latitude || "0");
      formData.append("longitude", form.longitude || "0");
      formData.append("ownerFullName", form.ownerFullName.trim());
      formData.append("ownerEmail", form.ownerEmail.trim());
      formData.append("ownerPhone", form.ownerPhone.trim());
      formData.append("aadhaarNumber", form.aadhaarNumber.replace(/\s/g, ""));
      formData.append("panNumber", form.panNumber.trim().toUpperCase());
      formData.append("gstNumber", form.gstNumber.trim().toUpperCase());
      formData.append("foodLicenseNumber", form.foodLicenseNumber.trim());
      formData.append("businessType", form.businessType);
      formData.append("bankAccountNumber", form.bankAccountNumber.trim());
      formData.append("ifscCode", form.ifscCode.trim().toUpperCase());
      formData.append("bankName", form.bankName.trim());

      // Append raw File objects from fileObjects (preferred — avoids base64 bloat)
      // For fields without raw File objects, fall back to base64 strings from form state
      const documentFields = [
        "aadhaarFront", "aadhaarBack", "panCard", "gstCertificate",
        "foodLicense", "cancelledCheque", "bankStatement", "storePhoto", "storeBanner"
      ];

      documentFields.forEach((fieldName) => {
        if (fileObjects[fieldName]) {
          // Raw File object available — use it (much smaller payload than base64)
          formData.append(fieldName, fileObjects[fieldName]);
        } else if (form[fieldName] && typeof form[fieldName] === "string" && form[fieldName].startsWith("data:")) {
          // No raw file, but we have a base64 string — send it as fallback
          formData.append(fieldName, form[fieldName]);
        }
      });

      setUploadProgress(40);
      
      // Start progress animation (caps at 90% while waiting for server)
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            return 90; // Cap at 90, real 100 only on success
          }
          return prev + 2;
        });
      }, 600);
      
      const response = await axiosInstance.post("/seller/store/submit", formData, {
        timeout: 120000, // 2 minute timeout for large file uploads
      });

      // Server responded — clear interval and jump to completion
      clearInterval(progressInterval);
      progressInterval = null;

      toast.dismiss(loadingToastId);

      if (!response?.success) {
        toast.error(response?.message || "Onboarding application failed", { id: "submit-error" });
        setUploadProgress(0);
        setIsSubmitting(false);
        return;
      }

      setUploadProgress(100);

      // Clean draft values
      localStorage.removeItem(`indiafy_kyc_draft_${nodeType}`);
      if (response?.node) {
        setSubmittedNode(response.node);
        setActiveNode(response.node);
        try {
          localStorage.setItem("activeNode", JSON.stringify(response.node));
        } catch (_storageErr) {
          // local persistence is best-effort only
        }
      }
      setIsSubmitted(true);
      toast.success("Onboarding Application Submitted!", { id: "submit-success" });

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(nodeType, response?.node || response?.application);
        }, 4000);
      }

    } catch (_error) {
      console.error(_error);
      toast.dismiss(loadingToastId);
      
      let msg;
      if (_error?.code === "ECONNABORTED" || _error?.message?.includes("timeout")) {
        msg = "Upload timed out. Please check your internet connection and try again.";
      } else {
        msg = _error?.response?.data?.message || _error?.message || "Failed to submit application details.";
      }
      toast.error(msg, { id: "submit-error" });
      setUploadProgress(0);
    } finally {
      // ALWAYS clean up interval — this was the bug causing 95% stuck
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsSubmitting(false);
    }
  };

  const getMaskedAadhaar = () => {
    const clean = form.aadhaarNumber.replace(/\s/g, "");
    if (clean.length < 4) return clean;
    return `XXXX XXXX ${clean.slice(-4)}`;
  };

  const getMaskedAccount = () => {
    if (form.bankAccountNumber.length < 4) return form.bankAccountNumber;
    return `${"•".repeat(form.bankAccountNumber.length - 4)}${form.bankAccountNumber.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-900/60 backdrop-blur-sm">
      {previewFile && <PreviewModal fileUrl={previewFile} onClose={() => setPreviewFile(null)} />}

      <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[95dvh] sm:max-h-[90dvh] h-[95dvh] sm:h-[90dvh] flex flex-col relative border border-slate-100">
        
        {/* HEADER SECTION */}
        <div className={`p-5 text-white bg-gradient-to-r ${config.gradient} shrink-0`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-black flex items-center gap-1.5 leading-none">
              {config.emoji} Become an Indiafy Seller Node
            </h2>
            <button onClick={onClose} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition text-white">
              <X size={16} />
            </button>
          </div>
          <p className="text-[11px] text-white/80 font-medium">
            Complete the onboarding details. Your application will be reviewed by an administrator.
          </p>
          
          {isSubmitting && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                <span>Uploading encrypted KYC records...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* FORM CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* SECTION 1: STORE DETAILS */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Store size={14} className="text-emerald-500" /> Section 1: Store Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KYCInput
                      label="Shop Name"
                      name="storeName" value={form.storeName} onChange={handleInputChange}
                      placeholder="Sharma Super Mart"
                      error={errors.storeName}
                    />
                    <KYCInput
                      label="Store Description"
                      name="storeDescription" value={form.storeDescription} onChange={handleInputChange}
                      placeholder="Fresh groceries and dairy store"
                      error={errors.storeDescription}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shop Address *</label>
                    <textarea
                      rows={2}
                      name="address" value={form.address} onChange={handleInputChange}
                      placeholder="Building, Street Name, Area"
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-all resize-none placeholder:text-slate-350"
                    />
                    {errors.address && <span className="text-[10px] font-medium text-rose-500">{errors.address}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <KYCInput
                      label="City"
                      name="city" value={form.city} onChange={handleInputChange}
                      placeholder="New Delhi"
                      error={errors.city}
                    />
                    <KYCInput
                      label="State"
                      name="state" value={form.state} onChange={handleInputChange}
                      placeholder="Delhi"
                      error={errors.state}
                    />
                    <KYCInput
                      label="Pincode"
                      name="pincode" value={form.pincode} onChange={handleInputChange}
                      placeholder="110001"
                      error={errors.pincode}
                    />
                  </div>

                  {/* STORE GPS LOCATION (MAP PIN) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-500" /> Store GPS Location
                      </label>
                      {(form.latitude && form.longitude) && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-500" /> Pinned ({form.latitude}, {form.longitude})
                        </span>
                      )}
                    </div>

                    {!form.latitude || !form.longitude ? (
                      <div 
                        onClick={handleDetectLocation}
                        className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-all flex flex-col items-center justify-center text-center group shadow-sm hover:shadow"
                      >
                        {isDetectingLocation ? (
                          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm py-2">
                            <Loader2 size={20} className="animate-spin text-emerald-600" />
                            Detecting GPS Coordinates...
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-2.5 shadow-md group-hover:scale-105 transition-transform">
                              <MapPin size={24} />
                            </div>
                            <span className="text-sm font-black text-slate-800">Pin Current Shop Location on Map</span>
                            <span className="text-[11px] text-slate-500 font-medium mt-1 max-w-sm">
                              Click here to automatically detect and pin your shop's exact GPS latitude & longitude
                            </span>
                            <span className="text-[10px] text-amber-600 font-semibold mt-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                              Not at your shop? Skip this — we'll use the text address above
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-3 shadow-inner">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                              <MapPin size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">Store Pinned Successfully</p>
                              <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">
                                Lat: {form.latitude} | Lng: {form.longitude}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isDetectingLocation}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                          >
                            {isDetectingLocation ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <MapPin size={14} className="text-emerald-600" />}
                            Re-detect GPS
                          </button>
                        </div>

                        {/* Interactive Google Map Preview */}
                        <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-200/50 relative">
                          <iframe
                            title="Store GPS Map"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                            src={`https://maps.google.com/maps?q=${form.latitude},${form.longitude}&hl=en&z=16&output=embed`}
                          />
                        </div>

                        {/* Manual Override Toggle */}
                        <div className="text-[11px] text-slate-500 pt-1">
                          <p className="font-bold text-slate-800 select-none">
                            Not at your shop right now? <span className="text-slate-500 font-medium">You can enter coordinates manually or leave them blank — we'll use the text address you entered above instead.</span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2.5 border-t border-slate-200">
                            <KYCInput
                              label="Latitude"
                              name="latitude" value={form.latitude} onChange={handleInputChange}
                              placeholder="28.6139"
                              error={errors.latitude}
                            />
                            <KYCInput
                              label="Longitude"
                              name="longitude" value={form.longitude} onChange={handleInputChange}
                              placeholder="77.2090"
                              error={errors.longitude}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {(errors.latitude || errors.longitude) && (
                      <span className="text-[10px] font-medium text-rose-500 block">
                        {errors.latitude || errors.longitude}
                      </span>
                    )}
                  </div>
                </div>

                {/* SECTION 2: OWNER INFORMATION */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Shield size={14} className="text-emerald-500" /> Section 2: Owner Information
                  </h3>

                  <KYCInput
                    label="Full Name"
                    name="ownerFullName" value={form.ownerFullName} onChange={handleInputChange}
                    placeholder="John Doe"
                    error={errors.ownerFullName}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KYCInput
                      label="Email"
                      name="ownerEmail" value={form.ownerEmail} onChange={handleInputChange}
                      placeholder="owner@example.com"
                      error={errors.ownerEmail}
                    />
                    <KYCInput
                      label="Mobile Number"
                      name="ownerPhone" value={form.ownerPhone} onChange={handleInputChange}
                      placeholder="9999988888"
                      error={errors.ownerPhone}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KYCInput
                      label="Aadhaar Number"
                      name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleInputChange}
                      placeholder="12-digit Aadhaar Card Number"
                      error={errors.aadhaarNumber}
                    />
                    <KYCInput
                      label="PAN Number"
                      name="panNumber" value={form.panNumber} onChange={handleInputChange}
                      placeholder="10-character PAN Code"
                      error={errors.panNumber}
                    />
                  </div>
                </div>

                {/* SECTION 3: BUSINESS & BANK DETAILS */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-emerald-500" /> Section 3: Business & Bank Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KYCInput
                      label="GSTIN Number"
                      name="gstNumber" value={form.gstNumber} onChange={handleInputChange}
                      placeholder="15-character GST Code"
                      error={errors.gstNumber}
                    />
                    <KYCInput
                      label="Food License Number"
                      name="foodLicenseNumber" value={form.foodLicenseNumber} onChange={handleInputChange}
                      placeholder="14-digit FSSAI Code"
                      error={errors.foodLicenseNumber}
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-sm">
                    <input 
                      type="checkbox" 
                      name="sellsPackagedFood"
                      checked={form.sellsPackagedFood}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-black text-slate-700">Does this store sell packaged food items? (FSSAI is mandatory if checked)</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Business Type *</label>
                      <select
                        name="businessType"
                        value={form.businessType}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none"
                      >
                        <option value="Proprietorship">Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Private Limited">Private Limited</option>
                        <option value="Individual">Individual / Retailer</option>
                      </select>
                    </div>
                    <KYCInput
                      label="Bank Name"
                      name="bankName" value={form.bankName} onChange={handleInputChange}
                      placeholder="State Bank of India"
                      error={errors.bankName}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KYCInput
                      label="Bank Account Number"
                      name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleInputChange}
                      placeholder="Enter account number"
                      error={errors.bankAccountNumber}
                    />
                    <KYCInput
                      label="Confirm Account Number"
                      name="confirmBankAccountNumber" value={form.confirmBankAccountNumber} onChange={handleInputChange}
                      placeholder="Re-enter account number"
                      error={errors.confirmBankAccountNumber}
                    />
                  </div>

                  <KYCInput
                    label="IFSC Code"
                    name="ifscCode" value={form.ifscCode} onChange={handleInputChange}
                    placeholder="SBIN0001234"
                    error={errors.ifscCode}
                  />
                </div>

                {/* SECTION 4: REQUIRED COMPLIANCE UPLOADS */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <FileText size={14} className="text-emerald-500" /> Section 4: Document Verification Files
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DocumentUploader
                      label="Aadhaar Front"
                      value={form.aadhaarFront}
                      onChange={(url, file) => updateFileField("aadhaarFront", url, file)}
                      onPreview={setPreviewFile}
                      error={errors.aadhaarFront}
                      id="uploader-aadhaarFront"
                    />
                    <DocumentUploader
                      label="Aadhaar Back"
                      value={form.aadhaarBack}
                      onChange={(url, file) => updateFileField("aadhaarBack", url, file)}
                      onPreview={setPreviewFile}
                      error={errors.aadhaarBack}
                      id="uploader-aadhaarBack"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DocumentUploader
                      label="PAN Card Scan"
                      value={form.panCard}
                      onChange={(url, file) => updateFileField("panCard", url, file)}
                      onPreview={setPreviewFile}
                      error={errors.panCard}
                      id="uploader-panCard"
                    />
                    <DocumentUploader
                      label="GST Certificate"
                      value={form.gstCertificate}
                      onChange={(url, file) => updateFileField("gstCertificate", url, file)}
                      onPreview={setPreviewFile}
                      error={errors.gstCertificate}
                      id="uploader-gstCertificate"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DocumentUploader
                      label="Cancelled Cheque"
                      value={form.cancelledCheque}
                      onChange={(url, file) => updateFileField("cancelledCheque", url, file)}
                      onPreview={setPreviewFile}
                      error={errors.cancelledCheque}
                      id="uploader-cancelledCheque"
                    />
                    <DocumentUploader
                      label="Bank Statement"
                      value={form.bankStatement}
                      onChange={(url, file) => updateFileField("bankStatement", url, file)}
                      onPreview={setPreviewFile}
                      error={errors.bankStatement}
                      id="uploader-bankStatement"
                    />
                  </div>

                  <div>
                    <DocumentUploader
                      label="Food License (FSSAI) - Optional except grocery/q-commerce"
                      value={form.foodLicense}
                      onChange={(url, file) => updateFileField("foodLicense", url, file)}
                      onPreview={setPreviewFile}
                      error={errors.foodLicense}
                      id="uploader-foodLicense"
                    />
                  </div>

                  <div className="flex gap-4 items-start pt-3 border-t border-slate-100">
                    <ImageFieldUploader 
                      label="Store Photo (Visual)" 
                      value={form.storePhoto} 
                      onChange={(url, file) => updateFileField("storePhoto", url, file)} 
                      isLogo={true} 
                      error={errors.storePhoto}
                      id="uploader-storePhoto"
                    />
                    <ImageFieldUploader 
                      label="Store Banner" 
                      value={form.storeBanner} 
                      onChange={(url, file) => updateFileField("storeBanner", url, file)} 
                      isLogo={false} 
                      error={errors.storeBanner}
                      id="uploader-storeBanner"
                    />
                  </div>
                </div>

                {/* LIVE VERIFICATION SUMMARY */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 shadow-inner space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-1.5">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500" /> Onboarding Preview Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">Shop Name</p>
                      <p className="font-bold text-slate-800 truncate">{form.storeName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">Owner Full Name</p>
                      <p className="font-bold text-slate-800 truncate">{form.ownerFullName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">Aadhaar (Masked)</p>
                      <p className="font-bold text-slate-800">{form.aadhaarNumber ? getMaskedAadhaar() : "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium text-[10px] uppercase">Bank Account (Masked)</p>
                      <p className="font-bold text-slate-800">{form.bankAccountNumber ? getMaskedAccount() : "—"}</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              /* SUCCESS SCREEN */
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center p-6 h-full space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 size={48} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Application in Queue</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mx-auto">
                      Your store details have been safely received and placed in the review queue. Once approved by our admin team, your shop will automatically go LIVE!
                  </p>
                </div>
                
                <div className="border border-slate-200 bg-white rounded-2xl p-5 w-full max-w-sm text-left grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Current Status</span>
                    <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-black inline-flex items-center gap-1.5"><Clock size={12} /> Pending Admin Approval</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Estimated Time</span>
                    <span className="text-slate-800 font-black px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 inline-block">24-48 hours</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const activeNode = submittedNode || JSON.parse(localStorage.getItem("activeNode"));
                    onSuccess?.(nodeType, activeNode);
                    if (activeNode?._id) {
                      window.location.href = `/seller/dashboard/${activeNode._id}/dashboard`;
                    } else {
                      window.location.href = "/seller-hub";
                    }
                  }}
                  className="w-full max-w-sm py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black uppercase rounded-2xl hover:opacity-90 transition active:scale-95 text-xs shadow-lg shadow-emerald-500/30"
                >
                  Go To Verification Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTION FOOTER */}
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
                    <Loader2 size={12} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Zap size={12} /> Submit Onboarding
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
