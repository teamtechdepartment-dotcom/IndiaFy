import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

export default function NotFound() {
  return (
    <div className="bg-zinc-50 min-h-screen flex flex-col justify-between text-zinc-600 font-sans">
      <WebsiteNavbar />

      <main className="max-w-4xl mx-auto px-6 py-40 text-center flex flex-col items-center justify-center flex-grow">
        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-8 border border-red-100 animate-pulse">
          <AlertCircle size={48} />
        </div>

        <h1 className="text-7xl md:text-9xl font-black text-zinc-950 tracking-tighter mb-4">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 uppercase tracking-tight mb-6">
          Node Connection Lost
        </h2>

        <p className="text-zinc-500 max-w-md font-medium mb-12 leading-relaxed">
          The payload or page you are requesting does not exist on our hyperlocal nodes. It may have been moved or the address was typed incorrectly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-300"
          >
            <Home size={14} /> Return to Home Node
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 border border-zinc-200 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-zinc-50 transition-all shadow-sm"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
