import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "../../store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { userSignupSchema, sanitizeEmail, mapBackendError } from "../../lib/signupSchemas";
import PasswordStrength from "../../components/ui/PasswordStrength";

const STEPS = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Account Setup" }
];

const UserSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // ── Submit guard: prevents double-click and duplicate requests ────
  const isSubmittingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const loginAuth = useAuthStore((state) => state.login);
  const addToCart = useCartStore((state) => state.addToCart);

  // Read redirect param (e.g. from checkout guard)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setError,
    setFocus,
    clearErrors,
  } = useForm({
    resolver: zodResolver(userSignupSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const formValues = watch();
  const passwordValue = watch("password", "");

  // ── Auto-focus first invalid field after validation ──────────────
  useEffect(() => {
    const fieldOrder = ["firstName", "lastName", "email", "password", "confirmPassword"];
    const firstError = fieldOrder.find((f) => errors[f]);
    if (firstError) {
      setFocus(firstError);
    }
  }, [errors, setFocus]);

  // ── Step 1 → Step 2 ─────────────────────────────────────────────
  const handleNext = async () => {
    clearErrors();
    const isValid = await trigger(["firstName", "lastName"]);
    if (isValid) {
      setDirection(1);
      setStep(2);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(1);
  };

  // ── Submit handler ───────────────────────────────────────────────
  const onSignup = useCallback(async (data) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName ? data.lastName.trim() : undefined,
        email: sanitizeEmail(data.email),
        password: data.password,
      };

      const res = await axiosInstance.post("/customer/auth/signup", payload, {
        signal: abortControllerRef.current.signal,
      });

      if (res?.success && res?.data) {
        loginAuth(res.data, res.data.accessToken);
        toast.success("Account created successfully! Welcome to Indiafy.", {
          id: "auth-success",
          duration: 3000,
        });

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
        } else if (redirectTo) {
          // Honour the redirect param from checkout guard
          navigate(redirectTo, { replace: true });
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(res?.message || "Registration failed. Please try again.", {
          id: "auth-error",
        });
      }
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

      if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
        toast.error("No internet connection. Please check your network and try again.", {
          id: "auth-error",
        });
        return;
      }

      const status = err?.response?.status;
      if (status === 409) {
        // Duplicate email — pin to the email field
        setError("email", {
          type: "server",
          message: err?.response?.data?.message || "An account with this email already exists.",
        });
        setStep(2); // ensure step 2 is visible
        setFocus("email");
        return;
      }

      if (status === 429) {
        toast.error("Too many attempts. Please wait a moment and try again.", {
          id: "auth-error",
        });
        return;
      }

      // Map backend field errors to form fields
      mapBackendError(
        err,
        setError,
        (message) => toast.error(message, { id: "auth-error" })
      );

      if (process.env.NODE_ENV !== "production") {
        console.error("[UserSignup] signup error:", err);
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [loginAuth, addToCart, navigate, setError, setFocus]);

  // ── Keyboard: Enter on step 1 advances, not submits ──────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && step === 1) {
      e.preventDefault();
      handleNext();
    }
  }, [step]);

  // ── Field renderer ───────────────────────────────────────────────
  const variants = {
    enter: (d) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (d) => ({ zIndex: 0, x: d < 0 ? 50 : -50, opacity: 0 }),
  };

  const renderField = ({
    name,
    label,
    icon: Icon,
    type = "text",
    placeholder,
    autoComplete,
    showToggle = false,
    isVisible = true,
    onToggle,
  }) => {
    const isFocused = focusedField === name;
    const hasValue = !!formValues[name];
    const hasError = !!errors[name];
    const errorId = `${name}-error`;
    const inputId = `signup-${name}`;

    return (
      <div className="relative group mt-2" key={name}>
        <div
          className={`relative rounded-xl border transition-all duration-300 bg-slate-50 overflow-hidden
            ${hasError
              ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.12)]"
              : isFocused
              ? "border-brand-accent shadow-[0_0_0_2px_rgba(16,185,129,0.1)]"
              : "border-slate-200 hover:border-slate-300"}
          `}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {hasError
              ? <AlertCircle className="h-[20px] w-[20px] text-red-400" aria-hidden="true" />
              : <Icon className={`h-[20px] w-[20px] transition-colors duration-300 ${isFocused ? "text-brand-accent" : "text-slate-400"}`} aria-hidden="true" />
            }
          </div>

          <label
            htmlFor={inputId}
            className={`absolute left-[44px] top-[14px] text-slate-500 font-medium origin-left pointer-events-none transition-all duration-200
              ${(isFocused || hasValue) ? "translate-y-[-12px] scale-75 opacity-100" : "translate-y-0 scale-100 opacity-80"}`}
          >
            {label}
          </label>

          <input
            id={inputId}
            type={type === "password" ? (isVisible ? "text" : "password") : type}
            {...register(name, { onBlur: () => setFocusedField(null) })}
            onFocus={() => setFocusedField(name)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete={autoComplete}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            aria-required="true"
            className="w-full bg-transparent pt-[24px] pb-2 pl-[44px] pr-12 text-[15px] font-bold text-brand-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder={(isFocused || hasValue) ? placeholder : ""}
          />

          {showToggle && (
            <button
              type="button"
              onClick={onToggle}
              disabled={loading}
              aria-label={isVisible ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-accent p-2 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
            >
              {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        <AnimatePresence>
          {hasError && (
            <motion.p
              id={errorId}
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[12px] text-red-500 font-semibold mt-1.5 ml-1 flex items-center gap-1"
            >
              <AlertCircle size={11} aria-hidden="true" />
              {errors[name]?.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-6 sm:p-8 font-sans transition-colors duration-500 relative overflow-hidden">
      <SEOHead title="Create Account | Indiafy" noindex={true} />

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[20%] -left-[10%] w-[60vw] h-[60vw] bg-gradient-to-br from-emerald-100/60 to-teal-100/40 rounded-full blur-3xl -z-0" />
        <div className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-3xl -z-0" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[1100px] bg-white backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
      >
        {/* ── Form side ──────────────────────────────────────────── */}
        <div className="w-full lg:w-7/12 p-6 sm:p-10 lg:p-14 flex flex-col relative z-20">

          <div className="flex justify-between items-center mb-8">
            <img src="/Images/logo.png" alt="Indiafy" className="h-8 lg:hidden" />
            <div className="hidden lg:block text-brand-text-secondary text-sm font-medium">Join Indiafy</div>
            <Link to={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"} className="text-[13px] font-bold text-brand-accent hover:underline transition-colors">
              Log in instead
            </Link>
          </div>

          <div className="w-full max-w-[480px] mx-auto flex-grow flex flex-col justify-center">

            {/* Progress steps */}
            <div className="mb-10" aria-label="Signup progress">
              <div className="flex justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 rounded-full translate-y-[-50%]" />
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
                        backgroundColor: step >= s.id ? "#10B981" : "transparent",
                        borderColor: step >= s.id ? "#10B981" : "#E2E8F0",
                        color: step >= s.id ? "#FFFFFF" : "#94A3B8",
                      }}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors duration-300"
                      aria-current={step === s.id ? "step" : undefined}
                    >
                      {step > s.id ? <CheckCircle size={14} /> : s.id}
                    </motion.div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? "text-brand-primary" : "text-slate-400"}`}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSignup)}
              className="space-y-6"
              aria-label="Create account form"
              noValidate
            >
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
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h1 className="text-3xl font-black text-brand-primary tracking-tight">Join India's Local Marketplace</h1>
                      <p className="text-sm text-brand-text-secondary font-medium">Let's start with your name.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderField({ name: "firstName", label: "First Name", icon: User, placeholder: "John", autoComplete: "given-name" })}
                      {renderField({ name: "lastName", label: "Last Name", icon: User, placeholder: "Doe", autoComplete: "family-name" })}
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
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-brand-primary tracking-tight">Account Setup</h2>
                      <p className="text-sm text-brand-text-secondary font-medium">Use a valid email and strong password.</p>
                    </div>
                    <div className="space-y-6">
                      {renderField({
                        name: "email",
                        label: "Email Address",
                        icon: Mail,
                        type: "email",
                        placeholder: "john@example.com",
                        autoComplete: "email",
                      })}
                      <div>
                        {renderField({
                          name: "password",
                          label: "Password",
                          icon: Lock,
                          type: "password",
                          placeholder: "Min 8 chars",
                          autoComplete: "new-password",
                          showToggle: true,
                          isVisible: showPassword,
                          onToggle: () => setShowPassword((p) => !p),
                        })}
                        <PasswordStrength password={passwordValue} />
                      </div>
                      {renderField({
                        name: "confirmPassword",
                        label: "Confirm Password",
                        icon: Lock,
                        type: "password",
                        placeholder: "Re-enter password",
                        autoComplete: "new-password",
                        showToggle: true,
                        isVisible: showConfirm,
                        onToggle: () => setShowConfirm((p) => !p),
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="mt-8 pt-4 flex gap-3 relative z-10">
                {step > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBack}
                    type="button"
                    disabled={loading}
                    aria-label="Go back to personal details"
                    className="px-5 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-brand-primary font-bold text-sm transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={loading}
                    className="flex-grow bg-brand-accent text-white rounded-xl py-4 font-bold text-[15px] transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Continue <ArrowRight size={18} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                    aria-label={loading ? "Creating your account, please wait" : "Create your account"}
                    className="flex-grow bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl py-4 font-bold text-[15px] transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── Trust / info side ──────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-l border-slate-100 relative flex-col justify-center p-12 overflow-hidden shrink-0" aria-hidden="true">
          <div className="relative z-10 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-[10px] font-bold uppercase tracking-widest border border-brand-accent/20">
                <ShieldCheck size={14} /> Shop Local
              </div>
              <h2 className="text-3xl font-black text-brand-primary leading-tight">
                Join a secure, <br /> hyper-local network.
              </h2>
            </div>

            <div className="space-y-6">
              {[
                { title: "Local Shopping", desc: "Discover stores in your neighborhood directly.", icon: Store },
                { title: "Verified Sellers", desc: "Every seller is vetted for quality and authenticity.", icon: CheckCircle },
                { title: "Fast Delivery", desc: "Get your items lightning-fast through local delivery.", icon: Truck },
                { title: "Secure Payments", desc: "Industry standard encryption for your transactions.", icon: CreditCard },
              ].map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
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
