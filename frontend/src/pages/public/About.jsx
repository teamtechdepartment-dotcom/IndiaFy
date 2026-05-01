import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  ShieldCheck,
  Zap,
  MapPin,
  Globe,
  Users,
  BarChart3,
  ArrowUpRight,
  Fingerprint,
  Award,
  Rocket,
} from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

// --- ANIMATION VARIANTS (Sequential Fade-ins) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// --- MODERN MOCK DATA ---
const STATS = [
  {
    id: 1,
    label: "Verified Nodes",
    value: 500,
    suffix: "+",
    icon: <MapPin size={24} strokeWidth={1.5} />,
  },
  {
    id: 2,
    label: "Avg. Delivery",
    value: 12,
    suffix: " Mins",
    icon: <Zap size={24} strokeWidth={1.5} />,
  },
  {
    id: 3,
    label: "Daily Operations",
    value: 25000,
    suffix: "+",
    icon: <BarChart3 size={24} strokeWidth={1.5} />,
  },
  {
    id: 4,
    label: "Network Users",
    value: 100000,
    suffix: "+",
    icon: <Users size={24} strokeWidth={1.5} />,
  },
];

const VALUES = [
  {
    title: "Verified Nodes Infra",
    desc: "Every node undergoes rigorous auditing and video-verification to ensure absolute authenticity and safety.",
    icon: <ShieldCheck size={28} className="text-emerald-500" />,
    color: "emerald",
  },
  {
    title: "Codified Operations",
    desc: "We don't just deliver; we navigate. Every operational node is data-synchronized for predictive hyperlocal precision.",
    icon: <Fingerprint size={28} className="text-blue-500" />,
    color: "blue",
  },
  {
    title: "Unified Commerce Terminal",
    desc: "From a single pack of milk to large B2B bulk sourcing, we’ve codified the entire retail spectrum into one engine.",
    icon: <Rocket size={28} className="text-purple-500" />,
    color: "purple",
  },
];

const TEAM = [
  {
    name: "Rahul Sharma",
    role: "CEO & Logistics Architect",
    img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300",
  },
  {
    name: "Priya Patel",
    role: "CTO & Ops Intelligence",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300",
  },
  {
    name: "Vikram Singh",
    role: "Head of Node Relations",
    img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300",
  },
];

