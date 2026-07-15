import { memo } from "react";
import { TrendingUp, Activity, IndianRupee } from "lucide-react";

const OPPORTUNITIES = [
  {
    category: "Electronics",
    product: "9W Smart LED Bulb",
    img: "https://images.unsplash.com/photo-1550522851-f739665bc8b1?q=80&w=400",
    buy: 120,
    sell: 180,
    profit: 60,
    roi: 50,
    demand: "High"
  },
  {
    category: "Garments",
    product: "Cotton Blend T-Shirts",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400",
    buy: 150,
    sell: 299,
    profit: 149,
    roi: 99,
    demand: "Very High"
  },
  {
    category: "Beauty",
    product: "Organic Face Serum",
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400",
    buy: 210,
    sell: 450,
    profit: 240,
    roi: 114,
    demand: "Growing"
  }
];

function ProfitOpportunities() {
  return (
    <section className="py-20 lg:py-32 bg-white border-b border-brand-border overflow-hidden">
      <div className="section-container">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4">
              <TrendingUp size={14} className="text-amber-600" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-600">Business Outcomes</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-display font-black text-brand-primary mb-4 tracking-tight">
              Most Profitable <span className="text-amber-500">Categories</span>
            </h2>
            <p className="text-lg text-brand-text-secondary font-medium">
              Real market data showing the exact profit margins you can make by sourcing directly from our verified manufacturers.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {OPPORTUNITIES.map((opp, idx) => (
            <div key={idx} className="bg-white rounded-[24px] border border-brand-border shadow-lg p-6 lg:p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <img loading="lazy" decoding="async" src={opp.img} alt={opp.product} className="w-16 h-16 rounded-xl object-cover border border-brand-border shadow-sm" />
                <div>
                  <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest mb-1">{opp.category}</p>
                  <h3 className="text-lg font-black text-brand-primary leading-tight">{opp.product}</h3>
                </div>
              </div>

              {/* Data Grid */}
              <div className="bg-brand-background rounded-2xl p-6 border border-brand-border mb-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1">Buy Price</p>
                    <p className="text-xl font-bold text-brand-primary">₹{opp.buy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-1">Sell Price</p>
                    <p className="text-xl font-bold text-brand-primary">₹{opp.sell}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-accent uppercase tracking-wider mb-1">Profit/Unit</p>
                    <p className="text-xl font-black text-brand-accent">₹{opp.profit}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">Est. ROI</p>
                    <p className="text-xl font-black text-amber-500">{opp.roi}%</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-brand-border pt-6">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-brand-text-secondary" />
                  <span className="text-sm font-bold text-brand-text-secondary uppercase tracking-widest">Demand</span>
                </div>
                <div className="px-3 py-1 bg-brand-primary text-white text-xs font-bold uppercase tracking-widest rounded-full">
                  {opp.demand}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default memo(ProfitOpportunities);
