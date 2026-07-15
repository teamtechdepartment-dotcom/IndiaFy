import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

// Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import FilterSidebar from "../../components/Category/FilterSidebar";
import TopToolbar from "../../components/Category/TopToolbar";
import ProductGrid from "../../components/Category/ProductGrid";

const mapDbProductToCategory = (p) => {
  const price = p.attribute?.salePrice ?? p.price ?? 0;
  const original = p.attribute?.mrpPrice ?? p.price ?? price;
  const rating = p.ratingAverage ?? 4.5;
  const reviews = p.ratingCount ?? 0;
  const seller = p.sellerId ? `${p.sellerId.firstName} ${p.sellerId.lastName || ""}`.trim() : "Verified Seller";
  const img = p.productImage?.[0] || "https://placehold.co/400x400?text=Product";
  
  return {
    id: p._id || p.id,
    name: p.productName || p.name,
    brand: p.brand || "Generic",
    price: price,
    original: original,
    rating: rating,
    reviews: reviews,
    seller: seller,
    dist: 1.0,
    eta: "Tomorrow",
    img: img,
    badge: p.isFeatured ? "Featured" : null,
    inStock: p.stock > 0,
  };
};

export default function CategoryListingPage() {
  const { categoryName } = useParams();
  const [dbProducts, setDbProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // --- FILTER STATES ---
  const [maxPrice, setMaxPrice] = useState(100000);
  const [maxDist, setMaxDist] = useState(50);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortType, setSortType] = useState("relevance");

  useEffect(() => {
    setIsLoading(true);
    axiosInstance.get(`/products/category/${categoryName}`)
      .then(res => {
        const raw = res.data?.data || res.data || [];
        setDbProducts(raw.map(mapDbProductToCategory));
      })
      .catch(err => {
        console.error("Failed to fetch category products", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [categoryName]);

  const filteredProducts = useMemo(() => {
    return dbProducts.filter((p) => {
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
  }, [dbProducts, maxPrice, maxDist, selectedBrands, sortType]);

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
              categoryName={categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : "Products"}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-20 bg-white rounded shadow-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded shadow-sm text-zinc-500 font-medium">
                  No products available in this category.
                </div>
              ) : (
                <ProductGrid products={filteredProducts} viewMode={viewMode} />
              )}
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