// --- COUNT UP ANIMATION COMPONENT ---
const CountUp = ({ to, suffix }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = to / (duration / 16); // 16ms per frame (approx)

      const timer = setInterval(() => {
        start += increment;
        if (start >= to) {
          setCount(to);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export default function About() {
  return (
    <div className="bg-[#f4f6f9] min-h-screen font-sans selection:bg-zinc-900 selection:text-white">
      <WebsiteNavbar scrolledByDefault={true} />{" "}
      {/* 💡 Assumes your Navbar handles this */}
      <main className="pt-24 lg:pt-32 pb-24">
        {/* 🏆 HERO SECTION (MODERN SPLIT) */}
        <section className="max-w-[1400px] mx-auto px-6 mb-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid lg:grid-cols-12 gap-12 items-center"
          >
            <motion.div
              variants={itemVariants}
              className="lg:col-span-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  The Indiafy Standard
                </p>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-zinc-900 tracking-tighter leading-[0.9] mb-8">
                COMMERCE. <br />
                <span className="text-zinc-400 italic">CODIFIED.</span>
              </h1>
              <p className="text-base text-zinc-600 font-medium leading-relaxed max-w-xl mb-12">
                Indiafy is not just an e-commerce platform. It is a unified
                logistics engine built to bridge the gap between hyperlocal
                speed and pan-India reach. We’ve codified commerce to make it
                faster, safer, and infinitely more reliable.
              </p>
              <div className="w-full h-px bg-zinc-200" />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="lg:col-span-6 relative aspect-[5/4] lg:aspect-square"
            >
              {/* Abstract image card */}
              <div className="absolute inset-4 bg-white rounded-[3rem] shadow-xl border border-zinc-100 overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200"
                  alt="Operations"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700grayscale-[0.5] hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-2 w-fit">
                    Active Node
                  </div>
                  <h3 className="text-3xl font-black italic">
                    Indiafy Node 01, GGM
                  </h3>
                </div>
              </div>
              {/* Smaller overlay card */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute top-20 right-[-10px] w-40 h-40 bg-zinc-950/80 backdrop-blur-lg rounded-[2.5rem] shadow-2xl p-6 border border-zinc-700 flex flex-col items-center justify-center text-center"
              >
                <Zap size={32} className="text-emerald-500 mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-white leading-tight">
                  Hyperlocal Speed
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* 📊 ANIMATED STATS SECTION */}
        <section className="bg-zinc-950 py-24 mb-32 relative overflow-hidden">
          {/* Subtle bg pattern */}
          <div className="absolute inset-0 opacity-[0.03] scale-150">
            <Globe size={400} className="text-white" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {STATS.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="flex items-center justify-center text-emerald-500 mb-6 group">
                    <div className="bg-white/5 p-4 rounded-full border border-white/10 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <h4 className="text-5xl lg:text-7xl font-black text-white tracking-tighter tabular-nums mb-3">
                    <CountUp to={stat.value} suffix={stat.suffix} />
                  </h4>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🛡️ VALUES / MISSION (GLASS CARDS) */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center mb-24 max-w-2xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="w-12 h-[2px] bg-zinc-900/10"></span>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">
                Core Principals
              </span>
              <span className="w-12 h-[2px] bg-zinc-900/10"></span>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-black text-zinc-900 tracking-tighter leading-none mb-6"
            >
              The Logistics Protocol
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-zinc-500 font-medium leading-relaxed"
            >
              We operate on a 'Zero-Trust' principal across our entire network,
              ensuring that speed never compromises security.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {VALUES.map((val, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[2.5rem] bg-white border border-zinc-100 hover:border-emerald-200 hover:shadow-3xl transition-all duration-500 flex flex-col"
              >
                <div
                  className={`mb-10 p-4 bg-${val.color}-50 w-fit rounded-2xl border border-${val.color}-100`}
                >
                  {val.icon}
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-5 leading-tight">
                  {val.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium mb-12 flex-1">
                  {val.desc}
                </p>
                <button
                  className={`text-xs font-black text-${val.color}-600 uppercase tracking-widest flex items-center gap-2 hover:pl-2 transition-all`}
                >
                  Technical Specs <ArrowUpRight size={16} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 👥 THE TEAM SECTION */}
        <section className="bg-white py-24 mb-32 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 max-w-xl mx-auto">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-3 block">
                Operational Intelligence
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter mb-4">
                Codifiers Behind Indiafy
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {TEAM.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center bg-zinc-50 p-8 rounded-3xl border border-zinc-100"
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mb-6 object-cover border-4 border-white shadow-lg"
                  />
                  <h4 className="text-lg font-black text-zinc-900 mb-1">
                    {member.name}
                  </h4>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                    {member.role}
                  </p>
                  <div className="w-10 h-[1px] bg-zinc-200" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🚀 CALL TO ACTION (MODERNIZED) */}
        <section className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-950 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-zinc-300"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] scale-150 transform -rotate-12">
              <Globe size={400} strokeWidth={1} className="text-white" />
            </div>

            <motion.h2
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-10 relative z-10 max-w-2xl mx-auto"
            >
              Codify Your{" "}
              <span className="text-emerald-500 italic">Commerce.</span> <br />{" "}
              Join the Revolution.
            </motion.h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
              <button
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto bg-emerald-500 text-zinc-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white active:scale-95 transition-all shadow-xl shadow-emerald-500/10"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate("/local-sellers")}
                className="w-full sm:w-auto bg-zinc-800 text-white border border-zinc-700 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 justify-center hover:bg-zinc-700 active:scale-95 transition-all"
              >
                Explore Nodes <ArrowUpRight size={18} />
              </button>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
      {/* Hide Scrollbar for filters */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
