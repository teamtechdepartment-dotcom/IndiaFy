import mongoose, { Schema } from "mongoose";

const localStoreSchema = new Schema({
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
    storeAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String }
    },
    dispatchRadius: { type: Number, default: 5 }, // km
    operatingSectors: [{ type: String }],
    isLive: { type: Boolean, default: false },
    fraudRiskScore: { type: Number, default: 0 },
    analytics: {
        totalOrders: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        rating: { type: Number, default: 0 }
    }
}, { timestamps: true });

const LocalStoreModel = mongoose.model("localStore", localStoreSchema);
export default LocalStoreModel;
