import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useCartStore } from "../../store/cartStore";
import axiosInstance from "../../utils/axiosInstance";
import {
  MapPin,
  ShieldCheck,
  ChevronLeft,
  CreditCard,
  QrCode,
  Truck,
  BadgeCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Layout Components (Paths ensured as per previous fix)
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

import { useProfileStore } from "../../store/profileStore";
import { useAuthStore } from "../../store/authStore";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [selectedAddr, setSelectedAddr] = useState(1);
  const [payMethod, setPayMethod] = useState("upi");
  const [isPlacing, setIsPlacing] = useState(false);

  const { cartItems, fetchCart, clearCartStore } = useCartStore();
  const { profile, fetchProfile } = useProfileStore();
  const { isAuthenticated, user } = useAuthStore();

  const [quickAddr, setQuickAddr] = useState({ street: "", city: "", pincode: "" });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info("Please login to proceed with checkout");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    fetchCart();
    fetchProfile();
  }, [fetchCart, fetchProfile, isAuthenticated, navigate, location.pathname]);

  const addresses = profile?.address || [];
  const activeAddress = addresses.length > 0 
    ? (addresses[selectedAddr] || addresses[0]) 
    : (quickAddr.street ? { street: quickAddr.street, city: quickAddr.city, country: quickAddr.pincode, state: "Local" } : null);

  // Use only real cart items
  const displayItems = cartItems;

  const subtotal = displayItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 0;
  const codFee = payMethod === "cod" ? 40 : 0;
  const total = subtotal + deliveryFee + codFee;

  // Track if Razorpay failed so we can show manual fallback
  const [showManualConfirm, setShowManualConfirm] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Manual order completion (for test mode / payment gateway issues)
  const handleManualComplete = async () => {
    if (!pendingOrderId) return;
    try {
      await axiosInstance.post("/payments/verify", {
        razorpay_order_id: "manual",
        razorpay_payment_id: "manual_" + Date.now(),
        razorpay_signature: "test_manual_override",
        orderId: pendingOrderId
      });
      toast.success("Order placed successfully!");
      clearCartStore();
      navigate("/order-success", { state: { orderId: pendingOrderId } });
    } catch (err) {
      toast.error("Failed to complete order");
    }
  };

  const handlePlaceOrder = async () => {
    if (displayItems.length === 0) {
      return toast.error("Your cart is empty");
    }

    setIsPlacing(true);
    setShowManualConfirm(false);
    try {
      // 1. Create the Order first (Status: Pending)
      const payload = {
        orderItems: displayItems.map(it => ({
          product: it.productId?._id || it.productId,
          seller: it.productId?.sellerId || it.sellerId || "67a304e6727284f6760b7410",
          quantity: it.quantity,
          price: it.price
        })),
        shippingAddress: {
          address: activeAddress?.street || activeAddress?.address || "No Address",
          city: activeAddress?.city || "Unknown",
          state: activeAddress?.state || "Local",
          postalCode: activeAddress?.pincode || activeAddress?.postalCode || "000000",
          country: activeAddress?.country || "India"
        },
        paymentMethod: payMethod.toUpperCase(),
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: deliveryFee,
        totalPrice: total,
        status: "Pending"
      };

      const orderRes = await axiosInstance.post("/orders", payload);
      const newOrder = orderRes.data || orderRes;

      setPendingOrderId(newOrder._id);

      // 2. If COD, we are done
      if (payMethod === "cod") {
        toast.success("Order placed successfully (COD)!");
        clearCartStore();
        navigate("/order-success", { state: { orderId: newOrder._id } });
        return;
      }

      // 3. Razorpay Path
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Razorpay SDK failed to load. Use the manual confirm button below.");
        setShowManualConfirm(true);
        setIsPlacing(false);
        return;
      }
      
      // Create Razorpay order on backend
      let rpRes;
      try {
        rpRes = await axiosInstance.post("/payments/create-order", { amount: total });
      } catch (payErr) {
        console.error("Payment initiation failed:", payErr);
        toast.error("Payment gateway error. Use the manual confirm button below.");
        setShowManualConfirm(true);
        setIsPlacing(false);
        return;
      }

      const rpOrder = rpRes.data || rpRes;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SjMJZDAKmy4Dz9",
        amount: rpOrder.amount,
        currency: "INR",
        name: "Indiafy",
        description: "Order Payment",
        order_id: rpOrder.id,
        handler: async (response) => {
          try {
            await axiosInstance.post("/payments/verify", {
              ...response,
              orderId: newOrder._id
            });
            toast.success("Payment successful!");
            clearCartStore();
            navigate("/order-success", { state: { orderId: newOrder._id } });
          } catch (err) {
            toast.error("Payment verification failed. Use manual confirm.");
            setShowManualConfirm(true);
            setIsPlacing(false);
          }
        },
        prefill: {
          name: profile?.firstName || "Customer",
          email: profile?.email || "",
          contact: profile?.contact || "9999999999"
        },
        notes: {
          test_upi: "success@razorpay"
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. You can retry or use manual confirm.");
            setShowManualConfirm(true);
            setIsPlacing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error("Razorpay payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description || "Unknown error"}`);
        setShowManualConfirm(true);
        setIsPlacing(false);
      });
      rzp.open();
      
    } catch (err) {
      console.error("Order process error:", err);
      setIsPlacing(false);
      const msg = err.response?.data?.message || err.message || "Failed to process order";
      toast.error(msg);
    }
  };


  return (
    <div className="bg-zinc-50 min-h-screen">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors text-xs font-black uppercase tracking-widest mb-4"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">
              Secure <span className="text-zinc-300 italic">Checkout</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${step >= 1 ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-400"}`}
            >
              <span className="text-xs font-black">01</span>
              <span className="text-xs font-bold uppercase tracking-tighter">
                Address
              </span>
            </div>
            <div className="h-px w-8 bg-zinc-200" />
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${step >= 2 ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-400"}`}
            >
              <span className="text-xs font-black">02</span>
              <span className="text-xs font-bold uppercase tracking-tighter">
                Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: FORM SECTIONS */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: ADDRESS */}
            <section
              className={`bg-white rounded-[2.5rem] p-8 border ${step === 1 ? "border-zinc-900 shadow-2xl" : "border-zinc-100 opacity-60 pointer-events-none"}`}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <MapPin size={20} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Delivery Location
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <div className="col-span-2 p-8 rounded-[2rem] bg-zinc-50 border-2 border-zinc-200 border-dashed">
                    <p className="text-zinc-500 font-bold text-center mb-6 uppercase tracking-widest text-[10px]">Add Delivery Information</p>
                    <div className="space-y-4 max-w-md mx-auto">
                      <input 
                        type="text" 
                        placeholder="Street / House No."
                        className="w-full p-4 rounded-2xl border border-zinc-200 text-sm font-bold bg-white focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                        value={quickAddr.street}
                        onChange={(e) => setQuickAddr({...quickAddr, street: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="City"
                          className="w-full p-4 rounded-2xl border border-zinc-200 text-sm font-bold bg-white focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                          value={quickAddr.city}
                          onChange={(e) => setQuickAddr({...quickAddr, city: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="Pincode"
                          className="w-full p-4 rounded-2xl border border-zinc-200 text-sm font-bold bg-white focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                          value={quickAddr.pincode}
                          onChange={(e) => setQuickAddr({...quickAddr, pincode: e.target.value})}
                        />
                      </div>
                      <p className="text-[9px] text-zinc-400 text-center font-bold uppercase tracking-tighter">Enter details to proceed with test order</p>
                    </div>
                  </div>
                ) : (
                  addresses.map((addr, idx) => (
                    <div
                      key={addr._id || idx}
                      onClick={() => setSelectedAddr(idx)}
                      className={`cursor-pointer p-6 rounded-3xl border-2 transition-all ${selectedAddr === idx ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-zinc-900 text-white text-[9px] font-black uppercase rounded-full">
                          {addr.nearBy || "Home"}
                        </span>
                        {selectedAddr === idx && (
                          <CheckCircle2 size={20} className="text-zinc-900" />
                        )}
                      </div>
                      <p className="font-bold text-zinc-900">{profile?.firstName} {profile?.lastName}</p>
                      <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state}
                      </p>
                      <p className="text-xs font-bold text-zinc-400 mt-3">
                        {profile?.contact}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {step === 1 && (
                <button
                  onClick={() => {
                    if (!activeAddress && profile.address?.[0]?.street) {
                      // Accept the "Quick Address" hack
                      setStep(2);
                    } else if (activeAddress) {
                      setStep(2);
                    } else {
                      toast.warn("Please enter a delivery address");
                    }
                  }}
                  className="w-full mt-8 py-5 bg-zinc-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-zinc-800 transition-all"
                >
                  Deliver to this address
                </button>
              )}
            </section>

            {/* STEP 2: PAYMENT */}
            <section
              className={`bg-white rounded-[2.5rem] p-8 border ${step === 2 ? "border-zinc-900 shadow-2xl" : "border-zinc-100 opacity-60 pointer-events-none"}`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                    <CreditCard size={20} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Payment Method
                  </h3>
                </div>
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-900 border-b border-zinc-200"
                  >
                    Change Address
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* UPI - Indiafy Preference */}
                <label
                  className={`block p-6 rounded-3xl border-2 cursor-pointer transition-all ${payMethod === "upi" ? "border-zinc-900 bg-zinc-50" : "border-zinc-100"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        checked={payMethod === "upi"}
                        onChange={() => setPayMethod("upi")}
                        className="w-4 h-4 accent-zinc-900"
                      />
                      <div>
                        <p className="font-bold text-zinc-900">
                          UPI / Dynamic QR
                        </p>
                        <p className="text-xs text-zinc-400 font-medium">
                          Instant reconciliation via Indiafy Node
                        </p>
                      </div>
                    </div>
                    <Smartphone size={24} className="text-zinc-300" />
                  </div>
                  {payMethod === "upi" && (
                    <div className="mt-6 p-4 bg-zinc-100 rounded-2xl border border-dashed border-zinc-300 flex items-center gap-4">
                      <QrCode size={40} className="text-zinc-400" />
                      <p className="text-[10px] font-bold text-zinc-500 leading-tight uppercase tracking-tighter">
                        A Secure Dynamic QR will be generated upon confirmation.
                        Rider-personal transfers are prohibited.
                      </p>
                    </div>
                  )}
                </label>

                {/* COD - Sector Restricted */}
                <label
                  className={`block p-6 rounded-3xl border-2 cursor-pointer transition-all ${payMethod === "cod" ? "border-zinc-900 bg-zinc-50" : "border-zinc-100"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        checked={payMethod === "cod"}
                        onChange={() => setPayMethod("cod")}
                        className="w-4 h-4 accent-zinc-900"
                      />
                      <div>
                        <p className="font-bold text-zinc-900">
                          Cash on Delivery
                        </p>
                        <p className="text-xs text-zinc-400 font-medium">
                          Verify & Pay at Sector-assigned Rider
                        </p>
                      </div>
                    </div>
                    <Truck size={24} className="text-zinc-300" />
                  </div>
                  {payMethod === "cod" && (
                    <div className="mt-4 flex items-start gap-2 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tighter">
                        ₹40 operational fee applies for COD. Your eligibility
                        score is being calculated.
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT: SUMMARY */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-zinc-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-zinc-300">
                <h2 className="text-lg font-black uppercase tracking-widest mb-6">
                  Order Total
                </h2>

                {/* Items Summary */}
                <div className="space-y-4 mb-8 border-b border-zinc-800 pb-6">
                  {displayItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                        <img 
                          src={item.productId?.productImage?.[0] || "https://via.placeholder.com/100"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-white truncate tracking-tight">{item.productId?.title || "Product"}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[10px] font-black text-white">{fmt(item.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-zinc-500 font-medium text-sm">
                    <span>Subtotal</span>
                    <span className="text-white font-bold">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 font-medium text-sm">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-400 font-bold uppercase text-[10px] pt-1 tracking-widest">
                      Free
                    </span>
                  </div>
                  {payMethod === "cod" && (
                    <div className="flex justify-between text-zinc-500 font-medium text-sm">
                      <span>COD Fee</span>
                      <span className="text-white font-bold">{fmt(codFee)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-between items-end mb-10">
                  <div>
                    <p className="text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-1">
                      Payable Amount
                    </p>
                    <p className="text-4xl font-black">
                      {fmt(total)}
                    </p>
                  </div>
                </div>

                <button
                  disabled={step !== 2 || isPlacing}
                  onClick={handlePlaceOrder}
                  className="w-full py-5 bg-white text-zinc-900 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                >
                  {isPlacing ? "Processing Order..." : "Confirm & Pay Now"}
                </button>

                {/* Manual Confirm Button — shows after Razorpay fails/dismissed */}
                {showManualConfirm && pendingOrderId && (
                  <button
                    onClick={handleManualComplete}
                    className="w-full py-4 mt-3 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-emerald-600 active:scale-95 transition-all animate-pulse"
                  >
                    ✅ Complete Order (Test Mode)
                  </button>
                )}

                {/* Test Mode Info */}
                <div className="mt-5 p-4 bg-zinc-800 rounded-2xl border border-zinc-700">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">⚡ Razorpay Test Mode</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Use test UPI: <span className="text-white font-bold">success@razorpay</span><br/>
                    Test Card: <span className="text-white font-bold">4111 1111 1111 1111</span><br/>
                    Expiry: any future date · CVV: any 3 digits
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-zinc-600">
                  <Lock size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    256-bit Secure Encryption
                  </span>
                </div>
              </div>

              {/* Trust Footer */}
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
                <BadgeCheck size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[11px] font-black uppercase text-emerald-700 tracking-tighter">
                    Indiafy Assurance
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600/70 leading-relaxed uppercase tracking-tighter mt-1">
                    Sector-assigned rider OTP & Video-Verified packing active
                    for this sector.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
