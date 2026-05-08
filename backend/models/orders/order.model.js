import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "seller",
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
    },
    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sellerNode",
        required: false
    },
    nodeType: {
        type: String,
        enum: ["local", "wholesale", "quick-commerce", "home-essentials", "electronics", "personal-care"],
        default: "local"
    },
    isWholesale: {
        type: Boolean,
        default: false
    },
    gstAmount: {
        type: Number,
        default: 0
    }
});

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["Card", "UPI", "NetBanking", "COD"]
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    packingVideoUrl: {
        type: String
    },
    // --- WHOLESALE B2B EXTENSION ---
    isWholesaleOrder: {
        type: Boolean,
        default: false
    },
    billingDetails: {
        companyName: { type: String },
        gstNumber: { type: String },
        billingAddress: { type: String }
    },
    poNotes: {
        type: String
    },
    deliverySlot: {
        type: String,
        enum: ["Standard", "Same-Day Bulk", "Next-Day Dispatch", "Scheduled"],
        default: "Standard"
    },
    scheduledDispatchDate: {
        type: Date
    },
    warehouseDispatch: {
        type: String
    }
}, { timestamps: true });

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
