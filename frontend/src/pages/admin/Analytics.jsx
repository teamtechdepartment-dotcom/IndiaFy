import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import StatsCard from "../../components/admin/StatsCard";
import LineChartBox from "../../components/charts/LineChartBox";
import BarChartBox from "../../components/charts/BarChartBox";
import Header from "../../components/admin/Header";

import {
  IndianRupee,
  ShoppingBag,
  Users,
  Percent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ================= DATA ================= */

const revenueData = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 68000 },
  { month: "Mar", revenue: 45000 },
  { month: "Apr", revenue: 22000 },
  { month: "May", revenue: 61000 },
  { month: "Jun", revenue: 68000 },
  { month: "Jul", revenue: 72000 },
  { month: "Aug", revenue: 38000 },
  { month: "Sep", revenue: 85000 },
  { month: "Oct", revenue: 40000 },
  { month: "Nov", revenue: 95000 },
  { month: "Dec", revenue: 110000 },
];

const categoryOrders = [
  { name: "Men", orders: 320 },
  { name: "Women", orders: 280 },
  { name: "Boys", orders: 190 },
  { name: "Girls", orders: 140 },
];

const trafficData = [
  { name: "Website", value: 55 },
  { name: "Instagram", value: 25 },
  { name: "Facebook", value: 12 },
  { name: "Others", value: 8 },
];

const COLORS = ["#2563eb", "#22c55e", "#f97316", "#a855f7"];

const exportCSV = () => alert("CSV Exported (demo)");
const downloadReport = () => alert("Report Downloaded (demo)");

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Analytics() {
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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        {/* 🔹 mobile padding fix */}
        <main className="flex-1 px-4 md:px-10 py-6 md:py-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900">
              Analytics
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Track performance & business insights
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 md:mb-10">
            <StatsCard
              title="Total Revenue"
              accent="blue"
              value="₹3,64,000"
              badge="+12.4%"
              icon={<IndianRupee size={16} />}
            />
            <StatsCard
              title="Total Orders"
              accent="orange"
              value="1,284"
              badge="+6.2%"
              icon={<ShoppingBag size={16} />}
            />
            <StatsCard
              title="Customers"
              accent="yellow"
              value="12,480"
              badge="+3.1%"
              icon={<Users size={16} />}
            />
            <StatsCard
              title="Conversion Rate"
              accent="green"
              value="3.6%"
              badge="-0.4%"
              icon={<Percent size={16} />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
            <LineChartBox
              title="Revenue Trend"
              data={revenueData}
              xKey="month"
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

          {/* Traffic + Calendar */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
            <div className="bg-white border rounded-2xl p-5 md:p-6">
              <h2 className="font-bold mb-4">Traffic Sources</h2>
              <div className="h-[240px] md:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficData}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={90}
                    >
                      {trafficData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border rounded-2xl p-5 md:p-6">
              <h2 className="font-bold mb-4">Calendar Snapshot</h2>

              <div className="border rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <ChevronLeft onClick={prevMonth} className="cursor-pointer" />
                  <span className="font-semibold text-sm md:text-base">
                    {currentDate.toLocaleString("default", { month: "long" })}{" "}
                    {year}
                  </span>
                  <ChevronRight
                    onClick={nextMonth}
                    className="cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-7 text-xs text-gray-500 mb-2">
                  {weekDays.map((d) => (
                    <div key={d} className="text-center">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2 text-xs md:text-sm">
                  {[...Array(firstDay)].map((_, i) => (
                    <div key={i} />
                  ))}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const isToday =
                      day === today.getDate() &&
                      month === today.getMonth() &&
                      year === today.getFullYear();

                    return (
                      <div
                        key={day}
                        className={`h-8 md:h-9 flex items-center justify-center rounded-lg
                          ${isToday ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-100"}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-4">
                  <span>Total Orders Today</span>
                  <span className="font-semibold text-gray-900">124</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white border rounded-2xl p-5 md:p-6 mb-8 md:mb-12">
            <h2 className="font-bold mb-6">Conversion Funnel</h2>
            {[
              ["Visitors", "12,000"],
              ["Product Views", "6,200"],
              ["Add to Cart", "2,400"],
              ["Checkout", "1,560"],
              ["Orders", "1,284"],
            ].map(([l, v], i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{l}</span>
                  <b>{v}</b>
                </div>
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
                  style={{ width: `${100 - i * 15}%` }}
                />
              </div>
            ))}
          </div>

          {/* Top Products */}
          <div className="bg-white border rounded-2xl p-5 md:p-6 mb-8 md:mb-12">
            <h2 className="font-bold mb-6">Top Products</h2>
            <div className="space-y-4">
              <ProductRow name="Silk Saree" orders={420} stock={12} best />
              <ProductRow name="Denim Jacket" orders={310} stock={64} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={exportCSV}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm"
            >
              Export CSV
            </button>
            <button
              onClick={downloadReport}
              className="px-6 py-2.5 border rounded-lg text-sm"
            >
              Download Report
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function ProductRow({ name, orders, stock, best }) {
  return (
    <div className="flex justify-between items-center px-4 md:px-5 py-4 border rounded-lg hover:bg-gray-50">
      <div>
        <p className="font-medium text-sm md:text-base">
          {name} {best && "⭐"}
        </p>
        <p className="text-xs text-gray-500">{orders} orders</p>
      </div>
      <span
        className={`text-sm font-semibold ${stock < 20 ? "text-red-600" : "text-gray-700"}`}
      >
        {stock} in stock
      </span>
    </div>
  );
}
