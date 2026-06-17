import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Video, CreditCard, PackageCheck } from "lucide-react";

const trustFeatures = [
  {
    icon: <ShieldCheck size={24} />,
    iconBg: "bg-emerald-50",
    iconColor: "text-brand-accent",
    title: "Verified Sellers",
    description: "Every seller is identity-verified and quality-checked before onboarding.",
  },
  {
    icon: <Video size={24} />,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Video Packing",
    description: "Sellers record packing videos for every order to prevent disputes.",
  },
  {
    icon: <CreditCard size={24} />,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Secure Payment",
    description: "Platform-managed payments with dynamic QR codes. No personal transfers.",
  },
  {
    icon: <PackageCheck size={24} />,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Verified Delivery",
    description: "Dedicated riders with real-time tracking for predictable, safe deliveries.",
  },
];

function TrustSection() {
  return (
    <section className="bg-brand-background px-2 py-2 pb-6" id="trust">
      <div className="w-full bg-white border border-gray-200 py-6 px-4">
        <div className="flex flex-wrap justify-around items-center gap-6 text-center">
          {trustFeatures.map((item, index) => (
            <div key={item.title} className="flex flex-col items-center flex-1 min-w-[150px]">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 max-w-[200px]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
