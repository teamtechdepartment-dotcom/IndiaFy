import React, { useState, useEffect } from "react";
import { Star, MapPin, BadgeCheck, ArrowUpRight, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

function VerifiedStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/seller/auth/all");
        // res is the ApiResponse, res.data is the array
        const sellers = res.data.data || res.data || [];
        
        const mapped = sellers.map(s => ({
          id: s._id,
          name: s.businessName || `${s.firstName}'s Store`,
          category: "Quick Commerce • Essentials",
          distance: "0.8 km",
          rating: "4.8",
          delivery: "15 mins",
          image: s.logo || "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=1200",
          live: true,
          tag: "Verified",
        }));
        setStores(mapped);
      } catch (err) {
        console.error("Fetch sellers failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-zinc-300 mb-4" size={32} />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Scanning Local Nodes...</p>
      </div>
    );
  }

  if (stores.length === 0) {
    return null; // Don't show section if no stores
  }

  return (
    <section className="pt-20 pb-20 md:pt-24 md:pb-24 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* HEADER AREA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="text-zinc-900" size={18} />
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-zinc-500">
                Verified Ecosystem
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-none">
              Nearby Verified Sellers
            </h2>
            <p className="text-zinc-500 mt-3 text-sm md:text-lg max-w-lg">
              Operating with strict operational discipline across Gurugram
              sectors.
            </p>
          </div>

          <button
            onClick={() => navigate("/local-sellers")}
            className="self-start md:self-auto text-xs md:text-sm font-bold border-b-2 border-zinc-900 pb-1 hover:text-zinc-500 hover:border-zinc-300 transition-all uppercase tracking-widest active:scale-95"
          >
            View All Local Sellers
          </button>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* FEATURED LARGE CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            onClick={() => navigate(`/store/${stores[0].id}`)}
            className="lg:col-span-7 group relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-900 h-[350px] sm:h-[400px] lg:h-auto lg:aspect-auto cursor-pointer"
          >
            <img
              src={stores[0].image}
              alt={stores[0].name}
              width={800}
              height={500}
              loading="lazy"
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />

            <div className="absolute top-4 md:top-6 left-4 md:left-6 flex gap-2 md:gap-3">
              {stores[0].live && (
                <div className="bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Live Now
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-lg">
                {stores[0].tag}
              </div>
            </div>

            <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-white text-zinc-900 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl flex flex-col items-center justify-center">
              <Zap size={16} className="mb-0.5 md:mb-1" />
              <span className="text-[10px] md:text-xs font-black">
                {stores[0].delivery}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="flex items-center gap-1 bg-white/10 text-white px-2 py-1 md:px-3 py-1 rounded-md md:rounded-lg text-xs md:text-sm font-bold backdrop-blur-sm border border-white/10">
                  <Star size={12} fill="currentColor" className="text-white" />
                  {stores[0].rating}
                </div>
                <div className="flex items-center gap-1 text-zinc-300 text-xs md:text-sm font-medium">
                  <MapPin size={12} />
                  {stores[0].distance} away
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2 leading-tight">
                {stores[0].name}
              </h3>
              <p className="text-zinc-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                {stores[0].category}
              </p>
            </div>
          </motion.div>

          {/* SIDE LIST CARDS */}
          <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
            {stores.slice(1, 4).map((store, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/store/${store.id}`)}
                className="group relative bg-zinc-50 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 border border-zinc-100 hover:bg-white hover:shadow-2xl hover:shadow-zinc-200 transition-all duration-500 cursor-pointer"
              >
                <div className="flex gap-4 md:gap-6">
                  {/* Image Box */}
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl md:rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={store.image}
                      alt={store.name}
                      width={128}
                      height={128}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    {store.live && (
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase text-zinc-900 shadow-sm">
                        Live
                      </div>
                    )}
                  </div>

                  {/* Content Box */}
                  <div className="flex flex-col justify-center flex-1 pr-2 md:pr-4 py-1">
                    <div className="flex justify-between items-start mb-1 md:mb-2">
                      <h3 className="font-bold text-zinc-900 text-base md:text-lg leading-tight pr-2 line-clamp-2">
                        {store.name}
                      </h3>
                      <div className="flex items-center gap-1 text-zinc-900 font-bold text-xs md:text-sm bg-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg shadow-sm border border-zinc-100 shrink-0">
                        <Star size={10} fill="currentColor" />
                        {store.rating}
                      </div>
                    </div>

                    <p className="text-[9px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 md:mb-4 line-clamp-1">
                      {store.category}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 md:gap-1.5 text-zinc-500 text-[10px] md:text-xs font-bold">
                        <MapPin size={12} className="text-zinc-300" />
                        {store.distance}
                      </div>
                      <button aria-label={`Visit ${store.name}`} className="p-1.5 md:p-2 bg-zinc-900 text-white rounded-lg md:rounded-xl hover:bg-zinc-700 active:scale-95 transition-all">
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* View More Link */}
            <div
              onClick={() => navigate("/local-sellers")}
              className="mt-2 p-5 md:p-6 border-2 border-dashed border-zinc-200 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <p className="text-[10px] md:text-xs font-black text-zinc-400 uppercase tracking-widest text-center">
                + more verified stores nearby
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerifiedStores;
