import { Home, LayoutGrid, Package, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home", path: "/quick-commerce" },
  { id: "categories", icon: LayoutGrid, label: "Categories", path: "/quick-commerce" },
  { id: "orders", icon: Package, label: "Orders", path: "/order-history" },
  { id: "profile", icon: User, label: "Profile", path: "/profile" },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-zinc-100 safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-[480px] mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path && item.id === "home";
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all active:scale-90 ${
                isActive
                  ? "text-brand-accent"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[9px] font-bold ${isActive ? "text-brand-accent" : "text-zinc-400"}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-brand-accent mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* iOS safe area padding */}
      <style dangerouslySetInnerHTML={{ __html: `
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}} />
    </nav>
  );
}
