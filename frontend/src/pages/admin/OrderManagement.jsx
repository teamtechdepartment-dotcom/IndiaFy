import Sidebar from "../../components/admin/Sidebar";
import { Download, Plus } from "lucide-react";
import OrderTable from "../../components/admin/OrderTable";
import { motion } from "framer-motion";
import StatsCard from "../../components/admin/StatsCard";
import { exportToCSV } from "../../utils/exportCSV";
import { useNavigate } from "react-router-dom";
import Header from "../../components/admin/Header";
import { Package, Clock, Truck, CheckCircle } from "lucide-react";

export default function OrderManagement() {
  const navigate = useNavigate();

  // ✅ orders data
  const ordersData = [
    {
      orderId: "GR-2045",
      customer: "Akhil Verma",
      date: "12 Oct 2025",
      payment: "PAID",
      status: "Shipped",
      amount: 4299,
    },
    {
      orderId: "GR-2044",
      customer: "Ashiwad Kumar",
      date: "11 Oct 2025",
      payment: "COD",
      status: "Processing",
      amount: 1850,
    },
  ];

  return (
    <div className="flex bg-background-light min-h-screen flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="
            flex-1
            px-3 sm:px-6 lg:px-8
            py-4 sm:py-8
            max-w-[1400px]
            mx-auto
            w-full
          "
        >
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black mb-1">
                Order Management
              </h1>
              <p className="text-gray-500 text-xs sm:text-base">
                Track & manage customer orders
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => exportToCSV(ordersData, "orders.csv")}
                className="
                  flex items-center justify-center gap-2
                  bg-white border
                  px-4 sm:px-5 py-2.5 sm:py-3
                  rounded-xl
                  hover:shadow transition
                  w-full sm:w-auto
                  text-sm sm:text-base
                "
              >
                <Download size={18} />
                Export CSV
              </button>

              <button
                onClick={() => navigate("/admin/orders/create")}
                className="
                  flex items-center justify-center gap-2
                  bg-black text-white
                  px-4 sm:px-5 py-2.5 sm:py-3
                  rounded-xl
                  hover:opacity-90 transition
                  w-full sm:w-auto
                  text-sm sm:text-base
                "
              >
                <Plus size={18} />
                Create Order
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <StatsCard
              title="New orders"
              value="12"
              badge="-2.6%"
              badgeType="down"
              accent="blue"
              icon={<Package size={16} />}
            />

            <StatsCard
              title="Await accepting orders"
              value="20"
              badge="+2.6%"
              badgeType="up"
              accent="orange"
              icon={<Clock size={16} />}
            />

            <StatsCard
              title="On way orders"
              value="57"
              badge="-0.6%"
              badgeType="down"
              accent="yellow"
              icon={<Truck size={16} />}
            />

            <StatsCard
              title="Delivered orders"
              value="98"
              badge="+2.8%"
              badgeType="up"
              accent="green"
              icon={<CheckCircle size={16} />}
            />
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="min-h-screen flex overflow-x-hidden">
              <OrderTable />
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
