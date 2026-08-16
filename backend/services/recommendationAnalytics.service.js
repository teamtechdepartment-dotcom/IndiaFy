import Interaction from "../models/customers/interaction.model.js";
import { EXPLORATION_CONFIG } from "./recommendation.service.js";

/**
 * Get recommendation analytics for a specific time window
 * @param {Number} days - Time window in days
 */
export const getRecommendationMetrics = async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchQuery = {
        "metadata.source": "recommendation",
        createdAt: { $gte: startDate }
    };

    // Using aggregation to calculate metrics safely and performantly using the new index
    const stats = await Interaction.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: {
                    surface: "$metadata.surface",
                    mode: "$metadata.recommendationMode",
                    isColdStart: "$metadata.isColdStart"
                },
                impressions: { $sum: { $cond: [{ $eq: ["$action", "VIEW"] }, 1, 0] } },
                clicks: { $sum: { $cond: [{ $eq: ["$action", "CLICK"] }, 1, 0] } },
                wishlistAdds: { $sum: { $cond: [{ $eq: ["$action", "WISHLIST_ADD"] }, 1, 0] } },
                cartAdds: { $sum: { $cond: [{ $eq: ["$action", "CART_ADD"] }, 1, 0] } },
                purchases: { $sum: { $cond: [{ $eq: ["$action", "PURCHASE"] }, 1, 0] } }
            }
        }
    ]);

    const formatStats = (result) => {
        const ctr = result.impressions > 0 ? (result.clicks / result.impressions) : 0;
        const wishlistConversion = result.clicks > 0 ? (result.wishlistAdds / result.clicks) : 0;
        const cartConversion = result.clicks > 0 ? (result.cartAdds / result.clicks) : 0;
        const purchaseConversion = result.clicks > 0 ? (result.purchases / result.clicks) : 0;
        return {
            impressions: result.impressions,
            clicks: result.clicks,
            ctr: parseFloat(ctr.toFixed(4)),
            wishlistAdds: result.wishlistAdds,
            wishlistConversion: parseFloat(wishlistConversion.toFixed(4)),
            cartAdds: result.cartAdds,
            cartConversion: parseFloat(cartConversion.toFixed(4)),
            purchases: result.purchases,
            purchaseConversion: parseFloat(purchaseConversion.toFixed(4))
        };
    };

    const emptyStats = () => ({
        impressions: 0, clicks: 0, ctr: 0,
        wishlistAdds: 0, wishlistConversion: 0,
        cartAdds: 0, cartConversion: 0,
        purchases: 0, purchaseConversion: 0
    });

    const response = {
        window: `${days}d`,
        homepage: {
            exploration: emptyStats(),
            exploitation: emptyStats(),
            coldStart: emptyStats()
        },
        search: {
            exploration: emptyStats(),
            exploitation: emptyStats(),
            coldStart: emptyStats()
        },
        discovery: {
            categoryDiscoveryRate: 0, // Placeholder: requires complex cross-session mapping
            explorationToExploitationRate: 0 // Placeholder: requires complex cross-session mapping
        },
        configuration: EXPLORATION_CONFIG
    };

    stats.forEach(s => {
        const surface = s._id.surface === "search_recommendation" ? "search" : "homepage";
        if (s._id.isColdStart === true) {
            response[surface].coldStart = formatStats(s);
        } else {
            const mode = s._id.mode === "exploration" ? "exploration" : "exploitation";
            response[surface][mode] = formatStats(s);
        }
    });

    // Provide safe tuning interpretation
    const evaluate = (stats) => {
        if (stats.impressions < 500) return "Insufficient sample size (< 500 impressions).";
        return `Exploration CTR is ${(stats.ctr * 100).toFixed(1)}%. Purchase Conv is ${(stats.purchaseConversion * 100).toFixed(1)}%.`;
    };

    response.tuningInterpretation = {
        homepage_exploration: evaluate(response.homepage.exploration),
        search_exploration: evaluate(response.search.exploration)
    };

    return {
        success: true,
        data: response
    };
};
