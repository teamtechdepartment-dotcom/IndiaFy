/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEOHead from "../../components/seo/SEOHead";
import { Mail, Lock, Eye, EyeOff, Store, Banknote, Package, Boxes, LineChart, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useSellerAuthStore } from "../../store/sellerAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import GoogleAuthModal from "../../components/auth/GoogleAuthModal";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

const FloatingNode = ({ icon: Icon, delay, x, y, duration = 4, size = 20 }) => (
  <motion.div
    initial={{ y, x, opacity: 0 }}
    animate={{ 
      y: [y - 8, y + 8, y - 8], 
      opacity: 1 
    }}
    transition={{ 
      y: { repeat: Infinity, duration, ease: "easeInOut" },
      opacity: { duration: 1, delay }
    }}
    className="absolute bg-white border border-brand-accent/20 p-2.5 rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.12)] flex items-center justify-center text-brand-accent"
    style={{ left: x, top: y }}
  >
    <Icon size={size} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
  </motion.div>
);

const SellerLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const loginAuth = useSellerAuthStore((state) => state.login);
  const clearSession = useSellerAuthStore((state) => state.clearSession);

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleAuthSuccess = async (accountData) => {
    setGoogleLoading(true);
    try {
      const res = await axiosInstance.post("/seller/auth/google-login", accountData);
      const sellerData = res?.seller || res?.data || res;
      const accessToken = res?.token || res?.accessToken || sellerData?.accessToken || null;
      const refreshToken = res?.refreshToken || sellerData?.refreshToken || null;

      if (sellerData && (sellerData._id || sellerData.email)) {
        clearSession();
        loginAuth(sellerData, accessToken, refreshToken);
        toast.success(`Welcome to Seller Dashboard, ${sellerData.name || accountData.name}! 🏪`);
        setIsGoogleModalOpen(false);

        try {
          const statusRes = await axiosInstance.get("/seller/node/status");
          if (statusRes && statusRes.status === "ACTIVE" && statusRes.nodeId) {
            navigate(`/seller/dashboard/${statusRes.nodeId}/dashboard`, { replace: true });
          } else {
            const searchParams = new URLSearchParams(window.location.search);
            const redirectPath = searchParams.get("redirect") || "/seller-hub";
            navigate(redirectPath, { replace: true });
          }
        } catch (err) {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectPath = searchParams.get("redirect") || "/seller-hub";
          navigate(redirectPath, { replace: true });
        }
      } else {
        toast.error(res?.message || "Google login failed");
      }
    } catch (err) {
      console.error("Seller Google login error:", err);
      toast.error(err?.response?.data?.message || "Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const onLogin = async (data) => {
    setLoading(true);
    try {
      // axiosInstance interceptor unwraps response.data, so res can be the ApiResponse envelope or custom login envelope
      const res = await axiosInstance.post('/seller/auth/login', data);

      // Support all potential shapes of the response
      const sellerData = res?.seller || res?.data;
      const accessToken = res?.token || res?.accessToken || sellerData?.accessToken || null;
      const refreshToken = res?.refreshToken || sellerData?.refreshToken || null;

      if (sellerData?._id) {
        // Clear any stale persisted session before writing the fresh one
        clearSession();
        loginAuth(sellerData, accessToken, refreshToken);
        
        // Fetch latest node status to determine redirect target
        try {
          const statusRes = await axiosInstance.get("/seller/node/status");
          if (statusRes.success && statusRes.status === "ACTIVE" && statusRes.nodeId) {
            navigate(`/seller/dashboard/${statusRes.nodeId}/dashboard`, { replace: true });
          } else {
            const searchParams = new URLSearchParams(window.location.search);
            const redirectPath = searchParams.get("redirect") || "/seller-hub";
            navigate(redirectPath, { replace: true });
          }
        } catch (err) {
          console.error("Failed to check node status on login:", err);
          const searchParams = new URLSearchParams(window.location.search);
          const redirectPath = searchParams.get("redirect") || "/seller-hub";
          navigate(redirectPath, { replace: true });
        }
      } else {
        toast.error("Login failed — invalid response. Please try again.");
      }
    } catch(_err) {
      console.error("Seller login error:", _err);
      const status = _err?.response?.status;
      const message = _err?.response?.data?.message || _err?.message || "Login failed. Check your credentials.";
      
      // STEP 10: Display backend error, NOT "Incorrect Password" unless password comparison actually fails
      if (status === 401) {
        toast.error("Incorrect password. Please try again.");
      } else if (status === 404) {
        toast.error("Seller account not found.");
      } else if (status === 403) {
        toast.error(message || "Seller account pending approval or suspended.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-6 sm:p-8 font-sans transition-colors duration-500 relative overflow-hidden">
      <SEOHead title="Seller Login | Indiafy" noindex={true} />
      
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[20%] w-[50vw] h-[50vw] bg-gradient-to-br from-emerald-100/60 to-teal-100/40 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-[10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-3xl -z-0" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[1100px] bg-white backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
      >
        {/* --- BRANDING / ILLUSTRATION SIDE --- */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-r border-slate-100 relative flex-col justify-between p-12 overflow-hidden shrink-0">
          
          <div className="relative z-20">
            <div className="flex items-center gap-3 mb-8">
              <img src="/Images/logo.png" alt="Indiafy Logo" className="h-9 object-contain" />
              <span className="text-brand-accent font-black uppercase tracking-[0.2em] text-[10px] border border-brand-accent/30 px-2 py-1 rounded bg-brand-accent/5">Seller Central</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-[1.2] mb-4 text-brand-primary">
              Grow Your <br />
              <span className="text-brand-accent">Business.</span><br />
              Sell Smarter.
            </h2>
            <p className="text-brand-text-secondary font-medium text-sm max-w-[280px] leading-relaxed">
              Manage products, receive orders, track analytics, and scale your local business with Indiafy.
            </p>
          </div>

          {/* Network Ecosystem Visualization Container */}
          <div className="relative h-48 w-full mt-auto mb-8">
             <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 300" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                   <stop offset="50%" stopColor="#10B981" stopOpacity="0.8" />
                   <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
                 </linearGradient>
               </defs>
               <motion.path 
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 2.5, ease: "easeInOut" }}
                 d="M 40 100 Q 150 20 280 120 T 360 80" stroke="url(#routeGrad2)" strokeWidth="2" fill="none" strokeDasharray="4,6" 
               />
               <motion.path 
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
                 d="M 60 160 Q 150 200 250 140 T 360 160" stroke="url(#routeGrad2)" strokeWidth="2" fill="none" strokeDasharray="4,6" 
               />
             </svg>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-brand-accent/10 rounded-full blur-[40px]"></div>
             
             {/* Floating Elements */}
             <FloatingNode icon={Store} delay={0.2} x="5%" y="25%" duration={3.5} />
             <FloatingNode icon={Banknote} delay={0.5} x="70%" y="15%" duration={4} size={24} />
             <FloatingNode icon={LineChart} delay={0.7} x="45%" y="45%" duration={3.8} size={28} />
             <FloatingNode icon={Package} delay={0.9} x="20%" y="75%" duration={4.2} />
             <FloatingNode icon={Users} delay={1.1} x="80%" y="65%" duration={3.5} />
             <FloatingNode icon={Boxes} delay={1.3} x="35%" y="10%" duration={3.9} />
          </div>

          {/* Statistics Section */}
          <div className="relative z-20 grid grid-cols-2 gap-y-4 gap-x-2 pt-6 border-t border-slate-200">
            <div>
              <div className="text-lg font-bold text-brand-primary flex items-center gap-1">500+</div>
              <div className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider mt-0.5">Active Sellers</div>
            </div>
            <div>
              <div className="text-lg font-bold text-brand-primary flex items-center gap-1">50+</div>
              <div className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider mt-0.5">Cities</div>
            </div>
            <div>
              <div className="text-lg font-bold text-brand-primary flex items-center gap-1">10K+</div>
              <div className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider mt-0.5">Orders Monthly</div>
            </div>
            <div>
              <div className="text-lg font-bold text-brand-primary flex items-center gap-1">₹50L+</div>
              <div className="text-[10px] text-brand-text-secondary font-bold uppercase tracking-wider mt-0.5">Seller Revenue</div>
            </div>
          </div>
        </div>

        {/* --- FORM SIDE --- */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 py-10 sm:px-14 lg:px-20 bg-white">
          <div className="w-full max-w-[480px] mx-auto space-y-8">
            
            <div className="flex justify-between items-center lg:hidden mb-4">
              <img src="/Images/logo.png" alt="Indiafy" className="h-8 object-contain" />
              <span className="text-brand-accent font-black uppercase tracking-[0.2em] text-[10px] border border-brand-accent/30 px-2 py-1 rounded bg-brand-accent/5">Seller</span>
            </div>

            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-brand-primary tracking-tight">
                Seller Login
              </h1>
              <p className="text-[15px] font-medium text-brand-text-secondary">
                Access your Seller Dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
              
              {/* Email Field */}
              <div className="relative group">
                <div 
                  className={`relative rounded-xl border transition-all duration-300 bg-slate-50 overflow-hidden
                    ${errors.email ? 'border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.1)]' 
                    : focusedField === 'email' ? 'border-brand-accent shadow-[0_0_0_2px_rgba(16,185,129,0.1)]' 
                    : 'border-slate-200 hover:border-slate-300'}
                  `}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-[20px] w-[20px] transition-colors ${focusedField === 'email' ? 'text-brand-accent' : 'text-slate-400'}`} />
                  </div>
                  
                  <label 
                    className={`absolute left-[44px] top-[14px] text-slate-500 font-medium origin-left pointer-events-none transition-all duration-200
                      ${(focusedField === 'email' || emailValue) ? 'translate-y-[-12px] scale-75 opacity-100' : 'translate-y-0 scale-100 opacity-80'}`}
                  >
                    Business Email
                  </label>
                  
                  <input
                    type="email"
                    {...register("email", {
                      onBlur: () => setFocusedField(null)
                    })}
                    onFocus={() => setFocusedField('email')}
                    className="w-full bg-transparent pt-[24px] pb-2 pl-[44px] pr-4 text-[15px] font-bold text-brand-primary outline-none"
                    autoComplete="email"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="text-[12px] text-red-500 font-semibold mt-1.5 ml-1 block"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div className="relative group pt-1">
                <div 
                  className={`relative rounded-xl border transition-all duration-300 bg-slate-50 overflow-hidden
                    ${errors.password ? 'border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.1)]' 
                    : focusedField === 'password' ? 'border-brand-accent shadow-[0_0_0_2px_rgba(16,185,129,0.1)]' 
                    : 'border-slate-200 hover:border-slate-300'}
                  `}
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-[20px] w-[20px] transition-colors ${focusedField === 'password' ? 'text-brand-accent' : 'text-slate-400'}`} />
                  </div>
                  
                  <label 
                    className={`absolute left-[44px] top-[14px] text-slate-500 font-medium origin-left pointer-events-none transition-all duration-200
                      ${(focusedField === 'password' || passwordValue) ? 'translate-y-[-12px] scale-75 opacity-100' : 'translate-y-0 scale-100 opacity-80'}`}
                  >
                    Password
                  </label>
                  
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      onBlur: () => setFocusedField(null)
                    })}
                    onFocus={() => setFocusedField('password')}
                    className="w-full bg-transparent pt-[24px] pb-2 pl-[44px] pr-12 text-[15px] font-bold text-brand-primary outline-none"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-accent p-2 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="text-[12px] text-red-500 font-semibold mt-1.5 ml-1 block"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end pt-2 pb-2">
                <Link
                  to="/seller/forgot-password"
                  className="text-[13px] font-bold text-brand-accent hover:text-brand-accent-hover transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl py-4 font-bold text-[15px] transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing In..." : "Login to Dashboard"}
                </motion.button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="mx-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest">Or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="w-full bg-white border border-slate-200 text-brand-primary rounded-xl py-4 font-bold text-[15px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </motion.button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-[14px] font-medium text-brand-text-secondary">
                New Seller?{" "}
                <Link
                  to="/seller/signup"
                  className="text-brand-accent font-bold hover:underline underline-offset-4"
                >
                  Create Seller Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => !googleLoading && setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAuthSuccess}
        role="seller"
        loading={googleLoading}
      />
    </div>
  );
};

export default SellerLogin;
