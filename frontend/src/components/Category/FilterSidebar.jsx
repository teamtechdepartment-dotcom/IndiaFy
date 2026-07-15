/* eslint-disable react/prop-types */
import { memo } from "react";
import { Star, X } from "lucide-react";

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
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full flex flex-col overflow-y-auto custom-scrollbar">
      {/* Mobile Header (Hidden on Desktop) */}
      {onClose && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 lg:hidden">
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="hidden lg:flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Filters</h3>
        <button className="text-xs font-semibold text-blue-600 uppercase tracking-wide hover:underline">
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Price Slider */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-gray-800">Price</h4>
            <span className="text-xs font-bold text-gray-900">₹{maxPrice.toLocaleString("en-IN")}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2874F0]"
          />
          <div className="flex justify-between text-[10px] font-semibold text-gray-400 mt-2">
            <span>₹1k</span>
            <span>₹100k+</span>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Distance Slider */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-gray-800">Delivery Distance</h4>
            <span className="text-xs font-bold text-gray-900">{maxDist} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={maxDist}
            onChange={(e) => setMaxDist(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2874F0]"
          />
          <div className="flex justify-between text-[10px] font-semibold text-gray-400 mt-2">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Customer Ratings */}
        <section>
          <h4 className="text-sm font-bold text-gray-800 mb-3">Customer Ratings</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2874F0] focus:ring-[#2874F0] cursor-pointer" />
                <div className="flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {rating} <Star size={14} className="fill-current text-gray-400 group-hover:text-amber-500" /> & above
                </div>
              </label>
            ))}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Brands */}
        <section className="shrink-0 mb-6">
          <h4 className="text-sm font-bold text-gray-800 mb-3">Brand</h4>
          <div className="space-y-2">
            {BRANDS.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-4 h-4 rounded border-gray-300 text-[#2874F0] focus:ring-[#2874F0] cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{brand}</span>
              </label>
            ))}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Discount */}
        <section>
          <h4 className="text-sm font-bold text-gray-800 mb-3">Discount</h4>
          <div className="space-y-2">
            {DISCOUNTS.map((discount) => (
              <label key={discount} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2874F0] focus:ring-[#2874F0] cursor-pointer" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{discount}</span>
              </label>
            ))}
          </div>
        </section>
        
        <hr className="border-gray-100" />

        {/* Availability */}
        <section>
          <h4 className="text-sm font-bold text-gray-800 mb-3">Availability</h4>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2874F0] focus:ring-[#2874F0] cursor-pointer" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Include Out of Stock</span>
          </label>
        </section>

      </div>
    </div>
  );
}

export default memo(FilterSidebar);
