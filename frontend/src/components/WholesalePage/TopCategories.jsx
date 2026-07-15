import { memo } from "react";
import { ArrowUpRight, ShoppingBasket, Laptop, Package, Shirt, Wrench, Home, Sparkles, Box } from "lucide-react";

const CATEGORIES = [
  { id: "fmcg", name: "FMCG", icon: <Box size={24} />, moq: "₹5,000", count: "1,240 Suppliers" },
  { id: "grocery", name: "Grocery", icon: <ShoppingBasket size={24} />, moq: "₹2,000", count: "4,500 Suppliers" },
  { id: "electronics", name: "Electronics", icon: <Laptop size={24} />, moq: "10 Units", count: "3,100 Suppliers" },
  { id: "packaging", name: "Packaging", icon: <Package size={24} />, moq: "500 Pcs", count: "850 Suppliers" },
  { id: "fashion", name: "Fashion", icon: <Shirt size={24} />, moq: "50 Pcs", count: "3,500 Suppliers" },
  { id: "industrial", name: "Industrial Tools", icon: <Wrench size={24} />, moq: "₹10,000", count: "2,100 Suppliers" },
  { id: "home", name: "Home Supplies", icon: <Home size={24} />, moq: "20 Units", count: "1,800 Suppliers" },
  { id: "beauty", name: "Beauty Wholesale", icon: <Sparkles size={24} />, moq: "₹5,000", count: "1,100 Suppliers" },
];

function TopCategories() {
  return (
    <section className="py-12 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-brand-text-primary mb-2">
              Browse Categories
            </h2>
            <p className="text-sm text-brand-text-secondary font-medium">
              Source products from thousands of verified manufacturers
            </p>
          </div>
          <button className="text-sm font-bold text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1 shrink-0">
            View All Categories <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id}
              className="group bg-white border border-brand-border hover:border-brand-primary rounded-xl p-4 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-brand-primary group-hover:bg-blue-50 transition-colors">
                  {cat.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary bg-gray-50 px-2 py-1 rounded">
                  {cat.count}
                </span>
              </div>
              <h3 className="text-sm font-bold text-brand-text-primary mb-1 group-hover:text-brand-primary transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs font-semibold text-brand-text-secondary">
                Min. Order: <span className="text-brand-text-primary">{cat.moq}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TopCategories);
