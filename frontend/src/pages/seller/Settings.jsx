import React, { useState, useRef } from "react";
import { 
  Store, MapPin, Bell, Shield, Save, CheckCircle2,
  Loader2, Mail, Phone, Landmark, Building, Power, AlertTriangle, Copy, Trash2
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";

// Reusable Input Component
const InputGroup = ({ label, type = "text", value, onChange, placeholder, icon: Icon, multiline, disabled }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />}
      {multiline ? (
        <textarea 
          value={value} 
          onChange={onChange} 
          disabled={disabled}
          placeholder={placeholder} 
          className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl p-3.5 text-sm outline-none transition-all shadow-sm min-h-[100px] resize-y custom-scrollbar disabled:opacity-60 disabled:cursor-not-allowed" 
        />
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={onChange} 
          disabled={disabled}
          placeholder={placeholder} 
          className={`w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-xl py-3 text-sm outline-none transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${Icon ? 'pl-10 pr-4' : 'px-4'}`} 
        />
      )}
    </div>
  </div>
);

// Reusable Toggle Component
const Toggle = ({ label, description, checked, onChange, disabled }) => (
  <div className={`flex items-start sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 transition-colors shadow-sm gap-4 ${disabled ? 'opacity-60' : 'hover:border-slate-300'}`}>
    <div>
      <h4 className="text-sm font-bold text-slate-900">{label}</h4>
      <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">{description}</p>
    </div>
    <label className={`relative inline-flex items-center shrink-0 mt-1 sm:mt-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} disabled={disabled} />
      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900 transition-colors"></div>
    </label>
  </div>
);

export default function Settings({ storeDetails, setStoreDetails }) {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState(storeDetails || {
    name: "Jai Store", initials: "JS", email: "contact@jaistore.com", phone: "+91 98765 43210", 
    address: "Street 10, Sector 22\nChandigarh, 160022", gstin: "04AABCU9603R1ZM",
    accountName: "Jai Store Official", accountNumber: "50100234567890", ifsc: "HDFC0001234", bankName: "HDFC Bank",
    orderAlerts: true, autoAccept: false, promotionalEmails: true,
    isStoreOpen: true, isDeactivated: false, logo: null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds the 10MB limit. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logo', reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handleChange('logo', null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`indiafy.com/${formData.name.toLowerCase().replace(/\s+/g, '-')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleDeactivation = () => {
    if (formData.isDeactivated) {
      handleChange('isDeactivated', false);
    } else {
      const confirm = window.confirm("Are you sure you want to deactivate your store? You will not receive any new orders.");
      if (confirm) setFormData(prev => ({ ...prev, isDeactivated: true, isStoreOpen: false }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await axiosInstance.put("/seller/auth/settings", formData);
      if (res.data.success || res.status === 200) {
        // Sync with global auth store
        const authStore = useAuthStore.getState();
        if (authStore.fetchMe) await authStore.fetchMe('seller');

        const words = formData.name.trim().split(" ");
        let newInitials = "S";
        if (words.length >= 2) newInitials = (words[0][0] + words[1][0]).toUpperCase();
        else if (words.length === 1 && words[0].length > 0) newInitials = words[0].substring(0, 2).toUpperCase();

        if (setStoreDetails) setStoreDetails({ ...formData, initials: newInitials });
        
        setShowSuccess(true);
        toast.success("Settings updated successfully");
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto pb-12">
      
      {/* Sticky Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-xl py-4 z-20 border-b border-slate-200/60 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your store preferences and configurations.</p>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && <span className="text-emerald-600 text-sm font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4"><CheckCircle2 size={18} /> Saved!</span>}
          <button type="submit" disabled={isSaving || formData.isDeactivated} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Deactivated Warning */}
      {formData.isDeactivated && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in zoom-in-95">
          <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0"><AlertTriangle size={24} /></div>
          <div>
            <h3 className="text-red-800 font-bold text-lg">Your store is currently deactivated</h3>
            <p className="text-red-600/90 text-sm mt-1">Customers cannot see your store or place orders. You cannot edit settings until you reactivate your store.</p>
          </div>
        </div>
      )}

      {/* Store Status */}
      <div className={`rounded-2xl border transition-all duration-300 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${formData.isStoreOpen ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'} ${formData.isDeactivated ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl text-white shadow-sm ${formData.isStoreOpen ? 'bg-emerald-500' : 'bg-amber-500'}`}>
            <Power size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{formData.isStoreOpen ? 'Store is Open' : 'Store is Paused'}</h2>
            <p className={`text-sm font-medium mt-0.5 ${formData.isStoreOpen ? 'text-emerald-700' : 'text-amber-700'}`}>
              {formData.isStoreOpen ? "Customers can view products and place orders." : "Your catalog is hidden. No new orders will be received."}
            </p>
          </div>
        </div>
        <label className={`relative inline-flex items-center shrink-0 ${formData.isDeactivated ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <input type="checkbox" className="sr-only peer" checked={formData.isStoreOpen} disabled={formData.isDeactivated} onChange={(e) => handleChange('isStoreOpen', e.target.checked)} />
          <div className="w-14 h-8 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 transition-colors shadow-inner"></div>
        </label>
      </div>

      {/* Store Profile */}
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${formData.isDeactivated ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Store size={22} /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Store Profile</h2>
              <p className="text-xs text-slate-500 font-medium">Public details visible to customers</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-3 w-full sm:w-auto">
            <button type="button" onClick={handleCopyLink} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-600">
              {copied ? <CheckCircle2 size={16} className="text-emerald-500"/> : <Copy size={16}/>}
            </button>
            <span className="text-xs font-medium text-slate-500 truncate max-w-[150px]">
              indiafy.com/{formData.name.toLowerCase().replace(/\s+/g, '-')}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* FUNCTIONAL LOGO UPLOAD (Hover Camera Removed) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div 
              className="relative cursor-pointer shrink-0" 
              onClick={() => fileInputRef.current?.click()}
            >
              {/* If logo exists, show image. Else show initials */}
              {formData.logo ? (
                 <img src={formData.logo} alt="Store Logo" className="w-24 h-24 rounded-2xl object-cover shadow-inner border border-slate-200" />
              ) : (
                 <div className="w-24 h-24 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-inner">
                   {formData.initials}
                 </div>
              )}
            </div>
            
            {/* Hidden Input */}
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Store Logo</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-sm leading-relaxed">Upload a square image. Recommended size is 256x256 pixels. Maximum file size is 2MB.</p>
              <div className="flex gap-3">
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                   Upload New
                 </button>
                 {formData.logo && (
                   <button type="button" onClick={handleRemoveLogo} className="px-5 py-2.5 bg-white border border-slate-200 text-red-600 font-bold text-xs rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm flex items-center gap-1.5">
                     <Trash2 size={14}/> Remove
                   </button>
                 )}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <InputGroup label="Store Display Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. Jai Store" />
            <InputGroup label="GSTIN (Optional)" value={formData.gstin} onChange={(e) => handleChange('gstin', e.target.value)} placeholder="Enter 15-digit GSTIN" />
            <InputGroup label="Contact Email" icon={Mail} type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
            <InputGroup label="Support Phone" icon={Phone} type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
        </div>
      </div>

      {/* --- BANK DETAILS --- */}
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${formData.isDeactivated ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Landmark size={22} /></div>
            <div>
               <h2 className="text-lg font-bold text-slate-900">Bank & Settlement</h2>
               <p className="text-xs text-slate-500 font-medium">Where your daily payouts are sent</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-200 w-fit"><Shield size={14}/> Verified Account</span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <InputGroup label="Account Holder Name" value={formData.accountName} onChange={(e) => handleChange('accountName', e.target.value)} placeholder="Name exactly as on bank account" />
            <InputGroup label="Bank Name" icon={Building} value={formData.bankName} onChange={(e) => handleChange('bankName', e.target.value)} placeholder="e.g. HDFC Bank, SBI..." />
            <InputGroup label="Account Number" type="password" value={formData.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} placeholder="Enter account number" />
            <InputGroup label="IFSC Code" value={formData.ifsc} onChange={(e) => handleChange('ifsc', e.target.value)} placeholder="e.g. HDFC0001234" />
          </div>
        </div>
      </div>

      {/* --- LOCATION --- */}
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${formData.isDeactivated ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><MapPin size={22} /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pickup Location</h2>
            <p className="text-xs text-slate-500 font-medium">Where riders will collect orders</p>
          </div>
        </div>
        <div className="p-6 max-w-2xl">
          <InputGroup multiline={true} value={formData.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Enter complete building, street, and sector details..." />
        </div>
      </div>

      {/* --- PREFERENCES --- */}
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${formData.isDeactivated ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Bell size={22} /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Preferences</h2>
            <p className="text-xs text-slate-500 font-medium">Customize your dashboard experience</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50/30 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle label="Instant Order Alerts" description="Receive push notifications for new incoming orders." checked={formData.orderAlerts} onChange={(e) => handleChange('orderAlerts', e.target.checked)} />
          <Toggle label="Auto-Accept Mode" description="Automatically accept orders (skips Inbox page)." checked={formData.autoAccept} onChange={(e) => handleChange('autoAccept', e.target.checked)} />
        </div>
      </div>

      {/* --- DANGER ZONE --- */}
      <div className={`mt-10 p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm transition-colors duration-300 ${formData.isDeactivated ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
        <div className="flex items-start gap-3">
          {formData.isDeactivated ? <Store className="text-emerald-500 shrink-0 mt-0.5" size={24} /> : <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={24} />}
          <div>
            <h3 className={`font-bold text-lg ${formData.isDeactivated ? 'text-emerald-800' : 'text-red-800'}`}>
              {formData.isDeactivated ? 'Reactivate Store' : 'Deactivate Store'}
            </h3>
            <p className={`text-sm font-medium mt-1 max-w-lg leading-relaxed ${formData.isDeactivated ? 'text-emerald-700/80' : 'text-red-600/90'}`}>
              {formData.isDeactivated 
                ? "Your store is currently offline. Reactivate it now to start receiving orders and accepting payments immediately." 
                : "Temporarily hide your store from customers. You will not receive any new orders. You can reactivate at any time."}
            </p>
          </div>
        </div>
        <button 
          type="button" 
          onClick={handleToggleDeactivation}
          className={`px-6 py-3 font-bold text-sm rounded-xl transition-all shadow-sm shrink-0 border ${
            formData.isDeactivated 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500' 
              : 'bg-white border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600'
          }`}
        >
          {formData.isDeactivated ? 'Reactivate Store Now' : 'Deactivate Store'}
        </button>
      </div>

    </form>
  );
}