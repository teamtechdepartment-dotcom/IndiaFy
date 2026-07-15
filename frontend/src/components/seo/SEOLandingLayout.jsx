import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SEOHead from "./SEOHead";
import WebsiteNavbar from "../WebsiteNavbar";
import Footer from "../Footer";

export default function SEOLandingLayout({ 
  seoTitle, 
  seoDescription, 
  schemas = [],
  heroTitle, 
  heroSubtitle, 
  children,
  faqs = []
}) {
  const [openFaq, setOpenFaq] = useState(null);

  // Generate Organization & LocalBusiness Schemas that apply to all SEO pages
  const baseSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Indiafy",
      "url": "https://india-fy.vercel.app",
      "logo": "https://india-fy.vercel.app/logo.png",
      "description": "India's trusted hyperlocal commerce network connecting verified local sellers with buyers.",
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Indiafy Quick Commerce",
      "image": "https://india-fy.vercel.app/logo.png",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Gurugram",
        "addressRegion": "Haryana",
        "addressCountry": "IN"
      },
      "priceRange": "₹₹",
      "url": "https://india-fy.vercel.app"
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://india-fy.vercel.app/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://india-fy.vercel.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ];

  const allSchemas = [...baseSchemas, ...schemas];

  // If FAQs exist, generate FAQ Schema
  if (faqs.length > 0) {
    allSchemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    });
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900 selection:bg-brand-primary selection:text-white">
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        schemas={allSchemas}
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HERO SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent blur-3xl opacity-50" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1]">
            {heroTitle}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/search" className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-xl">
              Start Shopping <ArrowRight size={16} />
            </Link>
            <Link to="/become-seller-info" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-white/20 transition-colors">
              Become a Seller
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        
        {/* The 1500+ Words Content Wrapper */}
        <article className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-3xl mb-24">
          {children}
        </article>

        {/* INLINE CTA BANNER */}
        <section className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-10 lg:p-16 text-center mb-24">
          <h2 className="text-3xl font-black text-emerald-950 mb-4 tracking-tight">Experience Indiafy Today</h2>
          <p className="text-emerald-800 font-medium mb-8 max-w-2xl mx-auto">
            Whether you are a customer looking for under 30-minute delivery or a business needing wholesale supplies, our verified network is ready to serve you.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left mb-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <span className="font-bold text-sm text-emerald-900">Zero-Trust KYC Sellers</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <span className="font-bold text-sm text-emerald-900">Secure Escrow Payments</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <span className="font-bold text-sm text-emerald-900">Under 30-Min Quick Commerce</span>
            </div>
          </div>
          <Link to="/search" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-colors shadow-lg">
            Browse Categories <ArrowRight size={16} />
          </Link>
        </section>

        {/* FAQ SECTION */}
        {faqs.length > 0 && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-500 font-medium">Quick answers to common questions about our services.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-brand-primary shadow-md' : 'border-slate-200'}`}>
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="font-bold text-slate-900">{faq.q}</span>
                      <span className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-primary' : 'text-slate-400'}`}>
                        <ChevronDown size={20} />
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-6 pb-6 pt-0">
                            <div className="h-px w-full bg-slate-100 mb-4" />
                            <p className="text-slate-600 font-medium leading-relaxed text-sm">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
