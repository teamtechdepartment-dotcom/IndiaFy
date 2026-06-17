/* eslint-disable react/prop-types */
import { memo } from "react";
import { Lock, MapPin } from "lucide-react";

function BuyingActions({ product, handleAddToCart, handleBuyNow, quantity, setQuantity }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-100 md:relative md:z-auto md:bg-white md:border md:border-gray-200 md:rounded-xl md:p-6 md:shadow-sm md:sticky md:top-24">
      {/* Stock Status - Hidden on mobile bottom bar */}
      <div className="hidden md:block mb-4">
        <h2 className="text-xl font-bold text-[#212121] mb-2">₹{product.currentPrice.toLocaleString("en-IN")}</h2>
        {product.delivery.free && (
          <p className="text-sm text-[#2874F0] font-medium mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2874F0]"></span>
            FREE delivery
          </p>
        )}
        <div className="flex items-center gap-1 text-sm text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer mt-1">
          <MapPin size={14} /> Deliver to Gurugram 122001
        </div>
        <div className="text-lg font-medium text-[#007600] mt-3 mb-2">In stock</div>
      </div>

      <div className="hidden md:flex items-center gap-3 mb-6">
        <span className="text-sm font-medium text-[#212121]">Quantity:</span>
        <select 
          value={quantity} 
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border border-gray-200 rounded-lg bg-gray-50 p-1.5 text-sm font-bold focus:border-[#2874F0] focus:outline-none"
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
          className="flex-1 md:w-full bg-[#FB641B] hover:bg-[#E05411] text-white py-3 md:py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 md:w-full bg-[#2874F0] hover:bg-[#1A62D6] text-white py-3 md:py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
        >
          Buy Now
        </button>
      </div>

      <div className="hidden md:flex items-center justify-center gap-2 mt-4 text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer text-sm">
        <Lock size={14} className="text-[#999]" /> Secure transaction
      </div>
      
      <div className="hidden md:flex flex-col gap-1 mt-3 text-xs">
        <div className="flex gap-4">
          <span className="text-[#565959] w-16">Ships from</span>
          <span className="text-[#0F1111]">IndiaFy</span>
        </div>
        <div className="flex gap-4">
          <span className="text-[#565959] w-16">Sold by</span>
          <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">{product.seller.name}</span>
        </div>
      </div>

      <button className="hidden md:block mt-4 w-full bg-white border-2 border-gray-200 hover:border-[#FB641B] hover:text-[#FB641B] py-2 rounded-xl text-sm font-bold text-[#212121] transition-all">
        Add to Wishlist
      </button>
    </div>
  );
}

export default memo(BuyingActions);
