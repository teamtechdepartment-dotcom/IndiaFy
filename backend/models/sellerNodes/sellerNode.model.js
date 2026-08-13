import mongoose from "mongoose";

const sellerNodeSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
      required: true,
    },

    sellerSnapshot: {
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "seller" },
      storeName: { type: String, trim: true, default: "" },
      storeSlug: { type: String, trim: true, default: "" },
      businessInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
      location: { type: mongoose.Schema.Types.Mixed, default: {} },
      documents: { type: mongoose.Schema.Types.Mixed, default: {} },
      bankDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
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

    // --- Onboarding & Compliance Redesign Fields ---
    // Business Details
    businessName: { type: String, trim: true, default: "" },
    ownerFullName: { type: String, trim: true, default: "" },
    businessType: { type: String, trim: true, default: "" },
    panNumber: { type: String, trim: true, default: "" },
    aadhaarNumber: { type: String, trim: true, default: "" },
    businessEmail: { type: String, trim: true, default: "" },
    businessPhone: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    yearsInBusiness: { type: Number, default: 0 },
    businessDescription: { type: String, trim: true, default: "" },

    // Store Details
    subCategory: { type: String, trim: true, default: "" },
    storeTags: [{ type: String }],
    openingTime: { type: String, default: "" },
    closingTime: { type: String, default: "" },
    physicalStoreAvailable: { type: Boolean, default: false },
    expressDelivery: { type: Boolean, default: false },

    // Location Details
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    area: { type: String, default: "" },
    country: { type: String, default: "" },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    storeFrontPhoto: { type: String, default: "" },
    storeInteriorPhoto: { type: String, default: "" },

    // Banking Details
    upiId: { type: String, trim: true, default: "" },
    cancelledChequePhoto: { type: String, default: "" },
    bankStatementPhoto: { type: String, default: "" },
    passbookFrontPhoto: { type: String, default: "" },
    verificationMethod: { type: String, default: "Micro Deposit" },

    // Compliance / Legal Documents
    gstCertificatePhoto: { type: String, default: "" },
    panCardPhoto: { type: String, default: "" },
    aadhaarFrontPhoto: { type: String, default: "" },
    aadhaarBackPhoto: { type: String, default: "" },
    shopEstablishmentLicensePhoto: { type: String, default: "" },
    tradeLicensePhoto: { type: String, default: "" },
    foodLicensePhoto: { type: String, default: "" },
    drugLicensePhoto: { type: String, default: "" },
    msmeCertificatePhoto: { type: String, default: "" },
    businessRegistrationPhoto: { type: String, default: "" },
    utilityBillPhoto: { type: String, default: "" },
    storeOwnershipProofPhoto: { type: String, default: "" },
    rentAgreementPhoto: { type: String, default: "" },
    storePhotos: [{ type: String }],
    ownerSelfiePhoto: { type: String, default: "" },

    // Store Operations Configuration
    storeManagerName: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    supportEmail: { type: String, default: "" },
    orderProcessingTime: { type: String, default: "" },
    avgDeliveryTime: { type: String, default: "" },
    maxDailyOrders: { type: Number, default: 0 },
    inventoryManagementType: { type: String, default: "" },
    warehouseAvailable: { type: Boolean, default: false },
    deliveryType: { type: String, default: "" },
    operatingDays: [{ type: String }],
    holidaySchedule: { type: String, default: "" },

    // Product Readiness Details
    inventoryReady: { type: String, default: "" },
    expectedMonthlyOrders: { type: String, default: "" },
    productCategories: [{ type: String }],
    productImagesAvailable: { type: String, default: "" },
    bulkUploadRequired: { type: String, default: "" },
    importProductsNow: { type: String, default: "" },

    // Verification Status Object Tracker
    verificationStatus: {
      business: { type: String, default: "Pending" },
      address: { type: String, default: "Pending" },
      bank: { type: String, default: "Pending" },
      documents: { type: String, default: "Pending" },
      compliance: { type: String, default: "Pending" },
      storeApproval: { type: String, default: "Pending" }
    },

    orderAlerts: { type: Boolean, default: true },
    autoAccept: { type: Boolean, default: false },

    isStoreOpen: { type: Boolean, default: true },
    isDeactivated: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false },
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
        "CHANGES_REQUESTED",
        "pending",
        "approved",
        "rejected"
      ],
      default: "DRAFT"
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
        default: "DRAFT"
      },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
      remarks: { type: String, default: "" }
    },

    paymentMethods: [{ type: String }],
    approvedAt: { type: Date },

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
