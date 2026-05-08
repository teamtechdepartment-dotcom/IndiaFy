import React, { useState } from 'react';
import { Store, Warehouse, Zap, Home, Monitor, UserCheck, X, ArrowRight, UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function StoreCreationWizard({ nodeType, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    
    // Local fields
    deliveryRadius: '5',
    
    // Wholesale fields
    gstin: '',
    warehouseLocation: '',
    minOrderQty: '10',
    minOrderValue: '5000',
    
    // Quick Commerce fields
    activeSectors: '',
    dispatchSpeed: '10 mins'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getThemeColor = () => {
    switch (nodeType) {
      case 'wholesale': return 'bg-amber-500 text-white';
      case 'quick-commerce': return 'bg-indigo-500 text-white';
      case 'home-essentials': return 'bg-emerald-500 text-white';
      case 'electronics': return 'bg-blue-500 text-white';
      case 'personal-care': return 'bg-rose-500 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  const getNodeIcon = () => {
    switch (nodeType) {
      case 'wholesale': return <Warehouse size={28} className="text-amber-500" />;
      case 'quick-commerce': return <Zap size={28} className="text-indigo-500" />;
      case 'home-essentials': return <Home size={28} className="text-emerald-500" />;
      case 'electronics': return <Monitor size={28} className="text-blue-500" />;
      case 'personal-care': return <UserCheck size={28} className="text-rose-500" />;
      default: return <Store size={28} className="text-blue-600" />;
    }
  };

  const getNodeTitle = () => {
    return nodeType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    // Simulate API Call for creating the node store
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`${getNodeTitle()} store activated successfully!`);
      onSuccess(nodeType, formData);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
              {getNodeIcon()}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Activate {getNodeTitle()}</h2>
              <p className="text-sm font-medium text-slate-500">Step {step} of 2 • Store Profile Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100">
          <div className={`h-full ${getThemeColor()} transition-all duration-500 ease-out`} style={{ width: step === 1 ? '50%' : '100%' }}></div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 mb-3 cursor-pointer hover:bg-slate-200 transition-colors">
                  <UploadCloud size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Upload Store Logo</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store / Business Name</label>
                  <input required name="businessName" value={formData.businessName} onChange={handleInputChange} type="text" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-slate-900/10 outline-none transition-all" placeholder="Enter your registered business name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Email</label>
                  <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-slate-900/10 outline-none transition-all" placeholder="store@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-slate-900/10 outline-none transition-all" placeholder="+91" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Operating Address</label>
                <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-slate-900/10 outline-none transition-all resize-none" placeholder="Enter complete physical address"></textarea>
              </div>

              {/* DYNAMIC FIELDS BASED ON NODE */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                {nodeType === 'wholesale' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GSTIN Number</label>
                      <input required name="gstin" value={formData.gstin} onChange={handleInputChange} type="text" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none uppercase" placeholder="22AAAAA0000A1Z5" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Warehouse</label>
                      <input required name="warehouseLocation" value={formData.warehouseLocation} onChange={handleInputChange} type="text" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none" placeholder="e.g. Sector 12 Depot" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Global Min Order Qty</label>
                      <input required name="minOrderQty" value={formData.minOrderQty} onChange={handleInputChange} type="number" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Min Order Value (₹)</label>
                      <input required name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} type="number" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none" />
                    </div>
                  </>
                )}

                {nodeType === 'quick-commerce' && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Dark Store Sectors</label>
                      <input required name="activeSectors" value={formData.activeSectors} onChange={handleInputChange} type="text" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="e.g. Sector 1, Sector 2" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dispatch SLA</label>
                      <select name="dispatchSpeed" value={formData.dispatchSpeed} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none">
                        <option>10 mins</option><option>15 mins</option><option>30 mins</option>
                      </select>
                    </div>
                  </>
                )}

                {(nodeType === 'local' || nodeType === 'home-essentials' || nodeType === 'personal-care' || nodeType === 'electronics') && (
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Maximum Delivery Radius (km)</label>
                      <div className="flex items-center gap-4">
                        <input type="range" name="deliveryRadius" value={formData.deliveryRadius} onChange={handleInputChange} min="1" max="25" className="flex-1 accent-blue-600" />
                        <span className="font-black text-slate-900 w-12 text-right">{formData.deliveryRadius} km</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">Back</button>
            ) : (
              <div></div>
            )}
            
            <button type="submit" disabled={isSubmitting} className={`px-8 py-3.5 text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 ${getThemeColor()}`}>
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Provisioning Store...</>
              ) : step === 1 ? (
                <>Next Step <ArrowRight size={18} /></>
              ) : (
                <>Complete Activation <Store size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
