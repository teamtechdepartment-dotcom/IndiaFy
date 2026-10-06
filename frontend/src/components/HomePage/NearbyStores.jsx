import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowRight } from "lucide-react";
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
      className="flex items-center gap-3 p-3 w-[240px] sm:w-[280px] bg-white rounded border border-gray-100 shadow-sm hover:border-[#065F46] hover:shadow-md transition-all cursor-pointer group shrink-0"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {store.logo ? (
          <img loading="lazy" decoding="async" src={store.logo} alt={store.storeName} className="w-12 h-12 rounded object-cover border border-gray-100" />
        ) : (
          <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 border border-gray-100">
            {store.storeName?.[0]}
          </div>
        )}
        {store.isStoreOpen && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-[#065F46] transition-colors mb-0.5">
          {store.storeName}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-gray-500">
            <Star size={9} fill="#F59E0B" className="text-amber-400" />
            {(store.rating || 4.5).toFixed(1)}
          </span>
        </div>
        {store.city && (
          <span className="flex items-center gap-0.5 text-[10px] text-gray-500 mt-1">
            <MapPin size={9} />
            {store.city}
          </span>
        )}
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
      <section className="bg-white px-2 py-4 border-b border-gray-100">
        <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
          <StoreSkeleton count={4} variant="grid" />
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  return (
    <section className="bg-white px-2 py-4 border-b border-gray-100" id="nearby-stores">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-4 pb-2"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
              <MapPin size={18} className="text-[#065F46]" />
              Stores Open Near You
            </h2>
          </div>
          <button
            onClick={() => navigate("/stores")}
            className="flex items-center justify-center bg-[#065F46] text-white w-7 h-7 rounded-full hover:bg-[#047857] transition-colors shadow-sm"
            aria-label="All Stores"
          >
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Carousel */}
        <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 no-scrollbar">
          {stores.slice(0, 8).map((store, index) => (
            <motion.div
              key={store._id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              viewport={{ once: true }}
              className="flex-none snap-start"
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
