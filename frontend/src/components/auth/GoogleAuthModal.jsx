import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Mail, User, Shield, ArrowRight, Loader2 } from "lucide-react";

const GoogleAuthModal = ({ isOpen, onClose, onSelectAccount, role = "customer", loading = false }) => {
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const defaultAccounts =
    role === "seller"
      ? [
          {
            name: "Mukund Enterprises",
            email: "mukun.seller@gmail.com",
            picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          },
          {
            name: "Bharat Traders & Co.",
            email: "bharat.traders@gmail.com",
            picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          },
          {
            name: "TechMart Wholesale",
            email: "techmart.store@gmail.com",
            picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          },
        ]
      : [
          {
            name: "Mukund Sharma",
            email: "mukun.sharma@gmail.com",
            picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          },
          {
            name: "Rahul Kumar",
            email: "rahul.indiafy@gmail.com",
            picture: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
          },
          {
            name: "Ananya Singh",
            email: "ananya.shop@gmail.com",
            picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          },
        ];

  const handleAccountClick = (account) => {
    onSelectAccount({
      email: account.email,
      name: account.name,
      picture: account.picture,
      googleId: "gid_" + account.email.replace(/[^a-zA-Z0-9]/g, ""),
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      setError("Please enter a valid Gmail or email address.");
      return;
    }
    setError("");
    const defaultName = customName.trim() || customEmail.split("@")[0] || "Google User";
    onSelectAccount({
      email: customEmail.trim().toLowerCase(),
      name: defaultName,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=0D8ABC&color=fff`,
      googleId: "gid_" + customEmail.replace(/[^a-zA-Z0-9]/g, ""),
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <div>
                <h3 className="font-bold text-lg leading-tight text-slate-900">Sign in with Google</h3>
                <p className="text-xs text-slate-500 font-medium">to continue to IndiaFy {role === "seller" ? "Seller Partner" : "Marketplace"}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
                <div>
                  <p className="font-bold text-slate-800 text-base">Authenticating with IndiaFy...</p>
                  <p className="text-xs text-slate-500 mt-1">Please wait while we secure your session.</p>
                </div>
              </div>
            ) : !showCustomInput ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Choose an account</p>
                
                <div className="space-y-2">
                  {defaultAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAccountClick(acc)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-brand-accent hover:bg-emerald-50/40 transition-all flex items-center gap-3.5 text-left group"
                    >
                      <img
                        src={acc.picture}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 group-hover:text-brand-accent transition-colors truncate">
                          {acc.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <User size={16} />
                    Use another Google Account...
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">Enter Google Account Details</span>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-xs font-bold text-brand-accent hover:underline"
                  >
                    Back to list
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent font-medium text-sm text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent font-medium text-sm text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-bold text-sm transition-all shadow-md shadow-brand-accent/20 flex items-center justify-center gap-1.5"
                  >
                    Sign In <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Shield size={13} className="text-emerald-500" /> Secure 256-bit SSL
              </span>
              <span>Google Identity Services</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoogleAuthModal;
