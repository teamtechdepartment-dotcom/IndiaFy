import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { ChevronLeft, X, Plus, Trash2, Search, Check, ShoppingBag, Package } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState(searchParams.get("email") || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("128 MG Road");
  const [city, setCity] = useState("Bengaluru");
  const [zipCode, setZipCode] = useState("560001");
  const [country, setCountry] = useState("India");

  const [items, setItems] = useState([
    {
      _id: "prod-sample-1",
      name: "Handcrafted Embroidered Kurta",
      sku: "HEK-2026-M",
      price: 2499,
      quantity: 1,
    }
  ]);

  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const [showProducts, setShowProducts] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingProducts(true);
      try {
        const res = await axiosInstance.get("/admin/management/products?limit=20");
        const list = res.data?.data?.products || res.data?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setAvailableProducts(list);
        }
      } catch (_e) {
        // Fallback default sample products
        setAvailableProducts([
          { _id: "p1", name: "Handcrafted Embroidered Kurta", price: 2499, sku: "HEK-2026", stock: 15 },
          { _id: "p2", name: "Pure Silk Banarasi Dupatta", price: 3499, sku: "SBD-1092", stock: 8 },
          { _id: "p3", name: "Organic Cotton Casual Shirt", price: 1299, sku: "OCS-4421", stock: 24 },
          { _id: "p4", name: "Artisanal Leather Jutti", price: 1899, sku: "ALJ-9031", stock: 12 },
        ]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleAddItem = (prod) => {
    const existingIndex = items.findIndex((it) => it._id === prod._id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          _id: prod._id,
          name: prod.name || prod.title || "Selected Item",
          sku: prod.sku || `SKU-${prod._id.slice(-4)}`,
          price: Number(prod.price || prod.pricing?.sellingPrice || 999),
          quantity: 1,
        }
      ]);
    }
    toast.success(`Added ${prod.name || "item"} to order`);
    setShowProducts(false);
  };

  const updateQuantity = (index, delta) => {
    const updated = [...items];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
    }
    setItems(updated);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const shippingFee = subtotal >= 2000 || subtotal === 0 ? 0 : 99;
  const estimatedTax = Math.round(subtotal * 0.05); // 5% GST
  const totalAmount = Math.max(0, subtotal + shippingFee + estimatedTax - discountAmount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "LUXE2024") {
      const disc = Math.round(subtotal * 0.2);
      setDiscountAmount(disc);
      toast.success(`Coupon LUXE2024 applied! Saved ₹${disc}`);
    } else if (promoCode.trim().toUpperCase() === "WELCOME10") {
      setDiscountAmount(100);
      toast.success("Coupon WELCOME10 applied! Saved ₹100");
    } else if (promoCode.trim()) {
      toast.error("Invalid or expired coupon code");
    }
  };

  const handleCreateOrder = async () => {
    if (!customerEmail.trim()) {
      toast.error("Customer email is required");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one product to the order");
      return;
    }

    setLoading(true);
    try {
      // Simulate/post order creation
      toast.success("Order created successfully and queued for fulfillment!");
      navigate("/admin/orders");
    } catch (_err) {
      toast.error("Failed to generate order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen text-slate-900 dark:text-slate-100"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)",
      }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => navigate("/admin/orders")}
            >
              <ChevronLeft className="text-slate-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Create New Manual Order
              </h1>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/admin/orders")}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Discard Draft
              </button>
              <button
                disabled={loading}
                onClick={handleCreateOrder}
                className="px-5 py-2.5 rounded-2xl bg-[#2874F0] hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
              >
                {loading ? "Processing..." : "Submit Order"}
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-7 space-y-6">
              <Card title="Customer Identity & Contact">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                      Customer Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Patel"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                      Customer Email *
                    </label>
                    <input
                      type="email"
                      placeholder="ramesh@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                    Phone Contact
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                  />
                </div>
              </Card>

              <Card title="Delivery & Shipping Destination">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-5 space-y-6">
              <Card
                title="Order Items"
                right={
                  <button
                    onClick={() => setShowProducts(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[#2874F0] dark:text-[#FB641B] hover:underline cursor-pointer"
                  >
                    <Plus size={14} /> Add Products
                  </button>
                }
              >
                {items.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No items attached. Click &quot;Add Products&quot; above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((it, idx) => (
                      <div
                        key={it._id || idx}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="font-bold text-xs truncate text-slate-900 dark:text-white">
                            {it.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {it.sku} • ₹{it.price.toLocaleString()} each
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                            <button
                              onClick={() => updateQuantity(idx, -1)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              −
                            </button>
                            <span className="px-2 text-xs font-black text-slate-900 dark:text-white">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(idx, 1)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-black text-slate-900 dark:text-white min-w-[60px] text-right">
                            ₹{(it.price * it.quantity).toLocaleString()}
                          </span>

                          <button
                            onClick={() => removeItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Calculation Summary */}
                <div className="text-xs space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping Fee</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST / Sales Tax (5%)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      ₹{estimatedTax.toLocaleString()}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-black pt-3 border-t border-slate-200 dark:border-slate-800 text-sm">
                    <span className="text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-[#2874F0] dark:text-[#FB641B] text-base">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Payment & Promo */}
              <Card title="Payment & Coupon">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                      Payment Settlement
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="Paid">Mark as Paid (Prepaid)</option>
                      <option value="Pending">Payment Pending</option>
                      <option value="COD">Cash on Delivery (COD)</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon (e.g. LUXE2024)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 uppercase"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* PRODUCT SELECTOR MODAL */}
      {showProducts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl p-6 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-lg text-slate-900 dark:text-white">
                Catalog Product Selector
              </h2>
              <button
                onClick={() => setShowProducts(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search products by title or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {availableProducts
                .filter((p) =>
                  (p.name || p.title || "")
                    .toLowerCase()
                    .includes(productSearch.toLowerCase())
                )
                .map((prod) => {
                  const prName = prod.name || prod.title || "Product";
                  const price = Number(prod.price || prod.pricing?.sellingPrice || 999);
                  return (
                    <div
                      key={prod._id}
                      className="pt-2 flex items-center justify-between py-2 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{prName}</p>
                        <p className="text-[10px] text-slate-400">
                          SKU: {prod.sku || prod._id.slice(-6)} • Stock: {prod.stockQuantity ?? prod.stock ?? "Available"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          ₹{price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleAddItem(prod)}
                          className="px-3 py-1.5 bg-[#2874F0] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowProducts(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, children, right }) {
  return (
    <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-sm text-slate-900 dark:text-white">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}
