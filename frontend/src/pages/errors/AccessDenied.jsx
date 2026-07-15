import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, KeySquare } from "lucide-react";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1528] flex items-center justify-center p-4 font-sans selection:bg-[#D4AF37] selection:text-black">
      <div className="w-full max-w-lg bg-[#0F1C36]/50 backdrop-blur-2xl p-10 sm:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[#D4AF37]/20 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Gold Glow */}
        <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-[#AA7C11]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-24 h-24 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full flex items-center justify-center mb-8 relative z-10 shadow-inner">
          <ShieldAlert size={48} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight mb-4 relative z-10">
          Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AA7C11] to-[#D4AF37]">Denied</span>
        </h1>
        
        <p className="text-gray-300 font-medium text-sm leading-relaxed mb-10 relative z-10 max-w-sm">
          You don't have the required credentials or role policies to view this page. If you believe this is an error, please contact the systems administrator.
        </p>

        <div className="flex flex-col gap-3 w-full relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-lg shadow-[#D4AF37]/10 active:scale-[0.98]"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate("/admin/login")}
            className="w-full flex items-center justify-center gap-2 py-4 bg-transparent text-[#D4AF37] border-2 border-[#D4AF37]/30 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all active:scale-[0.98]"
          >
            <KeySquare size={16} />
            Admin Command Login
          </button>
        </div>
      </div>
    </div>
  );
}
