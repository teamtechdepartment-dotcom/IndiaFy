/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LifeBuoy, Mail, Lock, KeyRound, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useSupportAuthStore } from "../../store/supportAuthStore";
import toast from "react-hot-toast";

export default function SupportLogin() {
  const [searchParams] = useSearchParams();
  const setupToken = searchParams.get("setupToken");

  const { login, setupPassword, loading } = useSupportAuthStore();
  const navigate = useNavigate();

  // Mode: "login" or "setup"
  const [mode, setMode] = useState(setupToken ? "setup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (setupToken) {
      setMode("setup");
    }
  }, [setupToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password");
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      toast.success("Welcome to Support Workspace");
      navigate("/support-workspace");
    } else {
      setErrorMsg(res.error || "Login failed");
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!password || !confirmPassword) {
      setErrorMsg("Please enter and confirm your password");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    const res = await setupPassword(setupToken, password);
    if (res.success) {
      toast.success("Password configured successfully! Account activated.");
      navigate("/support-workspace");
    } else {
      setErrorMsg(res.error || "Password setup failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#061814] text-white p-4 selection:bg-emerald-500 selection:text-black">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mb-3 shadow-lg shadow-emerald-950/40">
            <LifeBuoy size={28} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Indiafy Support Workspace</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {mode === "setup"
              ? "Set up your credentials to activate your agent workspace"
              : "Dedicated customer support & ticketing terminal"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0B231D]/90 backdrop-blur-md border border-emerald-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Support Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@indiafy.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#061814] border border-emerald-900/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#061814] border border-emerald-900/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Workspace</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl mb-4 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  Welcome to the Indiafy support team! Create your password to activate your account.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#061814] border border-emerald-900/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#061814] border border-emerald-900/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Activating..." : "Set Password & Enter Workspace"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-emerald-900/40 text-center">
            <p className="text-[11px] text-gray-400">
              Only authorized personnel. Need access? Contact an Indiafy Administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
