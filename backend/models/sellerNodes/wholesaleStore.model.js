import mongoose, { Schema } from "mongoose";

const wholesaleStoreSchema = new Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "seller",
        required: true,
        index: true
    },
    businessName: { type: String, required: true },
    logo: { type: String },
    gstVerification: {
        isVerified: { type: Boolean, default: false },
        gstNumber: { type: String },
        documentUrl: { type: String }
    },
    warehouseAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String }
    },
    warehouseVerificationStatus: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending"
    },
    businessLicense: { type: String },
    transportCapability: [{
        type: String // e.g., "Bike", "Mini Truck", "Tempo"
    }],
    dispatchTiming: { type: String, default: "10:00 AM - 6:00 PM" },
    isLive: { type: Boolean, default: false },
    fraudRiskScore: { type: Number, default: 0 },
    analytics: {
        totalBulkOrders: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        moqPerformance: { type: Number, default: 0 }
    }
}, { timestamps: true });

const WholesaleStoreModel = mongoose.model("wholesaleStore", wholesaleStoreSchema);
export default WholesaleStoreModel;
