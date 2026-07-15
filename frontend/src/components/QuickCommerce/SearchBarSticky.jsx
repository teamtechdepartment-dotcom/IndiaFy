import { memo } from "react";
import { Search } from "lucide-react";

function SearchBarSticky() {
  return (
    <div className="sticky top-0 z-50 bg-white px-3 py-2 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search for milk, bread, eggs..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#00B55D] focus:bg-white transition-colors placeholder:font-normal placeholder:text-gray-400 shadow-inner"
        />
      </div>
    </div>
  );
}

export default memo(SearchBarSticky);
