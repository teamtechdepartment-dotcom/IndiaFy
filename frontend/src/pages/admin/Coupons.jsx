import { useState, useMemo, useEffect } from "react";
import { Plus, TicketPercent, Filter, ArrowUpDown, Trash2, Power, RefreshCw } from "lucide-react";
import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";
import CreateCouponModal from "../../components/admin/CreateCouponModal";
import StatsCard from "../../components/admin/StatsCard";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Coupons() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/coupons");
      const list = res.data?.data || [];
      if (Array.isArray(list)) {
        setCoupons(list);
      }
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axiosInstance.put(`/admin/management/coupons/${id}/status`, {
        isActive: !currentStatus,
      });
      toast.success("Coupon status updated");
      setCoupons((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: !currentStatus } : c))
      );
    } catch (err) {
      toast.error("Failed to toggle coupon status");
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      try {
        await axiosInstance.delete(`/admin/management/coupons/${id}`);
        toast.success(`Coupon ${code} deleted`);
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        toast.error("Failed to delete coupon");
      }
    }
  };

  const filteredCoupons = useMemo(() => {
    let data = [...coupons];

    if (statusFilter === "Active") {
      data = data.filter((c) => c.isActive);
    } else if (statusFilter === "Inactive") {
      data = data.filter((c) => !c.isActive);
    }

    if (sortBy === "az") {
      data.sort((a, b) => a.code.localeCompare(b.code));
    }

    if (sortBy === "za") {
      data.sort((a, b) => b.code.localeCompare(a.code));
    }

    if (sortBy === "status") {
      data.sort((a, b) => Number(b.isActive) - Number(a.isActive));
    }

    return data;
  }, [coupons, statusFilter, sortBy]);

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const inactiveCoupons = coupons.filter((c) => !c.isActive).length;

  return (
    <>
      <div
        className="flex min-h-screen text-slate-900 dark:text-slate-100"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)",
        }}
      >
        <Sidebar />

        <div className="admin-main flex-1 flex flex-col min-h-screen">
          <Header />

          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Discount Coupons & Promotions
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage and monitor storefront discount vouchers & coupon codes
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={fetchCoupons}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2874F0] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                >
                  <Plus size={16} />
                  Create Coupon
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard title="Total Coupons" value={totalCoupons.toString()} />
              <StatsCard title="Active Campaigns" value={activeCoupons.toString()} accent="green" />
              <StatsCard title="Inactive / Paused" value={inactiveCoupons.toString()} accent="orange" />
            </div>

            {/* FILTER + SORT */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="">Sort By</option>
                  <option value="az">Code A–Z</option>
                  <option value="za">Code Z–A</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold justify-end">
                <Filter size={14} />
                <span>{filteredCoupons.length} coupons listed</span>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-x-auto shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Coupon Code</th>
                    <th className="px-6 py-4 font-bold">Benefit</th>
                    <th className="px-6 py-4 font-bold">Min Spend</th>
                    <th className="px-6 py-4 font-bold">Redemptions</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                        Loading coupons catalog...
                      </td>
                    </tr>
                  ) : filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 text-xs font-bold">
                        No coupons found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((c) => {
                      const benefit =
                        c.discountType === "percentage"
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} FLAT OFF`;
                      const usageStr = `${c.usedCount || 0} / ${c.usageLimit || "∞"}`;

                      return (
                        <tr key={c._id || c.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4 flex items-center gap-3 font-extrabold text-slate-900 dark:text-white">
                            <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-[#2874F0] dark:text-[#FB641B] rounded-xl border border-blue-200 dark:border-blue-900/30">
                              <TicketPercent size={16} />
                            </span>
                            {c.code}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                            {benefit}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {c.minOrderAmount ? `₹${c.minOrderAmount}` : "None"}
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {usageStr}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                c.isActive
                                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {c.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(c._id, c.isActive)}
                              className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition cursor-pointer ${
                                c.isActive
                                  ? "border-amber-200 hover:bg-amber-50 text-amber-700 dark:hover:bg-amber-950/30"
                                  : "border-emerald-200 hover:bg-emerald-50 text-emerald-700 dark:hover:bg-emerald-950/30"
                              }`}
                            >
                              {c.isActive ? "Disable" : "Enable"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(c._id, c.code)}
                              className="px-2.5 py-1.5 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-xl transition cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>

        <CreateCouponModal
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={fetchCoupons}
        />
      </div>
    </>
  );
}
