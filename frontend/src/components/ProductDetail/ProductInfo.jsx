/* eslint-disable react/prop-types */
import { memo } from "react";
import { Star, ShieldCheck } from "lucide-react";
import DeliveryCheck from "./DeliveryCheck";

function ProductInfo({ product }) {
  const discount = Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100);

  return (
    <div className="flex flex-col text-gray-900 font-sans">
      {/* Brand & Title */}
      <a href="#" className="text-xs font-bold text-[#065F46] hover:text-[#047857] uppercase tracking-wide mb-2 inline-block">
        Explore {product.brand} Products
      </a>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-3">
        {product.title}
      </h1>

      {/* Ratings */}
      <div className="flex items-center gap-4 mb-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#065F46] text-white px-1.5 py-0.5 rounded text-[11px] font-bold shadow-sm">
            {product.rating} <Star size={10} className="fill-white" />
          </div>
          <a href="#reviews" className="text-sm font-medium text-gray-500 hover:text-[#065F46] hover:underline">
            {product.reviewCount.toLocaleString()} Ratings & Reviews
          </a>
        </div>
      </div>

      {/* Price Block */}
      <div className="mb-6">
        {product.campaign && (
          <div className="mb-3 p-3 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-orange-500/10 border border-rose-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-sm font-black text-rose-600 uppercase tracking-wide">
                  {product.campaign.name || product.campaign.badgeText}
                </p>
                <p className="text-xs text-gray-600">Exclusive Promotional Sale</p>
              </div>
            </div>
            <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-xs">
              {product.campaign.discountValue}% OFF
            </span>
          </div>
        )}
        <div className="flex items-end gap-3 mb-1">
          <span className="text-3xl font-bold text-gray-900">₹{product.currentPrice.toLocaleString("en-IN")}</span>
          {product.originalPrice > product.currentPrice && (
            <>
              <span className="text-sm text-gray-500 line-through mb-1">₹{product.originalPrice.toLocaleString("en-IN")}</span>
              <span className={`text-sm font-bold mb-1 ${product.campaign ? 'text-rose-600' : 'text-[#065F46]'}`}>
                {product.campaign ? `${product.campaign.discountValue}% OFF` : `${discount}% off`}
              </span>
            </>
          )}
        </div>
        {product.originalPrice > product.currentPrice && (
          <p className="text-xs font-bold text-emerald-600 mb-1">
            You save ₹{(product.originalPrice - product.currentPrice).toLocaleString("en-IN")}
          </p>
        )}
        <p className="text-sm font-bold mt-1">Inclusive of all taxes</p>
        <p className="text-sm mt-1 text-gray-600">
          <span className="font-bold text-gray-900">EMI</span> starts at ₹{(product.currentPrice / 6).toFixed(0)}. No Cost EMI available <a href="#" className="text-[#065F46] hover:underline">EMI options</a>
        </p>
      </div>

      <hr className="border-gray-200 mb-4" />

      {/* Delivery Check Component */}
      <DeliveryCheck />

      {/* Stock & Seller */}
      <div className="mt-4 mb-6">
        {product.delivery?.inStock ? (
          <h3 className="text-lg font-medium text-[#065F46] mb-2">In stock</h3>
        ) : (
          <h3 className="text-lg font-medium text-red-600 mb-2">Currently unavailable</h3>
        )}

        <div className="text-sm space-y-1">
          <div className="flex gap-4">
            <span className="text-gray-500 w-24">Ships from</span>
            <span className="font-medium text-gray-900">IndiaFy</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-gray-500 w-24">Sold by</span>
            <a href={`/store/${product.seller.id}`} className="text-[#065F46] hover:underline flex items-center gap-1">
              {product.seller.name}
              {product.seller.verified && <ShieldCheck size={14} className="text-[#065F46]" />}
            </a>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default memo(ProductInfo);
