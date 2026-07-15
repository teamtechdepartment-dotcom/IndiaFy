/* eslint-disable no-unused-vars */
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
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Layout Components
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
  const orderPlacedRef = useRef(false);

  const { cartItems, fetchCart, clearCartStore } = useCartStore();
  const { profile, fetchProfile } = useProfileStore();
  const { isAuthenticated, user } = useAuthStore();

  const [quickAddr, setQuickAddr] = useState({ street: "", city: "", pincode: "" });
  const [showNewAddrForm, setShowNewAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ street: "", city: "", pincode: "" });
  const [b2bDetails, setB2bDetails] = useState({ companyName: "", gstNumber: "", poNotes: "", deliverySlot: "Standard" });

  useEffect(() => {
    // Auth is enforced by ProtectedRoute — no redirect needed here.
    fetchCart();
    fetchProfile();
  }, [fetchCart, fetchProfile, location.pathname]);

  useEffect(() => {
    if (orderPlacedRef.current) return;
    if (cartItems !== null && cartItems.length === 0 && !location.state?.testProduct) {
      toast.info("Your basket is empty. Please add items first.");
      navigate("/quick-commerce");
    }
  }, [cartItems, navigate, location.state]);

  const addresses = profile?.address || [];
  const activeAddress = addresses.length > 0 
    ? (addresses[selectedAddr] || addresses[0]) 
    : (quickAddr.street ? { street: quickAddr.street, city: quickAddr.city, country: quickAddr.pincode, state: "Local" } : null);

  const displayItems = useMemo(() => {
    if (cartItems && cartItems.length > 0) return cartItems;
    
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

  const [showManualConfirm, setShowManualConfirm] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");

  const handlePayMethodSelect = (method) => {
    setPayMethod(method);
    setPendingOrderId(null);
    setShowManualConfirm(false);
    setCheckoutError("");
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

  const goToSuccess = (orderId) => {
    orderPlacedRef.current = true;
    navigate("/orders/success", { state: { orderId } });
    clearCartStore().catch(() => { /* ignore cart clear errors */ });
  };

  const handleManualComplete = async () => {
    if (!pendingOrderId) return;
    setCheckoutError("");
    try {
      await axiosInstance.post("/payments/verify", {
        razorpay_order_id: "manual",
        razorpay_payment_id: "manual_" + Date.now(),
        razorpay_signature: "test_manual_override",
        orderId: pendingOrderId
      });
      toast.success("Order placed successfully!");
      goToSuccess(pendingOrderId);
    } catch (_err) {
      const errorMsg = _err?.response?.data?.message || _err?.message || "Failed to complete order";
      setCheckoutError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handlePlaceOrder = async () => {
    if (displayItems.length === 0) {
      return toast.error("Your cart is empty");
    }

    setIsPlacing(true);
    setShowManualConfirm(false);
    setCheckoutError("");

    try {
      let newOrder = null;

      if (pendingOrderId) {
        newOrder = { _id: pendingOrderId };
      } else {
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
        const resolvedOrderId = orderRes.orderId || newOrder._id || newOrder.orderId || orderRes.data?._id;
        newOrder._id = resolvedOrderId;
        setPendingOrderId(resolvedOrderId);
      }

      if (payMethod === "cod") {
        toast.success("Order placed successfully (COD)!");
        goToSuccess(newOrder._id);
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
          goToSuccess(newOrder._id);
        } catch (_simErr) {
          console.error("Simulator payment verification failed:", _simErr);
          const errorMsg = _simErr?.response?.data?.message || _simErr?.message || "Failed to process simulator payment";
          setCheckoutError(errorMsg);
          setShowManualConfirm(true);
          toast.error(errorMsg);
          setIsPlacing(false);
        }
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        const errorMsg = "Razorpay SDK failed to load. Use the manual confirm button below.";
        setCheckoutError(errorMsg);
        toast.error(errorMsg);
        setShowManualConfirm(true);
        setIsPlacing(false);
        return;
      }
      
      let rpRes;
      try {
        rpRes = await axiosInstance.post("/payments/create-order", { amount: total, orderId: newOrder._id });
      } catch (payErr) {
        console.error("Payment initiation failed:", payErr);
        const errorMsg = payErr?.response?.data?.message || payErr?.message || "Payment gateway error. Use the manual confirm button below.";
        setCheckoutError(errorMsg);
        toast.error(errorMsg);
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
            goToSuccess(newOrder._id);
          } catch (_err) {
            const errorMsg = _err?.response?.data?.message || _err?.message || "Payment verification failed. Use manual confirm.";
            setCheckoutError(errorMsg);
            toast.error(errorMsg);
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
        theme: { color: "#0f172a" }, // Matched slate-900
        modal: {
          ondismiss: () => {
            const errorMsg = "Payment cancelled. You can retry or use manual confirm.";
            setCheckoutError(errorMsg);
            toast.info(errorMsg);
            setShowManualConfirm(true);
            setIsPlacing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error("Razorpay payment failed:", response.error);
        const errorMsg = `Payment failed: ${response.error.description || "Unknown error"}`;
        setCheckoutError(errorMsg);
        toast.error(errorMsg);
        setShowManualConfirm(true);
        setIsPlacing(false);
      });
      try {
        rzp.open();
      } catch (openErr) {
        console.error("Razorpay checkout failed to open:", openErr);
        const errorMsg = openErr?.message || "Payment window could not open. Use manual confirm or retry.";
        setCheckoutError(errorMsg);
        toast.error(errorMsg);
        setShowManualConfirm(true);
        setIsPlacing(false);
      }
      
    } catch (_err) {
      console.error("Order process error:", _err);
      setIsPlacing(false);
      const msg = _err?.response?.data?.message || _err?.message || "Failed to process order";
      setCheckoutError(msg);
      toast.error(msg);
    }
  };

  const renderCheckoutError = () => checkoutError ? (
    <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
      <Info size={18} className="mt-0.5 shrink-0" />
      <p className="text-xs font-bold leading-relaxed">{checkoutError}</p>
    </div>
  ) : null;


  return (
    <div className="bg-white min-h-screen text-slate-600 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <WebsiteNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-24 relative z-10">

        {/* Background Blobs for Hero Theme */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-5%] right-[5%] w-[45vw] h-[45vw] bg-gradient-to-br from-emerald-100/40 to-teal-100/20 rounded-full blur-[100px]" />
          <div className="absolute top-[10%] left-[-5%] w-[35vw] h-[35vw] bg-gradient-to-tr from-blue-100/30 to-indigo-100/10 rounded-full blur-[100px]" />
        </div>
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-xs font-bold uppercase tracking-widest mb-4"
            >
              <ChevronLeft size={16} /> Back to Cart
            </button>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Secure <span className="text-emerald-600 italic">Checkout</span>
            </h1>
          </div>
          
          {/* Step Indicators */}
          <div className="hidden md:flex items-center gap-3">
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${step >= 1 ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200"}`}>
              <span className="text-[10px] font-black uppercase tracking-widest">01</span>
              <span className="text-xs font-bold uppercase tracking-widest">Address</span>
            </div>
            <div className="h-px w-6 bg-slate-200" />
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${step >= 2 ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200"}`}>
              <span className="text-[10px] font-black uppercase tracking-widest">02</span>
              <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* LEFT: FORM SECTIONS */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 md:space-y-8">
            
            {/* STEP 1: ADDRESS */}
            <section
              className={`bg-white rounded-[2rem] p-6 md:p-8 border transition-all duration-300 ${
                step === 1 
                  ? "border-emerald-500 shadow-lg ring-4 ring-emerald-50" 
                  : "border-slate-200 shadow-sm opacity-60 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    Delivery Location
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Where should we send your order?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {addresses.length === 0 ? (
                  <div className="col-span-2 p-8 rounded-[2rem] bg-slate-50 border-2 border-slate-200 border-dashed">
                    <p className="text-slate-500 font-bold text-center mb-6 uppercase tracking-widest text-[10px]">Add Delivery Information</p>
                    <div className="space-y-4 max-w-md mx-auto">
                      <input 
                        type="text" 
                        placeholder="Street / House No."
                        className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                        value={quickAddr.street}
                        onChange={(e) => setQuickAddr({...quickAddr, street: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="City"
                          className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                          value={quickAddr.city}
                          onChange={(e) => setQuickAddr({...quickAddr, city: e.target.value})}
                        />
                        <input 
                          type="text" 
                          placeholder="Pincode"
                          className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                          value={quickAddr.pincode}
                          onChange={(e) => setQuickAddr({...quickAddr, pincode: e.target.value})}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest mt-2">Enter details to proceed</p>
                    </div>
                  </div>
                ) : (
                  addresses.map((addr, idx) => (
                    <div
                      key={addr._id || idx}
                      onClick={() => setSelectedAddr(idx)}
                      className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-200 relative overflow-hidden ${
                        selectedAddr === idx 
                          ? "border-emerald-500 bg-emerald-50/30 shadow-md" 
                          : "border-slate-100 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-md tracking-widest ${
                          selectedAddr === idx ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {addr.nearBy || "Home"}
                        </span>
                        {selectedAddr === idx && (
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        )}
                      </div>
                      <div className="relative z-10">
                        <p className="font-bold text-slate-900 text-sm">{profile?.firstName} {profile?.lastName}</p>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                          {addr.street}, {addr.city}, {addr.state}
                        </p>
                        <p className="text-[11px] font-bold text-slate-600 mt-4 tracking-widest">
                          {profile?.contact}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {addresses.length > 0 && (
                  <div className="col-span-2 mt-2">
                    {!showNewAddrForm ? (
                      <button
                        onClick={() => setShowNewAddrForm(true)}
                        className="text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors inline-flex py-2"
                      >
                        + Add New Address
                      </button>
                    ) : (
                      <div className="p-6 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-200 space-y-5 mt-2">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">New Delivery Information</p>
                        <input 
                          type="text" 
                          placeholder="Street / House No."
                          className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                          value={newAddr.street}
                          onChange={(e) => setNewAddr({...newAddr, street: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            placeholder="City"
                            className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                            value={newAddr.city}
                            onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                          />
                          <input 
                            type="text" 
                            placeholder="Pincode"
                            className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
                            value={newAddr.pincode}
                            onChange={(e) => setNewAddr({...newAddr, pincode: e.target.value})}
                          />
                        </div>
                        <div className="flex flex-wrap gap-3 pt-2">
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
                            className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-md"
                          >
                            Save Address
                          </button>
                          <button
                            onClick={() => setShowNewAddrForm(false)}
                            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* WHOLESALE B2B DETAILS */}
              {hasWholesaleItems && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                      <Truck size={18} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                      B2B Dispatch Details
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Company / Business Name"
                      className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all shadow-sm"
                      value={b2bDetails.companyName}
                      onChange={(e) => setB2bDetails({...b2bDetails, companyName: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="GST Number (Optional)"
                      className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all shadow-sm uppercase"
                      value={b2bDetails.gstNumber}
                      onChange={(e) => setB2bDetails({...b2bDetails, gstNumber: e.target.value.toUpperCase()})}
                    />
                    <div className="col-span-2 relative">
                      <select 
                        className="w-full py-3.5 px-5 rounded-full border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all shadow-sm appearance-none cursor-pointer"
                        value={b2bDetails.deliverySlot}
                        onChange={(e) => setB2bDetails({...b2bDetails, deliverySlot: e.target.value})}
                      >
                        <option value="Standard">Standard Dispatch (2-3 Days)</option>
                        <option value="Same-Day Bulk">Same-Day Bulk Logistics</option>
                        <option value="Next-Day Dispatch">Next-Day Hub Dispatch</option>
                        <option value="Scheduled">Scheduled Future Delivery</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="col-span-2">
                       <textarea 
                          placeholder="Purchase Order (PO) Notes or Transport Instructions..."
                          className="w-full py-4 px-5 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all shadow-sm resize-none h-28"
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
                  className="w-full mt-8 py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md"
                >
                  Deliver to this address
                </button>
              )}
            </section>

            {/* STEP 2: PAYMENT */}
            <section
              className={`bg-white rounded-[2rem] p-6 md:p-8 border transition-all duration-300 ${
                step === 2 
                  ? "border-emerald-500 shadow-lg ring-4 ring-emerald-50" 
                  : "border-slate-200 shadow-sm opacity-60 pointer-events-none"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                      Payment Method
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">All transactions are secure</p>
                  </div>
                </div>
                {step === 2 && (
                  <button
                    onClick={() => {
                      setStep(1);
                      setPendingOrderId(null);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 py-2 border-b border-transparent hover:border-emerald-200 self-start sm:self-auto transition-all"
                  >
                    Change Address
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Simulator Payment Method */}
                <label
                  className={`block p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-200 ${
                    payMethod === "test" 
                      ? "border-emerald-500 bg-emerald-50/20 shadow-sm" 
                      : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        checked={payMethod === "test"}
                        onChange={() => handlePayMethodSelect("test")}
                        className="w-5 h-5 accent-emerald-600 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          ⚡ Simulator (Mock Pay)
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Instant successful test checkout without Razorpay API
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 size={24} className="text-emerald-500 hidden sm:block" />
                  </div>
                </label>

                {/* UPI */}
                <label
                  className={`block p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-200 ${
                    payMethod === "upi" 
                      ? "border-emerald-500 bg-emerald-50/20 shadow-sm" 
                      : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        checked={payMethod === "upi"}
                        onChange={() => handlePayMethodSelect("upi")}
                        className="w-5 h-5 accent-emerald-600 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          UPI / Dynamic QR
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Instant reconciliation via Indiafy Node
                        </p>
                      </div>
                    </div>
                    <Smartphone size={24} className="text-slate-400 hidden sm:block" />
                  </div>
                  {payMethod === "upi" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      className="mt-5 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-start gap-4 overflow-hidden"
                    >
                      <QrCode size={32} className="text-slate-400 shrink-0 mt-1" />
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                        A Secure Dynamic QR will be generated upon confirmation.
                        <br/><span className="text-slate-700">Rider-personal transfers are prohibited.</span>
                      </p>
                    </motion.div>
                  )}
                </label>

                {/* COD */}
                <label
                  className={`block p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-200 ${
                    payMethod === "cod" 
                      ? "border-emerald-500 bg-emerald-50/20 shadow-sm" 
                      : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        checked={payMethod === "cod"}
                        onChange={() => handlePayMethodSelect("cod")}
                        className="w-5 h-5 accent-emerald-600 cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          Cash on Delivery
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Verify & Pay at Sector-assigned Rider
                        </p>
                      </div>
                    </div>
                    <Truck size={24} className="text-slate-400 hidden sm:block" />
                  </div>
                  {payMethod === "cod" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-5 flex items-start gap-3 text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-100 overflow-hidden"
                    >
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest">
                        ₹40 operational fee applies for COD. Your eligibility score is being calculated.
                      </p>
                    </motion.div>
                  )}
                </label>
              </div>
            </section>

            {/* MOBILE-ONLY CTA (Visible on lg too, but visually grouped with content if needed. Kept at bottom of main column for flow) */}
            {step === 2 && (
              <div className="lg:hidden mt-8 space-y-4">
                <div className="flex justify-between items-end px-2 border-b border-slate-200 pb-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payable Amount</p>
                  <p className="text-3xl font-black text-slate-900">{fmt(total)}</p>
                </div>
                <button
                  disabled={isPlacing}
                  onClick={handlePlaceOrder}
                  className="w-full py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-slate-900/20"
                >
                  {isPlacing ? "Processing Order..." : "Confirm & Pay Now"}
                </button>
                {renderCheckoutError()}
                {showManualConfirm && pendingOrderId && (
                  <button
                    onClick={handleManualComplete}
                    className="w-full py-4 bg-emerald-600 text-white rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md animate-pulse"
                  >
                    <CheckCircle2 size={16} /> Complete Order (Test Mode)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: SUMMARY */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 md:p-8 text-slate-900 border border-slate-200 shadow-xl shadow-slate-200/40">
                <h2 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-800">
                  Order Summary
                </h2>

                {/* Items List */}
                <div className="space-y-5 mb-8 border-b border-slate-100 pb-8">
                  {displayItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                        <img loading="lazy" decoding="async" 
                          src={item.productId?.productImage?.[0] || "https://placehold.co/200x200"} 
                          className="w-full h-full object-cover mix-blend-multiply"
                          alt={item.productId?.productName || "Product"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.productId?.productName || item.productId?.title || "Product"}</p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{fmt(item.price)}</p>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
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
                  <div className="flex justify-between text-slate-500 font-medium text-sm items-center">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-600 font-black uppercase text-[10px] tracking-widest bg-emerald-50 px-2 py-1 rounded-md">
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

                <div className="pt-6 border-t border-slate-100 flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                      Total Amount
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                      {fmt(total)}
                    </p>
                  </div>
                </div>

                {/* DESKTOP CTA */}
                <div className="hidden lg:block space-y-4">
                  <button
                    disabled={step !== 2 || isPlacing}
                    onClick={handlePlaceOrder}
                    className="w-full py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-slate-900/20"
                  >
                    {isPlacing ? "Processing Order..." : "Confirm & Pay Now"}
                  </button>
                  {renderCheckoutError()}

                  {showManualConfirm && pendingOrderId && (
                    <button
                      onClick={handleManualComplete}
                      className="w-full py-4 bg-emerald-600 text-white rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md animate-pulse"
                    >
                      <CheckCircle2 size={16} /> Complete Order (Test Mode)
                    </button>
                  )}
                </div>

                {/* Test Mode Info */}
                <div className="mt-6 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><ShieldCheck size={14} /> Razorpay Test Mode</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Test UPI: <span className="text-slate-800 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm">success@razorpay</span><br/>
                    Test Card: <span className="text-slate-800 font-bold bg-white px-1.5 py-0.5 rounded shadow-sm mt-1 inline-block">4111 1111 1111 1111</span><br/>
                    <span className="mt-1 inline-block">Expiry: future date • CVV: any 3</span>
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                  <Lock size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    256-bit Secure Encryption
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50/30 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
                <BadgeCheck size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black uppercase text-emerald-800 tracking-widest">
                    Indiafy Assurance
                  </p>
                  <p className="text-[11px] font-medium text-emerald-700/80 leading-relaxed mt-1.5">
                    Sector-assigned rider OTP & Video-Verified packing are active for this sector.
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