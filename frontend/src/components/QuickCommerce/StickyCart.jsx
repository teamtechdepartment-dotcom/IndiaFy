/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { ShoppingBag, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyCart({ totalItems, totalPrice, totalSaved, onOpenDrawer }) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="fixed bottom-16 md:bottom-6 left-0 w-full z-50 px-4 pointer-events-none flex justify-center"
        >
          <div
            onClick={onOpenDrawer}
            className="pointer-events-auto w-full max-w-[480px] bg-brand-accent text-white p-3 rounded-2xl shadow-[0_12px_40px_rgba(16,185,129,0.35)] cursor-pointer hover:bg-brand-accent-hover hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm relative">
                <ShoppingBag size={18} className="text-white" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[9px] font-extrabold text-black shadow-sm border-2 border-brand-accent">
                  {totalItems}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider leading-none mb-0.5">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
                <p className="text-base font-extrabold leading-none">₹{totalPrice}</p>
                {totalSaved > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Sparkles size={8} className="text-yellow-300" />
                    <span className="text-[9px] font-bold text-emerald-200">
                      Saved ₹{totalSaved}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white text-brand-accent px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              View Cart <ChevronRight size={14} strokeWidth={3} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
