import { memo } from "react";
import { Tag, CreditCard, Percent } from "lucide-react";

function OfferSection() {
  const OFFERS = [
    {
      icon: <Percent size={18} className="text-[#FB641B]" />,
      title: "Bank Offer",
      desc: "Upto ₹1,500.00 discount on select Credit Cards, select Debit Cards",
      link: "2 offers"
    },
    {
      icon: <CreditCard size={18} className="text-[#FB641B]" />,
      title: "No Cost EMI",
      desc: "Upto ₹1,349.00 EMI interest savings on select Credit Cards",
      link: "1 offer"
    },
    {
      icon: <Tag size={18} className="text-[#FB641B]" />,
      title: "Partner Offers",
      desc: "Get GST invoice and save up to 28% on business purchases.",
      link: "1 offer"
    }
  ];

  return (
    <div className="mb-8 border border-gray-100 bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#2874F0]/10 flex items-center justify-center">
          <Tag size={16} className="text-[#2874F0]" />
        </div>
        <h3 className="text-base font-bold text-[#212121]">Special Offers</h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {OFFERS.map((offer, idx) => (
          <div key={idx} className="w-[160px] shrink-0 border border-gray-100 rounded-xl p-3 bg-gray-50 hover:bg-[#2874F0]/5 hover:border-[#2874F0]/30 transition-colors">
            <div className="mb-2 bg-white w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0">{offer.icon}</div>
            <h4 className="text-[13px] font-bold text-[#212121] mb-1.5">{offer.title}</h4>
            <p className="text-[12px] text-gray-600 line-clamp-3 mb-2">{offer.desc}</p>
            <a href="#" className="text-[12px] text-[#2874F0] hover:text-[#FB641B] font-bold hover:underline mt-auto inline-block">
              {offer.link} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(OfferSection);
