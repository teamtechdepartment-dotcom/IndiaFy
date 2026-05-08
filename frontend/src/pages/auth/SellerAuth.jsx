

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useSellerAuthStore } from '../../store/sellerAuthStore';
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
  const loginAuth = useSellerAuthStore((state) => state.login);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    sellerType: 'Retail', bizType: 'individual', bizName: '', gstin: '', pan: '', address: '', city: '', state: '', pincode: '',
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
          navigate('/seller-hub');
        }
      } catch(err) {
        console.error("Seller login error:", err);
        const msg = err.response?.data?.message || err.message || "Login failed";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const res = await axiosInstance.post('/seller/auth/signup', formData);
        if (res.success || res.statusCode === 200) {
          toast.success("Account created! Please log in.");
          setIsLogin(true);
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

              {/* Form Headers */}
              <div className={`${isLogin ? 'mb-10' : 'mb-14'} text-center sm:text-left shrink-0`}>
                {isLogin ? (
                  <div className="animate-in fade-in duration-500 space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
                    <p className="text-slate-500 font-medium text-base sm:text-lg">Enter your details to access your dashboard.</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500 space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Create Seller Account</h2>
                    <p className="text-slate-500 font-medium text-base sm:text-lg">Set up your master account to manage your businesses.</p>
                  </div>
                )}
              </div>

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
                  /* REGISTRATION FORM */
                  <form onSubmit={handleSubmit} className="space-y-7 animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                      <InputField label="First Name" icon={User} name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
                      <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
                    </div>
                    <InputField label="Email Address" icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@business.com" required />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                      <InputField label="Password" icon={Lock} name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 6 chars" required />
                      <InputField label="Confirm Password" icon={Lock} name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter" required />
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-4 mt-8 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 h-[60px]">
                      {isLoading ? <><Loader2 size={20} className="animate-spin" /> Creating Account...</> : "Create Seller Account"}
                    </button>
                  </form>
                )}
              </div>

              {/* FIXED TOGGLE TEXT */}
              <div className={`${isLogin ? 'mt-8 sm:mt-10' : 'mt-10 pb-10'} shrink-0`}>
                <p className="text-center text-sm font-medium text-slate-500">
                  {isLogin ? "Don't have an account yet?" : "Already have a seller account?"}{" "}
                  <button type="button" onClick={toggleAuthMode} className="text-blue-600 font-bold hover:text-blue-800 transition-colors ml-1 focus:outline-none focus:underline underline-offset-4">
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
              
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