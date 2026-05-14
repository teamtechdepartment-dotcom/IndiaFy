import React, { useState, useRef, useCallback } from "react";
import {
  X, ArrowRight, ArrowLeft, Loader2, Store, MapPin, Settings2,
  CreditCard, Upload, Image, Check, Clock, Truck, Package,
  Building2, Phone, Mail, FileText, Zap, Home,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosInstance";
import { useNodeStore } from "../../../store/nodeStore";

/* ============================================================
   NODE CONFIG
============================================================ */
const NODE_CONFIG = {
  LOCAL_RETAIL: { label: "Local Retail", color: "#3B82F6", gradient: "from-blue-600 to-blue-500", emoji: "🏪" },
  WHOLESALE_B2B: { label: "Wholesale B2B", color: "#F59E0B", gradient: "from-amber-500 to-orange-500", emoji: "🏭" },
  QUICK_COMMERCE: { label: "Quick Commerce", color: "#10B981", gradient: "from-emerald-500 to-teal-500", emoji: "⚡" },
  HOME_ESSENTIALS: { label: "Home Essentials", color: "#F97316", gradient: "from-orange-500 to-rose-500", emoji: "🏠" },
  ELECTRONICS: { label: "Electronics", color: "#8B5CF6", gradient: "from-purple-600 to-violet-600", emoji: "💻" },
  PERSONAL_CARE: { label: "Personal Care", color: "#EC4899", gradient: "from-pink-500 to-rose-500", emoji: "✨" },
};

const STORE_CATEGORIES = [
  "Grocery & Essentials", "Electronics & Gadgets", "Fashion & Clothing",
  "Food & Beverages", "Health & Pharma", "Beauty & Personal Care",
  "Home & Kitchen", "Sports & Fitness", "Books & Stationery",
  "Toys & Baby Products", "Pet Supplies", "Automotive",
  "Wholesale Goods", "Quick Delivery", "Other",
];

const DISPATCH_SPEEDS = [
  { label: "10 mins", desc: "Hyper-local" },
  { label: "30 mins", desc: "Quick Commerce" },
  { label: "2 hours", desc: "Same Day" },
  { label: "Next Day", desc: "Standard" },
  { label: "2-3 Days", desc: "Wholesale" },
];

const STEPS = [
  { id: 1, label: "Store Identity", icon: Store },
  { id: 2, label: "Location", icon: MapPin },
  { id: 3, label: "Operations", icon: Settings2 },
  { id: 4, label: "Finish", icon: CreditCard },
];

/* ============================================================
   FILE -> BASE64
============================================================ */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ============================================================
   IMAGE UPLOAD FIELD
============================================================ */
function ImageUploadField({ label, value, onChange, aspect = "square", hint = "" }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const base64 = await fileToBase64(file);
    setPreview(base64);
    onChange(base64);
  };

  const isSquare = aspect === "square";

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden
          ${preview ? "border-slate-200" : "border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100"}
          ${isSquare ? "w-28 h-28" : "w-full h-36"}`}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            {isSquare ? <Image size={24} className="text-slate-300 mb-2" /> : <Upload size={20} className="text-slate-300 mb-2" />}
            <p className="text-xs text-slate-400 font-medium">{hint || "Click to upload"}</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}

/* ============================================================
   STEP INDICATOR
============================================================ */
function StepIndicator({ currentStep, config }) {
  return (
    <div className="flex items-center justify-center px-6 py-4 gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const StepIcon = step.icon;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 font-bold text-sm
                  ${isCompleted ? "text-white shadow-md" : isActive ? "text-white shadow-lg scale-110" : "bg-slate-100 text-slate-400"}`}
                style={isCompleted || isActive ? { backgroundColor: config.color } : {}}
              >
                {isCompleted ? <Check size={16} /> : <StepIcon size={16} />}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all duration-500 ${currentStep > step.id ? "" : "bg-slate-100"}`}
                style={currentStep > step.id ? { backgroundColor: config.color } : {}} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ============================================================
   FORM INPUT
============================================================ */
function FormInput({ label, icon: Icon, required, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        {...props}
        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-300"
      />
    </div>
  );
}

/* ============================================================
   MAIN WIZARD COMPONENT
============================================================ */
export default function StoreCreationWizard({ nodeType, onClose, onSuccess }) {
  const { setActiveNode } = useNodeStore();
  const config = NODE_CONFIG[nodeType] || NODE_CONFIG.LOCAL_RETAIL;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Step 1 — Identity
    storeName: "",
    logo: "",
    banner: "",
    description: "",
    storeCategory: "",
    // Step 2 — Location
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    warehouseLocation: "",
    // Step 3 — Operations
    deliveryRadius: 8,
    dispatchSpeed: "30 mins",
    operatingHours: "9:00 AM - 10:00 PM",
    pickupAvailable: false,
    gstin: "",
    minOrderQty: 1,
    minOrderValue: 0,
    // Step 4 — Bank
    accountName: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
  });

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    update(name, type === "checkbox" ? checked : value);
  }, [update]);

  /* ---------- VALIDATION ---------- */
  const validateStep = (s) => {
    if (s === 1) {
      if (!form.storeName.trim()) { toast.error("Store name is required"); return false; }
      if (!form.storeCategory) { toast.error("Please select a store category"); return false; }
      return true;
    }
    if (s === 2) {
      if (!form.email.trim()) { toast.error("Business email is required"); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Enter a valid email address"); return false; }
      if (!form.phone.trim()) { toast.error("Phone number is required"); return false; }
      if (!form.address.trim()) { toast.error("Store address is required"); return false; }
      if (!form.city.trim()) { toast.error("City is required"); return false; }
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        nodeType,
        storeName: form.storeName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        description: form.description.trim(),
        storeCategory: form.storeCategory,
        logo: form.logo,
        banner: form.banner,
        deliveryRadius: Number(form.deliveryRadius),
        dispatchSpeed: form.dispatchSpeed,
        operatingHours: form.operatingHours,
        pickupAvailable: form.pickupAvailable,
        gstin: form.gstin.trim(),
        warehouseLocation: form.warehouseLocation.trim(),
        minOrderQty: Number(form.minOrderQty),
        minOrderValue: Number(form.minOrderValue),
        accountName: form.accountName.trim(),
        accountNumber: form.accountNumber.trim(),
        ifsc: form.ifsc.trim(),
        bankName: form.bankName.trim(),
      };

      const response = await axiosInstance.post("/seller/nodes/create", payload);

      if (!response?.success) {
        toast.error(response?.message || "Store creation failed");
        return;
      }

      const createdNode = response?.node;

      if (createdNode) {
        setActiveNode(createdNode);
        try { localStorage.setItem("activeNode", JSON.stringify(createdNode)); } catch (_) {}
      }

      toast.success(`🎉 ${form.storeName} is live on the marketplace!`);
      onSuccess?.(nodeType, createdNode);

      setTimeout(() => {
        if (createdNode?._id) {
          window.location.href = `/seller/dashboard/${createdNode._id}/dashboard`;
        } else {
          window.location.href = "/seller-hub";
        }
      }, 1200);

    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "Failed to create store";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     RENDER STEPS
  ============================================================ */
  const renderStep = () => {
    switch (step) {
      /* ---- STEP 1: IDENTITY ---- */
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <div className="text-4xl mb-2">{config.emoji}</div>
              <h3 className="text-lg font-black text-slate-900">Brand Your Store</h3>
              <p className="text-slate-500 text-sm mt-1">Create a memorable identity for your {config.label} store</p>
            </div>

            <FormInput
              label="Store Name" icon={Store} required
              name="storeName" value={form.storeName}
              onChange={handleChange}
              placeholder={`e.g. ${form.storeCategory || "My"} Corner Shop`}
            />

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Store Category <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STORE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => update("storeCategory", cat)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all text-left
                      ${form.storeCategory === cat
                        ? "text-white border-transparent shadow-md"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    style={form.storeCategory === cat ? { backgroundColor: config.color } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Store Description
              </label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Tell customers what makes your store special..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-300 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="shrink-0">
                <ImageUploadField
                  label="Store Logo"
                  value={form.logo}
                  onChange={(v) => update("logo", v)}
                  aspect="square"
                  hint="Logo (1:1)"
                />
              </div>
              <div className="flex-1">
                <ImageUploadField
                  label="Store Banner"
                  value={form.banner}
                  onChange={(v) => update("banner", v)}
                  aspect="banner"
                  hint="Banner image (3:1 ratio recommended)"
                />
              </div>
            </div>
          </div>
        );

      /* ---- STEP 2: LOCATION ---- */
      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center pb-2">
              <div className="text-4xl mb-2">📍</div>
              <h3 className="text-lg font-black text-slate-900">Contact & Location</h3>
              <p className="text-slate-500 text-sm mt-1">Help customers find and reach your store</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Business Email" icon={Mail} required
                name="email" value={form.email} onChange={handleChange}
                type="email" placeholder="store@gmail.com"
              />
              <FormInput label="Phone Number" icon={Phone} required
                name="phone" value={form.phone} onChange={handleChange}
                type="tel" placeholder="+91 98765 43210"
              />
            </div>

            <FormInput label="Full Store Address" icon={Home} required
              name="address" value={form.address} onChange={handleChange}
              placeholder="Shop No, Building, Street Name"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput label="City" icon={Building2} required
                name="city" value={form.city} onChange={handleChange} placeholder="Mumbai"
              />
              <FormInput label="State"
                name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra"
              />
              <FormInput label="Pincode"
                name="pincode" value={form.pincode} onChange={handleChange} placeholder="400001"
              />
            </div>

            <FormInput label="Warehouse / Pickup Point (optional)" icon={Package}
              name="warehouseLocation" value={form.warehouseLocation} onChange={handleChange}
              placeholder="Warehouse address if different from store"
            />
          </div>
        );

      /* ---- STEP 3: OPERATIONS ---- */
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <div className="text-4xl mb-2">⚙️</div>
              <h3 className="text-lg font-black text-slate-900">Operations Setup</h3>
              <p className="text-slate-500 text-sm mt-1">Configure how you deliver and operate</p>
            </div>

            {/* Dispatch Speed */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1"><Zap size={12} /> Dispatch Speed *</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {DISPATCH_SPEEDS.map((d) => (
                  <button
                    key={d.label} type="button"
                    onClick={() => update("dispatchSpeed", d.label)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center
                      ${form.dispatchSpeed === d.label
                        ? "border-transparent text-white shadow-md"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-600"}`}
                    style={form.dispatchSpeed === d.label ? { backgroundColor: config.color } : {}}
                  >
                    <span className="font-black text-sm">{d.label}</span>
                    <span className="text-[9px] mt-0.5 opacity-80 font-medium">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Radius */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1"><Truck size={12} /> Delivery Radius</span>
                <span className="text-base font-black text-slate-900" style={{ color: config.color }}>{form.deliveryRadius} km</span>
              </label>
              <input type="range" min={1} max={50} step={1}
                value={form.deliveryRadius}
                onChange={(e) => update("deliveryRadius", Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: config.color }}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>1 km</span><span>50 km</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Operating Hours" icon={Clock}
                name="operatingHours" value={form.operatingHours} onChange={handleChange}
                placeholder="9:00 AM - 10:00 PM"
              />
              <FormInput label="GSTIN (optional)" icon={FileText}
                name="gstin" value={form.gstin} onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Min Order Qty"
                name="minOrderQty" value={form.minOrderQty} onChange={handleChange}
                type="number" min={1} placeholder="1"
              />
              <FormInput label="Min Order Value (₹)"
                name="minOrderValue" value={form.minOrderValue} onChange={handleChange}
                type="number" min={0} placeholder="0"
              />
            </div>

            {/* Pickup Toggle */}
            <div
              onClick={() => update("pickupAvailable", !form.pickupAvailable)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all
                ${form.pickupAvailable ? "border-transparent" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
              style={form.pickupAvailable ? { backgroundColor: config.color + "20", borderColor: config.color } : {}}
            >
              <div>
                <p className="font-bold text-slate-900 text-sm">Pickup Available</p>
                <p className="text-xs text-slate-500 mt-0.5">Let customers pick up from your store</p>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all relative ${form.pickupAvailable ? "" : "bg-slate-200"}`}
                style={form.pickupAvailable ? { backgroundColor: config.color } : {}}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.pickupAvailable ? "left-6" : "left-0.5"}`} />
              </div>
            </div>
          </div>
        );

      /* ---- STEP 4: BANK + REVIEW ---- */
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <div className="text-4xl mb-2">🏦</div>
              <h3 className="text-lg font-black text-slate-900">Bank Details & Launch</h3>
              <p className="text-slate-500 text-sm mt-1">Add your bank account to receive payouts (optional)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Account Holder Name" icon={CreditCard}
                name="accountName" value={form.accountName} onChange={handleChange}
                placeholder="Full name as per bank"
              />
              <FormInput label="Bank Name"
                name="bankName" value={form.bankName} onChange={handleChange}
                placeholder="HDFC / SBI / ICICI"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Account Number"
                name="accountNumber" value={form.accountNumber} onChange={handleChange}
                placeholder="XXXXXXXXXXXX"
              />
              <FormInput label="IFSC Code"
                name="ifsc" value={form.ifsc} onChange={handleChange}
                placeholder="HDFC0001234"
              />
            </div>

            {/* Review Summary */}
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: config.color + "10", border: `1px solid ${config.color}30` }}>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: config.color }}>Store Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {[
                  ["Store Name", form.storeName || "—"],
                  ["Category", form.storeCategory || "—"],
                  ["City", form.city || "—"],
                  ["Dispatch", form.dispatchSpeed],
                  ["Delivery Radius", `${form.deliveryRadius} km`],
                  ["Type", config.label],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 font-bold">{label}</p>
                    <p className="font-bold text-slate-900 truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 text-center font-medium">
              By launching your store, you agree to Indiafy's seller terms and marketplace policies.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>

      <div className="w-full sm:max-w-2xl bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl max-h-[85dvh] md:max-h-[80dvh] flex flex-col relative animate-in fade-in zoom-in-95 duration-300">

        {/* HEADER */}
        <div className={`bg-gradient-to-r ${config.gradient} p-5 sm:p-6 flex items-center justify-between shrink-0`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{config.emoji}</span>
              <h2 className="text-lg font-black text-white">Create {config.label} Store</h2>
            </div>
            <p className="text-white/70 text-xs font-medium">Your store will go live on Indiafy marketplace instantly</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white">
            <X size={18} />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="border-b border-slate-100 shrink-0">
          <StepIndicator currentStep={step} config={config} />
        </div>

        {/* SCROLLABLE FORM */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {renderStep()}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="border-t border-slate-100 p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0 bg-white">
          {step > 1 ? (
            <button onClick={goBack}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all">
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <button onClick={onClose}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all">
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button onClick={goNext}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-sm shadow-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-70"
              style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}>
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Launching Store...</>
              ) : (
                <><Zap size={16} /> Launch Store 🚀</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}