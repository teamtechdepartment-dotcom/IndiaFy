/* eslint-disable react/prop-types */
import { memo } from "react";
import { Timer, Minus, Plus } from "lucide-react";

export function ProductCard({ p, cartQty, onAdd, onInc, onDec }) {
  return (
    <div className="bg-[#f4f5f7] border border-gray-200/60 rounded-xl p-2.5 flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
      {p.discountPct > 0 && (
        <div className="absolute top-0 left-0 bg-[#00B55D] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-tl-xl rounded-br-lg z-10 shadow-sm">
          {p.discountPct}% OFF
        </div>
      )}
      
      {/* Top: Image */}
      <div className="w-full aspect-square bg-[#eef0f2] rounded-lg mb-2 overflow-hidden border border-gray-200/40">
         <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform" />
      </div>

      {/* Middle: Info */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1 bg-gray-100 px-1 py-0.5 w-fit rounded text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
          <Timer size={8} /> {p.eta}
        </div>
        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-1 group-hover:text-[#00B55D] transition-colors">{p.name}</h3>
        <p className="text-[10px] font-semibold text-gray-400 mb-2">{p.weight}</p>
        
        {/* Bottom: Price & CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col leading-none">
            {p.mrp > p.price && <span className="text-[10px] text-gray-400 line-through">₹{p.mrp}</span>}
            <span className="text-xs font-black text-gray-900">₹{p.price}</span>
          </div>
          
          {cartQty > 0 ? (
            <div className="flex items-center bg-[#00B55D] text-white rounded-lg h-7 shadow-sm overflow-hidden border border-[#00B55D]">
              <button onClick={() => onDec(p.id)} className="w-7 h-full flex items-center justify-center hover:bg-black/10 transition-colors">
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="w-4 text-center text-[10px] font-bold">{cartQty}</span>
              <button onClick={() => onInc(p.id)} className="w-7 h-full flex items-center justify-center hover:bg-black/10 transition-colors">
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onAdd(p.id)}
              className="px-4 py-1.5 bg-white border border-[#00B55D] text-[#00B55D] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#00B55D]/5 transition-colors shadow-sm"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PopularProducts({ products, cart, onAdd, onInc, onDec, isLoading }) {
  if (isLoading) return null;
  const popProducts = products.slice(0, 10);
  if (popProducts.length === 0) return null;

  return (
    <div className="bg-white py-4 border-t border-gray-100">
      <div className="px-3 mb-3">
        <h2 className="text-base font-black text-gray-900">Most Popular</h2>
      </div>
      <div className="px-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {popProducts.map(p => (
             <ProductCard key={p.id} p={p} cartQty={cart[p.id] || 0} onAdd={onAdd} onInc={onInc} onDec={onDec} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(PopularProducts);
