import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, FileCheck, Banknote, Video, Ban, Award, ArrowRight } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function SellerGuidelines() {
  const requirements = [
    { title: "GST Registration", desc: "Mandatory for all sellers. We verify this against government databases.", icon: <FileCheck size={24} /> },
    { title: "Physical KYC", desc: "Our field agents will physically verify your store location and operational capacity.", icon: <ShieldAlert size={24} /> },
    { title: "Bank Verification", desc: "An active current account in the name of the registered business.", icon: <Banknote size={24} /> },
  ];

  const prohibited = [
    "Counterfeit or replica goods",
    "Weapons, ammunition, or explosives",
    "Unlicensed pharmaceuticals or drugs",
    "Hazardous materials and chemicals",
    "Stolen goods or unauthorized digital keys"
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Seller Guidelines | Indiafy"
        description="Learn the strict operational standards, video packing rules, and KYC requirements required to become a verified seller on Indiafy."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HERO SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
            <Award size={16} /> Operational Excellence
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Seller Guidelines
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
            We don't accept everyone. Indiafy is an exclusive network of verified, high-quality local merchants.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 lg:py-24">
        
        {/* REQUIREMENTS */}
        <section className="mb-24">
          <h2 className="text-3xl font-black tracking-tight mb-8">Node Onboarding Requirements</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {requirements.map((req, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  {req.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{req.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{req.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* QUALITY & VIDEO PACKING */}
        <section className="grid md:grid-cols-2 gap-12 lg:gap-20 mb-24">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-6">Quality Standards</h2>
            <div className="prose prose-slate prose-p:font-medium prose-p:text-slate-600">
              <p>To maintain our 25-minute delivery SLA, sellers must adhere to strict inventory management rules:</p>
              <ul>
                <li><strong>No Ghost Inventory:</strong> You must only list items physically present in your store.</li>
                <li><strong>Immediate Dispatch:</strong> Orders must be handed to delivery partners within 5 minutes of acceptance.</li>
                <li><strong>Packaging:</strong> Use approved Indiafy tamper-proof packaging for all orders to ensure safety in transit.</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Video size={120} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md text-[10px] font-black uppercase tracking-widest mb-6">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Mandatory
              </div>
              <h3 className="text-2xl font-black mb-4">Video Packing Protocol</h3>
              <p className="text-slate-400 font-medium text-sm leading-relaxed mb-6">
                For items exceeding ₹1,500 in value, sellers must record the packing process using the Indiafy Seller App. 
                This video is encrypted and attached to the Order ID.
              </p>
              <p className="text-emerald-400 text-sm font-bold">
                * Failure to provide video proof during a buyer dispute will result in an automatic refund.
              </p>
            </div>
          </div>
        </section>

        {/* PROHIBITED PRODUCTS */}
        <section className="mb-24">
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <Ban size={24} />
              </div>
              <h2 className="text-2xl font-black text-red-900 tracking-tight">Prohibited Products</h2>
            </div>
            <p className="text-red-700 font-medium mb-6">Listing any of the following items will result in immediate and permanent account termination:</p>
            
            <ul className="grid sm:grid-cols-2 gap-4">
              {prohibited.map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-red-100 text-red-900 font-medium text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-white p-12 border border-slate-200 rounded-[3rem] shadow-sm">
          <h2 className="text-3xl font-black tracking-tight mb-4">Ready to meet the standard?</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-lg mx-auto">Join India's most trusted hyperlocal commerce network and scale your local business.</p>
          <Link to="/become-seller-info" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors">
            Start Registration <ArrowRight size={16} />
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
}
