import { useMemo, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

import { motion, AnimatePresence } from "framer-motion";
import { Download, IndianRupee, RotateCcw, Wallet, Eye, X } from "lucide-react";

import StatsCard from "../../components/admin/StatsCard";
import LineChartBox from "../../components/charts/LineChartBox";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { exportToCSV } from "../../utils/exportCSV";

/* ===================== DATA ===================== */

const payments = [
  {
    id: "PAY-001",
    customer: "Rahul Sharma",
    amount: 2499,
    method: "UPI",
    status: "Success",
    date: "2026-02-01",
  },
  {
    id: "PAY-002",
    customer: "Ayesha Khan",
    amount: 1499,
    method: "Card",
    status: "Pending",
    date: "2026-01-30",
  },
  {
    id: "PAY-003",
    customer: "Vikram Singh",
    amount: 3999,
    method: "COD",
    status: "Failed",
    date: "2026-01-20",
  },
];

const revenueData = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 61000 },
  { month: "Apr", revenue: 72000 },
];

const pieColors = ["#6366f1", "#22c55e", "#f97316"];

/* ===================== HELPERS ===================== */

function filterByDate(date, range) {
  if (range === "all") return true;
  const today = new Date();
  const target = new Date(date);
  const diff = (today - target) / (1000 * 60 * 60 * 24);
  return range === "7" ? diff <= 7 : diff <= 30;
}

function getPaymentMethodData(data) {
  if (!data.length) return [];
  const map = {};
  data.forEach((p) => {
    map[p.method] = (map[p.method] || 0) + 1;
  });
  return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
}

/* ===================== PAGE ===================== */

export default function Payments() {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  const [activePayment, setActivePayment] = useState(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.customer.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());

      const matchMethod = method === "all" || p.method === method;
      const matchStatus = status === "all" || p.status === status;
      const matchDate = filterByDate(p.date, range);

      return matchSearch && matchMethod && matchStatus && matchDate;
    });
  }, [search, method, status, range]);

  const pieData = getPaymentMethodData(filteredPayments);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Payments & Revenue
              </h1>
              <p className="text-gray-500">Track transactions & earnings</p>
            </div>

            <button
              onClick={() => exportToCSV(filteredPayments, "payments-report")}
              className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl w-full sm:w-auto"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
            <input
              className="border rounded-xl px-4 py-2 w-full sm:w-64"
              placeholder="Search payment / customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border rounded-xl px-4 py-2 w-full sm:w-auto"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="COD">COD</option>
            </select>

            <select
              className="border rounded-xl px-4 py-2 w-full sm:w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            <select
              className="border rounded-xl px-4 py-2 w-full sm:w-auto"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatsCard
              title="Total Revenue"
              value="₹79,240"
              accent="blue"
              icon={<IndianRupee size={16} />}
            />
            <StatsCard
              title="Refund Rate"
              value="2.1%"
              accent="green"
              icon={<RotateCcw size={16} />}
            />
            <StatsCard
              title="Net Earnings"
              value="₹65,180"
              accent="orange"
              icon={<Wallet size={16} />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2">
              <LineChartBox
                title="Revenue Trend"
                data={revenueData}
                xKey="month"
                yKey="revenue"
                height={280}
              />
            </div>

            <div className="bg-white border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Payment Methods</h3>

              {pieData.length ? (
                <ResponsiveContainer height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 mt-20">
                  No data available
                </p>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Payment ID</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-center">Amount</th>
                  <th className="p-4 text-center">Method</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-semibold">{p.id}</td>
                    <td className="p-4">{p.customer}</td>
                    <td className="p-4 text-center font-bold">₹{p.amount}</td>
                    <td className="p-4 text-center">{p.method}</td>
                    <td className="p-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setActivePayment(p)}
                        className="inline-flex items-center gap-1 font-semibold"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.main>
      </div>

      <AnimatePresence>
        {activePayment && (
          <PaymentModal
            payment={activePayment}
            onClose={() => setActivePayment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function StatusBadge({ status }) {
  const map = {
    Success: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Failed: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[status]}`}>
      {status}
    </span>
  );
}

function PaymentModal({ payment, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Payment Details</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <Detail label="Payment ID" value={payment.id} />
          <Detail label="Customer" value={payment.customer} />
          <Detail label="Amount" value={`₹${payment.amount}`} />
          <Detail label="Method" value={payment.method} />
          <Detail label="Status" value={payment.status} />
          <Detail label="Date" value={payment.date} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
