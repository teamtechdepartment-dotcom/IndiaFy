import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";

export default function NotFound() {
  return (
    <div className="bg-zinc-50 min-h-screen flex flex-col justify-between text-slate-500 font-sans">
      <WebsiteNavbar />

      <main className="max-w-4xl mx-auto px-6 py-40 text-center flex flex-col items-center justify-center flex-grow">

      {/* Background Blobs for Hero Theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[100px]" />
      </div>
      
        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-8 border border-red-100 animate-pulse">
          <AlertCircle size={48} />
        </div>

        <h1 className="text-7xl md:text-9xl font-black text-zinc-950 tracking-tighter mb-4">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-tight mb-6">
          Node Connection Lost
        </h2>

        <p className="text-slate-500 max-w-md font-medium mb-12 leading-relaxed">
          The payload or page you are requesting does not exist on our hyperlocal nodes. It may have been moved or the address was typed incorrectly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-100 border border-slate-200 transition-all shadow-xl shadow-zinc-300"
          >
            <Home size={14} /> Return to Home Node
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 border border-zinc-200 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-zinc-50 transition-all shadow-sm"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
