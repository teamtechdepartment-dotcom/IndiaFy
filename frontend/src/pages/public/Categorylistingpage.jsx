/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useMemo, useCallback } from "react";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import FilterSidebar from "../../components/Category/FilterSidebar";
import TopToolbar from "../../components/Category/TopToolbar";
import ProductGrid from "../../components/Category/ProductGrid";

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
    eta: "Tomorrow",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
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
    eta: "Today",
    img: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&q=80",
    badge: null,
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
    eta: "In 2 days",
    img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
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
    eta: "Tomorrow",
    img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
    badge: "Hot Deal",
    inStock: true,
  },
  {
    id: 5,
    name: "Sennheiser Momentum 4 Wireless",
    brand: "Sennheiser",
    price: 29990,
    original: 34990,
    rating: 4.5,
    reviews: 840,
    seller: "AudioStore",
    dist: 4.2,
    eta: "Today",
    img: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&q=80",
    badge: null,
    inStock: true,
  },
  {
    id: 6,
    name: "Samsung Galaxy Buds 2 Pro",
    brand: "Samsung",
    price: 15999,
    original: 19999,
    rating: 4.4,
    reviews: 1250,
    seller: "Samsung Center",
    dist: 1.8,
    eta: "Tomorrow",
    img: "https://images.unsplash.com/photo-1606220588913-b3aec4ce54ae?w=400&q=80",
    badge: "Best Seller",
    inStock: true,
  }
];

export default function CategoryListingPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // --- FILTER STATES ---
  const [maxPrice, setMaxPrice] = useState(100000);
  const [maxDist, setMaxDist] = useState(50);
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
      if (sortType === "price_desc") return b.price - a.price;
      if (sortType === "rating") return b.rating - a.rating;
      return 0; // relevance
    });
  }, [maxPrice, maxDist, selectedBrands, sortType]);

  const toggleBrand = useCallback((brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  return (
    <div className="bg-[#f1f3f6] min-h-screen font-sans">
      <WebsiteNavbar />

      <main className="w-full mx-auto px-2 lg:px-4 pt-[140px] md:pt-[160px] pb-10">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[150px] h-[calc(100vh-170px)] z-10">
            <FilterSidebar 
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              maxDist={maxDist} setMaxDist={setMaxDist}
              selectedBrands={selectedBrands} toggleBrand={toggleBrand}
            />
          </aside>

          {/* PRODUCT LISTING AREA */}
          <div className="flex-1 min-w-0 flex flex-col">
            <TopToolbar 
              totalProducts={filteredProducts.length}
              categoryName="Electronics"
              sortType={sortType} setSortType={setSortType}
              viewMode={viewMode} setViewMode={setViewMode}
            />

            {/* Mobile Filter Trigger */}
            <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 py-3 px-4 mb-2 shadow-sm">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-gray-800 border-r border-gray-200"
              >
                <Filter size={16} /> Sort & Filter
              </button>
            </div>

            <div className="flex-1">
              <ProductGrid products={filteredProducts} viewMode={viewMode} />
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
              className="fixed inset-0 bg-black/60 z-[110]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-[120] overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="flex-1 p-4">
                 <FilterSidebar 
                  maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                  maxDist={maxDist} setMaxDist={setMaxDist}
                  selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                  onClose={() => setIsMobileFilterOpen(false)}
                />
              </div>
              <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex gap-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-[#FF9F00] text-white font-bold uppercase rounded shadow-sm"
                >
                  Apply Filters
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