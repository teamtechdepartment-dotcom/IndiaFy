import { useState, useEffect } from "react";
import SEOHead from "../../components/seo/SEOHead";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { Download, Activity, TrendingUp, AlertTriangle, ShieldCheck, HelpCircle, ArrowUpRight, CheckCircle, Flame, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import axiosInstance from "../../utils/axiosInstance";
import { exportToCSV } from "../../utils/exportCSV";

// Premium themed BI dummy trends
const trendData = [
  { name: "Jan", sales: 4000, revenue: 24000, growth: 2400 },
  { name: "Feb", sales: 3000, revenue: 18000, growth: 2210 },
  { name: "Mar", sales: 5000, revenue: 26000, growth: 2290 },
  { name: "Apr", sales: 6000, revenue: 30000, growth: 2000 },
  { name: "May", sales: 8000, revenue: 45000, growth: 2181 },
  { name: "Jun", sales: 12000, revenue: 78000, growth: 2500 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Today");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/management/dashboard/stats");
        setStats(res.data || res);
      } catch (err) {
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExport = () => {
    const exportData = [
      { Metric: "Total Revenue", Value: stats?.kpi?.totalRevenue || "₹14.82L" },
      { Metric: "Total Orders", Value: stats?.kpi?.totalOrders || 1240 },
      { Metric: "Total Products", Value: stats?.kpi?.totalProducts || 562 },
      { Metric: "Total Customers", Value: stats?.kpi?.totalCustomers || 12480 },
      { Metric: "Pending Approvals", Value: stats?.kpi?.pendingApprovals || 3 },
      { Metric: "Pending Tickets", Value: stats?.kpi?.pendingTickets || 12 },
    ];
    exportToCSV(exportData, "executive-dashboard-summary.csv");
  };

  const kpis = stats?.kpi || {
    totalRevenue: 1482000,
    totalOrders: 1240,
    totalProducts: 562,
    totalCustomers: 12480,
    totalSellers: 245,
    totalStores: 189,
    pendingApprovals: 3,
    pendingTickets: 12,
    pendingRefunds: 4,
    failedTransactions: 2,
  };

  const insights = stats?.insights || [
    { type: "warning", title: "Low Performing Sellers", message: "3 sellers in 'Groceries' fell below 3.5 ratings." },
    { type: "danger", title: "Fraud Detection Alerts", message: "PAN details flag in verification pipeline." },
    { type: "success", title: "Revenue Opportunities", message: "Wholesale bulk packaging in Gurugram shows demand growth." },
  ];

  return (
    <div className="flex min-h-screen bg-hero-gradient text-slate-800 font-sans selection:bg-[#10B981] selection:text-white relative overflow-hidden">
      <SEOHead title="Executive Command Center | Indiafy Admin" noindex={true} />
      <Sidebar />

      {/* Decorative Blur Blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/30 to-teal-100/10 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/20 to-indigo-100/5 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />

      <div className="flex-1 flex flex-col w-full overflow-x-hidden relative z-10">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 px-4 sm:px-8 py-6 max-w-[1600px] mx-auto w-full space-y-8"
        >
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Command Center
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Real-time governance, transaction processing, and intelligence logs.
              </p>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 border border-[#10B981]/25
              px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-200 active:scale-98 sm:w-auto w-full"
            >
              <Download size={16} className="text-[#10B981]" />
              Export Summary
            </button>
          </div>

          {/* Quick Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            <MetricCard
              title="Total Gross Revenue"
              value={`₹${(kpis.totalRevenue / 100000).toFixed(2)}L`}
              desc="Cumulative sales volume"
              trend="+12.4%"
              color="emerald"
            />
            <MetricCard
              title="Marketplace Orders"
              value={kpis.totalOrders}
              desc="Total invoices processed"
              trend="+8.2%"
              color="emerald"
            />
            <MetricCard
              title="Pending Approvals"
              value={kpis.pendingApprovals}
              desc="Sellers requiring audit"
              trend="Action required"
              color="amber"
              isWarning={kpis.pendingApprovals > 0}
            />
            <MetricCard
              title="Pending Tickets"
              value={kpis.pendingTickets}
              desc="Assigned helpdesk tickets"
              trend="In Queue"
              color="blue"
            />
            <MetricCard
              title="Platform Sellers"
              value={kpis.totalSellers}
              desc="Registered storefront nodes"
              trend="+4.6%"
              color="emerald"
            />
          </div>

          {/* Live System Health & BI Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Chart */}
            <div className="xl:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-md flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-extrabold text-slate-800 text-base sm:text-lg">
                    Enterprise Sales BI
                  </h2>
                  <p className="text-xs text-slate-400">Monthly GMV growth & commission analytics</p>
                </div>
                <div className="flex gap-2">
                  {["Today", "Weekly", "Monthly", "Yearly"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setActiveFilter(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeFilter === item
                          ? "bg-[#0F172A] text-[#10B981] border border-[#10B981]/20"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-655"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                    <YAxis fontSize={11} stroke="#94A3B8" />
                    <Tooltip contentStyle={{ background: "#0F172A", borderColor: "#10B981", borderRadius: "12px", color: "#fff" }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Smart Insights & Monitoring */}
            <div className="bg-[#0F172A] text-white border border-[#10B981]/25 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-[#10B981]" />
                  <h2 className="font-extrabold text-[#10B981] text-base sm:text-lg">
                    AI Smart Insights
                  </h2>
                </div>

                <div className="space-y-4">
                  {insights.map((ins, i) => (
                    <div key={i} className="flex gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/10 transition-all duration-200">
                      <div className="mt-0.5">
                        {ins.type === "danger" ? (
                          <AlertTriangle className="text-red-400" size={16} />
                        ) : ins.type === "warning" ? (
                          <AlertTriangle className="text-amber-400" size={16} />
                        ) : (
                          <CheckCircle className="text-emerald-400" size={16} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-200">{ins.title}</h4>
                        <p className="text-xs text-gray-405 mt-0.5">{ins.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] mb-2">Live Agent Actions</p>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>API Response Uptime</span>
                  <span className="font-bold text-[#10B981]">99.98%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Regional Demands & Recent Invoices list */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Recent orders */}
            <div className="xl:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-md overflow-x-auto">
              <h2 className="font-extrabold text-slate-800 text-base sm:text-lg mb-4">
                Recent Audited Transactions
              </h2>
              <table className="w-full min-w-[600px] text-xs">
                <thead className="bg-slate-50 border-b text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 text-left font-bold">Transaction Reference</th>
                    <th className="py-3 px-4 text-left font-bold">Store</th>
                    <th className="py-3 px-4 text-left font-bold">Gross Total</th>
                    <th className="py-3 px-4 text-center font-bold">Payment Method</th>
                    <th className="py-3 px-4 text-right font-bold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <TableRow id="#TX-9842" store="Luxe Attire" total="₹14,200" method="UPI" date="Today, 14:20" />
                  <TableRow id="#TX-9841" store="Gadget Galaxy" total="₹8,500" method="NetBanking" date="Today, 11:45" />
                  <TableRow id="#TX-9840" store="Daily Organics" total="₹4,300" method="UPI" date="Yesterday" />
                </tbody>
              </table>
            </div>

            {/* Regional Performance Progress */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 shadow-md">
              <h2 className="font-extrabold text-slate-800 text-base sm:text-lg mb-5">
                Top Demand Sectors
              </h2>
              <div className="space-y-4">
                <RegionProgress name="Bengaluru North B2B" pct={35} />
                <RegionProgress name="Gurugram Cyber City" pct={28} />
                <RegionProgress name="Mumbai Bandra Local" pct={21} />
                <RegionProgress name="Delhi NCR Wholesale" pct={16} />
              </div>
            </div>

          </div>
        </motion.main>
      </div>
    </div>
  );
}

function MetricCard({ title, value, desc, trend, color, isWarning = false }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:border-[#10B981]/35">
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">{title}</p>
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">{desc}</span>
        <span className={`text-[10px] font-black px-2 py-1 rounded-md ${isWarning ? "bg-red-50 text-red-600 animate-pulse" : "bg-emerald-50 text-[#10B981]"}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function TableRow({ id, store, total, method, date }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="py-4 px-4 font-bold text-[#10B981]">{id}</td>
      <td className="py-4 px-4 font-medium text-slate-800">{store}</td>
      <td className="py-4 px-4 font-black text-slate-900">{total}</td>
      <td className="py-4 px-4 text-center">
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold rounded-md text-[10px]">
          {method}
        </span>
      </td>
      <td className="py-4 px-4 text-right text-slate-400">{date}</td>
    </tr>
  );
}

function RegionProgress({ name, pct }) {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex justify-between font-bold text-slate-700">
        <span>{name}</span>
        <span className="text-[#10B981]">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-[#10B981]" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
