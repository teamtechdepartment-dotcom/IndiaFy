import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import StatsCard from "../../components/admin/StatsCard";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import {
  PackageX,
  Sparkles,
  CheckCircle2,
  Download,
  AlertTriangle,
  Search,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { exportToCSV } from "../../utils/exportCSV";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/products");
      // Extract data safely regardless of API response wrapper format
      const rawData = res?.data?.products ?? res?.data ?? res ?? [];
      const safeData = Array.isArray(rawData) ? rawData : [];
      setProducts(safeData);
    } catch (err) {
      console.error("Error fetching products list:", err);
      setError("Failed to load products list. Please try again.");
      toast.error("Failed to load products list");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTogglePublished = async (id, currentPublished) => {
    if (!id) return;
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
    if (!id) return;
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
    try {
      const safeList = Array.isArray(products) ? products : [];
      const exportData = safeList.map(p => ({
        ID: p?._id ?? "N/A",
        Name: p?.productName ?? "Untitled Product",
        SKU: p?.productSkuId ?? "N/A",
        Category: p?.categoryName ?? "General",
        Price: p?.attribute?.salePrice ?? p?.price ?? 0,
        Stock: p?.stock ?? 0,
        Status: p?.isPublished ? "Published" : "Pending Review",
      }));
      exportToCSV(exportData, "products-inventory.csv");
    } catch (err) {
      console.error("Failed to export products:", err);
      toast.error("Failed to export product data");
    }
  };

  // Safe Filter logic
  const safeProductsList = Array.isArray(products) ? products : [];

  const filteredProducts = safeProductsList.filter((product) => {
    if (!product) return false;

    const searchTerm = (search ?? "").toLowerCase().trim();
    const pName = (product.productName ?? "").toLowerCase();
    const pSku = (product.productSkuId ?? "").toLowerCase();
    const matchesSearch = !searchTerm || pName.includes(searchTerm) || pSku.includes(searchTerm);

    const matchesCategory =
      categoryFilter === "All" ||
      (product.categoryName ?? "General") === categoryFilter;

    const stock = Number(product.stock ?? 0);
    const threshold = Number(product.lowStockThreshold ?? 5);

    const matchesStock =
      stockFilter === "All"
        ? true
        : stockFilter === "Low"
          ? stock <= threshold
          : stock > threshold;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = [
    "All",
    ...new Set(
      safeProductsList
        .map((p) => p?.categoryName)
        .filter((cat) => Boolean(cat) && typeof cat === "string")
    ),
  ];

  const totalCatalogCount = safeProductsList.length;
  const lowInventoryCount = safeProductsList.filter(
    (p) => Number(p?.stock ?? 0) <= Number(p?.lowStockThreshold ?? 5)
  ).length;
  const publishedCount = safeProductsList.filter((p) => Boolean(p?.isPublished)).length;
  const pendingCount = safeProductsList.filter((p) => !p?.isPublished).length;

  return (
    <div className="flex min-h-screen font-sans" style={{background:"radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-8">
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

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchProducts}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-xl font-bold text-xs hover:bg-slate-100 transition active:scale-95 text-slate-700"
                  title="Refresh Data"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl font-bold text-xs hover:shadow-xs transition active:scale-95 text-slate-800"
                >
                  <Download size={16} className="text-[#D4AF37]" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Error Banner if API Fails */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={20} />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
                <button
                  onClick={fetchProducts}
                  className="text-xs font-bold underline hover:text-red-900"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Stats Cards Wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load catalog statistics">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {loading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
                    ))}
                  </>
                ) : (
                  <>
                    <StatsCard
                      title="Active Catalog"
                      value={totalCatalogCount}
                      badge="In database"
                      accent="blue"
                      icon={<Sparkles size={16} />}
                    />
                    <StatsCard
                      title="Low Inventory Items"
                      value={lowInventoryCount}
                      badge="Restock alert"
                      accent="red"
                      icon={<AlertTriangle size={16} />}
                    />
                    <StatsCard
                      title="Published Listings"
                      value={publishedCount}
                      badge="Visible to users"
                      accent="green"
                      icon={<CheckCircle2 size={16} />}
                    />
                    <StatsCard
                      title="Pending Verification"
                      value={pendingCount}
                      badge="Awaiting review"
                      accent="orange"
                      icon={<ClockIcon size={16} />}
                    />
                  </>
                )}
              </div>
            </AdminErrorBoundary>

            {/* Main Listing Panel */}
            <AdminErrorBoundary title="Unable to load product table">
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
                        [1, 2, 3, 4, 5].map((idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0" />
                                <div className="space-y-1">
                                  <div className="w-32 h-3.5 bg-slate-200 rounded" />
                                  <div className="w-20 h-2.5 bg-slate-100 rounded" />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4"><div className="w-20 h-3 bg-slate-200 rounded" /></td>
                            <td className="py-4 px-4 text-right"><div className="w-16 h-3 bg-slate-200 rounded ml-auto" /></td>
                            <td className="py-4 px-4 text-center"><div className="w-12 h-5 bg-slate-200 rounded-md mx-auto" /></td>
                            <td className="py-4 px-4 text-center"><div className="w-20 h-3 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-4 px-4 text-center"><div className="w-16 h-5 bg-slate-200 rounded-md mx-auto" /></td>
                            <td className="py-4 px-4 text-right"><div className="w-24 h-6 bg-slate-200 rounded-lg ml-auto" /></td>
                          </tr>
                        ))
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-gray-400 font-semibold">
                            No products match search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const safeId = p?._id || Math.random().toString();
                          const stockVal = Number(p?.stock ?? 0);
                          const thresholdVal = Number(p?.lowStockThreshold ?? 5);
                          const isLowStock = stockVal <= thresholdVal;
                          const imageUrl = Array.isArray(p?.productImage) && p.productImage.length > 0
                            ? p.productImage[0]
                            : p?.image ?? null;
                          const priceVal = Number(p?.attribute?.salePrice ?? p?.price ?? 0);

                          return (
                            <tr key={safeId} className="hover:bg-slate-50/50 transition-colors">
                              
                              {/* Product Info */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={p?.productName ?? "Product"}
                                      className="w-10 h-10 rounded-lg object-cover border bg-slate-100"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        if (e.currentTarget.nextSibling) {
                                          e.currentTarget.nextSibling.style.display = "flex";
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold border"
                                    style={{ display: imageUrl ? "none" : "flex" }}
                                  >
                                    {(p?.productName?.[0] ?? "P").toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-[#0B1528] text-sm">
                                      {p?.productName ?? "Untitled Product"}
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                      SKU: {p?.productSkuId ?? "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-4 px-4 text-gray-500 font-bold">
                                {p?.categoryName ?? "General"}
                              </td>

                              {/* Price */}
                              <td className="py-4 px-4 text-right font-black text-slate-800">
                                ₹{priceVal.toLocaleString()}
                              </td>

                              {/* Stock */}
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  isLowStock
                                    ? "bg-red-50 text-red-600 border border-red-100 animate-pulse"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {stockVal} left
                                </span>
                              </td>

                              {/* Node type */}
                              <td className="py-4 px-4 text-center text-gray-500 uppercase tracking-wider text-[10px]">
                                {p?.nodeType ?? "LOCAL_RETAIL"}
                              </td>

                              {/* Status */}
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  p?.isPublished
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {p?.isPublished ? "Published" : "Pending Review"}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-4 text-right space-x-2">
                                <button
                                  onClick={() => handleTogglePublished(p?._id, Boolean(p?.isPublished))}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                                    p?.isPublished
                                      ? "bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200"
                                      : "bg-[#0B1528] text-white hover:bg-black border border-[#D4AF37]/30"
                                  }`}
                                >
                                  {p?.isPublished ? "Revoke" : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleToggleActive(p?._id, p?.isActive !== false)}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${
                                    p?.isActive !== false
                                      ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {p?.isActive !== false ? "Suspend" : "Activate"}
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
            </AdminErrorBoundary>

          </div>
        </main>
      </div>
    </div>
  );
}

function ClockIcon({ size = 16, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
