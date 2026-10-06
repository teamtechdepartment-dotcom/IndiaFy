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
  { name: "Electronics", path: "/category/electronics", icon: Laptop, color: "text-[#065F46] bg-blue-50" },
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
    <div className="bg-[#f1f2f4] min-h-screen font-sans">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-[130px] lg:pt-[140px] pb-24 relative z-10">

        {/* Header */}
        {cartItems.length > 0 || saved.length > 0 ? (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                My Shopping Cart
              </h1>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
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
              <Skeleton className="w-full h-20 rounded" />
              <Skeleton className="w-full h-40 rounded" />
              <Skeleton className="w-full h-40 rounded" />
            </div>
            <aside className="lg:col-span-4 space-y-6">
              <Skeleton className="w-full h-80 rounded" />
            </aside>
          </div>
        ) : cartItems.length === 0 && saved.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Cart Items */}
            <div className="lg:col-span-8 space-y-6">

              {/* Delivery Promise Banner */}
              <div className="bg-white border border-gray-200 rounded p-4 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#065F46]/10 flex items-center justify-center shrink-0">
                    <Truck size={22} className="text-[#065F46]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">Guaranteed Fast Express Delivery</p>
                      <span className="bg-[#065F46] text-white text-[10px] font-bold px-2 py-0.5 rounded">15-25 MINS</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">
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
                      className="bg-white rounded p-4 sm:p-5 border border-gray-200 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row gap-5">

                        {/* Product Thumbnail */}
                        <div
                          onClick={() => navigate(`/product/${item.productId?._id}`)}
                          className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-gray-100 shrink-0 cursor-pointer p-1 flex items-center justify-center rounded"
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
                                  className="text-base font-bold text-gray-900 hover:text-emerald-700 cursor-pointer line-clamp-2 leading-snug"
                                >
                                  {item.productId?.name || item.productId?.productName || "Product Item"}
                                </h3>
                              </div>

                              <button
                                onClick={() => removeItem(item.productId?._id)}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all shrink-0"
                                title="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <button
                                onClick={() => navigate(`/store/${item.productId?.sellerId}`)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Seller: <span className="text-gray-900">{item.productId?.seller || "Verified Seller"}</span>
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
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div>
                              <span className="text-xl font-extrabold text-gray-900">
                                {fmt(item.price)}
                              </span>
                              <button
                                onClick={() => saveForLater(item)}
                                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-emerald-700 transition-colors mt-0.5"
                              >
                                <Bookmark size={12} /> Save for later
                              </button>
                            </div>

                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded overflow-hidden p-0.5 shadow-xs">
                              <button
                                onClick={() => updateQty(item.productId?._id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white text-gray-700 rounded-lg transition-all active:scale-95"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-10 h-8 flex items-center justify-center font-extrabold text-xs text-gray-900">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => updateQty(item.productId?._id, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white text-gray-700 rounded-lg transition-all active:scale-95"
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
                <div className="mt-8 bg-white p-5 rounded shadow-xs border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                    <Bookmark size={16} className="text-emerald-600" /> Saved for Later ({saved.length})
                  </h3>
                  <div className="space-y-3">
                    {saved.map((item) => (
                      <div
                        key={item.productId?._id}
                        className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded border border-gray-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            onClick={() => navigate(`/product/${item.productId?._id}`)}
                            className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0 cursor-pointer border border-gray-200 p-1 flex items-center justify-center"
                          >
                            <img loading="lazy" decoding="async" src={item.productId?.productImage?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop"} className="max-w-full max-h-full object-contain" alt={item.productId?.name} />
                          </div>
                          <div className="min-w-0">
                            <p
                              onClick={() => navigate(`/product/${item.productId?._id}`)}
                              className="text-xs font-bold text-gray-900 truncate cursor-pointer hover:text-emerald-700"
                            >
                              {item.productId?.name}
                            </p>
                            <p className="text-xs font-black text-gray-900 mt-0.5">{fmt(item.price)}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => moveToCart(item)}
                          className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3.5 py-2 rounded hover:bg-emerald-50 transition-colors shrink-0 shadow-xs"
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
                <div className="bg-white shadow-sm border border-gray-200 rounded p-5">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                    <span>Payment Summary</span>
                    <Lock size={14} className="text-gray-400" />
                  </h2>

                  <div className="space-y-3 mb-6 text-xs font-medium text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>Items Price ({cartItems.length})</span>
                      <span className="font-bold text-gray-900">{fmt(subtotal)}</span>
                    </div>
                    {gstEstimate > 0 && (
                      <div className="flex justify-between items-center">
                        <span>GST & Taxes</span>
                        <span className="font-bold text-gray-900">{fmt(gstEstimate)}</span>
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

                  <div className="py-4 border-t border-gray-100 flex justify-between items-center mb-6">
                    <div>
                      <span className="text-sm font-extrabold text-gray-900 block">Total Payable Amount</span>
                      <span className="text-[10px] text-gray-400 font-semibold">Inclusive of all taxes</span>
                    </div>
                    <span className="text-2xl font-black text-gray-900">{fmt(totalPayable)}</span>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    disabled={cartItems.length === 0}
                    className="w-full bg-[#065F46] text-white py-3 rounded font-bold text-sm hover:bg-[#047857] transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="p-4 border border-gray-200 rounded flex items-center gap-3 bg-white text-gray-600 shadow-xs">
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-2xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Amount</span>
            <span className="text-xl font-black text-gray-900">{fmt(totalPayable)}</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="flex-1 max-w-[200px] bg-[#065F46] text-white py-3 rounded font-bold text-sm shadow-sm hover:bg-[#047857] transition-colors flex items-center justify-center"
          >
            Checkout
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

const EmptyState = ({ navigate }) => (
  <div className="max-w-3xl mx-auto bg-white rounded shadow-sm border border-gray-200 overflow-hidden my-4">
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
      <h1 className="text-base font-bold text-gray-900">My Shopping Cart</h1>
      <span className="text-xs font-bold text-gray-500">0 Items</span>
    </div>

    <div className="py-16 px-6 text-center">
      
      {/* Floating Animated Cart Icon */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="relative w-20 h-20 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center">
          <ShoppingBag size={32} className="text-gray-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
        Your cart is currently empty
      </h2>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-medium">
        Add products to your cart and they will appear here.
      </p>

      <button
        onClick={() => navigate("/")}
        className="px-8 py-3 bg-[#065F46] text-white rounded font-bold text-sm hover:bg-[#047857] shadow-sm transition-all cursor-pointer"
      >
        Continue Shopping
      </button>

      {/* QUICK CATEGORY SHORTCUTS */}
      <div className="mt-12 pt-8 border-t border-gray-100 max-w-xl mx-auto">
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
          Popular Categories to Browse
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(cat.path)}
                className="flex flex-col items-center p-3 rounded border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg ${cat.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <IconComp size={18} />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-emerald-700">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  </div>
);