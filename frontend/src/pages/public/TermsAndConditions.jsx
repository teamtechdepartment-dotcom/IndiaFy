import React from "react";
import {
  FileText,
  Gavel,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Scale,
  ArrowRight,
} from "lucide-react";

// Layout Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

export default function TermsAndConditions() {
  const lastUpdated = "March 25, 2026";

  const keyClauses = [
    {
      title: "Service Territory",
      desc: "Services are strictly limited to verified Gurugram sectors. Orders placed outside the operational node will be automatically cancelled.",
      icon: <Scale className="text-zinc-400" size={24} />,
    },
    {
      title: "Video Verification",
      desc: "By using Indiafy, you agree that high-value shipments require mandatory video-recorded packing and unboxing for insurance claims.",
      icon: <ShieldAlert className="text-zinc-400" size={24} />,
    },
    {
      title: "Payment Mandate",
      desc: "Only platform-generated Dynamic QRs are valid. Personal transfers to riders violate our safety protocols and are not refundable.",
      icon: <CheckCircle2 className="text-zinc-400" size={24} />,
    },
  ];

  return (
    <div className="bg-white min-h-screen text-zinc-600 font-sans">
      <WebsiteNavbar />

      {/* HEADER AREA */}
      <header className="bg-zinc-50 pt-40 pb-20 border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-6xl font-black text-zinc-900 tracking-tighter leading-none mb-6">
                Terms of <br />
                <span className="text-zinc-300 italic">Service</span>
              </h1>
              <p className="text-zinc-500 font-medium text-lg">
                Please read these terms carefully before engaging with the
                Indiafy Hyperlocal Node.
              </p>
            </div>
            <div className="bg-white border border-zinc-200 px-6 py-4 rounded-3xl shadow-sm">
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">
                Last Updated
              </p>
              <p className="text-sm font-bold text-zinc-900">{lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        {/* QUICK SUMMARY CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {keyClauses.map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 hover:bg-zinc-950 hover:text-white transition-all duration-500 group"
            >
              <div className="mb-6 group-hover:text-emerald-400 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-black uppercase tracking-tight text-lg mb-3">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed font-medium opacity-70">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* LEGAL SECTIONS */}
        <div className="space-y-20 max-w-4xl">
          <section>
            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-4 mb-8">
              <span className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center text-sm">
                01
              </span>
              User Eligibility
            </h2>
            <div className="space-y-4 text-zinc-500 leading-relaxed font-medium">
              <p>
                User must be at least 18 years of age to register on the Indiafy
                Platform. Registration requires a verified mobile number and
                access to a supported Gurugram sector node.
              </p>
              <p>
                Commercial exploitation of the buyer app for re-selling purposes
                is strictly prohibited under our fair-use policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-4 mb-8">
              <span className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center text-sm">
                02
              </span>
              Operational Discipline
            </h2>
            <div className="space-y-4 text-zinc-500 leading-relaxed font-medium">
              <p>
                <strong>Delivery Timelines:</strong> Indiafy aims for 10-25
                minute delivery. However, delays due to extreme weather or
                sector-specific security lockdowns are exempt from standard SLA
                credits.
              </p>
              <p>
                <strong>Order Cancellation:</strong> Once a seller initiates
                'Video Packing', cancellations are subject to a processing fee
                as outlined in the refund policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-4 mb-8">
              <span className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center text-sm">
                03
              </span>
              Anti-Fraud Mandate
            </h2>
            <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-6">
              <AlertTriangle className="text-amber-600 shrink-0" size={28} />
              <div>
                <h4 className="font-black text-amber-900 uppercase tracking-widest text-sm mb-2">
                  Critical Warning
                </h4>
                <p className="text-amber-800/70 text-sm leading-relaxed font-medium uppercase tracking-tighter">
                  Any attempt to bypass the Indiafy Node payment system by
                  paying riders directly via personal UPI apps will result in
                  immediate permanent account termination without refund.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter flex items-center gap-4 mb-8">
              <span className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center text-sm">
                04
              </span>
              Dispute Resolution
            </h2>
            <p className="text-zinc-500 leading-relaxed font-medium">
              All disputes will be settled using the mandatory video-packing
              proof. In the absence of customer unboxing videos, the seller's
              packing video will be considered the final evidence of order
              accuracy.
            </p>
          </section>
        </div>

        {/* ACCEPTANCE BOX */}
        <div className="mt-32 p-12 bg-zinc-950 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white tracking-tighter mb-4">
              Acceptance of Terms
            </h3>
            <p className="text-zinc-500 max-w-xl mx-auto mb-10">
              By clicking "Place Order" on our platform, you signify your
              irrevocable acceptance of these terms.
            </p>
            <button
              onClick={() => window.scrollTo(0, 0)}
              className="px-12 py-5 bg-white text-zinc-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all"
            >
              I Understand & Agree
            </button>
          </div>
          {/* Abstract Circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900 rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
