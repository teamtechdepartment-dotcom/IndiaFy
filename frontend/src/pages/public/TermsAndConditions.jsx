/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("platform-usage");

  const sections = [
    { id: "platform-usage", title: "Platform Usage" },
    { id: "seller-responsibilities", title: "Seller Responsibilities" },
    { id: "buyer-responsibilities", title: "Buyer Responsibilities" },
    { id: "payments", title: "Payments & Fees" },
    { id: "returns", title: "Returns & Disputes" },
    { id: "fraud-prevention", title: "Fraud Prevention" },
    { id: "account-suspension", title: "Account Suspension" },
  ];

  // ScrollSpy logic for Sticky TOC
  useEffect(() => {
    const handleScroll = () => {
      let current = "platform-usage";
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

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <SEOHead 
        title="Terms & Conditions | Indiafy"
        description="Read the terms and conditions for using Indiafy. Covers platform usage, buyer/seller responsibilities, payments, and fraud prevention."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HEADER SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6 lg:mx-0 mx-auto">
            <ShieldCheck size={16} /> Legal Agreement
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Terms & Conditions
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl">
            Last Updated: March 25, 2026 · The rules that govern our trust network.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* LEFT: STICKY TOC */}
          <div className="hidden lg:block w-1/4 shrink-0">
            <div className="sticky top-32">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Contents</h4>
              <ul className="space-y-4 border-l-2 border-slate-200">
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
              
              <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-bold mb-3">Questions?</p>
                <p className="text-xs text-slate-500 mb-4">Read our Community Standards for a simplified view of our rules.</p>
                <Link to="/community-standards" className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:gap-2 transition-all">
                  Community Standards <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className="w-full lg:w-3/4 max-w-3xl prose prose-slate prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-primary">
            
            <section id="platform-usage" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Platform Usage</h2>
              <p>
                Indiafy provides a localized, node-based marketplace connecting verified sellers with buyers. By registering for an account—either as a buyer or a seller—you agree to be bound by these Terms.
              </p>
              <p>
                You must be at least 18 years old to form a binding contract. The platform is intended for use within India, and all transactions are governed by Indian law.
              </p>
            </section>

            <section id="seller-responsibilities" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Seller Responsibilities</h2>
              <p>
                Sellers are the backbone of our trust network. To maintain your active status on the Indiafy platform, you must:
              </p>
              <ul>
                <li><strong>Maintain Inventory Accuracy:</strong> You must only list items you currently have in stock in your local node.</li>
                <li><strong>Video Packing Compliance:</strong> For items above the specified high-value threshold, you must record a continuous video of the packing process using the Indiafy Seller App.</li>
                <li><strong>Authenticity:</strong> Selling counterfeit, illegal, or prohibited goods will result in immediate suspension and potential legal action.</li>
                <li><strong>Fulfillment Speed:</strong> You must dispatch Quick Commerce orders within the strict SLA defined in your onboarding contract.</li>
              </ul>
              <p>For more details, see our <Link to="/seller-guidelines">Seller Guidelines</Link>.</p>
            </section>

            <section id="buyer-responsibilities" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Buyer Responsibilities</h2>
              <p>
                As a buyer, you agree to provide accurate delivery information and ensure someone is available to receive the package during the designated hyperlocal delivery window.
              </p>
              <p>
                Abusive behavior toward delivery partners, false claims of "Item Not Received", or fraudulent return requests (e.g., returning a different item) are strict violations of these terms.
              </p>
            </section>

            <section id="payments" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Payments & Fees</h2>
              <p>
                Indiafy uses an escrow-style payment system. When you place an order, the funds are held securely by our payment processors. Funds are only released to the seller after the return window has expired or the order is marked successfully delivered without dispute.
              </p>
              <p>
                Sellers are subject to a platform fee structure that is agreed upon during onboarding. Indiafy reserves the right to adjust commission rates with a 30-day notice.
              </p>
            </section>

            <section id="returns" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Returns & Disputes</h2>
              <p>
                If an item is defective, damaged, or not as described, buyers have the right to request a return within the specified return window (usually 3 to 7 days, depending on the category).
              </p>
              <p>
                In the event of a dispute (e.g., the seller claims the item was packed correctly), the Indiafy Arbitration Team will review the mandatory Video Packing proof. The decision of the Arbitration Team is final.
              </p>
              <p>Please review our <Link to="/refund-policy">Refund Policy</Link> for detailed steps.</p>
            </section>

            <section id="fraud-prevention" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Fraud Prevention</h2>
              <p>
                We employ advanced ML algorithms and manual audits to detect fraud. We reserve the right to temporarily freeze funds, delay payouts, or cancel orders if we suspect fraudulent activity.
              </p>
              <p>
                Both buyers and sellers are monitored for abnormal behavior patterns, such as high dispute rates or unusual login locations.
              </p>
            </section>

            <section id="account-suspension" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Account Suspension</h2>
              <p>
                Indiafy reserves the right to suspend or terminate accounts without prior notice if we determine that you have violated these Terms, engaged in fraudulent activity, or created a hostile environment for other users or staff.
              </p>
              <p>
                If your account is suspended, any pending payouts may be held for up to 180 days to cover potential chargebacks or disputes.
              </p>
            </section>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
