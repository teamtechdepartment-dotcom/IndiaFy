import mongoose, { Schema } from "mongoose";

const orderNotificationSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "seller",
      index: true
    },
    nodeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "sellerNode",
      index: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "order"
    },
    orderNumber: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "ORDER",
      index: true
    },
    customerName: {
      type: String,
      default: "Customer"
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    itemCount: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      default: "Pending"
    },
    paymentMethod: {
      type: String,
      default: "COD"
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// Compound indexes for fast unread queries per seller + node.
orderNotificationSchema.index({ sellerId: 1, nodeId: 1, read: 1 });
orderNotificationSchema.index({ sellerId: 1, nodeId: 1, isRead: 1 });

// Auto-expire notifications after 30 days
orderNotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const OrderNotification = mongoose.model("OrderNotification", orderNotificationSchema);

export default OrderNotification;
