import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart2,
  Settings,
  X,
  LogOut,
  Store,
  Layers,
  Percent,
  FolderOpen,
  LifeBuoy,
  FileSpreadsheet,
  ShieldAlert,
  ChevronDown,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import { ArrowLeft } from "lucide-react";
import ExitAdminModal from "./ExitAdminModal";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const logoutAdmin = useAdminAuthStore((state) => state.logout);

  // Group sections for enterprise structural hierarchy
  const groups = [
    {
      title: "Marketplace",
      items: [
        { name: "Active Sellers", icon: Store, path: "/admin/active-sellers" },
        { name: "Pending Review", icon: ShieldAlert, path: "/admin/pending-applications" },
        { name: "Store Directory", icon: Store, path: "/admin/stores" },
        { name: "Products List", icon: Package, path: "/admin/products" },
        { name: "Nested Categories", icon: Layers, path: "/admin/categories" },
      ],
    },
    {
      title: "Commerce & Users",
      items: [
        { name: "Orders Manager", icon: ShoppingBag, path: "/admin/orders" },
        { name: "Payments & Ledger", icon: FileSpreadsheet, path: "/admin/payments" },
        { name: "Customer Directory", icon: Users, path: "/admin/customers" },
      ],
    },
    {
      title: "Support & Audit",
      items: [
        { name: "Help Desk Inbox", icon: LifeBuoy, path: "/admin/tickets" },
        { name: "Role Policies", icon: Settings, path: "/admin/roles" },
        { name: "Audit Trail logs", icon: FolderOpen, path: "/admin/audit-logs" },
      ],
    },
  ];

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out from the Admin Panel?")) {
      await logoutAdmin();
      navigate("/admin/login");
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="
          lg:hidden
          fixed top-3 left-3 sm:top-4 sm:left-4
          z-50
          bg-white text-[#10B981] border border-slate-200
          p-2.5 rounded-xl
          shadow-lg
        "
      >
        ☰
      </button>

      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:sticky
          top-0 left-0
          z-50
          h-screen
          w-64 sm:w-64
          bg-white text-slate-700
          border-r border-slate-200/80
          flex flex-col
          px-4
          py-5
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div
            onClick={() => {
              navigate("/admin/dashboard");
              setOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-[#10B981] flex items-center justify-center font-bold text-white text-sm">
              I
            </div>
            <span className="font-display font-black text-slate-800 text-lg tracking-wider">
              INDIAFY <span className="text-[#10B981] text-xs font-bold block -mt-1 tracking-widest">ENTERPRISE</span>
            </span>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-900"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Back to Website Button */}
        <div className="mb-4 px-1">
          <button
            onClick={() => setShowExitModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all duration-200"
          >
            <ArrowLeft size={16} />
            Back to Website
          </button>
        </div>

        {/* Navigation scroll box */}
        <nav className="flex-1 overflow-y-auto no-scrollbar space-y-5 px-1 pr-0 mt-2">
          {/* Dashboard and Analytics (Standalones) */}
          <div className="space-y-1">
            <NavLink
              to="/admin/dashboard"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-[#10B981] text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <LayoutDashboard size={18} />
              Command Center
            </NavLink>
            <NavLink
              to="/admin/analytics"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-[#10B981] text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <BarChart2 size={18} />
              BI Analytics
            </NavLink>
          </div>

          {/* Grouped menus */}
          {groups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase px-3 mb-1">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-slate-100 text-[#10B981] border-l-4 border-[#10B981] pl-2"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-slate-200 pt-4 mt-3">
          <NavLink
            to="/admin/settings"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? "bg-slate-100 text-[#10B981] border-l-4 border-[#10B981] pl-2"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`
            }
          >
            <Settings size={18} />
            System Settings
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 mt-1 text-left"
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </aside>
      <ExitAdminModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />
    </>
  );
}
