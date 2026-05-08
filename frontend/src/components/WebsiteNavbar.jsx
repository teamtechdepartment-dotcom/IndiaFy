import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Zap,
  Package,
  Truck,
  Home,
  Laptop,
  Sparkles,
  User,
  LogOut,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useSellerAuthStore } from "../store/sellerAuthStore";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "#", hasDropdown: true },
  { label: "Track Order", href: "/order-history" },
  { label: "Verified Nodes", path: "/local-sellers" },
  { label: "Help", href: "/support" },
];

const productCategories = [
  {
    icon: <Zap size={18} className="text-emerald-500" aria-hidden="true" />,
    label: "Quick Commerce",
    sub: "10-25 Min Delivery",
    path: "/quick-commerce",
  },
  {
    icon: <Package size={18} className="text-blue-500" aria-hidden="true" />,
    label: "Wholesale",
    sub: "Bulk B2B Pricing",
    path: "/wholesale",
  },
  {
    icon: <Truck size={18} className="text-orange-500" aria-hidden="true" />,
    label: "Local Sellers",
    sub: "Verified Ecosystem",
    path: "/local-sellers",
  },
  {
    icon: <Home size={18} className="text-purple-500" aria-hidden="true" />,
    label: "Home Essentials",
    sub: "Kitchen & Decor",
    path: "#",
  },
  {
    icon: <Laptop size={18} className="text-zinc-500" aria-hidden="true" />,
    label: "Electronics",
    sub: "Mobiles & Audio",
    path: "#",
  },
  {
    icon: <Sparkles size={18} className="text-pink-500" aria-hidden="true" />,
    label: "Personal Care",
    sub: "Beauty & Wellness",
    path: "#",
  },
];

function WebsiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user: customerUser, isAuthenticated: isCustomerAuthenticated, logout: logoutCustomer } = useAuthStore();
  const { user: sellerUser, isAuthenticated: isSellerAuthenticated, logout: logoutSeller } = useSellerAuthStore();
  const { cartItems } = useCartStore();

  const isAuthenticated = isCustomerAuthenticated || isSellerAuthenticated;
  const user = isSellerAuthenticated ? sellerUser : customerUser;

  const isHomePage = location.pathname === "/";
  const isLightTheme = !isHomePage || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  // Close user menu on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    
    if (isSellerAuthenticated) {
      await logoutSeller();
    } else {
      await logoutCustomer();
    }
    
    toast.success("Logged out successfully");
    // Redirect all users to home page on logout
    navigate("/", { replace: true });
  }, [logoutCustomer, logoutSeller, isSellerAuthenticated, navigate]);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isLightTheme
            ? "bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-zinc-100"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            {/* 1. LOGO */}
            <Link
              to="/"
              className="flex-shrink-0"
              aria-label="Indiafy - Go to homepage"
            >
              <img
                src="/Images/logo.png"
                alt="Indiafy"
                width={120}
                height={32}
                className={`h-8 lg:h-9 w-auto object-contain transition-all duration-300 ${!isLightTheme ? "brightness-0 invert" : ""}`}
              />
            </Link>

            {/* 2. DESKTOP NAV LINKS */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative group h-12 flex items-center"
                  onMouseEnter={() => link.hasDropdown && setDropdownOpen(true)}
                  onMouseLeave={() => link.hasDropdown && setDropdownOpen(false)}
                >
                  <Link
                    to={link.path || link.href}
                    className={`flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[0.1em] transition-all ${
                      isLightTheme
                        ? "text-zinc-600 hover:text-emerald-600"
                        : "text-white/80 hover:text-white"
                    }`}
                    aria-expanded={link.hasDropdown ? dropdownOpen : undefined}
                    aria-haspopup={link.hasDropdown ? "true" : undefined}
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown
                        size={14}
                        aria-hidden="true"
                        className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </Link>

                  {/* MEGA DROPDOWN */}
                  {link.hasDropdown && dropdownOpen && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] pt-4 animate-in fade-in slide-in-from-top-2 duration-200"
                      role="menu"
                      aria-label="Shop categories"
                    >
                      <div className="bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-zinc-100 overflow-hidden grid grid-cols-2 p-4 gap-2">
                        {productCategories.map((cat) => (
                          <button
                            key={cat.label}
                            role="menuitem"
                            onClick={() => {
                              setDropdownOpen(false);
                              navigate(cat.path);
                            }}
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-all cursor-pointer group/item border border-transparent hover:border-zinc-100 text-left w-full"
                          >
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover/item:bg-white group-hover/item:shadow-sm transition-all duration-300">
                              {cat.icon}
                            </div>
                            <div>
                              <p className="text-sm font-black text-zinc-900 leading-tight mb-0.5">
                                {cat.label}
                              </p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {cat.sub}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 3. ACTION ICONS */}
            <div className={`flex items-center gap-2 sm:gap-4 ${isLightTheme ? "text-zinc-900" : "text-white"}`}>
              {/* Search button */}
              <button
                onClick={() => navigate("/search")}
                aria-label="Search products"
                className={`hidden md:flex items-center rounded-full px-4 py-2 transition-all cursor-pointer group ${isLightTheme ? "bg-zinc-100 hover:bg-zinc-200" : "bg-white/10 hover:bg-white/20"}`}
              >
                <Search size={16} aria-hidden="true" className="group-hover:scale-110 transition-transform" />
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest">Search</span>
              </button>

              <div className="flex items-center gap-1 sm:gap-2 md:border-l border-zinc-500/30 md:ml-2 md:pl-4">
                {/* Wishlist */}
                <button
                  aria-label="View wishlist"
                  className={`p-2 rounded-full transition-all ${isLightTheme ? "hover:bg-zinc-100" : "hover:bg-white/10"}`}
                  onClick={() => navigate("/cart")}
                >
                  <Heart size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>

                {/* Cart */}
                <button
                  aria-label={`Shopping cart${cartItems.length > 0 ? `, ${cartItems.length} items` : ''}`}
                  className={`p-2 rounded-full transition-all relative ${isLightTheme ? "hover:bg-zinc-100" : "hover:bg-white/10"}`}
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
                  {cartItems.length > 0 && (
                    <span
                      aria-hidden="true"
                      className={`absolute top-0.5 right-0.5 w-4 h-4 text-[9px] flex items-center justify-center rounded-full font-black shadow-sm ${isLightTheme ? "bg-emerald-500 text-white" : "bg-white text-emerald-600"}`}
                    >
                      {cartItems.length}
                    </span>
                  )}
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                  className={`lg:hidden p-2 ml-1 rounded-full ${isLightTheme ? "hover:bg-zinc-100" : "hover:bg-white/10"}`}
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu size={24} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>

              {/* Desktop Login/Join OR User Profile */}
              <div className="hidden lg:flex items-center gap-3 ml-2">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      aria-label="User menu"
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                      className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-zinc-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                        {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </div>
                      <ChevronDown size={16} aria-hidden="true" />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-zinc-200 py-2 z-50 origin-top-right"
                          role="menu"
                          aria-label="User menu"
                        >
                          {user?.role?.toLowerCase() === 'seller' ? (
                            <Link
                              to="/seller-hub"
                              role="menuitem"
                              onClick={() => setUserMenuOpen(false)}
                              className="group flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition"
                            >
                              <Store size={16} aria-hidden="true" />
                              Seller Hub
                            </Link>
                          ) : (
                            <>
                              <Link
                                to="/profile"
                                role="menuitem"
                                onClick={() => setUserMenuOpen(false)}
                                className="group flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition"
                              >
                                <User size={16} aria-hidden="true" />
                                My Profile
                              </Link>

                              <Link
                                to="/order-history"
                                role="menuitem"
                                onClick={() => setUserMenuOpen(false)}
                                className="group flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition"
                              >
                                <Package size={16} aria-hidden="true" />
                                Orders
                              </Link>

                              <Link
                                to="/addresses"
                                role="menuitem"
                                onClick={() => setUserMenuOpen(false)}
                                className="group flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition"
                              >
                                <Home size={16} aria-hidden="true" />
                                Addresses
                              </Link>
                            </>
                          )}

                          <div className="border-t my-2" role="separator" />

                          <button
                            role="menuitem"
                            onClick={handleLogout}
                            className="group w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                          >
                            <LogOut size={16} aria-hidden="true" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/seller-auth")}
                      aria-label="Become a seller on Indiafy"
                      className={`hidden xl:flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] px-5 py-2.5 rounded-full transition-all border-2 ${
                        isLightTheme 
                          ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50" 
                          : "border-white/30 text-white hover:bg-white/10"
                      }`}
                    >
                      <Zap size={14} className="fill-current" aria-hidden="true" />
                      Become a Seller
                    </button>
                    <button
                      onClick={() => navigate("/login")}
                      aria-label="Login to your account"
                      className="text-[11px] font-black uppercase tracking-[0.1em] bg-zinc-900 text-white py-2.5 px-8 rounded-full hover:bg-emerald-500 transition-colors shadow-lg active:scale-[0.98]"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[999] lg:hidden"
            onClick={() => setMenuOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <motion.div
              key="mobile-sidebar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute right-0 top-0 h-[100dvh] w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                <img src="/Images/logo.png" alt="Indiafy" width={96} height={24} className="h-6 w-auto" />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full transition-colors"
                >
                  <X size={20} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6 no-scrollbar">
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Menu
                  </span>
                  {navLinks.filter(link => {
                    if (link.label === "Track Order" && !isAuthenticated) return false;
                    return true;
                  }).map((link) => (
                    link.hasDropdown ? (
                      <div key={link.label} className="space-y-3">
                        <div className="text-lg font-black text-zinc-900 tracking-tight flex items-center justify-between">
                          {link.label}
                          <ChevronDown size={18} className="text-zinc-300" aria-hidden="true" />
                        </div>
                        <nav className="grid grid-cols-1 gap-2 pl-4" aria-label="Shop categories">
                          {productCategories.map(cat => (
                            <Link 
                              key={cat.label} 
                              to={cat.path} 
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 py-2 text-sm font-bold text-zinc-600 hover:text-emerald-600"
                            >
                              <span className="p-1.5 bg-zinc-100 rounded-lg" aria-hidden="true">{cat.icon}</span>
                              {cat.label}
                            </Link>
                          ))}
                        </nav>
                      </div>
                    ) : (
                      <Link
                        key={link.label}
                        to={link.path || link.href}
                        className="text-lg font-black text-zinc-900 tracking-tight flex items-center justify-between"
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                        <ChevronRight size={18} className="text-zinc-300" aria-hidden="true" />
                      </Link>
                    )
                  ))}
                </div>

                <div className="w-full h-px bg-zinc-100 my-2" role="separator" />

                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Quick Access
                  </span>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const q = e.target.search.value;
                      if (q) {
                        navigate(`/search?q=${q}`);
                        setMenuOpen(false);
                      }
                    }}
                    className="relative group"
                    role="search"
                    aria-label="Search products"
                  >
                    <label htmlFor="mobile-search" className="sr-only">Search products</label>
                    <input
                      id="mobile-search"
                      name="search"
                      type="text"
                      placeholder="Search items..."
                      className="w-full p-4 pl-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-sm font-bold focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  </form>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-3">
                {isAuthenticated && user ? (
                  <>
                    <button
                      onClick={() => { navigate(user?.role?.toLowerCase() === 'seller' ? "/seller-hub" : "/profile"); setMenuOpen(false); }}
                      aria-label={`Go to ${user.firstName || 'your'} profile`}
                      className="w-full py-3.5 text-xs font-black uppercase tracking-widest bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {user?.role?.toLowerCase() === 'seller' ? <Store size={16} aria-hidden="true" /> : <User size={16} aria-hidden="true" />} 
                      {user.firstName || "Dashboard"}
                    </button>
                    <button
                      onClick={handleLogout}
                      aria-label="Logout from your account"
                      className="w-full py-3.5 text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} aria-hidden="true" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate("/seller-auth"); setMenuOpen(false); }}
                      aria-label="Become a seller on Indiafy"
                      className="w-full py-3.5 text-xs font-black uppercase tracking-widest bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Store size={16} aria-hidden="true" /> Become a Seller
                    </button>
                    <button
                      onClick={() => { navigate("/login"); setMenuOpen(false); }}
                      aria-label="Login or signup as customer"
                      className="w-full py-3.5 text-xs font-black uppercase tracking-widest bg-zinc-900 text-white rounded-xl shadow-md hover:bg-zinc-800 transition-colors"
                    >
                      Customer Login / Signup
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(WebsiteNavbar);
