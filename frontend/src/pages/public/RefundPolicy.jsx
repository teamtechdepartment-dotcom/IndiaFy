import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShoppingBag, Package, CheckCircle2, RotateCcw, Landmark, ChevronRight } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function RefundPolicy() {
  const steps = [
    { title: "Order Placed", icon: <ShoppingBag size={20} />, active: true },
    { title: "Processing", icon: <Package size={20} />, active: true },
    { title: "Delivered", icon: <CheckCircle2 size={20} />, active: true },
    { title: "Refund Requested", icon: <RotateCcw size={20} />, active: true, highlight: true },
    { title: "Refund Completed", icon: <Landmark size={20} />, active: false },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Refund & Cancellation Policy | Indiafy"
        description="Understand Indiafy's refund and cancellation policies. Step-by-step guide on how refunds are processed securely via Escrow."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HEADER SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
            <ShieldCheck size={16} /> Buyer Protection
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Refunds & Cancellations
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
            Clear rules. Transparent processes. Secure escrow payouts.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        
        {/* VISUAL TIMELINE UI */}
        <section className="mb-20">
          <h2 className="text-2xl font-black mb-8">The Refund Lifecycle</h2>
          
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[700px]">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center relative flex-1">
                  
                  {/* Connecting Line */}
                  {i < steps.length - 1 && (
                    <div className={`absolute top-6 left-[50%] w-full h-[2px] ${step.highlight ? 'bg-emerald-500 border border-emerald-500 border-dashed' : (step.active ? 'bg-slate-800' : 'bg-slate-200')}`} />
                  )}

                  {/* Icon Node */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 border-2 mb-4 transition-all ${
                    step.highlight ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_0_20px_#10b981]' : 
                    (step.active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200')
                  }`}>
                    {step.icon}
                  </div>
                  
                  <p className={`text-xs font-bold uppercase tracking-widest text-center ${
                    step.highlight ? 'text-emerald-600' : (step.active ? 'text-slate-900' : 'text-slate-400')
                  }`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POLICY CONTENT */}
        <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-primary">
          <h3 className="text-2xl mb-4">1. Order Cancellations</h3>
          <p>
            Because Indiafy operates on a hyperlocal Quick Commerce model, <strong>cancellations are only permitted before the seller marks the order as "Packed".</strong>
          </p>
          <p>
            Once the order status changes to Packed or Out for Delivery, the cancellation window closes. If you no longer need the item, you must receive the delivery and initiate a Return request (if the item is eligible).
          </p>

          <h3 className="text-2xl mt-12 mb-4">2. Return Eligibility</h3>
          <p>
            You can request a return within <strong>3 to 7 days</strong> of delivery, depending on the product category. Items must be unused, in their original packaging, and include all tags and accessories.
          </p>
          <ul>
            <li><strong>Eligible:</strong> Electronics (defective only), Fashion, Home & Decor.</li>
            <li><strong>Non-Eligible:</strong> Groceries, perishables, personal hygiene items, and custom/bulk wholesale orders.</li>
          </ul>

          <h3 className="text-2xl mt-12 mb-4">3. The Arbitration Process</h3>
          <p>
            If you request a return due to a missing or defective item, the seller will be notified. Because sellers are required to use <strong>Video Packing</strong> for high-value items, the Indiafy Arbitration Team will review the video log.
          </p>
          <p>
            If the video proves the item was packed correctly, the return request may be denied to protect the seller from fraud. If the seller failed to record the video or the video shows an error, the refund will be approved automatically in favor of the buyer.
          </p>

          <h3 className="text-2xl mt-12 mb-4">4. Refund Timelines</h3>
          <p>
            Because your funds are held in the Indiafy Escrow vault, refunds are processed much faster than traditional marketplaces:
          </p>
          <ul>
            <li><strong>UPI Payments:</strong> 2-24 hours.</li>
            <li><strong>Credit / Debit Cards:</strong> 3-5 business days depending on your bank.</li>
            <li><strong>Indiafy Wallet:</strong> Instant.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-bold mb-2">Need to initiate a return?</h4>
            <p className="text-slate-400 text-sm">Go to your Order History to start the process.</p>
          </div>
          <Link to="/order-history" className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">
            Go to Orders
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
