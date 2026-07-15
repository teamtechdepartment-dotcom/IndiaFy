/* eslint-disable react/prop-types */
import { memo } from "react";
import { ShoppingBag, ChevronRight } from "lucide-react";

function QuickCartCTA({ totalItems, totalPrice, onOpen }) {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-transparent pointer-events-none z-50 md:bottom-4 md:left-auto md:right-4 md:w-96">
      <button 
        onClick={onOpen}
        className="w-full bg-[#00B55D] text-white p-3.5 rounded-xl shadow-[0_8px_20px_rgba(0,181,93,0.3)] flex items-center justify-between pointer-events-auto hover:bg-[#009b4f] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
             <ShoppingBag size={20} className="text-white" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-bold uppercase tracking-wider mb-0.5">{totalItems} Item{totalItems > 1 ? 's' : ''}</span>
            <span className="text-base font-black">₹{totalPrice}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold uppercase tracking-wide">
          View Cart <ChevronRight size={18} strokeWidth={3} />
        </div>
      </button>
    </div>
  );
}

export default memo(QuickCartCTA);
