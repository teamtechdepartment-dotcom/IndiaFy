import { useState } from "react";
import { products as initialProducts } from "../../data/products";
import ProductModal from "./ProductModal";

const ITEMS_PER_PAGE = 5;

export default function ProductTable() {
  const [products, setProducts] = useState(initialProducts);
  const [selectedIds, setSelectedIds] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // 🔎 Filter
  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory = category === "All" || product.category === category;

    const matchStock =
      stockFilter === "All"
        ? true
        : stockFilter === "Low"
          ? product.stock < 10
          : product.stock >= 10;

    return matchSearch && matchCategory && matchStock;
  });

  // 📄 Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // ✅ Checkbox Logic
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedProducts.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));

    setSelectedIds(
      allSelected
        ? selectedIds.filter((id) => !pageIds.includes(id))
        : [...new Set([...selectedIds, ...pageIds])],
    );
  };

  // 🗑 Bulk Delete
  const bulkDelete = () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Delete ${selectedIds.length} products?`)) return;

    setProducts(products.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const resetPage = () => setCurrentPage(1);

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden w-full">
        {/* Header */}
        <div className="p-4 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="font-bold text-lg">Products</h3>

          <div className="flex flex-col gap-3 w-full md:flex-row md:flex-wrap md:w-auto">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="border rounded-xl px-4 py-2 text-sm w-full md:w-48"
            />

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                resetPage();
              }}
              className="border rounded-xl px-3 py-2 text-sm w-full md:w-auto"
            >
              <option value="All">All Categories</option>
              <option value="Ethinic Wear">Men</option>
              <option value="Westen Wear">Women</option>
              <option value="Bottom Wear">Boy</option>
              <option value="Outerwear">Gril</option>
              <option value="Accessories">Accessories</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                resetPage();
              }}
              className="border rounded-xl px-3 py-2 text-sm w-full md:w-auto"
            >
              <option value="All">All Stock</option>
              <option value="Low">Low Stock</option>
              <option value="In">In Stock</option>
            </select>

            {selectedIds.length > 0 && (
              <button
                onClick={bulkDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold w-full md:w-auto"
              >
                Delete ({selectedIds.length})
              </button>
            )}

            <button
              onClick={() => {
                setSelectedProduct(null);
                setOpenModal(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold w-full md:w-auto"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={
                        paginatedProducts.length > 0 &&
                        paginatedProducts.every((p) =>
                          selectedIds.includes(p.id),
                        )
                      }
                      onChange={toggleSelectAll}
                      className="w-5 h-5 accent-primary"
                    />
                  </td>
                  <td colSpan="5" className="font-semibold">
                    Select All (This Page)
                  </td>
                </tr>

                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-5 h-5 accent-primary"
                      />
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>{product.category}</td>
                    <td className="font-semibold">₹{product.price}</td>
                    <td>
                      <span
                        className={`font-bold ${
                          product.stock < 10 ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="text-right p-4">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setOpenModal(true);
                        }}
                        className="text-primary font-semibold text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-4 space-y-4">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="w-5 h-5 accent-primary"
                />
              </div>

              <div className="mt-3 text-sm space-y-1">
                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {product.category}
                </p>
                <p>
                  <span className="font-semibold">Price:</span> ₹{product.price}
                </p>
                <p>
                  <span className="font-semibold">Stock:</span>{" "}
                  <span
                    className={`font-bold ${
                      product.stock < 10 ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {product.stock}
                  </span>
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(product);
                  setOpenModal(true);
                }}
                className="mt-3 w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      <ProductModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        product={selectedProduct}
      />
    </>
  );
}
