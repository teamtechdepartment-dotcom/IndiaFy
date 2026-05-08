import mongoose, { Schema } from "mongoose";

const sellerNodeSchema = new Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "seller",
        required: true,
        index: true
    },
    nodeType: {
        type: String,
        enum: ["local", "wholesale", "quick-commerce", "home-essentials", "electronics", "personal-care"],
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Ref is dynamic based on nodeType
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: [{
        type: String // e.g. "admin", "manager", "staff"
    }]
}, { timestamps: true });

const SellerNodeModel = mongoose.model("sellerNode", sellerNodeSchema);
export default SellerNodeModel;
