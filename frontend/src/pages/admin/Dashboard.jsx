import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import StatsCard from "../../components/admin/StatsCard";
import LineChartBox from "../../components/charts/LineChartBox";
import { exportToCSV } from "../../utils/exportCSV";

/*   Dummy Data  */

const revenueData = [
  { week: "Week 1", value: 22000 },
  { week: "Week 2", value: 18000 },
  { week: "Week 3", value: 26000 },
  { week: "Week 4", value: 30000 },
];

const orders = [
  {
    id: "#GR-9842",
    customer: "Isha Singhania",
    product: "Chanderi Silk Saree Set",
    value: "₹14,200",
    status: "Delivered",
    date: "Today, 14:20",
  },
  {
    id: "#GR-9841",
    customer: "Kabir Malhotra",
    product: "Hand-Embroidered Kurta",
    value: "₹8,500",
    status: "Processing",
    date: "Today, 11:45",
  },
];

const stats = {
  Today: [
    {
      title: "TOTAL REVENUE",
      value: "₹48,000",
      badge: "+4.2%",
      accent: "blue",
    },
    { title: "TOTAL ORDERS", value: "124", badge: "+2.1%", accent: "green" },
    {
      title: "CONVERSION RATE",
      value: "2.8%",
      badge: "+0.3%",
      accent: "orange",
    },
    {
      title: "AVG ORDER VALUE",
      value: "₹3,920",
      badge: "-1.2%",
      accent: "yellow",
    },
  ],
  Weekly: [
    {
      title: "TOTAL REVENUE",
      value: "₹3,20,000",
      badge: "+6.4%",
      accent: "blue",
    },
    { title: "TOTAL ORDERS", value: "820", badge: "+4.8%", accent: "green" },
    {
      title: "CONVERSION RATE",
      value: "3.1%",
      badge: "+0.6%",
      accent: "orange",
    },
    {
      title: "AVG ORDER VALUE",
      value: "₹5,120",
      badge: "+1.1%",
      accent: "yellow",
    },
  ],
  Monthly: [
    {
      title: "TOTAL REVENUE",
      value: "₹12,40,000",
      badge: "+12.5%",
      accent: "blue",
    },
    { title: "TOTAL ORDERS", value: "1,840", badge: "+8.2%", accent: "green" },
    {
      title: "CONVERSION RATE",
      value: "3.24%",
      badge: "+0.5%",
      accent: "orange",
    },
    {
      title: "AVG ORDER VALUE",
      value: "₹6,739",
      badge: "-2.1%",
      accent: "yellow",
    },
  ],
  Yearly: [
    {
      title: "TOTAL REVENUE",
      value: "₹1.48 Cr",
      badge: "+22%",
      accent: "blue",
    },
    { title: "TOTAL ORDERS", value: "21,480", badge: "+18%", accent: "green" },
    {
      title: "CONVERSION RATE",
      value: "3.9%",
      badge: "+1.1%",
      accent: "orange",
    },
    {
      title: "AVG ORDER VALUE",
      value: "₹7,420",
      badge: "+3.4%",
      accent: "yellow",
    },
  ],
};

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("Today");

  return (
    <div className="flex min-h-screen bg-background-light">
      {/* Simple Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col w-full">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[1500px] mx-auto w-full"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black">
              Dashboard Overview
            </h1>

            <button
              onClick={() => exportToCSV(orders, "dashboard-orders.csv")}
              className="flex items-center justify-center gap-2 bg-black text-white
              px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl hover:bg-gray-900 transition
              w-full sm:w-auto text-sm sm:text-base"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {["Today", "Weekly", "Monthly", "Yearly"].map((item) => (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  activeFilter === item
                    ? "bg-black text-white"
                    : "bg-white border hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {stats[activeFilter].map((card, i) => (
              <StatsCard
                key={i}
                title={card.title}
                value={card.value}
                badge={card.badge}
                accent={card.accent}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="xl:col-span-2">
              <LineChartBox
                title="Revenue Growth"
                data={revenueData}
                xKey="week"
                yKey="value"
              />
            </div>

            <div className="bg-white border rounded-2xl p-4 sm:p-6">
              <h2 className="font-bold mb-4 text-sm sm:text-base">
                Regional Demand
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <Region name="Bengaluru" value={32} />
                <Region name="Mumbai" value={28} />
                <Region name="Delhi" value={21} />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <h2 className="font-bold mb-4 text-sm sm:text-base">
              Recent High-Value Orders
            </h2>

            <table className="min-w-[700px] w-full text-xs sm:text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="text-left pb-3 font-semibold">Order ID</th>
                  <th className="text-left pb-3 font-semibold">Customer</th>
                  <th className="text-left pb-3 font-semibold">Product</th>
                  <th className="text-center pb-3 font-semibold">Value</th>
                  <th className="text-center pb-3 font-semibold">Status</th>
                  <th className="text-center pb-3 font-semibold">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={i}
                    className={`border-b last:border-none transition
                      ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}
                      hover:bg-slate-100`}
                  >
                    <td className="py-4 text-blue-600 font-semibold text-left">
                      {o.id}
                    </td>
                    <td className="py-4 text-left font-medium">{o.customer}</td>
                    <td className="py-4 text-left text-gray-700 whitespace-nowrap">
                      {o.product}
                    </td>
                    <td className="py-4 text-center font-semibold">
                      {o.value}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          o.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 text-center whitespace-nowrap text-gray-600">
                      {o.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

function Region({ name, value }) {
  return (
    <div>
      <div className="flex justify-between mb-1 text-xs sm:text-sm">
        <span>{name}</span>
        <span>{value}%</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
