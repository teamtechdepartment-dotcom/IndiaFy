/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Search,
  Plus,
  Minus,
  Info,
  ChevronLeft,
  BadgeCheck,
  ShoppingBag,
  ChevronRight,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import axiosInstance from "../../utils/axiosInstance";

const CATEGORIES = ["All", "Essentials", "Grocery", "Personal Care", "Home Decor"];

import { useCartStore } from "../../store/cartStore";
import SEOHead from "../../components/seo/SEOHead";
import { Skeleton } from "../../components/ui/Skeleton";
import { ProductSkeleton } from "../../components/ui/skeletons/ProductSkeleton";

export default function StorePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [storeInfo, setStoreInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use global cart store
  const { cartItems, addToCart, removeFromCart } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Store Node from public endpoint (no auth required)
        const storeRes = await axiosInstance.get(`/public/stores?limit=1`);
        // Try to find the specific store by ID from all stores
        // Better: fetch single store from seller nodes endpoint (public-safe read)
        const nodeRes = await axiosInstance.get(`/seller/nodes/${id}`).catch(() => null);
        
        let storeData = nodeRes?.node || null;
        
        if (!storeData) {
          // Fallback: search in all public stores
          const allRes = await axiosInstance.get(`/public/stores?limit=100`);
          storeData = (allRes?.stores || []).find((s) => s._id === id) || null;
        }

        if (storeData) {
          setStoreInfo(storeData);
        } else {
          console.error("Store not found for id:", id);
        }

        // 2. Fetch Store Products (by nodeId)
        const prodRes = await axiosInstance.get(`/products?nodeId=${id}`).catch(() => null);
        const productsData = prodRes?.data || prodRes?.products || prodRes || [];
        const productsArray = Array.isArray(productsData) ? productsData : [];

        setProducts(productsArray.map(p => ({
          id: p._id,
          name: p.productName,
          price: p.attribute?.salePrice || 0,
          originalPrice: p.attribute?.mrpPrice || 0,
          weight: p.attribute?.weight || "N/A",
          category: p.categoryName || "General",
          tag: "",
          img: p.productImage?.[0] || "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400",
        })));
      } catch (_err) {
        console.error("Fetch store data failed", _err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const getProductQty = (productId) => {
    if (!cartItems) return 0;
    const item = cartItems.find(i => i.product?._id === productId || i.product === productId);
    return item ? item.quantity : 0;
  };

  const handleUpdateCart = (product, delta) => {
    addToCart(product.id, delta);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  });

  const cartTotalItems = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 max-w-7xl mx-auto w-full space-y-8 bg-zinc-50">
        <Skeleton className="w-full h-64 rounded-3xl" />
        <Skeleton className="w-48 h-12" />
        <ProductSkeleton count={10} variant="grid" />
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-6 text-center">
         <Package size={64} className="text-slate-900 mb-6" />
         <h1 className="text-3xl font-black text-slate-900 mb-2">Store Not Found</h1>
         <p className="text-slate-500 mb-8 max-w-xs">The store you are looking for does not exist or has been deactivated.</p>
         <button onClick={() => navigate("/local-sellers")} className="px-8 py-4 bg-white shadow-sm border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest">Back to Directory</button>
      </div>
    );
  }

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": storeInfo.storeName || storeInfo.businessName || "Verified Store",
    "image": storeInfo.logo || storeInfo.banner || "https://india-fy.vercel.app/logo.png",
    "description": storeInfo.description || "Local Verified Store on Indiafy",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": storeInfo.city || "Gurugram",
      "addressCountry": "IN"
    },
    "telephone": storeInfo.phone || storeInfo.contact || ""
  };

  return (
    <div className="bg-zinc-50 min-h-screen font-sans pb-24">
      <SEOHead 
        title={`${storeInfo.storeName || storeInfo.businessName || "Store"} | Indiafy`}
        description={storeInfo.description || `Shop from ${storeInfo.storeName || "this verified store"} on Indiafy.`}
        image={storeInfo.logo || storeInfo.banner}
        schemas={[storeSchema]}
      />
      <WebsiteNavbar />

      <main className="pt-16 md:pt-20">

      {/* Background Blobs for Hero Theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[100px]" />
      </div>
      
        {/* 🏬 STORE HEADER */}
        <section className="relative w-full">
          {/* Banner */}
          <div className="relative w-full h-48 md:h-64 bg-zinc-200">
            <img loading="lazy" decoding="async"
              src={storeInfo.banner || "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=1600"}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 md:top-6 md:left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Overlapping Store Info Card */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-20 z-10">
            <div className="bg-white rounded-[2rem] p-5 md:p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center">
              {/* Logo */}
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-lg shrink-0 bg-slate-100">
                <img loading="lazy" decoding="async"
                  src={storeInfo.logo || "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=200"}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Store Details */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      {storeInfo.storeName || storeInfo.businessName || "Verified Store"}
                      {storeInfo.isVerified && <BadgeCheck size={24} className="text-emerald-500" />}
                    </h1>
                    <p className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">
                      {storeInfo.storeCategory || "Local Store"} · {storeInfo.nodeType?.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5
                    ${storeInfo.isStoreOpen !== false ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${storeInfo.isStoreOpen !== false ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                    {storeInfo.isStoreOpen !== false ? "Open Now" : "Closed"}
                  </div>
                </div>

                {storeInfo.description && (
                  <p className="text-slate-500 text-sm mb-3 max-w-xl">{storeInfo.description}</p>
                )}

                {/* Info Pills */}
                <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
                  <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                    <Star size={14} className="text-amber-400" fill="currentColor" />
                    <span className="text-xs font-bold text-slate-600">{(storeInfo.rating || 4.5).toFixed(1)} Rating</span>
                  </div>
                  {storeInfo.dispatchSpeed && (
                    <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                      <Clock size={14} className="text-blue-500" />
                      <span className="text-xs font-bold text-slate-600">{storeInfo.dispatchSpeed} Delivery</span>
                    </div>
                  )}
                  {storeInfo.city && (
                    <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                      <MapPin size={14} className="text-slate-600" />
                      <span className="text-xs font-bold text-slate-600">{storeInfo.city}</span>
                    </div>
                  )}
                  {storeInfo.deliveryRadius && (
                    <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                      <Info size={14} className="text-slate-600" />
                      <span className="text-xs font-bold text-slate-600">{storeInfo.deliveryRadius} km radius</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🔍 SEARCH & CATEGORIES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sticky top-[60px] md:top-[70px] z-30 bg-zinc-50/90 backdrop-blur-xl py-4 -mx-4 px-4">
          <div className="flex items-center bg-white border border-zinc-200 rounded-2xl p-1 shadow-sm mb-4">
            <Search size={18} className="text-slate-600 ml-3" />
            <input
              type="text"
              placeholder="Search products in this store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-3 px-3 outline-none text-sm font-medium text-slate-900 bg-transparent placeholder:text-slate-600"
            />
          </div>

          {/* Horizontal Scrollable Categories */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  activeCategory === cat
                    ? "bg-white shadow-sm border border-slate-200 text-slate-900 shadow-md shadow-slate-200"
                    : "bg-white border border-zinc-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* 🛒 PRODUCTS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const qty = getProductQty(product.id);

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-3 border border-zinc-100 hover:shadow-xl hover:border-emerald-500/20 transition-all flex flex-col relative group"
                  >
                    {/* Discount/Tag Badge */}
                    {product.tag && (
                      <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-br-xl rounded-tl-[1.5rem] z-10 shadow-sm">
                        {product.tag}
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="w-full aspect-square bg-zinc-50 rounded-xl md:rounded-2xl mb-3 overflow-hidden relative p-4">
                      <img loading="lazy" decoding="async"
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 text-xs md:text-sm leading-tight line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-600 mb-3">
                        {product.weight}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-sm md:text-base font-black text-slate-900">
                            ₹{product.price}
                          </p>
                          {product.originalPrice > product.price && (
                            <p className="text-[10px] text-slate-600 line-through">
                              ₹{product.originalPrice}
                            </p>
                          )}
                        </div>

                        {/* Add to Cart / Counter Logic */}
                        {qty === 0 ? (
                          <button
                            onClick={() => handleUpdateCart(product, 1)}
                            className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors active:scale-95 shadow-sm"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 bg-emerald-500 text-white px-2 py-1.5 rounded-lg shadow-md shadow-emerald-500/20">
                            <button
                              onClick={() => handleUpdateCart(product, -1)}
                              className="p-0.5 active:scale-90"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-black w-3 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleUpdateCart(product, 1)}
                              className="p-0.5 active:scale-90"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center">
              <Search size={48} className="text-slate-900 mb-4" />
              <h3 className="text-xl font-black text-slate-900 mb-1">
                No products found
              </h3>
              <p className="text-slate-500 text-sm">
                Try searching for something else in this store.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* 🛒 FLOATING CART BOTTOM BAR (Only shows if items in cart) */}
      <AnimatePresence>
        {cartTotalItems > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white shadow-sm border border-slate-200 text-slate-900 p-4 rounded-[1.5rem] shadow-2xl flex items-center justify-between z-50 border border-slate-300"
          >
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl border border-slate-300">
                <ShoppingBag size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-black text-sm">
                  {cartTotalItems} ITEM{cartTotalItems > 1 ? "S" : ""}
                </p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Added to cart
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/cart")}
              className="bg-emerald-500 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors active:scale-95"
            >
              View Cart{" "}
              <ChevronRight size={14} className="inline ml-1 -mt-0.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
