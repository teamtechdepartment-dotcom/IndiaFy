import { memo } from "react";
import { Star, ShieldCheck, Quote, TrendingUp } from "lucide-react";

const TESTIMONIALS = [
  { id: 1, name: "Rajesh Kumar", role: "Kirana Store Owner", location: "Delhi", text: "Indiafy completely transformed my sourcing. I used to rely on 3 different local brokers. Now I buy directly from manufacturers with 30% better margins.", profit: "+30% Margins" },
  { id: 2, name: "Anita Sharma", role: "FMCG Distributor", location: "Mumbai", text: "The video packing feature gives us absolute peace of mind when ordering bulk groceries. Faster sourcing and zero disputes in the last 6 months.", profit: "Zero Disputes" },
  { id: 3, name: "Vikram Singh", role: "Electronics Reseller", location: "Bangalore", text: "Finding GST-verified suppliers was a nightmare. Indiafy's network saved us weeks of background checks. Better pricing from day one.", profit: "2x Sourcing Speed" }
];

function BusinessTestimonials() {
  return (
    <section className="py-16 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <h2 className="text-2xl lg:text-3xl font-black text-brand-text-primary mb-2">
            Trusted by Thousands of Businesses
          </h2>
          <p className="text-sm text-brand-text-secondary font-medium">
            Join leading retailers and distributors sourcing efficiently across India.
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 overflow-x-auto gap-6 pb-4 hide-scrollbar snap-x snap-mandatory">
          {TESTIMONIALS.map((test) => (
            <div 
              key={test.id} 
              className="snap-start shrink-0 w-[300px] md:w-auto bg-gray-50 border border-brand-border rounded-xl p-6 flex flex-col relative"
            >
              <Quote size={24} className="text-gray-300 absolute top-6 right-6" fill="currentColor" />
              
              <div className="flex items-center gap-1 text-amber-500 mb-4">
                 {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>

              <p className="text-sm font-medium text-brand-text-primary leading-relaxed mb-6 flex-1">
                "{test.text}"
              </p>

              <div className="bg-white border border-brand-border rounded-lg p-3 mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">{test.profit}</span>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-sm shrink-0">
                  {test.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-text-primary flex items-center gap-1">
                    {test.name}
                    <ShieldCheck size={14} className="text-blue-500" />
                  </h4>
                  <p className="text-xs font-semibold text-brand-text-secondary">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default memo(BusinessTestimonials);
