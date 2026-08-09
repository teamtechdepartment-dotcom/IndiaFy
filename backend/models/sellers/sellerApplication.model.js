import mongoose, { Schema } from "mongoose";

const sellerApplicationSchema = new Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      default: () => "APP-" + Math.floor(100000 + Math.random() * 900000)
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "seller",
      required: true
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "SellerNode"
    },
    nodeType: {
      type: String,
      required: true,
      enum: [
        "LOCAL_RETAIL",
        "WHOLESALE_B2B",
        "QUICK_COMMERCE",
        "HOME_ESSENTIALS",
        "ELECTRONICS",
        "PERSONAL_CARE"
      ]
    },
    storeName: {
      type: String,
      required: true,
      trim: true
    },
    storeDescription: {
      type: String,
      default: ""
    },
    ownerName: {
      type: String,
      required: true,
      trim: true
    },
    ownerEmail: {
      type: String,
      required: true,
      trim: true
    },
    ownerPhone: {
      type: String,
      required: true,
      trim: true
    },
    businessType: {
      type: String,
      default: "Proprietorship",
      trim: true
    },
    // Encrypted fields
    aadhaarNumber: {
      type: String,
      required: true
    },
    panNumber: {
      type: String,
      required: true
    },
    bankAccountNumber: {
      type: String,
      required: true
    },
    // Hashed blind index fields for fast duplicate queries
    aadhaarHash: {
      type: String,
      required: true,
      index: true
    },
    panHash: {
      type: String,
      required: true,
      index: true
    },
    gstNumber: {
      type: String,
      required: true,
      trim: true
    },
    foodLicenseNumber: {
      type: String,
      trim: true,
      default: ""
    },
    gstHash: {
      type: String,
      required: true,
      index: true
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      default: 0
    },
    longitude: {
      type: Number,
      default: 0
    },
    documents: {
      aadhaarFront: { type: String, required: true },
      aadhaarBack: { type: String, required: true },
      panCard: { type: String, required: true },
      gstCertificate: { type: String, required: true },
      foodLicense: { type: String, default: "" },
      cancelledCheque: { type: String, required: true },
      bankStatement: { type: String, required: true }
    },
    storePhoto: {
      type: String,
      required: true
    },
    storeBanner: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: [
        "pending",
        "PENDING_REVIEW",
        "UNDER_REVIEW",
        "approved",
        "APPROVED",
        "ACTIVE",
        "rejected",
        "REJECTED",
        "SUSPENDED",
        "CHANGES_REQUESTED",
        "additional_information_required"
      ],
      default: "PENDING_REVIEW"
    },
    rejectionReason: {
      type: String,
      default: ""
    },
    remarks: {
      type: String,
      default: ""
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "admin"
    },
    approval: {
      status: {
        type: String,
        enum: [
          "DRAFT",
          "PENDING_REVIEW",
          "UNDER_REVIEW",
          "APPROVED",
          "ACTIVE",
          "REJECTED",
          "SUSPENDED",
          "CHANGES_REQUESTED"
        ],
        default: "PENDING_REVIEW"
      },
      submittedAt: { type: Date, default: Date.now },
      reviewedAt: { type: Date },
      reviewedBy: { type: Schema.Types.ObjectId, ref: "admin" },
      remarks: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

// Add index on status and composite indexes for faster queries
sellerApplicationSchema.index({ status: 1 });
sellerApplicationSchema.index({ userId: 1, nodeType: 1 });

const SellerApplication = mongoose.model("SellerApplication", sellerApplicationSchema);

export default SellerApplication;
