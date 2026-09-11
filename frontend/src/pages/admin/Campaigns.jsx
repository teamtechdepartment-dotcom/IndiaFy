import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Flame,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Power,
  RefreshCw,
  Calendar,
  Package,
  Store,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
} from "lucide-react";
import Header from "../../components/admin/Header";
import Sidebar from "../../components/admin/Sidebar";
import StatsCard from "../../components/admin/StatsCard";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function Campaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/campaigns", {
        params: { limit: 100 },
      });
      const data = res.data?.data?.campaigns || res.data?.campaigns || [];
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
      toast.error(err?.response?.data?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleToggleStatus = async (campaign) => {
    const id = campaign._id;
    setTogglingId(id);
    const newStatus = campaign.status === "active" ? "disabled" : "active";

    try {
      const res = await axiosInstance.patch(`/admin/management/campaigns/${id}/status`, {
        status: newStatus,
      });
      toast.success(res.data?.message || `Campaign ${newStatus === "active" ? "activated" : "disabled"}`);
      fetchCampaigns();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to toggle status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete campaign "${name}"? This action cannot be undone.`)) {
      try {
        await axiosInstance.delete(`/admin/management/campaigns/${id}`);
        toast.success(`Campaign "${name}" deleted`);
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete campaign");
      }
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (c.effectiveStatus || c.status)?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  // Aggregate stats
  const totalCampaigns = campaigns.length;
  const activeCount = campaigns.filter((c) => (c.effectiveStatus || c.status) === "active").length;
  const totalProducts = campaigns.reduce((acc, c) => acc + (c.productCount || c.products?.length || 0), 0);
  const totalSellers = campaigns.reduce((acc, c) => acc + (c.sellerCount || 0), 0);

  const getStatusBadge = (status) => {
    const s = (status || "draft").toLowerCase();
    switch (s) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Clock size={12} />
            SCHEDULED
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
            <Clock size={12} />
            EXPIRED
          </span>
        );
      case "disabled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle size={12} />
            DISABLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            DRAFT
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
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
          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl text-amber-500">
                  <Flame size={24} className="animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Campaign & Sale Management
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Administer store-wide promotional events, merchant product selections, and automated discounts
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchCampaigns}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Sync
              </button>

              <Link
                to="/admin/campaigns/create"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2874F0] to-[#1a5bbf] text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              >
                <Plus size={16} />
                Create Campaign
              </Link>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Campaigns"
              value={totalCampaigns.toString()}
              accent="blue"
              icon={<Flame size={18} />}
            />
            <StatsCard
              title="Live Campaigns"
              value={activeCount.toString()}
              accent="green"
              icon={<CheckCircle2 size={18} />}
            />
            <StatsCard
              title="Products on Sale"
              value={totalProducts.toString()}
              accent="purple"
              icon={<Package size={18} />}
            />
            <StatsCard
              title="Sellers Participating"
              value={totalSellers.toString()}
              accent="orange"
              icon={<Store size={18} />}
            />
          </div>

          {/* FILTERS & SEARCH */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Events" },
                  { id: "active", label: "Live Now" },
                  { id: "scheduled", label: "Upcoming" },
                  { id: "draft", label: "Drafts" },
                  { id: "expired", label: "Past" },
                  { id: "disabled", label: "Disabled" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      statusFilter === tab.id
                        ? "bg-[#2874F0] text-white shadow-md shadow-blue-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative min-w-[260px]">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2874F0] transition"
                />
              </div>
            </div>
          </div>

          {/* CAMPAIGNS TABLE */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-16 text-center space-y-3">
                <RefreshCw size={28} className="animate-spin mx-auto text-[#2874F0]" />
                <p className="text-xs font-bold text-slate-400">Loading promotional campaigns...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <Flame size={32} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                    No Campaigns Found
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    {searchQuery || statusFilter !== "all"
                      ? "No promotional campaigns match your current filters."
                      : "Create your first campaign like 'Big Billion Days' to boost storefront sales."}
                  </p>
                </div>
                <Link
                  to="/admin/campaigns/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2874F0] text-white rounded-2xl text-xs font-bold hover:bg-[#1a5bbf] transition"
                >
                  <Plus size={16} /> Create Campaign
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-950/30">
                      <th className="p-4 pl-6">Campaign</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4">Inventory Scope</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Live Status</th>
                      <th className="p-4 text-center">Quick Toggle</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                    {filteredCampaigns.map((c) => {
                      const effectiveStatus = c.effectiveStatus || c.status;
                      const isLive = effectiveStatus === "active";

                      return (
                        <tr
                          key={c._id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                        >
                          {/* Campaign Name */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                                <Flame size={18} />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={`/admin/campaigns/${c._id}`}
                                  className="font-black text-slate-900 dark:text-white hover:text-[#2874F0] dark:hover:text-blue-400 transition truncate block max-w-[240px]"
                                >
                                  {c.name}
                                </Link>
                                <span className="text-[11px] text-slate-400 block truncate max-w-[240px]">
                                  {c.description || "No description provided"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Discount */}
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-xs">
                              {c.discountValue}% OFF
                            </span>
                          </td>

                          {/* Products & Sellers */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                                <Package size={13} className="text-slate-400" />
                                <span>{c.productCount || c.products?.length || 0} Products</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <Store size={12} />
                                <span>{c.sellerCount || 0} Participating Sellers</span>
                              </div>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {formatDate(c.startDate)} → {formatDate(c.endDate)}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {new Date(c.endDate) < new Date()
                                  ? "Ended"
                                  : new Date(c.startDate) > new Date()
                                  ? "Starts soon"
                                  : "Happening now"}
                              </span>
                            </div>
                          </td>

                          {/* Live Status */}
                          <td className="p-4">{getStatusBadge(effectiveStatus)}</td>

                          {/* Quick Toggle */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(c)}
                              disabled={togglingId === c._id}
                              title={isLive ? "Click to Disable" : "Click to Activate"}
                              className={`p-2 rounded-xl border transition cursor-pointer disabled:opacity-50 ${
                                isLive
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-emerald-500"
                              }`}
                            >
                              <Power size={15} className={togglingId === c._id ? "animate-spin" : ""} />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/admin/campaigns/${c._id}`}
                                className="p-2 text-slate-400 hover:text-[#2874F0] hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition"
                                title="View Details"
                              >
                                <Eye size={15} />
                              </Link>
                              <Link
                                to={`/admin/campaigns/${c._id}/edit`}
                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition"
                                title="Edit Campaign"
                              >
                                <Edit size={15} />
                              </Link>
                              <button
                                onClick={() => handleDelete(c._id, c.name)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                title="Delete Campaign"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
