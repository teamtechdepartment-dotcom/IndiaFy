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
   DRAG-AND-DROP FILE UPLOADER WITH VALIDATIONS
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
    const toastId = toast.loading(`Scanning ${file.name} for security...`);
    
    try {
      const previewUrl = URL.createObjectURL(file);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast.dismiss(toastId);
      onChange(previewUrl, file);
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
        onClick={() => !isReading && fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center transition-all h-28 overflow-hidden
          ${dragActive ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"}
          ${value ? "border-emerald-250 bg-emerald-50/10" : ""}
          ${error ? "border-red-400 bg-red-50/10" : ""}`}
      >
        {isReading ? (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin text-brand-accent mb-1" size={20} />
            <span className="text-[10px] font-bold">Scanning Document...</span>
          </div>
        ) : value ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-50/90 group">
            {value.startsWith("data:application/pdf") ? (
              <div className="flex flex-col items-center p-2 text-slate-650 font-bold">
                <FileText size={22} className="text-emerald-500 mb-1" />
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
                className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition shadow"
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
      {error && <span className="text-[9px] text-red-500 font-bold">{error}</span>}
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
function ImageFieldUploader({ label, value, onChange, isLogo, error, id }) {
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
    <div id={id} className="space-y-1.5 flex-1">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label} *</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed bg-slate-50/50 hover:bg-slate-50 flex items-center justify-center overflow-hidden transition-all h-24 
          ${error ? "border-red-400" : "border-slate-200 hover:border-slate-400"}
          ${isLogo ? 'w-24' : 'w-full'}`}
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
      {error && <p className="text-[9px] text-red-500 font-bold mt-1">{error}</p>}
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedVal = value;

    if (name === "panNumber" || name === "gstNumber") {
      formattedVal = value.toUpperCase();
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
    if (form.latitude && form.latitude.trim() && isNaN(form.latitude)) { 
      tempErrors.latitude = "Latitude must be a number"; 
      missing.push("Latitude (number)");
      isValid = false; 
    }
    if (form.longitude && form.longitude.trim() && isNaN(form.longitude)) { 
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

    // Food License required for Grocery and Q-Commerce
    if ((nodeType === "QUICK_COMMERCE" || nodeType === "HOME_ESSENTIALS") && !form.foodLicense) {
      tempErrors.foodLicense = "Food License (FSSAI) is mandatory for this store node";
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
      toast.error(errorMsg, { duration: 4000 });

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

      // Append Raw File Objects if available
      Object.keys(fileObjects).forEach((fieldName) => {
        if (fileObjects[fieldName]) {
          formData.append(fieldName, fileObjects[fieldName]);
        }
      });

      // Fallback base64 strings if not using raw File objects (and not blob URLs)
      const isBlobUrl = (val) => typeof val === "string" && val.startsWith("blob:");
      if (!fileObjects.aadhaarFront && form.aadhaarFront && !isBlobUrl(form.aadhaarFront)) formData.append("aadhaarFront", form.aadhaarFront);
      if (!fileObjects.aadhaarBack && form.aadhaarBack && !isBlobUrl(form.aadhaarBack)) formData.append("aadhaarBack", form.aadhaarBack);
      if (!fileObjects.panCard && form.panCard && !isBlobUrl(form.panCard)) formData.append("panCard", form.panCard);
      if (!fileObjects.gstCertificate && form.gstCertificate && !isBlobUrl(form.gstCertificate)) formData.append("gstCertificate", form.gstCertificate);
      if (!fileObjects.foodLicense && form.foodLicense && !isBlobUrl(form.foodLicense)) formData.append("foodLicense", form.foodLicense);
      if (!fileObjects.cancelledCheque && form.cancelledCheque && !isBlobUrl(form.cancelledCheque)) formData.append("cancelledCheque", form.cancelledCheque);
      if (!fileObjects.bankStatement && form.bankStatement && !isBlobUrl(form.bankStatement)) formData.append("bankStatement", form.bankStatement);
      if (!fileObjects.storePhoto && form.storePhoto && !isBlobUrl(form.storePhoto)) formData.append("storePhoto", form.storePhoto);
      if (!fileObjects.storeBanner && form.storeBanner && !isBlobUrl(form.storeBanner)) formData.append("storeBanner", form.storeBanner);

      setUploadProgress(65);
      
      const response = await axiosInstance.post("/seller/store/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadProgress(90);

      toast.dismiss(loadingToastId);

      if (!response?.success) {
        toast.error(response?.message || "Onboarding application failed");
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
      toast.success("Onboarding Application Submitted!");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(nodeType, response?.node || response?.application);
        }, 1200);
      }

    } catch (_error) {
      console.error(_error);
      const msg = _error?.response?.data?.message || _error?.message || "Failed to submit application details.";
      toast.error(msg);
    } finally {
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

      <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl h-[92vh] sm:h-[88vh] flex flex-col relative border border-slate-100">
        
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      label="Food License Number (Optional / Mandatory by node)"
                      name="foodLicenseNumber" value={form.foodLicenseNumber} onChange={handleInputChange}
                      placeholder="14-digit FSSAI Code"
                      error={errors.foodLicenseNumber}
                    />
                  </div>

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
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">🎉 Application Submitted Successfully</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-sm mx-auto">
                      Your business activation records and compliance documents were submitted for admin review. Store tools stay locked until approval.
                  </p>
                </div>
                
                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 w-full text-left grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase block">Application Status</span>
                    <span className="text-slate-800 font-black mt-0.5 flex items-center gap-1"><Clock size={12} className="text-amber-500" /> Pending Approval</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase block">Estimated Review Time</span>
                    <span className="text-slate-850 font-black mt-0.5">24-48 hours</span>
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
                  className="w-full py-3.5 bg-slate-900 text-white font-black uppercase rounded-xl hover:bg-slate-800 transition active:scale-95 text-xs shadow-md"
                >
                  Go To Seller Dashboard
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
