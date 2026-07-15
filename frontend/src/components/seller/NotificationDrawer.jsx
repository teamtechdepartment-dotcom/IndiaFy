/* eslint-disable no-unused-vars */
import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    X,
    Package,
    IndianRupee,
    Clock,
    ShoppingBag,
    CheckCircle,
    Bell,
    RefreshCw,
    Inbox,
} from "lucide-react";
import { useNotificationStore } from "../../store/notificationStore";
import { useNodeStore } from "../../store/nodeStore";

/* -----------------------------------------------------------
   HELPERS
----------------------------------------------------------- */
const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

/* -----------------------------------------------------------
   COMPONENT
----------------------------------------------------------- */
export default function NotificationDrawer({ onNavigateToOrders }) {
    const navigate = useNavigate();
    const { activeNode } = useNodeStore();
    const {
        notifications,
        drawerOpen,
        closeDrawer,
        markAllRead,
        fetchNotifications,
        clearBadge,
    } = useNotificationStore();

    // Fetch from API when drawer opens
    useEffect(() => {
        if (drawerOpen && activeNode?._id) {
            fetchNotifications(activeNode._id);
        }
    }, [drawerOpen, activeNode?._id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleMarkAllRead = useCallback(async () => {
        await markAllRead(activeNode?._id);
    }, [activeNode?._id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleViewOrders = useCallback(() => {
        if (activeNode?._id) clearBadge(activeNode._id);
        closeDrawer();
        if (typeof onNavigateToOrders === "function") {
            onNavigateToOrders();
        } else {
            navigate("orders");
        }
    }, [activeNode?._id]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AnimatePresence>
            {drawerOpen && (
        <>
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDrawer}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.div
                className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
            >
                {/* ── HEADER ────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                            <Bell size={15} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 leading-tight">
                                Order Notifications
                            </h2>
                            <p className="text-[10px] text-slate-400 font-medium">
                                {activeNode?.storeName || "This node"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <CheckCircle size={12} />
                                Mark all read
                            </button>
                        )}
                        <button
                            onClick={closeDrawer}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            aria-label="Close notifications"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── NOTIFICATION LIST ──────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                <Inbox size={28} className="text-slate-300" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 mb-1">
                                You're all caught up!
                            </h3>
                            <p className="text-xs text-slate-400 font-medium max-w-[200px]">
                                New orders will appear here instantly.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notif, idx) => (
                            <button
                                key={notif.orderId || notif._id || idx}
                                onClick={handleViewOrders}
                                className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                                        <Package size={18} className="text-blue-600" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-sm font-bold text-slate-900 leading-tight">
                                                New Order #{" "}
                                                <span className="text-blue-600">
                                                    {notif.orderNumber ||
                                                        (notif.orderId?.toString().slice(-6).toUpperCase()) ||
                                                        "—"}
                                                </span>
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-0.5 mt-0.5">
                                                <Clock size={10} />
                                                {timeAgo(notif.createdAt || notif.receivedAt)}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 font-medium mb-2 truncate">
                                            {notif.customerName || "A customer"} placed an order
                                        </p>

                                        {/* Amount + Items pills */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                                <IndianRupee size={10} />
                                                {formatCurrency(notif.totalAmount || notif.totalPrice).replace("₹", "")}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                                <ShoppingBag size={10} />
                                                {notif.itemCount || 1} item{(notif.itemCount || 1) !== 1 ? "s" : ""}
                                            </span>
                                            {notif.paymentMethod && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                                    {notif.paymentMethod}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* ── FOOTER ─────────────────────────────────────────────── */}
                <div className="border-t border-slate-100 p-4 bg-white">
                    <button
                        onClick={handleViewOrders}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={16} />
                        Go to Orders
                    </button>
                </div>
            </motion.div>
        </>
            )}
        </AnimatePresence>
    );
}
