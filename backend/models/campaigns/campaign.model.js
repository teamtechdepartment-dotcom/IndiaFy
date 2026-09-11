import mongoose, { Schema } from "mongoose";

const campaignProductSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "seller",
      required: true,
    },
  },
  { _id: false }
);

const campaignSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0.01,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "expired", "disabled"],
      default: "draft",
      index: true,
    },
    products: [campaignProductSchema],
    bannerImage: {
      type: String,
      default: "",
      trim: true,
    },
    badgeText: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "admin",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to dynamically compute live status based on dates
campaignSchema.virtual("effectiveStatus").get(function () {
  if (this.status === "disabled" || this.status === "draft") {
    return this.status;
  }
  const now = new Date();
  if (now > this.endDate) {
    return "expired";
  }
  if (now < this.startDate) {
    return "scheduled";
  }
  return "active";
});

// Method to check if campaign is currently live
campaignSchema.methods.isLive = function (checkDate = new Date()) {
  if (this.status === "disabled" || this.status === "draft") return false;
  return checkDate >= this.startDate && checkDate <= this.endDate;
};

// Compound index for active campaign lookups
campaignSchema.index({ status: 1, startDate: 1, endDate: 1 });
campaignSchema.index({ "products.productId": 1 });
campaignSchema.index({ "products.sellerId": 1 });

const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
