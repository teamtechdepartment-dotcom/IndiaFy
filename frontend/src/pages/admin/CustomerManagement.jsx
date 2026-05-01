import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import CustomerTable from "../../components/admin/CustomerTable";
import CustomerDetail from "../../components/admin/CustomerDetail";
import StatsCard from "../../components/admin/StatsCard";
import { exportToCSV } from "../../utils/exportCSV";
import Header from "../../components/admin/Header";

import {
  Download,
  UserPlus,
  Users,
  UserCheck,
  Repeat,
  UserX,
} from "lucide-react";

export default function CustomerManagement() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();

  // ✅ Dummy customer data (CSV ke liye)
  const customersData = [
    {
      name: "Rohan Verma",
      email: "rohan.v@example.com",
      orders: 14,
      spend: 24500,
      status: "Active",
    },
    {
      name: "Ananya Kapoor",
      email: "ananya.k@gmail.com",
      orders: 8,
      spend: 12840,
      status: "Active",
    },
    {
      name: "Siddharth Mehta",
      email: "sid.mehta@outlook.com",
      orders: 1,
      spend: 4200,
      status: "Inactive",
    },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main
          className="
            flex-1
            px-4 sm:px-6 lg:px-10
            py-6 sm:py-8
            max-w-[1600px]
            mx-auto
            w-full
          "
        >
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
                Customer Directory
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Manage and analyze your customer base
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Export CSV */}
              <button
                onClick={() => exportToCSV(customersData, "customers.csv")}
                className="
                  flex items-center justify-center gap-2
                  bg-white border border-gray-200
                  px-5 py-3
                  rounded-xl
                  hover:shadow-sm transition
                  w-full sm:w-auto
                "
              >
                <Download size={18} />
                Export CSV
              </button>

              {/* Add Customer */}
              <button
                onClick={() => navigate("/admin/customers/create")}
                className="
                  flex items-center justify-center gap-2
                  bg-black text-white
                  px-5 py-3
                  rounded-xl
                  hover:opacity-90 transition
                  w-full sm:w-auto
                "
              >
                <UserPlus size={18} />
                Add Customer
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <StatsCard
              title="Total Customers"
              value="12,480"
              badge="+3.2%"
              badgeType="up"
              accent="blue"
              icon={<Users size={16} />}
            />
            <StatsCard
              title="New This Month"
              value="840"
              badge="+8.6%"
              badgeType="up"
              accent="green"
              icon={<UserCheck size={16} />}
            />
            <StatsCard
              title="Repeat Customers"
              value="4,215"
              badge="+1.4%"
              badgeType="up"
              accent="orange"
              icon={<Repeat size={16} />}
            />
            <StatsCard
              title="Inactive"
              value="1,102"
              badge="-2.1%"
              badgeType="down"
              accent="yellow"
              icon={<UserX size={16} />}
            />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 overflow-x-auto">
              <CustomerTable onSelect={setSelectedCustomer} />
            </div>

            <div className="xl:block">
              <CustomerDetail customer={selectedCustomer} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
