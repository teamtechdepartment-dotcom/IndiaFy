import React from "react";
import { Link } from "react-router-dom";
import { Store, TrendingUp, Zap, ShieldCheck, MapPin, ArrowRight, BarChart3, Clock } from "lucide-react";
import { motion } from "framer-motion";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function BecomeSellerInfo() {
  const benefits = [
    {
      title: "Hyperlocal Monopolies",
      desc: "When you become an Indiafy Node, you become the exclusive, high-speed supplier for your immediate sector. No more fighting national algorithms.",
      icon: <MapPin size={24} className="text-emerald-500" />
    },
    {
      title: "Under 30-Min Payouts",
      desc: "Forget Net-30 or 15-day settlement cycles. Escrow logic clears the moment an order is finalized by the buyer.",
      icon: <Zap size={24} className="text-blue-500" />
    },
    {
      title: "Zero Setup Cost",
      desc: "It's entirely free to register and list your inventory. You only pay a small flat fee when a transaction is successful.",
      icon: <TrendingUp size={24} className="text-purple-500" />
    },
    {
      title: "Data-Driven Inventory",
      desc: "Our Seller Dashboard tells you exactly what products your neighborhood is searching for in real-time.",
      icon: <BarChart3 size={24} className="text-orange-500" />
    }
  ];

  const process = [
    { step: "01", title: "Submit Application", desc: "Fill out the registration form with your GST and business details." },
    { step: "02", title: "Physical Verification", desc: "Our field agents will visit your store to verify your operational capacity." },
    { step: "03", title: "Sync Inventory", desc: "Upload your catalog via our easy-to-use bulk importer or API." },
    { step: "04", title: "Start Earning", desc: "Your node goes live. Start receiving local orders instantly." }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Sell Online in Gurugram | Become a Seller in India | Indiafy"
        description="Join the best marketplace for local sellers. Become a seller in India with our hyperlocal seller platform. Reach more customers, get instant payouts, and dominate your sector."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HERO SECTION */}
      <main className="pt-24 lg:pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-6 mb-24 lg:mb-32">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold uppercase tracking-widest text-brand-primary mb-6">
                <Store size={16} /> Partner Program
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
                Turn your store into an <span className="text-brand-primary">Indiafy Node.</span>
              </h1>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
                Join the fastest-growing hyperlocal commerce network. Reach every customer in your neighborhood without leaving your counter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/seller/login" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-xl">
                  Register Now <ArrowRight size={16} />
                </Link>
                <Link to="/seller-guidelines" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-slate-50 transition-colors">
                  View Guidelines
                </Link>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-transparent rounded-[3rem] blur-3xl transform -rotate-6" />
              <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-2xl relative z-10 flex flex-col gap-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div>
                    <h3 className="font-black text-xl">Incoming Order</h3>
                    <p className="text-emerald-500 font-bold text-sm">Delivery in under 30 mins</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <Clock size={20} className="text-slate-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span className="font-medium text-slate-600">Fresh Milk 1L</span>
                    <span className="font-bold">₹65.00</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <span className="font-medium text-slate-600">Bread Loaf</span>
                    <span className="font-bold">₹40.00</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-emerald-500 text-white font-black rounded-xl mt-2">
                  Accept & Pack
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS GRID */}
        <section className="bg-slate-900 py-24 mb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Store size={400} />
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-4">Why Partner With Us?</h2>
              <p className="text-slate-400 font-medium">We built this platform for the seller, not just the buyer.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-3xl p-8 hover:border-slate-500 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 shadow-inner">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">The Onboarding Process</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-slate-200" />
            
            {process.map((p, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center shadow-lg mb-6 text-2xl font-black text-brand-primary">
                  {p.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-[200px]">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST & SAFETY HIGHLIGHT */}
        <section className="max-w-4xl mx-auto px-6 mb-32">
          <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3rem] text-center">
            <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black tracking-tight mb-4 text-emerald-900">Protected by the Indiafy Standard</h2>
            <p className="text-emerald-700 font-medium leading-relaxed max-w-2xl mx-auto">
              Worried about fraudulent returns or empty box claims? Our mandatory Video Packing protocol protects our sellers. If you follow the guidelines, you will never lose money to a false claim.
            </p>
          </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-8">Ready to grow?</h2>
          <Link to="/seller/login" className="inline-flex items-center gap-2 px-10 py-5 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-emerald-600 transition-colors shadow-xl shadow-brand-primary/20">
            Create Seller Account <ArrowRight size={20} />
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
}
