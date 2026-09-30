import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
  },
  { _id: false }
);

const supportMessageSchema = new Schema(
  {
    conversationId: {
      type: ObjectId,
      ref: "support_Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ["customer", "seller", "admin"],
      required: true,
    },
    messageType: {
      type: String,
      enum: ["customer", "internal_note"],
      default: "customer",
    },
    body: {
      type: String,
      required: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    clientMessageId: {
      type: String,
      required: true,
      // Helps idempotency: prevent same message being saved twice by frontend retry
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// High volume indices
// For fetching conversation messages efficiently by pagination (Cursor = _id)
supportMessageSchema.index({ conversationId: 1, _id: -1 });

// Idempotency constraint: A unique message ID per conversation & sender.
supportMessageSchema.index(
  { conversationId: 1, senderId: 1, clientMessageId: 1 },
  { unique: true }
);

const SupportMessage = mongoose.model("support_Message", supportMessageSchema);

export default SupportMessage;
