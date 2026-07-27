import { memo } from "react";
import {
  Box, ShoppingBasket, Laptop, Package, Scissors,
  Sparkles, Wrench, Home, BookOpen, UtensilsCrossed,
  ArrowRight, Grid
} from "lucide-react";

const CATEGORIES = [
  { id: "fmcg", name: "FMCG & Staples", emoji: "🧴", icon: Box, suppliers: "4,500+", moq: "Min. order ₹5,000", badge: "High Demand" },
  { id: "grocery", name: "Grocery & Food", emoji: "🥫", icon: ShoppingBasket, suppliers: "4,500+", moq: "Min. order ₹2,000", badge: "Top Margin" },
  { id: "electronics", name: "Electronics & Tech", emoji: "💻", icon: Laptop, suppliers: "3,100+", moq: "Min. order 10 units", active: true, badge: "Trending" },
  { id: "packaging", name: "Industrial Packaging", emoji: "📦", icon: Package, suppliers: "850+", moq: "Min. order 500 pcs" },
  { id: "fashion", name: "Fashion & Apparel", emoji: "👕", icon: Scissors, suppliers: "3,500+", moq: "Min. order 50 pcs", badge: "Bulk Dealer Rate" },
  { id: "beauty", name: "Beauty & Personal", emoji: "💄", icon: Sparkles, suppliers: "1,100+", moq: "Min. order ₹5,000" },
  { id: "industrial", name: "Industrial Tools", emoji: "🔧", icon: Wrench, suppliers: "2,100+", moq: "Min. order ₹10,000" },
  { id: "home", name: "Home & Kitchen", emoji: "🍳", icon: Home, suppliers: "1,800+", moq: "Min. order 20 units" },
  { id: "office", name: "Office Supplies", emoji: "🗂️", icon: BookOpen, suppliers: "1,200+", moq: "Min. order 20 units" },
  { id: "restaurant", name: "Restaurant Equipment", emoji: "🍽️", icon: UtensilsCrossed, suppliers: "1,000+", moq: "Min. order ₹5,000" },
];

function TopCategories() {
  return (
    <section className="w-full py-12 sm:py-16 bg-white border-b border-gray-200/60">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-[#0B6E5D] bg-[#E6F4F1] px-3.5 py-1 rounded-full mb-3">
              <Grid size={15} />
              <span>Wholesale Directory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1F2937]">
              Explore 150+ Wholesale Categories
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium mt-1">
              Source inventory in bulk directly from 20,000+ verified wholesale shops and regional distributors.
            </p>
          </div>
          <a
            href="#catalog"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-[#0B6E5D] text-[#0B6E5D] hover:text-white font-extrabold text-xs sm:text-sm border border-gray-200/80 hover:border-[#0B6E5D] transition-all duration-200 shrink-0 shadow-xs"
          >
            <span>View All Categories</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className={`relative flex flex-col justify-between border rounded-2xl p-5 sm:p-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden ${
                  cat.active
                    ? "border-[#2563EB] bg-gradient-to-b from-[#F5F8FF] to-white shadow-lg shadow-blue-500/10 ring-1 ring-[#2563EB]/20"
                    : "border-gray-200/80 bg-white hover:border-[#0B6E5D] hover:bg-gradient-to-b hover:from-[#F0FDF4]/30 hover:to-white shadow-xs"
                }`}
              >
                {/* Top Row: Icon & Optional Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs ${
                    cat.active 
                      ? "bg-[#2563EB] text-white" 
                      : "bg-[#F8FAFC] group-hover:bg-[#0B6E5D] text-[#0B6E5D] group-hover:text-white border border-gray-100 group-hover:border-transparent"
                  }`}>
                    <Icon size={24} />
                  </div>
                  {cat.badge && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
                      {cat.badge}
                    </span>
                  )}
                </div>

                {/* Category Info */}
                <div>
                  <h3 className="text-lg font-black text-[#1F2937] group-hover:text-[#0B6E5D] transition-colors mb-1 truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-[#6B7280] mb-4 truncate">
                    {cat.suppliers} verified shops
                  </p>
                </div>

                {/* Emoji / Thumbnail Preview */}
                <div className="h-20 rounded-2xl bg-gray-50/80 group-hover:bg-white border border-gray-100 group-hover:border-[#0B6E5D]/20 flex items-center justify-center text-4xl mb-4 shadow-inner transition-colors">
                  <span className="group-hover:scale-125 transition-transform duration-300 inline-block drop-shadow-sm">
                    {cat.emoji}
                  </span>
                </div>

                {/* Footer Link & MOQ */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs sm:text-[13px] font-bold">
                  <span className="text-[#6B7280] font-semibold truncate max-w-[130px]">
                    {cat.moq}
                  </span>
                  <span className="text-[#2563EB] group-hover:text-[#0B6E5D] flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-all">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default memo(TopCategories);
