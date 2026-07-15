import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    "All",
    "Orders & Delivery",
    "Payments",
    "Returns & Refunds",
    "Seller Program",
    "Wholesale Marketplace",
    "Trust & Verification",
    "Account & Login",
    "Quick Commerce"
  ];

  const faqs = [
    {
      category: "General", // For broad questions
      q: "What is Indiafy?",
      a: "Indiafy is a trust-first hyperlocal marketplace connecting buyers directly with verified local sellers and wholesale suppliers for an ultra-fast, secure shopping experience."
    },
    {
      category: "General",
      q: "How does Indiafy work?",
      a: "We operate through a network of verified 'Nodes' (local stores). When you order, our system assigns your request to the nearest node, ensuring under 30-minute delivery within your sector."
    },
    {
      category: "General",
      q: "Is Indiafy available across India?",
      a: "We are expanding rapidly node by node. While we currently focus on major metropolitan sectors, our roadmap includes pan-India tier-2 and tier-3 expansion."
    },
    {
      category: "Trust & Verification",
      q: "How are sellers verified?",
      a: "We use a 'Zero-Trust' KYC process. Every seller must provide legal business documents (GST, PAN) and undergo a physical verification of their store by our field agents."
    },
    {
      category: "Trust & Verification",
      q: "How does Indiafy prevent fraud?",
      a: "We enforce mandatory Video Packing for high-value items, process all transactions through a secure Escrow system, and maintain rigorous geo-fencing for our delivery nodes."
    },
    {
      category: "Quick Commerce",
      q: "What is Quick Commerce?",
      a: "Quick Commerce is our ultra-fast delivery infrastructure. By routing orders to verified neighborhood nodes, we fulfill orders in 10 to 25 minutes depending on the category and distance."
    },
    {
      category: "Wholesale Marketplace",
      q: "What is Wholesale Marketplace?",
      a: "It's our B2B segment that allows businesses and retailers to source products in bulk directly from verified distributors at competitive wholesale prices."
    },
    {
      category: "Wholesale Marketplace",
      q: "Can businesses source products in bulk?",
      a: "Yes! Our Wholesale Marketplace is specifically designed for B2B transactions, offering bulk discounts, GST invoicing, and reliable freight delivery."
    },
    {
      category: "Seller Program",
      q: "How can I become a seller?",
      a: "You can apply by clicking 'Sell on Indiafy' in the footer. You'll need to submit your business details, complete KYC, and sync your inventory to start receiving local orders."
    },
    {
      category: "Seller Program",
      q: "Do I need GST to sell?",
      a: "Yes, a valid GST registration is mandatory to become a verified seller on the Indiafy platform in compliance with Indian tax laws."
    },
    {
      category: "Returns & Refunds",
      q: "How do refunds work?",
      a: "If an item is defective or missing, you can request a return. We use the seller's Video Packing log for arbitration. Once approved, funds are refunded from Escrow instantly to UPI or within 3-5 days to cards."
    },
    {
      category: "Payments",
      q: "How are payments secured?",
      a: "All payments are processed through bank-grade microservices and held in our Escrow vault. Funds are only released to the seller after the order is successfully delivered and the dispute window closes."
    }
  ];

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory || 
      (activeCategory === "General" && !categories.includes(faq.category)); // Fallback mapping if needed

    return matchesSearch && matchesCategory;
  });

  // Generate JSON-LD Schema
  const faqSchema = {
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
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Frequently Asked Questions | Indiafy Marketplace"
        description="Find answers about Indiafy Quick Commerce, delivery, Indiafy Wholesale sourcing, seller onboarding, payments, refunds, and verified commerce on the Indiafy Commerce network."
        schemas={[faqSchema]}
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HERO SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
            <HelpCircle size={16} /> Knowledge Base
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-6">
            How Can We Help You?
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto mb-10">
            Answers to the most common questions from buyers, sellers, and wholesale partners.
          </p>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-brand-primary transition-colors" size={24} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..." 
              className="w-full bg-white text-slate-900 text-lg font-medium rounded-full py-5 pl-16 pr-8 shadow-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/30 transition-all border-none"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row gap-12">
        
        {/* SIDEBAR - CATEGORIES */}
        <aside className="w-full lg:w-1/4 shrink-0">
          <div className="sticky top-32">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat, i) => (
                <li key={i}>
                  <button 
                    onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      activeCategory === cat 
                        ? "bg-brand-primary text-white shadow-md" 
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ACCORDION CONTENT */}
        <section className="w-full lg:w-3/4">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              {activeCategory === "All" ? "All Questions" : activeCategory}
            </h2>
            {searchQuery && (
              <p className="text-slate-500 font-medium text-sm mt-2">
                Showing results for "{searchQuery}"
              </p>
            )}
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <p className="text-slate-500 font-medium">No results found for your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isOpen ? 'border-brand-primary shadow-md' : 'border-slate-200'
                    }`}
                  >
                    <button 
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                    >
                      <span className={`font-bold transition-colors ${isOpen ? 'text-brand-primary' : 'text-slate-900 group-hover:text-brand-primary'}`}>
                        {faq.q}
                      </span>
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
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
