/* eslint-disable react/prop-types */
import { memo, useState } from "react";
import { Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, viewMode }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);

  const isList = viewMode === "list";

  if (isList) {
    return (
      <div 
        onClick={() => navigate(`/product/${product.id}`)}
        className="group flex flex-col sm:flex-row gap-4 p-4 bg-white border-b border-gray-100 hover:shadow-[0_3px_10px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer relative"
      >
        <div className="w-full sm:w-[200px] aspect-square sm:aspect-[3/4] shrink-0 relative bg-white flex items-center justify-center p-2">
           <img 
            src={product.img} 
            alt={product.name} 
            loading="lazy"
            decoding="async"
            width="200"
            height="200"
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm hover:scale-110 transition-transform"
          >
            <Heart size={16} className={wishlisted ? "fill-[#ff4343] text-[#ff4343]" : "text-gray-400"} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <h3 className="text-base font-medium text-[#212121] group-hover:text-[#2874F0] leading-tight mb-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 bg-[#388e3c] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                {product.rating} <Star size={10} className="fill-white" />
              </div>
              <span className="text-xs font-medium text-[#878787]">
                ({product.reviews.toLocaleString()} Ratings)
              </span>
            </div>
            <ul className="text-xs text-[#212121] space-y-1.5 list-disc pl-4 mb-4">
              <li>Premium Quality</li>
              <li>High Performance</li>
              <li>1 Year Warranty</li>
            </ul>
          </div>
        </div>

        <div className="w-full sm:w-[250px] shrink-0 flex flex-col sm:items-start py-2 sm:pl-4 sm:border-l border-gray-100">
           <div className="flex items-baseline gap-2 mb-1">
             <span className="text-2xl font-medium text-[#212121]">₹{product.price.toLocaleString("en-IN")}</span>
           </div>
           {product.original > product.price && (
             <div className="flex items-center gap-2 text-sm font-medium mb-2">
               <span className="text-[#878787] line-through">₹{product.original.toLocaleString("en-IN")}</span>
               <span className="text-[#388e3c]">{Math.round(((product.original - product.price) / product.original) * 100)}% off</span>
             </div>
           )}
           <p className="text-[11px] text-[#212121] mb-1">Free delivery</p>
           {product.eta && (
             <p className="text-[11px] font-bold text-[#212121] mb-3">
               Delivery by <span className="font-extrabold">{product.eta}</span>
             </p>
           )}
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="group flex flex-col bg-white border border-gray-100 hover:border-[#2874F0]/30 hover:shadow-xl transition-all duration-300 cursor-pointer relative h-full rounded-2xl overflow-hidden"
    >
      {/* Top: Image */}
      <div className="relative w-full aspect-[4/5] bg-white p-6 flex items-center justify-center overflow-hidden group-hover:bg-gray-50/50 transition-colors">
        <img 
          src={product.img} 
          alt={product.name} 
          loading="lazy"
          decoding="async"
          width="200"
          height="200"
          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
        />
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:scale-110 transition-transform z-10 text-gray-400 hover:text-[#FB641B]"
        >
          <Heart size={18} className={wishlisted ? "fill-[#FB641B] text-[#FB641B]" : ""} />
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.badge === "Best Seller" && (
            <span className="bg-[#2874F0] text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
              Bestseller
            </span>
          )}
          {product.badge === "Hot Deal" && (
            <span className="bg-[#FB641B] text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
              Hot Deal
            </span>
          )}
        </div>
      </div>

      {/* Middle & Bottom: Info */}
      <div className="p-4 flex flex-col flex-1 bg-white">
        {/* Brand & Name */}
        <div className="text-[11px] font-bold text-[#2874F0] mb-1.5 uppercase tracking-widest break-words">
          {product.brand}
        </div>
        <h3 className="text-sm font-semibold text-[#212121] group-hover:text-[#2874F0] line-clamp-2 mb-2 transition-colors break-words">
          {product.name}
        </h3>

        {/* Ratings */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-[#10B981] text-white px-1.5 py-0.5 rounded text-[11px] font-bold shadow-sm">
            {product.rating} <Star size={10} className="fill-white" />
          </div>
          <span className="text-xs font-medium text-gray-500">
            ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-[#212121]">₹{product.price.toLocaleString("en-IN")}</span>
            {product.original > product.price && (
              <>
                <span className="text-xs font-medium text-gray-400 line-through">₹{product.original.toLocaleString("en-IN")}</span>
                <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                  {Math.round(((product.original - product.price) / product.original) * 100)}% off
                </span>
              </>
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-2 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            Free delivery
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
