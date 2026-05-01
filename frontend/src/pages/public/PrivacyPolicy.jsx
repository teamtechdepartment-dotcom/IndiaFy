import React from "react";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Video,
  MapPin,
  ChevronRight,
  FileText,
} from "lucide-react";

// Layout Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

export default function PrivacyPolicy() {
  const lastUpdated = "March 25, 2026";

  const sections = [
    {
      title: "Data Collection",
      icon: <Database size={20} />,
      content:
        "We collect precise location data (Sector-based mapping), device information, and transaction history to ensure 10-25 minute delivery within your node.",
    },
    {
      title: "Video Verification Policy",
      icon: <Video size={20} />,
      content:
        "High-value orders are subject to mandatory video-verified packing. These recordings are stored on secure Indiafy Nodes and are only accessed during dispute resolution.",
    },
    {
      title: "Operational Privacy",
      icon: <ShieldCheck size={20} />,
      content:
        "In accordance with our 'Operational Discipline' mandate, your sector-specific movements are encrypted and never shared with external advertising aggregators.",
    },
    {
      title: "Payment Security",
      icon: <Lock size={20} />,
      content:
        "Payments via Dynamic QR and UPI are processed through bank-grade microservices. We do not store raw card data on our local sector servers.",
    },
  ];

  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-600 font-sans">
      <WebsiteNavbar />

      {/* HEADER SECTION */}
      <header className="bg-zinc-950 pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-8">
            <ShieldCheck size={14} /> Indiafy Security Standard
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
            Privacy <span className="text-zinc-700 italic">Mandate</span>
          </h1>
          <p className="text-zinc-400 text-lg font-medium">
            Last Updated: {lastUpdated} · Version 2.0 (Gurugram Node)
          </p>
        </div>
        {/* Ambient Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-12 pb-32">
        {/* HIGHLIGHT CARDS */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {sections.map((s, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 hover:border-zinc-900 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                {s.icon}
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-3 uppercase tracking-tighter">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed font-medium text-zinc-500">
                {s.content}
              </p>
            </div>
          ))}
        </div>

        {/* FULL CONTENT */}
        <article className="prose prose-zinc max-w-none bg-white p-10 md:p-16 rounded-[3rem] border border-zinc-100 shadow-sm text-zinc-800">
          <h2 className="text-3xl font-black tracking-tight mb-8 flex items-center gap-3">
            <FileText className="text-zinc-300" /> Introduction
          </h2>
          <p className="mb-8 font-medium leading-relaxed">
            Welcome to Indiafy. We are committed to protecting your personal
            data and your right to privacy. This mandate explains how we handle
            your information when you use our sector-assigned hyperlocal
            commerce services.
          </p>

          <h3 className="text-xl font-bold mt-12 mb-4">
            1. How We Use Location
          </h3>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Unlike traditional e-commerce, Indiafy operates on a{" "}
            <strong>Node-based architecture</strong>. We use your location to
            map you to the nearest verified hub. This data is deleted after the
            order lifecycle is complete, except where required for operational
            logs.
          </p>

          <h3 className="text-xl font-bold mt-12 mb-4">
            2. Video Proof & Content
          </h3>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Sellers are required to record order packing for high-value items.
            These videos are end-to-end encrypted. Customers can view their own
            order videos for 7 days post-delivery via the "Order History"
            section.
          </p>

          <h3 className="text-xl font-bold mt-12 mb-4">3. Data Sovereignty</h3>
          <p className="text-zinc-500 leading-relaxed mb-6">
            Your data is stored on local servers within India. We do not sell or
            lease your personal information to third-party data brokers.
          </p>

          <div className="mt-20 p-8 bg-zinc-50 rounded-3xl border border-zinc-100 flex items-start gap-6">
            <Eye className="text-zinc-900 shrink-0" size={24} />
            <div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-2">
                Transparency Note
              </h4>
              <p className="text-[11px] font-bold text-zinc-400 leading-relaxed uppercase tracking-tighter">
                You have the right to request a complete export of your
                transaction history and video logs at any time via the Support
                Center.
              </p>
            </div>
          </div>
        </article>

        {/* CALL TO ACTION */}
        <div className="mt-16 text-center">
          <p className="text-sm font-bold text-zinc-400 mb-6">
            Have questions about your data?
          </p>
          <button className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-xl">
            Contact Privacy Officer
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
