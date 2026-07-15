import { memo, useState, useEffect } from "react";
import { Timer, ArrowRight, TrendingDown } from "lucide-react";

const DEALS = [
  { id: 1, name: "Premium A2 Desi Ghee (1L)", supplier: "Organic Roots Pvt Ltd", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400", moq: 50, stock: 120, discount: 35, price: 850, original: 1300, hoursLeft: 4 },
  { id: 2, name: "Industrial LED Floodlights", supplier: "LumenTech India", img: "https://images.unsplash.com/photo-1550522851-f739665bc8b1?q=80&w=400", moq: 200, stock: 850, discount: 42, price: 420, original: 720, hoursLeft: 12 },
];

function CountdownTimer({ initialHours }) {
  const [timeLeft, setTimeLeft] = useState(initialHours * 3600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 text-red-500 font-mono font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
      <Timer size={14} /> {h}:{m}:{s}
    </div>
  );
}

function LiveBulkDeals() {
  return (
    <section className="py-20 lg:py-32 bg-brand-background border-b border-brand-border">
      <div className="section-container">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 mb-4">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-red-600">Flash Contracts</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-display font-black text-brand-primary mb-4 tracking-tight">
              Live Bulk <span className="text-brand-accent">Deals</span>
            </h2>
            <p className="text-lg text-brand-text-secondary font-medium">
              Time-sensitive wholesale contracts with deep discounts from factory nodes.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {DEALS.map((deal) => (
            <div key={deal.id} className="bg-white border border-brand-border rounded-[24px] p-4 lg:p-6 flex flex-col sm:flex-row gap-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              
              <div className="relative w-full sm:w-48 aspect-square rounded-2xl bg-brand-background overflow-hidden shrink-0 border border-brand-border">
                <img loading="lazy" decoding="async" src={deal.img} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded border border-red-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown size={12} /> {deal.discount}% OFF
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-lg font-black text-brand-primary leading-snug">{deal.name}</h3>
                </div>
                
                <p className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest mb-4">By {deal.supplier}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-semibold text-brand-text-secondary uppercase">Deal Price</p>
                    <p className="text-xl font-black text-brand-accent">₹{deal.price}</p>
                    <p className="text-[10px] text-brand-text-secondary line-through">₹{deal.original}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-brand-text-secondary uppercase">MOQ</p>
                    <p className="text-xl font-black text-brand-primary">{deal.moq}</p>
                    <p className="text-[10px] text-brand-text-secondary uppercase font-bold">Units</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-1">
                    <span>Stock Left</span>
                    <span className="text-amber-500">{deal.stock} Units</span>
                  </div>
                  <div className="w-full h-2 bg-brand-border rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-1/3" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-border">
                  <CountdownTimer initialHours={deal.hoursLeft} />
                  <button className="text-xs font-bold text-white bg-brand-primary px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-brand-accent transition-colors flex items-center gap-2">
                    Claim Deal <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default memo(LiveBulkDeals);
