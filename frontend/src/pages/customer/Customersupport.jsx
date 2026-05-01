import { useState } from "react";
import {
  MessageCircle,
  Phone,
  MessageSquare,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  ChevronRight,
  LifeBuoy,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Layout Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

const supportChannels = [
  {
    id: "chat",
    label: "Live Chat",
    desc: "Instant help, avg 2 min",
    icon: <MessageCircle size={24} />,
    badge: "Online",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    id: "call",
    label: "Call Support",
    desc: "Mon–Sat, 9AM – 7PM",
    icon: <Phone size={24} />,
    badge: "Available",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    desc: "Connect with Sector Manager",
    icon: <MessageSquare size={24} />,
    badge: "24/7",
    color: "text-teal-400",
    bg: "bg-teal-400/10",
  },
];

const categories = [
  {
    id: "order",
    label: "Order Issue",
    icon: <Package size={20} />,
    desc: "Cancellations & Missing items",
  },
  {
    id: "payment",
    label: "Payment",
    icon: <CreditCard size={20} />,
    desc: "Refunds & Dynamic QR issues",
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: <Truck size={20} />,
    desc: "Rider tracking & Sector delays",
  },
  {
    id: "return",
    label: "Returns",
    icon: <RotateCcw size={20} />,
    desc: "Return request & Pickup",
  },
];

export default function CustomerSupport() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ orderId: "", category: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-400">
      <WebsiteNavbar />

      <main className="max-w-6xl mx-auto px-4 pt-32 pb-24">
        {/* HERO SECTION */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Support Systems Operational · Gurugram Node
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-6">
            Help is <span className="text-slate-700 italic">one tap</span> away.
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
            Connect with our Gurugram sector-assigned support team or raise a
            priority ticket below.
          </p>
        </div>

        {/* CHANNELS GRID */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {supportChannels.map((ch) => (
            <motion.div
              key={ch.id}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-10">
                <div
                  className={`w-14 h-14 rounded-2xl ${ch.bg} ${ch.color} flex items-center justify-center`}
                >
                  {ch.icon}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-800 ${ch.color}`}
                >
                  {ch.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{ch.label}</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">
                {ch.desc}
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:gap-4 transition-all">
                Contact Now <ChevronRight size={14} className={ch.color} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* CATEGORIES - Left Side */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 mb-6">
              Issue Categories
            </h4>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:bg-slate-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-slate-600 group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">
                      {cat.label}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-8 bg-sky-500/5 rounded-[2.5rem] border border-sky-500/10 mt-8">
              <ShieldCheck className="text-sky-400 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-2">
                Buyer Protection
              </p>
              <p className="text-xs text-sky-400/60 leading-relaxed">
                All high-value orders in Gurugram are backed by Video-Verified
                packing proof for instant claim resolution.
              </p>
            </div>
          </div>

          {/* TICKET FORM - Right Side */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[3rem] p-10 md:p-14 text-slate-900 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tighter mb-2">
                  Submit a Ticket
                </h2>
                <p className="text-slate-500 font-medium mb-10">
                  Average resolution time: 4 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Order ID
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="#IND-000000"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-sky-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Urgency
                      </label>
                      <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none appearance-none">
                        <option>General Inquiry</option>
                        <option>Order Delayed</option>
                        <option>Payment Dispute</option>
                        <option>Critical Issue</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Issue Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us what happened..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-sky-500 transition-all resize-none"
                    />
                  </div>
                  <button className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                    Send Priority Ticket <ChevronRight size={16} />
                  </button>
                </form>
              </div>
              {/* Background Decoration */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <Clock size={20} className="animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-widest">
              Ticket Submitted. Tracking ID: #TK-891
            </span>
            <button onClick={() => setSubmitted(false)}>
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
