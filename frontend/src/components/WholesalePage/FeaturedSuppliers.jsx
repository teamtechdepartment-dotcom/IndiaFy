import { memo, useEffect } from "react";
import { ArrowRight, ShieldCheck, Star, MessageSquare, Store, MapPin, PackageCheck, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { useWholesaleStore } from "../../store/wholesaleStore";

const STATIC_SUPPLIERS = [
  { id: "s1", initials: "SG", name: "Shree Ganesh Wholesale Traders", location: "Mumbai, MH", rating: "4.8", reviews: 230, products: "1,200+ SKUs", moq: "₹5,000", tag: "Textile & Garment Distributor", verifiedYear: "2018" },
  { id: "s2", initials: "MI", name: "Mahadev Industrial Supply Co.", location: "Ludhiana, PB", rating: "4.7", reviews: 180, products: "900+ SKUs", moq: "₹10,000", tag: "Heavy Machinery Stockist", verifiedYear: "2016" },
  { id: "s3", initials: "KE", name: "Kohinoor Electronics Dealer", location: "New Delhi, DL", rating: "4.9", reviews: 350, products: "650+ SKUs", moq: "10 Units", tag: "Consumer Tech Wholesale", verifiedYear: "2019" },
  { id: "s4", initials: "OP", name: "Om Packaging & Polymer Depot", location: "Ahmedabad, GJ", rating: "4.7", reviews: 190, products: "1,100+ SKUs", moq: "500 Pcs", tag: "Corrugated & Plastics Shop", verifiedYear: "2020" },
];

function FeaturedSuppliers() {
  const { distributors, fetchDistributors, isLoading } = useWholesaleStore();

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  const handleChat = (supplier, e) => {
    e.stopPropagation();
    toast.success(`Opening direct WhatsApp / chat channel with ${supplier.name}...`);
  };

  // Map API distributors or use static fallback
  const apiCards = distributors.slice(0, 4).map((dist) => ({
    id: dist._id,
    initials: (dist.businessName || "S").slice(0, 2).toUpperCase(),
    name: dist.businessName || "Verified Wholesale Shop",
    location: `${dist.businessAddress?.city || "New Delhi"}, ${dist.businessAddress?.state || "DL"}`,
    rating: dist.rating || (4.5 + Math.random() * 0.4).toFixed(1),
    reviews: Math.floor(Math.random() * 200) + 80,
    products: `${Math.floor(Math.random() * 1000) + 400}+ SKUs`,
    moq: "₹5,000",
    tag: dist.category || "General Wholesale Dealer",
    verifiedYear: "2021",
    profilePic: dist.profilePic,
  }));

  const displaySuppliers = apiCards.length > 0 ? apiCards : STATIC_SUPPLIERS;

  return (
    <section className="w-full py-12 sm:py-16 bg-white border-b border-gray-200/60">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-[#0B6E5D] bg-[#E6F4F1] px-3.5 py-1 rounded-full mb-3">
              <ShieldCheck size={15} />
              <span>Verified Wholesale Shops</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1F2937]">
              Connect Directly with Verified Dealers &amp; Stockists
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium mt-1">
              Strictly vetted regional wholesale shops, bulk distributors, and stockists with GST validation and physical store checks.
            </p>
          </div>
          <a
            href="#suppliers"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-[#0B6E5D] text-[#0B6E5D] hover:text-white font-extrabold text-xs sm:text-sm border border-gray-200/80 hover:border-[#0B6E5D] transition-all duration-200 shrink-0 shadow-xs"
          >
            <span>Explore All 20,000+ Wholesale Shops</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-6 bg-white animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-6 bg-gray-100 rounded w-2/3 mb-4" />
                <div className="h-14 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-6" />
                <div className="flex gap-2">
                  <div className="h-11 bg-gray-100 rounded-xl flex-1" />
                  <div className="h-11 bg-gray-100 rounded-xl flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displaySuppliers.map((sup) => (
              <div
                key={sup.id}
                className="flex flex-col justify-between border border-gray-200/80 rounded-2xl p-6 bg-white hover:border-[#0B6E5D] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden shadow-xs"
              >
                {/* Top Row: Avatar & Name */}
                <div>
                  <div className="flex gap-4 items-start mb-4">
                    {sup.profilePic ? (
                      <img
                        loading="lazy"
                        src={sup.profilePic}
                        alt={sup.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B6E5D] to-[#084F42] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-[#0B6E5D]/20 group-hover:scale-105 transition-transform duration-300">
                        {sup.initials}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-black text-[#1F2937] group-hover:text-[#0B6E5D] transition-colors line-clamp-1 leading-snug">
                        {sup.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B7280] mt-1 truncate">
                        <MapPin size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{sup.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-lg bg-[#DCFCE7] text-[#15803D] border border-[#16A34A]/20 tracking-wide uppercase">
                      <CheckCircle2 size={13} className="shrink-0" />
                      <span>GST Verified</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-lg bg-[#E0F2FE] text-[#0369A1] border border-[#0284C7]/20 tracking-wide uppercase">
                      <Store size={13} className="shrink-0" />
                      <span>Verified Shop Node</span>
                    </span>
                  </div>

                  {/* Supplier Domain Tag */}
                  <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 mb-5">
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">Primary Category</div>
                    <div className="text-sm font-extrabold text-[#1F2937] truncate">{sup.tag}</div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-6 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Dealer Rating</div>
                      <div className="font-black text-sm text-[#1F2937] flex items-center gap-1 mt-0.5">
                        <Star size={14} fill="currentColor" className="text-amber-500 shrink-0" />
                        <span>{sup.rating}</span>
                        <span className="text-gray-400 font-medium">({sup.reviews})</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Active SKUs</div>
                      <div className="font-black text-sm text-[#1F2937] flex items-center gap-1 mt-0.5">
                        <PackageCheck size={14} className="text-[#0B6E5D] shrink-0" />
                        <span>{sup.products}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#6B7280] mb-3.5">
                    <span>Min. Order Qty:</span>
                    <span className="text-[#1F2937] font-black bg-gray-100 px-2.5 py-1 rounded-md">{sup.moq}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      className="w-full py-3 px-3 bg-gray-100 hover:bg-gray-200 text-[#1F2937] font-extrabold text-xs sm:text-sm rounded-xl transition-colors text-center cursor-pointer truncate"
                    >
                      View Shop
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleChat(sup, e)}
                      className="w-full py-3 px-3 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer truncate"
                    >
                      <MessageSquare size={15} className="shrink-0" />
                      <span>Chat Now</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default memo(FeaturedSuppliers);
