import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  X, 
  ShoppingBag, 
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

// Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import FilterSidebar from "../../components/Category/FilterSidebar";
import TopToolbar from "../../components/Category/TopToolbar";
import ProductGrid from "../../components/Category/ProductGrid";
import SEO from "../../components/seo/SEO";
import JsonLd from "../../components/seo/JsonLd";

const mapDbProductToCategory = (p) => {
  const price = p.attribute?.salePrice ?? p.price ?? 0;
  const original = p.attribute?.mrpPrice ?? p.price ?? price;
  const rating = p.ratingAverage ?? 4.5;
  const reviews = p.ratingCount ?? 12;
  const seller = p.sellerId ? `${p.sellerId.firstName || ""} ${p.sellerId.lastName || ""}`.trim() || p.sellerId.businessName || "Verified Seller" : "Verified Seller";
  const img = p.productImage?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop";
  
  return {
    id: p._id || p.id,
    name: p.productName || p.name || "Product",
    brand: p.brand || "Indiafy Store",
    price: Number(price),
    original: Number(original),
    rating: rating,
    reviews: reviews,
    seller: seller,
    dist: 1.2,
    eta: "Today",
    img: img,
    badge: p.isFeatured ? "Featured" : (p.nodeType === "QUICK_COMMERCE" ? "Fast Delivery" : null),
    inStock: p.stock !== undefined ? p.stock > 0 : true,
  };
};

export default function CategoryListingPage() {
  const { categoryName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [dbProducts, setDbProducts] = useState([]);
  const [seoData, setSeoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // --- FILTER STATES ---
  const [maxPrice, setMaxPrice] = useState(100000);
  const [maxDist, setMaxDist] = useState(50);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortType, setSortType] = useState("relevance");

  const formattedTitle = useMemo(() => {
    if (!categoryName) return "All Products";
    const slug = categoryName.toLowerCase();
    if (slug.includes("groc")) return "Groceries & Daily Needs";
    if (slug.includes("fashion")) return "Fashion & Apparel";
    if (slug.includes("electr")) return "Electronics & Mobiles";
    if (slug.includes("beaut")) return "Beauty & Personal Care";
    if (slug.includes("quick") || slug.includes("30-min")) return "Under 30-Min Delivery (Quick Commerce)";
    if (slug.includes("wholesale")) return "Wholesale B2B Catalog";
    if (slug.includes("local")) return "Local Stores & Retailers";
    if (slug.includes("home")) return "Home & Kitchen Essentials";
    if (slug.includes("health")) return "Healthcare & Pharmacy";
    return categoryName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }, [categoryName]);

  useEffect(() => {
    setIsLoading(true);
    const activeSlug = categoryName || "all";
    
    // Fetch products
    axiosInstance.get(`/products/category/${activeSlug}`)
      .then(res => {
        const raw = res.data?.data || res.data || [];
        setDbProducts(raw.map(mapDbProductToCategory));
      })
      .catch(err => {
        console.error("Failed to fetch category products", err);
      });
      
    // Fetch SEO metadata
    axiosInstance.get(`/content/category/${activeSlug}`)
      .then(res => {
        setSeoData(res.data?.data || res.data);
      })
      .catch(err => {
        console.error("Failed to fetch category seo data", err);
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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <SEO 
        title={seoData?.title || `${formattedTitle} | IndiaFy`} 
        description={seoData?.description || `Shop ${formattedTitle} online at IndiaFy. Best prices from local sellers.`}
        canonical={seoData?.canonical || `https://indiafy.com/category/${encodeURIComponent(categoryName || "all")}`}
        robots={location.search.match(/[?&](sort|price|brand|dist)=/i) ? "noindex, follow" : "index, follow"}
      />
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://indiafy.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": formattedTitle,
              "item": seoData?.canonical || `https://indiafy.com/category/${encodeURIComponent(categoryName || "all")}`
            }
          ]
        },
        filteredProducts.length > 0 && {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": filteredProducts.slice(0, 20).map((p, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `https://indiafy.com/product/${p.slug || p.id}`
          }))
        }
      ].filter(Boolean)} />
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-[130px] lg:pt-[140px] pb-16">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-400" />
          <h1 className="text-slate-900 font-bold">{formattedTitle}</h1>
        </div>

        {/* SEO Intro Content */}
        {seoData?.intro && (
          <div className="mb-6 max-w-4xl">
            <p className="text-sm text-slate-600 leading-relaxed">{seoData.intro}</p>
            {seoData.popularBrands && seoData.popularBrands.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="font-semibold text-slate-700">Popular Brands:</span>
                {seoData.popularBrands.map(brand => (
                  <Link 
                    key={brand} 
                    to={`/brand/${brand.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-")}`}
                    className="text-emerald-600 hover:underline"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-[270px] shrink-0 sticky top-[140px] z-10">
            <FilterSidebar 
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              maxDist={maxDist} setMaxDist={setMaxDist}
              selectedBrands={selectedBrands} toggleBrand={toggleBrand}
            />
          </aside>

          {/* PRODUCT LISTING AREA */}
          <div className="flex-1 min-w-0 flex flex-col w-full">
            
            <TopToolbar 
              totalProducts={filteredProducts.length}
              categoryName={formattedTitle}
              sortType={sortType} setSortType={setSortType}
              viewMode={viewMode} setViewMode={setViewMode}
            />

            {/* Mobile Filter Trigger */}
            <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 mb-4 shadow-sm">
              <span className="text-xs font-bold text-slate-700">{filteredProducts.length} items found</span>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-800 transition-colors"
              >
                <SlidersHorizontal size={14} /> Filter & Sort
              </button>
            </div>

            {/* PRODUCTS CONTAINER */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
                  <p className="text-sm font-semibold text-slate-600">Loading catalog items...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm px-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                    Try adjusting your filters or price slider to see more products in this category.
                  </p>
                  <button 
                    onClick={() => { setMaxPrice(100000); setSelectedBrands([]); }}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-sm"
                  >
                    Reset All Filters
                  </button>
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-[120] overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base">Filter Catalog</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 p-4">
                 <FilterSidebar 
                  maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                  maxDist={maxDist} setMaxDist={setMaxDist}
                  selectedBrands={selectedBrands} toggleBrand={toggleBrand}
                  onClose={() => setIsMobileFilterOpen(false)}
                />
              </div>
              <div className="sticky bottom-0 bg-white p-4 border-t border-slate-200 shadow-lg">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-emerald-700 transition-colors"
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