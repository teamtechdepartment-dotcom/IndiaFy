import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const interestEntrySchema = new Schema({
    score: { type: Number, default: 0 },
    lastInteractionAt: { type: Date, default: Date.now },
    interactionCount: { type: Number, default: 0 }
}, { _id: false });

const categoryInterestSchema = new Schema({
    categoryName: { type: String, required: true },
    ...interestEntrySchema.obj
}, { _id: false });

const brandInterestSchema = new Schema({
    brand: { type: String, required: true },
    ...interestEntrySchema.obj
}, { _id: false });

const productInterestSchema = new Schema({
    productId: { type: ObjectId, ref: "product", required: true },
    ...interestEntrySchema.obj
}, { _id: false });

const interestProfileSchema = new Schema(
    {
        customerId: {
            type: ObjectId,
            ref: "customer",
            default: null,
            index: true
        },
        anonymousId: {
            type: String,
            default: null,
            index: true
        },
        categoryInterests: [categoryInterestSchema],
        brandInterests: [brandInterestSchema],
        productInterests: [productInterestSchema]
    },
    { timestamps: true }
);

// Ensure one profile per customer or anonymous user
interestProfileSchema.index({ customerId: 1 }, { unique: true, partialFilterExpression: { customerId: { $type: "objectId" } } });
interestProfileSchema.index({ anonymousId: 1 }, { unique: true, partialFilterExpression: { anonymousId: { $type: "string" } } });

const InterestProfile = mongoose.model("interest_Profile", interestProfileSchema);

export default InterestProfile;
