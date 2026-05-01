import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MapPin,
  Globe,
  ShieldCheck,
  ChevronRight,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  // 🔥 Completely cleaned up links. Only production-relevant public links.
  const footerSections = [
    {
      title: "Indiafy Engine",
      links: [
        { label: "About Indiafy", path: "/about" },
        { label: "Quick Commerce", path: "/quick-commerce" },
        { label: "Wholesale B2B", path: "/wholesale" },
        { label: "Local Verified Nodes", path: "/local-sellers" },
      ],
    },
    {
      title: "Customer Support",
      links: [
        { label: "Help Center", path: "/support" },
        { label: "Track Payload", path: "/track-order" },
        { label: "Order History", path: "/order-history" },
        { label: "Return Policy", path: "/support" },
      ],
    },
    {
      title: "Partner Network",
      links: [
        { label: "Sell on Indiafy", path: "/auth" },
        { label: "Rider Fleet", path: "#" }, // Placeholder for future
        { label: "Node Guidelines", path: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-20 pb-10 border-t border-zinc-900 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* TOP SECTION: BRAND & LINKS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
          {/* Brand Info (Left Side) */}
          <div className="lg:col-span-5">
            <Link to="/">
              <img
                src="/Images/logo.png"
                alt="Indiafy"
                className="h-8 w-auto mb-6 brightness-0 invert hover:opacity-80 transition-opacity"
              />
            </Link>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm mb-8">
              Indiafy is a trust-first hyperlocal commerce infrastructure. We
              engineer lightning-fast deliveries and verified B2B sourcing
              through our unified node network.
            </p>

            {/* Tech-style Contact & Location */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-zinc-300">
                <MapPin size={14} className="text-emerald-500" />
                <span>Base Node: Sector 45, Gurugram</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-zinc-300">
                <Mail size={14} className="text-emerald-500" />
                <span>operations@indiafy.com</span>
              </div>
            </div>
          </div>

          {/* Navigation Links (Right Side) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-10">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-sm"></span>{" "}
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-[13px] font-medium text-zinc-500 hover:text-emerald-400 hover:pl-2 transition-all duration-300 flex items-center group"
                      >
                        <ChevronRight
                          size={12}
                          className="opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 mr-1 transition-all"
                        />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE SECTION: TRUST BAR & SOCIALS */}
        <div className="py-6 border-y border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-500">
              <Globe size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Global Standards
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
            <div className="flex items-center gap-2 text-zinc-500">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Secure Infrastructure
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION: LEGAL & SYSTEM STATUS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              © {currentYear} Indiafy Commerce Pvt. Ltd.
            </p>
            <div className="hidden md:block w-1 h-1 rounded-full bg-zinc-800"></div>
            <div className="flex gap-6">
              <Link
                to="/privacy-policy"
                className="text-[10px] font-black text-zinc-600 hover:text-emerald-400 uppercase tracking-widest transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms-and-conditions"
                className="text-[10px] font-black text-zinc-600 hover:text-emerald-400 uppercase tracking-widest transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Systems Online:{" "}
              <span className="text-emerald-500 ml-1">Node GGM</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
