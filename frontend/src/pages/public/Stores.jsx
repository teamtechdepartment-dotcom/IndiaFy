import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Star, MapPin, Clock, Zap, Store, Filter, X,
  SlidersHorizontal, ChevronDown, BadgeCheck, Loader2,
  ShoppingBag, ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import axiosInstance from "../../utils/axiosInstance";

/* ============================================================
   NODE TYPE CONFIG
============================================================ */
const NODE_TYPES = [
  { value: "", label: "All Stores", emoji: "🛍️" },
  { value: "LOCAL_RETAIL", label: "Local Retail", emoji: "🏪" },
  { value: "QUICK_COMMERCE", label: "Quick Commerce", emoji: "⚡" },
  { value: "WHOLESALE_B2B", label: "Wholesale", emoji: "🏭" },
  { value: "HOME_ESSENTIALS", label: "Home Essentials", emoji: "🏠" },
  { value: "ELECTRONICS", label: "Electronics", emoji: "💻" },
  { value: "PERSONAL_CARE", label: "Personal Care", emoji: "✨" },
];

const NODE_COLORS = {
  LOCAL_RETAIL: "#3B82F6",
  WHOLESALE_B2B: "#F59E0B",
  QUICK_COMMERCE: "#10B981",
  HOME_ESSENTIALS: "#F97316",
  ELECTRONICS: "#8B5CF6",
  PERSONAL_CARE: "#EC4899",
};

const FALLBACK_BANNERS = [
  "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=800",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800",
  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800",
];

function getFallback(id) {
  const hash = [...(id || "abc")].reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACK_BANNERS[hash % FALLBACK_BANNERS.length];
}

/* ============================================================
   STORE CARD
============================================================ */
function StoreCard({ store, onClick }) {
  const color = NODE_COLORS[store.nodeType] || "#6B7280";
  const nodeMeta = NODE_TYPES.find((n) => n.value === store.nodeType);
  const banner = store.banner || getFallback(store._id);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/60 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
    >
      {/* Banner */}
      <div className="relative h-40 overflow-hidden bg-zinc-100">
        <img
          src={banner}
          alt={store.storeName}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider
            ${store.isStoreOpen ? "bg-emerald-500 text-white" : "bg-zinc-800/80 text-zinc-300"}`}>
            {store.isStoreOpen && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            )}
            {store.isStoreOpen ? "Open" : "Closed"}
          </div>
          {store.isVerified && (
            <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold text-zinc-900">
              <BadgeCheck size={9} color="#3B82F6" /> Verified
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-zinc-900 flex items-center gap-1">
          <Zap size={10} color={color} />
          {store.dispatchSpeed || "30 mins"}
        </div>

        {/* Logo overlay */}
        {store.logo && (
          <div className="absolute -bottom-5 left-4">
            <img src={store.logo} alt={store.storeName}
              className="w-10 h-10 rounded-xl border-2 border-white shadow-md object-cover bg-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 ${store.logo ? "pt-7" : "pt-4"}`}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-black text-zinc-900 text-sm leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
            {store.storeName}
          </h3>
          <div className="flex items-center gap-0.5 text-[11px] font-bold text-zinc-900 shrink-0">
            <Star size={11} fill="currentColor" className="text-amber-400" />
            {(store.rating || 4.5).toFixed(1)}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider"
            style={{ backgroundColor: color }}>
            {nodeMeta?.emoji} {nodeMeta?.label || store.nodeType}
          </span>
        </div>

        {store.storeCategory && (
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            {store.storeCategory}
          </p>
        )}

        {store.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">{store.description}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-bold">
            {store.city && (
              <span className="flex items-center gap-1">
                <MapPin size={10} className="text-zinc-300" /> {store.city}
              </span>
            )}
            {store.deliveryRadius && (
              <span className="flex items-center gap-1">
                <Clock size={10} className="text-zinc-300" /> {store.deliveryRadius}km
              </span>
            )}
          </div>
          <button className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
            Visit <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */
export default function Stores() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [city, setCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef(null);

  /* ---------- debounce search ---------- */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  /* ---------- fetch stores ---------- */
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (selectedType) params.append("nodeType", selectedType);
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (city) params.append("city", city);

      const res = await axiosInstance.get(`/public/stores?${params}`);
      setStores(res?.stores || []);
      setTotal(res?.total || 0);
    } catch (err) {
      console.error("Fetch stores error:", err);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, debouncedSearch, city]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const clearFilters = () => {
    setSearch("");
    setSelectedType("");
    setCity("");
  };

  const hasFilters = search || selectedType || city;

  return (
    <>
      <WebsiteNavbar />
      <main className="min-h-screen bg-slate-50">

        {/* HERO */}
        <section className="bg-zinc-900 pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShoppingBag className="text-blue-400" size={20} />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Indiafy Marketplace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              Discover Local Stores
            </h1>
            <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
              Browse {total > 0 ? `${total} live` : "hundreds of"} stores across categories — from quick commerce to wholesale.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stores, categories..."
                className="w-full pl-11 pr-12 py-4 bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-zinc-500 rounded-2xl font-medium text-sm outline-none focus:bg-white/15 focus:border-white/40 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <div className="sticky top-16 z-30 bg-white border-b border-zinc-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
              {/* Type filter chips */}
              {NODE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0
                    ${selectedType === type.value
                      ? "bg-zinc-900 text-white shadow-md"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                >
                  <span>{type.emoji}</span> {type.label}
                </button>
              ))}

              <div className="h-6 w-px bg-zinc-200 shrink-0 mx-1" />

              {/* City filter */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0
                  ${showFilters ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
              >
                <SlidersHorizontal size={13} /> Filters
                {hasFilters && !showFilters && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 ml-0.5" />
                )}
              </button>

              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all shrink-0">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {/* Expandable filter row */}
            {showFilters && (
              <div className="mt-3 pb-1 flex items-center gap-3">
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Filter by city..."
                    className="pl-8 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-zinc-400 transition-all w-44"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STORE GRID */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold text-zinc-500">
              {loading ? "Loading..." : `${stores.length} store${stores.length !== 1 ? "s" : ""} found`}
              {selectedType && ` · ${NODE_TYPES.find((n) => n.value === selectedType)?.label}`}
              {city && ` · ${city}`}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-zinc-300" size={36} />
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading Stores...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Store size={48} className="text-zinc-200 mb-4" />
              <h3 className="text-xl font-black text-zinc-900 mb-2">No stores found</h3>
              <p className="text-zinc-500 text-sm mb-6 max-w-sm">
                {hasFilters ? "Try adjusting your filters or search terms." : "Be the first seller to open a store!"}
              </p>
              {hasFilters ? (
                <button onClick={clearFilters}
                  className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all">
                  Clear Filters
                </button>
              ) : (
                <button onClick={() => navigate("/seller-auth")}
                  className="px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all">
                  Open Your Store →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {stores.map((store) => (
                <StoreCard
                  key={store._id}
                  store={store}
                  onClick={() => navigate(`/store/${store._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* SELLER CTA */}
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="relative bg-zinc-900 rounded-3xl overflow-hidden p-8 md:p-12 text-center"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 30% 40%, #3B82F6 0%, transparent 50%), radial-gradient(circle at 70% 60%, #8B5CF6 0%, transparent 50%)" }} />
            <div className="relative z-10">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Sell on Indiafy</h2>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                Launch your store in minutes. Reach thousands of local customers instantly.
              </p>
              <button
                onClick={() => navigate("/seller-auth")}
                className="px-8 py-4 bg-white text-zinc-900 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-2xl text-sm flex items-center gap-2 mx-auto"
              >
                Start Selling for Free <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
