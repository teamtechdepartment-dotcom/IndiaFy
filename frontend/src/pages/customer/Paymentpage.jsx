import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  Truck,
  CheckCircle2,
  QrCode,
  Info,
  ChevronRight,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Layout Components - Fixed paths as per your structure
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

const ORDER = {
  id: "ORD-7829134",
  total: 26489,
  eta: "15-25 Mins",
  items: [
    {
      name: "Sony WH-1000XM5 Headphones",
      price: 24990,
      qty: 1,
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&q=80",
    },
    {
      name: "Anker 65W USB-C Nano Charger",
      price: 1499,
      qty: 2,
      img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=160&q=80",
    },
  ],
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Mimicking Indiafy Node reconciliation
    setTimeout(() => {
      setLoading(false);
      navigate("/order-success");
    }, 2500);
  };

  return (
    <div className="bg-[#080E1A] min-h-screen text-slate-300 font-sans">
      <WebsiteNavbar />

      <main className="max-w-6xl mx-auto px-4 pt-32 pb-24">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4"
            >
              <ArrowLeft size={14} /> Back to Checkout
            </button>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              Secure <span className="text-slate-600 italic">Payment</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl">
            <Lock size={16} className="text-teal-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              256-bit Encryption
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: PAYMENT METHODS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">
                Select Method
              </p>

              <div className="space-y-4">
                {/* UPI - Preferred Indiafy Method */}
                <label
                  className={`block p-6 rounded-3xl border-2 cursor-pointer transition-all ${method === "upi" ? "border-teal-500 bg-teal-500/5" : "border-slate-800 hover:border-slate-700"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === "upi" ? "bg-teal-500 text-white" : "bg-slate-800 text-slate-500"}`}
                      >
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">
                          UPI / Dynamic QR
                        </p>
                        <p className="text-xs text-slate-500">
                          GPay, PhonePe, Paytm
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={method === "upi"}
                      onChange={() => setMethod("upi")}
                      className="w-5 h-5 accent-teal-500"
                    />
                  </div>

                  <AnimatePresence>
                    {method === "upi" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-6 pt-6 border-t border-slate-800 overflow-hidden"
                      >
                        <div className="bg-slate-950 p-6 rounded-2xl border border-dashed border-slate-800 flex items-center gap-6">
                          <QrCode
                            size={64}
                            className="text-slate-600 shrink-0"
                          />
                          <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed tracking-tighter">
                            Platform-owned Dynamic QR will be generated. Avoid
                            personal rider transfers to prevent fraud.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>

                {/* Cards */}
                <label
                  className={`block p-6 rounded-3xl border-2 cursor-pointer transition-all ${method === "card" ? "border-teal-500 bg-teal-500/5" : "border-slate-800 hover:border-slate-700"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === "card" ? "bg-teal-500 text-white" : "bg-slate-800 text-slate-500"}`}
                      >
                        <CreditCard size={24} />
                      </div>
                      <p className="font-bold text-white text-lg">
                        Credit / Debit Card
                      </p>
                    </div>
                    <input
                      type="radio"
                      checked={method === "card"}
                      onChange={() => setMethod("card")}
                      className="w-5 h-5 accent-teal-500"
                    />
                  </div>
                </label>

                {/* Cash - Operational Control */}
                <label
                  className={`block p-6 rounded-3xl border-2 cursor-pointer transition-all ${method === "cod" ? "border-teal-500 bg-teal-500/5" : "border-slate-800 hover:border-slate-700"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === "cod" ? "bg-teal-500 text-white" : "bg-slate-800 text-slate-500"}`}
                      >
                        <Truck size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">
                          Cash on Delivery
                        </p>
                        <p className="text-xs text-slate-500">
                          Serviceable in your sector
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={method === "cod"}
                      onChange={() => setMethod("cod")}
                      className="w-5 h-5 accent-teal-500"
                    />
                  </div>
                </label>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-10 py-5 bg-teal-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-teal-900/40 hover:bg-teal-400 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading
                  ? "Reconciling Indiafy Node..."
                  : `Pay ${fmt(ORDER.total)} Securely`}
              </button>
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black uppercase tracking-widest text-white">
                  Order Summary
                </h3>
                <span className="text-[10px] font-bold bg-slate-800 px-3 py-1 rounded-full uppercase">
                  {ORDER.items.length} Items
                </span>
              </div>

              <div className="space-y-4 mb-8">
                {ORDER.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.img}
                        className="w-10 h-10 rounded-lg object-cover grayscale opacity-60"
                        alt=""
                      />
                      <p className="text-xs font-bold text-slate-400 truncate max-w-[140px]">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-sm font-black text-white">
                      {fmt(item.price)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="flex justify-between text-slate-500 font-medium text-xs uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white">{fmt(ORDER.total)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium text-xs uppercase tracking-widest">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="pt-4 flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">
                    Total Payable
                  </p>
                  <p className="text-3xl font-black text-white leading-none">
                    {fmt(ORDER.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* ASSURANCE CARD */}
            <div className="p-8 bg-gradient-to-br from-teal-500/10 to-transparent rounded-[2.5rem] border border-teal-500/20">
              <div className="flex items-center gap-4 mb-4">
                <ShieldCheck className="text-teal-400" size={28} />
                <h4 className="text-sm font-black uppercase tracking-widest text-white">
                  Indiafy Assurance
                </h4>
              </div>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-tighter">
                Every transaction is processed through our sector node to ensure
                zero cash leakage and operational discipline.
              </p>
              <div className="mt-6 flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                <Clock size={16} className="text-teal-400" />
                <span className="text-[10px] font-bold text-slate-300">
                  ETA for your sector: {ORDER.eta}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
