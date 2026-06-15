/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import StatsCard from "../../components/admin/StatsCard";
import { exportToCSV } from "../../utils/exportCSV";
import { useNavigate } from "react-router-dom";
import { Download, Package, Clock, Truck, CheckCircle, Search, Eye, Filter, ArrowUpRight, Ban } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function OrderManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/orders");
      // res = { statusCode, data: orders, message }
      const data = res.data || res;
      setOrders(data || []);
    } catch (_err) {
      toast.error("Failed to load customer orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/management/orders/${id}/state`, { status });
      toast.success(`Order status set to ${status}`);
      fetchOrders();
    } catch (_err) {
      toast.error("Failed to update status");
    }
  };

  const handleExport = () => {
    const exportData = orders.map(o => ({
      ID: o._id,
      Customer: o.customer?.firstName || "Guest",
      Email: o.customer?.email || "N/A",
      Total: `₹${o.totalPrice}`,
      Paid: o.isPaid ? "PAID" : "UNPAID",
      Status: o.status,
      Created: new Date(o.createdAt).toLocaleDateString(),
    }));
    exportToCSV(exportData, "orders-directory.csv");
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o._id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
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

              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl font-bold text-xs hover:shadow-xs transition active:scale-95"
              >
                <Download size={16} className="text-[#D4AF37]" />
                Export CSV
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatsCard
                title="Pending Shipments"
                value={orders.filter(o => o.status === "Pending").length}
                badge="Awaiting packing"
                accent="orange"
                icon={<Clock size={16} />}
              />
              <StatsCard
                title="In Transit"
                value={orders.filter(o => o.status === "Processing" || o.status === "Shipped").length}
                badge="Out for delivery"
                accent="blue"
                icon={<Truck size={16} />}
              />
              <StatsCard
                title="Delivered Orders"
                value={orders.filter(o => o.status === "Delivered").length}
                badge="Completed sales"
                accent="green"
                icon={<CheckCircle size={16} />}
              />
              <StatsCard
                title="Cancelled / Returned"
                value={orders.filter(o => o.status === "Cancelled").length}
                badge="Failed conversions"
                accent="red"
                icon={<Ban size={16} />}
              />
            </div>

            {/* Table layout */}
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
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">Loading orders...</td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">No orders found matching the query.</td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-extrabold text-[#0B1528]">{o._id}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold">{o.customer?.firstName || "Guest"}</p>
                            <p className="text-[10px] text-slate-400">{o.customer?.email || "N/A"}</p>
                          </td>
                          <td className="py-4 px-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              o.isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                            }`}>
                              {o.isPaid ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              o.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : o.status === "Cancelled"
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-black text-slate-800">
                            ₹{o.totalPrice.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleUpdateStatus(o._id, "Delivered")}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-[10px] border border-emerald-200 transition"
                            >
                              Deliver
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(o._id, "Cancelled")}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-[10px] border border-red-200 transition"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
