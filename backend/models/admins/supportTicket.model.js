import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const ticketMessageSchema = new Schema(
  {
    senderType: {
      type: String,
      enum: ["user", "admin"],
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
      enum: ["customer", "seller"],
      required: true,
    },
    userId: {
      type: ObjectId,
      required: true,
      refPath: "userTypeModel",
    },
    userTypeModel: {
      type: String,
      required: true,
      enum: ["customer", "seller"],
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
      enum: ["Open", "Assigned", "In Progress", "Waiting", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    assignedTo: {
      type: ObjectId,
      ref: "admin",
      default: null,
      index: true,
    },
    internalNotes: [
      {
        adminId: { type: ObjectId, ref: "admin", required: true },
        adminName: { type: String, required: true },
        note: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    messages: [ticketMessageSchema],
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model("support_Ticket", supportTicketSchema);

export default SupportTicket;
