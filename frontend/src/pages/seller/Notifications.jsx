import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  ShieldAlert,
  CheckCircle2,
  Megaphone,
  Check,
  Bell,
  Clock,
  ArrowRight,
  RefreshCw,
  Boxes,
  Wallet,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../../store/orderStore";
import { useProductStore } from "../../store/productStore";
import { useNodeStore } from "../../store/nodeStore";
import { useSellerAuthStore } from "../../store/sellerAuthStore";

/* ----------------------------------------------------------
   STATIC SYSTEM NOTIFICATIONS (always present)
---------------------------------------------------------- */
const SYSTEM_NOTIFICATIONS = [
  {
    id: "sys-1",
    title: "Welcome to Indiafy Seller Hub",
    desc: "Your multi-node commerce environment is active and fully isolated. All products, orders, and analytics are scoped to this specific node.",
    time: "System",
    type: "system",
    unread: false,
    isSystem: true,
  },
];

/* ----------------------------------------------------------
   HELPERS
---------------------------------------------------------- */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const getIcon = (type) => {
  const base =
    "p-3 rounded-2xl border flex items-center justify-center shadow-sm shrink-0";
  switch (type) {
    case "order":
      return (
        <div className={`${base} bg-blue-50 border-blue-100 text-blue-600`}>
          <Package size={20} />
        </div>
      );
    case "payout":
      return (
        <div
          className={`${base} bg-emerald-50 border-emerald-100 text-emerald-600`}
        >
          <Wallet size={20} />
        </div>
      );
    case "alert":
      return (
        <div
          className={`${base} bg-amber-50 border-amber-100 text-amber-600`}
        >
          <ShieldAlert size={20} />
        </div>
      );
    case "low_stock":
      return (
        <div className={`${base} bg-red-50 border-red-100 text-red-500`}>
          <TrendingDown size={20} />
        </div>
      );
    case "system":
      return (
        <div
          className={`${base} bg-purple-50 border-purple-100 text-purple-600`}
        >
          <Megaphone size={20} />
        </div>
      );
    case "success":
      return (
        <div
          className={`${base} bg-emerald-50 border-emerald-100 text-emerald-600`}
        >
          <CheckCircle2 size={20} />
        </div>
      );
    default:
      return (
        <div className={`${base} bg-slate-50 border-slate-200 text-slate-600`}>
          <Bell size={20} />
        </div>
      );
  }
};

