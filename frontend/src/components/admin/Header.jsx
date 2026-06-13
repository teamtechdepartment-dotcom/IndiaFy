import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  MessageCircle,
  ChevronDown,
  LogOut,
  User,
  Settings,
  CheckCircle,
  AlertTriangle,
  Package,
  ShoppingCart,
  Users,
  TicketPercent,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import axiosInstance from "../../utils/axiosInstance";
import { ArrowLeft } from "lucide-react";
import ExitAdminModal from "./ExitAdminModal";

export default function Header() {
  const navigate = useNavigate();
  const { user: admin, logout: logoutAdmin } = useAdminAuthStore();

  const [adminOpen, setAdminOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [healthStatus, setHealthStatus] = useState("Online");

  const adminRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Check health status on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await axiosInstance.get("/admin/management/health");
        setHealthStatus("Online");
      } catch (err) {
        setHealthStatus("Offline");
      }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (adminRef.current && !adminRef.current.contains(e.target))
        setAdminOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Application Pending",
      message: "TechHaven Electronics waiting for review",
      time: "5 min ago",
      unread: true,
      route: "/admin/pending-applications",
      icon: <CheckCircle size={16} className="text-[#10B981]" />,
    },
    {
      id: 2,
      title: "Low Inventory Alert",
      message: "Grains - 5 units left in warehouse",
      time: "1 hour ago",
      unread: true,
      route: "/admin/inventory",
      icon: <AlertTriangle size={16} className="text-[#EF4444]" />,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationClick = (id, route) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    setNotifOpen(false);
    navigate(route);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const searchData = [
    {
      type: "Order",
      label: "Active orders ledger",
      icon: <ShoppingCart size={16} />,
      route: "/admin/orders",
    },
    {
      type: "Products",
      label: "Browse inventory catalog",
      icon: <Package size={16} />,
      route: "/admin/products",
    },
    {
      type: "Customer",
      label: "Manage customer profiles",
      icon: <Users size={16} />,
      route: "/admin/customers",
    },
  ];

  const filteredResults = searchData.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logoutAdmin();
      navigate("/admin/login");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md text-slate-800 border-b border-slate-200/80 shadow-sm">
        <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-3">
          
          {/* Health check status */}
          <div className="flex items-center gap-2 text-xs font-bold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full select-none">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${healthStatus === "Online" ? "bg-[#10B981]" : "bg-[#EF4444]"}`}></div>
            <span className="text-[#10B981] uppercase tracking-wider">System: {healthStatus}</span>
          </div>

          {/* Search bar */}
          <div
            className="relative hidden md:block ml-4"
            ref={searchRef}
          >
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search sections..."
              className="pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400
              focus:bg-white focus:text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-72 md:w-80 transition-all duration-300"
            />

            {searchOpen && query && (
              <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                {filteredResults.length ? (
                  filteredResults.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        navigate(item.route);
                        setSearchOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm
                      hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none"
                    >
                      <span className="text-[#10B981]">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-800">{item.label}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">{item.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-400">
                    No results found
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="icon-btn text-[#10B981] hover:bg-slate-100"
              title="Dashboard"
            >
              <Activity className="icon-svg" />
            </button>

            {/* Notifications */}
            <div
              className="relative flex items-center justify-center"
              ref={notifRef}
            >
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="icon-btn text-slate-500 hover:bg-slate-100"
              >
                <Bell className="icon-svg" />
                {unreadCount > 0 && <span className="notif-dot" />}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <span className="font-semibold text-slate-800">Notifications</span>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#10B981] hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.route)}
                      className={`flex gap-3 px-4 py-3 text-sm cursor-pointer border-b border-slate-100 last:border-none
                      hover:bg-slate-50 ${n.unread ? "bg-slate-50/50" : ""}`}
                    >
                      {n.icon}
                      <div>
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500">{n.message}</p>
                        <p className="text-[10px] text-[#10B981] font-bold mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div
              ref={adminRef}
              className="relative flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200"
            >
              <div
                onClick={() => setAdminOpen(!adminOpen)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-90 select-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-emerald-400 to-[#10B981] text-white flex items-center justify-center font-bold shadow-md">
                  {admin?.firstName?.[0]?.toUpperCase() || "A"}
                </div>
                <ChevronDown size={16} className="text-[#10B981]" />
              </div>

              {adminOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-150 bg-slate-50">
                    <p className="font-bold text-slate-800">{admin?.firstName} {admin?.lastName}</p>
                    <p className="text-xs text-[#10B981] uppercase font-bold tracking-widest">{admin?.role}</p>
                    <p className="text-xs text-slate-500">{admin?.email}</p>
                  </div>

                  <div className="p-2 space-y-1 text-sm">
                    <div
                      onClick={() => { navigate("/admin/profiles"); setAdminOpen(false); }}
                      className="flex gap-2 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-650 hover:text-slate-900"
                    >
                      <User size={16} className="text-[#10B981]" /> Profile Settings
                    </div>

                    <div
                      onClick={() => { navigate("/admin/settings"); setAdminOpen(false); }}
                      className="flex gap-2 p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-650 hover:text-slate-900"
                    >
                      <Settings size={16} className="text-[#10B981]" /> Global config
                    </div>

                    <div
                      onClick={() => { setShowExitModal(true); setAdminOpen(false); }}
                      className="flex gap-2 p-2.5 hover:bg-emerald-50 text-emerald-600 rounded-lg cursor-pointer font-bold"
                    >
                      <ArrowLeft size={16} /> Exit Admin Panel
                    </div>

                    <div
                      onClick={handleLogout}
                      className="flex gap-2 p-2.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer font-bold"
                    >
                      <LogOut size={16} /> Logout
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <style>{`
.icon-btn {
  width: 40px !important;
  height: 40px !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s;
}

.icon-svg {
  width: 20px !important;
  height: 20px !important;
}

.notif-dot {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 7px;
  height: 7px;
  background: #EF4444;
  border-radius: 50%;
  box-shadow: 0 0 8px #EF4444;
}
      `}</style>
      <ExitAdminModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />
    </>
  );
}
