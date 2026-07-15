import { useState, useRef, useEffect } from "react";
import {
  Bell, Search, ChevronDown, LogOut, User, Settings,
  CheckCircle, AlertTriangle, Package, ShoppingCart,
  Users, Activity, ArrowLeft, X, Sun, Moon, Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import axiosInstance from "../../utils/axiosInstance";
import ExitAdminModal from "./ExitAdminModal";
import { NavbarLogo } from "../branding/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const navigate = useNavigate();
  const { user: admin, logout: logoutAdmin } = useAdminAuthStore();

  const [adminOpen, setAdminOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchModal, setMobileSearchModal] = useState(false);
  const [query, setQuery] = useState("");
  const [healthStatus, setHealthStatus] = useState("Online");
  const [isDark, setIsDark] = useState(false);

  const adminRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = () => {
    const nextTheme = !isDark;
    document.documentElement.classList.toggle("dark", nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
    setIsDark(nextTheme);
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axiosInstance.get("/admin/management/health");
        setHealthStatus("Online");
      } catch (_err) {
        setHealthStatus("Offline");
      }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (adminRef.current && !adminRef.current.contains(e.target)) setAdminOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (mobileSearchModal || (notifOpen && window.innerWidth < 768) || (adminOpen && window.innerWidth < 768)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileSearchModal, notifOpen, adminOpen]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Application Pending", message: "TechHaven Electronics waiting for review", time: "5 min ago", unread: true, route: "/admin/pending-applications", icon: <CheckCircle size={15} style={{ color: "#10B981" }} /> },
    { id: 2, title: "Low Inventory Alert", message: "Grains — 5 units left in warehouse", time: "1 hour ago", unread: true, route: "/admin/inventory", icon: <AlertTriangle size={15} style={{ color: "#EF4444" }} /> },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationClick = (id, route) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    setNotifOpen(false);
    navigate(route);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const searchData = [
    { type: "Order", label: "Active orders ledger", icon: <ShoppingCart size={15} />, route: "/admin/orders" },
    { type: "Products", label: "Browse inventory catalog", icon: <Package size={15} />, route: "/admin/products" },
    { type: "Customer", label: "Manage customer profiles", icon: <Users size={15} />, route: "/admin/customers" },
    { type: "Analytics", label: "BI Analytics & Growth", icon: <Activity size={15} />, route: "/admin/analytics" },
    { type: "Settings", label: "Global System Configuration", icon: <Settings size={15} />, route: "/admin/settings" },
  ];

  const filteredResults = searchData.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.type.toLowerCase().includes(query.toLowerCase())
  );

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logoutAdmin();
      navigate("/admin/login");
    }
  };

  const avatarInitial = (admin?.firstName?.[0] ?? "A").toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 p-4 pb-2 bg-transparent w-full">
        <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-4 w-full rounded-[24px] border border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl shadow-lg max-w-[1920px] mx-auto">

          {/* Left: Mobile Toggle, Logo & Health Status */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("toggle-admin-sidebar"))}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center shrink-0 min-w-[36px] min-h-[36px] select-none"
              aria-label="Toggle navigation menu"
            >
              <Menu size={16} />
            </button>

            {/* Logo for mobile headers when sidebar is hidden */}
            <div className="lg:hidden flex items-center select-none">
              <NavbarLogo />
            </div>

            {/* System Health Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${healthStatus === "Online" ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className={`font-black ${healthStatus === "Online" ? "text-emerald-500" : "text-red-500"}`}>
                SYSTEM: 99.99% HEALTHY
              </span>
            </div>
          </div>

          {/* Center Search (Vite/Tailwind glass design) */}
          <div className="relative hidden md:block flex-1 max-w-md mx-auto" ref={searchRef}>
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              placeholder="Search sections (Press ⌘K)"
              className="w-full pl-10 pr-12 py-2.5 text-xs font-semibold rounded-2xl bg-white/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 text-slate-950 dark:text-slate-100 transition-all focus:outline-none focus:border-[#2874F0] focus:ring-4 focus:ring-[#2874F0]/10 dark:focus:ring-orange-500/10 placeholder-slate-400 dark:placeholder-slate-600"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 select-none bg-slate-100/40 dark:bg-slate-950/40">
              ⌘K
            </span>

            {/* Search Results Popover */}
            <AnimatePresence>
              {searchOpen && query && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute mt-2 w-full rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-xl overflow-hidden z-50 p-1"
                >
                  {filteredResults.length ? (
                    filteredResults.map((item, i) => (
                      <div key={i}
                        onClick={() => { navigate(item.route); setSearchOpen(false); setQuery(""); }}
                        className="flex items-center gap-3.5 px-4 py-3 text-xs rounded-xl cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <span className="text-[#2874F0] dark:text-[#FB641B]">{item.icon}</span>
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">{item.label}</p>
                          <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">{item.type}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-3.5 text-xs font-semibold text-slate-400 dark:text-slate-600">No sections found.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Actions, Theme, Notifications & User Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchModal(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open search"
            >
              <Search size={16} />
            </button>

            {/* Quick Action Dashboard Shortcut */}
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="w-10 h-10 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 text-[#2874F0] dark:text-[#FB641B] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dashboard Home"
            >
              <Activity size={16} />
            </button>

            {/* Live Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              type="button"
              aria-label="Toggle layout theme"
              className="w-10 h-10 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />}
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#2874F0] dark:bg-[#FB641B] shadow-glow" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    {/* Mobile overlay backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setNotifOpen(false)}
                      className="md:hidden fixed inset-0 z-40"
                      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="fixed md:absolute bottom-0 md:bottom-auto right-0 md:top-12 w-full md:w-80 max-h-[85vh] md:max-h-none rounded-t-3xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col z-50 p-1"
                    >
                      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/30">
                        <div className="flex items-center gap-2">
                          <Bell size={14} className="text-[#2874F0] dark:text-[#FB641B]" />
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-250">Notifications ({unreadCount})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-wider text-[#2874F0] dark:text-[#FB641B] hover:underline cursor-pointer bg-transparent border-0">Mark read</button>
                          <button onClick={() => setNotifOpen(false)} className="md:hidden p-1 text-slate-400"><X size={18} /></button>
                        </div>
                      </div>

                      <div className="overflow-y-auto admin-scrollbar max-h-[60vh] md:max-h-80">
                        {notifications.map((n) => (
                          <div key={n.id}
                            onClick={() => handleNotificationClick(n.id, n.route)}
                            className={`flex gap-3 px-4 py-3.5 text-xs cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/20 ${n.unread ? "bg-[#2874F0]/3 dark:bg-orange-500/3" : ""}`}
                          >
                            <div className="mt-0.5 shrink-0">{n.icon}</div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                              <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">{n.message}</p>
                              <p className="text-[9px] font-extrabold text-[#2874F0] dark:text-[#FB641B] mt-1.5">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div ref={adminRef} className="relative flex items-center pl-2 sm:pl-2.5 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="flex items-center gap-1 min-w-[40px] min-h-[40px] justify-center select-none rounded-2xl cursor-pointer"
                aria-label="Open profile menu"
              >
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs text-white bg-gradient-to-br from-[#2874F0] to-indigo-600 dark:from-[#FB641B] dark:to-orange-600 shadow-md">
                  {avatarInitial}
                </div>
                <ChevronDown size={12} className="hidden sm:inline text-slate-400 dark:text-slate-650" />
              </button>

              <AnimatePresence>
                {adminOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setAdminOpen(false)}
                      className="md:hidden fixed inset-0 z-40"
                      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="fixed md:absolute bottom-0 md:bottom-auto right-0 md:top-12 w-full md:w-60 rounded-t-3xl md:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 p-1"
                    >
                      <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/30 flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                            {admin?.firstName ?? "Admin"} {admin?.lastName ?? ""}
                          </p>
                          <p className="text-[9px] font-black tracking-widest uppercase mt-0.5 text-[#2874F0] dark:text-[#FB641B]">
                            {admin?.role ?? "SUPER ADMIN"}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {admin?.email ?? "admin@indiafy.com"}
                          </p>
                        </div>
                        <button onClick={() => setAdminOpen(false)} className="md:hidden p-1 text-slate-400"><X size={18} /></button>
                      </div>

                      <div className="space-y-0.5">
                        {[
                          { label: "Profile Settings", icon: User, route: "/admin/profiles" },
                          { label: "Global System Config", icon: Settings, route: "/admin/settings" },
                        ].map(({ label, icon: Icon, route }) => (
                          <button key={label}
                            onClick={() => { navigate(route); setAdminOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-left cursor-pointer border-0"
                          >
                            <Icon size={14} className="text-[#2874F0] dark:text-[#FB641B]" />
                            {label}
                          </button>
                        ))}

                        <button
                          onClick={() => { setShowExitModal(true); setAdminOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#2874F0] dark:text-[#FB641B] hover:bg-[#2874F0]/8 dark:hover:bg-orange-500/8 transition-colors text-left cursor-pointer border-0"
                        >
                          <ArrowLeft size={14} />
                          Back to Website
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer border-0"
                        >
                          <LogOut size={14} />
                          Secure Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {mobileSearchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col p-5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Search size={17} className="text-[#2874F0] dark:text-[#FB641B]" /> Search Enterprise OS
              </h3>
              <button
                onClick={() => { setMobileSearchModal(false); setQuery(""); }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-500 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative mb-5">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections, products, or customers..."
                className="w-full rounded-2xl py-3.5 pl-4 pr-10 text-sm font-semibold outline-none bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredResults.map((item, i) => (
                <div key={i}
                  onClick={() => { navigate(item.route); setMobileSearchModal(false); setQuery(""); }}
                  className="flex items-center gap-3 rounded-2xl p-4 cursor-pointer transition-all border border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                >
                  <span className="p-2 rounded-xl text-[#2874F0] dark:text-[#FB641B] bg-slate-100 dark:bg-slate-950">{item.icon}</span>
                  <div>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest mt-0.5 text-slate-450 dark:text-slate-500">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExitAdminModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />
    </>
  );
}
