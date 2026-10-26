/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState } from "react";
import { Link } from "react-router-dom";
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
  CheckCircle2,
  AlertCircle,
  Headphones,
  ExternalLink,
  PhoneCall,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Layout Components & Utils
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";
import SupportChat from "../../components/support/SupportChat";
import axiosInstance from "../../utils/axiosInstance";

const supportChannels = [
  {
    id: "chat",
    label: "Live Chat",
    desc: "Instant help, avg 2 min response",
    icon: MessageCircle,
    badge: "Online",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 border-blue-100",
    actionText: "Start Live Chat",
  },
  {
    id: "call",
    label: "Call Support",
    desc: "Mon–Sat, 9:00 AM – 7:00 PM",
    icon: Phone,
    badge: "Available",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-100",
    actionText: "Request Call / Dial",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Support",
    desc: "Direct connect with Sector Manager",
    icon: MessageSquare,
    badge: "24/7 Active",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50 border-teal-100",
    actionText: "Chat on WhatsApp",
  },
];

const categories = [
  {
    id: "order",
    label: "Order Issues",
    icon: Package,
    desc: "Cancellations, missing items, damaged package",
    defaultUrgency: "Order Delayed",
  },
  {
    id: "payment",
    label: "Payments & Refunds",
    icon: CreditCard,
    desc: "UPI deductions, refund status, dynamic QR",
    defaultUrgency: "Payment Dispute",
  },
  {
    id: "delivery",
    label: "Delivery & Rider",
    icon: Truck,
    desc: "Rider tracking, location issues, sector delays",
    defaultUrgency: "Order Delayed",
  },
  {
    id: "return",
    label: "Returns & Exchanges",
    icon: RotateCcw,
    desc: "Return approval, pickup schedule, replacement",
    defaultUrgency: "General Inquiry",
  },
];

