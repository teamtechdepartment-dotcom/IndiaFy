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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const [adminOpen, setAdminOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const adminRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

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

  const admin = {
    name: "Aamir Farid",
    role: "Product Admin",
    email: "admin@graphura.com",
    lastLogin: "02 Feb 2026 • 12:40 AM",
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Payment Successful",
      message: "Order #1245 payment completed",
      time: "2 min ago",
      unread: true,
      route: "/admin/orders/1245",
      icon: <CheckCircle size={16} className="text-green-600" />,
    },
    {
      id: 2,
      title: "Low Stock Alert",
      message: "Onyx / M stock is low",
      time: "1 hour ago",
      unread: true,
      route: "/admin/inventory",
      icon: <AlertTriangle size={16} className="text-orange-500" />,
    },
    {
      id: 3,
      title: "New Customer",
      message: "Ayesha Khan registered",
      time: "Yesterday",
      unread: false,
      route: "/admin/customers",
      icon: <Users size={16} className="text-blue-600" />,
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
      label: "Order #1245",
      icon: <ShoppingCart size={16} />,
      route: "/admin/orders/1245",
    },
    {
      type: "Product",
      label: "Silk Oversized Blazer",
      icon: <Package size={16} />,
      route: "/admin/products/1",
    },
    {
      type: "Customer",
      label: "Ayesha Khan",
      icon: <Users size={16} />,
      route: "/admin/customers/23",
    },
  ];

  const filteredResults = searchData.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleLogout = () => {
    alert("Logged out successfully!");
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b">
        <div className="h-16 px-4 sm:px-8 flex items-center justify-between gap-3">
          {/* Search */}
          <div
            className="relative hidden sm:block ml-6 sm:ml-8 md:ml-10"
            ref={searchRef}
          >
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search orders, products, customers..."
              className="pl-10 pr-4 py-2 text-sm rounded-xl border bg-gray-50
              focus:bg-white focus:ring-2 focus:ring-black outline-none w-72 md:w-80"
            />

            {searchOpen && query && (
              <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-xl z-50">
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
                      hover:bg-gray-100 cursor-pointer"
                    >
                      {item.icon}
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    No results found
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <button
              onClick={() => navigate("/admin/coupons")}
              className="icon-btn text-blue-600 hover:bg-blue-50"
            >
              <TicketPercent className="icon-svg" />
            </button>

            <button
              onClick={() => navigate("/admin/whatsapp")}
              className="icon-btn text-green-600 hover:bg-green-50"
            >
              <MessageCircle className="icon-svg" />
            </button>

            {/* Notifications */}
            <div
              className="relative flex items-center justify-center"
              ref={notifRef}
            >
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="icon-btn"
              >
                <Bell className="icon-svg" />
                {unreadCount > 0 && <span className="notif-dot" />}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white border rounded-xl shadow-xl">
                  <div className="flex justify-between items-center px-4 py-3 border-b">
                    <span className="font-semibold">Notifications</span>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.route)}
                      className={`flex gap-3 px-4 py-3 text-sm cursor-pointer
                      hover:bg-gray-100 ${n.unread ? "bg-gray-50" : ""}`}
                    >
                      {n.icon}
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ADMIN */}
            <div
              ref={adminRef}
              className="relative flex items-center gap-3 pl-3 sm:pl-4 border-l"
            >
              <div
                onClick={() => setAdminOpen(!adminOpen)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow">
                  A
                </div>
                <ChevronDown size={16} />
              </div>

              {adminOpen && (
                <div className="absolute right-0 top-12 w-64 sm:w-72 bg-white border rounded-xl shadow-xl">
                  <div className="p-4 border-b">
                    <p className="font-semibold">{admin.name}</p>
                    <p className="text-sm text-gray-500">{admin.role}</p>
                    <p className="text-xs text-gray-400">{admin.email}</p>
                  </div>

                  <div className="p-3 space-y-1 text-sm">
                    <div
                      onClick={() => navigate("/admin/profile")}
                      className="flex gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <User size={16} /> View Profile
                    </div>

                    <div className="flex gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <Settings size={16} /> Settings
                    </div>

                    <div
                      onClick={handleLogout}
                      className="flex gap-2 p-2 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                    >
                      <LogOut size={16} /> Logout
                    </div>
                  </div>

                  <div className="px-4 py-2 text-xs text-gray-400 border-t">
                    Last login: {admin.lastLogin}
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
}

.icon-svg {
  width: 22px !important;
  height: 22px !important;
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
}

@media (min-width: 641px) and (max-width: 1024px) {

  header input {
    width: 320px !important;
    max-width: 320px !important;
  }

  header .flex.items-center.gap-2 {
    gap: 16px !important;
  }

}
      `}</style>
    </>
  );
}
