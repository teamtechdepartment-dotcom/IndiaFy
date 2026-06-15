import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowRight, Store } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { StoreSkeleton } from "../ui/skeletons/StoreSkeleton";

const NODE_META = {
  LOCAL_RETAIL: { label: "Local", color: "#3B82F6" },
  WHOLESALE_B2B: { label: "Wholesale", color: "#F59E0B" },
  QUICK_COMMERCE: { label: "Quick", color: "#10B981" },
  HOME_ESSENTIALS: { label: "Home", color: "#F97316" },
  ELECTRONICS: { label: "Electronics", color: "#8B5CF6" },
  PERSONAL_CARE: { label: "Care", color: "#EC4899" },
};

function MiniStoreCard({ store, onClick }) {
  const meta = NODE_META[store.nodeType] || NODE_META.LOCAL_RETAIL;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-brand-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {store.logo ? (
          <img loading="lazy" decoding="async" src={store.logo} alt={store.storeName} className="w-12 h-12 rounded-xl object-cover border border-brand-border" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-brand-background flex items-center justify-center text-base font-bold text-brand-primary border border-brand-border">
            {store.storeName?.[0]}
          </div>
        )}
        {store.isStoreOpen && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-accent border-2 border-white" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-brand-primary truncate group-hover:text-brand-accent transition-colors">
          {store.storeName}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-white"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-brand-text-secondary">
            <Star size={9} fill="#F59E0B" className="text-amber-400" />
            {(store.rating || 4.5).toFixed(1)}
          </span>
          {store.city && (
            <span className="flex items-center gap-0.5 text-[10px] text-brand-text-secondary">
              <MapPin size={9} />
              {store.city}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NearbyStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/public/stores?limit=8");
        setStores(res?.stores || []);
      } catch (_err) {
        console.error("Fetch nearby stores failed:", _err);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-brand-background">
        <div className="section-container">
          <StoreSkeleton count={4} variant="grid" />
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  return (
    <section className="py-section-mobile md:py-16 bg-brand-background" id="nearby-stores">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-6"
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-primary mb-1 flex items-center gap-2">
              <MapPin size={20} className="text-brand-accent" />
              Stores Open Near You
            </h2>
          </div>
          <button
            onClick={() => navigate("/stores")}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            All Stores <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stores.slice(0, 8).map((store, index) => (
            <motion.div
              key={store._id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              viewport={{ once: true }}
            >
              <MiniStoreCard
                store={store}
                onClick={() => navigate(`/store/${store._id}`)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
