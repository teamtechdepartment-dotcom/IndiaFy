import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new Schema({
    customerId: {
        type: ObjectId,
        ref: "customer",
        required: true
    },
    productId: {
        type: ObjectId,
        ref: "product",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    images: [{
        type: String // optional review images
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Review = mongoose.model("review", reviewSchema);
export default Review;
