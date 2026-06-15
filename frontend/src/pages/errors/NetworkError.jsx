import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Activity, ArrowRight } from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";

export default function NetworkError() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const checkBackend = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }
      try {
        await axiosInstance.get('/health');
        setIsOnline(true);
      } catch (_err) {
        setIsOnline(false);
      }
    };
    checkBackend();
    
    const handleOnline = () => checkBackend();
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    if (!navigator.onLine) {
      setIsChecking(false);
      setIsOnline(false);
      return;
    }
    
    try {
      await axiosInstance.get('/health');
      window.location.href = '/';
    } catch (_err) {
      setIsOnline(false);
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1528] flex items-center justify-center p-4 font-sans selection:bg-[#D4AF37] selection:text-black">
      <div className="w-full max-w-md bg-[#0F1C36]/50 backdrop-blur-xl border border-[#D4AF37]/20 rounded-[2.5rem] p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#0B1528] border-2 border-[#D4AF37]/20 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20 animate-ping opacity-20" />
            <WifiOff size={40} className="text-[#D4AF37]" />
          </div>

          <h1 className="text-3xl font-display font-black text-white tracking-tight mb-3">
            Connection <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AA7C11] to-[#D4AF37]">Lost</span>
          </h1>
          
          <p className="text-gray-300 font-medium text-sm leading-relaxed mb-10">
            We're unable to connect to Indiafy's administration servers. Please check your network connectivity.
          </p>

          <div className="w-full bg-[#0B1528]/80 rounded-2xl p-4 mb-8 flex items-center justify-between border border-[#D4AF37]/15">
            <div className="flex items-center gap-3">
              <Activity size={18} className={isOnline ? "text-emerald-400" : "text-rose-500"} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                Network Status
              </span>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${isOnline ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#AA7C11] to-[#D4AF37] text-black rounded-2xl font-black uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {isChecking ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
            {isChecking ? "Checking Status..." : "Retry Connection"}
          </button>
        </div>

      </div>
    </div>
  );
}
