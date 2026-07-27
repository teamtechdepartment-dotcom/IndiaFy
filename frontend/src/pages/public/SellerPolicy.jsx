/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ChevronRight,
  Store,
  FileCheck,
  IndianRupee,
  Package,
  RotateCcw,
  Ban,
  AlertTriangle,
  Scale,
  Database,
  Clock,
  Truck,
  Star,
  Gavel,
  BookOpen,
} from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function SellerPolicy() {
  const [activeSection, setActiveSection] = useState("eligibility");

  const sections = [
    { id: "eligibility", title: "Eligibility & Onboarding" },
    { id: "commission", title: "Commission & Fees" },
    { id: "product-listing", title: "Product Listing Rules" },
    { id: "order-fulfillment", title: "Order Fulfillment SLA" },
    { id: "payment-settlement", title: "Payment & Settlement" },
    { id: "returns-disputes", title: "Returns & Disputes" },
    { id: "prohibited-activities", title: "Prohibited Activities" },
    { id: "account-actions", title: "Account Actions" },
    { id: "ip-rights", title: "Intellectual Property" },
    { id: "data-obligations", title: "Data & Privacy" },
    { id: "amendments", title: "Policy Amendments" },
  ];

  /* ── ScrollSpy ── */
  useEffect(() => {
    const handleScroll = () => {
      let current = "eligibility";
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  /* ── Key Stats ── */
  const keyStats = [
    { icon: <Clock size={20} />, label: "Settlement Cycle", value: "T+2 Days" },
    { icon: <Truck size={20} />, label: "Dispatch SLA", value: "≤ 5 Min" },
    { icon: <Star size={20} />, label: "Min Rating", value: "3.5 ★" },
    { icon: <IndianRupee size={20} />, label: "Video Pack Threshold", value: "₹1,500+" },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead
        title="Seller Policy | Indiafy – Complete Marketplace Agreement"
        description="Read the complete Indiafy Seller Policy. Covers eligibility, commission structure, fulfillment SLA, payment settlement, dispute resolution, prohibited activities, and account governance for all verified sellers."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* ═══════════════════════════════════════════════
          HERO HEADER
      ═══════════════════════════════════════════════ */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />

        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6 lg:mx-0 mx-auto">
            <Gavel size={16} /> Seller Agreement
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Seller Policy
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl">
            Last Updated: July 27, 2026 · The definitive agreement governing all seller operations on the Indiafy marketplace.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl">
            {keyStats.map((stat, i) => (
              <div key={i} className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center text-emerald-400 mb-2">{stat.icon}</div>
                <p className="text-white text-lg font-black">{stat.value}</p>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

          {/* ── STICKY TABLE OF CONTENTS ── */}
          <div className="hidden lg:block w-1/4 shrink-0">
            <div className="sticky top-32">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Policy Contents</h4>
              <ul className="space-y-3 border-l-2 border-slate-200">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`text-sm font-bold text-left w-full pl-6 py-1 transition-all relative ${
                        activeSection === section.id
                          ? "text-brand-primary"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {activeSection === section.id && (
                        <span className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-brand-primary rounded-full" />
                      )}
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-bold mb-3">Need Help?</p>
                <p className="text-xs text-slate-500 mb-4">Our seller support team is available Mon–Sat, 9 AM – 8 PM IST.</p>
                <Link to="/contact" className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:gap-2 transition-all">
                  Contact Seller Support <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-sm font-bold text-emerald-900 mb-2">Related Policies</p>
                <ul className="space-y-2">
                  <li><Link to="/seller-guidelines" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"><ChevronRight size={12} /> Seller Guidelines</Link></li>
                  <li><Link to="/terms-and-conditions" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"><ChevronRight size={12} /> Terms & Conditions</Link></li>
                  <li><Link to="/refund-policy" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"><ChevronRight size={12} /> Refund Policy</Link></li>
                  <li><Link to="/privacy-policy" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"><ChevronRight size={12} /> Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── POLICY CONTENT ── */}
          <div className="w-full lg:w-3/4 max-w-3xl prose prose-slate prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-primary">

            {/* ── 1. ELIGIBILITY & ONBOARDING ── */}
            <section id="eligibility" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <FileCheck size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">1. Eligibility & Onboarding</h2>
              </div>
              <p>
                To register as a seller on the Indiafy platform, you must meet <strong>all</strong> of the following requirements:
              </p>
              <ul>
                <li><strong>Legal Entity:</strong> You must be a legally registered business entity in India — either a sole proprietorship, partnership firm, LLP, OPC, or private limited company.</li>
                <li><strong>GST Registration:</strong> A valid GSTIN is mandatory for all sellers. We verify your GSTIN against government databases during onboarding. Sellers operating in GST-exempt categories must provide supporting documentation.</li>
                <li><strong>Bank Account:</strong> An active current account in the registered business name is required for all payment settlements. Personal savings accounts are not accepted.</li>
                <li><strong>Physical KYC:</strong> Indiafy deploys field agents to physically verify your store/warehouse location, operational capacity, and stock before activation. Remote or virtual-only businesses are not eligible for Quick Commerce nodes.</li>
                <li><strong>PAN Verification:</strong> Business PAN card is required for TDS deduction and tax compliance under Section 194-O of the Income Tax Act.</li>
                <li><strong>FSSAI License:</strong> Sellers listing food items must hold a valid FSSAI license (Registration or State/Central license based on turnover).</li>
                <li><strong>Drug License:</strong> Sellers listing pharmaceutical products or OTC medicines must possess a valid Drug License issued under the Drugs and Cosmetics Act, 1940.</li>
                <li><strong>Minimum Age:</strong> The authorised signatory must be at least 18 years of age.</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 not-prose">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1">Onboarding Timeline</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Onboarding typically takes 3–7 business days after document submission. Physical KYC scheduling depends on location availability. Indiafy reserves the right to reject any application without providing a reason.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 2. COMMISSION & FEES ── */}
            <section id="commission" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <IndianRupee size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">2. Commission & Fee Structure</h2>
              </div>
              <p>
                Indiafy operates on a transparent commission model. The following fees apply to every completed transaction:
              </p>

              {/* Commission Table */}
              <div className="overflow-x-auto not-prose mb-6">
                <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Fee Type</th>
                      <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Rate</th>
                      <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-white">
                      <td className="px-5 py-3 font-semibold text-slate-900">Platform Commission</td>
                      <td className="px-5 py-3 text-emerald-600 font-bold">5% – 18%</td>
                      <td className="px-5 py-3 text-slate-500">Varies by product category. Agreed at onboarding.</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-900">Payment Gateway Fee</td>
                      <td className="px-5 py-3 text-emerald-600 font-bold">~2%</td>
                      <td className="px-5 py-3 text-slate-500">Charged by payment processors (Razorpay/PayU). Passed through at cost.</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-5 py-3 font-semibold text-slate-900">TDS (Section 194-O)</td>
                      <td className="px-5 py-3 text-emerald-600 font-bold">1%</td>
                      <td className="px-5 py-3 text-slate-500">Deducted at source on gross transaction value as per Income Tax Act.</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-900">TCS (GST)</td>
                      <td className="px-5 py-3 text-emerald-600 font-bold">1%</td>
                      <td className="px-5 py-3 text-slate-500">Tax Collected at Source under Section 52 of CGST Act.</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-5 py-3 font-semibold text-slate-900">Logistics (if applicable)</td>
                      <td className="px-5 py-3 text-emerald-600 font-bold">Variable</td>
                      <td className="px-5 py-3 text-slate-500">Only for orders using Indiafy's delivery fleet. Self-delivery sellers are exempt.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Indiafy reserves the right to revise the commission structure with <strong>30 days' prior written notice</strong> via email and seller dashboard notification. Continued use of the platform after the effective date constitutes acceptance of the revised rates.
              </p>
              <p>
                GST on commission will be charged at the applicable rate (currently 18%) and sellers will receive a compliant tax invoice for input tax credit (ITC).
              </p>
            </section>

            {/* ── 3. PRODUCT LISTING RULES ── */}
            <section id="product-listing" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">3. Product Listing Rules</h2>
              </div>
              <p>All products listed on Indiafy must comply with the following standards:</p>

              <h3>3.1 Listing Accuracy</h3>
              <ul>
                <li><strong>Truthful Descriptions:</strong> All product titles, descriptions, specifications, and images must accurately represent the item being sold. Misleading or exaggerated claims are strictly prohibited.</li>
                <li><strong>MRP Compliance:</strong> The Maximum Retail Price (MRP) displayed must comply with the Legal Metrology Act, 2009. Selling above MRP is illegal and will result in immediate listing removal.</li>
                <li><strong>Real Images:</strong> Stock photos are permitted only if they accurately depict the exact product. Sellers are encouraged to upload original photographs.</li>
                <li><strong>Weight & Dimensions:</strong> Accurate weight and dimensions are mandatory — especially for logistics cost calculations.</li>
              </ul>

              <h3>3.2 Inventory Integrity</h3>
              <ul>
                <li><strong>No Ghost Inventory:</strong> You must only list items that are physically present in your registered store/warehouse. Listing unavailable items leads to cancellations, which damage the buyer experience and your seller rating.</li>
                <li><strong>Real-Time Sync:</strong> If you sell across multiple platforms, you are responsible for maintaining real-time inventory sync. Indiafy is not liable for overselling.</li>
                <li><strong>Expiry Management:</strong> Perishable and FMCG products must have at least 50% shelf life remaining at the time of listing. Items within 30 days of expiry must be clearly marked.</li>
              </ul>

              <h3>3.3 Pricing Rules</h3>
              <ul>
                <li><strong>Dynamic Pricing Prohibited:</strong> Algorithmic price inflation based on demand spikes, customer profiles, or time of day is strictly prohibited on Indiafy.</li>
                <li><strong>Predatory Pricing:</strong> Pricing products significantly below cost to undercut competitors in a manner that distorts the marketplace is a violation and will be investigated.</li>
                <li><strong>GST-Inclusive Pricing:</strong> All listed prices must be inclusive of GST. Sellers are responsible for proper tax computation and filing.</li>
              </ul>

              <h3>3.4 Category-Specific Compliance</h3>
              <ul>
                <li><strong>Electronics:</strong> Must carry BIS certification, valid warranty documentation, and original manufacturer packaging.</li>
                <li><strong>Food & Beverages:</strong> Must carry valid FSSAI license number on listing. Nutritional information and allergen declarations are mandatory.</li>
                <li><strong>Cosmetics:</strong> Must comply with the Drugs and Cosmetics Act. Batch number, manufacturing date, and ingredients list are mandatory.</li>
                <li><strong>Clothing & Textiles:</strong> Must comply with the Textile (Development and Regulation) Order. Size charts and fabric composition details are required.</li>
              </ul>
            </section>

            {/* ── 4. ORDER FULFILLMENT SLA ── */}
            <section id="order-fulfillment" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Truck size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">4. Order Fulfillment SLA</h2>
              </div>
              <p>
                Indiafy promises its customers delivery within <strong>25 minutes</strong> for Quick Commerce orders. To honour this commitment, sellers must adhere to strict SLAs:
              </p>

              {/* SLA Tiers */}
              <div className="not-prose grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">Quick Commerce</div>
                  <p className="text-3xl font-black text-slate-900 mb-1">≤ 5 min</p>
                  <p className="text-sm text-slate-500 font-medium">Pack & handover to delivery partner</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Standard Delivery</div>
                  <p className="text-3xl font-black text-slate-900 mb-1">≤ 2 hours</p>
                  <p className="text-sm text-slate-500 font-medium">Pack & handover for same-day delivery</p>
                </div>
              </div>

              <h3>4.1 Acceptance Window</h3>
              <p>
                Sellers must accept or reject incoming orders within <strong>90 seconds</strong>. If an order is not accepted within this window, it will be auto-rejected and the seller's acceptance rate will be negatively impacted.
              </p>

              <h3>4.2 Video Packing Protocol</h3>
              <p>
                For all orders exceeding <strong>₹1,500 in value</strong>, sellers are <strong>mandated</strong> to record the complete packing process using the Indiafy Seller App. This video is encrypted, stored securely, and linked to the Order ID.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 not-prose">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-900 mb-1">Critical Rule</p>
                    <p className="text-xs text-red-700 leading-relaxed">
                      Failure to provide video packing evidence during a buyer dispute will result in an <strong>automatic refund in favour of the buyer</strong>, regardless of the seller's claim. No exceptions.
                    </p>
                  </div>
                </div>
              </div>

              <h3>4.3 Packaging Standards</h3>
              <ul>
                <li>All items must be packed securely to prevent damage during transit.</li>
                <li>Fragile items must be wrapped with bubble wrap or equivalent protective material.</li>
                <li>Sellers must use Indiafy-approved tamper-proof packaging where provided.</li>
                <li>Perishable items must use food-grade packaging with cold chain compliance where necessary.</li>
              </ul>

              <h3>4.4 Cancellation by Seller</h3>
              <p>
                Sellers may cancel an accepted order only under exceptional circumstances (stock unavailability discovered after acceptance, force majeure). Repeated seller-initiated cancellations (&gt;5% of total orders in any 30-day window) will trigger:
              </p>
              <ul>
                <li>First threshold breach: Written warning with 7-day improvement period.</li>
                <li>Second breach: Temporary listing deactivation (72 hours).</li>
                <li>Third breach: Account suspension and commission review.</li>
              </ul>
            </section>

            {/* ── 5. PAYMENT & SETTLEMENT ── */}
            <section id="payment-settlement" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <IndianRupee size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">5. Payment & Settlement</h2>
              </div>

              <h3>5.1 Escrow Mechanism</h3>
              <p>
                All buyer payments are held in Indiafy's escrow system. Funds are released to sellers only after the order is successfully delivered and the return/dispute window has expired (typically 3–7 days depending on category).
              </p>

              <h3>5.2 Settlement Cycle</h3>
              <ul>
                <li><strong>Standard Settlement:</strong> T+2 business days after the return window closes.</li>
                <li><strong>Express Settlement (eligible sellers):</strong> T+1 business day — available for sellers maintaining &gt;4.5 rating and &lt;2% dispute rate for 90 consecutive days.</li>
                <li><strong>Holiday Settlement:</strong> Settlements on bank holidays and Sundays will be processed on the next business day.</li>
              </ul>

              <h3>5.3 Deductions</h3>
              <p>The following are deducted from the gross settlement amount before payout:</p>
              <ul>
                <li>Platform commission (as per agreed category rates)</li>
                <li>Payment gateway charges (~2%)</li>
                <li>TDS under Section 194-O (1%)</li>
                <li>TCS under Section 52 of CGST Act (1%)</li>
                <li>Any outstanding penalties, chargeback liabilities, or adjustment amounts</li>
                <li>Logistics fee (if Indiafy delivery fleet is used)</li>
              </ul>

              <h3>5.4 Hold & Freeze</h3>
              <p>
                Indiafy reserves the right to temporarily freeze or hold payouts if:
              </p>
              <ul>
                <li>A fraud investigation is ongoing against the seller.</li>
                <li>The seller's dispute rate exceeds 10% in any 30-day period.</li>
                <li>The seller's KYC documents have expired or are found to be invalid.</li>
                <li>A legal or regulatory authority has issued a hold order.</li>
              </ul>
              <p>
                Held funds will be released within <strong>180 days</strong> after resolution, unless a legal proceeding mandates further retention.
              </p>
            </section>

            {/* ── 6. RETURNS & DISPUTES ── */}
            <section id="returns-disputes" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <RotateCcw size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">6. Returns & Dispute Resolution</h2>
              </div>

              <h3>6.1 Return Window</h3>
              <p>Return eligibility varies by category:</p>
              <ul>
                <li><strong>Electronics (defective):</strong> 7 days from delivery.</li>
                <li><strong>Fashion & Apparel:</strong> 7 days (unworn, tags intact).</li>
                <li><strong>Home & Decor:</strong> 5 days (original packaging required).</li>
                <li><strong>Groceries & Perishables:</strong> Not eligible for return. Refund only on receiving damaged/expired items with photographic evidence within 24 hours.</li>
                <li><strong>Wholesale / Bulk Orders:</strong> Non-returnable unless defective. Subject to inspection.</li>
              </ul>

              <h3>6.2 Dispute Arbitration</h3>
              <p>
                When a buyer raises a dispute, the <strong>Indiafy Arbitration Team</strong> will review all available evidence including:
              </p>
              <ul>
                <li>Mandatory video packing footage (for orders above ₹1,500).</li>
                <li>Delivery partner's proof of delivery (photo/OTP confirmation).</li>
                <li>Buyer's photographic evidence of damage or mismatch.</li>
                <li>Chat/communication logs between buyer and seller.</li>
              </ul>
              <p>
                The decision of the Indiafy Arbitration Team is <strong>final and binding</strong> on both parties. Sellers agree to waive the right to external legal challenge on decisions below ₹25,000 in value.
              </p>

              <h3>6.3 Seller Liability</h3>
              <ul>
                <li>If a return is approved due to the seller's fault (wrong item, defective product, missing items), the refund amount <strong>plus</strong> return shipping cost will be deducted from the seller's settlement.</li>
                <li>If the seller fails to provide video packing evidence when required, the dispute is auto-resolved in the buyer's favour.</li>
                <li>Sellers with a dispute rate exceeding <strong>8%</strong> in any rolling 30-day period will be placed on a Performance Improvement Plan (PIP).</li>
              </ul>
            </section>

            {/* ── 7. PROHIBITED ACTIVITIES ── */}
            <section id="prohibited-activities" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                  <Ban size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">7. Prohibited Activities</h2>
              </div>
              <p className="font-bold text-red-700">
                Engaging in any of the following will result in immediate account termination and potential legal action:
              </p>

              <h3>7.1 Prohibited Products</h3>
              <ul>
                <li>Counterfeit, replica, or "first-copy" goods.</li>
                <li>Weapons, ammunition, explosives, or tactical gear.</li>
                <li>Unlicensed pharmaceuticals, controlled substances, or drugs.</li>
                <li>Hazardous materials, chemicals, or radioactive substances.</li>
                <li>Stolen goods, unauthorized digital keys, or pirated content.</li>
                <li>Tobacco products, e-cigarettes, or related accessories.</li>
                <li>Wildlife products or items derived from endangered species.</li>
                <li>Sexually explicit or obscene material.</li>
                <li>Any product banned under Indian law or state-specific regulations.</li>
              </ul>

              <h3>7.2 Prohibited Conduct</h3>
              <ul>
                <li><strong>Fake Reviews & Ratings:</strong> Soliciting, purchasing, or fabricating reviews (positive or negative) is strictly prohibited. This includes incentivising buyers for 5-star reviews.</li>
                <li><strong>Off-Platform Transactions:</strong> Attempting to divert Indiafy customers to external websites, WhatsApp, or direct transactions to avoid platform fees.</li>
                <li><strong>Inventory Manipulation:</strong> Deliberately marking items as "out of stock" during promotional events to avoid honouring discounted pricing.</li>
                <li><strong>Tax Evasion:</strong> Under-reporting transaction values, using fake GST numbers, or engaging in any activity to evade taxes.</li>
                <li><strong>Multiple Accounts:</strong> Operating multiple seller accounts without prior written approval from Indiafy.</li>
                <li><strong>Harassment:</strong> Threatening, abusing, or harassing buyers, delivery partners, or Indiafy staff.</li>
              </ul>
            </section>

            {/* ── 8. ACCOUNT ACTIONS ── */}
            <section id="account-actions" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">8. Account Actions & Penalties</h2>
              </div>
              <p>
                Indiafy employs a <strong>tiered penalty system</strong> designed to give sellers opportunities to improve before severe action is taken:
              </p>

              {/* Penalty Tiers */}
              <div className="not-prose space-y-4 mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-black">1</div>
                    <p className="text-sm font-bold text-amber-900">Warning</p>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">Written warning via email & dashboard notification. Seller must acknowledge within 48 hours and submit a corrective action plan.</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-200 text-orange-800 rounded-full flex items-center justify-center text-xs font-black">2</div>
                    <p className="text-sm font-bold text-orange-900">Temporary Suspension (3–30 days)</p>
                  </div>
                  <p className="text-xs text-orange-700 leading-relaxed">All listings deactivated. Pending orders must still be fulfilled. Payouts may be delayed. A mandatory retraining session is required before reactivation.</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-xs font-black">3</div>
                    <p className="text-sm font-bold text-red-900">Permanent Termination</p>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">Account permanently banned. All pending payouts held for 180 days to cover potential chargebacks. The seller is blacklisted and cannot re-register under any entity.</p>
                </div>
              </div>

              <h3>8.1 Performance Metrics</h3>
              <p>Sellers are continuously evaluated on the following KPIs:</p>
              <ul>
                <li><strong>Order Acceptance Rate:</strong> Must remain above 90%.</li>
                <li><strong>Seller-Initiated Cancellation Rate:</strong> Must remain below 5%.</li>
                <li><strong>Customer Rating:</strong> Must maintain a minimum of 3.5 out of 5.0 stars.</li>
                <li><strong>Dispatch SLA Compliance:</strong> Must meet SLA on at least 95% of orders.</li>
                <li><strong>Return/Dispute Rate:</strong> Must remain below 8%.</li>
              </ul>
              <p>
                Sellers falling below any two metrics simultaneously for 30 consecutive days will be placed on a Performance Improvement Plan (PIP). Failure to improve within the PIP period (typically 15 days) may result in suspension.
              </p>

              <h3>8.2 Appeal Process</h3>
              <p>
                Sellers have the right to appeal any penalty or suspension within <strong>15 days</strong> of notification by writing to <a href="mailto:seller-appeals@indiafy.com">seller-appeals@indiafy.com</a>. The appeals committee will review and respond within 10 business days. Appeals are limited to one per incident.
              </p>
            </section>

            {/* ── 9. INTELLECTUAL PROPERTY ── */}
            <section id="ip-rights" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Scale size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">9. Intellectual Property Rights</h2>
              </div>
              <ul>
                <li><strong>Ownership:</strong> Sellers retain ownership of their product content (images, descriptions) but grant Indiafy a non-exclusive, royalty-free license to use, display, and promote such content on and off the platform for marketing purposes.</li>
                <li><strong>Trademark Compliance:</strong> Sellers must not use another brand's trademark, logo, or copyrighted material without proper authorisation. Indiafy will process takedown requests under applicable Indian IP law.</li>
                <li><strong>Brand Authorisation:</strong> Sellers listing branded products must possess valid brand authorisation letters or distributor agreements. Indiafy may request proof at any time.</li>
                <li><strong>Counter-Notification:</strong> If a seller believes a takedown was issued in error, they may file a counter-notification within 10 business days with supporting evidence.</li>
              </ul>
            </section>

            {/* ── 10. DATA & PRIVACY ── */}
            <section id="data-obligations" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Database size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">10. Data & Privacy Obligations</h2>
              </div>
              <ul>
                <li><strong>Customer Data:</strong> Seller will receive limited buyer information (name, address, phone) solely for order fulfillment purposes. Using this data for unsolicited marketing, data mining, or sharing with third parties is <strong>strictly prohibited</strong> and a terminable offence.</li>
                <li><strong>Data Retention:</strong> Sellers must delete buyer personal data within 30 days of order completion unless retention is required for legal compliance or an active dispute.</li>
                <li><strong>Breach Notification:</strong> In the event of a data breach affecting buyer information, sellers must notify Indiafy within <strong>24 hours</strong> of discovery.</li>
                <li><strong>Compliance:</strong> Sellers must comply with the Information Technology Act, 2000, the IT (Reasonable Security Practices) Rules, 2011, and any applicable provisions of the Digital Personal Data Protection Act, 2023.</li>
                <li><strong>Video Logs:</strong> Video packing footage is encrypted and stored by Indiafy for up to 180 days. Sellers cannot access, download, or distribute these videos outside the dispute resolution workflow.</li>
              </ul>
              <p>
                For complete details on how Indiafy handles data, please refer to our <Link to="/privacy-policy">Privacy Policy</Link>.
              </p>
            </section>

            {/* ── 11. POLICY AMENDMENTS ── */}
            <section id="amendments" className="mb-16 scroll-mt-32">
              <div className="flex items-center gap-3 mb-6 not-prose">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <h2 className="text-3xl text-slate-900 font-black tracking-tight m-0">11. Policy Amendments</h2>
              </div>
              <ul>
                <li>Indiafy reserves the right to amend this Seller Policy at any time.</li>
                <li><strong>Material Changes:</strong> For changes affecting commission rates, settlement terms, or SLA requirements, Indiafy will provide <strong>30 days' advance notice</strong> via email and seller dashboard.</li>
                <li><strong>Minor Changes:</strong> Clarifications, formatting updates, or non-material amendments may be made without prior notice. The "Last Updated" date at the top of this document will always reflect the most recent revision.</li>
                <li><strong>Explicit Re-Consent (No Auto-Tick):</strong> In strict compliance with Indian regulatory standards (DPDP Act 2023 & CCPA Guidelines for Prevention of Dark Patterns 2023), Indiafy never relies on pre-ticked checkboxes or implied default consent. For material amendments affecting financial terms or data privacy, sellers must provide explicit, affirmative opt-in consent via an un-ticked dashboard notification prompt prior to continuing platform operations.</li>
                <li><strong>Disagreement:</strong> If you disagree with any material policy change, you may terminate your seller account by providing 30 days' written notice. All pending orders must be fulfilled, and the settlement cycle will complete before account closure.</li>
              </ul>
            </section>

            {/* ── GOVERNING LAW ── */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-10 not-prose">
              <h3 className="text-xl font-black mb-4">Governing Law & Jurisdiction</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                This Seller Policy shall be governed by and construed in accordance with the laws of India. Any disputes arising out of this policy shall be subject to the <strong className="text-white">exclusive jurisdiction of the courts in Gurugram, Haryana</strong>.
              </p>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Before initiating legal proceedings, both parties agree to attempt mediation through the Indiafy Arbitration Team. This does not preclude either party from seeking urgent injunctive relief where necessary.
              </p>
            </div>

            {/* ── CTA ── */}
            <div className="mt-12 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 text-center not-prose shadow-sm">
              <h3 className="text-2xl font-black tracking-tight mb-3">Ready to sell on Indiafy?</h3>
              <p className="text-slate-500 font-medium text-sm mb-8 max-w-lg mx-auto">
                By registering as a seller, you explicitly opt-in and consent via an un-ticked verification box to abide by this Seller Policy, our Terms & Conditions, and DPDP Act Privacy Policy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/become-seller-info"
                  className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors"
                >
                  Start Registration <ChevronRight size={16} />
                </Link>
                <Link
                  to="/seller-guidelines"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  View Guidelines <ChevronRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
