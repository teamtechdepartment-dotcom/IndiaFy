import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import ProductTable from "../../components/admin/ProductTable";
import ProductMediaSection from "../../components/admin/ProductMediaSection";
import StatsCard from "../../components/admin/StatsCard";

// Charts
import LineChartBox from "../../components/charts/LineChartBox";
import BarChartBox from "../../components/charts/BarChartBox";

import {
  IndianRupee,
  PackageX,
  Sparkles,
  CheckCircle2,
  Download,
} from "lucide-react";

/*  Revenue Graph Data */
const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 28000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 22000 },
  { month: "May", revenue: 16000 },
  { month: "Jun", revenue: 30000 },
  { month: "Jul", revenue: 28000 },
  { month: "Aug", revenue: 25000 },
  { month: "Sep", revenue: 40000 },
  { month: "Oct", revenue: 15000 },
  { month: "Nov", revenue: 50000 },
  { month: "Dec", revenue: 40000 },
];

/*   Category-wise Sales  */
const categorySales = [
  { category: "Men", sales: 42000 },
  { category: "Women", sales: 28000 },
  { category: "Boy", sales: 19000 },
  { category: "Girls", sales: 52000 },
  { category: "Accessories", sales: 20000 },
];

export default function ProductManagement() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        if (window.scrollY === 0) {
          setShowSidebar(true);
        } else {
          setShowSidebar(false);
        }
      } else {
        setShowSidebar(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /*   Dummy Product Data   */
  const products = [
    {
      name: "Classic Linen Shirt",
      category: "Bottom Wear",
      price: 1899,
      stock: 45,
    },
    {
      name: "Indigo Denim Jacket",
      category: "Outerwear",
      price: 4999,
      stock: 30,
    },
    {
      name: "Embroidered Kurta",
      category: "Ethnic Wear",
      price: 2999,
      stock: 0,
    },
  ];

  /*   CSV Export   */
  const exportCSV = () => {
    const headers = ["Name", "Category", "Price", "Stock"];
    const rows = products.map((p) =>
      [p.name, p.category, p.price, p.stock].join(","),
    );

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "products.csv";
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      {/* Sidebar */}
      <div
        className={`
          fixed md:static
          z-40
          transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        <Header />

        <main
          className="
            flex-1
            px-4 sm:px-6 lg:px-10
            py-4 sm:py-8
            w-full
            max-w-[1400px]
            mx-auto
          "
        >
          {/* Page Header */}
          <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
                Product Management
              </h1>
              <p className="text-gray-500 mt-1 text-xs sm:text-base">
                Manage your clothing brand products & inventory
              </p>
            </div>

            <button
              onClick={exportCSV}
              className="
                flex items-center justify-center gap-2
                bg-black text-white
                px-4 sm:px-5 py-2.5 sm:py-3
                rounded-xl
                hover:opacity-90
                transition
                w-full md:w-auto
                text-sm sm:text-base
              "
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div
              onClick={() => setActiveFilter("ALL")}
              className="cursor-pointer"
            >
              <StatsCard
                title="Total Sales"
                value="₹12,400"
                badge="+4.2%"
                badgeType="up"
                accent="green"
                icon={<IndianRupee size={16} />}
              />
            </div>

            <div
              onClick={() => setActiveFilter("OUT_OF_STOCK")}
              className="cursor-pointer"
            >
              <StatsCard
                title="Out of Stock"
                value="12"
                badge="-1.3%"
                badgeType="down"
                accent="yellow"
                icon={<PackageX size={16} />}
              />
            </div>

            <div
              onClick={() => setActiveFilter("NEW")}
              className="cursor-pointer"
            >
              <StatsCard
                title="New Arrivals"
                value="45"
                badge="+6.8%"
                badgeType="up"
                accent="blue"
                icon={<Sparkles size={16} />}
              />
            </div>

            <div
              onClick={() => setActiveFilter("LIVE")}
              className="cursor-pointer"
            >
              <StatsCard
                title="Live Products"
                value="98%"
                badge="+0.9%"
                badgeType="up"
                accent="orange"
                icon={<CheckCircle2 size={16} />}
              />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <LineChartBox
              title="Monthly Revenue"
              data={revenueData}
              xKey="month"
              yKey="revenue"
            />

            <BarChartBox
              title="Category-wise Sales"
              data={categorySales}
              xKey="category"
              yKey="sales"
            />
          </div>

          {/* Product Table   */}
          <div className="w-full overflow-x-auto md:overflow-visible">
            <div className="w-full md:min-w-0">
              <ProductTable filter={activeFilter} />
            </div>
          </div>

          {/* Media Section */}
          <div className="mt-8 sm:mt-12">
            <ProductMediaSection />
          </div>
        </main>
      </div>
    </div>
  );
}
