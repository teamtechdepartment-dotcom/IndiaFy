import React, { useState } from "react";
import { Search, Package, RefreshCw, CreditCard, Store, Phone, ChevronDown, ChevronUp } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const categories = [
    { title: "Orders & Tracking", icon: <Package size={24} className="text-emerald-500" /> },
    { title: "Returns & Refunds", icon: <RefreshCw size={24} className="text-blue-500" /> },
    { title: "Payments & Pricing", icon: <CreditCard size={24} className="text-purple-500" /> },
    { title: "Seller Assistance", icon: <Store size={24} className="text-orange-500" /> },
    { title: "Wholesale B2B", icon: <Phone size={24} className="text-rose-500" /> },
  ];

  const faqs = [
    {
      q: "How fast is Quick Commerce delivery?",
      a: "If an item is available in your designated hyperlocal node, it will be delivered within 10 to 25 minutes depending on traffic and order volume."
    },
    {
      q: "What is Video Packing and how do I view it?",
      a: "To prevent fraud, sellers record the packing of high-value items. You can view this secure video log in your 'Order History' within 7 days of delivery."
    },
    {
      q: "Can I cancel my order?",
      a: "Orders can only be cancelled before they are marked as 'Packed' by the seller. Once packed and handed to the delivery partner, you must request a return instead."
    },
    {
      q: "How do refunds work?",
      a: "Once a return is approved by the seller, the refund is processed back to your original payment method. UPI refunds take 24 hours, while Credit/Debit cards may take 3-5 business days."
    },
    {
      q: "How do I become a verified seller?",
      a: "Click on 'Sell on Indiafy' in the footer. You will need your GST certificate, a valid Bank Account, and you must pass our physical KYC verification process."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Help Center | Indiafy"
        description="Find answers to your questions. Search for help regarding orders, returns, payments, and seller assistance."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HERO SECTION WITH SEARCH */}
      <header className="bg-slate-900 pt-32 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
            Hello, how can we help?
          </h1>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-brand-primary transition-colors" size={24} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for articles, tracking, returns..." 
              className="w-full bg-white text-slate-900 text-lg font-medium rounded-full py-5 pl-16 pr-8 shadow-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/30 transition-all border-none"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-24">
        
        {/* CATEGORY CARDS */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-24">
          {categories.map((cat, i) => (
            <button key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center group">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-100 transition-colors">
                {cat.icon}
              </div>
              <h3 className="font-bold text-sm tracking-tight text-slate-900">{cat.title}</h3>
            </button>
          ))}
        </section>

        {/* FAQ ACCORDION */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium text-sm">Find quick answers to the most common queries.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-brand-primary shadow-md' : 'border-slate-200'}`}>
                  <button 
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-bold text-slate-900">{faq.q}</span>
                    <span className="text-slate-400 shrink-0 ml-4">
                      {isOpen ? <ChevronUp size={20} className="text-brand-primary" /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="h-px w-full bg-slate-100 mb-4" />
                      <p className="text-slate-600 font-medium leading-relaxed text-sm">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
