import React from "react";
import { ChevronRight, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Standardized Product Card matching the reference image UI
const FlashDealCard = ({ product, onAdd }) => {
  const navigate = useNavigate();
  
  return (
    <div className="group flex flex-col h-full border border-transparent hover:border-gray-200 hover:shadow-md rounded-md overflow-hidden transition-all duration-300 p-3 relative bg-white">
      {/* Image Container */}
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        className="relative aspect-square w-full overflow-hidden cursor-pointer bg-white mb-3 flex items-center justify-center"
      >
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* Orange Discount Badge - Top Left */}
        <div className="absolute top-0 left-0 px-2 py-0.5 bg-[#ff6161] text-white text-[10px] font-bold shadow-sm rounded-sm z-10 uppercase tracking-wide">
          {product.discount}% OFF
        </div>
        
        {/* Heart Wishlist Icon - Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/profile");
          }}
          className="absolute top-0 right-0 p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors z-10"
        >
          <Heart size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        {/* Title */}
        <h3
          onClick={() => navigate(`/product/${product.id}`)}
          className="text-sm font-semibold text-zinc-800 leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors min-h-[40px]"
        >
          {product.name}
        </h3>

        {/* Rating Row (Removed Assured logo from here) */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center gap-0.5 px-1.5 py-[2px] bg-[#388e3c] text-white rounded-[3px]">
            <span className="text-[10px] font-bold">4.8</span>
            <Star size={8} fill="white" strokeWidth={0} />
          </div>
          <span className="text-[10px] font-medium text-gray-500">(320)</span>
        </div>

        {/* Price Row */}
        <div className="mt-auto flex items-baseline gap-2 mb-1.5 flex-wrap">
          <span className="text-base font-bold text-zinc-900">₹{product.price}</span>
          <span className="text-[11px] font-medium text-gray-500 line-through">₹{product.mrp}</span>
          <span className="text-[11px] font-bold text-[#388e3c]">{product.discount}% off</span>
        </div>

        {/* Delivery Info */}
        <div className="text-[10px] text-gray-500 font-medium mb-3">
          Delivery in 15 min
        </div>

        {/* Add Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(product.id); }}
          className="w-full bg-white border border-gray-300 text-gray-700 text-[11px] sm:text-xs font-bold py-1.5 rounded hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm mt-auto"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default function FlashDeals({ onAdd, isLoading }) {
  const navigate = useNavigate();

  const flashProducts = [
    { id: 'f1', name: 'Premium A2 Desi Cow Ghee', weight: '1 kg', price: "1,299", mrp: "1,500", discount: 13, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80' },
    { id: 'f2', name: 'Luxury Silk Evening Wrap', weight: '1 pc', price: "2,450", mrp: "3,200", discount: 23, img: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&q=80' },
    { id: 'f3', name: 'Bulk Pack: Roasted Almonds (5kg)', weight: '5 kg', price: "4,800", mrp: "6,000", discount: 20, img: 'https://images.unsplash.com/photo-1599598425947-330026e138bf?w=400&q=80' },
    { id: 'f4', name: 'Handcrafted Ceramic Vase', weight: '1 pc', price: "899", mrp: "1,200", discount: 25, img: 'https://images.unsplash.com/photo-1627485937980-221c88ce04ea?w=400&q=80' },
  ];

  if (isLoading) return null;

  return (
    <div className="px-2 sm:px-4 py-4 bg-white border-y border-gray-100 my-2 shadow-sm">
      <div className="max-w-[1440px] mx-auto">
        
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">Trending Deals</h2>
          </div>
          <button 
            onClick={() => navigate('/flash-deals')}
            className="flex items-center justify-center bg-brand-primary text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-blue-800 transition-colors shadow-sm"
            aria-label="View All"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-2">
          {flashProducts.map((product) => (
            <FlashDealCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </div>
  );
}