/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect, useCallback, useMemo } from "react";
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
  MapPin,
  Clock,
  User,
  Navigation,
  Map as MapIcon,
  FileText,
  AlertTriangle,
  Mail,
  Store,
  ArrowRight
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { useAuthStore } from "../../store/authStore";
import { useSellerAuthStore } from "../../store/sellerAuthStore";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import { toast } from "react-toastify";
import { Skeleton } from "../../components/ui/Skeleton";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { io } from "socket.io-client";

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Layout Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

// Timeline Steps Setup
const TIMELINE_STEPS = [
  { status: "Pending", label: "Order Placed", desc: "Confirmed on Indiafy Node" },
  { status: "Paid", label: "Payment Confirmed", desc: "Razorpay verified" },
  { status: "Processing", label: "Store Accepted", desc: "Preparing your items" },
  { status: "Packed", label: "Order Packed", desc: "Verifying secure video checklist" },
  { status: "Shipped", label: "Out For Delivery", desc: "Logistics pilot en route" },
  { status: "Delivered", label: "Delivered", desc: "Received at your location" }
];

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm ${className}`}>
    {children}
  </div>
);

// Map Center Updater
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { fetchOrderById } = useOrderStore();
  
  // Auth Stores
  const { user: customerUser, isAuthenticated: isCustomerAuth } = useAuthStore();
  const { user: sellerUser, isAuthenticated: isSellerAuth } = useSellerAuthStore();
  const { isAuthenticated: isAdminAuth } = useAdminAuthStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [etaText, setEtaText] = useState("40 mins");

  // Geolocation Coordinates
  const storeCoords = useMemo(() => [28.4595, 77.0266], []); // SharmaMart Gurugram
  const customerCoords = useMemo(() => [28.4725, 77.0396], []); // Near Sector 44
  const [riderCoords, setRiderCoords] = useState([28.4610, 77.0290]);
  const [riderAssigned, setRiderAssigned] = useState(false);
  const [distanceText, setDistanceText] = useState("1.8 km away");

  // Validate Order ID format before hitting backend
  const isValidId = useMemo(() => /^[0-9a-fA-F]{24}$/.test(orderId), [orderId]);

  // Access Control check
  const isUserAuthenticated = isCustomerAuth || isSellerAuth || isAdminAuth;

  // Live location animation ticks
  useEffect(() => {
    if (!order || order.status !== "Shipped") return;
    setRiderAssigned(true);

    let progressFraction = 0.15;
    const interval = setInterval(() => {
      progressFraction = Math.min(1.0, progressFraction + 0.08); // Move 8% closer
      
      const newLat = storeCoords[0] + (customerCoords[0] - storeCoords[0]) * progressFraction;
      const newLng = storeCoords[1] + (customerCoords[1] - storeCoords[1]) * progressFraction;
      setRiderCoords([newLat, newLng]);

      // Calculate distance remaining
      const remainingDistance = 1.8 * (1.0 - progressFraction);
      if (remainingDistance <= 0.05) {
        setDistanceText("Arrived at destination");
        setEtaText("1 min");
      } else {
        setDistanceText(`${remainingDistance.toFixed(2)} km away`);
        setEtaText(`${Math.ceil(remainingDistance * 5 + 2)} mins`);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.status, storeCoords, customerCoords]);

  const loadOrder = useCallback(async (showRefresh = false) => {
    if (!isValidId) {
      setError("Invalid Order ID format");
      setLoading(false);
      return;
    }
    if (showRefresh) setRefreshing(true);
    try {
      console.log(`[Tracking] Fetching order details for ID: ${orderId}`);
      const data = await fetchOrderById(orderId);
      if (data) {
        setOrder(data);
        setError(null);
        
        // Handle initial status ETAs
        if (data.status === "Delivered") {
          setEtaText("Delivered");
        } else if (data.status === "Shipped") {
          setEtaText("under 30 mins");
        } else if (data.status === "Processing") {
          setEtaText("25 mins");
        } else {
          setEtaText("40 mins");
        }
      } else {
        setError("Order not found");
      }
    } catch (_err) {
      console.error("[Tracking API Error]:", _err);
      if (_err?.response?.status === 403) {
        setError("403 Forbidden: You are not authorized to view this order.");
      } else {
        setError(_err?.response?.data?.message || "Failed to load order tracking details.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, fetchOrderById, isValidId]);

  // Initial load
  useEffect(() => {
    if (!isUserAuthenticated) {
      toast.error("Please login to view order tracking");
      navigate("/login");
      return;
    }
    loadOrder();
  }, [loadOrder, isUserAuthenticated, navigate]);

  // Socket.IO Room Integration for Real-Time Updates
  useEffect(() => {
    if (!orderId || !order) return;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    console.log(`[Socket] Connecting to server at ${socketUrl}`);
    const socket = io(socketUrl, {
      withCredentials: true
    });

    socket.on("connect", () => {
      console.log(`[Socket] Connection active. Joining room order_${orderId}`);
      socket.emit("join_order_room", { orderId });
    });

    socket.on("ORDER_STATUS_UPDATED", (data) => {
      console.log("[Socket Event] Status update received:", data);
      toast.info(`Live Update: Order status is now ${data.status}`);
      
      setOrder(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: data.status,
          isDelivered: data.isDelivered ?? prev.isDelivered,
          deliveredAt: data.deliveredAt ?? prev.deliveredAt,
          packingVideoUrl: data.packingVideoUrl ?? prev.packingVideoUrl
        };
      });

      if (data.status === "Delivered") {
        setEtaText("Delivered");
      } else if (data.status === "Shipped") {
        setEtaText("under 30 mins");
      } else if (data.status === "Processing") {
        setEtaText("25 mins");
      }
    });

    return () => {
      socket.disconnect();
      console.log("[Socket] Disconnected from room");
    };
  }, [orderId, order]);

  const handleRefresh = () => {
    loadOrder(true);
  };

  // Leaflet custom marker icons
  const storeIcon = useMemo(() => L.divIcon({
    html: `<div class="w-10 h-10 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white shadow-lg text-lg">🏪</div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  }), []);

  const customerIcon = useMemo(() => L.divIcon({
    html: `<div class="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-lg text-lg">🏠</div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  }), []);

  const riderIcon = useMemo(() => L.divIcon({
    html: `<div class="w-10 h-10 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-lg text-lg animate-bounce">🛵</div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  }), []);

  if (loading) {
    return (
      <div className="bg-white min-h-screen text-slate-600 font-sans">
        <SEOHead title="Tracking Order | Indiafy" noindex={true} />
        <WebsiteNavbar />
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 space-y-8">
          <Skeleton className="w-full h-[320px] rounded-[2.5rem] bg-slate-100 animate-pulse" />
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
  }

  if (error || !order) {
    return (
      <div className="bg-white min-h-screen text-slate-600 font-sans">
        <SEOHead title="Tracking Order | Indiafy" noindex={true} />
        <WebsiteNavbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2 border border-red-100">
            <AlertTriangle size={36} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{error || "Order Not Found"}</h2>
          <p className="text-slate-500 max-w-sm">
            We couldn't retrieve the tracking details. The link may be expired, invalid, or you do not have authorized privileges.
          </p>
          <button 
            onClick={() => navigate("/order-history")}
            className="px-8 py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-lg"
          >
            Go to My Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // --- SAFE TO ACCESS order DETAILS BELOW THIS LINE ---

  const getTimelineIndex = () => {
    if (!order) return 0;
    if (order.status === "Cancelled") return -1;
    if (order.status === "Delivered") return 5;
    if (order.status === "Shipped") return 4;
    if (order.packingVideoUrl) return 3;
    if (order.status === "Processing") return 2;
    if (order.isPaid) return 1;
    return 0;
  };

  const currentStep = getTimelineIndex();
  const isCancelled = order?.status === "Cancelled";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Generate dynamic PDF Invoice on the client side
  const handleDownloadInvoice = () => {
    if (!order) return;
    try {
      const doc = new jsPDF();
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.text("INDIAFY INVOICE", 20, 30);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Invoice Date: ${new Date().toLocaleDateString("en-IN")}`, 20, 40);
      doc.text(`Order ID: #${order._id.toUpperCase()}`, 20, 46);
      doc.text(`Store: ${order.orderItems?.[0]?.seller?.businessName || "Indiafy Seller"}`, 20, 52);
      
      doc.line(20, 58, 190, 58);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Billing Address:", 20, 68);
      doc.setFont("Helvetica", "normal");
      doc.text(`${order.shippingAddress?.address || ""}`, 20, 74);
      doc.text(`${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.postalCode || ""}`, 20, 80);
      
      doc.line(20, 88, 190, 88);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Item Details", 20, 98);
      doc.text("Qty", 130, 98);
      doc.text("Price", 160, 98);
      
      doc.setFont("Helvetica", "normal");
      let y = 106;
      (order.orderItems || []).forEach(item => {
        doc.text(item.product?.productName || "Product", 20, y);
        doc.text(String(item.quantity), 130, y);
        doc.text(`INR ${Number(item.price).toLocaleString("en-IN")}`, 160, y);
        y += 8;
      });
      
      doc.line(20, y + 2, 190, y + 2);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Total Paid:", 20, y + 12);
      doc.text(`INR ${Number(order.totalPrice).toLocaleString("en-IN")}`, 160, y + 12);
      
      doc.save(`invoice_${order._id.slice(-8)}.pdf`);
      toast.success("Invoice generated and downloaded successfully!");
    } catch (err) {
      console.error("[Invoice Error]:", err);
      toast.error("Failed to generate invoice PDF.");
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <SEOHead title={`Track Order #${(order._id || "").slice(-8).toUpperCase()} | Indiafy`} noindex={true} />
      <WebsiteNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-20 relative z-10">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-5%] right-[5%] w-[45vw] h-[45vw] bg-gradient-to-br from-emerald-100/40 to-teal-100/20 rounded-full blur-[100px]" />
          <div className="absolute top-[10%] left-[-5%] w-[35vw] h-[35vw] bg-gradient-to-tr from-blue-100/30 to-indigo-100/10 rounded-full blur-[100px]" />
        </div>

        {/* HEADER BLOCK */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button
              onClick={() => navigate("/order-history")}
              className="group flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold mb-4"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Orders
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
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
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-650 shrink-0">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">Order Cancelled</h3>
              <p className="text-sm text-red-600/80 mt-1">
                The order could not be fulfilled and has been cancelled. Refunds are processed back to the original source dynamically.
              </p>
            </div>
          </motion.div>
        )}

        {/* MAIN COLUMNS */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            
            {/* ETA CARD */}
            <Card className="p-8 relative overflow-hidden group bg-gradient-to-br from-white to-slate-50/50">
              <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                    {isCancelled ? "Status: Cancelled" : order.status === "Delivered" ? "Order Completed" : "Estimated Delivery"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h2 className={`text-5xl md:text-6xl font-black tracking-tighter ${isCancelled ? "text-slate-300" : "text-slate-900"}`}>
                      {etaText}
                    </h2>
                    {!isCancelled && order.status !== "Delivered" && (
                      <span className="text-slate-400 text-lg font-bold uppercase tracking-widest">Mins</span>
                    )}
                  </div>
                  {order.status === "Delivered" && order.deliveredAt && (
                    <div className="flex items-center gap-2 text-emerald-600 mt-4 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                      <CheckCircle2 size={16} />
                      <p className="text-xs font-bold uppercase tracking-wider">Arrived on {formatDate(order.deliveredAt)}</p>
                    </div>
                  )}
                </div>
                <div className="sm:text-right">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center mb-3 sm:ml-auto">
                    <Truck size={24} className={isCancelled ? "text-slate-400" : "text-slate-800"} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ID: #{(order._id || "").slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </Card>

            {/* INTERACTIVE DELIVERY MAP */}
            <Card className="overflow-hidden h-[340px] md:h-[400px] border border-zinc-200/60 relative">
              <div className="w-full h-full absolute inset-0 z-0 bg-slate-100">
                <MapContainer 
                  center={riderCoords} 
                  zoom={14} 
                  zoomControl={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  <Marker position={storeCoords} icon={storeIcon}>
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-xs">Store Node</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">SharmaMart Retail Outlet</p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  <Marker position={customerCoords} icon={customerIcon}>
                    <Popup>
                      <div className="p-1">
                        <p className="font-bold text-xs">Your Delivery Point</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{order.shippingAddress?.address}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {riderAssigned && (
                    <Marker position={riderCoords} icon={riderIcon}>
                      <Popup>
                        <div className="p-1">
                          <p className="font-bold text-xs">Delivery Pilot</p>
                          <p className="text-[10px] text-amber-600 font-bold mt-0.5">{distanceText}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  <Polyline 
                    positions={[storeCoords, riderAssigned ? riderCoords : storeCoords, customerCoords]} 
                    color="#10b981" 
                    dashArray="6, 6"
                    weight={3}
                  />
                  <MapUpdater center={riderAssigned ? riderCoords : storeCoords} />
                </MapContainer>
              </div>

              {/* Map floating banner */}
              <div className="absolute bottom-4 left-4 right-4 z-[400] bg-slate-900/95 text-white backdrop-blur px-4 py-3 rounded-2xl flex items-center justify-between text-xs shadow-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-emerald-400 animate-pulse" />
                  <span className="font-medium text-slate-200">
                    {riderAssigned ? `Rider is ${distanceText}` : "Rider is awaiting node dispatch"}
                  </span>
                </div>
                <span className="font-bold text-emerald-400 uppercase tracking-widest text-[9px] bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  Live GPS
                </span>
              </div>
            </Card>

            {/* TIMELINE TRACKER */}
            <Card className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-bold text-slate-900">Delivery Status Timeline</p>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Tracker
                </div>
              </div>
              
              <div className="space-y-0">
                {TIMELINE_STEPS.map((step, i) => {
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
                          {isCompleted ? <CheckCircle2 size={18} /> : <Clock size={16} />}
                        </div>
                        {i !== TIMELINE_STEPS.length - 1 && (
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
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* ORDER ITEMS SUMMARY */}
            <Card className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm font-bold text-slate-900">Items Ordered</p>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {order.orderItems?.length || 0}
                </span>
              </div>
              <div className="space-y-3">
                {(order.orderItems || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-colors">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-150 shrink-0 border border-slate-100">
                      <img loading="lazy" decoding="async" 
                        src={item.product?.productImage?.[0] || "https://placehold.co/100x100"} 
                        className="w-full h-full object-cover mix-blend-multiply" 
                        alt={item.product?.productName || "Product"} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {item.product?.productName || "Product Item"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 shrink-0">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3 px-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Items Price</span>
                  <span className="text-slate-900 font-semibold">₹{Number(order.itemsPrice || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Delivery Charge</span>
                  <span className="text-slate-900 font-semibold">₹{Number(order.shippingPrice || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">GST / Taxes</span>
                  <span className="text-slate-900 font-semibold">₹{Number(order.taxPrice || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-955">Grand Total</span>
                  <span className="text-xl font-black text-slate-900">
                    ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </Card>

          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* RIDER ASSIGNED CARD */}
            {riderAssigned && (
              <Card className="p-6 md:p-8 border border-amber-250 bg-amber-50/10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Pilot Assigned
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">Rahul Kumar</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">HR 26 DQ 8829 • Hero Electric Optima</p>
                  </div>
                  <div className="w-14 h-14 bg-amber-100 rounded-full overflow-hidden flex items-center justify-center text-amber-600 border-2 border-white shadow">
                    <User size={28} />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl p-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current ETA</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">Delivering in {etaText} ({distanceText})</p>
                  </div>
                </div>
              </Card>
            )}

            {/* DELIVERY DETAILS CARD */}
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  <Store size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {order.orderItems?.[0]?.seller?.businessName || "SharmaMart Retailer"}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {order.paymentMethod || "UPI"}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${order.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {order.isPaid ? "Paid" : "Pending Payment"}
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
                  {order.shippingAddress?.address || "No address supplied"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", ")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    toast.info("Calling support desk: 1800-102-3920");
                  }}
                  className="flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Phone size={16} /> Call Seller
                </button>
                <button 
                  onClick={() => {
                    if (order.packingVideoUrl) {
                      window.open(order.packingVideoUrl);
                    } else {
                      toast.info("Packing verification video will be unlocked shortly!");
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs transition-all shadow-sm border ${
                    order.packingVideoUrl 
                      ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800" 
                      : "bg-slate-50 border-slate-200 text-slate-455 cursor-not-allowed"
                  }`}
                >
                  <Video size={16} /> Packing Proof
                </button>
              </div>
            </Card>

            {/* INVOICE & DOCUMENTATION SECTION */}
            <Card className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-955">Documents & Invoices</h4>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">Verify tax and billing details</p>
                </div>
                <FileText size={20} className="text-slate-400" />
              </div>
              
              <button 
                onClick={handleDownloadInvoice}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl transition-all group/btn text-xs font-bold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <FileText size={16} className="text-emerald-500" />
                  Download TAX Invoice
                </span>
                <ArrowRight size={14} className="text-slate-400 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </Card>

            {/* TRUST SIGNAL BOX */}
            <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-[2rem] border border-emerald-100/60 shadow-sm">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
                <ShieldCheck size={20} className="text-emerald-600" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 mb-2">
                Indiafy Assurance
              </p>
              <p className="text-xs text-slate-655 leading-relaxed font-medium">
                Order packed with verified sector-verification. Dynamic QR enabled for secure payment. Video proof attached to every shipment.
              </p>
            </div>

            {/* Auto-refresh status banner */}
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4">
                <RefreshCw size={12} className="animate-spin text-emerald-500" style={{ animationDuration: "3s" }} />
                Real-time updates enabled
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
