import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEOHead from "../../components/seo/SEOHead";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ChevronLeft,
  Store,
  Truck,
  CreditCard
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCartStore } from "../../store/cartStore";
import { motion, AnimatePresence } from "framer-motion";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      "Password must contain letters and numbers",
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const STEPS = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Account Setup" }
];

const UserSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const loginAuth = useAuthStore((state) => state.login);
  const addToCart = useCartStore((state) => state.addToCart);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit"
  });

  const formValues = watch();

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["firstName", "lastName"]);
    }
    if (isValid) {
      setDirection(1);
      setStep(2);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const onSignup = async (data) => {
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      };

      const res = await axiosInstance.post("/customer/auth/signup", payload);
      if (res.success && res.data) {
        loginAuth(res.data, res.data.accessToken);
        // Removed success toast per user request
        
        const pendingPurchase = localStorage.getItem("pending_purchase");
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect");

        if (pendingPurchase && redirect === "checkout") {
          const { productId, quantity, product } = JSON.parse(pendingPurchase);
          localStorage.removeItem("pending_purchase");
          try {
            await addToCart(productId, quantity);
            navigate("/checkout", { state: { testProduct: product } });
          } catch (_err) {
            navigate("/checkout", { state: { testProduct: product } });
          }
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(res.message || "Signup failed");
      }
    } catch (_err) {
      console.error("Signup error:", _err);
      toast.error(
        _err?.response?.data?.message || _err?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  const renderField = (name, label, icon, type = "text", placeholder) => {
    const isFocused = focusedField === name;
    const hasValue = formValues[name] && formValues[name].length > 0;
    const hasError = errors[name];
    const Icon = icon;

    return (
      <div className="relative group mt-2" key={name}>
        <div 
          className={`relative rounded-xl border transition-all duration-300 bg-slate-50 overflow-hidden
            ${hasError ? 'border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.1)]' 
            : isFocused ? 'border-brand-accent shadow-[0_0_0_2px_rgba(16,185,129,0.1)]' 
            : 'border-slate-200 hover:border-slate-300'}
          `}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className={`h-[20px] w-[20px] transition-colors duration-300 ${isFocused ? 'text-brand-accent' : 'text-slate-400'}`} />
          </div>
          
          <label 
            className={`absolute left-[44px] top-[14px] text-slate-500 font-medium origin-left pointer-events-none transition-all duration-200
              ${(isFocused || hasValue) ? 'translate-y-[-12px] scale-75 opacity-100' : 'translate-y-0 scale-100 opacity-80'}`}
          >
            {label}
          </label>
          
          <input
            type={type === "password" ? (showPassword ? "text" : "password") : type}
            {...register(name, {
              onBlur: () => setFocusedField(null)
            })}
            onFocus={() => setFocusedField(name)}
            className="w-full bg-transparent pt-[24px] pb-2 pl-[44px] pr-12 text-[15px] font-bold text-brand-primary outline-none"
            placeholder={(isFocused || hasValue) ? placeholder : ""}
          />

          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-accent p-2 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        <AnimatePresence>
          {hasError && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="absolute -bottom-5 left-1 text-[11px] text-red-500 font-bold uppercase tracking-wider"
            >
              {errors[name].message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-6 sm:p-8 font-sans transition-colors duration-500 relative overflow-hidden">
      <SEOHead title="Create Account | Indiafy" noindex={true} />
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-gradient-to-br from-emerald-100/60 to-teal-100/40 rounded-full blur-3xl -z-0" />
        <div className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-3xl -z-0" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[1100px] bg-white backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
      >
        {/* --- FORM SIDE --- */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 lg:p-14 flex flex-col relative z-20">
          
          <div className="flex justify-between items-center mb-8">
            <img src="/Images/logo.png" alt="Indiafy" className="h-8 lg:hidden" />
            <div className="hidden lg:block text-brand-text-secondary text-sm font-medium">Join Indiafy</div>
            <Link to="/login" className="text-[13px] font-bold text-brand-accent hover:underline transition-colors">
              Log in instead
            </Link>
          </div>

          <div className="w-full max-w-[480px] mx-auto flex-grow flex flex-col justify-center">
            {/* Progress Indicator */}
            <div className="mb-10">
              <div className="flex justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 rounded-full translate-y-[-50%]"></div>
                <motion.div 
                  className="absolute top-1/2 left-0 h-1 bg-brand-accent -z-10 rounded-full translate-y-[-50%]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((step - 1) / 1) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
                {STEPS.map((s) => (
                  <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2">
                    <motion.div 
                      animate={{
                        backgroundColor: step >= s.id ? '#10B981' : 'transparent',
                        borderColor: step >= s.id ? '#10B981' : '#E2E8F0',
                        color: step >= s.id ? '#FFFFFF' : '#94A3B8'
                      }}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors duration-300"
                    >
                      {step > s.id ? <CheckCircle size={14} /> : s.id}
                    </motion.div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? 'text-brand-primary' : 'text-slate-400'}`}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSignup)} className="space-y-6 relative h-[250px] overflow-visible">
              <AnimatePresence custom={direction} mode="wait">
                
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "tween", duration: 0.3 }}
                    className="space-y-6 absolute inset-0"
                  >
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-brand-primary tracking-tight">Join India's Local Marketplace</h2>
                      <p className="text-sm text-brand-text-secondary font-medium">Let's start with your name.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {renderField("firstName", "First Name", User, "text", "John")}
                      {renderField("lastName", "Last Name", User, "text", "Doe")}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "tween", duration: 0.3 }}
                    className="space-y-6 absolute inset-0"
                  >
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-brand-primary tracking-tight">Account Setup</h2>
                      <p className="text-sm text-brand-text-secondary font-medium">Use a valid email and strong password.</p>
                    </div>
                    <div className="space-y-6">
                      {renderField("email", "Email Address", Mail, "email", "john@example.com")}
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("password", "Password", Lock, "password", "Min 8 chars")}
                        {renderField("confirmPassword", "Confirm", Lock, "password", "Re-enter")}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 pt-4 flex gap-3 relative z-10 translate-y-[240px]">
                {step > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBack}
                    type="button"
                    className="px-5 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-brand-primary font-bold text-sm transition-colors flex items-center justify-center shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </motion.button>
                )}
                
                {step < 2 ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    type="button"
                    className="flex-grow bg-brand-accent text-white rounded-xl py-4 font-bold text-[15px] transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight size={18} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-grow bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl py-4 font-bold text-[15px] transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* --- INFO / TRUST SIDE --- */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-l border-slate-100 relative flex-col justify-center p-12 overflow-hidden shrink-0">
          
          <div className="relative z-10 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-[10px] font-bold uppercase tracking-widest border border-brand-accent/20">
                <ShieldCheck size={14} /> Shop Local
              </div>
              <h2 className="text-3xl font-black text-brand-primary leading-tight">
                Join a secure, <br/> hyper-local network.
              </h2>
            </div>

            <div className="space-y-6">
              {[
                { title: "Local Shopping", desc: "Discover stores in your neighborhood directly.", icon: Store },
                { title: "Verified Sellers", desc: "Every seller is vetted for quality and authenticity.", icon: CheckCircle },
                { title: "Fast Delivery", desc: "Get your items lightning-fast through local delivery.", icon: Truck },
                { title: "Secure Payments", desc: "Industry standard encryption for your transactions.", icon: CreditCard }
              ].map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  key={idx} 
                  className="flex gap-4 items-start"
                >
                  <div className="mt-1 bg-white p-2.5 rounded-xl shadow-sm border border-slate-200">
                    <item.icon size={20} className="text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-primary text-[15px]">{item.title}</h4>
                    <p className="text-xs text-brand-text-secondary font-medium mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserSignup;
