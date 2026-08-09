/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse,
  Wallet,
  History,
  Bell,
  Settings,
  Activity,
  ChevronLeft,
  Menu,
  X,
  Store,
  Zap,
  Truck,
  Home,
  Cpu,
  Heart,
  LogOut,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useSellerAuthStore } from "../store/sellerAuthStore";
import { useAuthStore } from "../store/authStore";
import { useNodeStore } from "../store/nodeStore";
import { useSellerSocket } from "../hooks/useSellerSocket";
import { useNotificationStore } from "../store/notificationStore";
import OrderNotificationBadge from "./seller/OrderNotificationBadge";
import NotificationDrawer from "./seller/NotificationDrawer";
import toast from "react-hot-toast";

/* ----------------------------------------------------------
   NODE TYPE → THEME MAPPING
---------------------------------------------------------- */
const NODE_THEMES = {
  LOCAL_RETAIL: {
    accent: "bg-blue-600",
    light: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: Store,
    label: "Local Retail",
  },
  WHOLESALE_B2B: {
    accent: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Truck,
    label: "Wholesale B2B",
  },
  QUICK_COMMERCE: {
    accent: "bg-teal-600",
    light: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    icon: Zap,
    label: "Quick Commerce",
  },
  HOME_ESSENTIALS: {
    accent: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: Home,
    label: "Home Essentials",
  },
  ELECTRONICS: {
    accent: "bg-purple-600",
    light: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: Cpu,
    label: "Electronics",
  },
  PERSONAL_CARE: {
    accent: "bg-rose-500",
    light: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: Heart,
    label: "Personal Care",
  },
};

const DEFAULT_THEME = {
  accent: "bg-slate-900",
  light: "bg-slate-50",
  text: "text-slate-700",
  border: "border-slate-200",
  icon: Store,
  label: "Seller Store",
};

/* ----------------------------------------------------------
   SIDEBAR LINKS
---------------------------------------------------------- */
const SIDEBAR_LINKS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
  { label: "Orders", icon: ShoppingBag, path: "orders" },
  { label: "Live Dispatch", icon: Activity, path: "live" },
  { label: "Products", icon: Package, path: "products" },
  { label: "Inventory", icon: Warehouse, path: "inventory" },
  { label: "Finance", icon: Wallet, path: "finance" },
  { label: "History", icon: History, path: "history" },
  { label: "Notifications", icon: Bell, path: "notifications" },
  { label: "Settings", icon: Settings, path: "settings" },
];

