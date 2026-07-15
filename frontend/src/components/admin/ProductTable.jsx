import { useState } from "react";
import { products as initialProducts } from "../../data/products";
import ProductModal from "./ProductModal";
import AdminErrorBoundary from "./AdminErrorBoundary";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function ProductTable() {
  const [products, setProducts] = useState(Array.isArray(initialProducts) ? initialProducts : []);
  const [selectedIds, setSelectedIds] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Safe Filter
  const safeProductsList = Array.isArray(products) ? products : [];

  const filteredProducts = safeProductsList.filter((product) => {
    if (!product) return false;

    const searchTerm = (search ?? "").toLowerCase().trim();
    const prodName = (product.name ?? "").toLowerCase();
    const matchSearch = !searchTerm || prodName.includes(searchTerm);

    const prodCategory = product.category ?? "General";
    const matchCategory = category === "All" || prodCategory === category;

    const stock = Number(product.stock ?? 0);
    const matchStock =
      stockFilter === "All"
        ? true
        : stockFilter === "Low"
          ? stock < 10
          : stock >= 10;

    return matchSearch && matchCategory && matchStock;
  });

  // Safe Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Checkbox Logic
  const toggleSelect = (id) => {
    if (!id) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedProducts.map((p) => p?.id).filter(Boolean);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    setSelectedIds(
      allSelected
        ? selectedIds.filter((id) => !pageIds.includes(id))
        : [...new Set([...selectedIds, ...pageIds])],
    );
  };

  // Bulk Delete
  const bulkDelete = () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Delete ${selectedIds.length} products?`)) return;

    setProducts(products.filter((p) => p && !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const resetPage = () => setCurrentPage(1);

  return (
    <AdminErrorBoundary title="Unable to load product table view">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full">
        {/* Header Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-base">Catalog Inventory ({filteredProducts.length})</h3>

          <div className="flex flex-col gap-2.5 w-full md:flex-row md:flex-wrap md:w-auto">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs w-full md:w-48 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#10B981] bg-white"
            />

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                resetPage();
              }}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs w-full md:w-auto outline-none bg-white font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Ethinic Wear">Ethnic Wear</option>
              <option value="Westen Wear">Western Wear</option>
              <option value="Bottom Wear">Bottom Wear</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Accessories">Accessories</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                resetPage();
              }}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-xs w-full md:w-auto outline-none bg-white font-medium"
            >
              <option value="All">All Stock Levels</option>
              <option value="Low">Low Stock (&lt;10)</option>
              <option value="In">In Stock (10+)</option>
            </select>

            {selectedIds.length > 0 && (
              <button
                onClick={bulkDelete}
                className="bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold w-full md:w-auto hover:bg-red-600 transition shadow-xs min-h-[44px]"
              >
                Delete ({selectedIds.length})
              </button>
            )}

            <button
              onClick={() => {
                setSelectedProduct(null);
                setOpenModal(true);
              }}
              className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold w-full md:w-auto hover:bg-black transition shadow-xs min-h-[44px]"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every((p) =>
                        p?.id && selectedIds.includes(p.id),
                      )
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-[#10B981] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 font-bold">Product Details</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Price</th>
                <th className="py-3 px-4 font-bold">Stock</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-semibold">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const safeId = product?.id || Math.random().toString();
                  const stockVal = Number(product?.stock ?? 0);
                  const priceVal = Number(product?.price ?? 0);

                  return (
                    <tr key={safeId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(product?.id && selectedIds.includes(product.id))}
                          onChange={() => toggleSelect(product?.id)}
                          className="w-4 h-4 rounded accent-[#10B981] cursor-pointer"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product?.image ? (
                            <img
                              loading="lazy"
                              decoding="async"
                              src={product.image}
                              alt={product?.name ?? "Product"}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-extrabold border shrink-0 text-sm"
                            style={{ display: product?.image ? "none" : "flex" }}
                          >
                            {(product?.name?.[0] ?? "P").toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{product?.name ?? "Untitled Product"}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              SKU: {product?.sku ?? "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-600">{product?.category ?? "General"}</td>
                      <td className="p-4 font-black text-slate-900">₹{priceVal.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`font-black text-[10px] uppercase px-2.5 py-1 rounded-md ${
                            stockVal < 10 ? "text-red-600 bg-red-50" : "text-[#10B981] bg-emerald-50"
                          }`}
                        >
                          {stockVal} in stock
                        </span>
                      </td>

                      <td className="text-right p-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setOpenModal(true);
                          }}
                          className="text-[#10B981] font-bold text-xs hover:underline"
                        >
                          Edit Item
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="md:hidden p-3 space-y-3">
          {paginatedProducts.length === 0 ? (
            <p className="text-center text-slate-400 font-semibold py-6 text-xs">No products found.</p>
          ) : (
            paginatedProducts.map((product) => {
              const safeId = product?.id || Math.random().toString();
              const stockVal = Number(product?.stock ?? 0);
              const priceVal = Number(product?.price ?? 0);

              return (
                <div key={safeId} className="border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 bg-white">
                  <div className="flex items-center gap-3">
                    {product?.image ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={product.image}
                        alt={product?.name ?? "Product"}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold border shrink-0 text-sm">
                        {(product?.name?.[0] ?? "P").toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-slate-900 text-xs truncate">{product?.name ?? "Untitled Product"}</p>
                      <p className="text-[10px] text-slate-400">SKU: {product?.sku ?? "N/A"}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(product?.id && selectedIds.includes(product.id))}
                      onChange={() => toggleSelect(product?.id)}
                      className="w-5 h-5 accent-[#10B981] shrink-0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
                      <span className="font-semibold text-slate-800">{product?.category ?? "General"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Price</span>
                      <span className="font-black text-slate-900">₹{priceVal.toLocaleString()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Stock Status</span>
                      <span
                        className={`font-bold text-xs ${
                          stockVal < 10 ? "text-red-600" : "text-[#10B981]"
                        }`}
                      >
                        {stockVal} units available
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setOpenModal(true);
                    }}
                    className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-black transition min-h-[44px]"
                  >
                    Edit Product
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-semibold text-center sm:text-left">
            Showing Page <span className="font-bold text-slate-900">{safeCurrentPage}</span> of{" "}
            <span className="font-bold text-slate-900">{totalPages}</span> ({filteredProducts.length} total)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-2 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition min-w-[44px] min-h-[44px] flex items-center justify-center font-bold"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-2 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition min-w-[44px] min-h-[44px] flex items-center justify-center font-bold"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      <ProductModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProduct}
      />
    </AdminErrorBoundary>
  );
}
