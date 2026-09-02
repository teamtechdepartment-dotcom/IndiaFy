import { useState, useEffect } from "react";
import SEOHead from "../../components/seo/SEOHead";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import { Download, AlertTriangle, CheckCircle, Sparkles, RefreshCw, TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Store, Clock, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import axiosInstance from "../../utils/axiosInstance";
import { exportToCSV } from "../../utils/exportCSV";

// ─── Custom Chart Tooltip ─────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 rounded-2xl text-xs font-semibold bg-white/95 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-800/80 shadow-lg text-slate-800 dark:text-slate-200 backdrop-blur-md">
        <p className="text-slate-400 dark:text-slate-500 mb-1">{label}</p>
        <p className="text-[#2874F0] dark:text-[#FB641B] font-extrabold">₹{payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

// ─── Stat Card ─────────────────────────────────────────────────
function StatCard({ title, value, desc, trend, icon: Icon, color = "blue", isWarning = false }) {
  const colorMap = {
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    blue: { text: "text-[#2874F0] dark:text-blue-400", bg: "bg-[#2874F0]/10 dark:bg-blue-400/10", border: "border-[#2874F0]/20 dark:border-blue-400/20" },
    amber: { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    red: { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    purple: { text: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };
  const c = colorMap[color] || colorMap.blue;
  const trendUp = trend?.startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="admin-card relative p-6 flex flex-col justify-between overflow-hidden select-none"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-45 ${c.bg} blur-xl translate-x-[30%] -translate-y-[30%]`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${c.bg} ${c.border} ${c.text}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between relative z-10">
        <span className="text-[10px] font-semibold text-slate-550 dark:text-slate-400">{desc}</span>
        {trend && (
          <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl border ${
            isWarning
              ? "bg-red-500/10 border-red-500/25 text-red-500"
              : `${c.bg} ${c.border} ${c.text}`
          }`}>
            {trendUp ? <TrendingUp size={10} /> : trendUp === false ? <TrendingDown size={10} /> : null}
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Table Row ─────────────────────────────────────────────────
function TableRow({ id, store, total, method, date }) {
  return (
    <tr className="admin-table-row">
      <td className="py-4 px-4 font-bold text-xs text-[#2874F0] dark:text-[#FB641B]">{id}</td>
      <td className="py-4 px-4 font-medium text-xs text-slate-800 dark:text-slate-300">{store}</td>
      <td className="py-4 px-4 font-black text-xs text-slate-950 dark:text-slate-100">{total}</td>
      <td className="py-4 px-4 text-center">
        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
          {method}
        </span>
      </td>
      <td className="py-4 px-4 text-right text-xs font-semibold text-slate-400 dark:text-slate-650">{date}</td>
    </tr>
  );
}

// ─── Region Progress ───────────────────────────────────────────
function RegionProgress({ name, pct }) {
  return (
    <div className="space-y-2 text-xs">
      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
        <span>{name}</span>
        <span className="text-[#2874F0] dark:text-[#FB641B]">{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200/50 dark:bg-slate-800/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="h-full rounded-full bg-gradient-to-r from-[#2874F0] to-[#60A5FA] dark:from-[#FB641B] dark:to-orange-500"
        />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Today");

  const fetchStats = async (timeframe = activeFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/admin/management/dashboard/stats?timeframe=${timeframe.toLowerCase()}`);
      setStats(res?.data ?? res ?? null);
    } catch (_err) {
      setError("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchStats(activeFilter); 
  }, [activeFilter]);

  const trendData = stats?.trendData || [];

  const handleExport = () => {
    try {
      const exportData = [
        { Metric: "Total Revenue", Value: stats?.kpi?.totalRevenue ? `₹${stats.kpi.totalRevenue}` : "₹0.00" },
        { Metric: "Total Orders", Value: stats?.kpi?.totalOrders ?? 0 },
        { Metric: "Total Products", Value: stats?.kpi?.totalProducts ?? 0 },
        { Metric: "Total Customers", Value: stats?.kpi?.totalCustomers ?? 0 },
        { Metric: "Pending Approvals", Value: stats?.kpi?.pendingApprovals ?? 0 },
        { Metric: "Pending Tickets", Value: stats?.kpi?.pendingTickets ?? 0 },
      ];
      exportToCSV(exportData, "executive-dashboard-summary.csv");
    } catch (err) {
      console.error("Error exporting dashboard summary:", err);
    }
  };

  const kpis = stats?.kpi || {
    totalRevenue: 0, totalOrders: 0, totalProducts: 0,
    totalCustomers: 0, totalSellers: 0, totalStores: 0,
    pendingApprovals: 0, pendingTickets: 0, pendingRefunds: 0, failedTransactions: 0,
  };

  const insights = Array.isArray(stats?.insights) ? stats.insights : [
    { type: "warning", title: "Low Performing Sellers", message: "3 sellers in 'Groceries' fell below 3.5 ratings." },
    { type: "danger", title: "Fraud Detection Alerts", message: "PAN details flag in verification pipeline." },
    { type: "success", title: "Revenue Opportunities", message: "Wholesale bulk packaging in Gurugram shows demand growth." },
  ];

  const totalRevVal = Number(kpis?.totalRevenue ?? 0);
  const formattedRevenue = (totalRevVal / 100000).toFixed(2);

  const statCards = [
    { title: "Total Gross Revenue", value: `₹${formattedRevenue}L`, desc: "Cumulative sales volume", trend: "+12.4%", icon: DollarSign, color: "blue" },
    { title: "Marketplace Orders", value: kpis?.totalOrders ?? 1240, desc: "Total invoices processed", trend: "+8.2%", icon: ShoppingBag, color: "blue" },
    { title: "Pending Approvals", value: kpis?.pendingApprovals ?? 3, desc: "Sellers requiring audit", trend: "Action required", icon: Clock, color: "amber", isWarning: Number(kpis?.pendingApprovals ?? 0) > 0 },
    { title: "Pending Tickets", value: kpis?.pendingTickets ?? 12, desc: "Assigned helpdesk tickets", trend: "In Queue", icon: Ticket, color: "blue" },
    { title: "Platform Sellers", value: kpis?.totalSellers ?? 245, desc: "Registered storefront nodes", trend: "+4.6%", icon: Store, color: "blue" },
  ];

  return (
    <div className="flex min-h-screen font-sans selection:bg-orange-500 selection:text-white">
      <SEOHead title="Executive Command Center | Indiafy Admin" noindex={true} />
      <Sidebar />

      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto w-full space-y-6"
        >
          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-[#2874F0] dark:text-[#FB641B]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2874F0] dark:text-[#FB641B]">
                  Enterprise OS
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Command Center
              </h1>
              <p className="text-sm font-medium mt-1 text-slate-500 dark:text-slate-400">
                Real-time governance, transaction processing, and intelligence logs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                className="admin-btn-secondary p-3 flex items-center justify-center cursor-pointer"
                title="Refresh dashboard metrics"
              >
                <RefreshCw size={15} className={`${loading ? "animate-spin text-[#2874F0] dark:text-[#FB641B]" : ""}`} />
              </button>
              <button
                onClick={handleExport}
                className="admin-btn-primary px-5 py-3 text-xs flex items-center gap-2 cursor-pointer font-black"
              >
                <Download size={14} />
                <span>Export Audit Summary</span>
              </button>
            </div>
          </div>

          {/* ── KPI Stats Grid ── */}
          {loading && !stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 rounded-3xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {statCards.map((card, i) => (
                <StatCard
                  key={i}
                  title={card.title}
                  value={card.value}
                  desc={card.desc}
                  trend={card.trend}
                  icon={card.icon}
                  color={card.color}
                  isWarning={card.isWarning}
                />
              ))}
            </div>
          )}

          {/* ── Charts Row ── */}
          <AdminErrorBoundary title="Unable to load analytics charts">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

              {/* Revenue Chart Card */}
              <div className="xl:col-span-2 admin-card p-6 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                  <div>
                    <h2 className="font-extrabold text-lg text-slate-950 dark:text-white">Enterprise Sales BI</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Monthly GMV growth & commission analytics</p>
                  </div>
                  <div className="flex gap-2">
                    {["Today", "Weekly", "Monthly", "Yearly"].map((item) => (
                      <button key={item}
                        onClick={() => setActiveFilter(item)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          activeFilter === item
                            ? "bg-[#2874F0]/10 dark:bg-orange-500/10 text-[#2874F0] dark:text-[#FB641B] border border-[#2874F0]/25 dark:border-orange-500/25"
                            : "bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-900/50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-72 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2874F0" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2874F0" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" />
                      <XAxis dataKey="name" fontSize={10} stroke="#475569" tick={{ fill: "#64748B" }} />
                      <YAxis fontSize={10} stroke="#475569" tick={{ fill: "#64748B" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#2874F0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insights Card */}
              <div className="admin-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles size={16} className="text-[#2874F0] dark:text-[#FB641B]" />
                    <h2 className="font-extrabold text-lg text-[#2874F0] dark:text-[#FB641B]">AI Smart Insights</h2>
                  </div>

                  <div className="space-y-3.5">
                    {insights.map((ins, i) => (
                      <div key={i} className="flex gap-3.5 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                        <div className="mt-0.5 shrink-0">
                          {ins.type === "danger" ? <AlertTriangle className="text-red-500" size={15} />
                            : ins.type === "warning" ? <AlertTriangle className="text-amber-500" size={15} />
                            : <CheckCircle className="text-emerald-500" size={15} />}
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-350">{ins.title ?? "Insight"}</h4>
                          <p className="text-[11px] mt-1 leading-relaxed text-slate-500 dark:text-slate-450">{ins.message ?? ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/40">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#2874F0] dark:text-[#FB641B]">Live Agent Actions</p>
                  <div className="flex items-center justify-between text-xs text-slate-555 dark:text-slate-400">
                    <span>API Response Uptime</span>
                    <span className="font-bold text-[#2874F0] dark:text-[#FB641B]">99.98%</span>
                  </div>
                </div>
              </div>
            </div>
          </AdminErrorBoundary>

          {/* ── Transactions + Regional ── */}
          <AdminErrorBoundary title="Unable to load transaction records">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

              {/* Recent Transactions Card */}
              <div className="xl:col-span-2 admin-table-container p-6 overflow-x-auto">
                <h2 className="font-extrabold text-lg mb-5 text-slate-950 dark:text-white">
                  Recent Audited Transactions
                </h2>
                <table className="admin-table text-xs">
                  <thead>
                    <tr>
                      {["Transaction Reference", "Store", "Gross Total", "Payment Method", "Timestamp"].map((h, i) => (
                        <th key={h} className={`py-3 px-4 font-black uppercase tracking-wider text-[9px] ${i === 3 ? "text-center" : i === 4 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <TableRow id="#TX-9842" store="Luxe Attire" total="₹14,200" method="UPI" date="Today, 14:20" />
                    <TableRow id="#TX-9841" store="Gadget Galaxy" total="₹8,500" method="NetBanking" date="Today, 11:45" />
                    <TableRow id="#TX-9840" store="Daily Organics" total="₹4,300" method="UPI" date="Yesterday" />
                  </tbody>
                </table>
              </div>

              {/* Regional Performance Card */}
              <div className="admin-card p-6">
                <h2 className="font-extrabold text-lg mb-5 text-slate-950 dark:text-white">
                  Top Demand Sectors
                </h2>
                <div className="space-y-5">
                  <RegionProgress name="Bengaluru North B2B" pct={35} />
                  <RegionProgress name="Gurugram Cyber City" pct={28} />
                  <RegionProgress name="Mumbai Bandra Local" pct={21} />
                  <RegionProgress name="Delhi NCR Wholesale" pct={16} />
                </div>
              </div>
            </div>
          </AdminErrorBoundary>
        </motion.main>
      </div>
    </div>
  );
}
