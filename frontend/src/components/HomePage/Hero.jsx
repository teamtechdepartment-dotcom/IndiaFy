import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  ShoppingBag,
  Zap,
  Landmark,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const verticals = [
  {
    id: "quick",
    label: "Hyperlocal",
    sub: "10-25 Mins",
    icon: <Zap size={20} className="text-emerald-400" aria-hidden="true" />,
    path: "/quick-commerce",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    id: "eco",
    label: "India Hub",
    sub: "Same Day",
    icon: <ShoppingBag size={20} className="text-blue-400" aria-hidden="true" />,
    path: "/",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    id: "wholesale",
    label: "Bulk Node",
    sub: "B2B Volume",
    icon: <Landmark size={20} className="text-amber-400" aria-hidden="true" />,
    path: "/wholesale",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const bentoImages = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=800",
];

const bentoAlts = [
  "Fresh groceries and produce for quick commerce delivery",
  "Fashion boutique storefront with trending styles",
  "Warehouse interior for wholesale B2B operations",
];

function Hero() {
  const navigate = useNavigate();
  const [currentImg, setCurrentImg] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % bentoImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${searchQuery}`);
  }, [searchQuery, navigate]);

  return (
    <section
      className="relative w-full h-auto lg:min-h-[100svh] flex items-start lg:items-center bg-[#030303] overflow-hidden selection:bg-emerald-500 selection:text-black"
      aria-label="Hero banner"
    >
      {/* Background Image Carousel */}
      <div className="absolute top-0 left-0 w-full h-full lg:w-[55%] lg:left-auto lg:right-0 z-0" aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImg}
            src={bentoImages[currentImg]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full object-cover opacity-50 lg:opacity-70"
            alt={bentoAlts[currentImg]}
            width={800}
            height={600}
            loading="eager"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/40 via-transparent to-[#030303] lg:bg-gradient-to-l lg:from-transparent lg:to-[#030303]" />
      </div>

      {/* Content */}
      <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 relative z-10 pt-28 pb-12 lg:pt-32 xl:pt-40 lg:pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Text & Search */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Live Node Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 w-fit px-3 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-xl mt-4 lg:mt-0"
              role="status"
              aria-label="Live node: Gurugram"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" aria-hidden="true" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white">
                GURUGRAM Node
              </p>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[3.5rem] sm:text-7xl lg:text-[6.5rem] font-black text-white tracking-tighter leading-[0.85] mb-6"
            >
              COMMERCE. <br />
              <span className="text-zinc-500 italic">CODIFIED.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-300 text-sm sm:text-base font-medium max-w-lg mb-10 leading-relaxed"
            >
              One unified logistics engine. Discover Hyperlocal 15-min delivery,
              Pan-India commerce, and verified B2B bulk sourcing from a single
              terminal.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative w-full max-w-2xl mb-10 group"
            >
              <form
                onSubmit={handleSearch}
                role="search"
                aria-label="Search products across all verticals"
                className="flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[1.5rem] p-1.5 focus-within:border-zinc-500 transition-all duration-300 shadow-2xl"
              >
                <Search size={20} className="text-zinc-500 ml-4 mr-2" aria-hidden="true" />
                <label htmlFor="hero-search" className="sr-only">Search products</label>
                <input
                  id="hero-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search essentials, electronics, or bulk..."
                  className="flex-1 py-3.5 bg-transparent border-none outline-none text-white text-sm sm:text-base placeholder:text-zinc-600 font-medium"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="bg-white text-black p-3.5 rounded-xl hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center group-focus-within:bg-emerald-400"
                >
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </form>
            </motion.div>

            {/* Vertical Selectors */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl"
              role="navigation"
              aria-label="Commerce verticals"
            >
              {verticals.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate(v.path)}
                  aria-label={`${v.label} - ${v.sub}`}
                  className={`cursor-pointer group flex flex-col items-center sm:items-start p-4 sm:p-5 rounded-[1.25rem] sm:rounded-3xl ${v.bg} border ${v.border} hover:scale-[1.02] active:scale-95 transition-all duration-300 backdrop-blur-md text-left`}
                >
                  <div className="bg-zinc-950 p-2 sm:p-2.5 rounded-xl border border-zinc-800 mb-3 sm:mb-4 group-hover:scale-110 transition-transform" aria-hidden="true">
                    {v.icon}
                  </div>
                  <h3 className="text-white font-black uppercase tracking-tight text-[10px] sm:text-sm mb-1 text-center sm:text-left w-full">
                    {v.label}
                  </h3>
                  <p className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center sm:text-left w-full truncate">
                    {v.sub}
                  </p>
                </button>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Trust Card (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-5 hidden lg:flex justify-end items-center h-full"
          >
            <div className="w-80 bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative -left-12 mt-12">
              <div className="flex justify-between items-start mb-6">
                <ShieldCheck size={32} className="text-emerald-400" aria-hidden="true" />
                <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Audited
                </span>
              </div>
              <h4 className="text-white font-black text-xl mb-3 leading-none">
                Zero-Trust Infra
              </h4>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">
                Every order is video-packaged and verified across all
                operational nodes before dispatch.
              </p>
              <button
                aria-label="Learn about operational discipline"
                className="flex items-center gap-2 text-[11px] font-black text-white uppercase tracking-widest hover:text-emerald-400 transition-colors group"
              >
                Operational Discipline{" "}
                <ChevronRight size={16} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
