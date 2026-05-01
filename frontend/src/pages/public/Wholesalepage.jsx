
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  TrendingDown,
  ShieldCheck,
  Truck,
  Building2,
  ArrowRight,
  Zap,
  BadgeCheck,
  PieChart,
  ChevronRight,
  Boxes,
  Layers,
  Globe,
  Search,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

// ✅ 100% CORRECT IMPORTS: Going one level UP to the 'components' folder
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

// B2B Industrial Images for Categories (No Icons)
const CATEGORIES = [
  {
    id: 1,
    name: "Textile Hub",
    img: "https://images.unsplash.com/photo-1558304970-abd589bfdfe1?q=80&w=400",
    tag: "Bulk Apparel",
    start: 80,
  },
  {
    id: 2,
    name: "FMCG Node",
    img: "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?q=80&w=400",
    tag: "Groceries",
    start: 12,
  },
  {
    id: 3,
    name: "OEM Tech",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400",
    tag: "Hardware",
    start: 350,
  },
  {
    id: 4,
    name: "Beauty Lab",
    img: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=400",
    tag: "Cosmetics",
    start: 45,
  },
  {
    id: 5,
    name: "Footwear Node",
    img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400",
    tag: "Shoes",
    start: 110,
  },
  {
    id: 6,
    name: "Industrial",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400",
    tag: "Tools",
    start: 99,
  },
];

// Moving Images for Hero (Square Shape)
const heroMovingImages = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eafe55?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621905238290-08f451f25f20?q=80&w=600&auto=format&fit=crop",
];

