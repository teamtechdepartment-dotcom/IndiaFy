import { motion } from "framer-motion";
import { CategorySkeleton } from "./LoadingSkeletons";
import {
  Milk,
  Carrot,
  Apple,
  Pill,
  Croissant,
  CupSoda,
  Cookie,
  ShoppingBasket,
} from "lucide-react";

const CATEGORIES = [
  { id: "dairy", name: "Milk", icon: Milk, count: 120, color: "bg-blue-50 text-blue-600" },
  { id: "vegetables", name: "Vegetables", icon: Carrot, count: 85, color: "bg-green-50 text-green-600" },
  { id: "fruits", name: "Fruits", icon: Apple, count: 64, color: "bg-orange-50 text-orange-600" },
  { id: "pharma", name: "Medicines", icon: Pill, count: 230, color: "bg-teal-50 text-teal-600" },
  { id: "bakery", name: "Bakery", icon: Croissant, count: 45, color: "bg-amber-50 text-amber-600" },
  { id: "drinks", name: "Beverages", icon: CupSoda, count: 90, color: "bg-red-50 text-red-600" },
  { id: "snacks", name: "Snacks", icon: Cookie, count: 110, color: "bg-purple-50 text-purple-600" },
  { id: "daily", name: "Daily Needs", icon: ShoppingBasket, count: 200, color: "bg-indigo-50 text-indigo-600" },
];

export { CATEGORIES };

export default function QuickCategories({ activeCategory, onCategoryClick, isLoading }) {
  if (isLoading) {
    return (
      <div className="px-4 py-4 bg-white border-b border-zinc-100">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 bg-white border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-zinc-900">Shop by Category</h2>
        </div>

        {/* Mobile: horizontal scroll, Desktop: full grid */}
        <div className="flex sm:grid sm:grid-cols-8 gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onCategoryClick(cat.id)}
                className={`shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 min-w-[72px] ${
                  isActive
                    ? "bg-brand-accent/10 border-2 border-brand-accent/30 shadow-sm"
                    : "bg-zinc-50 border-2 border-transparent hover:bg-zinc-100"
                }`}
                aria-label={`${cat.name} category`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? "bg-brand-accent text-white" : cat.color
                  }`}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold leading-none ${
                    isActive ? "text-brand-accent" : "text-zinc-600"
                  }`}
                >
                  {cat.name}
                </span>
                <span className="text-[8px] font-semibold text-zinc-400 leading-none">
                  {cat.count} items
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
