import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Wallet, BadgeCheck, ArrowRight, Building2 } from "lucide-react";

const features = [
  {
    icon: <Package size={20} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Low MOQ",
    desc: "Order as little as 10 units",
  },
  {
    icon: <Wallet size={20} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Bulk Pricing",
    desc: "Save up to 40% on large orders",
  },
  {
    icon: <BadgeCheck size={20} className="text-[#065F46]" />,
    bg: "bg-blue-50",
    title: "Verified Suppliers",
    desc: "KYC-checked and platform-verified",
  },
];

export default function WholesaleStrip() {
  const navigate = useNavigate();

  return (
    <section className="bg-white px-2 py-4 border-b border-gray-100" id="wholesale">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/3 flex flex-col items-start"
          >
            <div className="flex items-center gap-2 mb-2 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded shadow-sm">
              <Building2 size={14} className="fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-wider">B2B Marketplace</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Wholesale for <span className="text-amber-600">Your Business</span>
            </h2>
            <p className="text-gray-500 text-xs font-medium mb-4 max-w-xs">
              Source products in bulk from verified wholesale suppliers with transparent pricing.
            </p>
            <button
              onClick={() => navigate("/wholesale")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#065F46] text-white font-bold text-sm rounded shadow-sm hover:bg-[#047857] transition-colors"
            >
              Explore Wholesale <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Right: Feature Cards */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-3 sm:p-4 bg-gray-50 rounded border border-gray-100 hover:border-amber-200 transition-colors"
              >
                <div className={`w-10 h-10 rounded ${feat.bg} flex items-center justify-center shrink-0`}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">{feat.title}</h3>
                  <p className="text-[11px] text-gray-500 font-medium leading-tight">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