export default function WholesalePage() {
  const navigate = useNavigate();

  // Handle Search Execution
  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      navigate(`/search?query=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-400 font-sans selection:bg-amber-500 selection:text-black">
      <WebsiteNavbar />

      <main className="overflow-hidden">
        {/* 🚀 1. INDUSTRIAL HERO with Moving Images */}
        <section className="relative pt-48 pb-32 px-6 overflow-hidden border-b border-zinc-900">
          <div
            className="absolute inset-0 opacity-[0.01] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-12 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-7 space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse">
                <Landmark size={14} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Indiafy B2B Bulk Node
                </span>
              </div>

              <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.8]">
                DIRECT <br />
                <span className="text-zinc-800 italic">SOURCE.</span>
              </h1>

              <p className="text-zinc-500 text-xl font-medium max-w-lg leading-relaxed uppercase text-xs tracking-widest">
                Factory-to-Warehouse Logistics. Volume Tiered Pricing. <br />
                <span className="text-white font-black decoration-amber-500 underline underline-offset-4">
                  Verified Business Network.
                </span>
              </p>

              {/* Functional Search */}
              <div className="relative max-w-2xl">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600"
                  size={20}
                />
                <input
                  type="text"
                  onKeyDown={handleSearch}
                  placeholder="Search Wholesale Products, Sellers, or Categories..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full pl-16 pr-8 py-5 text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-5 pt-6">
                <button
                  onClick={() => navigate("/search")}
                  className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center gap-3 hover:bg-amber-500 transition-all shadow-2xl shadow-white/5"
                >
                  Request Bulk Quote <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-10 py-5 border border-zinc-800 rounded-full font-black uppercase tracking-widest text-[11px] text-zinc-300 hover:bg-zinc-900 transition-all"
                >
                  Register Business
                </button>
              </div>
            </motion.div>

            {/* Right: Moving Square Images */}
            <div className="lg:col-span-5 relative h-[500px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-amber-500/10 blur-[150px] rounded-full" />
              <motion.div
                animate={{ y: [0, -1000] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="grid grid-cols-2 gap-4 relative z-10 w-full"
              >
                {[...heroMovingImages, ...heroMovingImages].map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden group shadow-2xl"
                  >
                    <img
                      src={img}
                      alt="Industrial Process"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* 📦 2. CATEGORY NODES */}
        <section className="py-32 bg-[#080808]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-16">
              <div>
                <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  Verticals
                </p>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
                  Browse <span className="text-zinc-700 italic">Nodes</span>
                </h2>
              </div>
              <button
                onClick={() => navigate("/category/:categoryName")}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
              >
                View All Catalogs
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
              {CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  onClick={() =>
                    navigate(
                      `/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`
                    )
                  }
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-amber-500/30 transition-all duration-500 h-[220px]"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden mb-6 border border-zinc-800 group-hover:border-amber-500/20 group-hover:scale-110 transition-all duration-500">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1 w-28 truncate">
                    {cat.name}
                  </p>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase italic">
                    From {fmt(cat.start)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🏷️ 3. DEALS (MOQ FOCUS) */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-zinc-900">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
              <h2 className="text-6xl font-black tracking-tighter uppercase leading-none text-center md:text-left">
                Bulk <br />{" "}
                <span className="text-zinc-200 italic">Contracts</span>
              </h2>
              <p className="max-w-xs text-zinc-500 font-bold text-sm uppercase tracking-tighter leading-relaxed text-center md:text-left">
                Mandatory video packaging verification ensures bulk lot
                accuracy.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/product/${i}`)}
                  className="group cursor-pointer border border-zinc-100 rounded-[3rem] p-8 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-700 shadow-sm hover:shadow-2xl"
                >
                  <div className="aspect-[4/3] bg-zinc-50 rounded-[2rem] mb-8 border border-zinc-100 overflow-hidden relative">
                    <img
                      src={
                        i === 1
                          ? "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600"
                          : i === 2
                          ? "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600"
                          : "https://images.unsplash.com/photo-1593121925328-369cc8459c08?w=600"
                      }
                      alt="Product Bulk Lot"
                      className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-zinc-950 text-emerald-400 text-[10px] font-black uppercase rounded-full border border-zinc-800 backdrop-blur-sm">
                      Verified Seller
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-5">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-950">
                      {i === 1
                        ? "Cotton Tees #20"
                        : i === 2
                        ? "Grocery Sack"
                        : "Wireless Buds OEM"}
                    </h3>
                    <div className="text-right font-black text-2xl tracking-tighter text-zinc-950">
                      {i === 1 ? "₹120" : i === 2 ? "₹42" : "₹350"}{" "}
                      <span className="text-xs text-zinc-400">/u</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-5 border-t border-zinc-100 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                    <span>
                      MOQ: {i === 1 ? "500" : i === 2 ? "100" : "200"} Units
                    </span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents routing to product page when clicking plus
                        // Add to cart logic here
                      }}
                      className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🛡️ 4. B2B INFRASTRUCTURE */}
        <section className="py-40 bg-zinc-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 relative z-10">
            <div className="lg:col-span-8">
              <h2 className="text-5xl font-black text-white tracking-tighter mb-16 uppercase italic">
                Built for B2B <span className="text-zinc-800">Discipline.</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                <AssuranceItem
                  icon={<BadgeCheck size={32} className="text-amber-500" />}
                  title="Seller KYC"
                  sub="KYC Verified Manufacturers & Distributors Only."
                />
                <AssuranceItem
                  icon={<Globe size={32} className="text-amber-500" />}
                  title="Global Freight Node"
                  sub="Pan-India Logistics & Customs Integration."
                />
                <AssuranceItem
                  icon={<ShieldCheck size={32} className="text-amber-500" />}
                  title="Dynamic Escrow"
                  sub="Payment releases only upon Node Delivery proof."
                />
                <AssuranceItem
                  icon={<Building2 size={32} className="text-amber-500" />}
                  title="Node Disputes"
                  sub="Disputes settled using mandatory Video Packing."
                />
              </div>
            </div>
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="bg-white p-12 rounded-[3.5rem] text-center text-black shadow-2xl shadow-white/5 w-full">
                <Boxes size={48} className="mb-6 mx-auto text-zinc-900" />
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">
                  Bulk Node Account
                </h3>
                <p className="text-zinc-500 text-sm font-bold mb-10 leading-relaxed uppercase tracking-tighter">
                  Register to unlock factory pricing, tax credits, and logistics
                  mapping.
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full py-5 bg-zinc-950 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-amber-500 hover:text-black transition-all shadow-xl"
                >
                  Register Business
                </button>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 opacity-10 -rotate-12 translate-x-20 pointer-events-none">
            <Landmark
              size={500}
              className="text-zinc-800"
              fill="currentColor"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Micro-components
const StatBox = ({ num, label }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-amber-500/20 transition-all group">
    <p className="text-4xl font-black text-white tracking-tighter mb-1 uppercase group-hover:text-amber-500 transition-colors italic">
      {num}
    </p>
    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">
      {label}
    </p>
  </div>
);

const AssuranceItem = ({ icon, title, sub }) => (
  <div className="flex gap-6 items-start">
    <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-xl font-black text-white tracking-tighter uppercase mb-2">
        {title}
      </h4>
      <p className="text-zinc-600 text-xs font-bold leading-relaxed uppercase tracking-tighter">
        {sub}
      </p>
    </div>
  </div>
);