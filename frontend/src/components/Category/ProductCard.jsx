/* eslint-disable react/prop-types */
import { memo, useState, useEffect } from "react";
import { Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { useInteractionStore } from "../../store/interactionStore";

function ProductCard({ product, viewMode, source = "organic", surface = "none" }) {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const trackInteraction = useInteractionStore(state => state.trackInteraction);

  // Intersection observer for VIEW attribution
  const { ref, inView } = useInView({
    triggerOnce: true, // Only track VIEW once per render
    threshold: 0.5, // 50% of the card must be visible
  });

  useEffect(() => {
    if (inView && product?.id) {
      trackInteraction({
        action: "VIEW",
        productId: product.id,
        categoryName: product.categoryName || "none",
        metadata: { source, surface }
      });
    }
  }, [inView, product, source, surface, trackInteraction]);

  const handleCardClick = () => {
    trackInteraction({
      action: "CLICK",
      productId: product.id,
      categoryName: product.categoryName || "none",
      metadata: { source, surface }
    });
    const refParam = source === "recommendation" && surface ? `?ref=${surface}` : "";
    navigate(`/product/${product.id}${refParam}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const newWishlistState = !wishlisted;
    setWishlisted(newWishlistState);
    
    trackInteraction({
      action: newWishlistState ? "WISHLIST_ADD" : "WISHLIST_REMOVE",
      productId: product.id,
      categoryName: product.categoryName || "none",
      metadata: { source, surface }
    });
  };

  const isList = viewMode === "list";
  const discountPercent = product.original > product.price 
    ? Math.round(((product.original - product.price) / product.original) * 100) 
    : 0;

  if (isList) {
    return (
      <div 
        ref={ref}
        onClick={handleCardClick}
        className="group flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer relative rounded-md"
      >
        <div className="w-full sm:w-[200px] aspect-square shrink-0 relative bg-gray-50 rounded-md flex items-center justify-center p-2">
           <img 
            src={product.img} 
            alt={product.name} 
            loading="lazy"
            decoding="async"
            className="max-w-full max-h-full object-contain group-hover:scale-102 transition-transform duration-300 mix-blend-multiply"
          />
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm hover:scale-105 transition-transform"
          >
            <Heart size={16} className={wishlisted ? "fill-[#065F46] text-[#065F46]" : "text-gray-400"} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {product.brand || product.categoryName || "IndiaFy"}
            </div>
            <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-[#065F46] leading-tight mb-2 line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 bg-[#065F46] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                {product.rating} <Star size={10} className="fill-white" />
              </div>
              <span className="text-[12px] font-medium text-gray-500">
                ({product.reviews?.toLocaleString()})
              </span>
            </div>
            <ul className="text-[12px] text-gray-600 space-y-1.5 list-disc pl-4 mb-4">
              <li>High Quality Product</li>
              <li>Verified Seller</li>
            </ul>
          </div>
        </div>

        <div className="w-full sm:w-[220px] shrink-0 flex flex-col sm:items-start py-2 sm:pl-4 sm:border-l border-gray-100">
           {product.campaign && (
             <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[11px] font-black shadow-sm tracking-wide">
               <span>🔥</span>
               <span>{product.campaign.badgeText || product.campaign.name}</span>
             </div>
           )}
           <div className="flex items-baseline gap-2 mb-1">
             <span className="text-[20px] font-bold text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
           </div>
           {product.original > product.price && (
             <div className="flex items-center gap-2 text-[13px] font-medium mb-2">
               <span className="text-gray-500 line-through">₹{product.original.toLocaleString("en-IN")}</span>
               <span className={product.campaign ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-xs font-bold' : 'text-[#065F46] font-bold'}>
                 {product.campaign ? `${product.campaign.discountValue}% OFF` : `${discountPercent}% off`}
               </span>
             </div>
           )}
           <p className="text-[12px] text-gray-700 mb-1">Free delivery</p>
           {product.eta && (
             <p className="text-[12px] font-bold text-gray-900 mb-3">
               Delivery in <span className="text-[#ea580c]">{product.eta}</span>
             </p>
           )}
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div 
      ref={ref}
      onClick={handleCardClick}
      className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200 cursor-pointer relative h-full rounded-md overflow-hidden"
    >
      {/* Top: Image Area */}
      <div className="relative w-full aspect-[4/5] bg-gray-50/80 p-4 flex items-center justify-center overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.campaign ? (
            <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <span>🔥</span>
              <span>{product.campaign.badgeText || product.campaign.name}</span>
            </span>
          ) : (
            discountPercent > 0 && (
              <span className="bg-[#ea580c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                {discountPercent}% OFF
              </span>
            )
          )}
          {product.badge === "Best Seller" && (
            <span className="bg-[#065F46] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm hover:scale-105 transition-transform z-10 text-gray-400 hover:text-[#065F46]"
        >
          <Heart size={16} className={wishlisted ? "fill-[#065F46] text-[#065F46]" : ""} />
        </button>

        <img 
          src={product.img} 
          alt={product.name} 
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300 mix-blend-multiply"
        />
      </div>

      {/* Info Area */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        {product.brand && (
          <div className="text-[11px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide truncate">
            {product.brand}
          </div>
        )}
        
        {/* Title */}
        <h3 className="text-[14px] font-medium text-gray-900 group-hover:text-[#065F46] line-clamp-2 mb-1.5 leading-snug">
          {product.name}
        </h3>

        {/* Ratings */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5 bg-[#065F46] text-white px-1 py-0.5 rounded text-[10px] font-bold">
            {product.rating} <Star size={9} className="fill-white" />
          </div>
          <span className="text-[11px] font-medium text-gray-500">
            ({product.reviews?.toLocaleString()})
          </span>
        </div>

        {/* Pricing & Delivery (Pushed to bottom) */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[16px] font-bold text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
            {product.original > product.price && (
              <span className="text-[12px] font-medium text-gray-500 line-through">₹{product.original.toLocaleString("en-IN")}</span>
            )}
            {product.campaign ? (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                {product.campaign.discountValue}% OFF
              </span>
            ) : (
              discountPercent > 0 && (
                <span className="text-[12px] font-bold text-[#065F46]">{discountPercent}% off</span>
              )
            )}
          </div>
          
          <div className="text-[11px] mt-1.5 font-medium flex items-center">
            {product.eta ? (
              <span className="text-[#ea580c] font-semibold flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#ea580c]"></span>
                Delivery by {product.eta}
              </span>
            ) : (
              <span className="text-gray-600 flex items-center gap-1">
                Free delivery
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);

