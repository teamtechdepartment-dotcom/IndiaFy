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
    sub: "Received by Indiafy Node",
    icon: <Package size={18} />,
    status: "Pending"
  },
  {
    label: "Seller Accepted",
    sub: "Inventory check complete",
    icon: <BadgeCheck size={18} />,
    status: "Processing"
  },
  {
    label: "Video Packing & Shipped",
    sub: "Proof attached to Order ID",
    icon: <Truck size={18} />,
    status: "Shipped"
  },
  {
    label: "Delivered",
    sub: "Order delivered successfully",
    icon: <CheckCircle2 size={18} />,
    status: "Delivered"
  },
];

const STATUS_LIST = ["Pending", "Processing", "Shipped", "Delivered"];

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] ${className}`}
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

  // Auto-refresh every 30 seconds for real-time tracking
  useEffect(() => {
    if (!order || order.status === "Delivered" || order.status === "Cancelled") return;
    
    const interval = setInterval(() => {
      loadOrder(false);
    }, 10000); // 10s for better real-time experience

    return () => clearInterval(interval);
  }, [order?.status, loadOrder]);

  const handleRefresh = () => {
    loadOrder(true);
    toast.info("Refreshing order status...");
  };

  if (loading) return (
    <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="bg-zinc-950 min-h-screen text-zinc-400">
      <WebsiteNavbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Package size={48} className="text-zinc-700" />
        <p className="text-xl font-bold text-white">{error || "Order Not Found"}</p>
        <p className="text-zinc-500 text-sm">The order you're looking for doesn't exist or you don't have access.</p>
        <button 
          onClick={() => navigate("/order-history")}
          className="px-8 py-3 bg-white text-zinc-900 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all"
        >
          Go to Order History
        </button>
      </div>
    </div>
  );

  const getStatusIndex = (status) => {
    const idx = STATUS_LIST.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const currentStep = getStatusIndex(order.status);

  // Calculate ETA based on status
  const getETA = () => {
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
    <div className="bg-zinc-950 min-h-screen text-zinc-400">
      <WebsiteNavbar />

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button
              onClick={() => navigate("/order-history")}
              className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4"
            >
              <ChevronLeft size={14} /> Back to Orders
            </button>
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
              Track <span className="text-zinc-700 italic">Live</span>
              {order.status !== "Delivered" && order.status !== "Cancelled" && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              )}
              {order.status === "Delivered" && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-600 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* ETA CARD */}
            <Card className="p-10 bg-gradient-to-br from-zinc-900 to-zinc-950">
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 mb-2">
                    {order.status === "Delivered" ? "Delivered" : "Estimated Arrival"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-7xl font-black text-white">
                      {getETA()}
                    </h2>
                    <span className="text-zinc-600 text-xl font-bold uppercase tracking-widest">
                      {order.status === "Delivered" ? "" : "Mins"}
                    </span>
                  </div>
                  {order.status === "Delivered" && order.deliveredAt && (
                    <p className="text-xs text-emerald-500 font-bold mt-2">
                      Delivered on {formatDate(order.deliveredAt)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-500 mb-1 uppercase tracking-tighter">
                    Order ID
                  </p>
                  <p className="text-sm font-black text-white">
                    #{(order._id || "").slice(-8).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-zinc-600 font-medium mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </Card>

            {/* STATUS TRACKER */}
            <Card className="p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6">
                Order Progress
              </p>
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep;
                  const isFuture = i > currentStep;

                  return (
                    <div key={i} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                            isCurrent 
                              ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-110" 
                              : isCompleted 
                                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                                : "bg-zinc-900 text-zinc-700 border border-zinc-800"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            step.icon
                          )}
                        </div>
                        {i !== STEPS.length - 1 && (
                          <div className={`w-0.5 h-12 my-1 transition-all ${isCompleted ? "bg-emerald-500/30" : "bg-zinc-800"}`} />
                        )}
                      </div>
                      <div className="pt-1 pb-6">
                        <p
                          className={`text-sm font-black uppercase tracking-tight ${
                            isCurrent ? "text-orange-400" : isCompleted ? "text-white" : "text-zinc-700"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className={`text-[11px] font-medium mt-1 ${isCompleted ? "text-zinc-400" : "text-zinc-600"}`}>
                          {step.sub}
                        </p>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                            Current
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            ✓ Complete
                          </span>
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
