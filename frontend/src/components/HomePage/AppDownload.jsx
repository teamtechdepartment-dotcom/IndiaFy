import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Star } from "lucide-react";

export default function AppDownload() {
  return (
    <section className="py-section-mobile md:py-16 bg-brand-primary overflow-hidden relative" id="app-download">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
              <Smartphone size={14} className="text-brand-accent" />
              <span className="text-xs font-semibold tracking-wide">Indiafy Mobile App</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
              Shop Faster with the Indiafy App
            </h2>
            
            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md">
              Get exclusive app-only deals, real-time order tracking, and lightning-fast checkout on the go.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* App Store Button (Placeholder) */}
              <a
                href="#"
                className="flex items-center gap-3 px-5 py-3 bg-white text-brand-primary rounded-xl hover:bg-gray-100 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-gray-500 leading-none mb-1">Download on the</span>
                  <span className="text-sm font-bold leading-none">App Store</span>
                </div>
              </a>

              {/* Play Store Button (Placeholder) */}
              <a
                href="#"
                className="flex items-center gap-3 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-gray-400 leading-none mb-1">GET IT ON</span>
                  <span className="text-sm font-bold leading-none">Google Play</span>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" className="text-amber-500" />)}
              </div>
              <span>4.8/5 Rating</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>1M+ Downloads</span>
            </div>
          </motion.div>

          {/* Right Phone Mockup (CSS Drawn) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="relative hidden md:flex justify-center lg:justify-end"
          >
            <div className="relative w-[280px] h-[580px] bg-brand-primary border-[8px] border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden shadow-brand-accent/20">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-2xl mx-auto w-1/2 z-20" />
              
              {/* Screen Content */}
              <div className="w-full h-full bg-brand-background relative pt-12 pb-6 px-4 flex flex-col gap-4">
                
                {/* Search Bar */}
                <div className="w-full h-10 bg-white rounded-full shadow-sm" />
                
                {/* Promo Card */}
                <div className="w-full h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-sm flex items-center justify-center">
                  <span className="text-white font-bold">UNDER 30-MIN DELIVERY</span>
                </div>
                
                {/* Categories Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm" />
                      <div className="w-10 h-1.5 bg-gray-200 rounded-full" />
                    </div>
                  ))}
                </div>
                
                {/* Product Card */}
                <div className="mt-2 flex-1 bg-white rounded-t-3xl shadow-sm border border-gray-100 p-4">
                  <div className="w-24 h-4 bg-gray-200 rounded-full mb-4" />
                  <div className="w-full h-32 bg-gray-100 rounded-xl mb-3" />
                  <div className="w-3/4 h-3 bg-gray-200 rounded-full mb-2" />
                  <div className="w-1/2 h-3 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
            
            {/* Floating Element behind phone */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-40 z-[-1]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
