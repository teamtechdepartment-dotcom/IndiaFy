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
        // 1. Fetch Store Details
        const storeRes = await axiosInstance.get(`/seller/auth/profile/${id}`);
        // axiosInstance returns the response.data directly
        const storeData = storeRes?.data || storeRes;
        
        if (storeData && (storeData._id || storeData.id)) {
          setStoreInfo(storeData);
        } else {
          console.error("Invalid store data received", storeRes);
        }

        // 2. Fetch Store Products
        const prodRes = await axiosInstance.get(`/products?sellerId=${id}`);
        const productsData = prodRes?.data || prodRes || [];
        
        // Ensure productsData is an array
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
      } catch (err) {
        console.error("Fetch store data failed", err);
        toast.error("Failed to load store information");
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-bold text-sm animate-pulse uppercase tracking-widest">Initialising Terminal...</p>
        </div>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-6 text-center">
         <Package size={64} className="text-zinc-200 mb-6" />
         <h1 className="text-3xl font-black text-zinc-900 mb-2">Store Not Found</h1>
         <p className="text-zinc-500 mb-8 max-w-xs">The store you are looking for does not exist or has been deactivated.</p>
         <button onClick={() => navigate("/local-sellers")} className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Back to Directory</button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen font-sans pb-24">
      <WebsiteNavbar />

      <main className="pt-16 md:pt-20">
        {/* 🏬 STORE HEADER (Cover + Details) */}
        <section className="relative w-full">
          {/* Cover Image */}
          <div className="relative w-full h-48 md:h-64 bg-zinc-200">
            <img
              src={storeInfo.coverImg || "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=1600"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 md:top-6 md:left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Overlapping Store Info Card */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 md:-mt-20 z-10">
            <div className="bg-white rounded-[2rem] p-5 md:p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center">
              {/* Store Logo */}
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-lg shrink-0 bg-zinc-100">
                <img
                  src={storeInfo.logo || "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=200"}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Store Details */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                      {storeInfo.businessName || `${storeInfo.firstName}'s Store`}
                      <BadgeCheck size={24} className="text-emerald-500" />
                    </h1>
                    <p className="text-zinc-500 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">
                      Verified Seller Node
                    </p>
                  </div>

                  <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                    Live
                  </div>
                </div>

                {/* Info Pills */}
                <div className="flex flex-wrap gap-2 md:gap-4 mt-4">
                  <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                    <Star
                      size={14}
                      className="text-amber-400"
                      fill="currentColor"
                    />
                    <span className="text-xs font-bold text-zinc-700">
                      4.8 Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                    <Clock size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-zinc-700">
                      15 mins Delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                    <MapPin size={14} className="text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-700">
                      0.8 km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🔍 SEARCH & CATEGORIES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sticky top-[60px] md:top-[70px] z-30 bg-zinc-50/90 backdrop-blur-xl py-4 -mx-4 px-4">
          <div className="flex items-center bg-white border border-zinc-200 rounded-2xl p-1 shadow-sm mb-4">
            <Search size={18} className="text-zinc-400 ml-3" />
            <input
              type="text"
              placeholder="Search products in this store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-3 px-3 outline-none text-sm font-medium text-zinc-900 bg-transparent placeholder:text-zinc-400"
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
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/20"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
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
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1">
                      <h3 className="font-bold text-zinc-900 text-xs md:text-sm leading-tight line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-400 mb-3">
                        {product.weight}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-sm md:text-base font-black text-zinc-900">
                            ₹{product.price}
                          </p>
                          {product.originalPrice > product.price && (
                            <p className="text-[10px] text-zinc-400 line-through">
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
              <Search size={48} className="text-zinc-200 mb-4" />
              <h3 className="text-xl font-black text-zinc-900 mb-1">
                No products found
              </h3>
              <p className="text-zinc-500 text-sm">
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
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-zinc-900 text-white p-4 rounded-[1.5rem] shadow-2xl flex items-center justify-between z-50 border border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <div className="bg-zinc-800 p-2.5 rounded-xl border border-zinc-700">
                <ShoppingBag size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-black text-sm">
                  {cartTotalItems} ITEM{cartTotalItems > 1 ? "S" : ""}
                </p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
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
