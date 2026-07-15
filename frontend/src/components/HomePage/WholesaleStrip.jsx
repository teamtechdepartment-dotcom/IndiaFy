import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Wallet, BadgeCheck, ArrowRight, Building2 } from "lucide-react";

const features = [
  {
    icon: <Package size={22} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Low MOQ",
    desc: "Order as little as 10 units from verified wholesale sellers",
  },
  {
    icon: <Wallet size={22} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Bulk Pricing",
    desc: "Save up to 40% on large orders with transparent tiered pricing",
  },
  {
    icon: <BadgeCheck size={22} className="text-blue-600" />,
    bg: "bg-blue-50",
    title: "Verified Suppliers",
    desc: "All business sellers are KYC-checked and platform-verified",
  },
];

export default function WholesaleStrip() {
  const navigate = useNavigate();

  return (
    <section className="py-section-mobile md:py-section-tablet lg:py-20 bg-brand-background" id="wholesale">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-amber-100">
                <Building2 size={18} className="text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">B2B Marketplace</span>
            </div>
            <h2 className="section-heading mb-3">
              Wholesale for{" "}
              <span className="text-amber-500">Your Business</span>
            </h2>
            <p className="text-brand-text-secondary text-base font-medium mb-8 max-w-lg leading-relaxed">
              Source products in bulk from verified wholesale suppliers. Transparent pricing, low MOQs, and reliable delivery for businesses of all sizes.
            </p>
            <button
              onClick={() => navigate("/wholesale")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white font-semibold text-base rounded-full hover:bg-brand-secondary transition-colors active:scale-[0.98]"
            >
              Explore Wholesale <ArrowRight size={18} />
            </button>
          </motion.div>

          {/* Right: Feature Cards */}
          <div className="flex flex-col gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-brand-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center shrink-0`}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-primary mb-1">{feat.title}</h3>
                  <p className="text-sm text-brand-text-secondary font-medium leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
