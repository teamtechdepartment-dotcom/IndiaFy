import mongoose from "mongoose";

const recommendationInsightSchema = new mongoose.Schema({
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
    surface: { type: String, required: true },
    
    // Aggregation identity ensures idempotency
    snapshotId: { type: String, required: true, unique: true },

    explorationImpressions: { type: Number, default: 0 },
    explorationClicks: { type: Number, default: 0 },
    explorationWishlistAdds: { type: Number, default: 0 },
    explorationCartAdds: { type: Number, default: 0 },
    explorationPurchases: { type: Number, default: 0 },
    explorationRevenue: { type: Number, default: 0 },

    exploitationImpressions: { type: Number, default: 0 },
    exploitationClicks: { type: Number, default: 0 },
    exploitationWishlistAdds: { type: Number, default: 0 },
    exploitationCartAdds: { type: Number, default: 0 },
    exploitationPurchases: { type: Number, default: 0 },
    exploitationRevenue: { type: Number, default: 0 },

    recommendationRevenue: { type: Number, default: 0 },
    organicRevenue: { type: Number, default: 0 },

    coldStartImpressions: { type: Number, default: 0 },
    coldStartClicks: { type: Number, default: 0 },
    coldStartCartAdds: { type: Number, default: 0 },
    coldStartPurchases: { type: Number, default: 0 },

    categoryDiscoveries: { type: Number, default: 0 },
    eligibleExplorationInteractions: { type: Number, default: 0 },

    explorationToExploitationTransitions: { type: Number, default: 0 },
    eligibleExplorationTransitions: { type: Number, default: 0 },

    generatedAt: { type: Date, default: Date.now }
});

const RecommendationInsight = mongoose.model("recommendationInsight", recommendationInsightSchema);

export default RecommendationInsight;
