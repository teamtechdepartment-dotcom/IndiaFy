import { useState, useEffect, useCallback } from "react";
import { 
  MapPin, 
  ChevronDown, 
  Zap, 
  User, 
  ArrowLeft, 
  X, 
  Search, 
  Navigation, 
  Map as MapIcon,
  Loader2,
  Menu,
  ShoppingCart,
  ShoppingBasket,
  ShoppingBag,
  Laptop,
  Sparkles,
  Package,
  Truck,
  Home,
  Pill,
  Store,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticButton } from "../lightswind/magnetic-button";

// Store Imports (Adjust path if needed)
import { useAuthStore } from "../../store/authStore";
import { useSellerAuthStore } from "../../store/sellerAuthStore";
import { useAdminAuthStore } from "../../store/adminAuthStore";

// Map Libraries
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 1. Component to update map center from Search or GPS
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// 2. Component to track map center when user drags it
function MapCenterTracker({ setPosition }) {
  useMapEvents({
    dragend: (e) => {
      const newCenter = e.target.getCenter();
      setPosition({ lat: newCenter.lat, lng: newCenter.lng });
    },
  });
  return null;
}

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

export default function QuickHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // UI States
  const [locationOpen, setLocationOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // <--- Added Menu State
  
  // Header Display Address
  const [currentAddress, setCurrentAddress] = useState("Sector 45, Gurugram");
  
  // Map internal state
  const [mapPosition, setMapPosition] = useState({ lat: 28.4595, lng: 77.0266 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Store Hooks
  const { user: customerUser, isAuthenticated: isCustomerAuthenticated, logout: logoutCustomer } = useAuthStore();
  const { user: sellerUser, isAuthenticated: isSellerAuthenticated, logout: logoutSeller } = useSellerAuthStore();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuthStore();

  const isAuthenticated = isCustomerAuthenticated || isSellerAuthenticated;
  const user = isSellerAuthenticated ? sellerUser : customerUser;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    try {
      await Promise.allSettled([
        logoutSeller(),
        logoutCustomer()
      ]);
    } catch (_err) {
      console.error("Logout clearing issues:", _err);
    }
    navigate("/", { replace: true });
  }, [logoutCustomer, logoutSeller, navigate]);

  // Auto-Detect GPS Location
  const locateUser = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsSearching(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please check browser permissions.");
          setIsSearching(false);
        }
      );
    }
  };

  // Manual Text Search (Geocoding)
  const handleManualSearch = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setMapPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
        } else {
          alert("Location not found. Please try a more specific area.");
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Convert dragged Pin to text address (Reverse Geocoding)
  const handleConfirmLocation = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition.lat}&lon=${mapPosition.lng}`);
      const data = await res.json();
      
      if (data && data.address) {
         const area = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.road || "Selected Location";
         const city = data.address.city || data.address.town || data.address.state_district || "";
         
         setCurrentAddress(`${area}${city ? ', ' + city : ''}`);
      } else {
         setCurrentAddress("Pinned Location");
      }
    } catch(e) {
      setCurrentAddress("Pinned Location");
    } finally {
      setIsConfirming(false);
      setLocationOpen(false);
    }
  };

  return (
    <>
      {/* Main Sticky Header Framework */}
      <header className="sticky top-0 z-50 w-full flex flex-col shadow-sm transition-colors">
        
        {/* Top Section - Blue Theme */}
        <div className="bg-brand-primary border-b border-white/10 w-full">
          <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between gap-3 relative">
            
            {/* Left: Back + Logo + Location */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                >
                  <ArrowLeft size={16} className="text-white" />
                </button>
                
                {/* Added Logo */}
                <img 
                  loading="lazy" 
                  decoding="async"
                  src="/Images/logo.png" 
                  alt="Indiafy" 
                  onClick={() => navigate("/")}
                  className="h-6 lg:h-7 w-auto object-contain cursor-pointer hidden sm:block hover:opacity-90 transition-opacity"
                />
              </div>

              <div className="h-6 w-px bg-white/20 hidden sm:block mx-1"></div>

              <button onClick={() => setLocationOpen(true)} className="flex items-center gap-1.5 min-w-0 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                  <MapPin size={16} className="text-white" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Deliver to</span>
                    <ChevronDown size={12} className="text-white/70 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[140px] sm:max-w-[220px]">
                    {currentAddress}
                  </p>
                </div>
              </button>
            </div>

            {/* Center: ETA Badge (Desktop Only) */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full shrink-0"
            >
              <Zap size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] font-extrabold text-white whitespace-nowrap">12 min</span>
            </motion.div>

            {/* Right: Cart, Profile & Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-white">
              
              {/* Cart Icon */}
              <button 
                onClick={() => navigate("/cart")} 
                className="p-1.5 hover:text-white/80 transition-colors relative"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={22} strokeWidth={2} />
              </button>

              {/* Desktop Profile Icon (Hidden on mobile) */}
              <button 
                onClick={() => navigate("/profile")} 
                className="hidden lg:flex w-8 h-8 rounded-full bg-white items-center justify-center hover:bg-zinc-100 active:scale-95 transition-all shadow-sm"
              >
                <User size={14} className="text-brand-primary" />
              </button>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                className="lg:hidden p-1.5 hover:text-white/80 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Category Bar (Desktop Only) */}
        <div className="hidden lg:block bg-white border-b border-brand-border w-full">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              {/* Left Side: All Categories */}
              <div className="flex items-center">
                <div
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <MagneticButton
                    variant="custom"
                    size="custom"
                    radius={32}
                    strength={0.25}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-background rounded-lg transition-colors"
                    aria-expanded={megaOpen}
                    aria-haspopup="true"
                  >
                    <Menu size={14} />
                    All Categories
                    <ChevronDown size={12} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
                  </MagneticButton>

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

              {/* Middle: Category Pills */}
              <div className="flex items-center justify-around flex-1 px-8 overflow-x-auto no-scrollbar whitespace-nowrap">
                {categoryPills.map((pill) => {
                  const active = location.pathname === pill.path;
                  return (
                    <MagneticButton
                      key={pill.label}
                      variant="custom"
                      size="custom"
                      radius={32}
                      strength={0.25}
                      onClick={() => navigate(pill.path)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-colors rounded-lg ${
                        active
                          ? "text-brand-primary bg-brand-background font-bold shadow-sm"
                          : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background"
                      }`}
                    >
                      {pill.icon}
                      {pill.label}
                    </MagneticButton>
                  );
                })}

                <MagneticButton
                  variant="custom"
                  size="custom"
                  radius={32}
                  strength={0.25}
                  onClick={() => navigate("/quick-commerce")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors rounded-lg ${
                    location.pathname === "/quick-commerce"
                      ? "text-brand-accent bg-brand-accent/10 font-bold shadow-sm"
                      : "font-bold text-brand-accent hover:bg-brand-accent/5"
                  }`}
                >
                  <Zap size={16} className="fill-brand-accent" />
                  15-Min Delivery
                </MagneticButton>

                <MagneticButton
                  variant="custom"
                  size="custom"
                  radius={32}
                  strength={0.25}
                  onClick={() => navigate("/wholesale")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-colors rounded-lg ${
                    location.pathname === "/wholesale"
                      ? "text-brand-primary bg-brand-background font-bold shadow-sm"
                      : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background"
                  }`}
                >
                  <Package size={16} />
                  Wholesale
                </MagneticButton>

                <MagneticButton
                  variant="custom"
                  size="custom"
                  radius={32}
                  strength={0.25}
                  onClick={() => navigate("/stores")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold transition-colors rounded-lg ${
                    location.pathname === "/stores"
                      ? "text-brand-primary bg-brand-background font-bold shadow-sm"
                      : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-background"
                  }`}
                >
                  <Store size={16} />
                  Stores
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR MODAL */}
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
          </div>
        </div>
      )}

      {/* Location Map Selection Modal */}
      <AnimatePresence>
        {locationOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLocationOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} transition={{ duration: 0.2 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-[72px] md:left-4 lg:left-[calc(50%-720px+1rem)] w-full md:w-[420px] bg-white z-[101] rounded-t-3xl md:rounded-2xl shadow-2xl md:border md:border-zinc-200 flex flex-col overflow-hidden h-[92dvh] md:h-auto md:max-h-[80vh]"
            >
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                <div>
                  <h3 className="text-lg font-black text-zinc-900">Select Location</h3>
                  <p className="text-xs font-medium text-zinc-500">To check delivery availability</p>
                </div>
                <button onClick={() => setLocationOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors shrink-0">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 min-h-0 p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
                
                {/* Manual Search Bar */}
                <div className="relative flex items-center shrink-0">
                  <Search size={18} className="absolute left-3 text-zinc-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleManualSearch}
                    placeholder="Search for area, street (Press Enter)" 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-10 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                  {isSearching && <Loader2 size={16} className="absolute right-3 text-brand-primary animate-spin" />}
                </div>

                {/* Auto-Detect GPS Button */}
                <button onClick={locateUser} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-left transition-colors group shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Navigation size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-600">Use current location</h4>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">Using GPS to locate you</p>
                  </div>
                </button>

                <hr className="border-zinc-100 shrink-0" />

                {/* Interactive Map */}
                <div className="flex flex-col gap-2 shrink-0 h-full">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Or Pin Point on Map</h4>
                  
                  <div className="relative w-full flex-1 min-h-[220px] md:min-h-[280px] bg-[#e5e3df] rounded-2xl overflow-hidden border border-zinc-200 cursor-crosshair">
                    <div className="w-full h-full absolute inset-0 z-0">
                      <MapContainer 
                        center={[mapPosition.lat, mapPosition.lng]} 
                        zoom={16} 
                        zoomControl={false} 
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater center={mapPosition} />
                        <MapCenterTracker setPosition={setMapPosition} />
                      </MapContainer>
                    </div>
                    
                    {/* Fixed Center Pin Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="relative -top-6 flex flex-col items-center animate-bounce">
                         <div className="bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg mb-1">
                            Order Here
                         </div>
                         <MapIcon size={36} className="text-brand-primary drop-shadow-xl fill-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 text-center mt-1 pb-2">Drag the map to pinpoint your exact location</p>
                </div>
              </div>

              {/* Confirm Button - Guaranteed to stay locked to the bottom */}
              <div className="p-4 bg-white border-t border-zinc-100 mt-auto shrink-0">
                <button 
                  onClick={handleConfirmLocation}
                  disabled={isConfirming}
                  className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-brand-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isConfirming ? <Loader2 size={18} className="animate-spin" /> : "Confirm Location"}
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}