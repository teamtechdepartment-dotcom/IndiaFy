import { Router } from "express";
import {
    getOrderNotifications,
    getUnreadCounts,
    markNotificationRead,
    markAllNotificationsRead
} from "../../controllers/notifications/orderNotification.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import { requireSeller } from "../../middlewares/roleGuard.middleware.js";

const router = Router();

// All routes require seller authentication
router.use(requiredLogin, requireSeller);

// GET  /seller/notifications              — paginated list (optional ?nodeId=)
router.get("/", getOrderNotifications);

// GET  /seller/notifications/unread-count — counts per node (?nodeIds=id1,id2)
router.get("/unread-count", getUnreadCounts);

// PUT  /seller/notifications/read-all    — bulk mark read (?nodeId=)
router.put("/read-all", markAllNotificationsRead);

// PUT  /seller/notifications/:id/read    — single mark read
router.put("/:id/read", markNotificationRead);

export default router;
