import { memo } from "react";
import { Clock, ShieldCheck, Tag, Undo2 } from "lucide-react";

function FastDeliveryBenefits() {
  const benefits = [
    { icon: <Clock size={20} />, title: "Under 30 Min Delivery", subtitle: "Lightning fast" },
    { icon: <ShieldCheck size={20} />, title: "Fresh Stock", subtitle: "Quality checked" },
    { icon: <Tag size={20} />, title: "Best Prices", subtitle: "Guaranteed savings" },
    { icon: <Undo2 size={20} />, title: "Easy Returns", subtitle: "No questions asked" }
  ];

  return (
    <div className="bg-white py-6 border-t border-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
        {benefits.map((b, i) => (
          <div key={i} className="flex flex-col items-center justify-center text-center p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-[#00B55D]/10 rounded-full flex items-center justify-center text-[#00B55D] mb-2">
              {b.icon}
            </div>
            <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-0.5">{b.title}</h4>
            <p className="text-[9px] font-semibold text-gray-500">{b.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(FastDeliveryBenefits);
