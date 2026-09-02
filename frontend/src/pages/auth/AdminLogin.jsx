import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import axiosInstance from "../../utils/axiosInstance";
import {
  ArrowLeft, ShieldAlert, ShieldCheck, Lock, Mail, Eye, EyeOff,
  TrendingUp, Store, Activity, CheckCircle2, Zap, Users, MapPin,
  Sparkles, Sun, Moon, Database, KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthLogo } from "../../components/branding/BrandLogo";

// ─── ANIMATED COUNT-UP COMPONENT ─────────────────────────────────────
function AnimatedCounter({ value, duration = 1.8 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numericPart = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
    const nonNumericPart = value.replace(/[0-9.]/g, "");
    const isFloat = value.includes(".") && numericPart % 1 !== 0;

    let start = 0;
    const end = numericPart;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration * 1000;
    const steps = 60;
    const stepTime = totalMiliseconds / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Easy out cubic progress
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + easeProgress * (end - start);

      setCount(isFloat ? parseFloat(currentVal.toFixed(2)) : Math.floor(currentVal));

      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(end);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  const nonNumericPart = value.replace(/[0-9.]/g, "");
  
  // Custom formatter to show decimal values correctly or commas
  const formattedCount = count.toLocaleString('en-IN', {
    minimumFractionDigits: value.includes(".") ? 2 : 0,
    maximumFractionDigits: value.includes(".") ? 2 : 0,
  });

  return (
    <span>
      {formattedCount}
      {nonNumericPart}
    </span>
  );
}

// ─── FLOATING NODE FOR NETWORK GRAPHIC ────────────────────────────────
function FloatingNode({ delay, icon: Icon, color, label, position }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -12, 0],
        x: [0, 8, 0]
      }}
      transition={{ 
        duration: 4.5, 
        delay, 
        repeat: Infinity, 
        repeatType: "reverse", 
        ease: "easeInOut" 
      }}
      className={`absolute ${position} z-10 flex items-center gap-2 p-3 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md shadow-lg border border-slate-200/50 dark:border-slate-800/80`}
    >
      <div className={`p-2 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}15`, color }}>
        <Icon size={16} />
      </div>
      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{label}</span>
    </motion.div>
  );
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const loginAuth = useAdminAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityKey, setShowSecurityKey] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Theme state synchronized with DOM
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = !isDark;
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
    setIsDark(nextTheme);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!securityKey.trim()) {
      setError("Admin Security Key is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/admin/auth/login", { 
        email: email.trim().toLowerCase(), 
        password, 
        securityKey: securityKey.trim() 
      });
      const data = res.data || res;
      if (data) {
        const userData = { ...data, role: "admin" };
        loginAuth(userData, userData.accessToken, userData.refreshToken);
        navigate("/admin/dashboard");
      } else {
        setError("Authentication failed: Invalid server response.");
      }
    } catch (_err) {
      setError(
        _err?.response?.data?.message || _err?.message || "Invalid credentials or unauthorized access."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full font-sans selection:bg-orange-500 selection:text-white flex items-center justify-center relative overflow-hidden transition-colors duration-350 bg-slate-50 dark:bg-slate-950">
      
      {/* ── BACKGROUND LAYERS & AURORA EFFECTS ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Animated Aurora Glow Circles */}
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-20%] left-[-10%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full mix-blend-multiply dark:mix-blend-screen"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(40,116,240,0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(40,116,240,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <motion.div
          animate={{
            x: [0, -40, 50, 0],
            y: [0, 60, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-20%] right-[-10%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full mix-blend-multiply dark:mix-blend-screen"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(251,100,27,0.1) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(251,100,27,0.04) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Center Accent Radial Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)"
              : "radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />

        {/* Subtle grid mesh overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── THEME SWITCHER TOGGLE (TOP RIGHT) ────────────────────────── */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={handleThemeToggle}
          type="button"
          aria-label="Toggle theme"
          className="p-3 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-300 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer animate-none"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-800" />}
        </button>
      </div>

      {/* ── MAIN SPLIT WINDOW WRAPPER ──────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[750px] shadow-2xl rounded-[32px] border border-slate-200/60 dark:border-slate-800/40 bg-white/60 dark:bg-slate-950/65 backdrop-blur-2xl"
        >
          
          {/* ─── LEFT SIDE — INDIAFY BRAND EXPERIENCE (7 Columns on Large, 6 Columns on Tablet) ─── */}
          <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200/50 dark:border-slate-800/30">
            {/* Background Light Beam effect */}
            <div 
              className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-40"
              style={{
                background: "radial-gradient(circle, rgba(40,116,240,0.12) 0%, transparent 70%)",
                filter: "blur(40px)"
              }}
            />

            {/* Top Brand Header */}
            <div className="relative z-10">
              <AuthLogo className="mb-6" />

              <div className="space-y-4 max-w-xl mt-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/40 border border-orange-200/50 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 shadow-sm">
                  <Sparkles size={11} className="animate-pulse" />
                  Indiafy Administrative Center v2.5
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                  Exclusive <br />
                  <span className="bg-gradient-to-r from-[#2874F0] via-orange-500 to-[#FB641B] bg-clip-text text-transparent">
                    Command Suite
                  </span>
                </h1>

                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg mt-3">
                  Supervise verified sellers, manage catalog operations, process orders, track platform metrics, and control security workflows across local commerce nodes.
                </p>
              </div>
            </div>

            {/* Interactive Network Graphic */}
            <div className="relative w-full h-[220px] sm:h-[260px] my-6 flex items-center justify-center z-10 select-none">
              {/* Network Graph Vector Curves */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 240">
                {/* Line definitions connecting to Center Node */}
                {/* Center is (250, 120) */}
                <motion.path
                  d="M 250,120 Q 150,70 95,95"
                  fill="none"
                  stroke={isDark ? "rgba(40, 116, 240, 0.25)" : "rgba(40, 116, 240, 0.15)"}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  animate={{ strokeDashoffset: [0, -100] }}
                  transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
                />
                <motion.path
                  d="M 250,120 Q 350,70 405,95"
                  fill="none"
                  stroke={isDark ? "rgba(251, 100, 27, 0.25)" : "rgba(251, 100, 27, 0.15)"}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  animate={{ strokeDashoffset: [0, 100] }}
                  transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
                />
                <motion.path
                  d="M 250,120 Q 140,170 95,145"
                  fill="none"
                  stroke={isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.15)"}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  animate={{ strokeDashoffset: [0, 100] }}
                  transition={{ repeat: Infinity, duration: 11, ease: "linear" }}
                />
                <motion.path
                  d="M 250,120 Q 360,170 405,145"
                  fill="none"
                  stroke={isDark ? "rgba(99, 102, 241, 0.25)" : "rgba(99, 102, 241, 0.15)"}
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  animate={{ strokeDashoffset: [0, -100] }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                />
              </svg>

              {/* Central Shield Hub */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 15px rgba(40, 116, 240, 0.15)",
                    "0 0 25px rgba(40, 116, 240, 0.35)",
                    "0 0 15px rgba(40, 116, 240, 0.15)"
                  ]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2874F0] to-indigo-600 flex items-center justify-center text-white shadow-xl z-20"
              >
                <ShieldCheck size={28} />
              </motion.div>

              {/* Outer Nodes */}
              <FloatingNode delay={0} icon={Store} color="#FB641B" label="Sellers Node" position="top-[10%] left-[8%]" />
              <FloatingNode delay={0.6} icon={Users} color="#2874F0" label="Customers" position="top-[10%] right-[8%]" />
              <FloatingNode delay={1.2} icon={TrendingUp} color="#10B981" label="Live GMV" position="bottom-[10%] left-[8%]" />
              <FloatingNode delay={1.8} icon={Zap} color="#8B5CF6" label="Express Logistics" position="bottom-[10%] right-[8%]" />
            </div>

            {/* Platform statistics footer */}
            <div className="space-y-4 relative z-10 mt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                Platform Performance Metrics
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { value: "10K+", label: "Customers" },
                  { value: "1K+", label: "Sellers" },
                  { value: "500+", label: "Stores" },
                  { value: "100+", label: "Cities" },
                  { value: "99.99%", label: "Uptime" },
                ].map((stat, i) => (
                  <div 
                    key={stat.label}
                    className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-md flex flex-col justify-between"
                  >
                    <p className="text-sm font-extrabold text-slate-855 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      <AnimatedCounter value={stat.value} duration={1.6 + i * 0.1} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Trust Tagline */}
            <div className="flex items-center justify-between pt-6 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/30 mt-8">
              <span className="font-bold uppercase tracking-widest text-[#FB641B]">Empowering India's Local Commerce</span>
              <span className="font-bold opacity-60">ISO 27001 Certified Suite</span>
            </div>
          </div>

          {/* ─── RIGHT SIDE — AUTHENTICATION FORM (5 Columns on Large, 6 Columns on Tablet) ─── */}
          <div className="col-span-1 lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/30">
            <div>
              {/* Form Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2874F0] mb-3">
                  <Lock size={12} />
                  Authentication Hub
                </div>
                <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1.5">
                  Sign in to the Indiafy Administration Platform
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* EMAIL */}
                <div>
                  <label htmlFor="admin-email" className="block text-[10px] font-black tracking-widest uppercase mb-2 text-slate-600 dark:text-slate-400">
                    Admin Email Address
                  </label>
                  <div className="relative group">
                    <Mail 
                      className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-slate-400 dark:text-slate-600 group-focus-within:text-[#2874F0]" 
                      size={16} 
                    />
                    <input
                      id="admin-email"
                      type="email"
                      placeholder="admin@indiafy.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 transition-all duration-200 focus:outline-none focus:border-[#2874F0] focus:ring-4 focus:ring-[#2874F0]/10 dark:focus:ring-[#2874F0]/5"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="admin-password" className="text-[10px] font-black tracking-widest uppercase text-slate-600 dark:text-slate-400">
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => { e.preventDefault(); alert("Please contact the Super Admin for password resets."); }}
                      className="text-[10px] font-bold text-[#2874F0] hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative group">
                    <Lock 
                      className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-slate-400 dark:text-slate-600 group-focus-within:text-[#2874F0]" 
                      size={16} 
                    />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl py-3.5 pl-11 pr-12 text-xs font-medium placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 transition-all duration-200 focus:outline-none focus:border-[#2874F0] focus:ring-4 focus:ring-[#2874F0]/10 dark:focus:ring-[#2874F0]/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 transition-colors rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* ADMIN SECURITY KEY */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="admin-security-key" className="text-[10px] font-black tracking-widest uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <KeyRound size={12} className="text-[#FB641B]" />
                      Admin Security Key
                    </label>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Required
                    </span>
                  </div>
                  <div className="relative group">
                    <KeyRound 
                      className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 text-slate-400 dark:text-slate-600 group-focus-within:text-[#FB641B]" 
                      size={16} 
                    />
                    <input
                      id="admin-security-key"
                      type={showSecurityKey ? "text" : "password"}
                      placeholder="Enter security key (e.g. kishan@3322)"
                      value={securityKey}
                      onChange={(e) => setSecurityKey(e.target.value)}
                      required
                      autoComplete="off"
                      className="w-full rounded-2xl py-3.5 pl-11 pr-12 text-xs font-medium placeholder-slate-400 dark:placeholder-slate-600 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 transition-all duration-200 focus:outline-none focus:border-[#FB641B] focus:ring-4 focus:ring-[#FB641B]/10 dark:focus:ring-[#FB641B]/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecurityKey((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 transition-colors rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 cursor-pointer"
                    >
                      {showSecurityKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* REMEMBER ME */}
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer border-slate-300 dark:border-slate-800 text-[#2874F0] focus:ring-[#2874F0]/20"
                    style={{ accentColor: "#2874F0" }}
                  />
                  <label htmlFor="remember-me" className="text-xs font-bold cursor-pointer select-none text-slate-500 dark:text-slate-400">
                    Keep me signed in
                  </label>
                </div>

                {/* ERROR FEEDBACK */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -4, 4, 0] }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                      className="p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400"
                    >
                      <ShieldAlert size={16} className="shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SIGN IN BUTTON */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-[#FB641B] via-orange-500 to-[#F0570F] shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-0"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Secure Admin Sign In</span>
                    </>
                  )}
                </motion.button>
              </form>

            </div>

            {/* Footer Control Info */}
            <div className="mt-8 pt-6 flex justify-between items-center text-[11px] border-t border-slate-200/50 dark:border-slate-800/30">
              <Link
                to="/"
                className="font-bold flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={12} />
                Back to Marketplace
              </Link>
              <span className="font-extrabold text-slate-400 dark:text-slate-600">v2.5.0-Enterprise</span>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}