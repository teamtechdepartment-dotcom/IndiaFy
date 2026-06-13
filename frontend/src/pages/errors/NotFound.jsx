import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1528] flex items-center justify-center p-4 font-sans selection:bg-[#D4AF37] selection:text-black">
      <div className="relative w-full max-w-4xl bg-[#0F1C36]/50 rounded-[3rem] shadow-[0_32px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-[#D4AF37]/20">
        
        {/* Visual / Illustration Side */}
        <div className="w-full md:w-1/2 bg-[#0B1528] p-12 flex flex-col items-center justify-center relative overflow-hidden text-center md:text-left border-b md:border-b-0 md:border-r border-[#D4AF37]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#AA7C11]/10 to-[#D4AF37]/10 mix-blend-overlay" />
          <div className="absolute -top-[20%] -left-[20%] w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[20%] w-96 h-96 bg-[#AA7C11]/15 rounded-full blur-[120px] pointer-events-none" style={{ animationDelay: "2s" }} />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 bg-[#D4AF37]/10 rounded-3xl backdrop-blur-md border border-[#D4AF37]/25 flex items-center justify-center mb-8 shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500">
              <Ghost size={64} className="text-[#D4AF37] opacity-90" strokeWidth={1.5} />
            </div>
            <h1 className="text-[120px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 tracking-tighter">
              404
            </h1>
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 p-10 sm:p-14 lg:p-16 flex flex-col justify-center bg-transparent relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 w-fit">
            <Search size={14} /> Page Not Found
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight mb-4">
            Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AA7C11] to-[#D4AF37]">void.</span>
          </h2>
          
          <p className="text-gray-300 text-sm font-medium leading-relaxed mb-10 max-w-sm">
            Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-3 py-4 bg-transparent text-[#D4AF37] border-2 border-[#D4AF37]/30 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-xl active:scale-[0.98]"
            >
              <Home size={16} />
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
