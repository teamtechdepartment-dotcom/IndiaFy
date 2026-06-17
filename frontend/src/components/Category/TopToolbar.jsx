/* eslint-disable react/prop-types */
import { memo } from "react";
import { ChevronRight, Grid, List } from "lucide-react";

function TopToolbar({
  totalProducts,
  categoryName = "Electronics",
  sortType,
  setSortType,
  viewMode,
  setViewMode
}) {
  return (
    <div className="bg-white border-b border-gray-200 pb-3 mb-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3">
        <span className="hover:text-[#2874F0] cursor-pointer transition-colors">Home</span>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="text-gray-800">{categoryName}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Title and Count */}
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight mb-1">
            {categoryName}
          </h1>
          <p className="text-xs font-semibold text-gray-500">
            (Showing 1 – {totalProducts} products of {totalProducts} products)
          </p>
        </div>

        {/* Sort and View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800">Sort By</span>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="border-none text-sm font-semibold text-gray-600 bg-transparent focus:ring-0 cursor-pointer hover:text-[#2874F0]"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price -- Low to High</option>
              <option value="price_desc">Price -- High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="delivery">Fastest Delivery</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-4">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "grid" ? "bg-[#2874F0] text-white" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "list" ? "bg-[#2874F0] text-white" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TopToolbar);
