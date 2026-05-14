import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  TrendingUp,
  Clock,
  Video,
  Search,
  Store,
  Wallet,
  ShoppingBag,
  Activity,
  AlertCircle,
  TrendingDown
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { useNodeStore } from "../../store/nodeStore";

export default function Dashboard() {
  const { activeNode } = useNodeStore();
  const { sellerOrders = [], fetchSellerOrders } = useOrderStore();

  const [searchTerm, setSearchTerm] = useState("");

  // activeNode is already loaded by SellerDashboardWrapper
  // No extra API call needed — use directly
  const nodeId = activeNode?._id;

  useEffect(() => {
    if (nodeId) {
      fetchSellerOrders(activeNode?.nodeType, nodeId);
    } else {
      fetchSellerOrders();
    }
  }, [nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const recentOrders = sellerOrders
    ?.slice(0, 5)
    ?.map((o) => {
      const firstName = o.customer?.firstName || "";
      const lastName = o.customer?.lastName || "";
      const customerName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : "Customer";

      return {
        id: o?._id?.toString()?.slice(-8)?.toUpperCase() || "N/A",
        customer: customerName,
        items: `${o?.orderItems?.length || 0} Item(s)`,
        amount: `₹${o?.totalPrice || 0}`,
        status: o?.status || "Pending",
        time: o?.createdAt
          ? new Date(o.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Unknown",
      };
    }) || [];

  const filteredOrders = recentOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = sellerOrders
    .filter(o => o.status !== "Cancelled")
    .reduce((acc, curr) => acc + (curr?.totalPrice || 0), 0);

  const pendingOrders = sellerOrders.filter(
    (o) => o?.status === "Pending"
  ).length;

  const fulfilledOrders = sellerOrders.filter(
    (o) => o?.status === "Delivered" || o?.status === "Shipped"
  ).length;

  if (!nodeId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={60} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-3xl font-black text-slate-900 mb-3">
            No Active Store Found
          </h2>
          <p className="text-slate-500 mb-6">Please activate a seller node.</p>
          <Link to="/seller-hub">
            <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
              Go To Seller Hub
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
              {activeNode?.logo ? (
                <img src={activeNode.logo} alt="Store Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="text-slate-400" size={36} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeNode?.storeName || "Active Node Dashboard"}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">
                  Online
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500">
                Type: {activeNode?.nodeType?.replace(/_/g, " ") || "Store"} • Managed Isolated Environment
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="orders">
              <button className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 transition-all flex items-center gap-2">
                <ShoppingBag size={16} />
                View Orders
              </button>
            </Link>
            <Link to="live">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                <Activity size={16} />
                Live Dispatch
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* REVENUE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-1.5">₹{totalRevenue.toFixed(2)}</h2>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-2">
              <TrendingUp size={12} /> +8% vs last week
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Wallet className="text-emerald-600" size={22} />
          </div>
        </div>

        {/* PENDING */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Orders</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-1.5">{pendingOrders}</h2>
            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-2">
              <Clock size={12} /> Action required
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="text-amber-600" size={22} />
          </div>
        </div>

        {/* COMPLETED */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 font-medium">Fulfilled Orders</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-1.5">{fulfilledOrders}</h2>
            <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 mt-2">
              <Package size={12} /> Sent successfully
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Package className="text-blue-600" size={22} />
          </div>
        </div>

        {/* TOTAL ORDERS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Activity</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-1.5">{sellerOrders.length}</h2>
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-2">
              Lifetime lifecycle
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <Activity className="text-slate-600" size={22} />
          </div>
        </div>
      </div>

      {/* SNAPSHOT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-slate-700" />
              Live Orders Snapshot
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">Overview of your recent activity</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search recent snapshot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider font-bold">
                <th className="pb-3 pl-2">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-900 text-sm">{order.id}</td>
                    <td className="py-4 font-medium text-slate-700 text-sm">{order.customer}</td>
                    <td className="py-4 text-slate-500 text-sm">{order.items}</td>
                    <td className="py-4 font-bold text-slate-900 text-sm">{order.amount}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                        order.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'Processing' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600' :
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-xs">{order.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                    No matching recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}