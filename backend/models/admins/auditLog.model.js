import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const auditLogSchema = new Schema(
  {
    adminId: {
      type: ObjectId,
      ref: "admin",
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetResource: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    device: {
      type: String,
      default: "unknown",
    },
    location: {
      type: String,
      default: "unknown",
    },
    beforeValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    afterValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("audit_Log", auditLogSchema);

export default AuditLog;
