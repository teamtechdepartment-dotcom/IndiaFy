/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("data-collection");

  const sections = [
    { id: "data-collection", title: "Data Collection" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "security", title: "Data Security" },
    { id: "user-rights", title: "User Rights" },
    { id: "account-deletion", title: "Account Deletion" },
  ];

  // ScrollSpy logic for Sticky TOC
  useEffect(() => {
    const handleScroll = () => {
      let current = "data-collection";
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
        title="Privacy Policy | Indiafy"
        description="Learn how Indiafy handles your data. Read our privacy policy detailing data collection, security, and your user rights."
      />
      <WebsiteNavbar scrolledByDefault={true} />

      {/* HEADER SECTION */}
      <header className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6 lg:mx-0 mx-auto">
            <ShieldCheck size={16} /> Privacy Mandate
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-2xl">
            Last Updated: March 25, 2026 · We believe that trust is built on transparency.
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
                <p className="text-xs text-slate-500 mb-4">Our privacy team is available to help.</p>
                <Link to="/contact" className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:gap-2 transition-all">
                  Contact Support <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className="w-full lg:w-3/4 max-w-3xl prose prose-slate prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-primary">
            
            <section id="data-collection" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Data Collection</h2>
              <p>
                At Indiafy, we collect information to provide you with the fastest and most secure hyperlocal commerce experience. When you create an account, we collect:
              </p>
              <ul>
                <li><strong>Identity Information:</strong> Name, phone number, and email address.</li>
                <li><strong>Location Data:</strong> To map you to the nearest verified hub and ensure 10-25 minute delivery, we require precise sector-based mapping.</li>
                <li><strong>Transaction History:</strong> We keep a secure record of your orders for refunds, disputes, and loyalty tracking.</li>
                <li><strong>Video Verification Logs:</strong> For high-value items, sellers are required to record the packing process. These videos are tied to your order ID.</li>
              </ul>
            </section>

            <section id="cookies" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Cookies & Tracking</h2>
              <p>
                We use cookies to improve your browsing experience, remember your local store preferences, and keep you logged in securely.
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for the platform to function securely (e.g., authentication tokens).</li>
                <li><strong>Performance Cookies:</strong> Help us understand how long it takes for our pages to load so we can optimize speed.</li>
                <li><strong>Functional Cookies:</strong> Remember your delivery address or your preferred language.</li>
              </ul>
              <p>
                We do <em>not</em> use third-party advertising cookies that track you across the internet. Our ecosystem is self-contained.
              </p>
            </section>

            <section id="security" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Data Security</h2>
              <p>
                Security is not an afterthought; it is our foundation. Your data is encrypted in transit and at rest using AES-256 standards.
              </p>
              <p>
                Payments are processed through bank-grade microservices via PCI-DSS compliant partners. We do not store raw credit card data on our local node servers. In the event of a dispute, video-packing evidence is handled via secure, expiring URLs that only the buyer, seller, and Indiafy arbiters can access.
              </p>
            </section>

            <section id="user-rights" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">User Rights</h2>
              <p>
                Under the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, you have the right to:
              </p>
              <ul>
                <li>Request a copy of all the personal data we hold about you.</li>
                <li>Request that we correct any inaccurate information.</li>
                <li>Opt-out of marketing communications.</li>
                <li>Request to be forgotten (subject to operational logging requirements).</li>
              </ul>
            </section>

            <section id="account-deletion" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Account Deletion</h2>
              <p>
                You can delete your account at any time from your Profile Settings.
              </p>
              <p>
                Upon deletion, your profile, saved addresses, and active carts will be permanently removed. However, to comply with Indian financial regulations and our fraud prevention mandates, we must retain transaction records and video proofs for a period of up to 5 years.
              </p>
              <p>
                If you have questions about our retention policies, please reach out to our <Link to="/contact">Privacy Officer</Link>.
              </p>
            </section>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
