import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart2,
  Settings, X, LogOut, Store, Layers, FileSpreadsheet,
  ShieldAlert, FolderOpen, LifeBuoy, ArrowLeft, Menu, ChevronRight,
  Sun, Moon, TicketPercent, MessageSquare, Boxes
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import ExitAdminModal from "./ExitAdminModal";
import { SidebarLogo } from "../branding/BrandLogo";

// ─── Navigation Groups ──────────────────────────────────────
const standaloneLinks = [
  { name: "Command Center", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "BI Analytics", icon: BarChart2, path: "/admin/analytics" },
];

const groups = [
  {
    title: "Marketplace Governance",
    items: [
      { name: "Active Sellers", icon: Store, path: "/admin/active-sellers" },
      { name: "Pending Review", icon: ShieldAlert, path: "/admin/pending-applications" },
      { name: "Store Directory", icon: Store, path: "/admin/stores" },
      { name: "Products List", icon: Package, path: "/admin/products" },
      { name: "Nested Categories", icon: Layers, path: "/admin/categories" },
      { name: "Warehouse Inventory", icon: Boxes, path: "/admin/inventory" },
    ],
  },
  {
    title: "Commerce & Users",
    items: [
      { name: "Orders Manager", icon: ShoppingBag, path: "/admin/orders" },
      { name: "Payments & Ledger", icon: FileSpreadsheet, path: "/admin/payments" },
      { name: "Customer Directory", icon: Users, path: "/admin/customers" },
      { name: "Coupons & Discounts", icon: TicketPercent, path: "/admin/coupons" },
      { name: "WhatsApp Automation", icon: MessageSquare, path: "/admin/whatsapp-automation" },
    ],
  },
  {
    title: "Support & Audit",
    items: [
      { name: "Help Desk Inbox", icon: LifeBuoy, path: "/admin/tickets" },
      { name: "Role Policies", icon: Settings, path: "/admin/roles" },
      { name: "Audit Trail Logs", icon: FolderOpen, path: "/admin/audit-logs" },
    ],
  },
];

// ─── Reusable Nav Item ──────────────────────────────────────
function NavItem({ to, icon: Icon, name, onClick, isStandalone = false }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-250 min-h-[44px] relative overflow-hidden ${
          isActive
            ? "text-[#2874F0] dark:text-[#FB641B] font-extrabold shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator background with theme glow */}
          {isActive && (
            <motion.div
              layoutId={isStandalone ? "standalone-indicator" : undefined}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-orange-500/10 dark:to-amber-500/5 border border-blue-500/20 dark:border-orange-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            />
          )}
          {/* Hover highlight */}
          <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-slate-200/40 dark:group-hover:bg-white/[0.04] transition-colors duration-200" />

          {/* Icon */}
          <Icon
            size={16}
            className={`shrink-0 relative z-10 transition-colors duration-200 ${
              isActive ? "text-[#2874F0] dark:text-[#FB641B]" : "text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400"
            }`}
          />
          {/* Label */}
          <span className="relative z-10 truncate font-black">{name}</span>

          {/* Active chevron */}
          {isActive && (
            <ChevronRight size={12} className="ml-auto relative z-10 text-[#2874F0] dark:text-[#FB641B]" />
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const logoutAdmin = useAdminAuthStore((state) => state.logout);

  useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev);
    const handleClose = () => setOpen(false);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    window.addEventListener("close-admin-sidebar", handleClose);
    return () => {
      window.removeEventListener("toggle-admin-sidebar", handleToggle);
      window.removeEventListener("close-admin-sidebar", handleClose);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out from the Admin Panel?")) {
      await logoutAdmin();
      navigate("/admin/login");
    }
  };

  const closeSidebar = () => setOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-xl rounded-[28px] overflow-hidden">
      {/* Logo Header */}
      <div 
        className="flex items-center justify-between px-5 py-5 border-b border-slate-200/50 dark:border-slate-800/30"
      >
        <button
          onClick={() => { navigate("/admin/dashboard"); closeSidebar(); }}
          className="flex items-center gap-3 cursor-pointer group"
          aria-label="Go to dashboard"
        >
          <SidebarLogo />
        </button>

        {/* Mobile close button */}
        <button
          className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{ color: "#475569" }}
          onClick={closeSidebar}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Back to Website Button */}
      <div className="px-4 py-3 border-b border-slate-200/40 dark:border-slate-800/20">
        <button
          onClick={() => { setShowExitModal(true); closeSidebar(); }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 min-h-[44px] bg-[#2874F0]/8 dark:bg-orange-500/8 border border-[#2874F0]/15 dark:border-orange-500/15 text-[#2874F0] dark:text-[#FB641B] hover:bg-[#2874F0]/15 dark:hover:bg-orange-500/15 group cursor-pointer"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Website
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto admin-scrollbar px-3.5 py-4 space-y-6">
        {/* Standalone Items */}
        <div className="space-y-1">
          {standaloneLinks.map((item) => (
            <NavItem key={item.path} to={item.path} icon={item.icon} name={item.name} onClick={closeSidebar} isStandalone />
          ))}
        </div>

        {/* Grouped Items */}
        {groups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <p className="text-[9px] font-black tracking-[0.22em] uppercase px-3.5 mb-1.5 text-slate-400 dark:text-slate-500">
              {group.title}
            </p>
            {group.items.map((item) => (
              <NavItem key={item.name} to={item.path} icon={item.icon} name={item.name} onClick={closeSidebar} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="px-4 pb-5 pt-3 space-y-1.5 border-t border-slate-200/50 dark:border-slate-800/30">
        <NavItem to="/admin/settings" icon={Settings} name="System Settings" onClick={closeSidebar} />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-250 min-h-[44px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200/30 dark:hover:border-red-900/30 group cursor-pointer"
        >
          <LogOut size={16} className="shrink-0 text-red-400 group-hover:text-red-500" />
          Secure Logout
        </button>
      </div>
    </div>
  );

  return (
    <>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — Mobile (animated container) */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 z-50 h-screen w-72 lg:hidden flex flex-col p-4 bg-transparent"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar — Desktop (sticky column) */}
      <aside
        className="hidden lg:flex flex-col w-68 shrink-0 sticky top-0 h-screen p-4 bg-transparent z-40"
      >
        <SidebarContent />
      </aside>

      <ExitAdminModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />
    </>
  );
}
