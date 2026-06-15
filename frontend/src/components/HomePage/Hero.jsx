/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Package,
  Star,
  Clock,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

/* ---------- Floating Marketplace Mockup Cards ---------- */
function FloatingProductCard() {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-8 right-4 lg:right-8 w-52 bg-white rounded-2xl shadow-xl border border-brand-border p-3 z-20"
    >
      <div className="w-full h-28 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 mb-3 flex items-center justify-center">
        <ShoppingBag size={32} className="text-brand-accent" />
      </div>
      <p className="text-xs font-bold text-brand-primary truncate">Premium A2 Desi Ghee</p>
      <div className="flex items-center gap-1 mt-1">
        <Star size={11} fill="#F59E0B" className="text-amber-400" />
        <span className="text-[10px] font-semibold text-brand-text-secondary">4.9 · 320 reviews</span>
      </div>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <span className="text-sm font-bold text-brand-primary">₹1,299</span>
        <span className="text-[10px] text-brand-text-secondary line-through">₹1,699</span>
        <span className="text-[10px] font-semibold text-brand-accent ml-auto">23% OFF</span>
      </div>
    </motion.div>
  );
}

function FloatingOrderCard() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-24 left-0 lg:left-4 w-56 bg-white rounded-2xl shadow-lg border border-brand-border p-3.5 z-20"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Package size={16} className="text-brand-accent" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-brand-primary">Order #IF-2847</p>
          <p className="text-[9px] text-brand-text-secondary">Out for delivery</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="w-[75%] h-full bg-brand-accent rounded-full" />
        </div>
        <span className="text-[10px] font-bold text-brand-accent">12 min</span>
      </div>
    </motion.div>
  );
}

function FloatingRatingCard() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-8 right-12 w-44 bg-white rounded-xl shadow-lg border border-brand-border p-3 z-20"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <BadgeCheck size={16} className="text-brand-accent" />
        <span className="text-[10px] font-bold text-brand-primary">Verified Seller</span>
      </div>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} fill="#F59E0B" className="text-amber-400" />
        ))}
      </div>
      <p className="text-[10px] text-brand-text-secondary mt-1">Organic Roots · 4.9★</p>
    </motion.div>
  );
}

/* ---------- Network Route Animation ---------- */
function NetworkRoute() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none opacity-80">
      <svg className="w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.15" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dotted static path */}
        <path 
          d="M 280 80 C 380 200, 380 300, 260 430 C 200 480, 80 450, 130 380" 
          fill="none" 
          stroke="url(#routeGradient)" 
          strokeWidth="2" 
          strokeDasharray="4 8" 
          strokeLinecap="round"
        />

        {/* Pulsing Location Markers */}
        <circle cx="280" cy="80" r="3.5" fill="#10B981" className="animate-pulse" />
        <circle cx="260" cy="430" r="3.5" fill="#10B981" className="animate-pulse" />
        <circle cx="130" cy="380" r="3.5" fill="#10B981" className="animate-pulse" />

        <circle cx="280" cy="80" r="10" fill="none" stroke="#10B981" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} opacity="0.3" />
        <circle cx="260" cy="430" r="10" fill="none" stroke="#10B981" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} opacity="0.3" />
        <circle cx="130" cy="380" r="10" fill="none" stroke="#10B981" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} opacity="0.3" />

        {/* Glowing moving dot */}
        <circle r="4" fill="#10B981" filter="url(#glow)">
          <animateMotion 
            dur="6s" 
            repeatCount="indefinite"
            path="M 280 80 C 380 200, 380 300, 260 430 C 200 480, 80 450, 130 380"
          />
        </circle>
      </svg>
    </div>
  );
}

/* ---------- Main Hero ---------- */
function Hero() {
  const navigate = useNavigate();

  return (
    <section
      className="relative w-full bg-hero-gradient overflow-hidden pt-32 lg:pt-36 pb-16 lg:pb-24"
      aria-label="Hero banner"
    >
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/40 to-teal-100/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/30 to-indigo-100/10 rounded-full blur-3xl -z-0" aria-hidden="true" />

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* LEFT: Text & CTA */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Live Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 w-fit px-4 py-2 mb-6 rounded-full bg-white border border-brand-border shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent" />
              </span>
              <span className="text-xs font-semibold text-brand-primary">
                Live in Gurugram · 500+ Verified Sellers
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-hero-mobile lg:text-hero text-brand-primary mb-5"
            >
              India's Most{" "}
              <span className="text-brand-accent">Trusted Marketplace</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-brand-text-secondary text-base lg:text-lg font-medium max-w-xl mb-8 leading-relaxed"
            >
              The best online shopping platform in Gurugram. Discover local stores, wholesale suppliers, and instant quick commerce delivery from our verified sellers marketplace.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <button
                onClick={() => navigate("/search")}
                className="btn-primary"
              >
                Shop Now
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/seller/login")}
                className="btn-secondary"
              >
                Become a Seller
              </button>
            </motion.div>

            {/* Stat Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: <Zap size={14} className="text-brand-accent" />, text: "15-min Delivery" },
                { icon: <ShieldCheck size={14} className="text-brand-accent" />, text: "Verified Sellers" },
                { icon: <Package size={14} className="text-brand-accent" />, text: "Free Returns" },
              ].map((stat) => (
                <div
                  key={stat.text}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-border text-xs font-semibold text-brand-primary shadow-sm"
                >
                  {stat.icon}
                  {stat.text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Floating Marketplace Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-5 hidden lg:block relative h-[500px]"
          >
            {/* Background blob */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-[3rem] border border-brand-border/50" />

            {/* Subtly Animated Logistics Route */}
            <NetworkRoute />

            <FloatingProductCard />
            <FloatingOrderCard />
            <FloatingRatingCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);