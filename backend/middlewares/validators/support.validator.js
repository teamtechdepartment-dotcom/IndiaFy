import { body, param, query } from "express-validator";

export const validateCreateConversation = [
  body("subject")
    .trim()
    .notEmpty().withMessage("Subject is required")
    .isLength({ max: 200 }).withMessage("Subject must not exceed 200 characters"),
  body("orderId")
    .optional({ checkFalsy: true })
    .isMongoId().withMessage("Invalid orderId format"),
  body("storeId")
    .optional({ checkFalsy: true })
    .isMongoId().withMessage("Invalid storeId format"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High", "Critical"]).withMessage("Invalid priority"),
  body("channel")
    .optional()
    .isIn(["chat", "callback"]).withMessage("Invalid channel")
];

export const validateSendMessage = [
  param("id").isMongoId().withMessage("Invalid conversation ID"),
  body("body")
    .trim()
    .notEmpty().withMessage("Message body is required")
    .isLength({ max: 5000 }).withMessage("Message body must not exceed 5000 characters"),
  body("clientMessageId")
    .trim()
    .notEmpty().withMessage("clientMessageId is required")
    .isLength({ max: 128 }).withMessage("clientMessageId must not exceed 128 characters"),
  body("attachments")
    .optional()
    .isArray({ max: 10 }).withMessage("Maximum of 10 attachments allowed"),
  body("attachments.*.url")
    .if(body("attachments").isArray())
    .notEmpty().withMessage("Attachment URL is required")
    .isURL().withMessage("Invalid attachment URL"),
];

export const validateAssignConversation = [
  param("id").isMongoId().withMessage("Invalid conversation ID"),
  body("agentId")
    .isMongoId().withMessage("Invalid agent ID format")
];

export const validateUpdateStatus = [
  param("id").isMongoId().withMessage("Invalid conversation ID"),
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn([
      "open",
      "assigned",
      "waiting_customer",
      "waiting_agent",
      "escalated",
      "resolved",
      "closed",
    ]).withMessage("Invalid status")
];

export const validateGetMessages = [
  param("id").isMongoId().withMessage("Invalid conversation ID"),
  query("before").optional().isMongoId().withMessage("Invalid cursor format"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100")
];

export const validateGetConversation = [
  param("id").isMongoId().withMessage("Invalid conversation ID")
];

export const validateRequestCallback = [
  param("id").isMongoId().withMessage("Invalid conversation ID"),
  body("phone").optional().trim(),
  body("requestedTimeWindow").optional().trim(),
  body("preferredTime").optional().trim(),
  body("notes").optional().trim()
];

export const validateUpdateCallbackStatus = [
  param("id").isMongoId().withMessage("Invalid callback ID"),
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn([
      "requested",
      "queued",
      "assigned",
      "calling",
      "connected",
      "completed",
      "failed",
      "missed",
      "cancelled"
    ]).withMessage("Invalid callback status")
];

export const validateAssignCallback = [
  param("id").isMongoId().withMessage("Invalid callback ID"),
  body("agentId").optional().isMongoId().withMessage("Invalid agent ID format")
];

export const validateStartCallbackCall = [
  param("id").isMongoId().withMessage("Invalid callback ID")
];