/* ----------------------------------------------------------
   COMPONENT
---------------------------------------------------------- */
export default function Notifications() {
  const navigate = useNavigate();

  const { activeNode } = useNodeStore();
  const { sellerOrders, fetchSellerOrders, isLoading: ordersLoading } =
    useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { user } = useSellerAuthStore();

  const [readIds, setReadIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("notif_read_ids") || "[]"));
    } catch {
      return new Set();
    }
  });

  const [refreshing, setRefreshing] = useState(false);

  /* ----------------------------------------------------------
     FETCH LIVE DATA
  ---------------------------------------------------------- */
  const refresh = useCallback(async () => {
    if (!activeNode?._id) return;
    setRefreshing(true);
    await Promise.all([
      fetchSellerOrders(activeNode.nodeType, activeNode._id),
      user?._id
        ? fetchProducts("", "", user._id, activeNode.nodeType, activeNode._id)
        : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [activeNode?._id, activeNode?.nodeType, user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
  }, [activeNode?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------------------------
     BUILD NOTIFICATIONS FROM LIVE DATA
  ---------------------------------------------------------- */
  const liveNotifications = [];

  // 1. Pending orders → "New Order" alerts
  const pendingOrders = sellerOrders.filter((o) => o.status === "Pending");
  pendingOrders.forEach((o) => {
    liveNotifications.push({
      id: `order-${o._id}`,
      title: `New Order #${o._id.slice(-6).toUpperCase()}`,
      desc: `${o.customer?.firstName || "A customer"} placed an order for ₹${
        o.totalPrice
      }. Please pack and keep it ready.`,
      time: timeAgo(o.createdAt),
      type: "order",
      unread: !readIds.has(`order-${o._id}`),
      action: "orders",
    });
  });

  // 2. Delivered orders → payout notifications
  const recentDelivered = sellerOrders
    .filter((o) => o.status === "Delivered")
    .slice(0, 3);
  recentDelivered.forEach((o) => {
    liveNotifications.push({
      id: `payout-${o._id}`,
      title: "Payout Queued",
      desc: `₹${o.totalPrice} from order #${o._id.slice(
        -6
      ).toUpperCase()} is pending settlement.`,
      time: timeAgo(o.updatedAt || o.createdAt),
      type: "payout",
      unread: !readIds.has(`payout-${o._id}`),
    });
  });

  // 3. Low stock products → inventory alerts
  const lowStockProducts = products.filter((p) => {
    const qty = parseInt(p.attribute?.quantity || p.stock || "0");
    return qty <= 5 && qty > 0;
  });

  if (lowStockProducts.length > 0) {
    const names = lowStockProducts
      .slice(0, 2)
      .map((p) => p.productName || p.name)
      .join(", ");
    liveNotifications.push({
      id: `lowstock-${activeNode?._id}`,
      title: `${lowStockProducts.length} Low Stock Alert${
        lowStockProducts.length > 1 ? "s" : ""
      }`,
      desc: `${names}${
        lowStockProducts.length > 2
          ? ` and ${lowStockProducts.length - 2} more products are`
          : " is"
      } running low. Update your inventory to avoid missing sales.`,
      time: "Now",
      type: "low_stock",
      unread: !readIds.has(`lowstock-${activeNode?._id}`),
      action: "inventory",
    });
  }

  // 4. Cancelled orders
  const recentCancelled = sellerOrders
    .filter((o) => o.status === "Cancelled")
    .slice(0, 2);
  recentCancelled.forEach((o) => {
    liveNotifications.push({
      id: `cancel-${o._id}`,
      title: `Order #${o._id.slice(-6).toUpperCase()} Cancelled`,
      desc: `A customer cancelled their order. No action required.`,
      time: timeAgo(o.updatedAt || o.createdAt),
      type: "alert",
      unread: !readIds.has(`cancel-${o._id}`),
    });
  });

  // Merge live + system notifications, sort by unread first
  const allNotifications = [
    ...liveNotifications,
    ...SYSTEM_NOTIFICATIONS,
  ].sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));

  const unreadCount = allNotifications.filter((n) => n.unread).length;

  /* ----------------------------------------------------------
     MARK AS READ
  ---------------------------------------------------------- */
  const markAsRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("notif_read_ids", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const markAllAsRead = () => {
    const ids = allNotifications.map((n) => n.id);
    setReadIds((prev) => {
      const next = new Set([...prev, ...ids]);
      try {
        localStorage.setItem("notif_read_ids", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-xl py-4 z-20 border-b border-slate-200/60 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Live activity for{" "}
            <span className="font-bold text-slate-700">
              {activeNode?.storeName || "this node"}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={refreshing || ordersLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={12}
              className={refreshing || ordersLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={14} />
            Mark all read
          </button>
        </div>
      </div>

      {/* LOADING */}
      {(ordersLoading || refreshing) && allNotifications.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* NOTIFICATIONS LIST */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {allNotifications.length > 0 ? (
            allNotifications.map((notif) => {
              const isUnread = notif.unread;
              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-5 sm:p-6 flex items-start gap-4 sm:gap-5 transition-colors cursor-pointer ${
                    isUnread
                      ? "bg-blue-50/30 hover:bg-blue-50/60"
                      : "bg-white hover:bg-slate-50/40"
                  }`}
                >
                  {/* Icon with badge */}
                  <div className="relative mt-1">
                    {getIcon(notif.type)}
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 mb-1.5">
                      <h3
                        className={`text-base font-bold ${
                          isUnread ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {notif.title}
                      </h3>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 whitespace-nowrap">
                        <Clock size={12} />
                        {notif.time}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                      {notif.desc}
                    </p>

                    {/* CTA buttons */}
                    {notif.action === "orders" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                          navigate("orders");
                        }}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 px-3 py-1.5 rounded-xl shadow-sm transition-all group"
                      >
                        View Order
                        <ArrowRight
                          size={12}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </button>
                    )}

                    {notif.action === "inventory" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                          navigate("inventory");
                        }}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 hover:bg-amber-100 px-3 py-1.5 rounded-xl shadow-sm transition-all group"
                      >
                        Update Inventory
                        <ArrowRight
                          size={12}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Bell className="mx-auto text-slate-300 mb-4" size={40} />
              <h3 className="text-lg font-bold text-slate-900">
                You're all caught up!
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                No new notifications at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* End indicator */}
      {allNotifications.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-2 pb-4 pointer-events-none">
          <div className="h-px bg-slate-200 flex-1 max-w-[100px]" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            End of notifications
          </p>
          <div className="h-px bg-slate-200 flex-1 max-w-[100px]" />
        </div>
      )}
    </div>
  );
}