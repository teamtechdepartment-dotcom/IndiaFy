

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { 
  Mail, Lock, Store, User, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, 
  ShieldCheck, Zap, Phone, MapPin, Building, CreditCard, CheckCircle, 
  X 
} from 'lucide-react';


const InputField = ({ label, icon: Icon, required, className = "", ...props }) => (
  <div className={`space-y-2 w-full ${className}`}>
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
      {label} {required && <span className="text-blue-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />}
      <input 
        {...props} 
        className={`w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl py-4 ${Icon ? 'pl-12' : 'pl-5'} pr-5 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-blue-500/10`} 
      />
    </div>
  </div>
);

export default function SellerAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  
  const navigate = useNavigate();
  const loginAuth = useAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    bizType: 'individual', bizName: '', gstin: '', pan: '', address: '', city: '', state: '', pincode: '',
    accHolder: '', accNumber: '', ifsc: '', bankName: '',
    storeName: '', storeDesc: '', tags: [],
    cod: true, whatsapp: true, terms1: false, terms2: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (!formData.tags.includes(newTag)) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, index) => index !== indexToRemove) });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (isLogin) {
      setIsLoading(true);
      try {
        const res = await axiosInstance.post('/seller/auth/login', {
          email: formData.email,
          password: formData.password
        });
        // axios interceptor already unwraps response.data
        // so res = { statusCode, data, message, success }
        const userData = res.data || res;
        if (userData) {
          loginAuth(userData, userData.accessToken);
          toast.success("Seller Login Successful!");
          navigate('/dashboard');
        }
      } catch(err) {
        console.error("Seller login error:", err);
        const msg = err.response?.data?.message || err.message || "Login failed";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!formData.terms1 || !formData.terms2) {
        toast.warning("Please agree to all terms to submit your application.");
        return;
      }
      setIsLoading(true);
      try {
        const res = await axiosInstance.post('/seller/auth/signup', formData);
        if (res.success || res.statusCode === 200) {
          toast.success("Registration Successful!");
          setCurrentStep(6);
        }
      } catch(err) {
        toast.error(err.response?.data?.message || "Registration failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setCurrentStep(1);
  };


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center lg:p-8 font-sans">
      
      <div className="relative w-full h-[100dvh] lg:h-[92vh] lg:min-h-[700px] lg:max-w-6xl bg-white lg:rounded-[2.5rem] lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex">
        
        {/* --- LEFT PANEL: BRANDING (Hidden on Mobile) --- */}
        <div 
          className={`hidden lg:flex absolute top-0 left-0 w-1/2 h-full bg-[#0B1120] z-20 flex-col justify-between p-14 shadow-2xl transition-transform duration-[800ms] ease-in-out ${
            isLogin ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[20%] w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[10%] -right-[10%] w-80 h-80 bg-indigo-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          </div>

          {/* DESKTOP LOGO IMAGE */}
          <div className="relative z-10 flex items-center">
            <img src="/Images/logo.png" alt="Indiafy Logo" className="h-12 w-auto object-contain" />
          </div>

          <div className="relative z-10 w-full max-w-md space-y-8">
            {isLogin ? (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                  <ShieldCheck size={16} /> Secure Dashboard
                </div>
                <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.15] mb-8 tracking-tight">
                  Your local commerce <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">command center.</span>
                </h1>
                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                  Take absolute control of your business. Monitor live fulfillments, track hyper-local trends, and review daily settlements.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
                  <Zap size={16} /> Zero Setup Fees
                </div>
                <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.15] mb-8 tracking-tight">
                  Dominate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">local market.</span>
                </h1>
                <p className="text-lg text-slate-400 font-medium leading-relaxed">
                  Transform your offline store into a digital powerhouse. Register in minutes and reach thousands of customers across your city.
                </p>
              </div>
            )}
          </div>

          <div className="relative z-10 text-sm font-medium text-slate-600">
            © {new Date().getFullYear()} Indiafy Technologies.
          </div>
        </div>

        {/* --- RIGHT PANEL: SCROLLABLE FORMS --- */}
        <div 
          className={`absolute top-0 left-0 w-full lg:w-1/2 h-full bg-white z-10 transition-transform duration-[800ms] ease-in-out ${
            isLogin ? "translate-x-0 lg:translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="w-full h-full overflow-y-auto custom-scrollbar bg-white relative">
            
            <div className={`w-full max-w-xl mx-auto px-6 sm:px-12 lg:px-16 transition-all duration-300 ${
              isLogin || currentStep === 6 
                ? 'min-h-full flex flex-col justify-center py-8' 
                : 'flex flex-col min-h-full pt-12 pb-48 sm:pb-40' 
            }`}>
              
              {/* MOBILE LOGO IMAGE */}
              <div className="flex lg:hidden items-center justify-center mb-8 sm:mb-12 pb-6 border-b border-slate-100 shrink-0">
                <img src="/Images/logo.png" alt="Indiafy Logo" className="h-10 sm:h-12 w-auto object-contain" />
              </div>

              {/* Form Headers & Stepper */}
              {currentStep !== 6 && (
                <div className={`${isLogin ? 'mb-10' : 'mb-14'} text-center sm:text-left shrink-0`}>
                  {isLogin ? (
                    <div className="animate-in fade-in duration-500 space-y-3">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
                      <p className="text-slate-500 font-medium text-base sm:text-lg">Enter your details to access your dashboard.</p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-500 space-y-3">
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Seller Registration</h2>
                      <p className="text-slate-500 font-medium text-base sm:text-lg">Complete the steps below to set up your storefront.</p>
                      
                      {/* Ultra-Spacious Stepper */}
                      <div className="flex items-center justify-between mt-12 mb-4 relative max-w-md mx-auto sm:mx-0">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full -z-10"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-blue-500 rounded-full -z-10 transition-all duration-700 ease-out" style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>
                        
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div key={step} className="bg-white px-2 z-10">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold border-2 transition-all duration-500 ${
                              currentStep === step ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.4)] scale-110' : 
                              currentStep > step ? 'border-blue-500 bg-white text-blue-500' : 'border-slate-200 bg-slate-50 text-slate-400'
                            }`}>
                              {currentStep > step ? <CheckCircle size={20} /> : step}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Fields Area */}
              <div className="w-full shrink-0">
                {isLogin ? (
                  /* LOGIN FORM */
                  <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <InputField 
                      label="Email Address" 
                      icon={Mail} 
                      name="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="store@example.com" 
                      required 
                    />
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pl-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                        <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-800">Forgot password?</button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input 
                          required 
                          name="password" 
                          type={showPassword ? "text" : "password"} 
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••" 
                          className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-12 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-blue-500/10" 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-4 mt-10 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 disabled:opacity-70 h-[60px]">
                      {isLoading ? <><Loader2 size={20} className="animate-spin" /> Authenticating...</> : <>Secure Login <ArrowRight size={20} className="ml-1" /></>}
                    </button>
                  </form>
                ) : (
                  /* MULTI-STEP REGISTRATION FORM */
                  <div className="w-full relative min-h-[400px]">
                    
                    {/* STEP 1: Account */}
                    {currentStep === 1 && (
                      <div className="space-y-7 animate-in slide-in-from-right-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                          <InputField label="First Name" icon={User} name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Rajesh" required />
                          <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Kumar" required />
                        </div>
                        <InputField label="Email Address" icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@business.com" required />
                        <InputField label="Mobile Number" icon={Phone} name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" required />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                          <InputField label="Password" icon={Lock} name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 8 chars" required />
                          <InputField label="Confirm Password" icon={Lock} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter" required />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Business */}
                    {currentStep === 2 && (
                      <div className="space-y-7 animate-in slide-in-from-right-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Business Type <span className="text-blue-500">*</span></label>
                          <div className="relative">
                            <select name="bizType" value={formData.bizType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none">
                              <option value="individual">Individual / Sole Proprietor</option>
                              <option value="partnership">Partnership Firm</option>
                              <option value="pvt">Private Limited Company</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                          </div>
                        </div>
                        <InputField label="Legal Business Name" icon={Building} name="bizName" value={formData.bizName} onChange={handleChange} placeholder="As per GST certificate" required />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                          <InputField label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" required />
                          <InputField label="PAN Number" name="pan" value={formData.pan} onChange={handleChange} placeholder="AAAAA0000A" required />
                        </div>
                        <InputField label="Registered Address" icon={MapPin} name="address" value={formData.address} onChange={handleChange} placeholder="Flat, Street, Area" required />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                          <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" className="col-span-1" required />
                          <InputField label="State" name="state" value={formData.state} onChange={handleChange} placeholder="Maharashtra" className="col-span-1" required />
                          <InputField label="PIN" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="400001" className="col-span-2 sm:col-span-1" required />
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Bank */}
                    {currentStep === 3 && (
                      <div className="space-y-7 animate-in slide-in-from-right-4">
                        <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl flex gap-4 text-emerald-800 text-sm mb-4 shadow-sm">
                          <ShieldCheck className="shrink-0 mt-0.5 text-emerald-500" size={22} />
                          <p className="leading-relaxed">Bank details are 256-bit encrypted and used solely for daily automated settlements.</p>
                        </div>
                        <InputField label="Account Holder Name" icon={User} name="accHolder" value={formData.accHolder} onChange={handleChange} placeholder="As per bank records" required />
                        <InputField label="Account Number" icon={CreditCard} name="accNumber" type="password" value={formData.accNumber} onChange={handleChange} placeholder="Enter account number" required />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                          <InputField label="IFSC Code" name="ifsc" value={formData.ifsc} onChange={handleChange} placeholder="HDFC0001234" required />
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Bank Name <span className="text-blue-500">*</span></label>
                            <div className="relative">
                              <select name="bankName" value={formData.bankName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none">
                                <option value="">Select Bank</option>
                                <option value="HDFC">HDFC Bank</option>
                                <option value="ICICI">ICICI Bank</option>
                                <option value="SBI">State Bank of India</option>
                              </select>
                              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Store */}
                    {currentStep === 4 && (
                      <div className="space-y-7 animate-in slide-in-from-right-4">
                        <InputField label="Store / Brand Name" icon={Store} name="storeName" value={formData.storeName} onChange={handleChange} placeholder="My Awesome Store" required />
                        
                        <div className="space-y-2 w-full">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Store Description <span className="text-blue-500">*</span></label>
                          <textarea name="storeDesc" value={formData.storeDesc} onChange={handleChange} placeholder="Tell buyers what makes your store special..." rows="4" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl py-4 px-5 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm focus:ring-4 focus:ring-blue-500/10 resize-none"></textarea>
                        </div>

                        <div className="space-y-2 w-full">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Tags (Press Enter)</label>
                          <div className="w-full bg-slate-50 focus-within:bg-white border border-slate-200 focus-within:border-blue-500 rounded-2xl p-4 min-h-[70px] flex flex-wrap gap-2.5 items-center transition-all shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10">
                            {formData.tags.map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2">
                                {tag} <button type="button" onClick={() => removeTag(index)} className="hover:text-blue-900 focus:outline-none"><X size={14} /></button>
                              </span>
                            ))}
                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="e.g. Organic, Handmade" className="bg-transparent border-none outline-none text-sm font-medium flex-1 min-w-[150px] py-1" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: Review */}
                    {currentStep === 5 && (
                      <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 sm:p-8 space-y-7">
                          <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3 mb-4">Account Details</h3>
                            <div className="grid grid-cols-2 text-sm gap-y-4">
                              <span className="text-slate-500">Name:</span><span className="font-semibold text-slate-900 text-right">{formData.firstName} {formData.lastName}</span>
                              <span className="text-slate-500">Email:</span><span className="font-semibold text-slate-900 text-right truncate pl-2">{formData.email}</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-3 mb-4">Business Details</h3>
                            <div className="grid grid-cols-2 text-sm gap-y-4">
                              <span className="text-slate-500">Legal Name:</span><span className="font-semibold text-slate-900 text-right truncate pl-2">{formData.bizName || '—'}</span>
                              <span className="text-slate-500">GSTIN:</span><span className="font-semibold text-slate-900 text-right">{formData.gstin || '—'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-5 pt-4">
                          <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                              <input type="checkbox" name="terms1" checked={formData.terms1} onChange={handleChange} className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-md bg-white checked:bg-blue-500 checked:border-blue-500 transition-colors" />
                              <CheckCircle size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">I confirm that all information provided is accurate and I am legally authorized to register this business.</span>
                          </label>
                          <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                              <input type="checkbox" name="terms2" checked={formData.terms2} onChange={handleChange} className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-md bg-white checked:bg-blue-500 checked:border-blue-500 transition-colors" />
                              <CheckCircle size={16} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">I agree to Indiafy's <a href="#" className="text-blue-600 font-bold hover:underline">Seller Terms</a> and <a href="#" className="text-blue-600 font-bold hover:underline">Privacy Policy</a>.</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* SUCCESS SCREEN */}
                    {currentStep === 6 && (
                      <div className="text-center py-16 animate-in zoom-in-95 duration-500">
                        <div className="w-28 h-28 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                          <CheckCircle size={56} />
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-5">Application Submitted!</h2>
                        <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">Your seller registration is under review. We will verify your documents and notify you within 24-48 hours.</p>
                        
                        <div className="inline-block bg-slate-50 border border-slate-200 rounded-2xl px-10 py-5 mb-12 shadow-sm">
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-2">Application ID</span>
                          <span className="text-2xl font-mono font-bold text-slate-800 tracking-wider">IND-8A9F2C</span>
                        </div>

                        <button onClick={() => { setIsLogin(true); setCurrentStep(1); }} className="w-full h-[60px] bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]">
                          Return to Login
                        </button>
                      </div>
                    )}

                    {/* NAVIGATION BUTTONS */}
                    {currentStep < 6 && (
                      <div className="flex items-center gap-4 sm:gap-6 mt-14 pt-8 border-t border-slate-100 shrink-0">
                        {currentStep > 1 && (
                          <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="flex items-center justify-center gap-2 h-[60px] px-6 sm:px-8 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-base hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98]">
                            <ArrowLeft size={20} /> <span className="hidden sm:inline">Back</span>
                          </button>
                        )}
                        
                        {currentStep < 5 ? (
                          <button type="button" onClick={() => setCurrentStep(prev => prev + 1)} className="flex-1 flex items-center justify-center gap-3 h-[60px] bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]">
                            Continue <ArrowRight size={20} />
                          </button>
                        ) : (
                          <button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1 flex items-center justify-center gap-3 h-[60px] bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70">
                            {isLoading ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : "Submit Application"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* FIXED TOGGLE TEXT - Conditional margin for Login vs Registration */}
              {currentStep !== 6 && (
                <div className={`${isLogin ? 'mt-8 sm:mt-10' : 'mt-14 pb-20'} shrink-0`}>
                  <p className="text-center text-sm font-medium text-slate-500">
                    {isLogin ? "Don't have an account yet?" : "Already have a seller account?"}{" "}
                    <button type="button" onClick={toggleAuthMode} className="text-blue-600 font-bold hover:text-blue-800 transition-colors ml-1 focus:outline-none focus:underline underline-offset-4">
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
        .custom-scrollbar { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
      `}} />
    </div>
  );
}