
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Package, 
  Clock, 
  Boxes, 
  Wallet, 
  Settings, 
  X, 
  Video,
  LogOut
} from "lucide-react";

const menus = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
  { id: "orders", label: "Orders Inbox", icon: Package, path: "/orders" },
  { id: "live", label: "Live Orders", icon: Clock, path: "/live" },
  { id: "video", label: "Video Verification", icon: Video, path: "/video-verification" },
  { id: "history", label: "Order History", icon: Boxes, path: "/history" },
  { id: "products", label: "Products", icon: Package, path: "/products" },
  { id: "inventory", label: "Inventory", icon: Boxes, path: "/inventory" },
  { id: "finance", label: "Finance", icon: Wallet, path: "/finance" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];
import { useAuthStore } from "../store/authStore";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true }); 
    if (sidebarOpen) setSidebarOpen(false);
  };

  const NavItems = ({ closeMobile }) => (
    <nav className="flex-1 space-y-1">
      {menus.map((menu) => (
        <NavLink
          key={menu.id}
          to={menu.path}
          onClick={() => {
            if (closeMobile) setSidebarOpen(false);
          }}
          className={({ isActive }) => `
            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
            ${isActive 
              ? "bg-slate-900 text-white shadow-lg shadow-slate-300/50 scale-[1.02]" 
              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)]"
            }
          `}
        >
          <menu.icon size={18} />
          {menu.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      {/* Layered double inner shadow on the right edge for deep shading */}
      <aside className="w-64 bg-white hidden md:flex flex-col sticky top-0 h-screen relative z-10 border-r border-slate-200 shadow-[inset_-25px_0_30px_-15px_rgba(0,0,0,0.08),inset_-50px_0_50px_-25px_rgba(0,0,0,0.04)]">
        
        {/* Inner shadow at the bottom of the header */}
        <div className="p-6 border-b border-slate-100 shadow-[inset_0_-20px_20px_-20px_rgba(0,0,0,0.08)] relative z-10">
          <div className="flex items-center gap-3">
            <img 
              src="/Images/logo.png" 
              alt="Indiafy Logo" 
              className="h-10 w-auto object-contain drop-shadow-sm" 
            />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Seller Portal</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
           <NavItems closeMobile={false} />
        </div>

        {/* Inner shadow at the top of the footer */}
        <div className="p-4 border-t border-slate-100 shadow-[inset_0_20px_20px_-20px_rgba(0,0,0,0.08)] relative z-10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)] transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* --- MOBILE DROPDOWN SIDEBAR --- */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Layered double inner shadow on the bottom edge for mobile */}
          <aside 
            className="absolute top-0 left-0 w-full bg-white max-h-[85vh] flex flex-col rounded-b-3xl z-10 animate-in fade-in slide-in-from-top-4 duration-200 shadow-[inset_0_-25px_30px_-15px_rgba(0,0,0,0.08),inset_0_-50px_50px_-25px_rgba(0,0,0,0.04)]"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Inner shadow at the bottom of the header */}
            <div className="p-4 flex justify-between items-center border-b border-slate-100 shadow-[inset_0_-20px_20px_-20px_rgba(0,0,0,0.08)] relative z-10">
              <div className="flex items-center gap-2">
                <img 
                  src="/Images/logo.png" 
                  alt="Indiafy Logo" 
                  className="h-8 w-auto object-contain drop-shadow-sm" 
                />
              </div>
              <button 
                onClick={() => setSidebarOpen(false)} 
                className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-900 transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <NavItems closeMobile={true} />
              
              {/* Inner shadow at the top of the footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 shadow-[inset_0_20px_20px_-20px_rgba(0,0,0,0.08)] relative z-10">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)] transition-all"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}