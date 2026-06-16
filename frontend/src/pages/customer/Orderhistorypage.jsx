/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  MapPin,
  Video,
  RotateCcw,
  Star,
  Filter,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrderStore } from "../../store/orderStore";

// Layout Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const { orders, fetchMyOrders, isLoading } = useOrderStore();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  // Auto-refresh orders every 10s for real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMyOrders();
    }, 10000); // 10s for real-time updates
    return () => clearInterval(interval);
  }, [fetchMyOrders]);

  // Transform backend orders to match UI structure
  const formattedOrders = useMemo(() => {
    return orders.map(o => ({
      id: o._id.substring(o._id.length - 8).toUpperCase(),
      rawId: o._id,
      date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
      rawDate: new Date(o.createdAt),
      status: o.status || (o.isDelivered ? "Delivered" : "Pending"),
      total: o.totalPrice,
      seller: o.orderItems[0]?.seller?.businessName || o.orderItems[0]?.seller?.firstName || "Indiafy Seller",
      sector: "Local",
      videoAvailable: !!o.packingVideoUrl, 
      packingVideoUrl: o.packingVideoUrl,
      items: o.orderItems.map(item => ({
        name: item.product?.productName || "Product",
        qty: item.quantity,
        price: item.price,
        img: item.product?.productImage?.[0] || "https://placehold.co/200x200"
      }))
    }));
  }, [orders]);

  // --- FILTER & SORT LOGIC ---
  const filteredOrders = useMemo(() => {
    let result = [...formattedOrders];

    // 1. Status Filter
    if (activeFilter !== "All") {
      result = result.filter((order) => {
        if (activeFilter === "Active")
          return (
            order.status === "Pending" || order.status === "Processing" || order.status === "Shipped"
          );
        return order.status === activeFilter;
      });
    }

    // 2. Search Logic (Order ID or Item Name)
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.items.some((item) => item.name.toLowerCase().includes(query)),
      );
    }

    // 3. Sorting Logic
    return result.sort((a, b) => {
      if (sortBy === "newest") return b.rawDate - a.rawDate;
      if (sortBy === "oldest") return a.rawDate - b.rawDate;
      if (sortBy === "highest") return b.total - a.total;
      return 0;
    });
  }, [search, activeFilter, sortBy, formattedOrders]);

  return (
    <div className="bg-white min-h-screen text-slate-600 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <WebsiteNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-24 relative z-10">

        {/* Background Blobs for Hero Theme */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-5%] right-[5%] w-[45vw] h-[45vw] bg-gradient-to-br from-emerald-100/40 to-teal-100/20 rounded-full blur-[100px]" />
          <div className="absolute top-[10%] left-[-5%] w-[35vw] h-[35vw] bg-gradient-to-tr from-blue-100/30 to-indigo-100/10 rounded-full blur-[100px]" />
        </div>
      
        {/* Header Section */}
        <div className="mb-10 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Order <span className="text-emerald-600 italic">History</span>
          </h1>
          <p className="mt-3 text-sm md:text-base font-medium text-slate-500">
            Managing <span className="font-bold text-slate-900">{filteredOrders.length} orders</span> in your active history.
          </p>
        </div>

        {/* Search & Global Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Order ID or Item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white shadow-sm border border-slate-200 rounded-full py-3.5 pl-12 pr-12 text-sm text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-1 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-white shadow-sm border border-slate-200 text-slate-700 rounded-full pl-5 pr-10 py-3.5 font-bold text-xs uppercase tracking-widest outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 cursor-pointer appearance-none transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
          {["All", "Active", "Delivered", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 border ${
                activeFilter === tab
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-5 md:space-y-6 min-h-[400px]">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">
                Loading orders...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, i) => (
                  <motion.div
                    key={order.rawId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <OrderCard order={order} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center bg-slate-50 rounded-[2rem] border border-slate-100"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-slate-100 text-slate-400">
                    <Package size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No orders found</h3>
                  <p className="text-slate-500 text-sm">
                    We couldn't find any orders matching your current filters.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const getStatusStyles = (status) => {
    if (status === "Delivered") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (status === "Cancelled") return "bg-red-50 text-red-600 border-red-100";
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

  return (
    <div className="bg-white border border-zinc-200/60 shadow-sm rounded-[2rem] overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
      <div className="p-5 md:p-8">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 md:gap-6">
            
            {/* Image Stack */}
            <div className="flex -space-x-3 shrink-0">
              {order.items.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white overflow-hidden bg-slate-50 shadow-sm relative z-10"
                  style={{ zIndex: 10 - i }}
                >
                  <img loading="lazy" decoding="async"
                    src={item.img}
                    className="w-full h-full object-cover mix-blend-multiply"
                    alt="item"
                  />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 relative z-0">
                  +{order.items.length - 3}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  #{order.id}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getStatusStyles(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Ordered on {order.date} • <span className="font-semibold text-slate-700">{order.items.length} Items</span>
              </p>
            </div>
          </div>

          {/* Pricing & Location */}
          <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <p className="text-2xl font-black text-slate-900 mb-1">
              {fmt(order.total)}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <MapPin size={12} /> {order.sector} Delivery
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-100">
          {order.status !== "Cancelled" && (
            <button 
              onClick={() => navigate(`/track-order/${order.rawId}`)}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-md"
            >
              Track Order
            </button>
          )}
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            {expanded ? "Hide Details" : "View Details"}
            {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>
          
          <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
            <RotateCcw size={14} className="text-slate-400" /> Reorder
          </button>

          {order.videoAvailable && (
            <button 
              onClick={() => window.open(order.packingVideoUrl, '_blank')}
              className="ml-auto bg-emerald-50 text-emerald-600 border border-emerald-100 px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-100 transition-colors"
            >
              <Video size={14} /> Packing Video
            </button>
          )}
        </div>

        {/* Expanded Area */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-4">
                  Order Breakdown
                </p>
                
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                        <img loading="lazy" decoding="async"
                          src={item.img}
                          className="w-full h-full object-cover mix-blend-multiply"
                          alt={item.name}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {fmt(item.price)}
                    </p>
                  </div>
                ))}
                
                <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-100/60 mt-6 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100 shrink-0">
                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Sold by {order.seller}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                      Verified Sector-Assigned Infrastructure
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}