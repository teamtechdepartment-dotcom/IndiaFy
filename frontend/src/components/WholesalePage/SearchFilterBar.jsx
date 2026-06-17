import { memo, useState, useEffect } from "react";
import { Search, SlidersHorizontal, Check, ShieldCheck, ChevronDown } from "lucide-react";
import { useWholesaleStore } from "../../store/wholesaleStore";

const CATEGORIES = ["FMCG", "Electronics", "Fashion", "Grocery", "Industrial", "Packaging"];
const SORT_OPTIONS = ["Relevance", "Price: Low to High", "Price: High to Low", "MOQ: Low to High", "Rating: High to Low"];

function SearchFilterBar() {
  const { filters, setFilter, fetchWholesaleProducts } = useWholesaleStore();
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [moqValue, setMoqValue] = useState(500);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter("search", localSearch);
      fetchWholesaleProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, setFilter, fetchWholesaleProducts]);

  const toggleCategory = (cat) => {
    const current = filters.category || [];
    if (current.includes(cat)) {
      setFilter('category', current.filter(c => c !== cat));
    } else {
      setFilter('category', [...current, cat]);
    }
    fetchWholesaleProducts();
  };

  const handleMoqChange = (e) => {
    const val = e.target.value;
    setMoqValue(val);
    setFilter('moq', val);
    fetchWholesaleProducts();
  };

  return (
    <section className="sticky top-0 z-40 w-full bg-white border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Top Row: Search & Toggles */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products, suppliers, or categories..." 
              className="w-full bg-gray-50 border border-brand-border rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => { setFilter('gstVerified', !filters.gstVerified); fetchWholesaleProducts(); }}
              className={`px-4 py-2.5 rounded-md text-xs font-bold border transition-colors flex items-center gap-2 ${filters.gstVerified ? 'bg-blue-50 border-brand-primary text-brand-primary' : 'bg-white border-brand-border text-brand-text-secondary hover:bg-gray-50'}`}
            >
              <ShieldCheck size={16} className={filters.gstVerified ? "text-brand-primary" : "text-gray-400"} />
              Verified Suppliers Only
            </button>
            
            <div className="relative group hidden md:block">
              <button className="px-4 py-2.5 rounded-md text-xs font-bold border border-brand-border bg-white text-brand-text-secondary hover:bg-gray-50 transition-colors flex items-center gap-2">
                Sort By <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-brand-border rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt} className="w-full text-left px-4 py-2 text-xs text-brand-text-primary hover:bg-gray-50">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="md:hidden px-4 py-2.5 rounded-md bg-brand-primary text-white flex items-center gap-2 text-xs font-bold">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Category Chips & MOQ Slider */}
        <div className="hidden md:flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar flex-1">
            <span className="text-xs font-semibold text-brand-text-secondary mr-2 shrink-0">Categories:</span>
            {CATEGORIES.map(cat => {
              const isActive = (filters.category || []).includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 flex items-center gap-1 ${isActive ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-brand-text-secondary border-brand-border hover:border-gray-300'}`}
                >
                  {isActive && <Check size={12} />}
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 shrink-0 min-w-[250px]">
            <span className="text-xs font-semibold text-brand-text-secondary">Max MOQ: <span className="text-brand-text-primary">{moqValue}</span></span>
            <input 
              type="range" 
              min="1" 
              max="1000" 
              step="10"
              value={moqValue}
              onChange={handleMoqChange}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export default memo(SearchFilterBar);
