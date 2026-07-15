import { ShoppingBasket } from "lucide-react";
import { motion } from "framer-motion";

export default function EmptyCartState({ onBrowse }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center mb-5">
        <ShoppingBasket size={32} className="text-zinc-300" />
      </div>
      <h3 className="text-lg font-extrabold text-zinc-900 mb-1.5">
        Your Basket Is Empty
      </h3>
      <p className="text-sm text-zinc-400 font-medium mb-6 max-w-[260px]">
        Add essentials and get them delivered in minutes.
      </p>
      <button
        onClick={onBrowse}
        className="px-6 py-2.5 bg-brand-accent text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-brand-accent-hover active:scale-95 transition-all shadow-lg shadow-brand-accent/20"
      >
        Browse Products
      </button>
    </motion.div>
  );
}
