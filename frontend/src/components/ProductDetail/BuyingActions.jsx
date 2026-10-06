/* eslint-disable react/prop-types */
import { memo } from "react";
import { Lock, MapPin } from "lucide-react";

function BuyingActions({ product, handleAddToCart, handleBuyNow, quantity, setQuantity }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-100 md:relative md:z-auto md:bg-white md:border md:border-gray-200 md:rounded md:p-5 md:shadow-sm md:sticky md:top-24">
      {/* Stock Status - Hidden on mobile bottom bar */}
      <div className="hidden md:block mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">₹{product.currentPrice.toLocaleString("en-IN")}</h2>
        {product.delivery.free && (
          <p className="text-sm text-[#065F46] font-bold mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
            FREE delivery
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#065F46] hover:underline cursor-pointer mt-2 font-medium">
          <MapPin size={14} /> Deliver to Gurugram 122001
        </div>
        <div className="text-lg font-bold text-[#065F46] mt-3 mb-2">In stock</div>
      </div>

      <div className="hidden md:flex items-center gap-3 mb-6">
        <span className="text-sm font-bold text-gray-900">Quantity:</span>
        <select 
          value={quantity} 
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border border-gray-300 rounded bg-white p-1.5 text-sm font-bold focus:border-[#065F46] focus:outline-none focus:ring-1 focus:ring-[#065F46]"
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 w-full md:flex-col">
        <button
          onClick={handleAddToCart}
          className="flex-1 md:w-full bg-white border-2 border-[#065F46] text-[#065F46] hover:bg-[#065F46] hover:text-white py-2.5 md:py-3 rounded font-bold transition-all"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 md:w-full bg-[#065F46] hover:bg-[#047857] text-white py-2.5 md:py-3 rounded font-bold shadow-sm transition-all border-2 border-[#065F46]"
        >
          Buy Now
        </button>
      </div>

      <div className="hidden md:flex items-center justify-center gap-2 mt-4 text-gray-500 hover:text-[#065F46] hover:underline cursor-pointer text-xs font-medium">
        <Lock size={12} className="text-gray-400" /> Secure transaction
      </div>
      
      <div className="hidden md:flex flex-col gap-1.5 mt-4 text-xs font-medium border-t border-gray-100 pt-4">
        <div className="flex gap-4">
          <span className="text-gray-500 w-16">Ships from</span>
          <span className="text-gray-900">IndiaFy</span>
        </div>
        <div className="flex gap-4">
          <span className="text-gray-500 w-16">Sold by</span>
          <span className="text-[#065F46] hover:underline cursor-pointer">{product.seller.name}</span>
        </div>
      </div>

      <button className="hidden md:block mt-4 w-full bg-white border border-gray-300 hover:border-[#065F46] hover:text-[#065F46] py-2 rounded text-xs font-bold text-gray-700 transition-all">
        Add to Wishlist
      </button>
    </div>
  );
}

export default memo(BuyingActions);
