import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import StatsCard from "../../components/admin/StatsCard";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import LineChartBox from "../../components/charts/LineChartBox";
import BarChartBox from "../../components/charts/BarChartBox";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";

import {
  IndianRupee,
  ShoppingBag,
  Users,
  Percent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#22c55e", "#f97316", "#a855f7", "#3b82f6"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/dashboard/stats");
      setStats(res?.data ?? res ?? null);
    } catch (_err) {
      console.error("Error loading analytics stats:", _err);
      setError("Failed to load analytics metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const kpis = stats?.kpi || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalSellers: 0,
    totalStores: 0,
    pendingApprovals: 0,
    pendingTickets: 0,
    pendingRefunds: 0,
    failedTransactions: 0,
  };

  const revenueData = stats?.trendData || [];
  const categoryOrders = stats?.categoryOrders || [];
  const trafficData = stats?.paymentData || [];

  const totalCustomersVal = Number(kpis?.totalCustomers ?? 0);
  const totalOrdersVal = Number(kpis?.totalOrders ?? 0);
  const totalRevenueVal = Number(kpis?.totalRevenue ?? 0);

  const convRate = totalCustomersVal ? ((totalOrdersVal / totalCustomersVal) * 100).toFixed(1) + "%" : "0.0%";

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        <Header />

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Analytics & Business Intelligence
                </h1>
                <p className="text-slate-550 dark:text-slate-400 mt-1 text-xs md:text-sm font-medium">
                  Track performance, revenue trends, and traffic distribution metrics.
                </p>
              </div>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="admin-btn-secondary px-4 py-2 text-xs cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {/* Stats Wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load analytics statistics">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Revenue"
                  accent="blue"
                  value={`₹${totalRevenueVal.toLocaleString('en-IN')}`}
                  badge="+12.4%"
                  icon={<IndianRupee size={16} />}
                />
                <StatsCard
                  title="Total Orders"
                  accent="orange"
                  value={totalOrdersVal.toLocaleString('en-IN')}
                  badge="+6.2%"
                  icon={<ShoppingBag size={16} />}
                />
                <StatsCard
                  title="Customers"
                  accent="yellow"
                  value={totalCustomersVal.toLocaleString('en-IN')}
                  badge="+3.1%"
                  icon={<Users size={16} />}
                />
                <StatsCard
                  title="Conversion Rate"
                  accent="green"
                  value={convRate}
                  badge="-0.4%"
                  icon={<Percent size={16} />}
                />
              </div>
            </AdminErrorBoundary>

            {/* Charts Wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load intelligence charts">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                <LineChartBox
                  title="Revenue Trend"
                  data={revenueData}
                  xKey="name"
                  yKey="revenue"
                  height={260}
                />
                <BarChartBox
                  title="Orders by Category"
                  data={categoryOrders}
                  xKey="name"
                  yKey="orders"
                  height={260}
                />
              </div>
            </AdminErrorBoundary>

            {/* Traffic + Calendar Wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load traffic sources and calendar">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-xs">
                  <h2 className="font-extrabold text-slate-800 text-sm mb-4">Payment Distribution</h2>
                  <div className="h-[240px] md:h-[260px]">
                    {trafficData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                        <PieChart>
                          <Pie
                            data={trafficData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {trafficData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                        No transactions registered yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Calendar */}
                <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-extrabold text-slate-800 text-sm">
                      {currentDate.toLocaleString("default", { month: "long" })}{" "}
                      {year}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={prevMonth}
                        className="p-2 border rounded-xl hover:bg-slate-50 transition"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-2 border rounded-xl hover:bg-slate-50 transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2">
                    {weekDays.map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const isToday =
                        day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();
                      return (
                        <div
                          key={day}
                          className={`p-2.5 rounded-xl font-bold transition ${
                            isToday ? "bg-slate-900 text-white shadow-xs" : "hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </AdminErrorBoundary>

          </div>
        </main>
      </div>
    </div>
  );
}
