/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, MapPin, Mail, ArrowRight, Youtube } from "lucide-react";

const socialLinks = [
  { Icon: Facebook, label: "Facebook", url: "#" },
  { Icon: Instagram, label: "Instagram", url: "https://www.instagram.com/indiafy.official?igsh=dWN6ajFvc3Uzbm9u" },
  { Icon: Twitter, label: "Twitter", url: "#" },
  { Icon: Linkedin, label: "LinkedIn", url: "#" },
  { Icon: Youtube, label: "YouTube", url: "https://youtube.com/@official_indiafy?si=H85tQr3gmFoHe1Kf" },
];

const footerSections = [
  {
    title: "Shop Categories",
    links: [
      { label: "Groceries", path: "/category/grocery" },
      { label: "Electronics", path: "/category/electronics" },
      { label: "Fashion", path: "/category/garments" },
      { label: "Home & Living", path: "/category/home-decor" },
    ],
  },
  {
    title: "Indiafy Services",
    links: [
      { label: "Quick Commerce", path: "/quick-commerce" },
      { label: "Wholesale B2B", path: "/wholesale" },
      { label: "Local Stores", path: "/stores" },
      { label: "Track Order", path: "/order-history" },
    ],
  },
  {
    title: "Partner With Us",
    links: [
      { label: "Sell on Indiafy", path: "/become-seller-info" },
      { label: "Seller Guidelines", path: "/seller-guidelines" },
      { label: "Seller Policy", path: "/seller-policy" },
      { label: "Seller Dashboard", path: "/seller-hub" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", path: "/help-center" },
      { label: "Contact Us", path: "/contact" },
      { label: "Trust & Safety", path: "/trust-safety" },
      { label: "About Us", path: "/about" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Best Shopping Platform", path: "/best-shopping-platform-gurugram" },
      { label: "Quick Commerce", path: "/quick-commerce-gurugram" },
      { label: "Wholesale Suppliers", path: "/wholesale-suppliers-gurugram" },
      { label: "Verified Sellers", path: "/verified-sellers-gurugram" },
      { label: "Hyperlocal Market", path: "/hyperlocal-marketplace-gurugram" },
    ],
  },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-background pt-16 pb-8 border-t border-brand-border" role="contentinfo">
      <div className="section-container">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" aria-label="Indiafy - Go to homepage" className="block mb-6">
              <img loading="lazy" decoding="async"
                src="/Images/logo.png"
                alt="Indiafy"
                width={120}
                height={32}
                className="h-8 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
            <p className="text-brand-text-secondary text-sm font-medium leading-relaxed mb-8 max-w-sm">
              Indiafy is your trusted hyperlocal marketplace. Discover local stores, quick delivery services, and wholesale suppliers near you.
            </p>

            <address className="flex flex-col gap-4 not-italic">
              <div className="flex items-center gap-3 text-sm font-medium text-brand-text-secondary">
                <MapPin size={16} className="text-brand-accent shrink-0" />
                <span>Sector 45, Gurugram, Haryana</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-brand-text-secondary">
                <Mail size={16} className="text-brand-accent shrink-0" />
                <a href="mailto:support@indiafy.com" className="hover:text-brand-primary transition-colors">
                  support@indiafy.com
                </a>
              </div>
            </address>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-6">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-bold text-brand-primary mb-5">{section.title}</h4>
                <ul className="space-y-3.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-sm font-medium text-brand-text-secondary hover:text-brand-accent transition-colors flex items-center group"
                      >
                        <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 mr-1.5 transition-all" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-brand-border mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-medium text-brand-text-secondary mt-4 md:mt-0">
            <span>© {currentYear} Indiafy Commerce. All rights reserved.</span>
            <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/privacy-policy" className="hover:text-brand-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-brand-primary transition-colors">Terms of Service</Link>
              <Link to="/refund-policy" className="hover:text-brand-primary transition-colors">Refund Policy</Link>
              <Link to="/seller-policy" className="hover:text-brand-primary transition-colors">Seller Policy</Link>
              <Link to="/community-standards" className="hover:text-brand-primary transition-colors">Community Standards</Link>
            </div>
          </div>

          <div className="flex gap-3">
            {socialLinks.map(({ Icon, label, url }) => (
              <a
                key={label}
                href={url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow Indiafy on ${label}`}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-brand-border text-brand-text-secondary hover:text-white hover:bg-brand-accent hover:border-brand-accent hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
