import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShieldCheck, Target, Zap, MapPin, Users, TrendingUp, Sparkles, Star, Package, ChevronDown } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function About() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-brand-primary selection:text-white" ref={containerRef}>
      <SEOHead 
        title="About Indiafy | Our Story & Mission"
        description="Learn how Indiafy is revolutionizing quick commerce and hyperlocal shopping in Gurugram by bringing trust and speed together."
      />
      <WebsiteNavbar scrolledByDefault={true} />
      
      {/* IMMERSIVE HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />
          <div className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-brand-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-[40vw] h-[40vw] bg-emerald-400/10 rounded-full blur-[100px]" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Our Story</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-8">
              Redefining local <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                commerce.
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto mb-12">
              We aren't just building an app. We're rebuilding the trust between neighborhoods and the businesses that serve them, one 30-minute delivery at a time.
            </p>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-slate-500">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* THE PROBLEM & SOLUTION (Editorial Style) */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                The gap between <span className="text-brand-primary">local stores</span> and digital convenience.
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
                <p>
                  Before Indiafy, shopping locally meant sacrificing digital convenience. You had to physically walk to the store, negotiate, and hope they had what you needed. Meanwhile, massive e-commerce giants offered convenience but stripped away the human element of neighborhood shopping.
                </p>
                <p>
                  We saw this massive disconnect in Gurugram. Incredible local Kirana stores, electronics shops, and fashion boutiques were losing out simply because they didn't have the technology to compete.
                </p>
                <p className="text-slate-900 font-bold border-l-4 border-brand-primary pl-6 py-2">
                  "We realized the future wasn't about building giant warehouses outside the city. It was about empowering the stores right around the corner."
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] lg:aspect-square group"
            >
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600" 
                alt="Local Commerce" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-white">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
                      <Zap size={24} className="text-white fill-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Under 30-Min Delivery</h4>
                      <p className="text-sm text-slate-300">Directly from your neighborhood.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENTO BOX PRINCIPLES */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">How we do things differently</h2>
            <p className="text-xl text-slate-600 font-medium">We don't just list products; we engineer trust. Here is what makes Indiafy completely unique.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Bento Item 1 - Large */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors duration-500" />
              <div className="relative z-10">
                <ShieldCheck size={40} className="text-brand-primary mb-6" />
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Strictly Verified Network</h3>
                <p className="text-lg text-slate-600 leading-relaxed max-w-md">
                  Not just anyone can sell on Indiafy. Every single seller undergoes a rigorous physical KYC check. We verify their store, their inventory, and their identity before they can process a single order.
                </p>
              </div>
            </motion.div>

            {/* Bento Item 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-sm relative overflow-hidden group hover:bg-slate-800 transition-colors"
            >
              <Zap size={40} className="text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Insane Speed</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                By geofencing our sellers to their immediate neighborhoods, we guarantee fulfillment times that traditional e-commerce can't even dream of.
              </p>
            </motion.div>

            {/* Bento Item 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-brand-primary rounded-[2rem] p-10 text-white shadow-sm hover:bg-brand-accent transition-colors"
            >
              <Users size={40} className="text-white mb-6" />
              <h3 className="text-2xl font-bold mb-4">Community First</h3>
              <p className="text-emerald-50 leading-relaxed font-medium">
                Every purchase on Indiafy directly supports a local family business in Gurugram, keeping the money within the local economy.
              </p>
            </motion.div>

            {/* Bento Item 4 - Large */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1">
                <Target size={40} className="text-brand-primary mb-6" />
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Escrow Protected Payments</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Your money is entirely safe. We hold your payment in a secure escrow account and only release it to the seller once you have successfully received your order. Total peace of mind.
                </p>
              </div>
              <div className="w-full md:w-1/3 aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-6 text-slate-300">
                <ShieldCheck size={100} strokeWidth={1} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY (Editorial layout) */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 lg:p-20 text-white relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 shadow-2xl">
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            
            <div className="w-full lg:w-5/12 relative z-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-primary rounded-[2.5rem] -rotate-6 scale-105 opacity-50 blur-xl group-hover:opacity-70 group-hover:blur-2xl transition-all duration-700" />
                <img 
                  src="/Images/founder-pic.jpeg" 
                  alt="Prashant Kumar Choudhary" 
                  className="relative z-10 w-full aspect-[4/5] object-cover rounded-[2.5rem] border border-white/10 shadow-2xl"
                />
              </div>
            </div>

            <div className="w-full lg:w-7/12 relative z-10">
              <Star size={40} className="text-emerald-400 mb-8 fill-emerald-400/20" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-8 text-white">
                "We didn't set out to build another app. We set out to give local commerce the technology it deserves."
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-10 font-medium">
                Gurugram is a city of incredible speed and ambition. But when it came to everyday shopping, things were broken. I saw brilliant local store owners struggling to reach customers digitally, while people waited hours or days for simple deliveries from massive warehouses. Indiafy is our answer. We're putting the power of hyper-fast logistics into the hands of the neighborhood stores you already know and trust.
              </p>
              <div>
                <p className="text-2xl font-bold text-white">Prashant Kumar Choudhary</p>
                <p className="text-emerald-400 font-semibold tracking-wider text-sm uppercase mt-2">Founder & CEO, Indiafy</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS TICKER */}
      <section className="py-20 border-t border-slate-200 overflow-hidden bg-white">
        <div className="flex gap-16 items-center whitespace-nowrap animate-[scroll_30s_linear_infinite] px-8">
          {[...Array(3)].map((_, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-slate-900">500+</span>
                <span className="text-lg font-bold text-slate-500 uppercase tracking-widest mt-2">Stores</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-brand-primary" />
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-slate-900">10,000+</span>
                <span className="text-lg font-bold text-slate-500 uppercase tracking-widest mt-2">Products</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-brand-primary" />
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-slate-900">Under 30</span>
                <span className="text-lg font-bold text-slate-500 uppercase tracking-widest mt-2">Min Delivery</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-brand-primary" />
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-slate-900">100%</span>
                <span className="text-lg font-bold text-slate-500 uppercase tracking-widest mt-2">Verified</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-brand-primary" />
            </React.Fragment>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333333%); }
          }
        `}} />
      </section>
      
      <Footer />
    </div>
  );
}
