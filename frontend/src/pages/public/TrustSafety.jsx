import React from "react";
import { ShieldCheck, Video, Lock, MapPin, Search, RefreshCw, CheckCircle2, Store, Scale, FileCheck, Landmark, Cpu, Award } from "lucide-react";
import { motion } from "framer-motion";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function TrustSafety() {
  const pillars = [
    {
      title: "Zero-Trust KYC & PMLA Compliance",
      subtitle: "Prevention of Money Laundering Act (PMLA), 2002 & RBI KYC Master Directions",
      desc: "Every node operator and seller on Indiafy undergoes rigorous multi-layer KYC verification. We mandate government-authenticated GSTIN, Business PAN, bank account penny-drop verification, and an in-person physical store audit by our field officers before activating selling privileges.",
      icon: <Search size={28} className="text-emerald-500" />
    },
    {
      title: "Mandatory Video Packing Protocol",
      subtitle: "Evidentiary Standard Under Indian Evidence Act, 1872",
      desc: "To eliminate 'empty box' or counterfeit replacement disputes, high-value orders (₹1,500+) cannot be dispatched without an unbroken, timestamped video recording of the packing process. These encrypted logs serve as primary digital evidence during arbitration.",
      icon: <Video size={28} className="text-blue-500" />
    },
    {
      title: "RBI-Compliant Escrow Architecture",
      subtitle: "RBI Payment Aggregator (PA) & Nodal Account Frameworks",
      desc: "Your money never touches a seller's personal bank account prematurely. Customer payments are held in bank-grade regulated escrow vaults and are only released to the seller after successful delivery and expiry of the statutory return window.",
      icon: <Lock size={28} className="text-purple-500" />
    },
    {
      title: "Hyperlocal Geo-Fencing & SLAs",
      subtitle: "Consumer Protection (E-Commerce) Rules, 2020",
      desc: "Sellers are strictly geo-fenced to their assigned operational nodes. This prevents unauthorized drop-shipping, guarantees authentic local inventory, and ensures strict adherence to our promised 25-minute Quick Commerce delivery SLA.",
      icon: <MapPin size={28} className="text-orange-500" />
    }
  ];

  const securityCertifications = [
    { title: "PCI-DSS Level 1", desc: "Payment card industry data security standard compliance for card transactions." },
    { title: "ISO/IEC 27001:2022", desc: "Information security management systems (ISMS) alignment as per SPDI Rules." },
    { title: "AES-256 Encryption", desc: "Military-grade encryption for all sensitive personal data at rest and in transit." },
    { title: "CERT-In Compliant", desc: "24/7 security monitoring with 6-hour incident reporting under CERT-In guidelines." },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Trust & Safety Infrastructure | Indiafy – RBI & PMLA Compliant"
        description="Discover how Indiafy protects buyers and sellers with Zero-Trust KYC under PMLA 2002, RBI-regulated escrow payments, mandatory video packing, and PCI-DSS Level 1 security."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      <main className="pt-24 lg:pt-32 pb-24">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold uppercase tracking-widest text-brand-primary mb-6">
            <ShieldCheck size={16} /> Regulated Security Architecture
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-6">
            Safety by <span className="text-brand-primary">Design.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            At Indiafy, trust isn't a marketing slogan—it is a codified cryptographic and legal protocol. We have engineered India's most secure hyperlocal marketplace by embedding RBI regulations, PMLA compliance, and stringent physical audits into our core technology.
          </p>

          {/* Security Certifications Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            {securityCertifications.map((cert, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Award size={16} />
                  <span className="text-xs font-black uppercase tracking-wider">{cert.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-normal m-0">{cert.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PILLARS OF TRUST */}
        <section className="max-w-7xl mx-auto px-6 mb-28">
          <div className="flex items-center gap-2 mb-8">
            <Scale className="text-brand-primary" size={24} />
            <h2 className="text-2xl md:text-3xl font-black tracking-tight m-0">The 4 Pillars of Marketplace Integrity</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {pillars.map((pillar, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                      {pillar.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      Pillar 0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{pillar.title}</h3>
                  <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">{pillar.subtitle}</p>
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ESCROW VISUALIZATION */}
        <section className="max-w-7xl mx-auto px-6 mb-28">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 lg:p-16 text-white text-center relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-4">
              <Landmark size={14} /> RBI Payment Aggregator Regulated
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-4 relative z-10 m-0">The Escrow Trust Vault</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto mb-16 relative z-10 text-sm md:text-base">
              Your money never touches the seller's bank account until you are 100% satisfied. All transactions are routed through regulated nodal accounts under strict banking oversight.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative z-10 max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-3 shadow-lg">
                  <span className="font-black text-2xl text-emerald-400">₹</span>
                </div>
                <p className="font-bold text-sm m-0">1. Buyer Pays</p>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">100% Encrypted via UPI / Card</p>
              </div>
              
              <div className="hidden md:block flex-1 h-1 border-t-2 border-dashed border-slate-700 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-1.5 rounded-full border border-slate-700">
                  <RefreshCw size={16} className="text-slate-400 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center relative">
                <motion.div 
                  animate={{ boxShadow: ["0 0 20px #10b981", "0 0 40px #10b981", "0 0 20px #10b981"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 rounded-2xl bg-brand-primary flex items-center justify-center mb-3 border border-emerald-400/30"
                >
                  <Lock size={36} className="text-white" />
                </motion.div>
                <p className="font-black text-base m-0 text-white">2. Regulated Escrow Vault</p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5 m-0">Funds Locked & Protected</p>
                <p className="text-[10px] text-slate-400 mt-1 m-0">Pending Delivery + Dispute Window</p>
              </div>

              <div className="hidden md:block flex-1 h-1 border-t-2 border-dashed border-slate-700 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-1.5 rounded-full border border-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-600/50 flex items-center justify-center mb-3 shadow-lg">
                  <Store size={24} className="text-emerald-400" />
                </div>
                <p className="font-bold text-sm m-0">3. Seller Settled</p>
                <p className="text-[11px] text-slate-400 m-0 mt-0.5">T+1 / T+2 Days Post-Delivery</p>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-slate-800/80 max-w-2xl mx-auto flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><FileCheck size={14} className="text-emerald-400" /> No Advance Payouts to Sellers</span>
              <span className="flex items-center gap-1.5"><Cpu size={14} className="text-blue-400" /> Automated Dispute Hold Logic</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-purple-400" /> 100% Chargeback Protected</span>
            </div>
          </div>
        </section>

        {/* STATUTORY COMPLIANCE GRID */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black mb-6 m-0">Indian Legal & Regulatory Alignment</h3>
            <p className="text-slate-600 text-sm font-medium mb-8 max-w-3xl leading-relaxed">
              Our Trust & Safety architecture works in seamless tandem with Indian regulatory bodies to ensure a transparent, fair, and fraud-free digital commerce ecosystem:
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm mb-2 m-0">IT Act, 2000 & SPDI Rules</h4>
                <p className="text-xs text-slate-600 leading-relaxed m-0">Full compliance with Section 43A reasonable security practices and Rule 3 sensitive personal data protection standards.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm mb-2 m-0">E-Commerce Rules, 2020</h4>
                <p className="text-xs text-slate-600 leading-relaxed m-0">Strict adherence to Rule 4 marketplace entity duties, level playing field mandates, and transparent pricing disclosures.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm mb-2 m-0">PMLA, 2002 & KYC Mandates</h4>
                <p className="text-xs text-slate-600 leading-relaxed m-0">Mandatory verification of beneficial ownership, bank account validation, and suspicious transaction monitoring.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
