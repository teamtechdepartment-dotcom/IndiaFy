import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import toast from "react-hot-toast";

export default function ExitAdminModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const logoutAdmin = useAdminAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);

  const handleExit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logoutAdmin();
      toast.success("Successfully logged out from Admin Panel", {
        id: "admin-logout-success",
      });
      navigate("/", { replace: true });
    } catch (_err) {
      toast.error(_err?.message || "Failed to exit securely. Please try again.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center z-10"
          >
            {/* Top Close Button */}
            {!loading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            )}

            {/* Warning Icon inside Emerald Circle */}
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-[#10B981] rounded-full flex items-center justify-center mb-5 relative shadow-inner">
              <LogOut size={28} className="translate-x-0.5" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              Exit Admin Panel?
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed max-w-xs">
              You will be logged out from the Admin Panel and redirected to the Indiafy website.
            </p>

            {/* Actions */}
            <div className="flex gap-3 w-full mt-6">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50 select-none active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleExit}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-[#10B981] hover:opacity-95 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-500/10 disabled:opacity-60 select-none flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Exiting...</span>
                  </>
                ) : (
                  <span>Exit & Logout</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
