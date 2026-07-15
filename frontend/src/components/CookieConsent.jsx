import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('indiafy_cookie_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('indiafy_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('indiafy_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none">
      <div className="max-w-5xl mx-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-6 md:p-8 rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-40 h-40 bg-emerald-500/20 blur-[100px] pointer-events-none" />

        <div className="flex-1 relative z-10 flex items-start gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl shrink-0 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1 tracking-tight">Your Privacy Matters</h3>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-2xl">
              Indiafy uses cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={declineCookies}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm tracking-wide text-zinc-300 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-700 transition-all"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm tracking-wide text-black bg-white hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_30px_rgba(52,211,153,0.4)]"
          >
            Accept All
          </button>
          <button 
            onClick={declineCookies}
            className="md:hidden absolute -top-16 right-0 p-2 text-zinc-500 hover:text-white bg-zinc-900 rounded-full border border-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
