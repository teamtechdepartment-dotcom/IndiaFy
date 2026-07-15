import React from "react";
import { Link } from "react-router-dom";
import { Users, Heart, ShieldAlert, Flag, MessageCircle, AlertTriangle } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function CommunityStandards() {
  const standards = [
    {
      title: "Respect & Professionalism",
      icon: <Heart className="text-rose-500" size={24} />,
      desc: "All interactions between buyers, sellers, and delivery partners must be respectful. We do not tolerate harassment, hate speech, or abuse under any circumstances."
    },
    {
      title: "Honest Representation",
      icon: <ShieldAlert className="text-emerald-500" size={24} />,
      desc: "Sellers must accurately describe products and their condition. Buyers must submit honest reviews and avoid retaliatory feedback."
    },
    {
      title: "Safety First",
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      desc: "Do not attempt to bypass the platform's payment systems. Transacting outside of Indiafy voids all escrow protections and will result in a ban."
    },
    {
      title: "Constructive Communication",
      icon: <MessageCircle className="text-blue-500" size={24} />,
      desc: "Use the built-in support channels to resolve disputes amicably. Threats of violence or legal action against staff or users will be reported to authorities."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Community Standards | Indiafy"
        description="Indiafy's guidelines for acceptable behavior. Learn about our commitment to respect, safety, and honest representation on the marketplace."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HERO SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
            <Users size={16} /> The Indiafy Community
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Community Standards
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
            A safe marketplace is built on mutual respect. Here are the principles we expect every user to uphold.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        
        {/* INTRODUCTION */}
        <section className="mb-16 text-center">
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
            Indiafy is more than a platform; it's a digital neighborhood. Whether you are buying groceries or running a wholesale supply node, you are part of an ecosystem that relies on trust. Our Community Standards define what is and isn't allowed on Indiafy.
          </p>
        </section>

        {/* STANDARDS GRID */}
        <section className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-24">
          {standards.map((std, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-6">
                {std.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{std.title}</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{std.desc}</p>
            </div>
          ))}
        </section>

        {/* REPORTING */}
        <section className="bg-white p-8 md:p-12 border border-slate-200 rounded-[3rem] shadow-sm mb-16">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-32 h-32 rounded-full bg-red-50 flex items-center justify-center border-8 border-red-100">
                <Flag size={48} className="text-red-500" />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-black tracking-tight mb-4 text-slate-900">Reporting Violations</h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                If you encounter a user, product listing, or delivery partner that violates these standards, please report it immediately. Our Trust & Safety team reviews all reports within 24 hours.
              </p>
              <ul className="list-disc pl-5 text-slate-600 font-medium mb-8 space-y-2 text-sm">
                <li>Use the 'Report Listing' button on any product page.</li>
                <li>Report order issues directly through your Order History.</li>
                <li>Contact support for urgent safety matters.</li>
              </ul>
              <Link to="/contact" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors">
                Contact Trust & Safety
              </Link>
            </div>
          </div>
        </section>

        {/* CONSEQUENCES */}
        <section>
          <div className="prose prose-slate max-w-none prose-headings:font-black">
            <h3 className="text-2xl mb-4">Consequences of Violation</h3>
            <p className="font-medium text-slate-600">
              Violating the Community Standards may result in the following actions, depending on the severity of the offense:
            </p>
            <ul className="font-medium text-slate-600">
              <li>A formal warning and request for behavior modification.</li>
              <li>Temporary suspension of buying or selling privileges.</li>
              <li>Permanent account ban and addition to our network blacklist.</li>
              <li>Cooperation with local law enforcement if a crime is suspected.</li>
            </ul>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
