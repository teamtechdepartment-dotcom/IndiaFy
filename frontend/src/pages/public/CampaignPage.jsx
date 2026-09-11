import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Flame, 
  Sparkles, 
  Calendar, 
  Tag, 
  Store, 
  ArrowLeft, 
  Clock, 
  Search,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  X
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import ProductGrid from "../../components/Category/ProductGrid";
import SEO from "../../components/seo/SEO";

export default function CampaignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    let isMounted = true;
    const fetchCampaignData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/campaigns/${id}`);
        const data = res?.data?.data || res?.data || {};
        if (isMounted) {
          if (data.campaign) {
            setCampaign(data.campaign);
            setProducts(data.products || []);
          } else {
            setError("Campaign not found or currently unavailable.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load campaign:", err);
          setError(err?.response?.data?.message || "Failed to load campaign products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchCampaignData();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Extract distinct sellers for filtering
  const sellers = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const s = p.sellerId;
      if (s) {
        const sId = String(s._id || s.id || s);
        const sName = s.businessName || `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email || "Seller";
        if (!map.has(sId)) {
          map.set(sId, sName);
        }
      }
    });
    return Array.from(map.entries()).map(([sellerId, name]) => ({ sellerId, name }));
  }, [products]);

  // Filter products by search and seller, and apply sort
  const filteredAndSortedProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchesSearch =
        !searchTerm.trim() ||
        (p.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeller =
        selectedSeller === "all" ||
        String(p.sellerId?._id || p.sellerId?.id || p.sellerId) === selectedSeller;

      return matchesSearch && matchesSeller;
    });

    if (sortBy === "price-low") {
      list.sort((a, b) => (a.salePrice ?? a.price ?? 0) - (b.salePrice ?? b.price ?? 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.salePrice ?? b.price ?? 0) - (a.salePrice ?? a.price ?? 0));
    } else if (sortBy === "rating") {
      list.sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0));
    }

    return list;
  }, [products, searchTerm, selectedSeller, sortBy]);

  // Map products to the format expected by ProductGrid / ProductCard
  const mappedProducts = useMemo(() => {
    return filteredAndSortedProducts.map((p) => {
      const price = p.salePrice ?? p.attribute?.salePrice ?? p.price ?? 0;
      const original = p.originalPrice ?? p.attribute?.originalSellerPrice ?? p.attribute?.mrpPrice ?? p.price ?? price;
      const rating = p.ratingAverage ?? 4.5;
      const reviews = p.ratingCount ?? 12;
      const sellerName = p.sellerId
        ? `${p.sellerId.firstName || ""} ${p.sellerId.lastName || ""}`.trim() || p.sellerId.businessName || "Verified Seller"
        : "Verified Seller";
      const img = p.productImage?.[0] || p.thumbnail || "https://placehold.co/400x400?text=Product";

      return {
        id: p._id || p.id,
        name: p.productName || "Product",
        brand: p.brand || "Indiafy",
        price: Number(price),
        original: Number(original),
        rating,
        reviews,
        seller: sellerName,
        dist: 1.0,
        eta: "Today",
        img,
        badge: p.campaign?.badgeText ? `🔥 ${p.campaign.badgeText}` : (campaign?.badgeText ? `🔥 ${campaign.badgeText}` : "Special Sale"),
        campaign: p.campaign || (campaign ? {
          id: campaign._id,
          name: campaign.name,
          discountValue: campaign.discountValue,
          discountType: campaign.discountType,
          badgeText: campaign.badgeText || "Sale"
        } : null),
        inStock: p.stock !== undefined ? p.stock > 0 : true,
      };
    });
  }, [filteredAndSortedProducts, campaign]);

  const hasFiltersActive = searchTerm.trim() !== "" || selectedSeller !== "all" || sortBy !== "featured";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SEO 
        title={campaign ? `${campaign.name} - Exclusive Deals on IndiaFy` : "Special Campaign - IndiaFy"} 
        description={campaign?.description || "Browse exclusive limited time discounted products across multiple sellers on IndiaFy."}
      />
      <WebsiteNavbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition flex items-center gap-1">
            <ArrowLeft size={14} /> Home
          </Link>
          <span>/</span>
          <span className="text-slate-400">Campaigns</span>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-xs">{campaign?.name || "Deals"}</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-28 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-500">Loading campaign exclusive deals...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-rose-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h2 className="text-xl font-black text-slate-900">Campaign Unavailable</h2>
            <p className="text-sm text-slate-500">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Campaign Loaded Content */}
        {!loading && campaign && (
          <>
            {/* HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-rose-800/40 min-h-[260px] sm:min-h-[300px] flex items-center bg-slate-950">
              {/* Optional Background Banner Image */}
              {campaign.bannerImage ? (
                <>
                  <img 
                    src={campaign.bannerImage} 
                    alt={campaign.name} 
                    className="absolute inset-0 w-full h-full object-cover object-center" 
                  />
                  {/* High contrast dark gradient overlay ensuring 100% readable text */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/40 md:from-black/90 md:via-black/60 md:to-transparent z-0" />
                  <div className="absolute inset-0 bg-rose-950/25 mix-blend-multiply z-0 pointer-events-none" />
                </>
              ) : (
                /* Rich Dark Festive Gradient Fallback */
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-[#3a0808] to-[#7f1d1d] z-0">
                  {/* Decorative ambient glowing lights */}
                  <div className="absolute -top-10 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 left-1/4 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                </div>
              )}

              {/* Banner Foreground Content */}
              <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3.5 max-w-3xl">
                  {/* Festive Flame Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                    <Flame size={15} className="text-amber-400 animate-pulse" />
                    <span>{campaign.badgeText || "Special Sale"}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
                    {campaign.name}
                  </h1>

                  {/* Description */}
                  {campaign.description && (
                    <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed font-medium max-w-2xl drop-shadow">
                      {campaign.description}
                    </p>
                  )}

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-rose-200">
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-white shadow-sm">
                      <Tag size={15} className="text-amber-400 shrink-0" />
                      <span>
                        Automatic <strong className="text-amber-300 font-extrabold">{campaign.discountValue}% OFF</strong> applied on every product
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-white shadow-sm">
                      <Clock size={15} className="text-emerald-400 shrink-0" />
                      <span>
                        Valid till:{" "}
                        <strong className="text-white font-bold">
                          {new Date(campaign.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Big Glossy Discount Badge */}
                <div className="shrink-0 flex items-center justify-start md:justify-center">
                  <div className="bg-gradient-to-b from-amber-400 via-orange-500 to-rose-600 text-white p-6 sm:p-7 rounded-3xl shadow-2xl text-center transform hover:scale-105 transition-all duration-300 border-2 border-white/30 backdrop-blur-md min-w-[160px] sm:min-w-[180px]">
                    <span className="inline-block text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-950 bg-white/40 rounded-full py-0.5 px-2.5 mb-1.5 shadow-xs">
                      Mega Discount
                    </span>
                    <span className="block text-4xl sm:text-5xl font-black text-white leading-none my-1 drop-shadow-md tracking-tight">
                      {campaign.discountValue}%
                    </span>
                    <span className="block text-[11px] font-black uppercase tracking-widest text-white/95 drop-shadow">
                      Instant OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCT CONTROLS, SEARCH & FILTERS */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Participating Products:
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-black border border-blue-100">
                  {mappedProducts.length} Items Available
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in this sale..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Seller Filter */}
                {sellers.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <Store size={14} className="text-slate-400 shrink-0 hidden sm:block" />
                    <select
                      value={selectedSeller}
                      onChange={(e) => setSelectedSeller(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="all">All Sellers</option>
                      {sellers.map((s) => (
                        <option key={s.sellerId} value={s.sellerId}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort Filter */}
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-slate-400 shrink-0 hidden sm:block" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="featured">Featured Deals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                {/* Clear all active filters */}
                {hasFiltersActive && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSeller("all");
                      setSortBy("featured");
                    }}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="space-y-4">
              {mappedProducts.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500 space-y-3 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    🔍
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No products match your filter criteria</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try searching with different keywords or reset your filters to see all available campaign products.
                  </p>
                  {hasFiltersActive && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedSeller("all");
                        setSortBy("featured");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                <ProductGrid products={mappedProducts} viewMode="grid" />
              )}
            </div>

            {/* CAMPAIGN TRUST BADGE STRIP */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Verified Seller Products</p>
                  <p className="text-[11px] text-slate-400 font-normal">Authentic products sourced from vetted Indian sellers</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Automatic Discount Guarantee</p>
                  <p className="text-[11px] text-slate-400 font-normal">Flat campaign discount applied automatically at checkout</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-black text-slate-900">Official IndiaFy Event</p>
                  <p className="text-[11px] text-slate-400 font-normal">Special limited promotional festive campaign</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
