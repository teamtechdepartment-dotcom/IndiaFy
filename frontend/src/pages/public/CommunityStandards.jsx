import React from "react";
import { Link } from "react-router-dom";
import { Users, Heart, ShieldAlert, Flag, MessageCircle, AlertTriangle, Scale, Gavel, Lock, EyeOff, BookOpen, AlertCircle } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function CommunityStandards() {
  const standards = [
    {
      title: "Respect & Dignity",
      subtitle: "Zero Tolerance for Hate Speech & Harassment",
      icon: <Heart className="text-rose-500" size={24} />,
      legal: "Sections 354A, 503, 506 & 509 of Indian Penal Code (IPC); Section 67 of IT Act, 2000.",
      desc: "All interactions between buyers, sellers, and delivery partners must be respectful. We strictly prohibit hate speech, caste-based slurs (SC/ST Act compliance), sexual harassment, intimidation, or abusive language across chat, reviews, and delivery handovers."
    },
    {
      title: "Honest Representation",
      subtitle: "Prohibition of Fraud & Counterfeit Goods",
      icon: <ShieldAlert className="text-emerald-500" size={24} />,
      legal: "Section 420 IPC (Cheating); Section 103 Trade Marks Act, 1999; Section 2(47) Consumer Protection Act, 2019.",
      desc: "Sellers must accurately describe products and their condition. Selling spurious, counterfeit, or replicas is a criminal offence. Buyers must submit genuine reviews and are prohibited from making fraudulent 'item not received' or extortionate claims."
    },
    {
      title: "Platform & Payment Safety",
      subtitle: "Protection of Escrow & Transaction Integrity",
      icon: <Lock className="text-amber-500" size={24} />,
      legal: "Section 66 & 66D IT Act, 2000 (Computer-related fraud & Personation); RBI PA Guidelines.",
      desc: "Do not attempt to bypass the platform's payment systems. Transacting outside of Indiafy via direct UPI or cash voids all escrow protections, constitutes fee evasion, and will result in immediate permanent account termination and legal reporting."
    },
    {
      title: "Child Protection & Decency",
      subtitle: "Strict Ban on Obscene & Illegal Content",
      icon: <EyeOff className="text-purple-500" size={24} />,
      legal: "POCSO Act, 2012; IT Act Sections 67, 67A & 67B; Indecent Representation of Women (Prohibition) Act, 1986.",
      desc: "Listing, transmitting, or referencing any sexually explicit material, adult toys banned under Indian customs, child sexual abuse material (CSAM), or content depicting indecent representation of women will result in immediate police reporting and FIR filing."
    }
  ];

  const prohibitedItems = [
    { name: "Weapons & Explosives", law: "Arms Act, 1959 & Explosives Act, 1884" },
    { name: "Narcotics & Psychotropic Substances", law: "NDPS Act, 1985" },
    { name: "Prescription Drugs Without License", law: "Drugs & Cosmetics Act, 1940" },
    { name: "Wildlife & Endangered Species", law: "Wildlife Protection Act, 1972" },
    { name: "E-Cigarettes & Vapes", law: "PECA Act, 2019" },
    { name: "Spurious / Counterfeit Goods", law: "Copyright Act, 1957 & Trade Marks Act" },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead
        title="Community Standards | Indiafy – Indian Legal Code Compliant"
        description="Indiafy's Community Standards governed by the IT Act 2000, Indian Penal Code, Consumer Protection Act, and POCSO. Our commitment to respect, safety, and legal compliance."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HERO SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
            <Users size={16} /> Digital Ecosystem Ethics
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Community Standards
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
            A safe hyperlocal marketplace relies on mutual trust, dignity, and strict adherence to the laws of India. Explore the principles that govern every node on Indiafy.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 lg:py-24">

        {/* INTRODUCTION */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-200">
            <Scale size={14} /> Codified Under Indian Jurisprudence
          </div>
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
            Indiafy is a digital neighborhood connecting local merchants, delivery partners, and families. Our Community Standards are not just informal suggestions—they are enforceable rules grounded in the <strong className="text-slate-900">Information Technology Act, 2000</strong>, the <strong className="text-slate-900">Indian Penal Code (IPC)</strong>, and applicable civil and criminal statutes of India.
          </p>
        </section>

        {/* STANDARDS GRID */}
        <section className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-20">
          {standards.map((std, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    {std.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                    Mandate #{i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{std.title}</h3>
                <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">{std.subtitle}</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">{std.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 bg-slate-50/60 -mx-8 -mb-8 p-6 rounded-b-3xl">
                <div className="flex items-start gap-2">
                  <Gavel size={14} className="text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-semibold text-slate-500 leading-normal">
                    <span className="text-slate-700 font-bold">Legal Basis: </span>{std.legal}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* PROHIBITED CONTRABAND TABLE */}
        <section className="mb-20">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-red-950 m-0">Statutory Contraband & Prohibited Listings</h2>
                <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-0.5 m-0">Strict Criminal Liability Under Indian Law</p>
              </div>
            </div>
            <p className="text-sm text-red-900 font-medium mb-6 leading-relaxed">
              In accordance with Section 79 of the IT Act, 2000 and intermediary due diligence guidelines, Indiafy maintains a zero-tolerance policy towards illegal goods. Listing, attempting to buy, or transporting any of the following will result in immediate permanent banning and proactive reporting to law enforcement:
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {prohibitedItems.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                  <p className="text-sm font-bold text-slate-900 mb-1">{item.name}</p>
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                    <BookOpen size={12} /> {item.law}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INTERMEDIARY DUE DILIGENCE & REPORTING */}
        <section className="bg-white p-8 md:p-12 border border-slate-200 rounded-[3rem] shadow-sm mb-16">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-red-50 flex items-center justify-center border-8 border-red-100 shadow-inner">
                <Flag size={48} className="text-red-500" />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                <AlertCircle size={14} /> IT Rules, 2021 Compliance
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-4 text-slate-900 m-0">Reporting & Takedown Protocol</h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm">
                Under the <strong className="text-slate-900">Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, Indiafy provides a rapid grievance redressal mechanism. If you encounter any content, listing, or user behavior that violates these standards or Indian law, report it immediately:
              </p>
              <ul className="list-disc pl-5 text-slate-600 font-medium mb-8 space-y-2 text-sm">
                <li><strong className="text-slate-900">24-Hour Review:</strong> All reported listings and user profiles are audited by our Trust & Safety team within 24 hours.</li>
                <li><strong className="text-slate-900">36-Hour Statutory Takedown:</strong> Upon receipt of a court order or notification by appropriate government agency, unlawful content is removed within 36 hours as mandated by Rule 3(1)(d).</li>
                <li><strong className="text-slate-900">CSAM & Nudity Priority:</strong> Any report involving child sexual abuse material (CSAM) or non-consensual sexual imagery is processed and removed within <strong className="text-red-600">24 hours</strong> as required under Rule 3(2)(b).</li>
              </ul>
              <div className="flex flex-wrap gap-4 items-center">
                <Link to="/contact" className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-md">
                  Report a Violation
                </Link>
                <Link to="/trust-safety" className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                  Learn about Trust & Safety <Scale size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LEGAL CONSEQUENCES */}
        <section className="bg-slate-900 text-white p-8 md:p-12 rounded-[2.5rem]">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-black mb-4 m-0">Consequences of Violation & Enforcement</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
              Indiafy operates a tiered enforcement protocol to maintain community integrity while ensuring procedural fairness:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm font-medium text-slate-300">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                <p className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">1. Warning & Retraining</p>
                <p className="text-xs text-slate-400 leading-relaxed m-0">For minor infractions (e.g., unintentional listing misplacement or first-time communication friction), users receive a formal notice and mandatory policy acknowledgment.</p>
              </div>
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                <p className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">2. Temporary Suspension</p>
                <p className="text-xs text-slate-400 leading-relaxed m-0">For repeated guidelines breaches, rating manipulation, or SLA defaults, buying/selling privileges are suspended for 7 to 30 days with payout holds.</p>
              </div>
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                <p className="text-orange-400 font-bold text-xs uppercase tracking-wider mb-2">3. Permanent Network Ban</p>
                <p className="text-xs text-slate-400 leading-relaxed m-0">For severe offences (hate speech, counterfeit sales, off-platform payment diversion, harassment), entities are permanently banned and blacklisted across all nodes.</p>
              </div>
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
                <p className="text-red-400 font-bold text-xs uppercase tracking-wider mb-2">4. Law Enforcement Prosecution</p>
                <p className="text-xs text-slate-400 leading-relaxed m-0">In cases of fraud, violence, CSAM, or contraband trading, Indiafy proactively preserves electronic logs under Section 67C IT Act and files FIRs with Cyber Crime portals.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}