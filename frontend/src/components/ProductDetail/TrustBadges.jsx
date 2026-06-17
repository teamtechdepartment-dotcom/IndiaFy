import { memo } from "react";
import { ArrowLeftRight, Truck, ShieldCheck, Trophy } from "lucide-react";

function TrustBadges() {
  const BADGES = [
    { icon: <ArrowLeftRight size={24} className="text-[#2874F0] group-hover:text-white transition-colors" />, text: "7 Days Replacement" },
    { icon: <Truck size={24} className="text-[#2874F0] group-hover:text-white transition-colors" />, text: "Free Delivery" },
    { icon: <ShieldCheck size={24} className="text-[#2874F0] group-hover:text-white transition-colors" />, text: "1 Year Warranty" },
    { icon: <Trophy size={24} className="text-[#2874F0] group-hover:text-white transition-colors" />, text: "Top Brand" },
    { icon: <ShieldCheck size={24} className="text-[#2874F0] group-hover:text-white transition-colors" />, text: "Secure Checkout" }
  ];

  return (
    <div className="flex justify-between md:justify-start gap-4 md:gap-8 overflow-x-auto pb-4 custom-scrollbar mb-8 border-b border-gray-100">
      {BADGES.map((badge, idx) => (
        <div key={idx} className="flex flex-col items-center text-center w-[84px] shrink-0 cursor-pointer group">
          <div className="w-12 h-12 bg-[#2874F0]/5 group-hover:bg-[#2874F0] rounded-2xl flex items-center justify-center transition-colors shadow-sm">
            {badge.icon}
          </div>
          <span className="text-[11px] text-[#2874F0] group-hover:text-[#212121] font-bold leading-tight mt-3 transition-colors">
            {badge.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export default memo(TrustBadges);
