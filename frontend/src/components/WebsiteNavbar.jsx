import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
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
  ShoppingBasket,
  Heart as HeartIcon,
  Pill,
  Scissors,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useSellerAuthStore } from "../store/sellerAuthStore";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { useCartStore } from "../store/cartStore";
import { toast } from "react-toastify";

const categoryPills = [
  { label: "Groceries", path: "/category/grocery", icon: <ShoppingBasket size={16} /> },
  { label: "Fashion", path: "/category/garments", icon: <ShoppingBag size={16} /> },
  { label: "Electronics", path: "/category/electronics", icon: <Laptop size={16} /> },
  { label: "Beauty", path: "/category/beauty", icon: <Sparkles size={16} /> },
];

const megaMenuCategories = [
  { icon: <Zap size={18} className="text-brand-accent" />, label: "Quick Commerce", sub: "15-min Delivery", path: "/quick-commerce" },
  { icon: <Package size={18} className="text-amber-500" />, label: "Wholesale", sub: "Bulk B2B Pricing", path: "/wholesale" },
  { icon: <Truck size={18} className="text-blue-500" />, label: "Local Sellers", sub: "Verified Stores", path: "/local-sellers" },
  { icon: <Home size={18} className="text-purple-500" />, label: "Home & Living", sub: "Kitchen & Decor", path: "/category/home-decor" },
  { icon: <Laptop size={18} className="text-slate-600" />, label: "Electronics", sub: "Mobiles & Audio", path: "/category/electronics" },
  { icon: <Sparkles size={18} className="text-pink-500" />, label: "Personal Care", sub: "Beauty & Wellness", path: "/category/beauty" },
  { icon: <ShoppingBasket size={18} className="text-brand-accent" />, label: "Groceries", sub: "Fresh & Daily Needs", path: "/category/grocery" },
  { icon: <Pill size={18} className="text-red-500" />, label: "Healthcare", sub: "Medicines & Supplies", path: "/category/pharmacy" },
];

function WebsiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { user: customerUser, isAuthenticated: isCustomerAuthenticated, logout: logoutCustomer } = useAuthStore();
  const { user: sellerUser, isAuthenticated: isSellerAuthenticated, logout: logoutSeller } = useSellerAuthStore();
  const { cartItems, fetchCart } = useCartStore();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuthStore();

  const isAuthenticated = isCustomerAuthenticated || isSellerAuthenticated;
  const user = isSellerAuthenticated ? sellerUser : customerUser;

  // Optimistically sync Cart context to enable persistent UI counters across refreshes
  useEffect(() => {
    if (isCustomerAuthenticated) {
      fetchCart();
    }
  }, [isCustomerAuthenticated, fetchCart]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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
    setMegaOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    
    // Cleanse ALL scopes (seller & customer) simultaneously to prevent dangling states
    try {
      await Promise.allSettled([
        logoutSeller(),
        logoutCustomer()
      ]);
    } catch (err) {
      console.error("Logout clearing issues:", err);
    }
    
    toast.success("Logged out successfully");
    // Redirect all users to home page on logout
    navigate("/", { replace: true });
  }, [logoutCustomer, logoutSeller, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 bg-white ${
          scrolled ? "shadow-nav-scroll" : "shadow-nav"
        }`}
      >
        {/* Top Bar */}
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            
            {/* LEFT: Logo */}
            <Link to="/" className="flex-shrink-0" aria-label="Indiafy - Go to homepage">
              <img loading="lazy" decoding="async"
                src="/Images/logo.png"
                alt="Indiafy"
                width={120}
                height={32}
                className="h-7 lg:h-8 w-auto object-contain"
              />
            </Link>

            {/* CENTER: Search Bar (desktop) */}
            <form
              onSubmit={handleSearch}
              role="search"
              aria-label="Search products"
              className="hidden md:flex items-center flex-1 max-w-xl mx-6 lg:mx-10"
            >
              <div className="relative w-full group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary" aria-hidden="true" />
                <label htmlFor="nav-search" className="sr-only">Search products</label>
                <input
                  id="nav-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, stores, brands..."
                  className="w-full pl-11 pr-4 py-2.5 bg-brand-background border border-brand-border rounded-full text-sm font-medium text-brand-primary placeholder:text-brand-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                />
              </div>
            </form>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Track Order (desktop only) */}
              {isCustomerAuthenticated && (
                <Link
                  to="/order-history"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-text-secondary hover:text-brand-primary transition-colors rounded-lg hover:bg-brand-background"
                >
                  <Package size={16} />
                  <span>Orders</span>
                </Link>
              )}

              {/* Become Seller (desktop only, when logged out) */}
              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/seller/login")}
                  aria-label="Become a seller on Indiafy"
                  className="hidden xl:flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-all duration-200"
                >
                  <Store size={14} />
                  Sell on Indiafy
                </button>
              )}

              {/* Admin Panel Link */}
              <Link
                to={isAdminAuthenticated ? "/admin/dashboard" : "/admin/login"}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#0F172A] text-white hover:bg-slate-800 rounded-full transition-all duration-200 border border-[#10B981]/20 shadow-sm"
              >
                Admin Panel
              </Link>

              {/* Cart */}
              <button
                aria-label={`Shopping cart${cartItems.length > 0 ? `, ${cartItems.length} items` : ''}`}
                className="relative p-2.5 rounded-full text-brand-primary hover:bg-brand-background transition-colors"
                onClick={() => navigate("/cart")}
              >
                <ShoppingBag size={20} strokeWidth={1.8} aria-hidden="true" />
                {cartItems.length > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] flex items-center justify-center rounded-full font-bold bg-brand-accent text-white shadow-sm"
                  >
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Profile / Login */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-brand-background transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                      {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="hidden sm:block text-brand-text-secondary" aria-hidden="true" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-brand-border py-2 z-50 origin-top-right"
                        role="menu"
                        aria-label="User menu"
                      >
                        {user?.role?.toLowerCase() === 'seller' ? (
                          <Link
                            to="/seller-hub"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-background transition rounded-lg mx-1"
                          >
                            <Store size={16} className="text-brand-text-secondary" aria-hidden="true" />
                            Seller Hub
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/profile"
                              role="menuitem"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-background transition rounded-lg mx-1"
                            >
                              <User size={16} className="text-brand-text-secondary" aria-hidden="true" />
                              My Profile
                            </Link>
                            <Link
                              to="/order-history"
                              role="menuitem"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-background transition rounded-lg mx-1"
                            >
                              <Package size={16} className="text-brand-text-secondary" aria-hidden="true" />
                              Orders
                            </Link>
                            <Link
                              to="/addresses"
                              role="menuitem"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-background transition rounded-lg mx-1"
                            >
                              <MapPin size={16} className="text-brand-text-secondary" aria-hidden="true" />
                              Addresses
                            </Link>
                          </>
                        )}

                        <div className="border-t border-brand-border my-1.5 mx-3" role="separator" />

                        <button
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-error hover:bg-red-50 transition rounded-lg mx-1"
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          <LogOut size={16} aria-hidden="true" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  aria-label="Login to your account"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold bg-brand-primary text-white py-2 px-5 rounded-full hover:bg-brand-secondary transition-colors active:scale-[0.98]"
                >
                  Login
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="lg:hidden p-2 rounded-full hover:bg-brand-background text-brand-primary transition-colors"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={22} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Category Bar (desktop only) */}
        <div className="hidden lg:block border-t border-brand-border/60">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 h-10">
              {/* All Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-background rounded-lg transition-colors"
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                >
                  <Menu size={14} />
                  All Categories
                  <ChevronDown size={12} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-[580px] pt-2 z-50"
                      role="menu"
                      aria-label="All categories"
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-brand-border overflow-hidden grid grid-cols-2 p-3 gap-1">
                        {megaMenuCategories.map((cat) => (
                          <button
                            key={cat.label}
                            role="menuitem"
                            onClick={() => {
                              setMegaOpen(false);
                              navigate(cat.path);
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-background transition-all text-left w-full group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-brand-background flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                              {cat.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-brand-primary leading-tight">{cat.label}</p>
                              <p className="text-[11px] text-brand-text-secondary mt-0.5">{cat.sub}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-5 bg-brand-border mx-1" />

              {/* Quick Category Pills */}
              {categoryPills.map((pill) => (
                <Link
                  key={pill.label}
                  to={pill.path}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background rounded-lg transition-colors"
                >
                  {pill.label}
                </Link>
              ))}

              <div className="w-px h-5 bg-brand-border mx-1" />

              <Link
                to="/quick-commerce"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-accent hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Zap size={13} className="fill-current" />
                15-Min Delivery
              </Link>

              <Link
                to="/wholesale"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background rounded-lg transition-colors"
              >
                Wholesale
              </Link>

              <Link
                to="/stores"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background rounded-lg transition-colors"
              >
                Stores
              </Link>
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
            className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm z-[999] lg:hidden"
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
              className="absolute right-0 top-0 h-[100dvh] w-[85%] max-w-[360px] bg-white shadow-2xl flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-brand-border">
                <img loading="lazy" decoding="async" src="/Images/logo.png" alt="Indiafy" width={96} height={24} className="h-6 w-auto" />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 bg-brand-background hover:bg-gray-100 text-brand-primary rounded-full transition-colors"
                >
                  <X size={18} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              {/* Search */}
              <div className="px-5 pt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = e.target.search.value;
                    if (q) {
                      navigate(`/search?q=${q}`);
                      setMenuOpen(false);
                    }
                  }}
                  role="search"
                  aria-label="Search products"
                >
                  <div className="relative">
                    <label htmlFor="mobile-search" className="sr-only">Search products</label>
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" aria-hidden="true" />
                    <input
                      id="mobile-search"
                      name="search"
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-background border border-brand-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-accent/30 transition-all"
                    />
                  </div>
                </form>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-4 px-5 flex flex-col gap-1 no-scrollbar">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-2 px-1">Quick Links</p>

                <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-background rounded-xl transition-colors">
                  Home <ChevronRight size={16} className="text-brand-text-secondary" />
                </Link>

                <Link to="/quick-commerce" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-brand-accent hover:bg-emerald-50 rounded-xl transition-colors">
                  <span className="flex items-center gap-2"><Zap size={16} className="fill-current" /> 15-Min Delivery</span>
                  <ChevronRight size={16} />
                </Link>

                {isCustomerAuthenticated && (
                  <Link to="/order-history" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-background rounded-xl transition-colors">
                    <span className="flex items-center gap-2"><Package size={16} /> Orders</span>
                    <ChevronRight size={16} className="text-brand-text-secondary" />
                  </Link>
                )}

                <div className="h-px bg-brand-border my-2" />

                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-2 px-1">Categories</p>

                {megaMenuCategories.map(cat => (
                  <Link
                    key={cat.label}
                    to={cat.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-background rounded-xl transition-colors"
                  >
                    <span className="p-1.5 bg-brand-background rounded-lg">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-brand-border bg-brand-background/50 flex flex-col gap-2.5">
                <button
                  onClick={() => { navigate(isAdminAuthenticated ? "/admin/dashboard" : "/admin/login"); setMenuOpen(false); }}
                  className="w-full py-3 text-sm font-semibold bg-brand-accent text-white rounded-xl hover:bg-brand-accent-hover transition-colors flex items-center justify-center gap-2"
                >
                  Admin Panel
                </button>

                {isAuthenticated && user ? (
                  <>
                    <button
                      onClick={() => { navigate(user?.role?.toLowerCase() === 'seller' ? "/seller-hub" : "/profile"); setMenuOpen(false); }}
                      aria-label={`Go to ${user.firstName || 'your'} profile`}
                      className="w-full py-3 text-sm font-semibold bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2"
                    >
                      {user?.role?.toLowerCase() === 'seller' ? <Store size={16} /> : <User size={16} />}
                      {user.firstName || "Dashboard"}
                    </button>
                    <button
                      onClick={handleLogout}
                      aria-label="Logout from your account"
                      className="w-full py-3 text-sm font-semibold bg-white text-brand-error border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate("/seller/login"); setMenuOpen(false); }}
                      aria-label="Become a seller on Indiafy"
                      className="w-full py-3 text-sm font-semibold bg-brand-accent text-white rounded-xl hover:bg-brand-accent-hover transition-colors flex items-center justify-center gap-2"
                    >
                      <Store size={16} /> Sell on Indiafy
                    </button>
                    <button
                      onClick={() => { navigate("/login"); setMenuOpen(false); }}
                      aria-label="Login or signup as customer"
                      className="w-full py-3 text-sm font-semibold bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-colors"
                    >
                      Login / Sign Up
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
