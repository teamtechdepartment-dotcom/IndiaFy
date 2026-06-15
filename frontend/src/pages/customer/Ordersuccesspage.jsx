import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Truck,
  MapPin,
  Video,
  QrCode,
  ShoppingBag,
  Star,
  Clock,
  ShieldCheck,
  BadgeCheck,
  ChevronLeft,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";

// Ensure these paths match your folder structure exactly
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import { Skeleton } from "../../components/ui/Skeleton";

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const res = await axiosInstance.get(`/orders/${orderId}`);
          setOrder(res.data || res);
        } catch (err) {
          console.error("Fetch order success details failed", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-zinc-50 min-h-screen font-sans">
        <WebsiteNavbar />
        <main className="max-w-3xl mx-auto px-4 pt-32 pb-24 space-y-6">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="w-64 h-10 mx-auto" />
          <Skeleton className="w-full h-64 rounded-[2.5rem]" />
          <Skeleton className="w-full h-32 rounded-[2rem]" />
        </main>
      </div>
    );
  }

  const displayOrder = order || {
    id: "IND-DEMO",
    status: "Preparing",
    totalPrice: 0,
    orderItems: []
  };

  return (
    <div className="bg-zinc-50 min-h-screen font-sans">
      <WebsiteNavbar />

      <main className="max-w-3xl mx-auto px-4 pt-32 pb-24">

      {/* Background Blobs for Hero Theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[100px]" />
      </div>
      
        {/* SUCCESS HERO */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-200"
          >
            <CheckCircle2 size={40} className="text-slate-900" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
            Order Confirmed!
          </h1>
          <p className="text-slate-500 font-medium">
            Order ID:{" "}
            <span className="text-slate-900 font-bold">#{orderId || displayOrder._id}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. SHIPMENT TRACKING CARD */}
          <section className="bg-white shadow-sm border border-slate-200 rounded-[2.5rem] p-8 text-slate-900 shadow-2xl overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">
                    Delivery Status
                  </p>
                  <h2 className="text-4xl font-black">Awaiting Confirmation</h2>
                  <p className="text-slate-600 text-xs font-bold mt-2 uppercase tracking-tighter">
                    Heavy item: Seller will confirm and ship shortly.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <Package size={32} className="text-emerald-400" />
                </div>
              </div>

              {/* Status Tracker */}
              <div className="flex items-center gap-2 mb-8">
                <div className="flex-1 h-1.5 bg-emerald-500 rounded-full" />
                <div className="flex-1 h-1.5 bg-white/20 rounded-full relative overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-emerald-400/50"
                  />
                </div>
                <div className="flex-1 h-1.5 bg-white/20 rounded-full" />
              </div>

              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="text-emerald-400">Order Placed</span>
                <span className="text-slate-900">Seller Accepted</span>
                <span>Shipped</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 text-slate-900/5 rotate-12">
              <Truck size={200} />
            </div>
          </section>

          {/* 2. ANTI-FRAUD: VIDEO PACKING */}
          <section className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-white border border-zinc-100">
                <Video size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black uppercase tracking-tight">
                  Packing Proof
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Mandatory video recording will be available once packed.
                </p>
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase text-slate-600 animate-pulse">
                Live Status
              </div>
            </div>
          </section>

          {/* 3. ORDER SUMMARY */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
            <div className="space-y-4">
              {displayOrder.orderItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="flex gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                >
                  <img loading="lazy" decoding="async"
                    src={item.product?.productImage?.[0] || "https://placehold.co/200x200?text=Product"}
                    className="w-16 h-16 rounded-xl object-cover"
                    alt="item"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.product?.productName || "Product"}
                    </h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-slate-600 uppercase">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-black text-slate-900">
                        {fmt(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-emerald-600 text-xs uppercase">
                <ShieldCheck size={18} /> Secure Transaction
              </div>
              <p className="text-2xl font-black text-slate-900">
                {fmt(displayOrder.totalPrice)}
              </p>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => navigate(`/track-order/${orderId || "demo"}`)}
              className="py-5 bg-white shadow-sm border border-slate-200 text-slate-900 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-100 border border-slate-200 transition-all"
            >
              Track Order
            </button>
            <button
              onClick={() => navigate("/")}
              className="py-5 bg-white border-2 border-zinc-900 text-slate-900 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-zinc-50 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
