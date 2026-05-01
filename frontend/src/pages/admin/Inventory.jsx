import { useState } from "react";
import { Download, Plus, Heart, AlertTriangle } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { exportToCSV } from "../../utils/exportCSV";
import StatsCard from "../../components/admin/StatsCard";
import LineChartBox from "../../components/charts/LineChartBox";

export default function Inventory() {
  const [filter, setFilter] = useState("all");

  const variantChartData = [
    { name: "Onyx / M", value: 42 },
    { name: "Champagne / M", value: 31 },
    { name: "Slate / M", value: 14 },
  ];

  const historyLogs = [
    {
      id: 1,
      variant: "Onyx / M",
      change: "+20",
      reason: "Restock",
      by: "Admin",
      date: "01 Feb 2026 • 10:42 AM",
    },
    {
      id: 2,
      variant: "Slate / S",
      change: "-8",
      reason: "Damaged",
      by: "Warehouse",
      date: "31 Jan 2026 • 06:10 PM",
    },
    {
      id: 3,
      variant: "Champagne / L",
      change: "-5",
      reason: "Manual Correction",
      by: "Admin",
      date: "30 Jan 2026 • 02:25 PM",
    },
  ];

  const inventoryCSVData = [
    { color: "Onyx Black", XS: 12, S: "Low - 3 days", M: 42, L: 18, XL: "Out" },
    { color: "Champagne", XS: "Low", S: 22, M: 31, L: 18, XL: "Low" },
    { color: "Slate Grey", XS: 11, S: "Out", M: 14, L: "Urgent", XL: 20 },
  ];

  const handleExport = () => {
    exportToCSV(inventoryCSVData, "inventory-data.csv");
  };

  const [matrixData, setMatrixData] = useState([
    { color: "Onyx Black", sizes: ["12", "Low", "42", "18", "Out"] },
    { color: "Champagne", sizes: ["Low", "22", "31", "18", "Low"] },
    { color: "Slate Grey", sizes: ["11", "Out", "14", "Urgent", "20"] },
  ]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="px-4 py-5 sm:px-6 md:px-8 lg:px-10">
          {/* Breadcrumb */}
          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            Catalog / Ready-to-wear /{" "}
            <span className="text-gray-900 font-medium">
              Silk Oversized Blazer
            </span>
          </p>

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
            <div className="flex gap-4 items-start">
              <img
                src="../../assets/products/women/Jaket1.webp"
                alt="Product"
                className="w-16 h-20 sm:w-20 sm:h-24 md:w-28 md:h-32 object-cover rounded-xl border"
              />

              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
                  Silk Oversized Blazer
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  SKU: BLAZ-SILK-001 • Total Stock: 1,240 units
                </p>
                <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2 border rounded-xl text-sm bg-white hover:bg-gray-50 w-full sm:w-auto"
              >
                <Download size={16} />
                Export Data
              </button>

              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 w-full sm:w-auto">
                <Plus size={16} />
                New Variant
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex justify-end mb-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-xl px-4 py-2 text-sm w-full sm:w-56"
            >
              <option value="all">All</option>
              <option value="sales">Sales</option>
              <option value="velocity">Velocity</option>
              <option value="health">Stock Health</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {(filter === "all" || filter === "sales") && (
              <StatsCard
                title="Top Selling Variant"
                accent="blue"
                value="Champagne / M"
                badge="+12%"
              />
            )}
            {(filter === "all" || filter === "velocity") && (
              <StatsCard
                title="Avg. Daily Velocity"
                accent="yellow"
                value="42 units/day"
                badge="+5%"
              />
            )}
            {(filter === "all" || filter === "health") && (
              <StatsCard
                title="Stock Health"
                accent="orange"
                value="94%"
                badge="-2%"
                icon={<Heart size={16} />}
              />
            )}
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
            {/* INVENTORY MATRIX */}
            <div className="xl:col-span-8 bg-white rounded-2xl border p-4 overflow-x-auto">
              <h2 className="font-semibold mb-4">Inventory Matrix</h2>

              <table className="min-w-[700px] w-full text-sm">
                <thead className="bg-gray-100">
                  <tr className="text-gray-600">
                    <th className="py-3 px-3 text-left">Color / Size</th>
                    <th className="py-3 px-3 text-center">XS</th>
                    <th className="py-3 px-3 text-center">S</th>
                    <th className="py-3 px-3 text-center">M</th>
                    <th className="py-3 px-3 text-center">L</th>
                    <th className="py-3 px-3 text-center">XL</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixData.map((row, index) => (
                    <EditableMatrixRow
                      key={index}
                      row={row}
                      rowIndex={index}
                      onUpdate={setMatrixData}
                      zebra={index % 2 === 0}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* RIGHT COLUMN (NOT REMOVED) */}
            <div className="xl:col-span-4 space-y-6">
              {/* VARIANT-WISE STOCK GRAPH (FIXED) */}
              <LineChartBox
                title="Variant-wise Stock"
                data={variantChartData}
                dataKey="value"
                nameKey="name"
              />

              {/* QUICK ADJUSTMENT (UNCHANGED) */}
              <div className="bg-white rounded-2xl border p-4">
                <h2 className="font-semibold mb-4">Quick Adjustment</h2>

                <label className="text-sm text-gray-500">
                  Selected Variant
                </label>
                <select className="w-full mt-1 mb-4 border rounded-xl px-3 py-2 text-sm">
                  <option>Onyx / M</option>
                  <option>Champagne / M</option>
                </select>

                <label className="text-sm text-gray-500">Adjust Quantity</label>
                <div className="flex items-center gap-3 mt-2 mb-4">
                  <button className="w-9 h-9 border rounded-xl">-</button>
                  <div className="flex-1 text-center font-semibold">42</div>
                  <button className="w-9 h-9 border rounded-xl">+</button>
                </div>

                <label className="text-sm text-gray-500">
                  Adjustment Reason
                </label>
                <select className="w-full mt-1 mb-4 border rounded-xl px-3 py-2 text-sm">
                  <option>Restock / Inbound</option>
                  <option>Damaged</option>
                  <option>Manual Correction</option>
                </select>

                <label className="text-sm text-gray-500">Notes</label>
                <textarea
                  className="w-full mt-1 mb-4 border rounded-xl px-3 py-2 text-sm"
                  placeholder="Add a comment..."
                />

                <button className="w-full py-3 bg-black text-white rounded-xl font-medium hover:opacity-90">
                  Update Stock Level
                </button>
              </div>
            </div>
          </div>

          {/* INVENTORY HISTORY LOG */}
          <div className="bg-white border rounded-2xl p-4 overflow-x-auto">
            <h2 className="font-semibold mb-4">Inventory History Log</h2>

            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-gray-100">
                <tr className="text-gray-600">
                  <th className="py-3 px-3 text-left">Variant</th>
                  <th className="py-3 px-3 text-center">Change</th>
                  <th className="py-3 px-3 text-left">Reason</th>
                  <th className="py-3 px-3 text-left">Updated By</th>
                  <th className="py-3 px-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                  >
                    <td className="py-3 px-3 font-medium">{log.variant}</td>
                    <td
                      className={`py-3 px-3 text-center font-semibold ${
                        log.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {log.change}
                    </td>
                    <td className="py-3 px-3">{log.reason}</td>
                    <td className="py-3 px-3">{log.by}</td>
                    <td className="py-3 px-3 text-gray-500">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Editable Matrix Row ---------- */

function EditableMatrixRow({ row, rowIndex, onUpdate, zebra }) {
  const [editCell, setEditCell] = useState(null);
  const [value, setValue] = useState("");

  const saveValue = (colIndex) => {
    onUpdate((prev) => {
      const copy = [...prev];
      copy[rowIndex].sizes[colIndex] = value;
      return copy;
    });
    setEditCell(null);
  };

  const getColor = (item) => {
    if (item === "Out" || item === "Urgent") return "text-red-600";
    if (item === "Low") return "text-orange-600";
    return "text-green-600";
  };

  return (
    <tr className={`${zebra ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
      <td className="py-3 px-3 font-medium whitespace-nowrap">{row.color}</td>

      {row.sizes.map((item, colIndex) => {
        const isEditing =
          editCell?.row === rowIndex && editCell?.col === colIndex;

        return (
          <td
            key={colIndex}
            className={`py-3 px-3 text-center font-medium cursor-pointer ${getColor(item)}`}
            onClick={() => {
              setEditCell({ row: rowIndex, col: colIndex });
              setValue(item);
            }}
          >
            {isEditing ? (
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={() => saveValue(colIndex)}
                onKeyDown={(e) => e.key === "Enter" && saveValue(colIndex)}
                className="w-16 border rounded-md px-2 py-1 text-sm text-center"
              />
            ) : (
              <>
                {item}
                {(item === "Low" || item === "Out" || item === "Urgent") && (
                  <AlertTriangle size={14} className="inline ml-1" />
                )}
              </>
            )}
          </td>
        );
      })}
    </tr>
  );
}
