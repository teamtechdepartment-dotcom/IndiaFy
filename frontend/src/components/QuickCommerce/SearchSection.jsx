import { useState, useRef, useEffect } from "react";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const RECENT_SEARCHES = ["Milk", "Eggs", "Bread", "Medicine"];
const TRENDING_SEARCHES = ["Atta", "Rice", "Sugar", "Curd", "Paneer", "Banana"];

export default function SearchSection({ onSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (term) => {
    const t = term || query;
    if (t.trim()) {
      setFocused(false);
      if (onSearch) {
        onSearch(t.trim());
      } else {
        navigate(`/search?query=${encodeURIComponent(t.trim())}`);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = focused && query.length === 0;

  return (
    <div ref={wrapperRef} className="relative px-4 py-3 bg-white border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto">
        <div
          className={`relative flex items-center bg-zinc-100 rounded-2xl transition-all duration-200 ${
            focused ? "ring-2 ring-brand-accent/30 bg-white shadow-md" : ""
          }`}
        >
          <Search size={16} className="absolute left-3.5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search milk, bread, medicines..."
            className="w-full bg-transparent py-3 pl-10 pr-10 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
            aria-label="Search products"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-zinc-300 transition-colors"
              aria-label="Clear search"
            >
              <X size={12} className="text-zinc-600" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mx-4 mt-2 bg-white rounded-2xl border border-zinc-100 shadow-xl z-50 overflow-hidden"
            >
              {/* Recent */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Clock size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Recent
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RECENT_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); handleSubmit(term); }}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 rounded-lg transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div className="px-4 pt-3 pb-4 border-t border-zinc-50">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <TrendingUp size={12} className="text-orange-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Trending
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); handleSubmit(term); }}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-xs font-bold text-orange-700 rounded-lg transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
