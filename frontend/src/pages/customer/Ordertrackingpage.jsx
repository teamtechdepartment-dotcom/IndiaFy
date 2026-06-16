/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Truck,
  Video,
  Phone,
  ChevronLeft,
  ShieldCheck,
  BadgeCheck,
  Package,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { toast } from "react-toastify";
import { Skeleton } from "../../components/ui/Skeleton";
import { motion } from "framer-motion";

// Layout Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

const STEPS = [
  {
    label: "Order Placed",
    sub: "Confirmed by Indiafy Node",
    icon: <Package size={18} />,
    status: "Pending",
    color: "emerald"
  },
  {
    label: "Seller Accepted",
    sub: "Preparing for dispatch",
    icon: <BadgeCheck size={18} />,
    status: "Processing",
    color: "orange"
  },
  {
    label: "On the Way",
    sub: "Out for secure delivery",
    icon: <Truck size={18} />,
    status: "Shipped",
    color: "blue"
  },
  {
    label: "Delivered",
    sub: "Received by customer",
    icon: <CheckCircle2 size={18} />,
    status: "Delivered",
    color: "emerald"
  },
];

const STATUS_LIST = ["Pending", "Processing", "Shipped", "Delivered"];

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm ${className}`}>
    {children}
  </div>
);

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { fetchOrderById } = useOrderStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadOrder = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      setError(null);
      const data = await fetchOrderById(orderId);
      if (data) {
        setOrder(data);
        if (data.status === "Cancelled" && !showRefresh) {
          toast.error("This order has been cancelled by the seller.");
        }
      } else {
        setError("Order not found");
      }
    } catch (_err) {
      console.error("Failed to load tracking data:", _err);
      setError(_err?.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, fetchOrderById]);

  // Initial load
  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Auto-refresh every 10 seconds for real-time tracking
  useEffect(() => {
    if (!order || order.status === "Delivered" || order.status === "Cancelled") return;
    
    const interval = setInterval(() => {
      loadOrder(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [order?.status, loadOrder]);

  const handleRefresh = () => {
    loadOrder(true);
  };

  // UI UPDATE: Adjusted to light mode to prevent flashing dark to light
  if (loading) return (
    <div className="bg-white min-h-screen text-slate-600 font-sans">
      <WebsiteNavbar />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 space-y-8">
        <Skeleton className="w-full h-[250px] rounded-[2rem] bg-slate-100" />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
             <Skeleton className="w-full h-[400px] rounded-[2rem] bg-slate-100" />
          </div>
          <div className="lg:col-span-5 space-y-6">
             <Skeleton className="w-full h-[200px] rounded-[2rem] bg-slate-100" />
             <Skeleton className="w-full h-[150px] rounded-[2rem] bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );

  // UI UPDATE: Adjusted to light mode
  if (error || !order) return (
    <div className="bg-white min-h-screen text-slate-600 font-sans">
      <WebsiteNavbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
          <Package size={48} />
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{error || "Order Not Found"}</p>
        <p className="text-slate-500 max-w-sm mb-4">We couldn't locate the order details. The link might be broken or the order doesn't exist.</p>
        <button 
          onClick={() => navigate("/order-history")}
          className="px-8 py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
        >
          View Order History
        </button>
      </div>
    </div>
  );

  const getStatusIndex = (status) => {
    const idx = STATUS_LIST.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const currentStep = getStatusIndex(order.status);
  const isCancelled = order.status === "Cancelled";

  // Calculate ETA based on status
  const getETA = () => {
    if (isCancelled) return "N/A";
    switch(order.status) {
      case "Delivered": return "0";
      case "Shipped": return "12";
      case "Processing": return "25";
      default: return "40";
    }
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <WebsiteNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-20 relative z-10">

        {/* Background Blobs for Hero Theme matching previous UI */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-5%] right-[5%] w-[45vw] h-[45vw] bg-gradient-to-br from-emerald-100/40 to-teal-100/20 rounded-full blur-[100px]" />
          <div className="absolute top-[10%] left-[-5%] w-[35vw] h-[35vw] bg-gradient-to-tr from-blue-100/30 to-indigo-100/10 rounded-full blur-[100px]" />
        </div>
      
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button
              onClick={() => navigate("/order-history")}
              className="group flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-4"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to orders
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                Track <span className="text-emerald-600 italic">Order</span>
              </h1>
              {!isCancelled && order.status !== "Delivered" && (
                <div className="relative flex h-3.5 w-3.5 mt-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Update</p>
              <p className="text-xs font-semibold text-slate-900">{formatDate(order.updatedAt)}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3.5 bg-white border border-slate-200 rounded-full text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50 shadow-sm group"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin text-emerald-500" : "group-hover:rotate-180 transition-transform duration-500"} />
            </button>
          </div>
        </div>

        {isCancelled && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 md:p-8 bg-red-50 border border-red-100 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center gap-5"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">Order Rejected by Seller</h3>
              <p className="text-sm text-red-600/80 mt-1">
                The seller was unable to fulfill your request. A full refund has been initiated to your original payment method.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            
            {/* DYNAMIC ETA CARD */}
            <Card className="p-8 md:p-10 relative overflow-hidden group bg-gradient-to-br from-white to-slate-50/50">
              <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                    {isCancelled ? "Status: Cancelled" : order.status === "Delivered" ? "Order Delivered" : "Estimated Arrival"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h2 className={`text-6xl md:text-7xl font-black tracking-tighter ${isCancelled ? "text-slate-300" : "text-slate-900"}`}>
                      {getETA()}
                    </h2>
                    {!isCancelled && order.status !== "Delivered" && (
                      <span className="text-slate-400 text-xl md:text-2xl font-bold uppercase tracking-widest">Mins</span>
                    )}
                  </div>
                  {order.status === "Delivered" && order.deliveredAt && (
                    <div className="flex items-center gap-2 text-emerald-600 mt-4 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                      <CheckCircle2 size={16} />
                      <p className="text-xs font-bold uppercase tracking-wider">Completed on {formatDate(order.deliveredAt)}</p>
                    </div>
                  )}
                </div>
                <div className=" sm:text-right">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center mb-3 sm:ml-auto">
                    <Truck size={24} className={isCancelled ? "text-slate-400" : "text-slate-800"} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ID: #{(order._id || "").slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </Card>

            {/* PROGRESS TRACKER */}
            <Card className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-bold text-slate-900">Live Timeline</p>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-time Sync
                </div>
              </div>
              
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep && !isCancelled;
                  const isFuture = i > currentStep || isCancelled;

                  return (
                    <div key={i} className="flex gap-6 group/step">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                            isCurrent 
                              ? "bg-slate-900 text-white border-slate-900 shadow-md scale-110" 
                              : isCompleted 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                : "bg-white text-slate-300 border-slate-200"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={18} /> : step.icon}
                        </div>
                        {i !== STEPS.length - 1 && (
                          <div className={`w-0.5 h-12 my-1 transition-all duration-500 ${isCompleted ? "bg-emerald-200" : "bg-slate-100"}`} />
                        )}
                      </div>
                      <div className="pt-2 pb-8">
                        <p
                          className={`text-sm font-bold transition-colors duration-300 ${
                            isCurrent ? "text-slate-900" : isCompleted ? "text-slate-700" : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className={`text-xs mt-1 font-medium transition-colors duration-300 ${isCompleted || isCurrent ? "text-slate-500" : "text-slate-400"}`}>
                          {step.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* ORDER ITEMS */}
            <Card className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm font-bold text-slate-900">
                  Order Items
                </p>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{order.orderItems?.length || 0}</span>
              </div>
              <div className="space-y-3">
                {(order.orderItems || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-colors">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      <img loading="lazy" decoding="async" 
                        src={item.product?.productImage?.[0] || "https://placehold.co/100x100"} 
                        className="w-full h-full object-cover mix-blend-multiply" 
                        alt={item.product?.productName || "Product"} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {item.product?.productName || "Product"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 shrink-0">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center px-3">
                <span className="text-sm font-bold text-slate-500">Total Amount</span>
                <span className="text-xl font-black text-slate-900">
                  ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* ORDER INFO CARD */}
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {(order.orderItems?.[0]?.seller?.businessName || order.orderItems?.[0]?.seller?.firstName || "S").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {order.orderItems?.[0]?.seller?.businessName || order.orderItems?.[0]?.seller?.firstName || "Indiafy Seller"}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {order.paymentMethod || "UPI"}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${order.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {order.isPaid ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6 p-5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-slate-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Address</p>
                </div>
                <p className="text-sm text-slate-900 font-medium leading-relaxed">
                  {order.shippingAddress?.address || "No address provided"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", ")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">
                  <Phone size={16} /> Contact Support
                </button>
                <button 
                  onClick={() => {
                    if (order.packingVideoUrl) {
                      window.open(order.packingVideoUrl);
                    } else {
                      toast.info("Packing video not yet available");
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs transition-all shadow-sm border ${
                    order.packingVideoUrl 
                      ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800" 
                      : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Video size={16} /> Packing Video
                </button>
              </div>
            </Card>

            {/* PAYMENT INFO */}
            <Card className="p-6 md:p-8">
              <p className="text-sm font-bold text-slate-900 mb-5">Payment Summary</p>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Method</span>
                  <span className="text-slate-900 font-semibold">{order.paymentMethod || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className={`font-semibold ${order.isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                    {order.isPaid ? "Success" : "Pending"}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Paid On</span>
                    <span className="text-slate-900 font-semibold">{formatDate(order.paidAt)}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* TRUST SIGNAL BOX - Matched with Category Page */}
            <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-[2rem] border border-emerald-100/60 shadow-sm">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
                <ShieldCheck size={20} className="text-emerald-600" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-2">
                Indiafy Assurance
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Order packed with verified sector-verification. Dynamic QR enabled for secure payment. Video proof attached to every shipment.
              </p>
            </div>

            {/* Auto-refresh indicator */}
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4">
                <RefreshCw size={12} className="animate-spin text-emerald-500" style={{ animationDuration: "3s" }} />
                Auto-syncing updates
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
