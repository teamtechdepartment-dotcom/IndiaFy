/* eslint-disable react/prop-types */
import { memo } from "react";
import { Star, ShieldCheck } from "lucide-react";
import DeliveryCheck from "./DeliveryCheck";

function ProductInfo({ product }) {
  const discount = Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100);

  return (
    <div className="flex flex-col text-[#0F1111] font-sans">
      {/* Brand & Title */}
      <a href="#" className="text-[13px] font-bold text-[#2874F0] hover:text-[#FB641B] uppercase tracking-wide mb-2 inline-block">
        Explore {product.brand} Products
      </a>
      <h1 className="text-xl sm:text-2xl font-medium text-[#212121] leading-snug mb-3">
        {product.title}
      </h1>

      {/* Ratings */}
      <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#10B981] text-white px-1.5 py-0.5 rounded text-[11px] font-bold shadow-sm">
            {product.rating} <Star size={10} className="fill-white" />
          </div>
          <a href="#reviews" className="text-sm font-medium text-gray-500 hover:text-[#2874F0]">
            {product.reviewCount.toLocaleString()} Ratings & Reviews
          </a>
        </div>
      </div>

      {/* Price Block */}
      <div className="mb-6">
        <div className="flex items-end gap-3 mb-1">
          <span className="text-3xl font-bold text-[#212121]">₹{product.currentPrice.toLocaleString("en-IN")}</span>
          <span className="text-sm text-gray-500 line-through mb-1">₹{product.originalPrice.toLocaleString("en-IN")}</span>
          <span className="text-sm font-bold text-[#10B981] mb-1">{discount}% off</span>
        </div>
        <p className="text-sm font-bold mt-1">Inclusive of all taxes</p>
        <p className="text-sm mt-1">
          <span className="font-bold">EMI</span> starts at ₹{(product.currentPrice / 6).toFixed(0)}. No Cost EMI available <a href="#" className="text-[#007185] hover:text-[#C7511F] hover:underline">EMI options</a>
        </p>
      </div>

      <hr className="border-gray-200 mb-4" />

      {/* Delivery Check Component */}
      <DeliveryCheck />

      {/* Stock & Seller */}
      <div className="mt-4 mb-6">
        {product.delivery?.inStock ? (
          <h3 className="text-lg font-medium text-[#007600] mb-2">In stock</h3>
        ) : (
          <h3 className="text-lg font-medium text-[#B12704] mb-2">Currently unavailable</h3>
        )}

        <div className="text-sm space-y-1">
          <div className="flex gap-4">
            <span className="text-[#565959] w-24">Ships from</span>
            <span className="font-medium text-[#0F1111]">IndiaFy</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-[#565959] w-24">Sold by</span>
            <a href={`/store/${product.seller.id}`} className="text-[#007185] hover:text-[#C7511F] hover:underline flex items-center gap-1">
              {product.seller.name}
              {product.seller.verified && <ShieldCheck size={14} className="text-[#007600]" />}
            </a>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default memo(ProductInfo);
