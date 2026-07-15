/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React from "react";
import { Link } from "react-router-dom";
import { ServerCrash, RefreshCw, Home, MessageSquareWarning } from "lucide-react";

export default function ServerError() {
  const errorId = `ERR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#0B1528] flex items-center justify-center p-4 font-sans selection:bg-[#D4AF37] selection:text-black">
      <div className="w-full max-w-2xl bg-[#0F1C36]/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-[#D4AF37]/20">
        
        {/* Banner Section */}
        <div className="bg-[#0B1528] p-12 text-center relative overflow-hidden border-b border-[#D4AF37]/10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
          <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-[#D4AF37]/15 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-[#D4AF37]/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/25 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
              <ServerCrash size={40} className="text-[#D4AF37]" />
            </div>
            <h1 className="text-4xl font-display font-black text-white tracking-tight mb-2">
              Internal Server Error
            </h1>
            <p className="text-[#D4AF37] font-medium tracking-widest text-xs uppercase">HTTP 500 / Enterprise Service Failure</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10 sm:p-14 bg-transparent text-center flex flex-col items-center">
          <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-md mb-8">
            We encountered an unexpected issue on our backend services. Our systems operations command center has been notified.
          </p>

          <div className="w-full max-w-xs bg-[#0B1528] border border-[#D4AF37]/15 rounded-xl p-4 mb-10 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Error ID</span>
            <span className="text-xs font-mono font-bold text-[#D4AF37]">{errorId}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-lg shadow-[#D4AF37]/10 active:scale-[0.98]"
            >
              <RefreshCw size={16} />
              Retry Request
            </button>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-transparent text-[#D4AF37] border-2 border-[#D4AF37]/30 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all active:scale-[0.98]"
            >
              <Home size={16} />
              Return Home
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-[#D4AF37]/10 w-full flex justify-center">
            <button className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors">
              <MessageSquareWarning size={14} /> Contact support desk
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
