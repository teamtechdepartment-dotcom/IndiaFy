/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
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
  { icon: <Zap size={18} className="text-brand-accent" />, label: "Quick Commerce", sub: "under 30-min Delivery", path: "/quick-commerce" },
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
  // Restored backend/routing logic constant
  const isSellerMode = isSellerAuthenticated && sellerUser?.role?.toLowerCase() === "seller";

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
    } catch (_err) {
      console.error("Logout clearing issues:", _err);
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
      <style>
        {`
          @keyframes smooth-gradient-bg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-smooth-bg {
            /* Premium, texture-free e-commerce gradient (Deep Emerald to Rich Teal) */
            background: linear-gradient(90deg, #065f46, #047857, #0d9488, #0f766e, #065f46);
            background-size: 300% 300%;
            animation: smooth-gradient-bg 12s ease-in-out infinite;
          }
        `}
      </style>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled ? "shadow-nav-scroll" : "shadow-nav"
        }`}
      >
        {/* Top Bar */}
        <div className="animate-smooth-bg text-white shadow-sm transition-all">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            
            {/* LEFT: Logo - Ensure no background styles are applied */}
            <Link to={isSellerMode ? "/seller-hub" : "/"} className="flex-shrink-0 outline-none" aria-label="Indiafy - Go to homepage">
              <img loading="lazy" decoding="async"
                src="/Images/logo.png"
                alt="Indiafy"
                width={120}
                height={32}
                className="h-7 lg:h-8 w-auto object-contain"
              />
            </Link>

            {/* CENTER: Search Bar / Seller Mode Info (desktop) */}
            {isSellerMode ? (
              <div className="hidden md:flex items-center flex-1 max-w-2xl justify-center">
                <span className="bg-white/10 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-white/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Seller Administration Portal
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSearch}
                role="search"
                aria-label="Search products"
                className="hidden md:flex items-center flex-1 max-w-2xl mx-6 lg:mx-12"
              >
                <div className="relative w-full group">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary" aria-hidden="true" />
                  <label htmlFor="nav-search" className="sr-only">Search products</label>
                  <input
                    id="nav-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands and more"
                    className="w-full pl-12 pr-4 py-3 bg-white text-brand-text-primary rounded-md text-sm font-medium placeholder:text-brand-text-secondary/80 focus:outline-none focus:ring-0 shadow-sm transition-all"
                  />
                </div>
              </form>
            )}

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1 sm:gap-4 drop-shadow-sm">
              {/* Track Order (desktop only) */}
              {isCustomerAuthenticated && !isSellerMode && (
                <Link
                  to="/order-history"
                  className="hidden lg:flex items-center gap-1.5 px-2 py-2 text-sm font-medium text-white hover:text-gray-100 transition-colors"
                >
                  <Package size={20} />
                  <span>Orders</span>
                </Link>
              )}

              {/* Become Seller (desktop only, when logged out) */}
              {!isAuthenticated && !isSellerMode && (
                <button
                  onClick={() => navigate("/seller/login")}
                  aria-label="Become a seller on Indiafy"
                  className="hidden xl:flex items-center gap-1.5 text-sm font-medium px-4 py-2 text-white hover:text-gray-100 transition-all duration-200"
                >
                  <Store size={18} />
                  Become a Seller
                </button>
              )}



              {/* Cart */}
              {!isSellerMode && (
                <button
                  aria-label={`Shopping cart${cartItems.length > 0 ? `, ${cartItems.length} items` : ''}`}
                  className="relative flex items-center gap-1.5 p-2 text-white hover:text-gray-100 transition-colors font-medium text-sm"
                  onClick={() => navigate("/cart")}
                >
                  <div className="relative">
                    <ShoppingCart size={22} strokeWidth={1.8} aria-hidden="true" />
                    {cartItems.length > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] flex items-center justify-center rounded-full font-bold bg-white text-brand-primary border border-white"
                      >
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block">Cart</span>
                </button>
              )}

              {/* Profile / Login */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-1.5 p-1.5 text-white hover:text-gray-100 transition-colors text-sm font-medium"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold border border-white" aria-hidden="true">
                      {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block">{user.firstName || 'Profile'}</span>
                    <ChevronDown size={14} className="hidden sm:block" aria-hidden="true" />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-brand-border py-2 z-50 origin-top-right transition-all duration-200 text-brand-primary"
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
                      </div>
                    )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  aria-label="Login to your account"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-semibold bg-white text-brand-primary py-2 px-6 rounded-md hover:bg-gray-100 transition-colors active:scale-[0.98] shadow-sm"
                >
                  Login
                </button>
              )}

              <button
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="lg:hidden p-2 text-white hover:text-gray-100 transition-colors"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={24} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            {/* Mobile Search Bar */}
            {!isSellerMode && (
              <div className="md:hidden pb-3 px-4 pt-1">
                <form onSubmit={handleSearch} className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products, brands and more..."
                    className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-xs"
                  />
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Bottom Category Bar */}
        {!isSellerMode && (
        <div className="hidden lg:block bg-white border-b border-brand-border shadow-sm relative z-10">
          <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center">
                <div
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <button
                    onClick={() => setMegaOpen(!megaOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-background rounded-lg transition-colors"
                    aria-expanded={megaOpen}
                    aria-haspopup="true"
                  >
                    <Menu size={14} />
                    All Categories
                    <ChevronDown size={12} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
                  </button>

                  {megaOpen && (
                    <div
                      className="absolute top-full left-0 w-[580px] pt-2 z-50 transition-all duration-200"
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
                      </div>
                    )}
                </div>
              </div>

              <div className="flex items-center justify-around flex-1 px-8 overflow-x-auto no-scrollbar whitespace-nowrap">
                {categoryPills.map((pill) => {
                  const active = location.pathname === pill.path;
                  return (
                    <button
                      key={pill.label}
                      onClick={() => navigate(pill.path)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-colors rounded-lg ${
                        active
                          ? "text-brand-primary bg-brand-background font-bold shadow-sm"
                          : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background"
                      }`}
                    >
                      {pill.icon}
                      {pill.label}
                    </button>
                  );
                })}

                <button
                  onClick={() => navigate("/quick-commerce")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors rounded-lg ${
                    location.pathname === "/quick-commerce"
                      ? "text-[#f97316] bg-orange-50 font-bold shadow-sm"
                      : "font-bold text-[#f97316] hover:bg-orange-50/50"
                  }`}
                >
                  <Zap size={16} className="fill-current" />
                  Under 30-Min Delivery
                </button>

                <button
                  onClick={() => navigate("/wholesale")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-colors rounded-lg ${
                    location.pathname === "/wholesale"
                      ? "text-brand-primary bg-brand-background font-bold shadow-sm"
                      : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background"
                  }`}
                >
                  <Package size={16} />
                  Wholesale
                </button>

                <button
                  onClick={() => navigate("/stores")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-colors rounded-lg ${
                    location.pathname === "/stores"
                      ? "text-brand-primary bg-brand-background font-bold shadow-sm"
                      : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background"
                  }`}
                >
                  <Store size={16} />
                  Stores
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </nav>

      {/* MOBILE SIDEBAR */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm z-[999] lg:hidden transition-all duration-300"
          onClick={() => setMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className="absolute right-0 top-0 h-[100dvh] w-[85%] max-w-[360px] bg-white shadow-2xl flex flex-col pointer-events-auto transition-transform duration-300 translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
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

              {!isSellerMode && (
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-background border border-brand-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d9488]/30 transition-all"
                    />
                  </div>
                </form>
              </div>
              )}

              <div className="flex-1 overflow-y-auto py-4 px-5 flex flex-col gap-1 no-scrollbar">
                {isSellerMode ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-2 px-1">Seller Management</p>
                    <Link to="/seller-hub" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-background rounded-xl transition-colors">
                      Seller Hub <ChevronRight size={16} className="text-brand-text-secondary" />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-2 px-1">Quick Links</p>

                    <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-background rounded-xl transition-colors">
                      Home <ChevronRight size={16} className="text-brand-text-secondary" />
                    </Link>

                    <Link to="/quick-commerce" onClick={() => setMenuOpen(false)} className="flex items-center justify-between px-3 py-3 text-sm font-semibold text-[#f97316] hover:bg-orange-50 rounded-xl transition-colors">
                      <span className="flex items-center gap-2"><Zap size={16} className="fill-current" /> Under 30-Min Delivery</span>
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
                  </>
                )}
              </div>

              <div className="p-5 border-t border-brand-border bg-brand-background/50 flex flex-col gap-2.5">
                {isSellerMode ? (
                  <>
                    <button
                      onClick={() => { navigate("/seller-hub"); setMenuOpen(false); }}
                      className="w-full py-3 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Store size={16} /> Seller Hub
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
                          className="w-full py-3 text-sm font-semibold bg-[#f97316] text-white rounded-xl hover:bg-[#ea580c] transition-colors flex items-center justify-center gap-2"
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
                  </>
                )}
              </div>
            </div>
          </div>
      )}
    </>
  );
}

export default memo(WebsiteNavbar);