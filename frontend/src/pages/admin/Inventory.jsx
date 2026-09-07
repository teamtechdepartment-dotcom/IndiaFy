import { useState, useEffect } from "react";
import { Download, Search, AlertTriangle, CheckCircle, Package, RefreshCw, Layers, Edit3, X } from "lucide-react";
import SEOHead from "../../components/seo/SEOHead";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { exportToCSV } from "../../utils/exportCSV";
import axiosInstance from "../../utils/axiosInstance";
import { useAdminSocket } from "../../hooks/useAdminSocket";
import toast from "react-hot-toast";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);
  const [savingStock, setSavingStock] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/admin/management/products");
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setProducts(list);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError("Unable to load inventory data from catalog.");
    } finally {
      setLoading(false);
    }
  };

  // Real-time synchronization
  const { isConnected: isSocketConnected } = useAdminSocket((event, _data) => {
    console.log(`[Inventory] Real-time event ${event} received, updating catalog stock...`);
    fetchInventory();
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  // Live Metric Calculations
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const totalValuation = products.reduce((acc, p) => {
    const price = Number(p.attribute?.salePrice || p.price || 0);
    return acc + (price * Number(p.stock || 0));
  }, 0);
  const lowStockCount = products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= (p.lowStockThreshold || 5)).length;
  const outOfStockCount = products.filter(p => Number(p.stock || 0) <= 0).length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      (p.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.productSkuId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const stock = Number(p.stock || 0);
    const threshold = p.lowStockThreshold || 5;

    if (!matchesSearch) return false;
    if (filter === "in_stock") return stock > threshold;
    if (filter === "low_stock") return stock > 0 && stock <= threshold;
    if (filter === "out_of_stock") return stock <= 0;
    return true;
  });

  // Handle Export CSV
  const handleExport = () => {
    try {
      const csvRows = filteredProducts.map(p => ({
        SKU: p.productSkuId || "N/A",
        Name: p.productName || "Unnamed",
        Category: p.categoryName || "General",
        Stock: p.stock ?? 0,
        Threshold: p.lowStockThreshold ?? 5,
        Price: `₹${p.attribute?.salePrice || p.price || 0}`,
        Status: (p.stock ?? 0) <= 0 ? "Out of Stock" : (p.stock ?? 0) <= (p.lowStockThreshold || 5) ? "Low Stock" : "In Stock",
        Active: p.isActive ? "Yes" : "No"
      }));
      exportToCSV(csvRows, `inventory-audit-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("Inventory audit exported to CSV.");
    } catch (_err) {
      toast.error("Failed to export inventory CSV.");
    }
  };

  // Handle Quick Stock Update
  const handleUpdateStock = async () => {
    if (!editingProduct) return;
    try {
      setSavingStock(true);
      await axiosInstance.put(`/admin/management/products/${editingProduct._id}/status`, {
        stock: Number(newStockVal)
      });
      toast.success(`Updated stock for ${editingProduct.productName} to ${newStockVal}`);
      setProducts(prev => prev.map(p => p._id === editingProduct._id ? { ...p, stock: Number(newStockVal) } : p));
      setEditingProduct(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update stock quantity.");
    } finally {
      setSavingStock(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans selection:bg-orange-500 selection:text-white" style={{background: "radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <SEOHead title="Inventory & Stock Control | Indiafy Admin" noindex={true} />
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto w-full space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package size={14} className="text-[#2874F0] dark:text-[#FB641B]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2874F0] dark:text-[#FB641B]">
                  Live Supply Chain
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isSocketConnected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  {isSocketConnected ? "Sync Active" : "Connecting..."}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Inventory & Stock Management
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
                Real-time multi-vendor warehouse stock levels, buffer alerts, and catalog valuation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchInventory}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 transition shadow-sm"
              >
                <RefreshCw size={13} className={loading ? "animate-spin text-[#2874F0]" : ""} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2874F0] text-white hover:bg-blue-600 transition shadow-sm"
              >
                <Download size={13} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Catalog Units</p>
              <h3 className="text-2xl font-black text-white">{totalStockUnits.toLocaleString()}</h3>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">{totalProducts} active product lines</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inventory Valuation</p>
              <h3 className="text-2xl font-black text-emerald-400">₹{totalValuation.toLocaleString("en-IN")}</h3>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">Based on active sale prices</p>
            </div>

            <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Low Stock Alerts</p>
              <h3 className="text-2xl font-black text-amber-400">{lowStockCount}</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">Below buffer threshold (&le; 5)</p>
            </div>

            <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Out of Stock</p>
              <h3 className="text-2xl font-black text-red-400">{outOfStockCount}</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">Zero units available</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by SKU, product, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-[#2874F0]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {[
                { label: "All Items", key: "all" },
                { label: "In Stock", key: "in_stock" },
                { label: "Low Stock", key: "low_stock" },
                { label: "Out of Stock", key: "out_of_stock" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                    filter === tab.key
                      ? "bg-[#2874F0] text-white"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md overflow-x-auto">
            {error && (
              <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#2874F0]" />
                      Synchronizing inventory levels from warehouse cluster...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No inventory records found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const stock = Number(p.stock || 0);
                    const threshold = p.lowStockThreshold || 5;
                    const price = p.attribute?.salePrice || p.price || 0;
                    const isOut = stock <= 0;
                    const isLow = stock > 0 && stock <= threshold;

                    return (
                      <tr key={p._id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {p.thumbnail || (p.productImage && p.productImage[0]) ? (
                              <img
                                src={p.thumbnail || p.productImage[0]}
                                alt={p.productName}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                                <Package size={16} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-200 truncate max-w-xs">{p.productName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{p.sellerId?.businessName || "Direct Catalog"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-400 text-[11px]">
                          {p.productSkuId || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-300">
                          {p.categoryName || "General"}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-200">
                          ₹{price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-black text-sm ${isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400"}`}>
                            {stock}
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1">units</span>
                        </td>
                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Low Stock (&le; {threshold})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setNewStockVal(stock);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                          >
                            <Edit3 size={11} />
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Stock Adjustment Modal */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-white">Adjust Stock Level</h3>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Updating live warehouse inventory for <span className="font-bold text-slate-200">{editingProduct.productName}</span> ({editingProduct.productSkuId}).
                </p>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                    Available Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStockVal}
                    onChange={(e) => setNewStockVal(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-[#2874F0]"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStock}
                    disabled={savingStock}
                    className="px-4 py-2 text-xs font-bold bg-[#2874F0] text-white hover:bg-blue-600 rounded-xl transition shadow-sm flex items-center gap-1.5"
                  >
                    {savingStock ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                    Save Stock
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