/* ----------------------------------------------------------
   COMPONENT
---------------------------------------------------------- */
export default function DashboardLayout({ storeDetails, activeNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useSellerAuthStore();
  const { logout: logoutCustomer } = useAuthStore();
  const { clearActiveNode, activeNode: fullActiveNode } = useNodeStore();

  const isVerified = fullActiveNode?.isVerified !== false;
  const pathParts = location.pathname.split("/").filter(Boolean);
  // For paths like /seller/dashboard/:nodeId/video-verification/:id
  // the second-to-last segment is "video-verification", not the last (which is the id)
  const currentPathSegment = pathParts[pathParts.length - 1];
  const currentSection = pathParts[pathParts.length - 2]; // e.g., "video-verification"
  // Allow video-verification pages (lock guard would wrongly block them since last segment is an order ID)
  const isVideoVerificationPage = currentSection === "video-verification";


  const activeNodeId = fullActiveNode?._id?.toString();
  const notifCount = useNotificationStore((state) => activeNodeId ? (state.unreadCounts[activeNodeId] || 0) : 0);
  const toggleDrawer = useNotificationStore((state) => state.toggleDrawer);
  const clearBadge = useNotificationStore((state) => state.clearBadge);

  // 🛰️ Connect real-time notification socket with precise nodeId-based room
  useSellerSocket(
    user?._id?.toString(),
    activeNodeId,
    storeDetails?.nodeType
  );

  // Resolve theme from nodeType stored in storeDetails
  const nodeTypeKey = storeDetails?.nodeType || "";
  const theme = NODE_THEMES[nodeTypeKey] || DEFAULT_THEME;
  const NodeIcon = theme.icon;

  const storeName = storeDetails?.name || "Seller Store";
  const storeInitial = storeName.charAt(0).toUpperCase() || "S";
  const displayNodeLabel = activeNode || theme.label;

  const handleLogout = async () => {
    try {
      await Promise.allSettled([
        logout(),
        logoutCustomer()
      ]);
      clearActiveNode();
      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  };

  /* ----------------------------------------------------------
     SIDEBAR CONTENT (shared between mobile + desktop)
  ---------------------------------------------------------- */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* BRAND */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-black text-slate-900 tracking-tight hover:opacity-80 transition-opacity"
        >
          indiafy
        </Link>
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* STORE INFO */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          {storeDetails?.logo ? (
            <img loading="lazy" decoding="async"
              src={storeDetails.logo}
              alt={storeName}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-2xl ${theme.accent} text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm`}
            >
              {storeInitial}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-black text-slate-900 truncate leading-tight">
              {storeName}
            </h2>
            <div
              className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.light} ${theme.text} border ${theme.border}`}
            >
              <NodeIcon size={10} />
              {displayNodeLabel}
            </div>
          </div>
        </div>

        {/* BACK TO HUB */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setSidebarOpen(false);
            navigate("/seller-hub?select=true", { state: { noRedirect: true } });
          }}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer w-full py-1.5 px-2 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          All Nodes (Seller Hub)
        </button>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {SIDEBAR_LINKS.map((item) => {
          const Icon = item.icon;
          const isItemLocked = !isVerified && item.path !== "dashboard";
          return (
            <NavLink
              key={item.path}
              to={isItemLocked ? "#" : item.path}
              end={item.path === "dashboard"}
              onClick={(e) => {
                if (isItemLocked) {
                  e.preventDefault();
                  toast.error(`"${item.label}" features are locked until onboarding approval!`, { id: "locked-tab" });
                  return;
                }
                setSidebarOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all font-semibold text-sm ${
                  isItemLocked
                    ? "text-slate-350 cursor-not-allowed bg-transparent"
                    : isActive
                    ? `${theme.accent} text-white shadow-sm`
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {item.label}
              </span>
              {isItemLocked && <Lock size={12} className="text-slate-450" />}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER ACTION (Log Out) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => {
            logout();
            logoutCustomer();
            setSidebarOpen(false);
            navigate("/seller/login");
          }}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-all border border-transparent hover:border-red-100"
        >
          <span className="flex items-center gap-2.5">
            <LogOut size={16} />
            Log Out
          </span>
        </button>
      </div>

      {/* 🔔 Notification Drawer (portal-like, renders at layout level) */}
      <NotificationDrawer
        onNavigateToOrders={() => {
          if (activeNodeId) clearBadge(activeNodeId);
          navigate("orders");
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased selection:bg-slate-900 selection:text-white">
      {/* -------------------------------------------------------
          DESKTOP SIDEBAR
      ------------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* -------------------------------------------------------
          MOBILE SIDEBAR (Drawer overlay)
      ------------------------------------------------------- */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden transition-opacity"
        />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* -------------------------------------------------------
          MAIN CONTENT AREA
      ------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER (mobile only + breadcrumb) */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/seller-hub?select=true", { state: { noRedirect: true } })}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl transition-all border border-slate-200 shadow-sm cursor-pointer"
              title="Return to Seller Hub"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Seller Hub</span>
            </button>
            <div className="hidden lg:block">
              <h2 className="text-base font-black text-slate-900">
                {storeName}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {displayNodeLabel} Node
              </p>
            </div>
            <div className="lg:hidden">
              <p className="text-sm font-black text-slate-900">{storeName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Node type badge (desktop header) */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${theme.light} ${theme.text} border ${theme.border}`}
            >
              <NodeIcon size={12} />
              {displayNodeLabel}
            </div>

            {/* Store open/close indicator */}
            {storeDetails?.isStoreOpen !== false && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {!isVerified && currentPathSegment !== "dashboard" && !isVideoVerificationPage ? (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-slate-200 p-8 rounded-[2rem] shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-amber-50/50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Lock size={28} className="text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Console Feature Locked</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    Access to this console capability is restricted. Complete business compliance documents submission and wait for administrative node verification approvals.
                  </p>
                </div>
                <button
                  onClick={() => navigate("dashboard")}
                  className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-md text-xs uppercase tracking-wider"
                >
                  Return to Verification Hub
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
