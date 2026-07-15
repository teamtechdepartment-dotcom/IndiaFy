import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "seller" // Can refer to either seller or admin
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        "application_submitted",
        "under_review",
        "approved",
        "rejected",
        "more_info_requested",
        "new_order",
        "suspended",
        "changes_requested",
        "general"
      ],
      default: "general"
    },
    isRead: {
      type: Boolean,
      default: false
    },
    metadata: {
      applicationId: { type: String },
      storeId: { type: Schema.Types.ObjectId, ref: "SellerNode" }
    }
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
