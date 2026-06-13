import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import axiosInstance from "../../utils/axiosInstance";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const AdminLogin = () => {
  const navigate = useNavigate();
  const loginAuth = useAdminAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/admin/auth/login", { email, password });
      const data = res.data || res;
      
      if (data) {
        const userData = { ...data, role: "admin" };
        loginAuth(userData, userData.accessToken, userData.refreshToken);
        navigate("/admin/dashboard");
      } else {
        setError("Login failed: Invalid response");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.386-4.02M6.53 6.53A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.966 9.966 0 01-4.077 5.198M15 12a3 3 0 00-3-3m0 0a3 3 0 00-2.121.879M3 3l18 18" />
        </>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4 sm:px-6 py-12 relative overflow-hidden font-sans selection:bg-[#10B981] selection:text-white">
      {/* Background organic blurred shapes mirroring homepage hero */}
      <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-100/40 to-teal-100/20 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/20 to-indigo-100/10 rounded-full blur-3xl -z-0 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md bg-white/70 backdrop-blur-xl rounded-[2.5rem] px-6 sm:px-10 py-8 sm:py-10 border border-white/50 shadow-2xl relative z-10 flex flex-col"
      >
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8 select-none">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-[#10B981] flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-emerald-500/25 mb-3">
            I
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-wider uppercase text-center">
            Indiafy <span className="text-[#10B981] text-[10px] font-black block tracking-[0.25em] mt-0.5">Enterprise Portal</span>
          </h2>
        </div>

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          
          {/* EMAIL */}
          <div>
            <label htmlFor="admin-email" className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="e.g. admin@indiafy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl text-sm bg-slate-50/50 border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#10B981] transition-all duration-300 mt-1.5"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label htmlFor="admin-password" className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 pr-10 rounded-2xl text-sm bg-slate-50/50 border border-slate-200/80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#10B981] transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-[#10B981] hover:opacity-95 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all duration-200 shadow-md shadow-emerald-500/10 disabled:opacity-60 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* ERROR MESSAGE */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2"
          >
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* RETURN BUTTON */}
        <div className="mt-8 flex justify-center select-none">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-slate-650 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;