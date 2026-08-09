/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import {
  Trash2,
  Plus,
  Minus,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Clock,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Zap,
  ShoppingBasket,
  Laptop,
  Sparkles,
  Bookmark,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import { Skeleton } from "../../components/ui/Skeleton";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const QUICK_CATEGORIES = [
  { name: "Groceries", path: "/category/groceries", icon: ShoppingBasket, color: "text-emerald-600 bg-emerald-50" },
  { name: "Electronics", path: "/category/electronics", icon: Laptop, color: "text-blue-600 bg-blue-50" },
  { name: "Beauty", path: "/category/beauty", icon: Sparkles, color: "text-pink-600 bg-pink-50" },
  { name: "Under 30-Min", path: "/category/quick-commerce", icon: Zap, color: "text-amber-600 bg-amber-50" },
];

export default function CartPage() {
  const { cartItems, totalPrice, isLoading, fetchCart, addToCart, removeFromCart } = useCartStore();
  const [saved, setSaved] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQty = (id, delta) => addToCart(id, delta);
  const removeItem = (id) => removeFromCart(id);

  const saveForLater = (item) => {
    removeItem(item.productId?._id);
    setSaved((prev) => [...prev, item]);
  };

  const moveToCart = (item) => {
    setSaved((prev) => prev.filter((s) => s.productId?._id !== item.productId?._id));
    addToCart(item.productId?._id, 1);
  };

  const subtotal = totalPrice;
  const totalSavings = 0;
  const gstEstimate = cartItems.reduce((acc, item) => acc + (item.gstAmount || 0), 0);
  const totalPayable = subtotal + gstEstimate;

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-[130px] lg:pt-[140px] pb-24 relative z-10">

        {/* Header */}
        {cartItems.length > 0 || saved.length > 0 ? (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                My Shopping Cart
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for checkout
              </p>
            </div>
            
            <Link 
              to="/" 
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
            >
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid lg:grid-cols-12 gap-6 items-start mt-4">
            <div className="lg:col-span-8 space-y-4">
              <Skeleton className="w-full h-20 rounded-2xl" />
              <Skeleton className="w-full h-40 rounded-2xl" />
              <Skeleton className="w-full h-40 rounded-2xl" />
            </div>
            <aside className="lg:col-span-4 space-y-6">
              <Skeleton className="w-full h-80 rounded-2xl" />
            </aside>
          </div>
        ) : cartItems.length === 0 && saved.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Cart Items */}
            <div className="lg:col-span-8 space-y-6">

              {/* Delivery Promise Banner */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                    <Truck size={22} className="text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold tracking-wide">Guaranteed Fast Express Delivery</p>
                      <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">15-25 MINS</span>
                    </div>
                    <p className="text-emerald-100/80 text-xs mt-0.5">
                      Items in your cart are allocated from nearby verified seller nodes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.productId?._id || Math.random()}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row gap-5">

                        {/* Product Thumbnail */}
                        <div
                          onClick={() => navigate(`/product/${item.productId?._id}`)}
                          className="w-full sm:w-28 aspect-square rounded-xl overflow-hidden bg-slate-50 shrink-0 cursor-pointer p-2 border border-slate-100 flex items-center justify-center group"
                        >
                          <img loading="lazy" decoding="async"
                            src={item.productId?.productImage?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop"}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            alt={item.productId?.name || "Product"}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-0.5">
                                  {item.productId?.brand || "Indiafy Store"}
                                </span>
                                <h3
                                  onClick={() => navigate(`/product/${item.productId?._id}`)}
                                  className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-2 leading-snug"
                                >
                                  {item.productId?.name || item.productId?.productName || "Product Item"}
                                </h3>
                              </div>

                              <button
                                onClick={() => removeItem(item.productId?._id)}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all shrink-0"
                                title="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <button
                                onClick={() => navigate(`/store/${item.productId?.sellerId}`)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                Seller: <span className="text-slate-900">{item.productId?.seller || "Verified Seller"}</span>
                              </button>

                              {item.isWholesale && (
                                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                  WHOLESALE B2B
                                </span>
                              )}
                            </div>

                            {item.isWholesale && item.productId?.minimumOrderQty > 1 && (
                              <p className="text-xs text-amber-700 font-semibold mt-1">
                                Minimum Order Quantity: {item.productId.minimumOrderQty} Units
                              </p>
                            )}
                          </div>

                          {/* Price & Quantity Controls */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <div>
                              <span className="text-xl font-extrabold text-slate-900">
                                {fmt(item.price)}
                              </span>
                              <button
                                onClick={() => saveForLater(item)}
                                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors mt-0.5"
                              >
                                <Bookmark size={12} /> Save for later
                              </button>
                            </div>

                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-0.5 shadow-xs">
                              <button
                                onClick={() => updateQty(item.productId?._id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white text-slate-700 rounded-lg transition-all active:scale-95"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-10 h-8 flex items-center justify-center font-extrabold text-xs text-slate-900">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => updateQty(item.productId?._id, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white text-slate-700 rounded-lg transition-all active:scale-95"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Saved for Later Section */}
              {saved.length > 0 && (
                <div className="mt-8 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Bookmark size={16} className="text-emerald-600" /> Saved for Later ({saved.length})
                  </h3>
                  <div className="space-y-3">
                    {saved.map((item) => (
                      <div
                        key={item.productId?._id}
                        className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            onClick={() => navigate(`/product/${item.productId?._id}`)}
                            className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0 cursor-pointer border border-slate-200 p-1 flex items-center justify-center"
                          >
                            <img loading="lazy" decoding="async" src={item.productId?.productImage?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop"} className="max-w-full max-h-full object-contain" alt={item.productId?.name} />
                          </div>
                          <div className="min-w-0">
                            <p
                              onClick={() => navigate(`/product/${item.productId?._id}`)}
                              className="text-xs font-bold text-slate-900 truncate cursor-pointer hover:text-emerald-700"
                            >
                              {item.productId?.name}
                            </p>
                            <p className="text-xs font-black text-slate-900 mt-0.5">{fmt(item.price)}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => moveToCart(item)}
                          className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3.5 py-2 rounded-xl hover:bg-emerald-50 transition-colors shrink-0 shadow-xs"
                        >
                          Move to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Summary */}
            <aside className="lg:col-span-4">
              <div className="sticky top-[140px] space-y-4">
                
                {/* Price Details Card */}
                <div className="bg-white shadow-xs border border-slate-200 rounded-2xl p-6">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                    <span>Payment Summary</span>
                    <Lock size={14} className="text-slate-400" />
                  </h2>

                  <div className="space-y-3 mb-6 text-xs font-medium text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Items Price ({cartItems.length})</span>
                      <span className="font-bold text-slate-900">{fmt(subtotal)}</span>
                    </div>
                    {gstEstimate > 0 && (
                      <div className="flex justify-between items-center">
                        <span>GST & Taxes</span>
                        <span className="font-bold text-slate-900">{fmt(gstEstimate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span>Delivery Fee</span>
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">FREE Express</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Discount Savings</span>
                      <span className="text-emerald-600 font-bold">-{fmt(totalSavings)}</span>
                    </div>
                  </div>

                  <div className="py-4 border-t border-slate-100 flex justify-between items-center mb-6">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 block">Total Payable Amount</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Inclusive of all taxes</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">{fmt(totalPayable)}</span>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    disabled={cartItems.length === 0}
                    className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-extrabold text-sm hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="p-4 border border-slate-200 rounded-2xl flex items-center gap-3 bg-white text-slate-600 shadow-xs">
                  <ShieldCheck size={26} className="text-emerald-600 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">
                    Safe & SSL Encrypted Checkout. Guaranteed Authentic Products from Verified Local Sellers.
                  </p>
                </div>
              </div>
            </aside>

          </div>
        )}

      </main>

      {/* MOBILE STICKY CHECKOUT BAR */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-2xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
            <span className="text-xl font-black text-slate-900">{fmt(totalPayable)}</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="flex-1 max-w-[200px] bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            Checkout <ArrowRight size={14} />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

const EmptyState = ({ navigate }) => (
  <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden my-4">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
      <h1 className="text-base font-extrabold text-slate-900">My Shopping Cart</h1>
      <span className="text-xs font-bold text-slate-400">0 Items</span>
    </div>

    <div className="py-16 px-6 text-center">
      
      {/* Floating Animated Cart Icon */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
        <div className="relative w-24 h-24 bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-full flex items-center justify-center shadow-inner">
          <ShoppingBag size={40} className="text-emerald-600" />
        </div>
      </div>

      <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
        Your cart is currently empty!
      </h2>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-8 font-medium leading-relaxed">
        Explore thousands of products from local sellers, quick commerce hubs, and wholesale suppliers.
      </p>

      <button
        onClick={() => navigate("/")}
        className="px-10 py-3.5 bg-emerald-600 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md active:scale-98 cursor-pointer"
      >
        Explore Products Now
      </button>

      {/* QUICK CATEGORY SHORTCUTS */}
      <div className="mt-12 pt-8 border-t border-slate-100 max-w-xl mx-auto">
        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
          Popular Categories to Browse
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(cat.path)}
                className="flex flex-col items-center p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg ${cat.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <IconComp size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  </div>
);