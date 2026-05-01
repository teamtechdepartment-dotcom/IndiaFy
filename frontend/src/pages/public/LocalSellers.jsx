import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  BadgeCheck,
  Zap,
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "../../store/productStore";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import axiosInstance from "../../utils/axiosInstance";

export default function LocalSellers() {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useProductStore();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Filters merge with static ones
  const FILTERS = ["All", ...categories, "Top Rated", "Live Now"];

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axiosInstance.get("/seller/auth/all");
        // Mapping backend fields to UI fields
        const sellersData = res.data.data || res.data || [];
        const mappedSellers = sellersData.map(s => ({
          id: s._id,
          name: s.businessName || `${s.firstName}'s Store`,
          type: "Quick Commerce", // Default or map if available
          tags: "Essentials • Grocery",
          distance: "0.8 km",
          rating: "4.8",
          time: "15 mins",
          img: s.logo || "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=800",
          isLive: true,
          badge: "Verified",
        }));
        setSellers(mappedSellers);
      } catch (err) {
        console.error("Fetch sellers failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  // Filter Logic
  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.tags.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "All") return true;
    if (activeFilter === "Live Now") return seller.isLive;
    if (activeFilter === "Top Rated") return parseFloat(seller.rating) >= 4.8;
    return seller.type === activeFilter;
  });

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans">
      <WebsiteNavbar />

      <main className="pt-24 pb-24">
        {/* 🗺️ HEADER & SEARCH SECTION */}
        <section className="bg-white/90 backdrop-blur-2xl px-4 sm:px-6 lg:px-8 py-6 border-b border-zinc-200 z-40 shadow-sm relative">
          <div className="max-w-7xl mx-auto">
            {/* Location & Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <div className="p-1.5 bg-zinc-100 rounded-lg">
                    <Navigation size={14} className="text-zinc-600" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500">
                    Current Node: Sector 45
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter"
                >
                  Local Verified Nodes
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-bold text-zinc-500 bg-zinc-100 px-4 py-2.5 rounded-xl flex items-center gap-2 w-fit border border-zinc-200"
              >
                <BadgeCheck size={16} className="text-emerald-500" />
                {filteredSellers.length} Nodes Found
              </motion.div>
            </div>

            {/* Search & Filter Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search
                    size={18}
                    className="text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search stores, groceries, hardware..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-100 border border-transparent focus:border-zinc-300 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 transition-all outline-none shadow-sm"
                />
              </div>

              {/* Filter Button */}
              <button className="hidden md:flex items-center gap-2 bg-white border border-zinc-200 text-zinc-900 px-6 py-3.5 rounded-2xl font-bold text-sm hover:bg-zinc-50 transition-colors active:scale-95 shadow-sm">
                <SlidersHorizontal size={18} /> Filters
              </button>
            </div>

            {/* Horizontal Scrollable Filter Chips */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mt-5 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                    activeFilter === filter
                      ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/20"
                      : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 🏪 SELLERS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSellers.map((seller, index) => (
                <motion.div
                  key={seller.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  /* 🔥 Ye click karke navigate karega (poore card ke liye) */
                  onClick={() => navigate(`/store/${seller.id}`)}
                  className="bg-white p-3 md:p-4 rounded-[2rem] border border-zinc-100 hover:border-zinc-300 hover:shadow-2xl transition-all duration-500 group flex flex-col h-full cursor-pointer"
                >
                  {/* Card Image area */}
                  <div className="relative w-full aspect-video md:aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 bg-zinc-100 shrink-0">
                    <img
                      src={seller.img}
                      alt={seller.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Gradient Overlay for better badge readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                      {seller.isLive && (
                        <div className="bg-emerald-500/95 backdrop-blur-md px-3 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{" "}
                          Live
                        </div>
                      )}
                      {seller.badge && (
                        <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-zinc-900 text-[9px] font-black uppercase tracking-widest shadow-sm">
                          {seller.badge}
                        </div>
                      )}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl text-zinc-900 text-[10px] font-black flex items-center gap-1 shadow-sm">
                      <Star
                        size={10}
                        fill="currentColor"
                        className="text-amber-400"
                      />
                      {seller.rating}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 flex flex-col px-2">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-zinc-900 text-lg leading-tight line-clamp-1">
                        {seller.name}
                      </h3>
                    </div>

                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                      {seller.tags}
                    </p>

                    {/* Info Pills */}
                    <div className="grid grid-cols-2 gap-2 mb-5 mt-auto">
                      <div className="bg-zinc-50 rounded-xl p-2.5 flex items-center justify-center gap-1.5 border border-zinc-100">
                        <MapPin size={12} className="text-zinc-400" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate">
                          {seller.distance}
                        </span>
                      </div>
                      <div className="bg-zinc-50 rounded-xl p-2.5 flex items-center justify-center gap-1.5 border border-zinc-100">
                        {seller.type === "Quick Commerce" ? (
                          <Zap size={12} className="text-emerald-500" />
                        ) : (
                          <Clock size={12} className="text-blue-500" />
                        )}
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest truncate">
                          {seller.time}
                        </span>
                      </div>
                    </div>

                    {/* 🔥 Action Button (Ispe click lagaya taaki strict routing ho) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Card ke double click issues rokiyega
                        navigate(`/store/${seller.id}`);
                      }}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-zinc-900 group-hover:border-zinc-900 group-hover:text-white transition-all active:scale-95"
                    >
                      Visit Store <ArrowUpRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredSellers.length === 0 && (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white border border-zinc-200 shadow-sm rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="text-zinc-300" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2 tracking-tighter">
                No Nodes Found
              </h3>
              <p className="text-zinc-500 font-medium text-sm">
                Try adjusting your filters or searching for something else.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                }}
                className="mt-6 text-xs font-black uppercase tracking-widest text-zinc-900 bg-white border border-zinc-200 px-6 py-3 rounded-full hover:bg-zinc-50 shadow-sm active:scale-95 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Hide Scrollbar for filters */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
