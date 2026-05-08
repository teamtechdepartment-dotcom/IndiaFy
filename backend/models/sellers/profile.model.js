import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const profileSchema = new Schema({
    customerId: {
        type: ObjectId,
        required: true,
        ref: "seller"
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String
    },
    profileImage:{
        type: String
    },
    contact: {
        type: Number,
        required: true,
        unique: true
    },
    address: [{
        street: {
            type: String,
            required: true
        },
        nearBy: {
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
        country: {
            type: String,
            required: true
        }
    }],
    // --- WHOLESALE B2B EXTENSION ---
    sellerType: {
        type: String,
        enum: ["local", "wholesale"],
        default: "local"
    },
    gstVerification: {
        isVerified: { type: Boolean, default: false },
        gstNumber: { type: String },
        documentUrl: { type: String }
    },
    warehouseAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] }
        }
    },
    dispatchRadius: {
        type: Number, // in km
        default: 10
    },
    dispatchTiming: {
        type: String,
        default: "10:00 AM - 6:00 PM"
    },
    businessLicense: {
        type: String // URL to license document
    },
    transportCapability: [{
        type: String, // e.g., "Bike", "Mini Truck", "Tempo"
        default: ["Bike"]
    }],
    operatingSectors: [{
        type: String // e.g., "Sector 1", "North Delhi"
    }],
    warehouseVerificationStatus: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending"
    },
    indiafyVerifiedBadge: {
        type: Boolean,
        default: false
    },
    fraudRiskScore: {
        type: Number, // 0-100 (0 is lowest risk)
        default: 0
    }
},
    { timestamps: true }
)

const customerProfile = mongoose.model("seller_Profile", profileSchema);

export default customerProfile;