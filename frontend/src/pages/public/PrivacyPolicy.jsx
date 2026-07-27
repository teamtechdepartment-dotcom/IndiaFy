/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight, Scale } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("legal-framework");

  const sections = [
    { id: "legal-framework", title: "Legal Framework" },
    { id: "data-collection", title: "Data Collection" },
    { id: "consent", title: "Consent & Lawful Basis" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "security", title: "Data Security" },
    { id: "user-rights", title: "Data Principal Rights" },
    { id: "data-retention", title: "Data Retention" },
    { id: "cross-border", title: "Cross-Border Transfers" },
    { id: "children", title: "Children's Data" },
    { id: "grievance-officer", title: "Grievance Officer" },
    { id: "account-deletion", title: "Account Deletion" },
  ];

  // ScrollSpy logic for Sticky TOC
  useEffect(() => {
    const handleScroll = () => {
      let current = "legal-framework";
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
        title="Privacy Policy | Indiafy – DPDP Act 2023 Compliant"
        description="Read Indiafy's privacy policy compliant with the Digital Personal Data Protection Act 2023, IT Act 2000, and SPDI Rules 2011. Learn about data collection, security, your rights, and grievance redressal."
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
            Last Updated: July 27, 2026 · Compliant with the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* LEFT: STICKY TOC */}
          <div className="hidden lg:block w-1/4 shrink-0">
            <div className="sticky top-32">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Contents</h4>
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
                <p className="text-sm font-bold mb-3">Questions?</p>
                <p className="text-xs text-slate-500 mb-4">Our privacy team is available to help.</p>
                <Link to="/contact" className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:gap-2 transition-all">
                  Contact Support <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Scale size={14} className="text-emerald-700" />
                  <p className="text-xs font-bold text-emerald-900">Governing Laws</p>
                </div>
                <ul className="space-y-1.5 text-[11px] text-emerald-700 font-medium">
                  <li>• DPDP Act, 2023</li>
                  <li>• IT Act, 2000</li>
                  <li>• SPDI Rules, 2011</li>
                  <li>• CERT-In Directions, 2022</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className="w-full lg:w-3/4 max-w-3xl prose prose-slate prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-primary">
            
            {/* LEGAL FRAMEWORK */}
            <section id="legal-framework" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Legal Framework</h2>
              <p>
                This Privacy Policy is drafted in compliance with the following Indian statutes and regulations:
              </p>
              <ul>
                <li><strong>Digital Personal Data Protection Act, 2023 (DPDP Act):</strong> Governs the processing of digital personal data, data principal rights, consent management, and obligations of data fiduciaries.</li>
                <li><strong>Information Technology Act, 2000 (IT Act):</strong> The foundational cyber law governing electronic commerce, data protection, and cyber security in India.</li>
                <li><strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules):</strong> Prescribes security practices for handling sensitive personal data including passwords, financial information, and biometric data.</li>
                <li><strong>CERT-In Directions, April 2022:</strong> Mandates reporting of cyber security incidents within 6 hours of discovery to the Indian Computer Emergency Response Team.</li>
                <li><strong>Consumer Protection Act, 2019:</strong> Protects consumers against unfair trade practices including unauthorized use of personal data for targeted advertising.</li>
                <li><strong>Reserve Bank of India (RBI) Circulars:</strong> Governs storage and processing of payment data under the data localisation mandate (all payment data to be stored within India).</li>
              </ul>
              <p>
                In this policy, <strong>"Data Fiduciary"</strong> refers to Indiafy Commerce Private Limited, and <strong>"Data Principal"</strong> refers to you, the user whose personal data is being processed.
              </p>
            </section>

            {/* DATA COLLECTION */}
            <section id="data-collection" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Data Collection</h2>
              <p>
                As a Data Fiduciary under the DPDP Act, 2023, Indiafy collects and processes personal data only for <strong>lawful purposes</strong> and in a <strong>fair, transparent</strong> manner. We collect:
              </p>
              <ul>
                <li><strong>Identity Information:</strong> Name, phone number, email address, and date of birth — required for account creation and age verification under Section 9 of the DPDP Act.</li>
                <li><strong>Location Data:</strong> Precise sector-based GPS coordinates to map you to the nearest verified hub and ensure sub-30-minute delivery. This constitutes <strong>sensitive personal data</strong> under SPDI Rules, 2011.</li>
                <li><strong>Transaction History:</strong> Complete record of orders, payments, refunds, and disputes — retained for financial compliance under the Income Tax Act, 1961 and GST Act, 2017.</li>
                <li><strong>KYC Documents (Sellers):</strong> PAN card, GST certificate, FSSAI license, Aadhaar (for e-KYC where consented), bank account details — classified as <strong>Sensitive Personal Data or Information (SPDI)</strong> under Rule 3 of SPDI Rules.</li>
                <li><strong>Video Verification Logs:</strong> For high-value items, sellers record the packing process. These videos are tied to order IDs and encrypted using AES-256.</li>
                <li><strong>Device & Technical Data:</strong> IP address, browser type, device identifiers, and session data — collected for security monitoring and fraud detection under Section 43A of the IT Act.</li>
                <li><strong>Communication Data:</strong> Customer support tickets, chat logs, and feedback — retained for dispute resolution and quality assurance.</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 not-prose">
                <p className="text-sm font-bold text-blue-900 mb-2">SPDI Classification (Rule 3, SPDI Rules 2011)</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  The following categories are treated as Sensitive Personal Data: passwords, financial information (bank account, UPI details), health information, biometric data, and any data relating to sexuality or gender identity. Enhanced consent and security measures apply to these categories.
                </p>
              </div>
            </section>

            {/* CONSENT */}
            <section id="consent" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Consent & Lawful Basis</h2>
              <p>
                Under <strong>Section 6 of the DPDP Act, 2023</strong>, personal data may only be processed for a lawful purpose with the free, specific, informed, and unambiguous consent of the Data Principal:
              </p>
              <ul>
                <li><strong>Explicit Consent:</strong> We obtain clear, affirmative consent at the time of account registration. You will be presented with a clear notice (in English and Hindi) detailing what data is collected, the purpose, and your rights — as required under <strong>Section 5 of the DPDP Act</strong>.</li>
                <li><strong>Granular Consent:</strong> For each new purpose (e.g., promotional SMS, location tracking for deals), separate opt-in consent is requested. Consent is never bundled.</li>
                <li><strong>Withdrawal of Consent:</strong> You may withdraw consent at any time via Profile Settings → Privacy → Manage Consent. Under <strong>Section 6(4) of the DPDP Act</strong>, withdrawal does not affect the legality of processing done prior to withdrawal.</li>
                <li><strong>Legitimate Uses Without Consent (Section 7):</strong> Processing may occur without consent for: (a) performance of a legal obligation, (b) compliance with court orders, (c) responding to medical emergencies, (d) employment-related processing.</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 not-prose">
                <p className="text-sm font-bold text-amber-900 mb-1">Notice Requirement</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Under Section 5 of the DPDP Act, before processing your data, Indiafy provides a notice containing: (i) the personal data to be collected, (ii) the purpose, (iii) your rights including the right to file a complaint with the Data Protection Board of India, and (iv) the process for withdrawal of consent.
                </p>
              </div>
            </section>

            {/* COOKIES */}
            <section id="cookies" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Cookies & Tracking</h2>
              <p>
                We use cookies to improve your browsing experience, remember your local store preferences, and keep you logged in securely:
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for the platform to function securely (e.g., authentication tokens, CSRF protection). These are strictly necessary and exempt from consent requirements under Rule 5(1) of SPDI Rules.</li>
                <li><strong>Performance Cookies:</strong> Help us understand how long it takes for our pages to load so we can optimize speed. Data is anonymized and aggregated.</li>
                <li><strong>Functional Cookies:</strong> Remember your delivery address, preferred language, and recently viewed items.</li>
                <li><strong>Analytics Cookies:</strong> We use privacy-focused analytics (no Google Analytics) to understand user journeys. No personally identifiable information is transmitted to third parties.</li>
              </ul>
              <p>
                We do <em>not</em> use third-party advertising cookies that track you across the internet. Our ecosystem is self-contained. You may manage cookie preferences at any time through the cookie banner or Profile Settings → Privacy.
              </p>
              <p>
                <strong>Do Not Track (DNT):</strong> We honour the DNT header signal from your browser. When enabled, all non-essential cookies are suppressed.
              </p>
            </section>

            {/* SECURITY */}
            <section id="security" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Data Security</h2>
              <p>
                As mandated under <strong>Section 8(4) of the DPDP Act</strong> and <strong>Section 43A of the IT Act</strong>, Indiafy implements reasonable security practices and procedures to protect personal data:
              </p>
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Database backups use envelope encryption with AWS KMS.</li>
                <li><strong>Payment Data Localisation:</strong> Per <strong>RBI's data localisation mandate (April 2018)</strong>, all payment system data is stored exclusively within India. No payment data is transferred outside Indian borders.</li>
                <li><strong>PCI-DSS Compliance:</strong> Payment processing is handled by PCI-DSS Level 1 certified partners. Indiafy does not store raw credit card numbers, CVV, or PINs on any local node server.</li>
                <li><strong>ISO 27001 Aligned:</strong> Our security practices are aligned with ISO/IEC 27001:2022 standards as referenced in Rule 8 of the SPDI Rules.</li>
                <li><strong>Access Controls:</strong> Role-based access control (RBAC) ensures only authorized personnel can access personal data. All access is logged and auditable.</li>
                <li><strong>Video Evidence Security:</strong> Video-packing evidence is handled via secure, expiring URLs (TTL: 72 hours) that only the buyer, seller, and Indiafy arbiters can access.</li>
              </ul>

              <h3>Breach Notification (CERT-In Compliance)</h3>
              <p>
                In compliance with <strong>CERT-In Directions dated April 28, 2022</strong>, any cyber security incident affecting user data will be reported to CERT-In within <strong>6 hours</strong> of discovery. Affected Data Principals will be notified within <strong>72 hours</strong> with:
              </p>
              <ul>
                <li>Nature and scope of the breach.</li>
                <li>Categories and approximate number of records affected.</li>
                <li>Remedial measures taken or proposed.</li>
                <li>Contact details of the Grievance Officer for further queries.</li>
              </ul>
              <p>
                Under <strong>Section 8(6) of the DPDP Act</strong>, Indiafy is obligated to notify the Data Protection Board of India of any personal data breach.
              </p>
            </section>

            {/* USER RIGHTS */}
            <section id="user-rights" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Data Principal Rights</h2>
              <p>
                Under <strong>Chapter III of the DPDP Act, 2023</strong> and <strong>Rule 5 of SPDI Rules, 2011</strong>, you have the following rights:
              </p>
              <ul>
                <li><strong>Right to Access (Section 11):</strong> Request a summary of all personal data processed by Indiafy and the processing activities performed on it.</li>
                <li><strong>Right to Correction & Erasure (Section 12):</strong> Request correction of inaccurate or misleading data, completion of incomplete data, updating of outdated data, and erasure of data no longer required for the purpose for which it was collected.</li>
                <li><strong>Right to Withdraw Consent (Section 6(4)):</strong> Withdraw previously given consent at any time. This will not affect the legality of processing based on consent before its withdrawal.</li>
                <li><strong>Right to Grievance Redressal (Section 13):</strong> File a complaint with Indiafy's Grievance Officer. If unsatisfied, you may escalate to the <strong>Data Protection Board of India</strong>.</li>
                <li><strong>Right to Nominate (Section 14):</strong> Nominate another individual to exercise your data rights in case of your death or incapacity.</li>
              </ul>
              <p>
                To exercise any of these rights, write to <a href="mailto:privacy@indiafy.com">privacy@indiafy.com</a> or use Profile Settings → Privacy → Data Requests. We will respond within <strong>30 days</strong> of receiving your verified request.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 not-prose">
                <p className="text-sm font-bold text-red-900 mb-1">Data Principal Duties (Section 15)</p>
                <p className="text-xs text-red-700 leading-relaxed">
                  Under the DPDP Act, Data Principals also have duties: (a) comply with applicable laws when exercising rights, (b) not register a false or frivolous complaint, (c) furnish only authentic information. Violation may attract penalties up to ₹10,000 under Section 15(b).
                </p>
              </div>
            </section>

            {/* DATA RETENTION */}
            <section id="data-retention" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Data Retention</h2>
              <p>
                Under <strong>Section 8(7) of the DPDP Act</strong>, personal data must not be retained longer than necessary for the purpose for which it was processed. Our retention schedule:
              </p>

              <div className="overflow-x-auto not-prose mb-6">
                <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Data Category</th>
                      <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Retention Period</th>
                      <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-white">
                      <td className="px-5 py-3 font-semibold text-slate-900">Account Profile</td>
                      <td className="px-5 py-3 text-slate-600">Until deletion + 90 days</td>
                      <td className="px-5 py-3 text-slate-500">DPDP Act, Section 8(7)</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-900">Transaction Records</td>
                      <td className="px-5 py-3 text-slate-600">8 years</td>
                      <td className="px-5 py-3 text-slate-500">Income Tax Act (Section 149), GST Act (Section 36)</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-5 py-3 font-semibold text-slate-900">Payment Data</td>
                      <td className="px-5 py-3 text-slate-600">5 years</td>
                      <td className="px-5 py-3 text-slate-500">RBI Master Direction, PML Act 2002</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-900">KYC Documents</td>
                      <td className="px-5 py-3 text-slate-600">5 years post account closure</td>
                      <td className="px-5 py-3 text-slate-500">PML Act 2002, RBI KYC Master Direction</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-5 py-3 font-semibold text-slate-900">Video Packing Logs</td>
                      <td className="px-5 py-3 text-slate-600">180 days</td>
                      <td className="px-5 py-3 text-slate-500">Internal dispute resolution policy</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="px-5 py-3 font-semibold text-slate-900">Server Logs & IP Data</td>
                      <td className="px-5 py-3 text-slate-600">180 days</td>
                      <td className="px-5 py-3 text-slate-500">CERT-In Directions, April 2022</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-5 py-3 font-semibold text-slate-900">Communication Logs</td>
                      <td className="px-5 py-3 text-slate-600">3 years</td>
                      <td className="px-5 py-3 text-slate-500">Consumer Protection Act, 2019</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Upon expiry of the retention period, data is permanently deleted or irreversibly anonymized within <strong>90 days</strong>.
              </p>
            </section>

            {/* CROSS-BORDER */}
            <section id="cross-border" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Cross-Border Data Transfers</h2>
              <p>
                Under <strong>Section 16 of the DPDP Act, 2023</strong>, the Central Government may notify countries to which personal data may <em>not</em> be transferred. Indiafy's current data transfer policy:
              </p>
              <ul>
                <li><strong>Payment Data:</strong> Strictly stored and processed within India per RBI's data localisation mandate. No exceptions.</li>
                <li><strong>General Personal Data:</strong> Processed and stored on servers located within India (AWS Mumbai / ap-south-1 region). No cross-border transfer occurs in ordinary operations.</li>
                <li><strong>Backup & DR:</strong> Disaster recovery backups are maintained within Indian data centres only.</li>
                <li><strong>Third-Party Processors:</strong> Any data processor engaged by Indiafy is contractually bound to process data within India unless the transfer is to a country not restricted under Section 16.</li>
              </ul>
              <p>
                If cross-border transfer becomes necessary (e.g., for international customer support tooling), we will obtain your explicit consent and ensure the destination country provides adequate data protection standards.
              </p>
            </section>

            {/* CHILDREN */}
            <section id="children" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Children's Data Protection</h2>
              <p>
                Under <strong>Section 9 of the DPDP Act, 2023</strong>:
              </p>
              <ul>
                <li>Indiafy does not knowingly collect personal data of children below <strong>18 years of age</strong> without verifiable parental or guardian consent.</li>
                <li><strong>Tracking & Profiling Prohibited:</strong> We do not perform behavioural tracking or targeted advertising directed at children.</li>
                <li><strong>Parental Consent:</strong> If a child's data is required for account creation (e.g., minor's delivery address), we require verifiable consent from a parent or legal guardian as prescribed under Section 9(1).</li>
                <li>If we discover that personal data of a child has been collected without proper consent, it will be permanently deleted within <strong>72 hours</strong>.</li>
              </ul>
            </section>

            {/* GRIEVANCE OFFICER */}
            <section id="grievance-officer" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Grievance Officer</h2>
              <p>
                In compliance with <strong>Rule 5(9) of the SPDI Rules, 2011</strong> and <strong>Section 13 of the DPDP Act, 2023</strong>, Indiafy has appointed the following Grievance Officer:
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 not-prose shadow-sm">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Name</p>
                    <p className="text-sm font-bold text-slate-900">Indiafy Grievance Officer</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</p>
                    <p className="text-sm font-bold text-brand-primary">grievance@indiafy.com</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Address</p>
                    <p className="text-sm font-semibold text-slate-600">Indiafy Commerce Pvt. Ltd., Sector 45, Gurugram, Haryana – 122003</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Response Time</p>
                    <p className="text-sm font-semibold text-slate-600">Within 48 hours of receipt (Resolution within 30 days as per SPDI Rule 5(9))</p>
                  </div>
                </div>
              </div>
              <p className="mt-4">
                If you are not satisfied with the resolution provided by the Grievance Officer, you have the right to file a complaint with the <strong>Data Protection Board of India</strong> established under Section 18 of the DPDP Act, 2023.
              </p>
            </section>

            {/* ACCOUNT DELETION */}
            <section id="account-deletion" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">Account Deletion</h2>
              <p>
                You can delete your account at any time from your Profile Settings.
              </p>
              <p>
                Upon deletion, your profile, saved addresses, and active carts will be permanently removed within <strong>90 days</strong>. However, to comply with Indian financial regulations, the following data must be retained as per the schedule above:
              </p>
              <ul>
                <li><strong>Transaction records:</strong> 8 years under Income Tax Act (Section 149) and GST Act (Section 36).</li>
                <li><strong>Payment data:</strong> 5 years under PML Act, 2002.</li>
                <li><strong>KYC documents:</strong> 5 years post-closure under PML Act and RBI KYC Directions.</li>
                <li><strong>Video packing logs:</strong> 180 days or until all related disputes are resolved.</li>
                <li><strong>Server/IP logs:</strong> 180 days under CERT-In Directions.</li>
              </ul>
              <p>
                This retained data is anonymized where possible and access-restricted to legal/compliance teams only. All other personal data is permanently deleted.
              </p>
              <p>
                If you have questions about our retention policies, please reach out to our <Link to="/contact">Grievance Officer</Link>.
              </p>
            </section>

            {/* GOVERNING LAW */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-10 not-prose">
              <h3 className="text-xl font-black mb-4">Governing Law & Jurisdiction</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                This Privacy Policy is governed by the laws of India, including but not limited to the <strong className="text-white">DPDP Act, 2023</strong>, <strong className="text-white">IT Act, 2000</strong>, <strong className="text-white">SPDI Rules, 2011</strong>, and all related regulations.
              </p>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in <strong className="text-white">Gurugram, Haryana, India</strong>.
              </p>
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
