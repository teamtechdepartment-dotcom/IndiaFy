import { Router } from "express";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import permissionGuard from "../../middlewares/permissionGuard.middleware.js";
import * as supportCtrl from "../../controllers/support/support.controllers.js";
import { validateResult } from "../../middlewares/validate.middleware.js";
import * as supportValidator from "../../middlewares/validators/support.validator.js";
import rateLimit from "express-rate-limit";

const conversationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { success: false, message: "Too many conversations created. Please try again later." }
});

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  message: { success: false, message: "Too many messages sent. Please slow down." }
});

const router = Router();

// Telephony Webhook (Public, verified internally via signature)
router.post("/telephony/webhook", supportCtrl.handleTelephonyWebhook);

router.use(requiredLogin);

// Customer / General routes
router.post(
  "/conversations",
  conversationLimiter,
  supportValidator.validateCreateConversation,
  validateResult,
  supportCtrl.createConversation
);
router.get("/conversations", supportCtrl.getConversations);
router.get("/conversations/:id", supportCtrl.getConversationDetails);

// Messages (Pagination & Create)
router.get(
  "/conversations/:id/messages",
  supportValidator.validateGetMessages,
  validateResult,
  supportCtrl.getMessages
);
router.post(
  "/conversations/:id/messages",
  messageLimiter,
  supportValidator.validateSendMessage,
  validateResult,
  supportCtrl.sendMessage
);

// Agent specific routes
router.post(
  "/conversations/:id/assign", 
  permissionGuard("tickets:write"), 
  supportValidator.validateAssignConversation,
  validateResult,
  supportCtrl.assignConversation
);

router.put(
  "/conversations/:id/status", 
  permissionGuard("tickets:write"), 
  supportValidator.validateUpdateStatus,
  validateResult,
  supportCtrl.updateStatus
);

// Callbacks (Customer/Seller)
router.post(
  "/conversations/:id/callback",
  conversationLimiter,
  supportCtrl.requestCallback
);

// Callbacks (Agent)
router.get(
  "/callbacks",
  permissionGuard("tickets:read"),
  supportCtrl.getCallbacks
);

router.put(
  "/callbacks/:id/status",
  supportCtrl.updateCallbackStatus
);

router.post(
  "/callbacks/:id/assign",
  permissionGuard("tickets:write"),
  supportCtrl.assignCallback
);

router.post(
  "/callbacks/:id/start-call",
  permissionGuard("tickets:write"),
  supportCtrl.startCallbackCall
);

export default router;
