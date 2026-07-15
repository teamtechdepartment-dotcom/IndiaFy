/**
 * BrandLogo — Centralized INDIAFY Logo Component
 * Single source of truth for the official logo across admin panel.
 * Uses the official /Images/logo.png asset.
 */

const SIZE_MAP = {
  xs: "h-5",
  sm: "h-6",
  md: "h-7",
  lg: "h-8",
  xl: "h-10",
  "2xl": "h-12",
};

/**
 * Primary brand logo component.
 * @param {"xs"|"sm"|"md"|"lg"|"xl"|"2xl"} size - Logo height
 * @param {string} className - Additional classes
 * @param {string} alt - Alt text override
 */
export function BrandLogo({ size = "md", className = "", alt = "INDIAFY" }) {
  const heightClass = SIZE_MAP[size] || SIZE_MAP.md;
  return (
    <img
      src="/Images/logo.png"
      alt={alt}
      className={`${heightClass} w-auto object-contain select-none ${className}`}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  );
}

/**
 * Sidebar logo — used in the admin sidebar header.
 * Slightly larger, with optional subtitle.
 */
export function SidebarLogo({ showSubtitle = true, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <BrandLogo size="lg" />
      {showSubtitle && (
        <span className="text-[9px] font-black tracking-[0.3em] uppercase leading-none pl-0.5" style={{ color: "#FB641B" }}>
          Enterprise OS
        </span>
      )}
    </div>
  );
}

/**
 * Navbar logo — used in the admin top navbar (mobile view).
 */
export function NavbarLogo({ className = "" }) {
  return <BrandLogo size="md" className={className} />;
}

/**
 * Auth logo — used on the admin login page.
 */
export function AuthLogo({ className = "" }) {
  return (
    <div className={`flex flex-col items-start gap-1.5 ${className}`}>
      <BrandLogo size="xl" />
      <span className="text-[10px] font-black tracking-[0.25em] uppercase leading-none" style={{ color: "#FB641B" }}>
        Enterprise Operating System
      </span>
    </div>
  );
}

/**
 * Footer logo — small logo for footer sections.
 */
export function FooterLogo({ className = "" }) {
  return <BrandLogo size="sm" className={`opacity-70 hover:opacity-100 transition-opacity ${className}`} />;
}

export default BrandLogo;
