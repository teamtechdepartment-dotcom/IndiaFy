import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import StatsCard from "../../components/admin/StatsCard";
import {
  IndianRupee,
  PackageX,
  Sparkles,
  CheckCircle2,
  Download,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Eye,
  Trash2,
  Star,
  Check,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { exportToCSV } from "../../utils/exportCSV";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/products");
      // res = { statusCode, data: products, message }
      const data = res.data || res;
      setProducts(data || []);
    } catch (_err) {
      toast.error("Failed to load products list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTogglePublished = async (id, currentPublished) => {
    try {
      await axiosInstance.put(`/admin/management/products/${id}/status`, {
        isPublished: !currentPublished,
      });
      toast.success(!currentPublished ? "Product approved and published" : "Product archived");
      fetchProducts();
    } catch (_err) {
      toast.error("Failed to update product status");
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await axiosInstance.put(`/admin/management/products/${id}/status`, {
        isActive: !currentActive,
      });
      toast.success(!currentActive ? "Product activated" : "Product suspended");
      fetchProducts();
    } catch (_err) {
      toast.error("Failed to update product status");
    }
  };

  const handleExport = () => {
    const exportData = products.map(p => ({
      ID: p._id,
      Name: p.productName,
      SKU: p.productSkuId,
      Category: p.categoryName || "General",
      Price: p.attribute?.salePrice || 0,
      Stock: p.stock || 0,
      Status: p.isPublished ? "Published" : "Pending Review",
    }));
    exportToCSV(exportData, "products-inventory.csv");
  };

  // Filter logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productName?.toLowerCase().includes(search.toLowerCase()) || product.productSkuId?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || product.categoryName === categoryFilter;
    const matchesStock =
      stockFilter === "All"
        ? true
        : stockFilter === "Low"
          ? (product.stock || 0) <= (product.lowStockThreshold || 5)
          : (product.stock || 0) > (product.lowStockThreshold || 5);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = ["All", ...new Set(products.map(p => p.categoryName).filter(Boolean))];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-2">
                  <PackageX size={14} /> Catalog Governance
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
                <p className="text-slate-500 font-medium">
                  Review submitted listings, monitor low inventory alerts, and authorize active items.
                </p>
              </div>

              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl font-bold text-xs hover:shadow-xs transition active:scale-95"
              >
                <Download size={16} className="text-[#D4AF37]" />
                Export CSV
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatsCard
                title="Active Catalog"
                value={products.length}
                badge="In database"
                accent="blue"
                icon={<Sparkles size={16} />}
              />
              <StatsCard
                title="Low Inventory Items"
                value={products.filter(p => (p.stock || 0) <= (p.lowStockThreshold || 5)).length}
                badge="Restock alert"
                accent="red"
                icon={<AlertTriangle size={16} />}
              />
              <StatsCard
                title="Published Listings"
                value={products.filter(p => p.isPublished).length}
                badge="Visible to users"
                accent="green"
                icon={<CheckCircle2 size={16} />}
              />
              <StatsCard
                title="Pending Verification"
                value={products.filter(p => !p.isPublished).length}
                badge="Awaiting review"
                accent="orange"
                icon={<ClockIcon size={16} />}
              />
            </div>

            {/* Main Listing Panel */}
            <div className="bg-white border rounded-[2rem] p-6 shadow-xs space-y-5">
              
              {/* Filters header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-80 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-11 text-xs font-medium text-slate-900 outline-none transition-all focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-11 px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                    ))}
                  </select>

                  {/* Stock Filter */}
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="h-11 px-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs outline-none"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="Low">Low Inventory</option>
                    <option value="Normal">Normal Inventory</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-xs text-left">
                  <thead className="bg-slate-50 text-gray-400 uppercase tracking-widest text-[9px] border-b">
                    <tr>
                      <th className="py-3 px-4 font-black">Product & SKU</th>
                      <th className="py-3 px-4 font-black">Category</th>
                      <th className="py-3 px-4 font-black text-right">Price</th>
                      <th className="py-3 px-4 font-black text-center">Stock</th>
                      <th className="py-3 px-4 font-black text-center">Fulfillment Node</th>
                      <th className="py-3 px-4 font-black text-center">Listing Status</th>
                      <th className="py-3 px-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">Loading catalog items...</td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">No products match search criteria.</td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isLowStock = (p.stock || 0) <= (p.lowStockThreshold || 5);
                        return (
                          <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                            
                            {/* Product Info */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                {p.productImage?.length > 0 ? (
                                  <img src={p.productImage[0]} alt={p.productName} className="w-10 h-10 rounded-lg object-cover border" />
                                ) : (
                                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold">P</div>
                                )}
                                <div>
                                  <p className="font-extrabold text-[#0B1528] text-sm">{p.productName}</p>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">SKU: {p.productSkuId}</p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-4 px-4 text-gray-500 font-bold">{p.categoryName || "General"}</td>

                            {/* Price */}
                            <td className="py-4 px-4 text-right font-black text-slate-800">
                              ₹{(p.attribute?.salePrice || 0).toLocaleString()}
                            </td>

                            {/* Stock */}
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                isLowStock
                                  ? "bg-red-50 text-red-600 border border-red-100 animate-pulse"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {p.stock || 0} left
                              </span>
                            </td>

                            {/* Node type */}
                            <td className="py-4 px-4 text-center text-gray-500 uppercase tracking-wider text-[10px]">
                              {p.nodeType || "LOCAL_RETAIL"}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                p.isPublished
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {p.isPublished ? "Published" : "Pending Review"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleTogglePublished(p._id, p.isPublished)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                                  p.isPublished
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200"
                                    : "bg-[#0B1528] text-white hover:bg-black border border-[#D4AF37]/30"
                                }`}
                              >
                                {p.isPublished ? "Revoke" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleToggleActive(p._id, p.isActive !== false)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                                  p.isActive !== false
                                    ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {p.isActive !== false ? "Suspend" : "Activate"}
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function ClockIcon({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
