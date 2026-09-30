import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAdminAuthStore } from "../../store/adminAuthStore";

const SupportWorkspaceLayout = () => {
  const { user, logout } = useAdminAuthStore();

  return (
    <div className="flex flex-col h-screen w-full bg-[#f1f2f4] overflow-hidden">
      {/* Top Navigation */}
      <header className="h-14 bg-[#065F46] text-white flex items-center justify-between px-4 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-6">
          <Link to="/support-workspace" className="text-lg font-bold tracking-wide">
            IndiaFy Support
          </Link>
          <div className="hidden md:flex items-center space-x-4 text-sm opacity-90">
            <span>Status: <span className="text-green-300 font-medium">● Available</span></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="hidden md:block">
            {user?.firstName} {user?.lastName} ({user?.role})
          </div>
          <button 
            onClick={() => logout()} 
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            Logout
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
