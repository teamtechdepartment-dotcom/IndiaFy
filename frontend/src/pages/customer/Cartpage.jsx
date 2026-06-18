/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import { Skeleton } from "../../components/ui/Skeleton";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const verticalRoutes = {
  "E-Commerce":      "/category/ecommerce",
  "Quick Commerce":  "/quick-commerce",
  "Wholesale":       "/wholesale",
};

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
    <div className="bg-brand-background min-h-screen">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-24 relative z-10">

        {/* Header */}
        {cartItems.length > 0 || saved.length > 0 ? (
          <div className="mb-6 mt-2 flex items-center justify-between">
            <h1 className="text-xl font-bold text-brand-text-primary">
              Shopping Cart ({cartItems.length})
            </h1>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid lg:grid-cols-12 gap-6 items-start mt-4">
            <div className="lg:col-span-8 space-y-4">
              <Skeleton className="w-full h-24 rounded-[2rem]" />
              <Skeleton className="w-full h-40 rounded-[2.5rem]" />
              <Skeleton className="w-full h-40 rounded-[2.5rem]" />
            </div>
            <aside className="lg:col-span-4 space-y-6">
              <Skeleton className="w-full h-96 rounded-[2.5rem]" />
              <Skeleton className="w-full h-32 rounded-[2rem]" />
            </aside>
          </div>
        ) : cartItems.length === 0 && saved.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div className="grid lg:grid-cols-12 gap-6 items-start mt-2">
            {/* Left: Cart Items */}
            <div className="lg:col-span-8 space-y-8">

              {/* Delivery Promise Banner */}
              <div className="bg-white shadow-sm border border-brand-border rounded-md p-4 text-brand-text-primary flex items-center gap-4">
                <Truck size={24} className="text-brand-primary" />
                <div>
                  <p className="text-sm font-semibold text-brand-primary uppercase">
                    Guaranteed Delivery
                  </p>
                  <p className="text-brand-text-secondary text-xs mt-0.5">
                    Estimated delivery to your sector: <span className="text-brand-text-primary font-bold">15-25 Mins</span>
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.productId?._id || Math.random()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group bg-white rounded-md p-4 sm:p-6 border border-brand-border shadow-sm mb-4"
                    >
                      <div className="flex flex-col sm:flex-row gap-6">

                        <div
                          onClick={() => navigate(`/product/${item.productId?._id}`)}
                          className="w-full sm:w-32 aspect-square rounded overflow-hidden bg-white shrink-0 cursor-pointer p-1"
                        >
                          <img loading="lazy" decoding="async"
                            src={item.productId?.productImage?.[0] || "https://placehold.co/400x400?text=No+Image"}
                            className="w-full h-full object-contain"
                            alt={item.productId?.name || "Product"}
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3
                                onClick={() => navigate(`/product/${item.productId?._id}`)}
                                className="text-base font-semibold text-brand-text-primary hover:text-brand-primary cursor-pointer line-clamp-2"
                              >
                                {item.productId?.name}
                              </h3>
                              <button
                                onClick={() => removeItem(item.productId?._id)}
                                className="text-brand-text-secondary hover:text-red-500 transition-colors ml-4"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => navigate(`/store/${item.productId?.sellerId}`)}
                                className="flex items-center gap-1 text-[11px] font-medium text-brand-text-secondary bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-sm"
                              >
                                Seller: {item.productId?.seller || "Indiafy"}
                              </button>
                              {item.isWholesale && (
                                <span className="text-[11px] font-semibold text-brand-accent bg-orange-50 px-2 py-0.5 rounded-sm border border-orange-100">
                                  Wholesale
                                </span>
                              )}
                            </div>
                            {item.isWholesale && item.productId?.minimumOrderQty > 1 && (
                              <p className="text-xs text-brand-text-secondary mt-1">
                                MOQ: {item.productId.minimumOrderQty} Units
                              </p>
                            )}
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-brand-text-primary">
                                  {fmt(item.price)}
                                </span>
                              </div>
                              <button
                                onClick={() => saveForLater(item)}
                                className="flex items-center gap-1 text-sm font-semibold text-brand-text-primary hover:text-brand-primary transition-colors"
                              >
                                SAVE FOR LATER
                              </button>
                            </div>

                            <div className="flex items-center bg-white border border-brand-border rounded-md overflow-hidden">
                              <button
                                onClick={() => updateQty(item.productId?._id, -1)}
                                className="p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-brand-text-primary transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <div className="w-12 h-9 flex items-center justify-center border-x border-brand-border font-medium text-sm text-brand-text-primary bg-white">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => updateQty(item.productId?._id, 1)}
                                className="p-2 w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-brand-text-primary transition-colors"
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

              {/* ✅ Saved for Later section */}
              {saved.length > 0 && (
                <div className="mt-8 bg-white p-6 rounded-md shadow-sm border border-brand-border">
                  <h3 className="text-base font-bold text-brand-text-primary mb-4 border-b border-brand-border pb-3">
                    Saved for Later ({saved.length})
                  </h3>
                  <div className="space-y-4">
                    {saved.map((item) => (
                      <div
                        key={item.productId?._id}
                        className="flex items-center gap-4"
                      >
                        <div
                          onClick={() => navigate(`/product/${item.productId?._id}`)}
                          className="w-16 h-16 rounded overflow-hidden shrink-0 cursor-pointer border border-brand-border p-1"
                        >
                          <img loading="lazy" decoding="async" src={item.productId?.productImage?.[0] || "https://placehold.co/400x400?text=No+Image"} className="w-full h-full object-contain" alt={item.productId?.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            onClick={() => navigate(`/product/${item.productId?._id}`)}
                            className="text-sm font-semibold text-brand-text-primary truncate cursor-pointer hover:text-brand-primary"
                          >
                            {item.productId?.name}
                          </p>
                          <p className="text-sm font-bold text-brand-text-primary mt-1">{fmt(item.price)}</p>
                        </div>
                        <button
                          onClick={() => moveToCart(item)}
                          className="text-sm font-semibold text-brand-primary border border-brand-border px-4 py-2 rounded-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
                        >
                          MOVE TO CART
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Summary */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="bg-white shadow-sm border border-brand-border rounded-md p-6">
                  <h2 className="text-base font-bold uppercase text-brand-text-secondary border-b border-brand-border pb-4 mb-4">
                    Price Details
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-brand-text-primary text-sm">
                      <span>Price ({cartItems.length} items)</span>
                      <span>{fmt(subtotal)}</span>
                    </div>
                    {gstEstimate > 0 && (
                      <div className="flex justify-between text-brand-text-primary text-sm">
                        <span>GST</span>
                        <span>{fmt(gstEstimate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-brand-text-primary text-sm">
                      <span>Delivery Charges</span>
                      <span className="text-green-600 font-medium">Calculated Next</span>
                    </div>
                    <div className="flex justify-between text-brand-text-primary text-sm">
                      <span>Discount</span>
                      <span className="text-green-600 font-medium">-{fmt(totalSavings)}</span>
                    </div>
                  </div>

                  <div className="py-4 border-t border-dashed border-brand-border flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-brand-text-primary">Total Amount</span>
                    <span className="text-lg font-bold text-brand-text-primary">{fmt(totalPayable)}</span>
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    disabled={cartItems.length === 0}
                    className="w-full bg-brand-accent text-white py-3.5 rounded-sm font-bold text-base hover:bg-[#e05a18] transition-colors shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    PLACE ORDER
                  </button>
                </div>

                <div className="p-4 border border-brand-border rounded-md flex items-center gap-3 bg-white text-brand-text-secondary">
                  <ShieldCheck size={28} className="shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">
                    Safe and secure payments. Easy returns. 100% Authentic products.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

const EmptyState = ({ navigate }) => (
  <div className="max-w-5xl mx-auto bg-white rounded-md shadow-sm border border-brand-border overflow-hidden mt-4">
    <div className="px-6 py-4 border-b border-brand-border bg-white">
      <h1 className="text-lg font-bold text-brand-text-primary">My Cart</h1>
    </div>
    <div className="py-20 text-center">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag size={40} className="text-brand-primary" />
      </div>
      <h2 className="text-xl font-semibold text-brand-text-primary mb-2">
        Your cart is empty!
      </h2>
      <p className="text-sm text-brand-text-secondary mb-6">
        Add items to it now.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-16 py-3 bg-brand-primary text-white rounded-sm font-semibold text-sm hover:bg-brand-primary/90 transition-colors shadow-sm"
      >
        Shop now
      </button>
    </div>
  </div>
);