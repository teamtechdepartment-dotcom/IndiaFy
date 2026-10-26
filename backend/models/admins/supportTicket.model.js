import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const ticketMessageSchema = new Schema(
  {
    senderType: {
      type: String,
      enum: ["user", "admin", "seller", "customer"],
      required: true,
    },
    senderId: {
      type: ObjectId,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const supportTicketSchema = new Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userType: {
      type: String,
      enum: ["customer", "seller", "guest"],
      required: true,
      default: "customer",
    },
    userId: {
      type: ObjectId,
      required: false,
      refPath: "userTypeModel",
      default: null,
    },
    userTypeModel: {
      type: String,
      required: false,
      enum: ["customer", "seller", "guest"],
      default: "customer",
    },
    sourceChannel: {
      type: String,
      enum: ["customer_support", "seller_support", "contact_us", "chat", "callback", "email", "portal"],
      default: "portal",
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Assigned", "In Progress", "Waiting", "Resolved", "Closed", "Reopened"],
      default: "Open",
      index: true,
    },
    queueStatus: {
      type: String,
      enum: ["pending_assignment", "processing", "assigned", "retry_required", "failed", "completed"],
      default: "pending_assignment",
      index: true,
    },
    queueAttempts: {
      type: Number,
      default: 0,
    },
    lastQueueError: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    category: {
      type: String,
      default: "General Inquiry",
      index: true,
    },
    orderId: {
      type: ObjectId,
      ref: "order",
      default: null,
      index: true,
    },
    customerEmail: {
      type: String,
      default: "",
      index: true,
    },
    customerName: {
      type: String,
      default: "",
    },
    customerPhone: {
      type: String,
      default: "",
    },
    assignedTo: {
      type: ObjectId,
      ref: "admin",
      default: null,
      index: true,
    },
    assignedMemberId: {
      type: ObjectId,
      ref: "support_Member",
      default: null,
      index: true,
    },
    assignedMemberName: {
      type: String,
      default: "",
    },
    assignedAt: {
      type: Date,
      default: null,
      index: true,
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: ObjectId,
      default: null,
    },
    reopenedAt: {
      type: Date,
      default: null,
    },
    reopenReason: {
      type: String,
      default: "",
    },
    internalNotes: [
      {
        adminId: { type: ObjectId, ref: "admin" },
        adminName: { type: String, required: true },
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    auditLogs: [
      {
        action: { type: String, required: true },
        performedBy: { type: ObjectId },
        performedByName: { type: String },
        performedByRole: { type: String },
        details: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    messages: [ticketMessageSchema],
  },
  { timestamps: true }
);

// Targeted compound indexes for high-volume queueing, workload, and pagination
supportTicketSchema.index({ assignedMemberId: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: 1, createdAt: 1 });
supportTicketSchema.index({ queueStatus: 1, status: 1, createdAt: 1 });
supportTicketSchema.index({ status: 1, createdAt: -1 });
supportTicketSchema.index({ updatedAt: -1, _id: -1 });
supportTicketSchema.index({ createdAt: -1, _id: -1 });
supportTicketSchema.index({ userType: 1, userId: 1, createdAt: -1 });

const SupportTicket = mongoose.model("support_Ticket", supportTicketSchema);

export default SupportTicket;
