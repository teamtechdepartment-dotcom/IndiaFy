
import { useState, useEffect } from "react";
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

// Store
import { useWholesaleStore } from "../../store/wholesaleStore";
import { useCartStore } from "../../store/cartStore";

// Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import { toast } from "react-toastify";

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
  const { wholesaleProducts, fetchWholesaleProducts, isLoading } = useWholesaleStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWholesaleProducts();
  }, [fetchWholesaleProducts]);

  // State for quantity selection per product
  const [quantities, setQuantities] = useState({});

  // Handle Search Execution
  const handleSearch = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      fetchWholesaleProducts({ search: e.target.value.trim() });
    }
  };

  // Helper to calculate current tier price
  const getTierPrice = (product, currentQty) => {
    if (!product.bulkPricing || product.bulkPricing.length === 0) {
      return parseFloat(product.attribute?.salePrice || 0);
    }
    const qty = currentQty || product.minimumOrderQty || 1;
    // Sort tiers by minQty descending to find highest applicable tier
    const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
    const applicableTier = sortedTiers.find(t => qty >= t.minQty);
    return applicableTier ? applicableTier.pricePerUnit : parseFloat(product.attribute?.salePrice || 0);
  };

  const handleBulkAddToCart = (product, e) => {
    e.stopPropagation();
    const qty = quantities[product._id] || product.minimumOrderQty || 1;
    if (qty < (product.minimumOrderQty || 1)) {
       toast.error(`Minimum Order Quantity is ${product.minimumOrderQty}`);
       return;
    }
    const price = getTierPrice(product, qty);
    
    addToCart({
      _id: product._id,
      productName: product.productName,
      productImage: product.productImage,
      price: price,
      sellerId: product.sellerId,
      isWholesale: true
    }, qty);
    toast.success(`Added ${qty} units to Bulk Cart`);
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
                  onClick={() => navigate("/seller-auth")}
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

        {/* 🏷️ 3. LIVE WHOLESALE CATALOG */}
        <section className="py-32 bg-white min-h-[600px]">
          <div className="max-w-7xl mx-auto px-6 text-zinc-900">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
              <h2 className="text-6xl font-black tracking-tighter uppercase leading-none text-center md:text-left">
                Bulk <br />{" "}
                <span className="text-zinc-200 italic">Contracts</span>
              </h2>
              <p className="max-w-xs text-zinc-500 font-bold text-sm uppercase tracking-tighter leading-relaxed text-center md:text-left">
                Direct factory supply with tiered volume pricing and mandatory packaging verification.
              </p>
            </div>

            {isLoading ? (
               <div className="flex justify-center items-center h-40">
                  <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"></div>
               </div>
            ) : wholesaleProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {wholesaleProducts.map((p) => {
                  const minQty = p.minimumOrderQty || 1;
                  const currentQty = quantities[p._id] || minQty;
                  const currentPrice = getTierPrice(p, currentQty);

                  return (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/product/${p._id}`)}
                      className="group cursor-pointer border border-zinc-200 rounded-[3rem] p-6 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-500 shadow-sm hover:shadow-xl flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-zinc-100 rounded-[2rem] mb-6 border border-zinc-200 overflow-hidden relative">
                        <img
                          src={p.productImage?.[0] || "https://placehold.co/600x400?text=B2B"}
                          alt={p.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute top-4 left-4 px-3 py-1 bg-zinc-950 text-amber-400 text-[10px] font-black uppercase rounded-full border border-zinc-800 backdrop-blur-sm shadow-lg flex items-center gap-1">
                          <ShieldCheck size={12}/> Verified
                        </div>
                        {p.dispatchSLA && (
                          <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 text-zinc-900 text-[10px] font-black uppercase rounded-full border border-zinc-200 backdrop-blur-sm shadow-lg flex items-center gap-1">
                            <Truck size={12}/> {p.dispatchSLA}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-black tracking-tighter text-zinc-950 line-clamp-2 pr-2">
                            {p.productName}
                          </h3>
                          <div className="text-right shrink-0">
                            <p className="font-black text-2xl tracking-tighter text-amber-600">
                              {fmt(currentPrice)} <span className="text-xs text-zinc-400 text-black">/u</span>
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                          SKU: {p.productSkuId} • {p.businessCategory || 'General'}
                        </p>

                        {/* Tier Pricing Table */}
                        {p.bulkPricing && p.bulkPricing.length > 0 && (
                          <div className="mb-6 p-3 bg-zinc-100 rounded-2xl border border-zinc-200">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Volume Pricing</p>
                            <div className="space-y-1">
                              {p.bulkPricing.map((tier, idx) => (
                                <div key={idx} className={`flex justify-between text-xs font-bold px-2 py-1 rounded-md ${currentQty >= tier.minQty && (!p.bulkPricing[idx+1] || currentQty < p.bulkPricing[idx+1].minQty) ? 'bg-amber-100 text-amber-800' : 'text-zinc-600'}`}>
                                  <span>{tier.minQty}{tier.maxQty ? ` - ${tier.maxQty}` : '+'} units</span>
                                  <span>{fmt(tier.pricePerUnit)}/u</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-zinc-200 gap-4 mt-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 w-full sm:w-auto bg-zinc-100 rounded-xl p-1 border border-zinc-200">
                           <button onClick={() => setQuantities(prev => ({...prev, [p._id]: Math.max(minQty, (prev[p._id] || minQty) - 10)}))} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-white hover:shadow-sm rounded-lg font-bold transition-all">-</button>
                           <input type="number" value={currentQty} onChange={e => setQuantities(prev => ({...prev, [p._id]: Math.max(minQty, parseInt(e.target.value) || minQty)}))} className="w-14 text-center bg-transparent font-black text-zinc-900 text-sm focus:outline-none appearance-none"/>
                           <button onClick={() => setQuantities(prev => ({...prev, [p._id]: (prev[p._id] || minQty) + 10}))} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-white hover:shadow-sm rounded-lg font-bold transition-all">+</button>
                        </div>
                        
                        <button
                          onClick={(e) => handleBulkAddToCart(p, e)}
                          className="w-full sm:w-auto flex-1 px-4 py-3 rounded-xl bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus size={14} /> Add to Bulk
                        </button>
                      </div>
                      
                      <p className="text-center mt-3 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        MOQ: {minQty} units • GST {p.gstPercentage || 0}% extra
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-zinc-50 border border-zinc-200 rounded-[3rem] shadow-inner">
                 <Boxes size={64} className="mx-auto text-zinc-300 mb-6"/>
                 <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-800 mb-2">No Bulk Contracts Available</h3>
                 <p className="text-zinc-500 font-medium">Currently there are no wholesale products active in your region.</p>
              </div>
            )}
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
                  onClick={() => navigate("/seller-auth")}
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