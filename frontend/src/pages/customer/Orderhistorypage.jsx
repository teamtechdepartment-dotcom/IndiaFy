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

  // Auto-refresh orders every 30s for real-time status updates
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
      date: new Date(o.createdAt).toLocaleDateString(),
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
    <div className="bg-white min-h-screen text-slate-600">
      <WebsiteNavbar />

      <main className="max-w-5xl mx-auto px-4 pt-32 pb-24">

      {/* Background Blobs for Hero Theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[100px]" />
      </div>
      
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Order <span className="text-slate-500 italic">History</span>
            </h1>
            <p className="mt-2 font-medium text-slate-500">
              Managing {filteredOrders.length} orders in Gurugram sectors.
            </p>
          </div>
        </div>

        {/* Search & Global Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-slate-900 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Order ID or Item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white shadow-sm border border-slate-200 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 focus:outline-none focus:border-zinc-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white shadow-sm border border-slate-200 border border-slate-200 text-slate-900 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-zinc-500 cursor-pointer appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Value</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
          {["All", "Active", "Delivered", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border ${
                activeFilter === tab
                  ? "bg-white text-zinc-950 border-white shadow-lg shadow-white/5"
                  : "border-slate-200 text-slate-500 hover:border-zinc-600 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6 min-h-[400px]">
          {isLoading ? (
            <div className="py-20 text-center text-slate-500 font-bold tracking-widest uppercase">
              Loading orders...
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderCard key={order.rawId} order={order} />
                ))
              ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center bg-white/90 backdrop-blur-xl shadow-sm border border-slate-200 rounded-[3rem] border border-dashed border-slate-200"
              >
                <Package className="mx-auto mb-4 text-slate-700" size={48} />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  No orders found matching your criteria
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white shadow-sm border border-slate-200 border border-slate-200 rounded-[2.5rem] overflow-hidden hover:border-slate-300 transition-colors"
    >
      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-6">
            <div className="flex -space-x-4 shrink-0">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-2xl border-4 border-zinc-900 overflow-hidden bg-slate-100 border border-slate-200 shadow-xl"
                >
                  <img loading="lazy" decoding="async"
                    src={item.img}
                    className="w-full h-full object-cover"
                    alt="item"
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  {order.id}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    order.status === "Delivered"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : order.status === "Cancelled"
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-amber-500/10 text-amber-500"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-500">
                {order.date} • {order.items.length} Items
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end justify-center">
            <p className="text-2xl font-black text-slate-900 mb-1">
              {fmt(order.total)}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-slate-500">
              <MapPin size={12} /> {order.sector} Hub
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-3">
          {order.status !== "Cancelled" && (
            <button 
              onClick={() => navigate(`/track-order/${order.rawId}`)}
              className="bg-white text-zinc-950 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              Track Live
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="bg-slate-100 border border-slate-200 text-slate-900 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}{" "}
            Details
          </button>
          <button className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-2">
            <RotateCcw size={14} /> Reorder
          </button>
          {order.videoAvailable && (
            <button 
              onClick={() => window.open(order.packingVideoUrl, '_blank')}
              className="ml-auto text-emerald-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-emerald-400"
            >
              <Video size={14} /> View Packing Video
            </button>
          )}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-8 space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  Order Breakdown
                </p>
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center gap-4">
                      <img loading="lazy" decoding="async"
                        src={item.img}
                        className="w-10 h-10 rounded-lg object-cover"
                        alt=""
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {fmt(item.price)}
                    </p>
                  </div>
                ))}
                <div className="p-6 bg-white rounded-3xl border border-slate-200 mt-4 flex items-center gap-4">
                  <ShieldCheck size={24} className="text-slate-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-600">
                      Sold by {order.seller}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                      Verified Sector-Assigned Infrastructure
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
