import { Plus, Minus, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const RECOMMENDED = [
  { id: "rec-1", name: "Nestle Maggi", weight: "4 pack", price: 56, mrp: 56, eta: "10 min", img: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=300&q=80" },
  { id: "rec-2", name: "Parle-G Biscuits", weight: "800 g", price: 75, mrp: 80, eta: "12 min", img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80" },
  { id: "rec-3", name: "Surf Excel Liquid", weight: "500 ml", price: 135, mrp: 150, eta: "15 min", img: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300&q=80" },
  { id: "rec-4", name: "Colgate MaxFresh", weight: "150 g", price: 95, mrp: 110, eta: "12 min", img: "https://images.unsplash.com/photo-1628359355624-855f54da4dc2?w=300&q=80" },
  { id: "rec-5", name: "Tata Tea Gold", weight: "250 g", price: 115, mrp: 130, eta: "15 min", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80" },
  { id: "rec-6", name: "Vim Liquid Wash", weight: "500 ml", price: 99, mrp: 115, eta: "12 min", img: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&q=80" },
];

export default function RecommendedProducts({ cart, onAdd, onInc, onDec, items = RECOMMENDED }) {
  return (
    <div className="px-4 py-5 bg-white border-t border-zinc-100">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-extrabold text-zinc-900">Recommended For You</h2>
            <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">Based on your cart & location</p>
          </div>
          <button className="flex items-center gap-0.5 text-[10px] font-bold text-brand-accent uppercase tracking-wider hover:underline">
            See All <ChevronRight size={12} />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {items.map((item, i) => {
            const qty = cart[item.id] || 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="shrink-0 w-[140px] sm:w-[160px] bg-zinc-50 rounded-2xl p-2.5 border border-zinc-100 hover:border-brand-accent/20 hover:shadow-sm transition-all group"
              >
                <div className="w-full aspect-square bg-white rounded-xl mb-2 overflow-hidden border border-zinc-100/50 relative">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-zinc-100/50">
                    <Clock size={7} className="text-zinc-500" />
                    <span className="text-[7px] font-extrabold text-zinc-600">{item.eta}</span>
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] font-bold text-zinc-800 leading-tight line-clamp-1 mb-0.5">
                  {item.name}
                </p>
                <p className="text-[8px] font-semibold text-zinc-400 mb-2">
                  {item.weight}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold text-zinc-900">₹{item.price}</span>
                    {item.price !== item.mrp && (
                      <span className="text-[8px] font-bold text-zinc-400 line-through ml-0.5">₹{item.mrp}</span>
                    )}
                  </div>
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
                      aria-label={`Add ${item.name}`}
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

