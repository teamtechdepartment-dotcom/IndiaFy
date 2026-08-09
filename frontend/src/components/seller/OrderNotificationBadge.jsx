import React, { memo } from "react";
import { useNotificationStore } from "../../store/notificationStore";

/**
 * OrderNotificationBadge — a red pill badge showing unread order count.
 */
const OrderNotificationBadge = memo(function OrderNotificationBadge({ count, nodeId, className = "" }) {
    const unreadCounts = useNotificationStore((state) => state.unreadCounts);
    const badgeCount = count !== undefined ? count : (nodeId ? (unreadCounts[nodeId] || 0) : 0);

    if (!badgeCount || badgeCount <= 0) return null;

    const display = badgeCount > 99 ? "99+" : badgeCount.toString();

    return (
        <span
            aria-label={`${badgeCount} unread order notification${badgeCount !== 1 ? "s" : ""}`}
            className={`
                inline-flex items-center justify-center
                min-w-[22px] h-[22px] px-1.5
                bg-red-500 text-white
                text-[10px] font-black
                rounded-full border-2 border-white
                shadow-md shadow-red-500/30
                animate-pulse
                select-none pointer-events-none
                ${className}
            `}
            style={{ lineHeight: 1 }}
        >
            {display}
        </span>
    );
});

export default OrderNotificationBadge;
