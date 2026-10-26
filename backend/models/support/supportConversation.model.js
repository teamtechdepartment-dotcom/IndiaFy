import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const supportConversationSchema = new Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: ObjectId,
      required: true,
      refPath: "customerTypeModel",
      index: true,
    },
    customerTypeModel: {
      type: String,
      required: true,
      enum: ["customer", "seller"], // Using lowercase to match existing conventions
    },
    orderId: {
      type: ObjectId,
      ref: "order",
      default: null,
      index: true,
    },
    storeId: {
      type: ObjectId,
      ref: "sellerProfile",
      default: null,
      index: true,
    },
    assignedAgentId: {
      type: ObjectId,
      ref: "admin",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "open",
        "assigned",
        "in_progress",
        "waiting_customer",
        "waiting_agent",
        "escalated",
        "resolved",
        "closed",
      ],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    channel: {
      type: String,
      enum: ["chat", "callback"],
      default: "chat",
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    lastMessageId: {
      type: ObjectId,
      ref: "support_Message",
      default: null,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    // SLA Metadata
    firstResponseAt: { type: Date, default: null },
    assignedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    callbackRequestedAt: { type: Date, default: null },
    callbackStartedAt: { type: Date, default: null },
    callbackCompletedAt: { type: Date, default: null },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual helper to seamlessly access sellerId for seller requester conversations
supportConversationSchema.virtual("sellerId").get(function () {
  return this.customerTypeModel === "seller" ? this.customerId : null;
});

// Compound index to help fetch active assigned conversations for an agent quickly
supportConversationSchema.index({ assignedAgentId: 1, status: 1 });
supportConversationSchema.index({ customerId: 1, updatedAt: -1 });
supportConversationSchema.index({ customerId: 1, customerTypeModel: 1, status: 1 });

const SupportConversation = mongoose.model(
  "support_Conversation",
  supportConversationSchema
);

export default SupportConversation;
