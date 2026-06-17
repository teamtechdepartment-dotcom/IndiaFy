/* eslint-disable react/prop-types */
import { memo } from "react";
import { Timer, Zap, Minus, Plus } from "lucide-react";

function ProductCard({ p, cartQty, onAdd, onInc, onDec }) {
  return (
    <div className="w-32 md:w-40 shrink-0 bg-white border border-gray-100 rounded-xl p-2.5 flex flex-col relative shadow-sm">
      <div className="absolute top-0 left-0 bg-[#FF4D4F] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-tl-xl rounded-br-lg z-10 shadow-sm flex items-center gap-0.5">
        <Zap size={10} className="fill-white" /> {p.discountPct}% OFF
      </div>
      <div className="w-full aspect-square bg-gray-50 rounded-lg mb-2 relative overflow-hidden">
        <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1 bg-gray-100 px-1 py-0.5 w-fit rounded text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
          <Timer size={8} /> 10 MINS
        </div>
        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{p.name}</h3>
        <p className="text-[10px] font-semibold text-gray-400 mb-2">{p.weight}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-gray-400 line-through">₹{p.mrp}</span>
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

function InstantDeals({ products, cart, onAdd, onInc, onDec, isLoading }) {
  if (isLoading) return null;

  const deals = products.filter(p => p.discountPct >= 10).slice(0, 10);
  if (deals.length === 0) return null;

  return (
    <div className="bg-[#F7F8FA] py-4">
      <div className="px-3 flex items-center justify-between mb-3">
        <h2 className="text-base font-black text-gray-900 flex items-center gap-1.5">
          Flash Deals <Zap size={16} className="text-[#FFD814] fill-[#FFD814]" />
        </h2>
        <div className="flex items-center gap-1 bg-[#FF4D4F]/10 text-[#FF4D4F] px-2 py-1 rounded-md text-[10px] font-bold">
          <Timer size={12} /> Ends in 02:45:10
        </div>
      </div>
      <div className="flex overflow-x-auto gap-3 px-3 pb-2 hide-scrollbar snap-x">
        {deals.map(p => (
          <div key={p.id} className="snap-start shrink-0">
            <ProductCard p={p} cartQty={cart[p.id] || 0} onAdd={onAdd} onInc={onInc} onDec={onDec} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(InstantDeals);
