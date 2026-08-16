import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const interactionSchema = new Schema(
    {
        customerId: {
            type: ObjectId,
            ref: "customer",
            default: null,
            index: true
        },
        anonymousId: {
            type: String,
            index: true,
            default: null
        },
        sessionId: {
            type: String,
            required: true,
            index: true
        },
        action: {
            type: String,
            enum: [
                "VIEW",
                "CLICK",
                "SEARCH",
                "CATEGORY_VIEW",
                "WISHLIST_ADD",
                "WISHLIST_REMOVE",
                "CART_ADD",
                "CART_REMOVE",
                "PURCHASE"
            ],
            required: true,
            index: true
        },
        productId: {
            type: ObjectId,
            ref: "product",
            default: null
        },
        categoryName: {
            type: String,
            default: null
        },
        brand: {
            type: String,
            default: null
        },
        searchQuery: {
            type: String,
            default: null,
            trim: true
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        },
        purchaseKey: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

// Indexes based on query patterns for interest aggregation and recency decay
// Query: interactions by session ordered by time (for short-term session intent)
interactionSchema.index({ sessionId: 1, createdAt: -1 });

// Query: interactions by anonymous identity ordered by time (for long-term anonymous intent)
interactionSchema.index({ anonymousId: 1, createdAt: -1 });

// Query: interactions by customer ordered by time (for long-term authenticated intent)
interactionSchema.index({ customerId: 1, createdAt: -1 });

// Query: recommendation analytics by surface and time
interactionSchema.index({ "metadata.source": 1, "metadata.surface": 1, createdAt: -1 });

// Backend Idempotency: Prevent duplicate purchase events for the same order item
interactionSchema.index(
    { purchaseKey: 1 },
    { 
        unique: true, 
        partialFilterExpression: { purchaseKey: { $type: "string" } } 
    }
);

const Interaction = mongoose.model("interaction", interactionSchema);

export default Interaction;
