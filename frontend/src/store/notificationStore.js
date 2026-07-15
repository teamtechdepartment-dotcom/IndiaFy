import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

/**
 * Notification store — manages real-time order notification badge counts and in-memory list.
 * NOT persisted (counts reset on browser close — source of truth is the REST API).
 */
export const useNotificationStore = create((set, get) => ({
    // Map of nodeId → unread count (e.g. { "abc123": 3, "def456": 1 })
    unreadCounts: {},

    // In-memory list of recent ORDER_CREATED payloads received via socket
    notifications: [],

    // Whether the notification drawer is open
    drawerOpen: false,

    /**
     * Increment unread count for a specific node by 1.
     * Called when ORDER_CREATED socket event is received.
     */
    incrementBadge: (nodeId) => {
        if (!nodeId) return;
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [nodeId]: (state.unreadCounts[nodeId] || 0) + 1,
            },
        }));
    },

    /**
     * Set unread count for a specific node to an exact number.
     */
    setBadge: (nodeId, count) => {
        if (!nodeId) return;
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [nodeId]: Math.max(0, count),
            },
        }));
    },

    /**
     * Clear unread count for a specific node (e.g. when seller opens Orders).
     */
    clearBadge: (nodeId) => {
        if (!nodeId) return;
        set((state) => {
            const next = { ...state.unreadCounts };
            delete next[nodeId];
            return { unreadCounts: next };
        });
    },

    /**
     * Add a new notification payload to the in-memory list.
     */
    addNotification: (payload) => {
        set((state) => ({
            notifications: [payload, ...state.notifications].slice(0, 50), // keep last 50
        }));
    },

    /**
     * Open/close the notification drawer.
     */
    openDrawer: () => set({ drawerOpen: true }),
    closeDrawer: () => set({ drawerOpen: false }),
    toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),

    /**
     * Fetch unread counts from the API for a list of nodeIds.
     * Used on mount to restore counts after browser refresh.
     *
     * @param {string[]} nodeIds
     */
    fetchUnreadCounts: async (nodeIds) => {
        if (!nodeIds?.length) return;
        try {
            const validIds = nodeIds.filter(Boolean);
            if (!validIds.length) return;
            const res = await axiosInstance.get("/seller/notifications/unread-count", {
                params: { nodeIds: validIds.join(",") },
            });
            // res is the raw data object from the API response: { nodeId1: count, nodeId2: count }
            const data = res?.data || res || {};
            const requestedCounts = validIds.reduce((acc, nodeId) => {
                acc[nodeId] = 0;
                return acc;
            }, {});
            set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    ...requestedCounts,
                    ...data,
                },
            }));
        } catch (err) {
            console.error("[notificationStore] fetchUnreadCounts failed:", err.message);
        }
    },

    /**
     * Mark all notifications for a node as read (API call + local clear).
     */
    markAllRead: async (nodeId) => {
        try {
            await axiosInstance.put("/seller/notifications/read-all", null, {
                params: nodeId ? { nodeId } : {},
            });
        } catch (err) {
            console.error("[notificationStore] markAllRead failed:", err.message);
        }
        if (nodeId) {
            get().clearBadge(nodeId);
        } else {
            set({ unreadCounts: {} });
        }
    },

    /**
     * Fetch recent notifications from the REST API (for the drawer).
     */
    fetchNotifications: async (nodeId) => {
        try {
            const res = await axiosInstance.get("/seller/notifications", {
                params: nodeId ? { nodeId, limit: 20 } : { limit: 20 },
            });
            const data = res?.data?.notifications || res?.notifications || [];
            set({ notifications: data });
        } catch (err) {
            console.error("[notificationStore] fetchNotifications failed:", err.message);
        }
    },
}));

export default useNotificationStore;
