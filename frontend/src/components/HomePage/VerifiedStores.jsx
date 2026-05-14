import React, { useState, useEffect } from "react";
import {
  Star, MapPin, BadgeCheck, ArrowUpRight, Zap, Loader2,
  Clock, ShoppingBag, ChevronRight, Store
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

/* ============================================================
   NODE TYPE META
============================================================ */
const NODE_META = {
  LOCAL_RETAIL: { label: "Local Retail", color: "#3B82F6", emoji: "🏪" },
  WHOLESALE_B2B: { label: "Wholesale", color: "#F59E0B", emoji: "🏭" },
  QUICK_COMMERCE: { label: "Quick Commerce", color: "#10B981", emoji: "⚡" },
  HOME_ESSENTIALS: { label: "Home Essentials", color: "#F97316", emoji: "🏠" },
  ELECTRONICS: { label: "Electronics", color: "#8B5CF6", emoji: "💻" },
  PERSONAL_CARE: { label: "Personal Care", color: "#EC4899", emoji: "✨" },
};

const FALLBACK_BANNERS = [
  "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=1200&auto=format",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format",
  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1200&auto=format",
];

/* ============================================================
   OPEN/CLOSED BADGE
============================================================ */
function StoreBadge({ isOpen }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
      ${isOpen ? "bg-emerald-500/90 text-white" : "bg-zinc-800/80 text-zinc-300"}`}>
      {isOpen && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      )}
      {isOpen ? "Open Now" : "Closed"}
    </div>
  );
}

/* ============================================================
   LARGE FEATURED CARD
============================================================ */
function FeaturedStoreCard({ store, onClick }) {
  const meta = NODE_META[store.nodeType] || NODE_META.LOCAL_RETAIL;
  const banner = store.banner || FALLBACK_BANNERS[0];

  return (
    <div
      onClick={onClick}
      className="lg:col-span-7 group relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-900 h-[350px] sm:h-[420px] cursor-pointer"
    >
      <img
        src={banner}
        alt={store.storeName}
        loading="lazy"
        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
      />

      {/* Top badges */}
      <div className="absolute top-4 md:top-6 left-4 md:left-6 flex flex-wrap gap-2">
        <StoreBadge isOpen={store.isStoreOpen} />
        {store.isVerified && (
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white text-[9px] font-bold uppercase tracking-widest">
            <BadgeCheck size={10} /> Verified
          </div>
        )}
      </div>

      {/* Dispatch speed badge */}
      <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-white text-zinc-900 px-3 py-2 rounded-xl shadow-xl flex flex-col items-center gap-0.5">
        <Zap size={14} className="mb-0.5" />
        <span className="text-[10px] font-black leading-none">{store.dispatchSpeed || "30 mins"}</span>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent">
        {/* Logo + node type */}
        <div className="flex items-center gap-3 mb-3">
          {store.logo ? (
            <img src={store.logo} alt={store.storeName} className="w-10 h-10 rounded-xl object-cover bg-white border border-white/20" />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: meta.color + "30" }}>{meta.emoji}</div>
          )}
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{meta.label}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1 bg-white/10 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                <Star size={10} fill="currentColor" /> {(store.rating || 4.5).toFixed(1)}
              </div>
              {store.city && (
                <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
                  <MapPin size={10} /> {store.city}
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-black text-white mb-1 leading-tight group-hover:text-blue-200 transition-colors">
          {store.storeName}
        </h3>
        {store.description && (
          <p className="text-zinc-400 text-sm line-clamp-1">{store.description}</p>
        )}

        {store.storeCategory && (
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mt-1">{store.storeCategory}</p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SMALL SIDE CARD
============================================================ */
function SmallStoreCard({ store, onClick }) {
  const meta = NODE_META[store.nodeType] || NODE_META.LOCAL_RETAIL;
  const banner = store.banner || FALLBACK_BANNERS[Math.floor(Math.random() * FALLBACK_BANNERS.length)];

  return (
    <div
      onClick={onClick}
      className="group relative bg-zinc-50 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 border border-zinc-100 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/80 transition-all duration-500 cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl md:rounded-2xl overflow-hidden shrink-0">
          <img
            src={store.logo || banner}
            alt={store.storeName}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
          />
          <div className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider
            ${store.isStoreOpen ? "bg-emerald-500 text-white" : "bg-zinc-700 text-zinc-300"}`}>
            {store.isStoreOpen ? "Open" : "Closed"}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-zinc-900 text-sm md:text-base leading-tight pr-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {store.storeName}
            </h3>
            <div className="flex items-center gap-0.5 text-zinc-900 font-bold text-xs bg-white px-1.5 py-0.5 rounded-lg shadow-sm border border-zinc-100 shrink-0">
              <Star size={10} fill="currentColor" /> {(store.rating || 4.5).toFixed(1)}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: meta.color }}>{meta.label}</span>
          </div>

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 line-clamp-1">
            {store.storeCategory || "General Store"}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
              <Clock size={11} className="text-zinc-300" />
              {store.dispatchSpeed || "30 mins"}
              {store.city && (
                <><MapPin size={11} className="text-zinc-300 ml-1" />{store.city}</>
              )}
            </div>
            <button className="p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 active:scale-95 transition-all">
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function VerifiedStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        // Fetch from public endpoint — no auth required
        const res = await axiosInstance.get("/public/stores?limit=8");
        const fetchedStores = res?.stores || [];
        setStores(fetchedStores);
      } catch (err) {
        console.error("Fetch public stores failed:", err);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-zinc-300 mb-4" size={32} />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading Marketplace...</p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Store size={48} className="mx-auto text-zinc-200 mb-4" />
          <h2 className="text-2xl font-black text-zinc-300">No stores yet</h2>
          <p className="text-zinc-400 mt-2 text-sm">Be the first to create a store on Indiafy!</p>
          <button
            onClick={() => navigate("/seller-auth")}
            className="mt-6 px-8 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all"
          >
            Open Your Store →
          </button>
        </div>
      </section>
    );
  }

  const [featuredStore, ...otherStores] = stores;

  return (
    <section className="pt-20 pb-20 md:pt-24 md:pb-24 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="text-zinc-900" size={18} />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-zinc-500">
                Live Marketplace
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-none">
              Stores Near You
            </h2>
            <p className="text-zinc-500 mt-3 text-sm md:text-base max-w-lg">
              {stores.length} active store{stores.length !== 1 ? "s" : ""} selling live on Indiafy marketplace.
            </p>
          </div>

          <button
            onClick={() => navigate("/stores")}
            className="self-start md:self-auto flex items-center gap-1 text-xs md:text-sm font-bold border-b-2 border-zinc-900 pb-1 hover:text-zinc-500 hover:border-zinc-300 transition-all uppercase tracking-widest active:scale-95"
          >
            View All Stores <ChevronRight size={14} />
          </button>
        </div>

        {/* STORE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

          {/* Featured large card */}
          <div className="lg:col-span-7">
            <FeaturedStoreCard
              store={featuredStore}
              onClick={() => navigate(`/store/${featuredStore._id}`)}
            />
          </div>

          {/* Side list */}
          <div className="lg:col-span-5 flex flex-col gap-4 md:gap-5">
            {otherStores.slice(0, 3).map((store) => (
              <SmallStoreCard
                key={store._id}
                store={store}
                onClick={() => navigate(`/store/${store._id}`)}
              />
            ))}

            {/* View more */}
            <div
              onClick={() => navigate("/stores")}
              className="p-5 border-2 border-dashed border-zinc-200 rounded-[1.5rem] flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer active:scale-[0.98] gap-2"
            >
              <ShoppingBag size={16} className="text-zinc-400" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Explore {Math.max(0, stores.length - 4)} more stores
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
