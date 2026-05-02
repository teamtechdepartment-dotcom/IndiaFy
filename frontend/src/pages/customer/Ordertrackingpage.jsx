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
  <div
    className={`bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden ${className}`}
  >
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
    } catch (err) {
      console.error("Failed to load tracking data:", err);
      setError(err.response?.data?.message || "Failed to load order");
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

  if (loading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
       <div className="relative">
         <div className="w-16 h-16 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin" />
         <div className="absolute inset-0 flex items-center justify-center">
           <Package size={20} className="text-orange-500 animate-pulse" />
         </div>
       </div>
    </div>
  );

  if (error || !order) return (
    <div className="bg-black min-h-screen text-zinc-400">
      <WebsiteNavbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Package size={48} className="text-zinc-800" />
        <p className="text-2xl font-black text-white tracking-tighter">{error || "Order Not Found"}</p>
        <button 
          onClick={() => navigate("/order-history")}
          className="px-10 py-4 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
        >
          View History
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
    <div className="bg-[#050505] min-h-screen text-zinc-400 selection:bg-orange-500/30">
      <WebsiteNavbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <button
              onClick={() => navigate("/order-history")}
              className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] mb-6"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to orders
            </button>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter flex items-center gap-4">
              Track <span className="text-zinc-800 italic">Order</span>
              {!isCancelled && order.status !== "Delivered" && (
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </div>
              )}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Last Update</p>
              <p className="text-xs font-bold text-white">{formatDate(order.updatedAt)}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-white hover:bg-zinc-800 transition-all disabled:opacity-50 group"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            </button>
          </div>
        </div>

        {isCancelled && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-8 bg-red-500/10 border border-red-500/20 rounded-[2.5rem] flex items-center gap-6"
          >
            <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xl shadow-red-500/20">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-500 uppercase tracking-tight">Order Rejected by Seller</h3>
              <p className="text-sm font-medium text-red-400/60 mt-1">
                The seller was unable to fulfill your request. A full refund has been initiated to your original payment method.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-8">
            {/* DYNAMIC ETA CARD */}
            <Card className="p-10 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">
                    {isCancelled ? "Status: Cancelled" : order.status === "Delivered" ? "Order Delivered" : "Estimated Arrival"}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <h2 className={`text-8xl font-black tracking-tighter ${isCancelled ? "text-zinc-800" : "text-white"}`}>
                      {getETA()}
                    </h2>
                    {!isCancelled && order.status !== "Delivered" && (
                      <span className="text-zinc-700 text-2xl font-black uppercase tracking-widest italic">Mins</span>
                    )}
                  </div>
                  {order.status === "Delivered" && order.deliveredAt && (
                    <div className="flex items-center gap-2 text-emerald-500 mt-4">
                      <CheckCircle2 size={16} />
                      <p className="text-sm font-black uppercase tracking-tight">Completed on {formatDate(order.deliveredAt)}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="bg-zinc-800/50 p-4 rounded-3xl border border-white/5 mb-4">
                    <Truck size={32} className={isCancelled ? "text-zinc-700" : "text-orange-500"} />
                  </div>
                  <p className="text-sm font-black text-white uppercase tracking-tighter">
                    #{(order._id || "").slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </Card>

            {/* PROGRESS TRACKER */}
            <Card className="p-10">
              <div className="flex items-center justify-between mb-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Live Timeline</p>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Real-time Sync
                </div>
              </div>
              
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep && !isCancelled;
                  const isFuture = i > currentStep || isCancelled;

                  return (
                    <div key={i} className="flex gap-8 group/step">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shrink-0 ${
                            isCurrent 
                              ? "bg-orange-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] scale-110" 
                              : isCompleted 
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                : "bg-zinc-900 text-zinc-800 border border-white/5"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={22} /> : step.icon}
                        </div>
                        {i !== STEPS.length - 1 && (
                          <div className={`w-0.5 h-16 my-2 transition-all duration-700 ${isCompleted ? "bg-emerald-500/20" : "bg-zinc-900"}`} />
                        )}
                      </div>
                      <div className="pt-2 pb-10">
                        <p
                          className={`text-base font-black uppercase tracking-tight transition-colors duration-500 ${
                            isCurrent ? "text-orange-500" : isCompleted ? "text-white" : "text-zinc-800"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className={`text-xs font-medium mt-1 transition-colors duration-500 ${isCompleted ? "text-zinc-500" : "text-zinc-700"}`}>
                          {step.sub}
                        </p>
                        {isCurrent && (
                          <div className="flex items-center gap-2 mt-4">
                            <span className="flex h-2 w-2 rounded-full bg-orange-500"></span>
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Active Now</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* ORDER ITEMS */}
            <Card className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6">
                Order Items ({order.orderItems?.length || 0})
              </p>
              <div className="space-y-4">
                {(order.orderItems || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                      <img 
                        src={item.product?.productImage?.[0] || "https://placehold.co/100x100"} 
                        className="w-full h-full object-cover" 
                        alt={item.product?.productName || "Product"} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {item.product?.productName || "Product"}
                      </p>
                      <p className="text-xs text-zinc-500 font-medium">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-black text-white shrink-0">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase">Total</span>
                <span className="text-xl font-black text-white">
                  ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* ORDER INFO CARD */}
            <Card className="p-8 bg-zinc-900 shadow-2xl">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500 flex items-center justify-center text-white font-black text-2xl">
                  {(order.orderItems?.[0]?.seller?.businessName || order.orderItems?.[0]?.seller?.firstName || "S").charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">
                    {order.orderItems?.[0]?.seller?.businessName || order.orderItems?.[0]?.seller?.firstName || "Indiafy Seller"}
                  </h4>
                  <p className="text-xs font-medium text-zinc-500">
                    {order.paymentMethod || "UPI"} • {order.isPaid ? "Paid" : "Unpaid"}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6 p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Shipping To</p>
                <p className="text-sm text-white font-medium">
                  {order.shippingAddress?.address || "No address"}
                </p>
                <p className="text-xs text-zinc-500">
                  {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", ")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 py-4 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">
                  <Phone size={16} /> Support
                </button>
                <button 
                  onClick={() => {
                    if (order.packingVideoUrl) {
                      window.open(order.packingVideoUrl);
                    } else {
                      toast.info("Packing video not yet available");
                    }
                  }}
                  className={`flex items-center justify-center gap-3 py-4 bg-zinc-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-zinc-700 ${!order.packingVideoUrl ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-700"}`}
                >
                  <Video size={16} /> Video
                </button>
              </div>
            </Card>

            {/* PAYMENT INFO */}
            <Card className="p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Payment Details</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Method</span>
                  <span className="text-white font-bold">{order.paymentMethod || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Status</span>
                  <span className={`font-bold ${order.isPaid ? "text-emerald-500" : "text-amber-500"}`}>
                    {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Paid At</span>
                    <span className="text-white font-bold">{formatDate(order.paidAt)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-3 border-t border-zinc-800">
                  <span className="text-zinc-500 font-bold">Total</span>
                  <span className="text-white font-black text-lg">₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Card>

            {/* TRUST SIGNAL BOX */}
            <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="text-emerald-500" size={20} />
                <p className="text-xs font-black uppercase text-emerald-500 tracking-tighter">
                  Indiafy Assurance
                </p>
              </div>
              <p className="text-[11px] font-medium text-emerald-500/60 leading-relaxed uppercase tracking-tighter">
                Order packed with verified sector-verification. Dynamic QR enabled
                for secure payment. Video proof attached to every shipment.
              </p>
            </div>

            {/* Auto-refresh indicator */}
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <div className="flex items-center justify-center gap-2 text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
                <RefreshCw size={10} className="animate-spin" style={{ animationDuration: "3s" }} />
                Auto-refreshing every 10s
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
