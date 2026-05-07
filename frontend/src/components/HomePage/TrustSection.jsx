import { motion } from "framer-motion";
import {
  ShieldCheck,
  Video,
  QrCode,
  Map,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

function TrustSection() {
  const trustFeatures = [
    {
      icon: <UserCheck size={24} />,
      title: "Verified Seller Network",
      description:
        "Each Gurugram seller undergoes physical sector-mapping and identity verification before onboarding.",
      tag: "Verification",
    },
    {
      icon: <Video size={24} />,
      title: "Mandatory Video Packing",
      description:
        "Sellers record a verification video for every high-risk order to eliminate missing item disputes.",
      tag: "Anti-Fraud",
    },
    {
      icon: <QrCode size={24} />,
      title: "Dynamic QR Payments",
      description:
        "Secure delivery via platform-owned dynamic QRs. No personal rider transfers allowed.",
      tag: "Secure COD",
    },
    {
      icon: <Map size={24} />,
      title: "Sector-Assigned Riders",
      description:
        "Dedicated riders assigned to specific Gurugram sectors for faster, predictable routing.",
      tag: "Logistics",
    },
  ];

  return (
    <section className="py-24 bg-zinc-950 text-white overflow-hidden relative">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-zinc-800 rounded-full blur-[120px] opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* HEADER */}
        <div className="grid lg:grid-cols-2 gap-12 items-end mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 mb-6">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Trust Infrastructure
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Trust is Built into <br />
              <span className="text-zinc-500 italic">the Code.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-zinc-400 text-lg leading-relaxed border-l border-zinc-800 pl-8"
          >
            Indiafy shifts trust from individual riders to platform technology.
            We use a controlled operational ecosystem to ensure margin stability
            and fraud reduction.
          </motion.p>
        </div>

        {/* TRUST CARDS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-500"
            >
              {/* Tag */}
              <div className="mb-8 flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-500">
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {item.tag}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-4 group-hover:translate-x-1 transition-transform">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                {item.description}
              </p>

              {/* Verified Icon on Hover */}
              <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  System Validated
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BOTTOM OPERATIONAL SUMMARY (PRD INSIGHT) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-10 rounded-[3rem] bg-gradient-to-r from-zinc-900 to-transparent border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex gap-10">
            <div className="text-center md:text-left">
              <p className="text-4xl font-black">0%</p>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Rider Cash Leakage
              </p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-4xl font-black">100%</p>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Video Proof Support
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-sm font-bold text-zinc-400 mb-4 max-w-xs text-right">
              Our hybrid logistics model uses aggregator partners for bulk
              orders and core riders for precision.
            </p>
            <button aria-label="Learn about our verification process" className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">
              Learn About Verification
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default TrustSection;
