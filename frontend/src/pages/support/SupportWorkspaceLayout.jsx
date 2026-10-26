import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import { useSupportAuthStore } from "../../store/supportAuthStore";
import { LifeBuoy, LogOut, Shield, User } from "lucide-react";

const SupportWorkspaceLayout = () => {
  const adminAuth = useAdminAuthStore();
  const supportAuth = useSupportAuthStore();

  const isSupport = supportAuth.isAuthenticated && supportAuth.user;
  const user = isSupport ? supportAuth.user : adminAuth.user;

  const handleLogout = () => {
    if (isSupport) {
      supportAuth.logout();
    } else {
      adminAuth.logout();
    }
  };

  const displayName = user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Agent";
  const displayRole = isSupport ? (user?.supportRole?.replace("_", " ") || "Support Member") : (user?.role || "Admin");

  return (
    <div className="flex flex-col h-screen w-full bg-[#f1f2f4] overflow-hidden font-sans">
      {/* Top Navigation */}
      <header className="h-14 bg-[#065F46] text-white flex items-center justify-between px-4 sm:px-6 shadow-sm flex-shrink-0 z-20">
        <div className="flex items-center space-x-6">
          <Link to="/support-workspace" className="flex items-center gap-2 text-base sm:text-lg font-black tracking-wide text-white hover:text-emerald-200 transition-colors">
            <LifeBuoy size={20} className="text-emerald-300" />
            <span>IndiaFy Support Desk</span>
          </Link>
          <div className="hidden md:flex items-center space-x-3 text-xs opacity-90">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-800/60 border border-emerald-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-emerald-200">Terminal Active</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 text-xs">
          <div className="flex items-center gap-2 bg-emerald-800/50 px-2.5 py-1 rounded-lg border border-emerald-700/50">
            <User size={13} className="text-emerald-300" />
            <span className="font-bold text-white max-w-[120px] sm:max-w-[180px] truncate">{displayName}</span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.2 bg-emerald-700/80 rounded text-emerald-200">
              {displayRole}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-xs font-bold transition cursor-pointer"
            title="Log out of support workspace"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export default SupportWorkspaceLayout;
