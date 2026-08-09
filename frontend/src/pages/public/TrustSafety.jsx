import React from "react";
import { ShieldCheck, Video, Lock, MapPin, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function TrustSafety() {
  const pillars = [
    {
      title: "Zero-Trust KYC Verification",
      desc: "Every node operator on Indiafy must submit legally binding GST & Pan documents, followed by an in-person physical store verification by our auditing team.",
      icon: <Search size={28} className="text-emerald-500" />
    },
    {
      title: "Mandatory Video Packing",
      desc: "High-value orders cannot be dispatched without a continuous, timestamped video recording of the item being packed. This eliminates 'empty box' disputes.",
      icon: <Video size={28} className="text-blue-500" />
    },
    {
      title: "Escrow Payment Logic",
      desc: "Your money is held in a secure escrow vault. It is only released to the seller after the product is delivered and the dispute window has safely closed.",
      icon: <Lock size={28} className="text-purple-500" />
    },
    {
      title: "Hyperlocal Geo-Fencing",
      desc: "Sellers are restricted from accepting orders outside their assigned operational node. This guarantees accountability and 25-minute fulfillment SLAs.",
      icon: <MapPin size={28} className="text-orange-500" />
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Trust & Safety | Indiafy"
        description="Discover how Indiafy protects buyers and sellers with Zero-Trust KYC, mandatory video packing, and secure escrow payments."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      <main className="pt-24 lg:pt-32 pb-24">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold uppercase tracking-widest text-brand-primary mb-6">
            <ShieldCheck size={16} /> Trust Infrastructure
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8">
            Safety by <span className="text-brand-primary">Design.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            At Indiafy, trust isn't a promise—it's a codified protocol. We've engineered the safest commerce environment in India through rigorous verification and operational mandates.
          </p>
        </section>

        {/* PILLARS OF TRUST */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid md:grid-cols-2 gap-8">
            {pillars.map((pillar, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-8 items-start group">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{pillar.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ESCROW VISUALIZATION */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-16 text-white text-center relative overflow-hidden">
            <h2 className="text-3xl lg:text-5xl font-black mb-6 relative z-10">The Escrow Advantage</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto mb-16 relative z-10">Your payment never touches the seller's bank account until you are satisfied.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative z-10 max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-4">
                  <span className="font-black text-xl">₹</span>
                </div>
                <p className="font-bold text-sm">You Pay</p>
              </div>
              
              <div className="hidden md:block flex-1 h-1 border-t-2 border-dashed border-slate-700 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <RefreshCw size={20} className="text-slate-500" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center relative">
                <div className="w-24 h-24 rounded-2xl bg-brand-primary flex items-center justify-center shadow-[0_0_30px_#10b981] mb-4">
                  <Lock size={32} className="text-white" />
                </div>
                <p className="font-bold text-sm">Funds Locked in Indiafy Escrow</p>
                <p className="text-xs text-brand-accent mt-1">Pending Delivery</p>
              </div>

              <div className="hidden md:block flex-1 h-1 border-t-2 border-dashed border-slate-700 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-900 flex items-center justify-center mb-4">
                  <Store size={24} className="text-emerald-500" />
                </div>
                <p className="font-bold text-sm">Seller Paid</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
