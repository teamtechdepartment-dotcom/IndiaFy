/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Star,
  Clock,
  MapPin,
  Filter,
  Grid,
  List,
  ShieldCheck,
  X,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

const RAW_PRODUCTS = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Noise Cancelling Headphones",
    brand: "Sony",
    price: 24990,
    original: 34990,
    rating: 4.8,
    reviews: 3847,
    seller: "Sharma Electronics",
    dist: 1.3,
    eta: 18,
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    badge: "Best Seller",
    inStock: true,
  },
  {
    id: 2,
    name: "Apple AirPods Pro (2nd Generation)",
    brand: "Apple",
    price: 24900,
    original: 26900,
    rating: 4.7,
    reviews: 2140,
    seller: "iZone Store",
    dist: 2.1,
    eta: 25,
    img: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80",
    badge: "New",
    inStock: true,
  },
  {
    id: 3,
    name: "Bose QuietComfort 45 Over-Ear Headphones",
    brand: "Bose",
    price: 28990,
    original: 38990,
    rating: 4.6,
    reviews: 1823,
    seller: "AudioWorld",
    dist: 0.9,
    eta: 12,
    img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    badge: null,
    inStock: true,
  },
  {
    id: 4,
    name: "JBL Flip 6 Portable Bluetooth Speaker",
    brand: "JBL",
    price: 8499,
    original: 11999,
    rating: 4.5,
    reviews: 4201,
    seller: "SoundHub",
    dist: 3.2,
    eta: 35,
    img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
    badge: "Hot Deal",
    inStock: true,
  },
];

const BRANDS = ["Sony", "Apple", "Bose", "JBL", "Sennheiser"];
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

export default function CategoryListingPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // --- FILTER STATES ---
  const [maxPrice, setMaxPrice] = useState(45000);
  const [maxDist, setMaxDist] = useState(10);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortType, setSortType] = useState("relevance");

  const filteredProducts = useMemo(() => {
    return RAW_PRODUCTS.filter((p) => {
      return (
        p.price <= maxPrice &&
        p.dist <= maxDist &&
        (selectedBrands.length === 0 || selectedBrands.includes(p.brand))
      );
    }).sort((a, b) => {
      if (sortType === "price_asc") return a.price - b.price;
      if (sortType === "rating") return b.rating - a.rating;
      if (sortType === "delivery") return a.eta - b.eta;
      return 0;
    });
  }, [maxPrice, maxDist, selectedBrands, sortType]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Reusable Filter Content
  const FilterContent = () => (
    <div className="space-y-10">
      {/* Price Slider */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Price Limit
          </h4>
          <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            {fmt(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max="45000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />
        <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2">
          <span>₹5k</span>
          <span>₹45k</span>
        </div>
      </section>

      {/* Distance Slider */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Distance
          </h4>
          <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            Within {maxDist} km
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={maxDist}
          onChange={(e) => setMaxDist(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />
        <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2">
          <span>1 km</span>
          <span>10 km</span>
        </div>
      </section>

      {/* Brands */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Brands
          </h4>
          {selectedBrands.length > 0 && (
            <button 
              onClick={() => setSelectedBrands([])}
              className="text-[10px] text-slate-400 hover:text-slate-900 underline underline-offset-2"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => toggleBrand(brand)}
              className={`px-4 py-2 rounded-full text-[11px] font-semibold transition-all duration-200 border ${
                selectedBrands.includes(brand) 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-20 relative z-10">
        
        {/* Background Blobs for Hero Theme */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-5%] right-[5%] w-[45vw] h-[45vw] bg-gradient-to-br from-emerald-100/40 to-teal-100/20 rounded-full blur-[100px]" />
          <div className="absolute top-[10%] left-[-5%] w-[35vw] h-[35vw] bg-gradient-to-tr from-blue-100/30 to-indigo-100/10 rounded-full blur-[100px]" />
        </div>
      
        {/* HERO SECTION */}
        <div className="mb-10 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                Audio & <span className="text-emerald-600 italic">Gear</span>
              </h1>
              <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl">
                Discover premium sound equipment available for instant delivery. Showing <span className="text-slate-900 font-bold">{filteredProducts.length} items</span> in your area.
              </p>
            </div>
            
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-full text-sm font-semibold shadow-xl shadow-slate-900/20 active:scale-95 transition-transform"
            >
              <Filter size={16} /> Filter & Sort
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 space-y-10">
              <FilterContent />
              
              {/* Trust Badge Enhanced */}
              <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-[2rem] border border-emerald-100/60 shadow-sm">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
                  <ShieldCheck size={20} className="text-emerald-600" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-2">
                  Indiafy Trust
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Every seller in West Gurugram is manually verified by our local sector team for quality assurance.
                </p>
              </div>
            </div>
          </aside>

          {/* PRODUCT LISTING AREA */}
          <div className="flex-1 min-w-0">
            
            {/* SORTING TABS */}
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full mask-linear-fade">
                {["relevance", "price_asc", "rating", "delivery"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSortType(type)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 border ${
                      sortType === type 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800"
                    }`}
                  >
                    {type.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className={`grid gap-6 md:gap-8 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              <AnimatePresence mode="popLayout">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p, index) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProductCard product={p} viewMode={viewMode} />
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center bg-zinc-50 rounded-[2rem] border border-zinc-100"
                  >
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your filters or search area.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/40 z-[110] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white z-[120] rounded-t-[2.5rem] p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4 border-b border-zinc-100 z-10">
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                  Filters & Sort
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterContent />
              <div className="sticky bottom-0 bg-white pt-6 pb-2 mt-8 border-t border-zinc-100">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all"
                >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-[2rem] p-4 border border-zinc-200/60 hover:border-emerald-200 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] transition-all duration-300 cursor-pointer h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-zinc-100/80 mb-5">
        <img loading="lazy" decoding="async"
          src={product.img}
          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
          alt={product.name}
        />
        
        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white text-slate-900 border-2 border-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {/* Badges */}
        {product.badge && product.inStock && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm shadow-sm border border-slate-200/50 text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
            {product.badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-2 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">
            <Star size={12} className="text-amber-500" fill="currentColor" /> 
            {product.rating}
          </div>
        </div>
        
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-4 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
          <div>
            <span className="block text-xl font-black text-slate-900">
              {fmt(product.price)}
            </span>
            {product.original > product.price && (
              <span className="text-xs font-medium text-slate-400 line-through">
                {fmt(product.original)}
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!product.inStock) return;
              setAdded(true);
            }}
            disabled={!product.inStock}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              added
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {added ? (
              <>
                <CheckCircle2 size={14} /> Added
              </>
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};