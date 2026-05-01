import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Github,
  Chrome as Google,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

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
});

const LOGIN_CLIP = "polygon(55% 0, 100% 0, 100% 100%, 48% 100%)";
const SIGNUP_CLIP = "polygon(0 0, 52% 0, 45% 100%, 0 100%)";
const FULL_CLIP = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
const EASE = "cubic-bezier(0.86, 0, 0.07, 1)";

const AuthPage = () => {
  const navigate = useNavigate();
  const bpRef = useRef(null);
  const wbRef = useRef(null);
  const busyRef = useRef(false);
  const isLoginRef = useRef(true);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginAuth = useAuthStore((state) => state.login);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const setWelcomePos = (loginMode) => {
    const wb = wbRef.current;
    if (!wb) return;
    if (loginMode) {
      wb.style.right = "40px";
      wb.style.left = "auto";
      wb.style.textAlign = "right";
    } else {
      wb.style.left = "40px";
      wb.style.right = "auto";
      wb.style.textAlign = "left";
    }
  };

  useEffect(() => {
    const bp = bpRef.current;
    if (bp) {
      bp.style.transition = "none";
      bp.style.clipPath = LOGIN_CLIP;
      setWelcomePos(true);
    }
  }, []);

  const handleToggle = () => {
    if (busyRef.current) return;
    busyRef.current = true;

    const bp = bpRef.current;
    const wb = wbRef.current;

    wb.style.opacity = "0";
    bp.style.transition = `clip-path 0.6s ${EASE}`;
    bp.style.clipPath = FULL_CLIP;

    setTimeout(() => {
      const next = !isLoginRef.current;
      isLoginRef.current = next;
      setIsLogin(next);
      setWelcomePos(next);
      bp.style.transition = `clip-path 0.7s ${EASE}`;
      bp.style.clipPath = next ? LOGIN_CLIP : SIGNUP_CLIP;
    }, 550);

    setTimeout(() => {
      wb.style.opacity = "1";
      busyRef.current = false;
    }, 1100);
  };

  const onLogin = async (data) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/customer/auth/login", data);
      if (res.success && res.data) {
        loginAuth(res.data, res.data?._id || null);
        toast.success("Welcome back to Indiafy!");
        navigate("/");
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
      resetLogin();
    }
  };

  const onSignup = async (data) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/customer/auth/signup", data);
      if (res.success && res.data) {
        loginAuth(res.data, res.data?._id || null);
        toast.success("Account created successfully!");
        resetSignup();
        navigate("/");
      } else {
        toast.error(res.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] p-4 sm:p-8 selection:bg-indigo-100 font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="relative w-full max-w-[850px] bg-white rounded-[2.5rem] shadow-[0_32px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex min-h-[520px]">
        {/* --- LOGIN SECTION --- */}
        <div
          className={`form-side w-[55%] p-10 sm:p-14 flex flex-col justify-center transition-all duration-500 ${isLogin ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"}`}
          style={{ marginLeft: "auto" }}
        >
          <div className="w-full space-y-8">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                Please enter your details to login.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={18}
                  />
                  <input
                    {...registerLogin("email")}
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm"
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-wider">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={18}
                  />
                  <input
                    {...registerLogin("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-wider">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-slate-900 text-white rounded-2xl py-4 font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Sign In{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs font-medium text-slate-500">
                Don't have an account?{" "}
                <button
                  onClick={handleToggle}
                  className="text-indigo-600 font-bold hover:underline underline-offset-4"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* --- SIGNUP SECTION --- */}
        <div
          className={`form-side w-[55%] p-10 sm:p-14 flex flex-col justify-center transition-all duration-500 ${!isLogin ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"}`}
        >
          <div className="w-full space-y-8">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                Join Indiafy for local shopping magic.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  First Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={18}
                  />
                  <input
                    {...registerSignup("firstName")}
                    placeholder="Your first name"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm"
                  />
                </div>
                {signupErrors.firstName && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-wider">
                    {signupErrors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Last Name
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={18}
                  />
                  <input
                    {...registerSignup("lastName")}
                    placeholder="Your last name (optional)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm"
                  />
                </div>
                {signupErrors.lastName && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-wider">
                    {signupErrors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={18}
                  />
                  <input
                    {...registerSignup("email")}
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm"
                  />
                </div>
                {signupErrors.email && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-wider">
                    {signupErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={18}
                  />
                  <input
                    {...registerSignup("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, letter & number"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupErrors.password && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-wider">
                    {signupErrors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-slate-900 text-white rounded-2xl py-4 font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Create Account{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs font-medium text-slate-500">
                Already joined?{" "}
                <button
                  onClick={handleToggle}
                  className="text-indigo-600 font-bold hover:underline underline-offset-4"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* --- BLACK SWEEP PANEL (THE DESIGN) --- */}
        <div
          ref={bpRef}
          className="black-panel absolute inset-0 bg-[#0f172a] z-10 pointer-events-none flex flex-col justify-center p-12 overflow-hidden shadow-2xl"
        >
          {/* Animated Orbs for the Black Side */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[80px]" />
          </div>

          <div
            ref={wbRef}
            className="relative z-20 space-y-8 transition-opacity duration-300"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[9px] font-bold uppercase tracking-[0.2em]">
              <ShieldCheck size={14} /> Indiafy Secure
            </div>

            {isLogin ? (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Revisit your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                    journey.
                  </span>
                </h1>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">
                  Access your orders, wishlist, and lightning-fast local
                  deliveries.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Shop your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    locality.
                  </span>
                </h1>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">
                  Join thousands of locals getting everything they need in
                  minutes.
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-white/10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                    className="w-8 h-8 rounded-full border-2 border-[#0f172a]"
                    alt="avatar"
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                2k+ Active Locals
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
