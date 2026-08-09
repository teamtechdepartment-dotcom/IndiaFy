/* eslint-disable react/prop-types */
import { memo } from "react";
import { Grid, List, ArrowUpDown } from "lucide-react";

function TopToolbar({
  totalProducts,
  categoryName = "Products",
  sortType,
  setSortType,
  viewMode,
  setViewMode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title and Count */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {categoryName}
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">
          Showing <span className="text-emerald-600 font-bold">{totalProducts}</span> available products
        </p>
      </div>

      {/* Sort and View Toggle */}
      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <ArrowUpDown size={14} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-600">Sort By:</span>
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="border-none text-xs font-bold text-slate-900 bg-transparent focus:ring-0 cursor-pointer pr-1"
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="hidden sm:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "grid" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-700"
            }`}
            title="Grid View"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "list" ? "bg-slate-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-700"
            }`}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(TopToolbar);
