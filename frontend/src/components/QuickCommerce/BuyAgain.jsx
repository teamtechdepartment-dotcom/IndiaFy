import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { BuyAgainSkeleton } from "./LoadingSkeletons";

const BUY_AGAIN_ITEMS = [
  {
    id: "ba-1",
    name: "Amul Taaza Milk",
    weight: "500 ml",
    price: 27,
    img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80",
  },
  {
    id: "ba-2",
    name: "Farm Fresh Eggs",
    weight: "6 pcs",
    price: 54,
    img: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&q=80",
  },
  {
    id: "ba-3",
    name: "Britannia Bread",
    weight: "400 g",
    price: 50,
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80",
  },
  {
    id: "ba-4",
    name: "Fresh Banana",
    weight: "6 pcs",
    price: 35,
    img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&q=80",
  },
  {
    id: "ba-5",
    name: "Mother Dairy Curd",
    weight: "400 g",
    price: 40,
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80",
  },
];

export default function BuyAgain({ cart, onAdd, onInc, onDec, isLoading, items = BUY_AGAIN_ITEMS }) {
  if (isLoading) {
    return (
      <div className="px-4 py-4">
        <div className="max-w-[1440px] mx-auto">
          <div className="w-24 h-4 bg-zinc-100 rounded-md mb-3 animate-pulse" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <BuyAgainSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 bg-white border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-zinc-900">Buy Again</h2>
          <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
            Your favourites
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {items.map((item, i) => {
            const qty = cart[item.id] || 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0 w-[130px] bg-zinc-50 rounded-2xl p-2.5 border border-zinc-100 hover:border-brand-accent/30 hover:shadow-sm transition-all group"
              >
                <div className="w-full aspect-square bg-white rounded-xl mb-2 overflow-hidden border border-zinc-100/50">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <p className="text-[11px] font-bold text-zinc-800 leading-tight line-clamp-1 mb-0.5">
                  {item.name}
                </p>
                <p className="text-[9px] font-semibold text-zinc-400 mb-1.5">
                  {item.weight}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-900">
                    ₹{item.price}
                  </span>
                  {qty > 0 ? (
                    <div className="flex items-center bg-brand-accent text-white rounded-lg h-7 shadow-sm">
                      <button
                        onClick={() => onDec(item.id)}
                        className="w-6 h-full flex items-center justify-center active:bg-brand-accent-hover rounded-l-lg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={10} strokeWidth={3} />
                      </button>
                      <span className="w-4 text-center text-[9px] font-black">{qty}</span>
                      <button
                        onClick={() => onInc(item.id)}
                        className="w-6 h-full flex items-center justify-center active:bg-brand-accent-hover rounded-r-lg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onAdd(item.id)}
                      className="w-7 h-7 rounded-lg bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white flex items-center justify-center active:scale-90 transition-all"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

