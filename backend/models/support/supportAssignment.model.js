import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const supportAssignmentSchema = new Schema(
  {
    conversationId: {
      type: ObjectId,
      ref: "support_Conversation",
      required: true,
      index: true,
    },
    agentId: {
      type: ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    assignedBy: {
      type: ObjectId,
      ref: "admin", // could be auto-assigned (null) or manually assigned by supervisor
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed", "transferred"],
      default: "active",
      index: true,
    },
    reason: {
      type: String,
      default: "",
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    unassignedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const SupportAssignment = mongoose.model(
  "support_Assignment",
  supportAssignmentSchema
);

export default SupportAssignment;
