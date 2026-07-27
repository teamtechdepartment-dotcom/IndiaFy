/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight, Scale } from "lucide-react";

import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import SEOHead from "../../components/seo/SEOHead";

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("definitions");

  const sections = [
    { id: "definitions", title: "Definitions" },
    { id: "platform-usage", title: "Platform Usage" },
    { id: "seller-responsibilities", title: "Seller Responsibilities" },
    { id: "buyer-responsibilities", title: "Buyer Responsibilities" },
    { id: "e-commerce-compliance", title: "E-Commerce Compliance" },
    { id: "payments", title: "Payments & Fees" },
    { id: "returns", title: "Returns & Disputes" },
    { id: "fraud-prevention", title: "Fraud Prevention" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "ip-rights", title: "Intellectual Property" },
    { id: "account-suspension", title: "Account Suspension" },
    { id: "grievance", title: "Grievance Redressal" },
    { id: "governing-law", title: "Governing Law" },
  ];

  // ScrollSpy logic for Sticky TOC
  useEffect(() => {
    const handleScroll = () => {
      let current = "definitions";
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
        title="Terms & Conditions | Indiafy – Legally Binding Agreement"
        description="Read the complete terms and conditions for Indiafy. Covers platform usage, buyer/seller obligations under Indian Consumer Protection Act 2019, E-Commerce Rules 2020, payments, fraud prevention, and dispute resolution."
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
            Last Updated: July 27, 2026 · Governed by the Indian Contract Act, 1872 & Consumer Protection Act, 2019.
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
                <p className="text-xs text-slate-500 mb-4">Read our Community Standards for a simplified view of our rules.</p>
                <Link to="/community-standards" className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:gap-2 transition-all">
                  Community Standards <ChevronRight size={14} />
                </Link>
              </div>

              <div className="mt-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Scale size={14} className="text-emerald-700" />
                  <p className="text-xs font-bold text-emerald-900">Governing Laws</p>
                </div>
                <ul className="space-y-1.5 text-[11px] text-emerald-700 font-medium">
                  <li>• Indian Contract Act, 1872</li>
                  <li>• Consumer Protection Act, 2019</li>
                  <li>• E-Commerce Rules, 2020</li>
                  <li>• IT Act, 2000</li>
                  <li>• Sale of Goods Act, 1930</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT */}
          <div className="w-full lg:w-3/4 max-w-3xl prose prose-slate prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-primary">

            {/* DEFINITIONS */}
            <section id="definitions" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">1. Definitions</h2>
              <p>In these Terms & Conditions:</p>
              <ul>
                <li><strong>"Platform"</strong> means the Indiafy website, mobile application, and all related services operated by Indiafy Commerce Private Limited.</li>
                <li><strong>"Marketplace Entity"</strong> refers to Indiafy Commerce Pvt. Ltd. as defined under Rule 2(1)(n) of the Consumer Protection (E-Commerce) Rules, 2020.</li>
                <li><strong>"Seller"</strong> means any individual or entity registered to sell goods on the Platform, classified as an "e-commerce entity" under the Consumer Protection Act, 2019.</li>
                <li><strong>"Buyer/Consumer"</strong> means any person who purchases or intends to purchase goods through the Platform, as defined under Section 2(7) of the Consumer Protection Act, 2019.</li>
                <li><strong>"Node"</strong> means a geographically defined operational zone where a seller operates.</li>
                <li><strong>"Quick Commerce"</strong> means delivery within the Platform's hyperlocal SLA (typically 25 minutes).</li>
                <li><strong>"Escrow"</strong> means the secure payment holding mechanism where buyer funds are held until successful delivery and expiry of the dispute window.</li>
              </ul>
            </section>

            {/* PLATFORM USAGE */}
            <section id="platform-usage" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">2. Platform Usage</h2>
              <p>
                Indiafy provides a localized, node-based marketplace connecting verified sellers with buyers. By registering for an account—either as a buyer or a seller—you agree to be bound by these Terms. This constitutes a <strong>valid contract under Section 10 of the Indian Contract Act, 1872</strong>.
              </p>
              <p>
                You must be at least <strong>18 years old</strong> to form a binding contract (as per Section 11 of the Indian Contract Act). The platform is intended for use within India, and all transactions are governed by Indian law.
              </p>
              <p>
                As per the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, Indiafy operates as a <strong>marketplace e-commerce entity</strong> under Rule 2(1)(n). Indiafy does not own or hold title to any goods sold on the Platform — sellers are independent entities responsible for their own products, pricing, and compliance.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 not-prose">
                <p className="text-sm font-bold text-blue-900 mb-2">Mandatory Disclosures (E-Commerce Rules 2020, Rule 4)</p>
                <ul className="space-y-2 text-xs text-blue-700">
                  <li>• <strong>Legal Name:</strong> Indiafy Commerce Private Limited</li>
                  <li>• <strong>Principal Address:</strong> Sector 45, Gurugram, Haryana – 122003, India</li>
                  <li>• <strong>Contact:</strong> support@indiafy.com | +91 XXXX-XXXXXX</li>
                  <li>• <strong>Grievance Officer:</strong> grievance@indiafy.com</li>
                  <li>• <strong>CIN:</strong> [To be updated upon incorporation]</li>
                </ul>
              </div>
            </section>

            {/* SELLER RESPONSIBILITIES */}
            <section id="seller-responsibilities" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">3. Seller Responsibilities</h2>
              <p>
                Sellers are the backbone of our trust network. Under the <strong>Consumer Protection (E-Commerce) Rules, 2020 (Rule 5)</strong>, sellers on Indiafy must:
              </p>
              <ul>
                <li><strong>Maintain Inventory Accuracy:</strong> You must only list items you currently have in stock in your local node. Ghost inventory listings violate Rule 5(3)(b) which mandates accurate representation of goods.</li>
                <li><strong>Video Packing Compliance:</strong> For items above the specified high-value threshold (₹1,500), you must record a continuous video of the packing process using the Indiafy Seller App.</li>
                <li><strong>Authenticity:</strong> Selling counterfeit, illegal, or prohibited goods is a violation of the <strong>Trade Marks Act, 1999</strong> (Section 103) and will result in immediate suspension and potential criminal prosecution.</li>
                <li><strong>Fulfillment Speed:</strong> You must dispatch Quick Commerce orders within the strict SLA defined in your onboarding contract.</li>
                <li><strong>Tax Compliance:</strong> Sellers must maintain valid GST registration, file timely returns, and comply with TDS provisions under Section 194-O of the Income Tax Act and TCS under Section 52 of CGST Act.</li>
                <li><strong>Country of Origin (Rule 5(3)(a)):</strong> Display the country of origin for all imported goods. This is mandatory under the E-Commerce Rules, 2020.</li>
                <li><strong>MRP Compliance:</strong> All products must display correct MRP as per the <strong>Legal Metrology Act, 2009</strong>. Selling above MRP is a criminal offence.</li>
                <li><strong>No Unfair Trade Practices:</strong> Manipulation of search results, false urgency ("only 1 left"), fake reviews, and bait-and-switch tactics are prohibited under <strong>Section 2(47) of the Consumer Protection Act, 2019</strong>.</li>
              </ul>
              <p>For detailed seller rules, see our <Link to="/seller-policy">Seller Policy</Link> and <Link to="/seller-guidelines">Seller Guidelines</Link>.</p>
            </section>

            {/* BUYER RESPONSIBILITIES */}
            <section id="buyer-responsibilities" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">4. Buyer Responsibilities</h2>
              <p>
                As a buyer, you agree to:
              </p>
              <ul>
                <li><strong>Accurate Information:</strong> Provide accurate delivery information and ensure someone is available to receive the package during the designated hyperlocal delivery window.</li>
                <li><strong>Genuine Claims Only:</strong> Abusive behavior toward delivery partners, false claims of "Item Not Received", or fraudulent return requests (e.g., returning a different item) are strict violations of these Terms and constitute <strong>cheating under Section 420 of the Indian Penal Code</strong>.</li>
                <li><strong>No Misuse:</strong> Exploiting promotional offers through multiple accounts, fake identities, or automated scripts is prohibited and may constitute <strong>fraud under the IT Act, 2000</strong>.</li>
                <li><strong>Payment Obligations:</strong> Once an order is placed and payment is confirmed, it constitutes a binding contract under the Indian Contract Act, 1872. Refusing delivery without valid reason may result in forfeiture of delivery charges.</li>
                <li><strong>Respectful Conduct:</strong> Threatening, abusing, or harassing sellers, delivery partners, or Indiafy staff may constitute an offence under <strong>Section 507 IPC</strong> and will be reported to law enforcement.</li>
              </ul>
            </section>

            {/* E-COMMERCE COMPLIANCE */}
            <section id="e-commerce-compliance" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">5. E-Commerce Compliance</h2>
              <p>
                Indiafy complies with all provisions of the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>:
              </p>

              <h3>5.1 Marketplace Obligations (Rule 4)</h3>
              <ul>
                <li>Display legal name, registered address, and contact details of the marketplace entity.</li>
                <li>Provide a <strong>Grievance Redressal mechanism</strong> with a designated Grievance Officer whose name and contact are displayed on the Platform.</li>
                <li>Maintain a <strong>level playing field</strong> — no preferential treatment to any seller or associated enterprise in search rankings.</li>
                <li>Ensure no seller (or group of related sellers) accounts for more than <strong>25% of total sales</strong> on the Platform in any financial year.</li>
                <li>Not mandate exclusive selling arrangements with any seller.</li>
              </ul>

              <h3>5.2 Product Information (Rule 4(3))</h3>
              <ul>
                <li>Every product listing must display: name & description, images, price (inclusive of GST), country of origin, manufacturer details, net quantity, expiry date (if applicable), warranty information, and return/exchange policy.</li>
                <li><strong>Pre-purchase Information:</strong> Total price including delivery charges, handling fees, and all applicable taxes must be disclosed before checkout.</li>
                <li><strong>No Dark Patterns & Free Consent (No Auto-Tick):</strong> The Platform strictly prohibits false urgency, hidden charges, forced bundling, subscription traps, pre-checked/auto-ticked consent boxes, or implied opt-in routing under the <strong>Guidelines for Prevention and Regulation of Dark Patterns, 2023</strong> issued by CCPA and Section 6 of the DPDP Act, 2023. All user agreements require explicit, un-checked, affirmative opt-in action.</li>
              </ul>

              <h3>5.3 Cancellation & Return (Rule 4(4))</h3>
              <ul>
                <li>Buyers have the right to cancel any order before shipment.</li>
                <li>No charges shall be imposed for cancellation before shipment unless the Platform incurs a quantifiable cost.</li>
                <li>The return policy for each product is clearly displayed on the product page as mandated.</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 not-prose">
                <p className="text-sm font-bold text-amber-900 mb-1">FDI Policy Compliance</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  As a marketplace entity, Indiafy does not hold inventory, does not influence product pricing, and does not exercise ownership over sold goods — in compliance with <strong>Press Note 2 of 2018 (DPIIT)</strong> governing FDI in e-commerce marketplace model.
                </p>
              </div>
            </section>

            {/* PAYMENTS */}
            <section id="payments" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">6. Payments & Fees</h2>
              <p>
                Indiafy uses an <strong>escrow-style payment system</strong> in compliance with <strong>RBI's Payment Aggregator (PA) Guidelines</strong>. When you place an order, the funds are held securely by our payment processors. Funds are only released to the seller after the return window has expired or the order is marked successfully delivered without dispute.
              </p>
              <ul>
                <li><strong>Payment Methods:</strong> UPI, credit/debit cards, net banking, and Indiafy Wallet. All payments are processed by <strong>PCI-DSS Level 1 certified</strong> payment aggregators.</li>
                <li><strong>Data Localisation:</strong> All payment data is stored within India per <strong>RBI's data localisation circular (April 2018)</strong>.</li>
                <li><strong>No Surcharges:</strong> Indiafy does not levy surcharges on any specific payment method — in compliance with <strong>RBI's Circular on Merchant Discount Rate (MDR)</strong> for UPI and RuPay transactions.</li>
                <li><strong>GST on Services:</strong> Platform commissions charged to sellers are subject to GST at 18%. Sellers receive a compliant tax invoice for claiming Input Tax Credit (ITC).</li>
                <li><strong>TDS Obligation:</strong> Indiafy deducts TDS under <strong>Section 194-O of the Income Tax Act</strong> at 1% on the gross amount of sale paid to e-commerce participants.</li>
                <li><strong>TCS Obligation:</strong> Tax Collected at Source under <strong>Section 52 of CGST Act</strong> at 1% (0.5% CGST + 0.5% SGST) is collected and deposited with the government.</li>
              </ul>
              <p>
                Sellers are subject to a platform fee structure that is agreed upon during onboarding. Indiafy reserves the right to adjust commission rates with a <strong>30-day written notice</strong> as per the Seller Policy.
              </p>
            </section>

            {/* RETURNS */}
            <section id="returns" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">7. Returns & Disputes</h2>
              <p>
                Under the <strong>Consumer Protection Act, 2019 (Section 2(46))</strong>, consumers have the right to return goods that are defective, not as described, or delivered in a damaged condition:
              </p>
              <ul>
                <li><strong>Return Window:</strong> 3 to 7 days depending on the product category, as displayed on the product page. This complies with Rule 4(4) of E-Commerce Rules.</li>
                <li><strong>Defective Products (Section 84, Consumer Protection Act):</strong> If a product is found to be defective under Section 2(10), the buyer may claim replacement, refund, or compensation for damages.</li>
                <li><strong>Product Liability (Chapter VI, Consumer Protection Act):</strong> Sellers and manufacturers are liable for harm caused by defective products or deficient services under Sections 84-87. This liability cannot be waived by contract.</li>
              </ul>
              <p>
                In the event of a dispute, the <strong>Indiafy Arbitration Team</strong> will review the mandatory Video Packing proof, delivery evidence, and buyer documentation. The decision of the Arbitration Team is binding. Sellers who fail to provide video evidence forfeit the dispute automatically.
              </p>
              <p>Please review our <Link to="/refund-policy">Refund Policy</Link> for detailed steps.</p>
            </section>

            {/* FRAUD PREVENTION */}
            <section id="fraud-prevention" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">8. Fraud Prevention</h2>
              <p>
                We employ advanced ML algorithms and manual audits to detect fraud in compliance with the <strong>IT Act, 2000</strong>:
              </p>
              <ul>
                <li><strong>Section 66 (Computer-related offences):</strong> Any attempt to hack, manipulate, or gain unauthorized access to Indiafy's systems is punishable with imprisonment up to 3 years and fine up to ₹5 lakh.</li>
                <li><strong>Section 66C (Identity Theft):</strong> Using another person's identity credentials to transact on Indiafy is punishable with imprisonment up to 3 years and fine up to ₹1 lakh.</li>
                <li><strong>Section 66D (Cheating by Personation):</strong> Impersonating another person using a computer resource is punishable with imprisonment up to 3 years and fine up to ₹1 lakh.</li>
                <li><strong>Section 43 (Unauthorized Access):</strong> If any person without authorisation accesses or disrupts the Platform, they shall be liable to pay damages by way of compensation up to ₹5 crore.</li>
              </ul>
              <p>
                We reserve the right to temporarily freeze funds, delay payouts, or cancel orders if we suspect fraudulent activity. Both buyers and sellers are monitored for abnormal behavior patterns, such as high dispute rates, unusual login locations, or coordinated fake review campaigns.
              </p>
              <p>
                Indiafy cooperates with <strong>law enforcement agencies</strong>, including sharing user data upon receipt of valid legal process (court order, search warrant, or lawful request under Section 69 of the IT Act).
              </p>
            </section>

            {/* LIABILITY */}
            <section id="liability" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">9. Limitation of Liability</h2>
              <p>
                As a marketplace entity under the E-Commerce Rules, 2020:
              </p>
              <ul>
                <li>Indiafy <strong>does not own, stock, or control</strong> the goods sold by sellers on the Platform. Product quality, authenticity, and compliance are the sole responsibility of the seller.</li>
                <li>Indiafy's <strong>aggregate liability</strong> for any claim arising from a transaction shall not exceed the total amount paid by the buyer for that specific order.</li>
                <li>Indiafy shall not be liable for <strong>indirect, incidental, or consequential damages</strong> including loss of profits, business interruption, or data loss — except where such exclusion is prohibited by law.</li>
                <li>Nothing in these Terms excludes or limits liability that cannot be excluded under Indian law, including liability under the <strong>Consumer Protection Act, 2019 (Product Liability — Chapter VI)</strong>.</li>
                <li><strong>Force Majeure:</strong> Indiafy is not liable for failure or delay in performance caused by events beyond reasonable control, including natural disasters, pandemics, government orders, strikes, or internet outages.</li>
              </ul>
            </section>

            {/* IP RIGHTS */}
            <section id="ip-rights" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">10. Intellectual Property</h2>
              <ul>
                <li>The Indiafy name, logo, and brand elements are trademarks of Indiafy Commerce Pvt. Ltd. protected under the <strong>Trade Marks Act, 1999</strong>.</li>
                <li>The Platform's UI, source code, algorithms, and databases are protected under the <strong>Copyright Act, 1957</strong> and the <strong>IT Act, 2000</strong>.</li>
                <li>Users may not reproduce, distribute, or create derivative works of any Indiafy content without prior written authorization.</li>
                <li>Seller-uploaded content (product images, descriptions) remains the seller's property. Sellers grant Indiafy a non-exclusive, royalty-free license to use, display, and promote such content.</li>
                <li><strong>DMCA-Equivalent Takedowns:</strong> Indiafy will process IP infringement complaints under the <strong>Copyright Act, 1957 (Section 52)</strong> and <strong>IT Act, 2000 (Section 79)</strong> intermediary guidelines. Counter-notification may be filed within 10 business days.</li>
              </ul>
            </section>

            {/* ACCOUNT SUSPENSION */}
            <section id="account-suspension" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">11. Account Suspension & Termination</h2>
              <p>
                Indiafy reserves the right to suspend or terminate accounts without prior notice if we determine that you have:
              </p>
              <ul>
                <li>Violated these Terms, the <Link to="/seller-policy">Seller Policy</Link>, or <Link to="/community-standards">Community Standards</Link>.</li>
                <li>Engaged in fraudulent activity as defined under the IT Act, 2000 or IPC.</li>
                <li>Created a hostile environment for other users, delivery partners, or Indiafy staff.</li>
                <li>Failed to comply with KYC requirements or provided fraudulent documents.</li>
                <li>Been subject to a legal order, regulatory directive, or law enforcement request mandating suspension.</li>
              </ul>
              <p>
                If your account is suspended, any pending payouts may be held for up to <strong>180 days</strong> to cover potential chargebacks, disputes, or regulatory investigations. You may appeal within 15 days by writing to <a href="mailto:seller-appeals@indiafy.com">seller-appeals@indiafy.com</a>.
              </p>
            </section>

            {/* GRIEVANCE */}
            <section id="grievance" className="mb-16 scroll-mt-32">
              <h2 className="text-3xl mb-6 text-slate-900">12. Grievance Redressal</h2>
              <p>
                In compliance with <strong>Rule 4(4) of the Consumer Protection (E-Commerce) Rules, 2020</strong> and <strong>Section 79 of the IT Act, 2000</strong> read with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021:
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 not-prose shadow-sm mb-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Grievance Officer</p>
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
                    <p className="text-sm font-semibold text-slate-600">Acknowledgment within 48 hours. Resolution within 30 days.</p>
                  </div>
                </div>
              </div>
              <p>
                <strong>Consumer Complaint Forums:</strong> If you are not satisfied with the resolution, you may file a complaint with:
              </p>
              <ul>
                <li><strong>National Consumer Helpline:</strong> 1800-11-4000 or NCH App (UMANG portal).</li>
                <li><strong>District Consumer Disputes Redressal Commission:</strong> For claims up to ₹50 lakh.</li>
                <li><strong>State Consumer Disputes Redressal Commission:</strong> For claims between ₹50 lakh and ₹2 crore.</li>
                <li><strong>National Consumer Disputes Redressal Commission (NCDRC):</strong> For claims exceeding ₹2 crore.</li>
                <li><strong>INGRAM Portal:</strong> <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">consumerhelpline.gov.in</a> for online consumer complaint filing.</li>
              </ul>
            </section>

            {/* GOVERNING LAW */}
            <section id="governing-law" className="mb-16 scroll-mt-32">
              <div className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-10 not-prose">
                <h3 className="text-xl font-black mb-4">13. Governing Law & Jurisdiction</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of India, including but not limited to the <strong className="text-white">Indian Contract Act, 1872</strong>, <strong className="text-white">Consumer Protection Act, 2019</strong>, <strong className="text-white">Consumer Protection (E-Commerce) Rules, 2020</strong>, <strong className="text-white">Sale of Goods Act, 1930</strong>, <strong className="text-white">IT Act, 2000</strong>, and all related regulations.
                </p>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                  Subject to the consumer's statutory right to approach Consumer Forums, any dispute arising out of these Terms shall be subject to the <strong className="text-white">exclusive jurisdiction of the courts in Gurugram, Haryana, India</strong>.
                </p>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Before initiating legal proceedings, both parties agree to attempt resolution through Indiafy's internal grievance mechanism and mediation. This does not affect your statutory right to approach the Consumer Forum under the Consumer Protection Act, 2019.
                </p>
              </div>
            </section>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
