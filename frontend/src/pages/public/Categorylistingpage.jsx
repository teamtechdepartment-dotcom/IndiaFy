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
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  // Reusable Filter Content
  const FilterContent = () => (
    <div className="space-y-10">
      <section>
        <div className="flex justify-between mb-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest">
            Price Limit
          </h4>
          <span className="text-xs font-bold">{fmt(maxPrice)}</span>
        </div>
        <input
          type="range"
          min="5000"
          max="45000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-zinc-900"
        />
      </section>
      <section>
        <div className="flex justify-between mb-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest">
            Distance (KM)
          </h4>
          <span className="text-xs font-bold">{maxDist} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={maxDist}
          onChange={(e) => setMaxDist(Number(e.target.value))}
          className="w-full h-1 bg-zinc-200 rounded-lg appearance-none accent-zinc-900"
        />
      </section>
      <section>
        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">
          Brands
        </h4>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => toggleBrand(brand)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${selectedBrands.includes(brand) ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-400 border-zinc-100"}`}
            >
              {brand}
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-36 pb-20">
        {/* MOBILE FILTER TRIGGER & TITLE */}
        <div className="mb-8 md:mb-16">
          <h1 className="text-4xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-none mb-4 md:mb-6">
            Audio & <span className="text-zinc-200 italic">Gear</span>
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-zinc-500 text-sm md:text-lg font-medium">
              Found {filteredProducts.length} items
            </p>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg"
            >
              <Filter size={14} /> Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-36">
              <FilterContent />
              <div className="mt-12 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                <ShieldCheck size={24} className="mb-3 text-zinc-900" />
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                  Indiafy Trust
                </p>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                  Every seller in West Gurugram is manually verified by our
                  sector team.
                </p>
              </div>
            </div>
          </aside>

          {/* PRODUCT LISTING */}
          <div className="flex-1">
            {/* SORTING - Mobile Scrollable */}
            <div className="flex gap-2 mb-8 md:mb-12 overflow-x-auto no-scrollbar pb-2">
              {["relevance", "price_asc", "rating", "delivery"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSortType(type)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${sortType === type ? "bg-zinc-900 text-white border-zinc-900 shadow-xl" : "bg-zinc-50 text-zinc-400 border-zinc-100"}`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* PRODUCT GRID */}
            <div
              className={`grid gap-4 md:gap-8 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
            >
              <AnimatePresence>
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode={viewMode} />
                ))}
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
              className="fixed inset-0 bg-black/40 z-[110] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white z-[120] rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest">
                  Filters
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 bg-zinc-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full mt-10 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest"
              >
                Show Results
              </button>
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
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-zinc-50/50 rounded-[2rem] p-3 md:p-4 border border-zinc-100 hover:bg-white hover:shadow-2xl transition-all cursor-pointer"
    >
      <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-white mb-4 md:mb-6">
        <img
          src={product.img}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
          alt={product.name}
        />
        {product.badge && (
          <div className="absolute top-3 left-3 bg-zinc-900 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">
            {product.badge}
          </div>
        )}
      </div>
      <div className="px-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <Star size={10} fill="currentColor" /> {product.rating}
          </div>
        </div>
        <h3 className="font-bold text-zinc-900 text-sm md:text-base mb-4 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <span className="text-lg md:text-xl font-black text-zinc-900">
            {fmt(product.price)}
          </span>
          <div className="flex items-center gap-1.5 bg-zinc-900 text-white p-2 md:p-2.5 rounded-xl shadow-lg">
            <ShoppingBag size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
