import React, { memo } from "react";

/**
 * OrderNotificationBadge — a red pill badge showing unread order count.
 * Memoized: only re-renders when the `count` prop changes.
 *
 * @param {number}  count     - Number of unread notifications
 * @param {string}  className - Optional positioning classes
 */
const OrderNotificationBadge = memo(function OrderNotificationBadge({ count = 0, className = "" }) {
    if (!count || count <= 0) return null;

    const display = count > 99 ? "99+" : count.toString();

    return (
        <span
            aria-label={`${count} unread order notification${count !== 1 ? "s" : ""}`}
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
