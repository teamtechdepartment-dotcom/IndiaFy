import React, { useState, useEffect } from "react";
import {
  Star, MapPin, BadgeCheck, ArrowRight, Zap, Loader2,
  Clock, Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

const NODE_META = {
  LOCAL_RETAIL: { label: "Local Retail", color: "#3B82F6" },
  WHOLESALE_B2B: { label: "Wholesale", color: "#F59E0B" },
  QUICK_COMMERCE: { label: "Quick Commerce", color: "#10B981" },
  HOME_ESSENTIALS: { label: "Home Essentials", color: "#F97316" },
  ELECTRONICS: { label: "Electronics", color: "#8B5CF6" },
  PERSONAL_CARE: { label: "Personal Care", color: "#EC4899" },
};

const FALLBACK_BANNERS = [
  "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format",
  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format",
];

function StoreCard({ store, onClick, index }) {
  const meta = NODE_META[store.nodeType] || NODE_META.LOCAL_RETAIL;
  const banner = store.banner || FALLBACK_BANNERS[index % FALLBACK_BANNERS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div
        onClick={onClick}
        className="card-base overflow-hidden cursor-pointer group"
      >
        {/* Banner */}
        <div className="relative h-40 overflow-hidden bg-gray-100">
          <img
            src={banner}
            alt={store.storeName}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Store Logo */}
          <div className="absolute bottom-3 left-3">
            {store.logo ? (
              <img loading="lazy" decoding="async" src={store.logo} alt={store.storeName} className="w-10 h-10 rounded-xl object-cover bg-white border-2 border-white shadow-md" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center text-sm font-bold text-brand-primary">
                {store.storeName?.[0]}
              </div>
            )}
          </div>
          {/* Open badge */}
          <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${
            store.isStoreOpen
              ? "bg-brand-accent text-white"
              : "bg-gray-600 text-gray-200"
          }`}>
            {store.isStoreOpen && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            {store.isStoreOpen ? "Open" : "Closed"}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Store Name */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-bold text-brand-primary line-clamp-1 group-hover:text-brand-accent transition-colors">
              {store.storeName}
            </h3>
            {store.isVerified && (
              <BadgeCheck size={16} className="text-brand-accent shrink-0 mt-0.5" />
            )}
          </div>

          {/* Category Tag */}
          <span
            className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold text-white mb-3"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label}
          </span>

          {/* Meta Row */}
          <div className="flex items-center gap-3 text-[11px] text-brand-text-secondary font-medium">
            <span className="flex items-center gap-1">
              <Star size={11} fill="#F59E0B" className="text-amber-400" />
              {(store.rating || 4.5).toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {store.dispatchSpeed || "30 min"}
            </span>
            {store.city && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {store.city}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* Skeleton loader */
function StoreSkeleton() {
  return (
    <div className="rounded-card border border-brand-border overflow-hidden">
      <div className="h-40 bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-lg w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

export default function VerifiedStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/public/stores?limit=8");
        const fetchedStores = res?.stores || [];
        setStores(fetchedStores);
      } catch (_err) {
        console.error("Fetch public stores failed:", _err);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  if (loading) {
    return (
      <section className="py-section-mobile md:py-section-tablet lg:py-20 bg-white">
        <div className="section-container">
          <div className="h-8 bg-gray-100 rounded-lg w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <StoreSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (stores.length === 0) {
    return (
      <section className="py-section-mobile md:py-section-tablet lg:py-20 bg-white">
        <div className="section-container text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-background flex items-center justify-center">
              <Store size={28} className="text-brand-text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-brand-primary mb-2">No stores yet</h2>
            <p className="text-brand-text-secondary text-sm mb-6">Be the first to create a store on Indiafy!</p>
            <button
              onClick={() => navigate("/seller/login")}
              className="btn-primary"
            >
              Open Your Store
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-section-mobile md:py-section-tablet lg:py-20 bg-white" id="stores">
      <div className="section-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-heading mb-2">Featured Stores Near You</h2>
            <p className="text-brand-text-secondary text-sm sm:text-base font-medium">
              {stores.length} active store{stores.length !== 1 ? "s" : ""} selling live on Indiafy
            </p>
          </motion.div>

          <button
            onClick={() => navigate("/stores")}
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.slice(0, 6).map((store, index) => (
            <StoreCard
              key={store._id}
              store={store}
              index={index}
              onClick={() => navigate(`/store/${store._id}`)}
            />
          ))}
        </div>

        {/* Mobile View All */}
        <button
          onClick={() => navigate("/stores")}
          className="md:hidden flex items-center justify-center gap-2 w-full mt-6 py-3 text-sm font-semibold text-brand-accent border border-brand-accent/20 rounded-xl hover:bg-emerald-50 transition-colors"
        >
          View All Stores <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
