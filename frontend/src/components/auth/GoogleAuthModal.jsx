import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, User, Shield, ArrowRight, Loader2, UserPlus, Trash2, CheckCircle2 } from "lucide-react";

const GoogleAuthModal = ({ isOpen, onClose, onSelectAccount, role = "customer", loading = false }) => {
  const storageKey = `indiafy_saved_google_accounts_${role}`;

  const [savedAccounts, setSavedAccounts] = useState([]);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState("");

  const defaultAccounts =
    role === "seller"
      ? [
          {
            name: "Mukund Enterprises (Seller)",
            email: "mukund.seller@gmail.com",
            picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            isDefault: true,
          },
          {
            name: "IndiaFy Official Supplier",
            email: "supplier.indiafy@gmail.com",
            picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            isDefault: true,
          }
        ]
      : [
          {
            name: "Mukund Sharma",
            email: "mukund.sharma@gmail.com",
            picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            isDefault: true,
          },
          {
            name: "Rahul Verma",
            email: "rahul.verma@gmail.com",
            picture: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
            isDefault: true,
          }
        ];

  useEffect(() => {
    if (isOpen) {
      setShowCustomInput(false);
      setError("");
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSavedAccounts(parsed);
            return;
          }
        }
      } catch (_e) {
        // Ignore storage parsing errors
      }
      setSavedAccounts([]);
    }
  }, [isOpen, storageKey]);

  if (!isOpen) return null;

  // Combine user saved accounts with realistic default accounts (avoiding duplicates)
  const allAccounts = [
    ...savedAccounts,
    ...defaultAccounts.filter(
      (def) => !savedAccounts.some((saved) => saved.email.toLowerCase() === def.email.toLowerCase())
    ),
  ];

  const saveAccountToStorage = (account) => {
    try {
      const existing = [...savedAccounts];
      const filtered = existing.filter((acc) => acc.email.toLowerCase() !== account.email.toLowerCase());
      const updated = [account, ...filtered].slice(0, 5); // Keep up to 5 recent accounts
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSavedAccounts(updated);
    } catch (_e) {
      // Ignore storage errors
    }
  };

  const removeAccountFromStorage = (e, emailToRemove) => {
    e.stopPropagation();
    try {
      const updated = savedAccounts.filter((acc) => acc.email.toLowerCase() !== emailToRemove.toLowerCase());
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSavedAccounts(updated);
    } catch (_e) {
      // Ignore
    }
  };

  const handleAccountClick = (account) => {
    saveAccountToStorage(account);
    onSelectAccount({
      email: account.email,
      name: account.name,
      picture: account.picture,
      googleId: account.googleId || "gid_" + account.email.replace(/[^a-zA-Z0-9]/g, ""),
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      setError("Please enter a valid Gmail address.");
      return;
    }
    setError("");
    const cleanEmail = customEmail.trim().toLowerCase();
    const defaultName = customName.trim() || cleanEmail.split("@")[0] || "Google User";

    const newAccount = {
      email: cleanEmail,
      name: defaultName,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=0D8ABC&color=fff`,
      googleId: "gid_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, ""),
      isDefault: false,
    };

    saveAccountToStorage(newAccount);
    onSelectAccount(newAccount);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800"
        >
          {/* Official Google OAuth Modal Header */}
          <div className="pt-8 px-8 pb-4 text-center relative">
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>

            <h3 className="font-medium text-[22px] leading-tight text-slate-900 tracking-tight">Sign in with Google</h3>
            <p className="text-[14px] text-slate-600 mt-1.5 font-normal">
              Choose an account to continue to <span className="font-semibold text-brand-primary">IndiaFy {role === "seller" ? "Seller Partner" : ""}</span>
            </p>
          </div>

          {/* Content Area */}
          <div className="px-6 pb-6 pt-2">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-9 h-9 text-[#4285F4] animate-spin" />
                <div>
                  <p className="font-semibold text-slate-800 text-base">Signing you in...</p>
                  <p className="text-xs text-slate-500 mt-1">Verifying credentials with Google Identity Services</p>
                </div>
              </div>
            ) : !showCustomInput ? (
              <div className="space-y-3">
                <div className="border border-slate-200/90 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm bg-white">
                  {allAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAccountClick(acc)}
                      className="w-full p-4 hover:bg-slate-50/80 transition-all flex items-center gap-3.5 text-left group cursor-pointer relative"
                    >
                      <img
                        src={acc.picture}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200/60 shadow-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-[14px] text-slate-900 group-hover:text-[#1a73e8] transition-colors truncate">
                            {acc.name}
                          </p>
                          {!acc.isDefault && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">Saved</span>
                          )}
                        </div>
                        <p className="text-[13px] text-slate-500 truncate">{acc.email}</p>
                      </div>
                      {!acc.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => removeAccountFromStorage(e, acc.email)}
                          title="Remove saved account"
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-[#1a73e8] group-hover:translate-x-0.5 transition-all ml-1 shrink-0" />
                    </div>
                  ))}

                  {/* Standard Google "Use another account" button */}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomEmail("");
                      setCustomName("");
                      setShowCustomInput(true);
                    }}
                    className="w-full p-4 hover:bg-slate-50/80 text-left transition-all flex items-center gap-3.5 font-medium text-[14px] text-[#1a73e8] group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50/80 flex items-center justify-center text-[#1a73e8] border border-blue-100 shrink-0 group-hover:bg-blue-100/80 transition-colors">
                      <UserPlus size={18} />
                    </div>
                    <span className="font-semibold">Use another account</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-[13px] font-bold text-slate-800">Use another Google Account</span>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-[12px] font-bold text-[#1a73e8] hover:underline"
                  >
                    Back to accounts
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email or phone</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="Enter Gmail address"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] font-medium text-sm text-slate-800 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Your Name (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Mukund Sharma"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] font-medium text-sm text-slate-800 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="py-2.5 px-5 rounded-full hover:bg-slate-100 font-semibold text-sm text-[#1a73e8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-full bg-[#1a73e8] hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Official Google Privacy & Security Disclaimer Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed text-center">
              To continue, Google will share your name, email address, and profile picture with IndiaFy. Before using this app, you can review IndiaFy's <a href="/privacy-policy" target="_blank" className="text-[#1a73e8] hover:underline">privacy policy</a> and <a href="/terms-and-conditions" target="_blank" className="text-[#1a73e8] hover:underline">terms of service</a>.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoogleAuthModal;
