import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const supportCallLogSchema = new Schema(
  {
    conversationId: {
      type: ObjectId,
      ref: "support_Conversation",
      required: true,
    },
    customerId: {
      type: ObjectId,
      refPath: "customerTypeModel",
      required: true,
    },
    customerTypeModel: {
      type: String,
      required: true,
      enum: ["customer", "seller"],
    },
    agentId: {
      type: ObjectId,
      ref: "admin",
      default: null,
      index: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "requested",
        "queued",
        "assigned",
        "calling",
        "connected",
        "completed",
        "missed",
        "cancelled",
        "failed",
      ],
      default: "requested",
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    requestedTimeWindow: {
      type: String, // e.g., "ASAP", "Within 30 minutes", "Today", "Specific time"
      default: "ASAP",
    },
    preferredTime: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    providerName: {
      type: String, // e.g., "twilio", "exotel"
      default: "",
    },
    providerCallId: {
      type: String, // The SID from the provider
      default: "",
      index: true,
    },
    // recordingUrl is explicitly disabled in Phase 5B.1
  },
  { timestamps: true }
);

supportCallLogSchema.index(
  { conversationId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["requested", "queued", "assigned", "calling", "connected"] }
    }
  }
);

const SupportCallLog = mongoose.model("support_CallLog", supportCallLogSchema);

export default SupportCallLog;
