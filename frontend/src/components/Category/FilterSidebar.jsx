/* eslint-disable react/prop-types */
import { memo } from "react";
import { Star, X, RotateCcw } from "lucide-react";

const BRANDS = ["Sony", "Apple", "Bose", "JBL", "Sennheiser", "Samsung", "Boat", "Noise"];
const DISCOUNTS = ["10% or more", "20% or more", "30% or more", "40% or more", "50% or more"];

function FilterSidebar({
  maxPrice,
  setMaxPrice,
  maxDist,
  setMaxDist,
  selectedBrands,
  toggleBrand,
  onClose
}) {
  const handleClearAll = () => {
    setMaxPrice(100000);
    setMaxDist(50);
    selectedBrands.forEach((b) => toggleBrand(b));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
      {/* Mobile Header (Hidden on Desktop) */}
      {onClose && (
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 lg:hidden">
          <h2 className="text-base font-extrabold text-slate-900">Filters</h2>
          <button onClick={onClose} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="hidden lg:flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Filters</h3>
        <button 
          onClick={handleClearAll}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
        >
          <RotateCcw size={12} /> Clear All
        </button>
      </div>

      <div className="space-y-5">
        {/* Price Slider */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-slate-800">Max Price</h4>
            <span className="text-xs font-extrabold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-100">
              ₹{maxPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
            <span>₹1,000</span>
            <span>₹1,000,000+</span>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Distance Slider */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-slate-800">Delivery Radius</h4>
            <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
              {maxDist} km
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={maxDist}
            onChange={(e) => setMaxDist(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-800"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Customer Ratings */}
        <section>
          <h4 className="text-xs font-bold text-slate-800 mb-2.5">Customer Ratings</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                  {rating} <Star size={12} className="fill-amber-400 text-amber-400" /> & above
                </div>
              </label>
            ))}
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Brands */}
        <section>
          <h4 className="text-xs font-bold text-slate-800 mb-2.5">Popular Brands</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {BRANDS.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">{brand}</span>
              </label>
            ))}
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Availability */}
        <section className="pb-2">
          <h4 className="text-xs font-bold text-slate-800 mb-2.5">Stock Availability</h4>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" defaultChecked />
            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">In Stock Products Only</span>
          </label>
        </section>

      </div>
    </div>
  );
}

export default memo(FilterSidebar);
