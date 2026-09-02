import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import StatsCard from "../../components/admin/StatsCard";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import { exportToCSV } from "../../utils/exportCSV";
import { useNavigate } from "react-router-dom";
import { Download, Package, Clock, Truck, CheckCircle, Search, RefreshCw, AlertTriangle, Ban, Plus, Eye } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function OrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/orders");
      const raw = res?.data?.orders ?? res?.data ?? res ?? [];
      const safeData = Array.isArray(raw) ? raw : [];
      setOrders(safeData);
    } catch (_err) {
      console.error("Error fetching orders:", _err);
      setError("Failed to load customer orders.");
      toast.error("Failed to load customer orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!id) return;
    try {
      await axiosInstance.put(`/admin/management/orders/${id}/state`, { status });
      toast.success(`Order status set to ${status}`);
      fetchOrders();
    } catch (_err) {
      toast.error("Failed to update status");
    }
  };

  const handleExport = () => {
    try {
      const safeList = Array.isArray(orders) ? orders : [];
      const exportData = safeList.map(o => {
        const cDate = o?.createdAt ? new Date(o.createdAt) : null;
        const validDate = cDate && !isNaN(cDate.getTime()) ? cDate.toLocaleDateString() : "N/A";
        return {
          ID: o?._id ?? "N/A",
          Customer: o?.customer?.firstName ?? o?.customerName ?? "Guest",
          Email: o?.customer?.email ?? o?.customerEmail ?? "N/A",
          Total: `₹${Number(o?.totalPrice ?? 0).toLocaleString()}`,
          Paid: o?.isPaid ? "PAID" : "UNPAID",
          Status: o?.status ?? "Pending",
          Created: validDate,
        };
      });
      exportToCSV(exportData, "orders-directory.csv");
    } catch (err) {
      console.error("Error exporting orders:", err);
      toast.error("Failed to export order data");
    }
  };

  const safeOrdersList = Array.isArray(orders) ? orders : [];

  const filteredOrders = safeOrdersList.filter(o => {
    if (!o) return false;
    const query = (search ?? "").toLowerCase().trim();
    const idStr = (o._id ?? "").toLowerCase();
    const cName = (o.customer?.firstName ?? o.customerName ?? "").toLowerCase();
    const cEmail = (o.customer?.email ?? o.customerEmail ?? "").toLowerCase();

    const matchesSearch =
      !query || idStr.includes(query) || cName.includes(query) || cEmail.includes(query);
      
    const matchesStatus = statusFilter === "All" || (o.status ?? "Pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = safeOrdersList.filter(o => o?.status === "Pending").length;
  const transitCount = safeOrdersList.filter(o => o?.status === "Processing" || o?.status === "Shipped").length;
  const deliveredCount = safeOrdersList.filter(o => o?.status === "Delivered").length;
  const cancelledCount = safeOrdersList.filter(o => o?.status === "Cancelled").length;

  return (
    <div className="flex min-h-screen font-sans" style={{background:"radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-2">
                  <Package size={14} /> Orders Command
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Management</h1>
                <p className="text-slate-500 font-medium">
                  Track marketplace shipments, initiate customer refunds, and audit transaction records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchOrders}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/admin/orders/create")}
                    className="flex items-center justify-center gap-2 bg-[#2874F0] hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Plus size={16} />
                    Create Order
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={orders.length === 0}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl font-bold text-xs hover:shadow-xs transition active:scale-95 text-slate-800 cursor-pointer"
                  >
                    <Download size={16} className="text-[#D4AF37]" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={fetchOrders} className="underline hover:text-red-900">Retry</button>
              </div>
            )}

            {/* Stats Cards Wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load order statistics">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
                  ))
                ) : (
                  <>
                    <StatsCard
                      title="Pending Shipments"
                      value={pendingCount}
                      badge="Awaiting packing"
                      accent="orange"
                      icon={<Clock size={16} />}
                    />
                    <StatsCard
                      title="In Transit"
                      value={transitCount}
                      badge="Out for delivery"
                      accent="blue"
                      icon={<Truck size={16} />}
                    />
                    <StatsCard
                      title="Delivered Orders"
                      value={deliveredCount}
                      badge="Completed sales"
                      accent="green"
                      icon={<CheckCircle size={16} />}
                    />
                    <StatsCard
                      title="Cancelled / Returned"
                      value={cancelledCount}
                      badge="Failed conversions"
                      accent="red"
                      icon={<Ban size={16} />}
                    />
                  </>
                )}
              </div>
            </AdminErrorBoundary>

            {/* Table Layout Wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load orders list">
              <div className="bg-white border rounded-[2rem] p-6 shadow-xs space-y-5">
                
                {/* Search & filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Search by ID, name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-11 text-xs font-medium text-slate-900 outline-none transition-all focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-11 px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-xs text-left">
                    <thead className="bg-slate-50 text-gray-400 uppercase tracking-widest text-[9px] border-b">
                      <tr>
                        <th className="py-3 px-4 font-black">Order ID</th>
                        <th className="py-3 px-4 font-black">Customer</th>
                        <th className="py-3 px-4 font-black">Date</th>
                        <th className="py-3 px-4 font-black text-center">Payment Status</th>
                        <th className="py-3 px-4 font-black text-center">Fulfillment Status</th>
                        <th className="py-3 px-4 font-black text-right">Total Amount</th>
                        <th className="py-3 px-4 font-black text-right">Administrative Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {loading ? (
                        [1, 2, 3, 4, 5].map(idx => (
                          <tr key={idx} className="animate-pulse">
                            <td className="py-4 px-4"><div className="w-24 h-3.5 bg-slate-200 rounded" /></td>
                            <td className="py-4 px-4"><div className="w-32 h-3.5 bg-slate-200 rounded" /></td>
                            <td className="py-4 px-4"><div className="w-20 h-3 bg-slate-200 rounded" /></td>
                            <td className="py-4 px-4 text-center"><div className="w-16 h-5 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-4 px-4 text-center"><div className="w-16 h-5 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-4 px-4 text-right"><div className="w-20 h-3.5 bg-slate-200 rounded ml-auto" /></td>
                            <td className="py-4 px-4 text-right"><div className="w-28 h-6 bg-slate-200 rounded-lg ml-auto" /></td>
                          </tr>
                        ))
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-gray-400 font-semibold">
                            No orders found matching the query.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => {
                          const safeId = o?._id || Math.random().toString();
                          const cName = o?.customer?.firstName ?? o?.customerName ?? "Guest";
                          const cEmail = o?.customer?.email ?? o?.customerEmail ?? "N/A";
                          const cDate = o?.createdAt ? new Date(o.createdAt) : null;
                          const dateStr = cDate && !isNaN(cDate.getTime()) ? cDate.toLocaleDateString() : "N/A";
                          const statusStr = o?.status ?? "Pending";
                          const priceVal = Number(o?.totalPrice ?? 0);

                          return (
                            <tr
                              key={safeId}
                              onClick={() => navigate(`/admin/orders/${safeId}`)}
                              className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                            >
                              <td className="py-4 px-4 font-extrabold text-[#0B1528] dark:text-slate-200 group-hover:text-[#2874F0] underline">
                                {safeId}
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-bold">{cName}</p>
                                <p className="text-[10px] text-slate-400">{cEmail}</p>
                              </td>
                              <td className="py-4 px-4 text-gray-500">{dateStr}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  o?.isPaid
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                                }`}>
                                  {o?.isPaid ? "Paid" : "Unpaid"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  statusStr === "Delivered"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : statusStr === "Cancelled"
                                      ? "bg-red-50 text-red-600 border border-red-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {statusStr}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right font-black text-slate-800 dark:text-slate-200">
                                ₹{priceVal.toLocaleString()}
                              </td>
                              <td className="py-4 px-4 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/orders/${safeId}`);
                                  }}
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2874F0] rounded-xl font-bold text-[10px] border border-blue-200 transition cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(o?._id, "Delivered");
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-[10px] border border-emerald-200 transition cursor-pointer"
                                >
                                  Deliver
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(o?._id, "Cancelled");
                                  }}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-[10px] border border-red-200 transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            </AdminErrorBoundary>

          </div>
        </main>
      </div>
    </div>
  );
}
