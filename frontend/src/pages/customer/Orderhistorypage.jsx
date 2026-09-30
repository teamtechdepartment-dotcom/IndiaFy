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
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
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

  const { orders, fetchMyOrders, deleteOrder, isLoading } = useOrderStore();

  useEffect(() => {
    fetchMyOrders();
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
      seller: o.orderItems[0]?.nodeId?.storeName || o.orderItems[0]?.nodeId?.businessName || o.orderItems[0]?.product?.nodeId?.storeName || o.orderItems[0]?.seller?.businessName || o.orderItems[0]?.seller?.firstName || "Indiafy Store Node",
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
            order.status === "Pending" || order.status === "Accepted" || order.status === "Processing" || order.status === "Shipped"
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
    <div className="bg-[#f1f2f4] min-h-screen text-gray-700 font-sans">
      <WebsiteNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 md:pt-36 pb-24 relative z-10">

        {/* Background Blobs Removed for Flat UI */}
      
        {/* Header Section */}
        <div className="mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Order <span className="text-[#065F46]">History</span>
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-gray-500">
            Managing <span className="font-bold text-gray-900">{filteredOrders.length} orders</span> in your active history.
          </p>
        </div>

        {/* Search & Global Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-5 top-1/2 -trangray-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Order ID or Item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white shadow-sm border border-gray-200 rounded py-3 pl-12 pr-12 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#065F46] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-white shadow-sm border border-gray-200 text-gray-700 rounded pl-5 pr-10 py-3 font-bold text-xs uppercase tracking-widest outline-none focus:border-[#065F46] cursor-pointer appearance-none transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -trangray-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
          {["All", "Active", "Delivered", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all duration-200 border ${
                activeFilter === tab
                  ? "bg-[#065F46] text-white border-[#065F46] shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800"
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
              <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">
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
                    <OrderCard order={order} deleteOrder={deleteOrder} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center bg-gray-50 rounded border border-gray-100"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-gray-100 text-gray-400">
                    <Package size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500 text-sm">
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

function OrderCard({ order, deleteOrder }) {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const getStatusStyles = (status) => {
    if (status === "Delivered") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (status === "Cancelled") return "bg-red-50 text-red-600 border-red-100";
    if (status === "Accepted") return "bg-blue-50 text-[#065F46] border-blue-100";
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete order #${order.id}? This action cannot be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteOrder(order.rawId);
      toast.success("Order deleted successfully");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete order";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Orders that cannot be deleted (actively being shipped)
  const canDelete = !["Shipped"].includes(order.status);

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden hover:border-gray-300 transition-all duration-200 mb-4">
      <div className="p-5 md:p-8">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 md:gap-6">
            
            {/* Image Stack */}
            <div className="flex -space-x-3 shrink-0">
              {order.items.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  className="w-16 h-16 md:w-20 md:h-20 rounded border-4 border-white overflow-hidden bg-gray-50 shadow-sm relative z-10"
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
                <div className="w-16 h-16 md:w-20 md:h-20 rounded border-4 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 relative z-0">
                  +{order.items.length - 3}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">
                  #{order.id}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getStatusStyles(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500">
                Ordered on {order.date} • <span className="font-semibold text-gray-700">{order.items.length} Items</span>
              </p>
            </div>
          </div>

          {/* Pricing & Location */}
          <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
            <p className="text-2xl font-black text-gray-900 mb-1">
              {fmt(order.total)}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <MapPin size={12} /> {order.sector} Delivery
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100">
          {order.status !== "Cancelled" && (
            <button 
              onClick={() => navigate(`/track-order/${order.rawId}`)}
              className="bg-[#065F46] text-white px-4 py-2 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-[#047857] transition-all shadow-sm"
            >
              Track Order
            </button>
          )}
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            {expanded ? "Hide Details" : "View Details"}
            {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
          </button>
          
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2">
            <RotateCcw size={14} className="text-gray-400" /> Reorder
          </button>

          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} /> {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}

          {order.videoAvailable && (
            <button 
              onClick={() => window.open(order.packingVideoUrl, '_blank')}
              className="ml-auto bg-[#065F46]/10 text-[#065F46] border border-[#065F46]/20 px-4 py-2 rounded font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#065F46]/20 transition-colors"
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
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-4">
                  Order Breakdown
                </p>
                
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                        <img loading="lazy" decoding="async"
                          src={item.img}
                          className="w-full h-full object-cover mix-blend-multiply"
                          alt={item.name}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {fmt(item.price)}
                    </p>
                  </div>
                ))}
                
                <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded border border-emerald-100/60 mt-6 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100 shrink-0">
                    <ShieldCheck size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      Sold by {order.seller}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
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