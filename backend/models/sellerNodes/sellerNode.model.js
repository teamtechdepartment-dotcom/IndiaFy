import mongoose from "mongoose";

const sellerNodeSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    nodeType: {
      type: String,
      enum: [
        "LOCAL_RETAIL",
        "WHOLESALE_B2B",
        "QUICK_COMMERCE",
        "HOME_ESSENTIALS",
        "ELECTRONICS",
        "PERSONAL_CARE",
      ],
      required: true,
    },

    storeName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    description: { type: String, default: "" },
    storeCategory: { type: String, default: "" },
    operatingHours: { type: String, default: "" },
    pickupAvailable: { type: Boolean, default: false },

    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },

    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },

    gstin: { type: String, trim: true, default: "" },
    warehouseLocation: { type: String, trim: true, default: "" },

    minOrderQty: { type: Number, default: 1 },
    minOrderValue: { type: Number, default: 0 },
    activeSectors: { type: String, trim: true, default: "" },
    dispatchSpeed: { type: String, trim: true, default: "30 mins" },
    deliveryRadius: { type: Number, default: 5 },

    accountName: { type: String, trim: true, default: "" },
    accountNumber: { type: String, trim: true, default: "" },
    ifsc: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },

    orderAlerts: { type: Boolean, default: true },
    autoAccept: { type: Boolean, default: false },

    isStoreOpen: { type: Boolean, default: true },
    isDeactivated: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    paymentMethods: [{ type: String }],

    // Aggregate ratings (can be updated by a rating system)
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Text index for search
sellerNodeSchema.index({ storeName: "text", description: "text", storeCategory: "text" });

const SellerNode = mongoose.model("SellerNode", sellerNodeSchema);

export default SellerNode;