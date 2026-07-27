import { memo } from "react";
import {
  CreditCard, Truck, SearchCheck, FileText, Globe,
  Warehouse, Package, Store, Download, BarChart3,
  Briefcase, ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";

const SERVICES = [
  { icon: CreditCard, title: "Business Credit Line", desc: "Up to ₹5 Lakhs instant credit with 0% interest for 30 days.", badge: "Instant Approval", color: "from-blue-500/10 to-indigo-500/10 text-blue-600" },
  { icon: Truck, title: "Logistics & Freight", desc: "Doorstep pickup and insured pan-India delivery across 18+ states.", badge: "Pan-India", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600" },
  { icon: SearchCheck, title: "Quality Inspection", desc: "On-site 3rd party quality check and mandatory video packing proof.", badge: "Zero Disputes", color: "from-amber-500/10 to-orange-500/10 text-amber-600" },
  { icon: FileText, title: "100% GST Invoicing", desc: "Automated GST-compliant tax invoices for seamless input tax credit.", badge: "ITC Eligible", color: "from-purple-500/10 to-violet-500/10 text-purple-600" },
  { icon: Globe, title: "Global Export Support", desc: "End-to-end documentation, customs clearance, and freight forwarding.", badge: "Export Ready", color: "from-cyan-500/10 to-blue-500/10 text-cyan-600" },
  { icon: Warehouse, title: "Secure Warehousing", desc: "Bonded and climate-controlled storage hubs in major wholesale markets.", badge: "50+ Hubs", color: "from-rose-500/10 to-pink-500/10 text-rose-600" },
  { icon: Package, title: "Custom Packaging", desc: "Private labeling, branded cartons, and protective packaging solutions.", badge: "White Label", color: "from-teal-500/10 to-emerald-500/10 text-teal-600" },
  { icon: Store, title: "Custom Bulk Branding", desc: "Custom bundling, private packaging, and stockist branding solutions for retailers.", badge: "Dealer Direct", color: "from-indigo-500/10 to-purple-500/10 text-indigo-600" },
  { icon: Download, title: "Import Assistance", desc: "Direct sourcing from major international trade hubs with duty optimization.", badge: "Duty Save", color: "from-orange-500/10 to-amber-500/10 text-orange-600" },
  { icon: BarChart3, title: "AI Market Insights", desc: "Real-time retail demand analytics, trending SKUs, and wholesale price forecasting.", badge: "Live Trends", color: "from-violet-500/10 to-fuchsia-500/10 text-violet-600" },
];

function BusinessServices() {
  const handleServiceClick = (title) => {
    toast.info(`Inquiring about ${title}. Our wholesale support team will connect with you.`);
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-white">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 pb-4 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-wider uppercase text-[#2563EB] bg-[#EAF1FE] px-3.5 py-1 rounded-full mb-3">
              <Briefcase size={15} />
              <span>Wholesale Ecosystem</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1F2937]">
              Everything a Wholesale Buyer Needs
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] font-medium mt-1">
              End-to-end B2B sourcing infrastructure built to scale your retail business reliably.
            </p>
          </div>
          <a
            href="#services"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white font-extrabold text-xs sm:text-sm border border-gray-200/80 hover:border-[#2563EB] transition-all duration-200 shrink-0 shadow-xs"
          >
            <span>Explore Enterprise Solutions</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                onClick={() => handleServiceClick(service.title)}
                className="flex flex-col justify-between border border-gray-200/80 rounded-2xl p-5 bg-white hover:border-[#2563EB] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-xs"
              >
                <div>
                  {/* Icon & Badge Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-[#4B5563] group-hover:bg-[#EAF1FE] group-hover:text-[#2563EB] transition-colors border border-gray-200/60">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg font-black text-[#1F2937] group-hover:text-[#2563EB] transition-colors mb-2 leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[#6B7280] leading-relaxed mb-4">
                    {service.desc}
                  </p>
                </div>

                {/* Footer link */}
                <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs sm:text-[13px] font-bold text-[#2563EB] group-hover:translate-x-0.5 transition-transform">
                  <span>Learn more</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default memo(BusinessServices);
