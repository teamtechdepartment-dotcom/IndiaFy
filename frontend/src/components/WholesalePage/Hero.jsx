import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, ShieldCheck, CheckCircle2, ArrowRight, 
  Sparkles, TrendingUp, Store, Package, MapPin, 
  Filter, Award, Truck, Lock
} from "lucide-react";

const HERO_STATS = [
  { num: "20,000+", label: "Verified Wholesale Shops", icon: Store },
  { num: "150+", label: "Product Categories", icon: Package },
  { num: "₹250Cr+", label: "Annual Bulk Volume", icon: TrendingUp },
  { num: "99.4%", label: "On-Time Fulfillment", icon: Award },
];

const TRUST_PILLS = [
  { text: "100% GST Verified Sellers", icon: ShieldCheck },
  { text: "Verified Wholesale Shops", icon: Store },
  { text: "Pan-India Logistics", icon: Truck },
  { text: "Escrow Payment Protection", icon: Lock },
];

function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pincode, setPincode] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (selectedCategory !== "all") params.append("category", selectedCategory);
    if (pincode) params.append("pincode", pincode);
    navigate(`/search?type=wholesale&${params.toString()}`);
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-[#E6F4F1]/70 via-white to-[#F8FAFC] border-b border-gray-200/80 overflow-hidden pt-8 pb-14 sm:py-16 lg:py-24">
      {/* Background Glows for Ultra-Wide Screens */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#0B6E5D]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Full Screen Generous Container */}
      <div className="max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Typography & Search Engine */}
          <div className="lg:col-span-7 flex flex-col text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6F4F1] border border-[#0B6E5D]/25 text-[#0B6E5D] text-xs sm:text-sm font-bold tracking-wide w-fit mb-6 shadow-xs hover:bg-[#d5ece7] transition-colors">
              <Sparkles size={16} className="text-[#0B6E5D] animate-pulse" />
              <span>India&apos;s #1 B2B Wholesale &amp; Bulk Sourcing Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl xl:text-6xl 2xl:text-7xl font-black text-[#1F2937] tracking-tight leading-[1.12] mb-6">
              Source Wholesale Inventory <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#0B6E5D] via-[#10B981] to-[#059669] bg-clip-text text-transparent">
                In Bulk From Verified Shops
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg xl:text-xl text-[#4B5563] font-medium leading-relaxed max-w-3xl mb-8">
              Connect instantly with verified wholesale shops, bulk stockists, and primary distributors across India. Get tiered dealer rates, compare quotes, and maximize your retail margins.
            </p>

            {/* Trust Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {TRUST_PILLS.map((pill, idx) => {
                const Icon = pill.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#1F2937] bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-gray-200/80 shadow-2xs">
                    <Icon size={18} className="text-[#16A34A] shrink-0" />
                    <span className="truncate">{pill.text}</span>
                  </div>
                );
              })}
            </div>

            {/* High-Converting Responsive Search Form */}
            <form onSubmit={handleSearch} className="bg-white p-3.5 sm:p-5 rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/70 mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                
                {/* Search Input */}
                <div className="sm:col-span-6 relative flex items-center">
                  <Search size={20} className="absolute left-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search wholesale products, shops, or brands..."
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm sm:text-base font-semibold text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E5D] focus:bg-white transition-all"
                  />
                </div>

                {/* Category Select */}
                <div className="sm:col-span-3 relative flex items-center">
                  <Filter size={18} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-8 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm sm:text-base font-semibold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#0B6E5D] focus:bg-white appearance-none cursor-pointer truncate transition-all"
                  >
                    <option value="all">All Categories</option>
                    <option value="FMCG">FMCG &amp; Staples</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion &amp; Apparel</option>
                    <option value="Grocery">Grocery &amp; Food</option>
                    <option value="Packaging">Industrial Packaging</option>
                  </select>
                </div>

                {/* Pincode */}
                <div className="sm:col-span-3 relative flex items-center">
                  <MapPin size={18} className="absolute left-3.5 text-gray-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Pincode"
                    className="w-full pl-10 pr-3 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm sm:text-base font-semibold text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B6E5D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Submit / Action Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs sm:text-sm font-bold text-gray-600 flex items-center gap-2 self-start sm:self-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>2,450+ verified wholesale shops online right now</span>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/post-requirement")}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#1F2937] font-extrabold text-xs sm:text-sm rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer"
                  >
                    Post RFQ Instead
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D97706] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#F97316]/30 hover:shadow-xl hover:shadow-[#F97316]/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span>Find Suppliers</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </form>

            {/* Stats Counter Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {HERO_STATS.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 flex items-center gap-3.5 shadow-xs">
                    <div className="w-12 h-12 rounded-xl bg-[#0B6E5D]/10 flex items-center justify-center text-[#0B6E5D] shrink-0">
                      <Icon size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xl sm:text-2xl font-black text-[#1F2937] leading-tight truncate">{stat.num}</div>
                      <div className="text-xs sm:text-sm font-bold text-[#6B7280] truncate">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Interactive B2B Wholesale Sourcing Hub Visual */}
          <div className="lg:col-span-5 w-full mt-6 lg:mt-0">
            <div className="relative bg-gradient-to-br from-[#084F42] via-[#0B6E5D] to-[#0E7A67] rounded-3xl p-6 sm:p-8 xl:p-10 text-white shadow-2xl border border-white/20 overflow-hidden group hover:shadow-[#0B6E5D]/30 transition-shadow duration-500">
              
              {/* Decorative Abstract Rings */}
              <div className="absolute -right-20 -top-20 w-80 h-80 border-[20px] border-white/5 rounded-full pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-60 h-60 border-[14px] border-white/5 rounded-full pointer-events-none" />

              {/* Header Badge */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/15 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/20 shadow-inner">
                    IF
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg leading-tight">Wholesale Sourcing Hub</h3>
                    <p className="text-xs text-emerald-200 font-semibold">Live Bulk Dealer Feed</p>
                  </div>
                </div>
                <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Verified Shop Node
                </span>
              </div>

              {/* Mock Live Deal Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 mb-5 relative z-10 hover:bg-white/15 transition-colors shadow-lg">
                <div className="flex justify-between items-start mb-2.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md">
                    🔥 Hot Bulk Deal
                  </span>
                  <span className="text-xs font-extrabold text-white bg-white/20 px-2.5 py-1 rounded-md">
                    MOQ: 500 Pcs
                  </span>
                </div>
                <h4 className="font-black text-lg sm:text-xl mb-1.5 truncate">
                  1121 Premium Basmati Rice (Export Quality Bag)
                </h4>
                <p className="text-xs sm:text-sm text-gray-200 mb-4 truncate font-medium">
                  By Karnal Wholesale Grain Store • GST &amp; Trade Certified
                </p>
                <div className="flex items-end justify-between pt-3.5 border-t border-white/10">
                  <div>
                    <div className="text-[10px] text-gray-300 uppercase font-bold tracking-wider">Wholesale Rate</div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-300">₹68<span className="text-xs font-bold text-white"> / kg</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-300 uppercase font-bold tracking-wider">Market Retail</div>
                    <div className="text-sm sm:text-base font-bold line-through text-gray-300">₹110 / kg</div>
                  </div>
                  <div className="bg-[#F97316] text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md">
                    Save 38%
                  </div>
                </div>
              </div>

              {/* Secondary Notification Pill */}
              <div className="bg-black/35 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center justify-between text-xs sm:text-sm font-semibold relative z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="truncate">Recent RFQ: <strong className="text-white">10,000 units LED Bulbs</strong> closed at ₹42/pc with Delhi Wholesale Hub</span>
                </div>
                <span className="text-emerald-300 font-extrabold text-xs whitespace-nowrap ml-3">2 mins ago</span>
              </div>

              {/* Bottom Trust Guarantee Strip */}
              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-100/90 relative z-10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>100% Escrow Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>Verified Shop Inspections</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
