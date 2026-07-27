import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShoppingBag, Package, CheckCircle2, RotateCcw, Landmark, ChevronRight, Scale, AlertTriangle, FileText, Gavel } from "lucide-react";

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
        title="Refund & Cancellation Policy | Indiafy – Consumer Protection Compliant"
        description="Read Indiafy's refund and cancellation policy compliant with Consumer Protection (E-Commerce) Rules, 2020 and Consumer Protection Act, 2019. Transparent escrow refund process and statutory return rights."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HEADER SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6">
            <ShieldCheck size={16} /> Statutory Buyer Protection
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Refunds & Cancellations
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
            Governed by the Consumer Protection Act, 2019 and Consumer Protection (E-Commerce) Rules, 2020. Clear rules, transparent arbitration, and secure escrow payouts.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        
        {/* VISUAL TIMELINE UI */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black m-0">The Refund Lifecycle</h2>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
              <Scale size={14} /> 100% Escrow Protected
            </span>
          </div>
          
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
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 not-prose mb-10">
            <div className="flex items-start gap-3">
              <Scale size={22} className="text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 m-0 mb-1">Statutory Guarantee Under Indian Law</h4>
                <p className="text-xs text-emerald-800 leading-relaxed m-0">
                  In accordance with <strong>Rule 4(4) and Rule 5(3) of the Consumer Protection (E-Commerce) Rules, 2020</strong>, Indiafy ensures that consumers are protected against defective, deficient, spurious, or mischaracterized goods. No seller on Indiafy can refuse a legitimate return or refund that falls within statutory guidelines.
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl mb-4">1. Order Cancellation Policy</h3>
          <p>
            Under <strong>Rule 4(4)(f) of the Consumer Protection (E-Commerce) Rules, 2020</strong>, e-commerce entities are prohibited from imposing cancellation charges on consumers canceling an order after confirmation, unless similar charges are also borne by the e-commerce entity or seller when they cancel an order unilaterally.
          </p>
          <ul>
            <li><strong>Quick Commerce Orders:</strong> Because Indiafy operates on a 25-minute hyperlocal delivery model, order preparation begins immediately upon seller acceptance. Therefore, instant cancellation without charge is permitted <strong>before the seller marks the order as "Packed" (typically within 3-5 minutes of order placement)</strong>.</li>
            <li><strong>Post-Packing Cancellations:</strong> If cancellation is requested after the item is packed or dispatched, a nominal logistics handling fee may be deducted to compensate the delivery partner, strictly in compliance with Rule 4(4)(f).</li>
            <li><strong>Seller-Initiated Cancellations:</strong> If a seller cancels a confirmed order due to stock unavailability or operational failure, the buyer receives an <strong>instant full refund</strong> along with applicable promotional compensation or loyalty credits.</li>
          </ul>

          <h3 className="text-2xl mt-12 mb-4">2. Return Eligibility & Category Guidelines</h3>
          <p>
            As mandated by Section 2(46) of the <strong>Consumer Protection Act, 2019</strong>, buyers have a right to return goods that do not conform to displayed specifications, are defective, or arrive damaged. To maintain health, hygiene, and legal compliance, return windows vary by product category:
          </p>

          <div className="overflow-x-auto not-prose my-6">
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Product Category</th>
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Return Window</th>
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Eligible Conditions & Legal Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-white">
                  <td className="px-5 py-3 font-semibold text-slate-900">Electronics & Appliances</td>
                  <td className="px-5 py-3 text-emerald-600 font-bold">7 Days</td>
                  <td className="px-5 py-3 text-slate-600">Defective, damaged, or dead-on-arrival (DOA). Requires original packaging, serial numbers, and accessories intact.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-900">Fashion & Apparel</td>
                  <td className="px-5 py-3 text-emerald-600 font-bold">7 Days</td>
                  <td className="px-5 py-3 text-slate-600">Size mismatch, defective fabric, or wrong item received. Unworn with brand tags intact.</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-5 py-3 font-semibold text-slate-900">Home & Kitchen Decor</td>
                  <td className="px-5 py-3 text-emerald-600 font-bold">5 Days</td>
                  <td className="px-5 py-3 text-slate-600">Physical damage during transit or functional defect.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-900">Groceries & Perishables</td>
                  <td className="px-5 py-3 text-amber-600 font-bold">24 Hours / Delivery Time</td>
                  <td className="px-5 py-3 text-slate-600">Damaged, expired, or spoiled upon arrival. Under FSSAI hygiene guidelines, general change-of-mind returns are not accepted.</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-5 py-3 font-semibold text-slate-900">Personal Care & Hygiene</td>
                  <td className="px-5 py-3 text-red-600 font-bold">Non-Returnable</td>
                  <td className="px-5 py-3 text-slate-600">Exempt from return under health and sanitary standards unless delivered with broken seal or expired.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-2xl mt-12 mb-4">3. Defective Goods & Product Liability</h3>
          <p>
            Under <strong>Chapter VI (Sections 84 to 87) of the Consumer Protection Act, 2019</strong>, sellers and product manufacturers bear statutory product liability for defective products:
          </p>
          <ul>
            <li><strong>Right to Replacement/Refund:</strong> If a product suffers from a manufacturing defect, deficiency in service, or fails to meet the quality standards mandated by the <strong>Bureau of Indian Standards (BIS)</strong> or <strong>Legal Metrology Act, 2009</strong>, the buyer is entitled to a complete replacement or full refund.</li>
            <li><strong>No Waiver by Contract:</strong> Sellers cannot waive or limit their statutory liability for defective goods by printing "No Return / No Refund" disclaimers on invoices. Such disclaimers are void and legally unenforceable under Indian consumer law.</li>
          </ul>

          <h3 className="text-2xl mt-12 mb-4">4. Dispute Arbitration & Mandatory Video Evidence</h3>
          <p>
            To prevent fraud and protect both buyers and sellers from unfair practices, Indiafy enforces a strict evidence-based arbitration protocol:
          </p>
          <ul>
            <li><strong>Mandatory Video Packing (Sellers):</strong> For all items valued above ₹1,500, sellers are legally mandated by platform rules to record an unbroken, timestamped video of the product being packed and sealed.</li>
            <li><strong>Unboxing Video Guidance (Buyers):</strong> For high-value electronics and fragile items, buyers are strongly advised to record an unboxing video upon delivery. This serves as irrefutable evidence in case of missing items, physical transit damage, or wrong product delivery.</li>
            <li><strong>Arbitration Process:</strong> In the event of a dispute (e.g., buyer claims "empty box received" while seller claims "item packed correctly"), the Indiafy Arbitration Team reviews encrypted video logs from both parties along with delivery partner OTP timestamps.</li>
            <li><strong>Auto-Resolution Rules:</strong> If a seller fails to provide mandatory video packing proof for a contested high-value item, the dispute is automatically resolved in favor of the buyer, and a 100% refund is processed.</li>
          </ul>

          <h3 className="text-2xl mt-12 mb-4">5. Refund Settlement & Timelines</h3>
          <p>
            Because all customer payments are safeguarded in the <strong>Indiafy Escrow Vault</strong> in compliance with <strong>RBI's Payment Aggregator Guidelines</strong>, refund processing is swift, secure, and immune to seller settlement defaults:
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 not-prose my-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">UPI & Wallet</p>
              <p className="text-xl font-black text-emerald-600">2 to 24 Hours</p>
              <p className="text-[11px] text-slate-500 mt-2">Instant credit to original UPI ID or Indiafy Wallet.</p>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Credit / Debit Card</p>
              <p className="text-xl font-black text-blue-600">3 to 5 Days</p>
              <p className="text-[11px] text-slate-500 mt-2">Processed via card networks (Visa/Mastercard/RuPay).</p>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Net Banking</p>
              <p className="text-xl font-black text-purple-600">4 to 7 Days</p>
              <p className="text-[11px] text-slate-500 mt-2">Subject to beneficiary bank clearing cycles.</p>
            </div>
          </div>

          <ul>
            <li><strong>Source Account Credit:</strong> In accordance with RBI guidelines, refunds are strictly routed back to the original source of payment used during checkout.</li>
            <li><strong>Chargeback Protection:</strong> In case of unauthorized transactions or banking failures, consumers retain their full statutory right to initiate chargebacks through their issuing bank under RBI's Customer Protection frameworks.</li>
          </ul>

          <h3 className="text-2xl mt-12 mb-4">6. Grievance Redressal & Escalation</h3>
          <p>
            If your refund request is delayed or denied unfairly, you have direct access to our statutory grievance mechanism under <strong>Rule 4(4) of the E-Commerce Rules, 2020</strong>:
          </p>
          <ul>
            <li><strong>Level 1 (Customer Support):</strong> Raise a ticket via the 'Support' section in your dashboard or email <a href="mailto:support@indiafy.com">support@indiafy.com</a>.</li>
            <li><strong>Level 2 (Grievance Officer):</strong> If unresolved within 48 hours, escalate directly to our statutory Grievance Officer at <a href="mailto:grievance@indiafy.com">grievance@indiafy.com</a>.</li>
            <li><strong>Level 3 (National Consumer Forum):</strong> Consumers retain the unconditional statutory right to register a complaint with the <strong>National Consumer Helpline (NCH)</strong> at 1800-11-4000 or approach the appropriate District, State, or National Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
              <FileText size={16} /> Need to initiate a return?
            </div>
            <h4 className="text-2xl font-black mb-2 m-0">Go to your Order History</h4>
            <p className="text-slate-400 text-sm m-0">Select the eligible order and follow the guided 3-step return wizard.</p>
          </div>
          <Link to="/order-history" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-500/25 shrink-0">
            View Orders Now
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