export default function CustomerSupport() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [form, setForm] = useState({
    orderId: "",
    urgency: "General Inquiry",
    message: "",
  });

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat.id);
    setForm((prev) => ({
      ...prev,
      urgency: cat.defaultUrgency || prev.urgency,
      message: prev.message ? prev.message : `[${cat.label}] `,
    }));
  };

  const handleChannelClick = (channelId) => {
    if (channelId === "chat") {
      setShowLiveChat(true);
    } else if (channelId === "call") {
      setShowCallModal(true);
    } else if (channelId === "whatsapp") {
      window.open(
        "https://wa.me/919999999999?text=Hello%20Indiafy%20Support,%20I%20need%20assistance%20with%20my%20account/order.",
        "_blank"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      const priorityMap = {
        "General Inquiry": "Low",
        "Order Delayed": "Medium",
        "Payment Dispute": "High",
        "Critical Issue": "Critical",
      };
      const priority = priorityMap[form.urgency] || "Medium";

      const payload = {
        subject: form.message.slice(0, 60) || "Customer Support Request",
        priority,
        channel: "chat",
      };

      if (form.orderId.trim()) {
        payload.orderId = form.orderId.trim();
      }

      const res = await axiosInstance.post("/support/conversations", payload);
      const conv = res?.conversation || res?.data?.conversation;
      const ticketId = conv?.ticketNumber || conv?._id || "TICKET-CONFIRMED";

      if (conv?._id && form.message.trim()) {
        try {
          await axiosInstance.post(`/support/conversations/${conv._id}/messages`, {
            body: form.message.trim(),
            clientMessageId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            messageType: "customer",
          });
        } catch (msgErr) {
          console.warn("Could not post initial message:", msgErr);
        }
      }

      setSubmittedTicket(ticketId);
      setForm({ orderId: "", urgency: "General Inquiry", message: "" });
      setSelectedCategory(null);
      setTimeout(() => setSubmittedTicket(null), 8000);
    } catch (err) {
      console.error("Support ticket submission failed:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to submit ticket. Please log in to your customer account."
      );
      setTimeout(() => setErrorMessage(""), 8000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      <SEOHead
        title="Customer Support & Help Desk | Indiafy"
        description="24/7 customer support for Indiafy orders, payments, quick deliveries, and returns."
      />
      <WebsiteNavbar />

      {/* SUBTLE AMBIENT GRADIENT DECORATION */}
      <div className="relative">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-transparent pointer-events-none" />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 sm:pt-36 pb-24 relative z-10">
          {/* HERO SECTION */}
          <div className="text-center mb-14 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Support Systems Operational · Gurugram Hyperlocal Node
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4"
            >
              Help is{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                one tap
              </span>{" "}
              away.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Connect with our Gurugram sector-assigned support team, launch an
              instant live chat, or raise a priority ticket below.
            </motion.p>
          </div>

          {/* CHANNELS GRID */}
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mb-16">
            {supportChannels.map((ch, idx) => {
              const IconComp = ch.icon;
              return (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * (idx + 1) }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleChannelClick(ch.id)}
                  className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div
                        className={`w-13 h-13 p-3.5 rounded-xl ${ch.iconBg} ${ch.iconColor} border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <IconComp size={24} />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ch.badgeColor}`}
                      >
                        {ch.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {ch.label}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                      {ch.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 group-hover:gap-2.5 transition-all pt-2 border-t border-slate-100">
                    <span>{ch.actionText}</span>
                    <ChevronRight size={15} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* MAIN TWO-COLUMN CONTENT */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* CATEGORIES - Left Side (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Common Issue Categories
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select a topic to auto-fill your ticket details
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {categories.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? "bg-blue-50/70 border-blue-400 shadow-sm"
                          : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                          }`}
                        >
                          <IconComp size={20} />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold tracking-tight transition-colors ${
                              isSelected
                                ? "text-blue-900"
                                : "text-slate-800 group-hover:text-blue-600"
                            }`}
                          >
                            {cat.label}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {cat.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`transition-all ${
                          isSelected
                            ? "text-blue-600 translate-x-1"
                            : "text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* BUYER PROTECTION BADGE */}
              <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50/40 rounded-2xl border border-blue-100 shadow-sm mt-6">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                      Buyer Protection
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Video-Verified Orders
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All high-value orders in Gurugram are backed by Video-Verified
                  packing proof for instant claim resolution and hassle-free
                  refunds.
                </p>
              </div>

              {/* FAQ KNOWLEDGE LINK */}
              <Link
                to="/faq"
                className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                    <LifeBuoy size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      Looking for FAQs & Articles?
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Visit our comprehensive FAQ knowledge base
                    </p>
                  </div>
                </div>
                <ExternalLink
                  size={15}
                  className="text-slate-400 group-hover:text-blue-600 transition-colors"
                />
              </Link>
            </div>

            {/* TICKET FORM - Right Side (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-7 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                {/* DECORATIVE ACCENT */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-blue-50 via-indigo-50/20 to-transparent rounded-bl-full pointer-events-none" />

                <div className="relative z-10">
                  <div className="mb-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-blue-100">
                      Priority Support Desk
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Submit a Support Ticket
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Average resolution time: under 4 hours. Critical cases are
                      escalated immediately.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 ml-0.5">
                          Order ID (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. #IND-984210"
                          value={form.orderId}
                          onChange={(e) =>
                            setForm({ ...form, orderId: e.target.value })
                          }
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 ml-0.5">
                          Urgency Level
                        </label>
                        <div className="relative">
                          <select
                            value={form.urgency}
                            onChange={(e) =>
                              setForm({ ...form, urgency: e.target.value })
                            }
                            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
                          >
                            <option value="General Inquiry">
                              General Inquiry (Low)
                            </option>
                            <option value="Order Delayed">
                              Order Delayed (Medium)
                            </option>
                            <option value="Payment Dispute">
                              Payment Dispute (High)
                            </option>
                            <option value="Critical Issue">
                              Critical Issue (Urgent)
                            </option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                            <ChevronRight size={16} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center ml-0.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Issue Description
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {form.message.length} chars
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        placeholder="Please tell us what happened with as much detail as possible..."
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Clock size={16} className="animate-spin" />
                          <span>Routing Ticket...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Priority Ticket</span>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Encrypted & secure customer communication channel</span>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CALL SUPPORT MODAL */}
      <AnimatePresence>
        {showCallModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCallModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      Indiafy Support Desk
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mon–Sat: 9:00 AM – 7:00 PM IST
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCallModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-6 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Gurugram Sector Helpline
                </p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">
                  +91 1800 200 4884
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Toll-Free for all registered buyers
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="tel:+9118002004884"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Phone size={15} /> Dial Now
                </a>
                <button
                  onClick={() => {
                    setShowCallModal(false);
                    setShowLiveChat(true);
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Prefer Live Chat Instead
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE CHAT DRAWER */}
      {showLiveChat && (
        <SupportChat
          role="customer"
          onClose={() => setShowLiveChat(false)}
        />
      )}

      {/* TOAST ALERTS */}
      <AnimatePresence>
        {submittedTicket && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-white text-slate-900 border border-emerald-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md w-[90%]"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900">
                Ticket Created Successfully
              </p>
              <p className="text-xs text-slate-500 font-mono truncate">
                Tracking ID: #{submittedTicket}
              </p>
            </div>
            <button
              onClick={() => setSubmittedTicket(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-white text-slate-900 border border-red-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-md w-[90%]"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertCircle size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900">
                Submission Notice
              </p>
              <p className="text-xs text-red-600 font-medium">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
