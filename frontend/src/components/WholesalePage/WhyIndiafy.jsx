import { memo } from "react";
import { TrendingUp, Factory, ArrowDownCircle, Zap, ShieldCheck, Map } from "lucide-react";

function WhyIndiafy() {
  const benefits = [
    {
      icon: <TrendingUp size={24} />,
      title: "Better Margins",
      desc: "Increase profitability with direct factory pricing and tiered bulk discounts."
    },
    {
      icon: <Factory size={24} />,
      title: "Direct Sourcing",
      desc: "Connect directly with manufacturers. No middlemen, no hidden commissions."
    },
    {
      icon: <ArrowDownCircle size={24} />,
      title: "Lower Costs",
      desc: "Reduce procurement costs through consolidated shipping and negotiated rates."
    },
    {
      icon: <Zap size={24} />,
      title: "Faster Fulfillment",
      desc: "Strict SLA enforcement ensures your inventory arrives exactly when promised."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Verified Suppliers",
      desc: "Every seller is physically verified and GST-checked for absolute trust."
    },
    {
      icon: <Map size={24} />,
      title: "Pan-India Delivery",
      desc: "Extensive logistics network covering 18+ states with secure warehousing."
    }
  ];

  return (
    <section className="py-16 bg-brand-background border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <h2 className="text-2xl lg:text-3xl font-black text-brand-text-primary mb-2">
            Procurement Advantage
          </h2>
          <p className="text-sm text-brand-text-secondary font-medium">
            Enterprise infrastructure built for scale and reliability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="bg-white border border-brand-border rounded-xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 text-brand-primary">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-text-primary mb-1">{benefit.title}</h3>
                <p className="text-xs font-medium text-brand-text-secondary leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default memo(WhyIndiafy);
