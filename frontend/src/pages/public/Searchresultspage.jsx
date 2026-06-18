/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, no-undef */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import { 
  Search, ChevronDown, Filter, Star, Heart, 
  Truck, MapPin, Grid, List, Check, X 
} from "lucide-react";

// ─── PRODUCT DATA ───────────────────────────────────────────────────────────
const ALL = [
  { id: 1, name: "Samsung Galaxy S24 Ultra 5G", brand: "Samsung", price: 124999, orig: 134999, rating: 4.8, reviews: 5621, seller: "Samsung SmartShop", dist: 1.2, eta: 15, img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80", badge: "Best Seller", stock: true },
  { id: 2, name: "Apple iPhone 15 Pro Max 256GB", brand: "Apple", price: 159900, orig: 174900, rating: 4.9, reviews: 8342, seller: "iZone Official", dist: 2.5, eta: 22, img: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80", badge: "Top Rated", stock: true },
  { id: 3, name: "OnePlus 12 5G Silky Black 12GB", brand: "OnePlus", price: 64999, orig: 74999, rating: 4.6, reviews: 3210, seller: "TechBazaar", dist: 0.8, eta: 12, img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80", badge: "Hot Deal", stock: true },
  { id: 4, name: "Xiaomi 14 5G Flagship Snapdragon 8", brand: "Xiaomi", price: 59999, orig: 69999, rating: 4.5, reviews: 2145, seller: "MiZone Store", dist: 3.1, eta: 32, img: "https://images.unsplash.com/photo-1533228100845-08145b01de14?w=800&q=80", badge: null, stock: true },
  { id: 5, name: "Google Pixel 8 Pro 12GB RAM 256GB", brand: "Google", price: 84999, orig: 99999, rating: 4.7, reviews: 1876, seller: "GadgetHub", dist: 4.2, eta: 45, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80", badge: "New", stock: true },
  { id: 6, name: "Realme 12 Pro+ 5G 256GB Submarine Blue", brand: "Realme", price: 27999, orig: 34999, rating: 4.3, reviews: 987, seller: "QuickMart", dist: 1.5, eta: 18, img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80", badge: "Budget", stock: true },
  { id: 7, name: "Nothing Phone (2a) 128GB 8GB RAM", brand: "Nothing", price: 22999, orig: 27999, rating: 4.4, reviews: 2034, seller: "TechBazaar", dist: 0.8, eta: 12, img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80", badge: "New", stock: true },
  { id: 8, name: "Motorola Edge 50 Ultra 512GB Black", brand: "Motorola", price: 57999, orig: 62999, rating: 4.5, reviews: 1243, seller: "MobilWorld", dist: 5.8, eta: 55, img: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&q=80", badge: null, stock: false },
  { id: 9, name: "Vivo X100 Pro 5G Asteroid Black 256GB", brand: "Vivo", price: 89999, orig: 99999, rating: 4.6, reviews: 891, seller: "VivoZone", dist: 2.9, eta: 28, img: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80", badge: null, stock: true },
  { id: 10, name: "iQOO 12 5G 16GB + 512GB Monster Orange", brand: "iQOO", price: 54999, orig: 59999, rating: 4.7, reviews: 1567, seller: "iQOO Flagship", dist: 3.5, eta: 38, img: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80", badge: "Gaming", stock: true },
  { id: 11, name: "Samsung Galaxy A55 5G 256GB Awesome Ice", brand: "Samsung", price: 38999, orig: 44999, rating: 4.4, reviews: 3120, seller: "Samsung SmartShop", dist: 1.2, eta: 15, img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80", badge: null, stock: true },
  { id: 12, name: "iPhone 16 128GB Teal — Latest Model", brand: "Apple", price: 79900, orig: 79900, rating: 4.8, reviews: 2891, seller: "iZone Official", dist: 2.5, eta: 22, img: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80", badge: "New", stock: true },
];

const SORTS = [
  { k: "rel", l: "Relevance" },
  { k: "p_asc", l: "Price: Low to High" },
  { k: "p_desc", l: "Price: High to Low" },
  { k: "rating", l: "Top Rated" },
  { k: "eta", l: "Fastest Delivery" },
];

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const pct = (p, o) => Math.round(((o - p) / o) * 100);

const PER_PAGE = 8;
const DF = { maxPrice: 200000, minPrice: 0, minRating: 0, stockOnly: false };

export default function SearchResultsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryFromUrl = searchParams.get("q") || "smartphone";

  const [query, setQuery] = useState(queryFromUrl);
  const [sort, setSort] = useState("rel");
  const [filt, setFilt] = useState(DF);
  const [page, setPage] = useState(1);
  const [view, setView] = useState("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") || "smartphone");
  }, [location.search]);

  const results = useMemo(() => {
    let list = ALL.filter((p) => {
      if (p.price < filt.minPrice || p.price > filt.maxPrice) return false;
      if (p.rating < filt.minRating) return false;
      if (filt.stockOnly && !p.stock) return false;
      // Basic search logic
      if (!p.name.toLowerCase().includes(query.toLowerCase()) && 
          !p.brand.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    switch (sort) {
      case "p_asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "p_desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "eta": list = [...list].sort((a, b) => a.eta - b.eta); break;
    }
    return list;
  }, [filt, sort, query]);

  const paginated = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(results.length / PER_PAGE);

  const sl = (key, val) => {
    setFilt((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-text-primary">
      <WebsiteNavbar />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:pt-32">
        {/* Breadcrumb / Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-md shadow-sm border border-brand-border mb-4">
          <h1 className="text-sm font-medium text-brand-text-primary">
            Showing <span className="font-bold">{results.length > 0 ? (page - 1) * PER_PAGE + 1 : 0} – {Math.min(page * PER_PAGE, results.length)}</span> of <span className="font-bold">{results.length}</span> results for <span className="text-brand-primary font-semibold">"{query}"</span>
          </h1>

          <div className="flex items-center gap-4 mt-3 md:mt-0">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-brand-text-secondary">Sort By:</span>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent font-medium text-brand-text-primary border-none outline-none cursor-pointer focus:ring-0 p-0"
              >
                {SORTS.map(s => (
                  <option key={s.k} value={s.k}>{s.l}</option>
                ))}
              </select>
            </div>

            {/* View Toggles */}
            <div className="hidden sm:flex items-center gap-1 border border-brand-border rounded">
              <button 
                onClick={() => setView("grid")} 
                className={`p-1.5 ${view === 'grid' ? 'bg-brand-background text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setView("list")} 
                className={`p-1.5 ${view === 'list' ? 'bg-brand-background text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}
              >
                <List size={16} />
              </button>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1 text-sm font-medium border border-brand-border px-3 py-1.5 rounded bg-white hover:bg-gray-50"
            >
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar Filters */}
          <div className={`fixed inset-0 z-[110] bg-black/50 lg:static lg:bg-transparent lg:z-auto transition-opacity ${isMobileFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto"}`}>
            <div className={`absolute top-0 left-0 w-[280px] h-full bg-white shadow-xl lg:static lg:w-full lg:h-auto lg:shadow-none border border-brand-border rounded-md transform transition-transform ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-brand-border lg:hidden">
                <span className="font-bold text-lg">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)}><X size={20} /></button>
              </div>

              <div className="p-4 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button 
                    onClick={() => setFilt(DF)}
                    className="text-xs text-brand-primary font-medium hover:underline uppercase"
                  >
                    Clear All
                  </button>
                </div>

                <hr className="border-brand-border" />

                {/* Price Filter */}
                <div>
                  <h4 className="font-medium text-sm mb-3 uppercase text-brand-text-secondary tracking-wider">Price</h4>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="range" 
                      min="0" max="200000" step="5000"
                      value={filt.maxPrice}
                      onChange={(e) => sl("maxPrice", +e.target.value)}
                      className="w-full accent-brand-primary"
                    />
                    <div className="flex items-center justify-between text-xs text-brand-text-primary font-medium">
                      <span>₹0</span>
                      <span>{fmt(filt.maxPrice)}</span>
                    </div>
                  </div>
                </div>

                <hr className="border-brand-border" />

                {/* Rating Filter */}
                <div>
                  <h4 className="font-medium text-sm mb-3 uppercase text-brand-text-secondary tracking-wider">Customer Ratings</h4>
                  <div className="flex flex-col gap-2">
                    {[4, 3, 2, 1].map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input 
                          type="checkbox" 
                          checked={filt.minRating === r}
                          onChange={() => sl("minRating", filt.minRating === r ? 0 : r)}
                          className="rounded text-brand-primary focus:ring-brand-primary"
                        />
                        {r}★ & above
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="border-brand-border" />

                {/* Availability Filter */}
                <div>
                  <h4 className="font-medium text-sm mb-3 uppercase text-brand-text-secondary tracking-wider">Availability</h4>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="checkbox" 
                      checked={filt.stockOnly}
                      onChange={() => sl("stockOnly", !filt.stockOnly)}
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    Exclude Out of Stock
                  </label>
                </div>

              </div>
            </div>
          </div>

          {/* Main Results Area */}
          <div>
            {paginated.length === 0 ? (
              <div className="bg-white p-12 rounded-md border border-brand-border text-center flex flex-col items-center justify-center min-h-[400px]">
                <Search size={48} className="text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Sorry, no results found!</h3>
                <p className="text-brand-text-secondary mb-6">Please check the spelling or try searching for something else</p>
                <button 
                  onClick={() => setFilt(DF)}
                  className="bg-brand-primary text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {paginated.map(p => (
                  <ProductCardGrid key={p.id} p={p} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {paginated.map(p => (
                  <ProductCardList key={p.id} p={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-1 bg-white border border-brand-border rounded-md shadow-sm">
                  <button 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-brand-primary font-medium disabled:text-gray-400"
                  >
                    PREV
                  </button>
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${page === i + 1 ? 'bg-brand-primary text-white' : 'text-brand-text-primary hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setPage(prev => Math.min(pages, prev + 1))}
                    disabled={page === pages}
                    className="px-4 py-2 text-brand-primary font-medium disabled:text-gray-400"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT CARDS ──────────────────────────────────────────────────────────

function ProductCardGrid({ p }) {
  const [wishlist, setWishlist] = useState(false);
  const dp = pct(p.price, p.orig);

  return (
    <div className="group relative bg-white border border-brand-border rounded-md hover:shadow-card-hover transition-all flex flex-col overflow-hidden h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-brand-background/30 p-4 flex items-center justify-center overflow-hidden">
        <img loading="lazy" src={p.img} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.preventDefault(); setWishlist(!wishlist); }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart size={18} className={wishlist ? "fill-red-500 text-red-500" : ""} />
        </button>

        {/* Out of stock overlay */}
        {!p.stock && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded shadow-sm border border-gray-200">OUT OF STOCK</span>
          </div>
        )}

        {/* Badge */}
        {p.badge && (
          <span className="absolute top-3 left-3 bg-brand-accent text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
            {p.badge}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-brand-text-secondary font-medium uppercase tracking-wider mb-1">{p.brand}</span>
        
        <h3 className="text-sm font-medium text-brand-text-primary group-hover:text-brand-primary line-clamp-2 leading-snug mb-2 flex-1">
          {p.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-brand-success text-white flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold">
            {p.rating} <Star size={10} className="fill-white" />
          </span>
          <span className="text-xs text-brand-text-secondary font-medium">({p.reviews.toLocaleString()})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-brand-text-primary">{fmt(p.price)}</span>
          {dp > 0 && (
            <>
              <span className="text-xs text-brand-text-secondary line-through">{fmt(p.orig)}</span>
              <span className="text-xs font-bold text-brand-success">{dp}% off</span>
            </>
          )}
        </div>
        
        {/* Delivery / Add to Cart */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-brand-text-secondary flex items-center gap-1 font-medium">
            <Truck size={14} /> {p.eta} min
          </span>
          <button 
            disabled={!p.stock}
            className="text-xs font-bold uppercase text-brand-accent disabled:text-gray-400 hover:text-brand-accent-hover transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCardList({ p }) {
  const [wishlist, setWishlist] = useState(false);
  const dp = pct(p.price, p.orig);

  return (
    <div className="group relative bg-white border border-brand-border rounded-md hover:shadow-card-hover transition-all flex flex-col sm:flex-row p-4 gap-6 overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full sm:w-[200px] aspect-square shrink-0 bg-brand-background/30 rounded flex items-center justify-center overflow-hidden">
        <img loading="lazy" src={p.img} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2" />
        
        <button 
          onClick={(e) => { e.preventDefault(); setWishlist(!wishlist); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          <Heart size={18} className={wishlist ? "fill-red-500 text-red-500" : ""} />
        </button>

        {!p.stock && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded shadow-sm border border-gray-200">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-col sm:flex-row flex-1 gap-4">
        {/* Left Side Details */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-medium text-brand-text-primary group-hover:text-brand-primary leading-snug mb-1">
            {p.name}
          </h3>
          <span className="text-xs text-brand-text-secondary font-medium uppercase tracking-wider mb-3">{p.brand}</span>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-brand-success text-white flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold">
              {p.rating} <Star size={10} className="fill-white" />
            </span>
            <span className="text-sm text-brand-text-secondary font-medium">{p.reviews.toLocaleString()} Ratings & Reviews</span>
          </div>

          <ul className="text-sm text-brand-text-primary space-y-1 mt-auto">
            <li className="flex items-center gap-2 before:content-['•'] before:text-gray-300">Brand Warranty of 1 Year</li>
            <li className="flex items-center gap-2 before:content-['•'] before:text-gray-300">Sold by {p.seller}</li>
          </ul>
        </div>

        {/* Right Side Pricing */}
        <div className="w-full sm:w-[250px] shrink-0 flex flex-col gap-2 sm:items-end">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-text-primary">{fmt(p.price)}</span>
          </div>
          {dp > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-text-secondary line-through">{fmt(p.orig)}</span>
              <span className="text-sm font-bold text-brand-success">{dp}% off</span>
            </div>
          )}
          
          <p className="text-xs text-brand-text-secondary mt-1 flex items-center gap-1">
            <Truck size={14} /> Free Delivery by Today, {p.eta} min
          </p>
          
          <button 
            disabled={!p.stock}
            className="mt-auto w-full sm:w-auto bg-brand-accent hover:bg-brand-accent-hover text-white px-8 py-2.5 rounded font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}