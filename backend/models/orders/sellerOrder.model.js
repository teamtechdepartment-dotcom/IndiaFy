import mongoose from "mongoose";

const sellerOrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const sellerOrderSchema = new mongoose.Schema(
  {
    parentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      default: "",
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerNode",
      required: true,
      index: true,
    },
    nodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerNode",
      required: true,
      index: true,
    },
    nodeType: {
      type: String,
      required: true,
      index: true,
    },
    items: [sellerOrderItemSchema],
    itemCount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Accepted", "Packed", "Shipped", "Dispatched", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    customerName: {
      type: String,
      default: "Customer",
      index: true,
    },
  },
  { timestamps: true }
);

sellerOrderSchema.index({ parentOrderId: 1, sellerId: 1, nodeId: 1 }, { unique: true });
sellerOrderSchema.index({ sellerId: 1, nodeId: 1, orderStatus: 1, createdAt: -1 });

const SellerOrder = mongoose.model("SellerOrder", sellerOrderSchema);

export default SellerOrder;
