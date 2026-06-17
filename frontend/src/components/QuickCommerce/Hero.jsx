import { memo } from "react";
import { MapPin, ChevronDown } from "lucide-react";

function Hero() {
  return (
    <div className="bg-white pt-3 pb-2 px-3">
      {/* Location & ETA Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
             <MapPin size={22} className="text-[#00B55D]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-gray-900 leading-none">Blinkit in 10 minutes</h1>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold mt-0.5">
              <span>Home - Sector 57, Gurugram</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Hero);
