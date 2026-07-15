/* eslint-disable react/prop-types */
import { memo } from "react";
import { Star } from "lucide-react";

function RelatedProducts({ products, title }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h2 className="text-xl font-bold text-[#C7511F] mb-4">{title}</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {products.map((p) => (
          <div 
            key={p.id} 
            className="w-[160px] md:w-[200px] shrink-0 group cursor-pointer"
          >
            <div className="bg-gray-50 p-4 flex justify-center items-center h-[160px] md:h-[200px] mb-3 rounded-xl border border-gray-100 hover:border-[#2874F0]/30 transition-colors">
              <img src={p.img} alt={p.name} className="max-w-full max-h-full object-contain mix-blend-multiply hover:scale-105 transition-transform" />
            </div>
            
            <a href={`/product/${p.id}`} className="text-[13px] md:text-sm text-[#2874F0] hover:text-[#FB641B] hover:underline line-clamp-2 mb-2 font-medium break-words">
              {p.name}
            </a>
            
            <div className="flex items-center gap-1 mb-1">
              <div className="flex text-[#FFA41C]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(p.rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs text-[#007185]">{p.rating}</span>
            </div>
            
            <div className="text-[#B12704] text-sm md:text-base font-medium">
              ₹{p.price.toLocaleString("en-IN")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(RelatedProducts);
