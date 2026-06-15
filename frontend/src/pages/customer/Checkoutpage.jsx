/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect, useMemo, useRef } from "react";
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
  const [payMethod, setPayMethod] = useState("test");
  const [isPlacing, setIsPlacing] = useState(false);
  const orderPlacedRef = useRef(false); // Guard: prevent cart-empty redirect after order placed

  const { cartItems, fetchCart, clearCartStore } = useCartStore();
  const { profile, fetchProfile } = useProfileStore();
  const { isAuthenticated, user } = useAuthStore();

  const [quickAddr, setQuickAddr] = useState({ street: "", city: "", pincode: "" });
  const [showNewAddrForm, setShowNewAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ street: "", city: "", pincode: "" });
  const [b2bDetails, setB2bDetails] = useState({ companyName: "", gstNumber: "", poNotes: "", deliverySlot: "Standard" });

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to home page instead of login page upon logout/unauth
      navigate("/");
      return;
    }
    fetchCart();
    fetchProfile();
  }, [fetchCart, fetchProfile, isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    if (orderPlacedRef.current) return; // Don't redirect if order was just placed
    if (cartItems !== null && cartItems.length === 0 && !location.state?.testProduct) {
      toast.info("Your basket is empty. Please add items first.");
      navigate("/quick-commerce");
    }
  }, [cartItems, navigate, location.state]);

  const addresses = profile?.address || [];
  const activeAddress = addresses.length > 0 
    ? (addresses[selectedAddr] || addresses[0]) 
    : (quickAddr.street ? { street: quickAddr.street, city: quickAddr.city, country: quickAddr.pincode, state: "Local" } : null);

  // 🟢 FALLBACK LOGIC: If cart is empty, check if we have a direct purchase item from state
  const displayItems = useMemo(() => {
    if (cartItems && cartItems.length > 0) return cartItems;
    
    // Fallback to product passed via navigate state (Buy Now flow)
    const testProduct = location.state?.testProduct;
    if (testProduct) {
      return [{
        productId: testProduct,
        price: (Array.isArray(testProduct.attribute) ? testProduct.attribute[0] : testProduct.attribute)?.salePrice || 
               (Array.isArray(testProduct.attribute) ? testProduct.attribute[0] : testProduct.attribute)?.price || 
               testProduct.currentPrice || 0,
        quantity: 1,
        title: testProduct.productName || testProduct.title
      }];
    }
    return [];
  }, [cartItems, location.state]);

  const subtotal = displayItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const gstEstimate = displayItems.reduce((acc, item) => acc + (item.gstAmount || 0), 0);
  const deliveryFee = (subtotal >= 200 || subtotal === 0) ? 0 : 30;
  const codFee = payMethod === "cod" ? 40 : 0;
  const total = subtotal + gstEstimate + deliveryFee + codFee;
  const hasWholesaleItems = displayItems.some(item => item.isWholesale);

  // Track if Razorpay failed so we can show manual fallback
  const [showManualConfirm, setShowManualConfirm] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const handlePayMethodSelect = (method) => {
    setPayMethod(method);
    setPendingOrderId(null); // Invalidate legacy pending order configuration
    setShowManualConfirm(false);
  };

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
      await clearCartStore();
      navigate("/order-success", { state: { orderId: pendingOrderId } });
    } catch (_err) {
      toast.error("Failed to complete order");
    }
  };

  const handlePlaceOrder = async () => {
    if (displayItems.length === 0) {
      return toast.error("Your cart is empty");
    }

    setIsPlacing(true);
    setShowManualConfirm(false);

    // Helper: navigate to success safely, always clear cart first but never block on it
    const goToSuccess = async (orderId) => {
      orderPlacedRef.current = true; // prevent cart-empty useEffect redirect
      try { await clearCartStore(); } catch (_e) { /* ignore cart clear errors */ }
      navigate("/order-success", { state: { orderId } });
    };
    try {
      let newOrder = null;

      if (pendingOrderId) {
        // Reuse existing Pending Order to avoid duplicate ghost order entries in database
        newOrder = { _id: pendingOrderId };
      } else {
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
          taxPrice: gstEstimate,
          shippingPrice: deliveryFee,
          totalPrice: total,
          status: "Pending",
          // Wholesale Ext
          isWholesaleOrder: hasWholesaleItems,
          billingDetails: {
            companyName: b2bDetails.companyName,
            gstNumber: b2bDetails.gstNumber,
            billingAddress: activeAddress?.street || "No Address"
          },
          poNotes: b2bDetails.poNotes,
          deliverySlot: b2bDetails.deliverySlot
        };

        const orderRes = await axiosInstance.post("/orders", payload);
        newOrder = orderRes.data || orderRes;
        setPendingOrderId(newOrder._id);
      }

      // 2. If COD, we are done
      if (payMethod === "cod") {
        toast.success("Order placed successfully (COD)!");
        await goToSuccess(newOrder._id);
        return;
      }

      if (payMethod === "test") {
        try {
          await axiosInstance.post("/payments/verify", {
            razorpay_order_id: "manual",
            razorpay_payment_id: "test_simulator_" + Date.now(),
            razorpay_signature: "test_manual_override",
            orderId: newOrder._id
          });
          toast.success("Order placed successfully (Simulator Payment)!");
          await goToSuccess(newOrder._id);
        } catch (_simErr) {
          toast.error("Failed to process simulator payment");
          setIsPlacing(false);
        }
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
        rpRes = await axiosInstance.post("/payments/create-order", { amount: total, orderId: newOrder._id });
      } catch (payErr) {
        console.error("Payment initiation failed:", payErr);
        toast.error("Payment gateway error. Use the manual confirm button below.");
        setShowManualConfirm(true);
        setIsPlacing(false);
        return;
      }

      const rpOrder = rpRes.data || rpRes;

      let rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_Sm5HFLdh2qH4N1";
      try {
        const keyRes = await axiosInstance.get("/payments/get-key");
        if (keyRes && (keyRes.key || keyRes.data?.key)) {
          rzpKey = keyRes.key || keyRes.data.key;
        }
      } catch (keyErr) {
        console.warn("Failed to dynamically fetch Razorpay key, using env/fallback:", keyErr);
      }
      
      const options = {
        key: rzpKey,
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
            await goToSuccess(newOrder._id);
          } catch (_err) {
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
      
    } catch (_err) {
      console.error("Order process error:", _err);
      setIsPlacing(false);
      const msg = _err?.response?.data?.message || _err?.message || "Failed to process order";
      toast.error(msg);
    }
  };


  return (
    <div className="bg-zinc-50 min-h-screen">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24">

      {/* Background Blobs for Hero Theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[100px]" />
      </div>
      
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xs font-black uppercase tracking-widest mb-4"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
              Secure <span className="text-slate-700 italic">Checkout</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${step >= 1 ? "bg-white shadow-sm border border-slate-200 text-slate-900 border-zinc-900" : "bg-white text-slate-600"}`}
            >
              <span className="text-xs font-black">01</span>
              <span className="text-xs font-bold uppercase tracking-tighter">
                Address
              </span>
            </div>
            <div className="h-px w-8 bg-zinc-200" />
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${step >= 2 ? "bg-white shadow-sm border border-slate-200 text-slate-900 border-zinc-900" : "bg-white text-slate-600"}`}
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
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                  <MapPin size={20} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Delivery Location
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <div className="col-span-2 p-8 rounded-[2rem] bg-zinc-50 border-2 border-zinc-200 border-dashed">
                    <p className="text-slate-500 font-bold text-center mb-6 uppercase tracking-widest text-[10px]">Add Delivery Information</p>
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
                      <p className="text-[9px] text-slate-600 text-center font-bold uppercase tracking-tighter">Enter details to proceed with test order</p>
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
                        <span className="px-3 py-1 bg-white shadow-sm border border-slate-200 text-slate-900 text-[9px] font-black uppercase rounded-full">
                          {addr.nearBy || "Home"}
                        </span>
                        {selectedAddr === idx && (
                          <CheckCircle2 size={20} className="text-slate-900" />
                        )}
                      </div>
                      <p className="font-bold text-slate-900">{profile?.firstName} {profile?.lastName}</p>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state}
                      </p>
                      <p className="text-xs font-bold text-slate-600 mt-3">
                        {profile?.contact}
                      </p>
                    </div>
                  ))
                )}
                {addresses.length > 0 && (
                  <div className="col-span-2 mt-4">
                    {!showNewAddrForm ? (
                      <button
                        onClick={() => setShowNewAddrForm(true)}
                        className="text-xs font-black uppercase text-brand-accent hover:underline"
                      >
                        + Add New Address
                      </button>
                    ) : (
                      <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200 space-y-4">
                        <p className="text-xs font-black uppercase text-zinc-600">New Address Details</p>
                        <input 
                          type="text" 
                          placeholder="Street / House No."
                          className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-zinc-900/10"
                          value={newAddr.street}
                          onChange={(e) => setNewAddr({...newAddr, street: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text" 
                            placeholder="City"
                            className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-zinc-900/10"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                          />
                          <input 
                            type="text" 
                            placeholder="Pincode"
                            className="w-full p-3 rounded-xl border border-zinc-200 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-zinc-900/10"
                            value={newAddr.pincode}
                            onChange={(e) => setNewAddr({...newAddr, pincode: e.target.value})}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setShowNewAddrForm(false)}
                            className="px-4 py-2 border border-zinc-200 text-zinc-500 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              if (!newAddr.street || !newAddr.city || !newAddr.pincode) {
                                return toast.warn("Please fill all address fields");
                              }
                              try {
                                const addAddressAction = useProfileStore.getState().addAddress;
                                await addAddressAction({
                                  street: newAddr.street,
                                  city: newAddr.city,
                                  state: "Local",
                                  country: "India",
                                  pincode: newAddr.pincode,
                                  nearBy: "Home"
                                });
                                toast.success("New address added successfully!");
                                setShowNewAddrForm(false);
                                setNewAddr({ street: "", city: "", pincode: "" });
                              } catch (_e) {
                                toast.error("Failed to add address");
                              }
                            }}
                            className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
                          >
                            Save Address
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* WHOLESALE B2B DETAILS (ONLY VISIBLE IF WHOLESALE ITEMS PRESENT) */}
              {hasWholesaleItems && (
                <div className="mt-8 pt-8 border-t border-zinc-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                      <Truck size={16} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-amber-600">
                      B2B Wholesale Dispatch Details
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Company / Business Name"
                      className="w-full p-4 rounded-2xl border border-zinc-200 text-sm font-bold bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                      value={b2bDetails.companyName}
                      onChange={(e) => setB2bDetails({...b2bDetails, companyName: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="GST Number (Optional)"
                      className="w-full p-4 rounded-2xl border border-zinc-200 text-sm font-bold bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all uppercase"
                      value={b2bDetails.gstNumber}
                      onChange={(e) => setB2bDetails({...b2bDetails, gstNumber: e.target.value.toUpperCase()})}
                    />
                    <div className="col-span-2">
                      <select 
                        className="w-full p-4 rounded-2xl border border-zinc-200 text-sm font-bold bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                        value={b2bDetails.deliverySlot}
                        onChange={(e) => setB2bDetails({...b2bDetails, deliverySlot: e.target.value})}
                      >
                        <option value="Standard">Standard Dispatch (2-3 Days)</option>
                        <option value="Same-Day Bulk">Same-Day Bulk Logistics</option>
                        <option value="Next-Day Dispatch">Next-Day Hub Dispatch</option>
                        <option value="Scheduled">Scheduled Future Delivery</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                       <textarea 
                          placeholder="Purchase Order (PO) Notes or Transport Instructions..."
                          className="w-full p-4 rounded-2xl border border-zinc-200 text-sm font-bold bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none h-24"
                          value={b2bDetails.poNotes}
                          onChange={(e) => setB2bDetails({...b2bDetails, poNotes: e.target.value})}
                       />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <button
                  onClick={async () => {
                    if (addresses.length === 0) {
                      if (!quickAddr.street || !quickAddr.city || !quickAddr.pincode) {
                        return toast.warn("Please enter all address details");
                      }
                      try {
                        const addrData = {
                          street: quickAddr.street,
                          city: quickAddr.city,
                          state: "Local",
                          country: "India",
                          pincode: quickAddr.pincode,
                          nearBy: "Home"
                        };
                        const addAddressAction = useProfileStore.getState().addAddress;
                        await addAddressAction(addrData);
                        toast.success("Delivery address saved to profile!");
                        setStep(2);
                      } catch (_err) {
                        toast.error("Failed to save address. Proceeding as quick checkout.");
                        setStep(2);
                      }
                    } else if (activeAddress) {
                      setStep(2);
                    } else {
                      toast.warn("Please enter a delivery address");
                    }
                  }}
                  className="w-full mt-8 py-5 bg-white shadow-sm border border-slate-200 text-slate-900 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-100 border border-slate-200 transition-all"
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
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                    <CreditCard size={20} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Payment Method
                  </h3>
                </div>
                {step === 2 && (
                  <button
                    onClick={() => {
                      setStep(1);
                      setPendingOrderId(null); // Force new order calculation if address changes
                    }}
                    className="text-[10px] font-black uppercase text-slate-600 hover:text-slate-900 border-b border-zinc-200"
                  >
                    Change Address
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Simulator Payment Method */}
                <label
                  className={`block p-6 rounded-3xl border-2 cursor-pointer transition-all ${payMethod === "test" ? "border-zinc-900 bg-zinc-50 font-black" : "border-zinc-100"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        checked={payMethod === "test"}
                        onChange={() => handlePayMethodSelect("test")}
                        className="w-4 h-4 accent-zinc-900"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          ⚡ Test Simulator / Mock Pay (Highly Recommended)
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          Bypass Razorpay API entirely for instant successful test checkout
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 size={24} className="text-emerald-500 animate-pulse" />
                  </div>
                </label>

                {/* UPI - Indiafy Preference */}
                <label
                  className={`block p-6 rounded-3xl border-2 cursor-pointer transition-all ${payMethod === "upi" ? "border-zinc-900 bg-zinc-50" : "border-zinc-100"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        checked={payMethod === "upi"}
                        onChange={() => handlePayMethodSelect("upi")}
                        className="w-4 h-4 accent-zinc-900"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          UPI / Dynamic QR
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          Instant reconciliation via Indiafy Node
                        </p>
                      </div>
                    </div>
                    <Smartphone size={24} className="text-slate-700" />
                  </div>
                  {payMethod === "upi" && (
                    <div className="mt-6 p-4 bg-slate-100 rounded-2xl border border-dashed border-zinc-300 flex items-center gap-4">
                      <QrCode size={40} className="text-slate-600" />
                      <p className="text-[10px] font-bold text-slate-500 leading-tight uppercase tracking-tighter">
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
                        onChange={() => handlePayMethodSelect("cod")}
                        className="w-4 h-4 accent-zinc-900"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          Cash on Delivery
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          Verify & Pay at Sector-assigned Rider
                        </p>
                      </div>
                    </div>
                    <Truck size={24} className="text-slate-700" />
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
              <div className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-2xl shadow-zinc-300">
                <h2 className="text-lg font-black uppercase tracking-widest mb-6">
                  Order Total
                </h2>

                {/* Items Summary */}
                <div className="space-y-4 mb-8 border-b border-slate-200 pb-6">
                  {displayItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img loading="lazy" decoding="async" 
                          src={item.productId?.productImage?.[0] || "https://via.placeholder.com/100"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-slate-900 truncate tracking-tight">{item.productId?.productName || item.productId?.title || "Product"}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[10px] font-black text-slate-900">{fmt(item.price)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-500 font-medium text-sm">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-bold">{fmt(subtotal)}</span>
                  </div>
                  {gstEstimate > 0 && (
                    <div className="flex justify-between text-slate-500 font-medium text-sm">
                      <span>GST</span>
                      <span className="text-slate-900 font-bold">{fmt(gstEstimate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 font-medium text-sm">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-400 font-bold uppercase text-[10px] pt-1 tracking-widest">
                      Free
                    </span>
                  </div>
                  {payMethod === "cod" && (
                    <div className="flex justify-between text-slate-500 font-medium text-sm">
                      <span>COD Fee</span>
                      <span className="text-slate-900 font-bold">{fmt(codFee)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-between items-end mb-10">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">
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
                  className="w-full py-5 bg-zinc-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-zinc-900/20"
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
                <div className="mt-5 p-4 bg-slate-100 border border-slate-200 rounded-2xl border border-slate-300">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">⚡ Razorpay Test Mode</p>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Use test UPI: <span className="text-slate-900 font-bold">success@razorpay</span><br/>
                    Test Card: <span className="text-slate-900 font-bold">4111 1111 1111 1111</span><br/>
                    Expiry: any future date · CVV: any 3 digits
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500">
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
