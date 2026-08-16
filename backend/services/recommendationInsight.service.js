import Interaction from "../models/customers/interaction.model.js";
import RecommendationInsight from "../models/customers/recommendationInsight.model.js";
import Order from "../models/orders/order.model.js";

/**
 * Generate Offline Recommendation Intelligence Snapshots
 * Supports idempotent bounded batch processing and revenue attribution.
 */
export const generateRecommendationInsights = async ({ startDate, endDate }) => {
    console.log(`[Batch] Starting offline intelligence from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // 1. FAST AGGREGATION: Base Metrics
    const matchQuery = {
        "metadata.source": "recommendation",
        createdAt: { $gte: startDate, $lte: endDate }
    };

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

    const surfaceMap = {};
    const getSurface = (surface) => {
        if (!surfaceMap[surface]) {
            surfaceMap[surface] = {
                explorationImpressions: 0, explorationClicks: 0, explorationWishlistAdds: 0, explorationCartAdds: 0, explorationPurchases: 0,
                exploitationImpressions: 0, exploitationClicks: 0, exploitationWishlistAdds: 0, exploitationCartAdds: 0, exploitationPurchases: 0,
                coldStartImpressions: 0, coldStartClicks: 0, coldStartCartAdds: 0, coldStartPurchases: 0,
                categoryDiscoveries: 0, eligibleExplorationInteractions: 0,
                explorationToExploitationTransitions: 0, eligibleExplorationTransitions: 0,
                explorationRevenue: 0, exploitationRevenue: 0, recommendationRevenue: 0, organicRevenue: 0
            };
        }
        return surfaceMap[surface];
    };

    stats.forEach(s => {
        const surface = s._id.surface || "unknown_surface";
        const data = getSurface(surface);
        
        if (s._id.isColdStart === true) {
            data.coldStartImpressions += s.impressions;
            data.coldStartClicks += s.clicks;
            data.coldStartCartAdds += s.cartAdds;
            data.coldStartPurchases += s.purchases;
        } else if (s._id.mode === "exploration") {
            data.explorationImpressions += s.impressions;
            data.explorationClicks += s.clicks;
            data.explorationWishlistAdds += s.wishlistAdds;
            data.explorationCartAdds += s.cartAdds;
            data.explorationPurchases += s.purchases;
        } else if (s._id.mode === "exploitation") {
            data.exploitationImpressions += s.impressions;
            data.exploitationClicks += s.clicks;
            data.exploitationWishlistAdds += s.wishlistAdds;
            data.exploitationCartAdds += s.cartAdds;
            data.exploitationPurchases += s.purchases;
        }
    });

    // 2. DEEP INTELLIGENCE: Category Discovery & Transitions (BATCHED SCALING)
    const explorationCursor = Interaction.find({
        "metadata.source": "recommendation",
        "metadata.recommendationMode": "exploration",
        action: { $in: ["CLICK", "WISHLIST_ADD", "CART_ADD", "PURCHASE"] },
        createdAt: { $gte: startDate, $lte: endDate }
    }).lean().cursor();

    let processedCount = 0;
    const BATCH_SIZE = 1000;
    let batch = [];

    const processIntelligenceBatch = async (batchItems) => {
        const customerIds = new Set();
        const anonymousIds = new Set();
        const categories = new Set();
        
        let minDate = batchItems[0].createdAt;
        let maxDate = batchItems[0].createdAt;

        for (const item of batchItems) {
            if (item.customerId) customerIds.add(item.customerId.toString());
            if (item.anonymousId) anonymousIds.add(item.anonymousId);
            if (item.categoryName) categories.add(item.categoryName);
            
            if (item.createdAt < minDate) minDate = item.createdAt;
            if (item.createdAt > maxDate) maxDate = item.createdAt;
        }

        const thirtyDaysBefore = new Date(minDate);
        thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
        const thirtyDaysAfter = new Date(maxDate);
        thirtyDaysAfter.setDate(thirtyDaysAfter.getDate() + 30);

        const identityOr = [];
        if (customerIds.size > 0) identityOr.push({ customerId: { $in: Array.from(customerIds) } });
        if (anonymousIds.size > 0) identityOr.push({ anonymousId: { $in: Array.from(anonymousIds) } });

        if (identityOr.length === 0 || categories.size === 0) return;

        // ONE unified query per batch for all historical and future events
        const historyEvents = await Interaction.find({
            $or: identityOr,
            categoryName: { $in: Array.from(categories) },
            action: { $in: ["CLICK", "WISHLIST_ADD", "CART_ADD", "PURCHASE"] },
            createdAt: { $gte: thirtyDaysBefore, $lte: thirtyDaysAfter }
        }).lean();

        // Build O(1) in-memory lookup map
        const historyMap = new Map();
        for (const ev of historyEvents) {
            const uId = ev.customerId ? ev.customerId.toString() : ev.anonymousId;
            if (!uId || !ev.categoryName) continue;
            const key = `${uId}::${ev.categoryName}`;
            if (!historyMap.has(key)) historyMap.set(key, []);
            historyMap.get(key).push(ev);
        }

        for (const interaction of batchItems) {
            const uId = interaction.customerId ? interaction.customerId.toString() : interaction.anonymousId;
            const cat = interaction.categoryName;
            if (!uId || !cat) continue;

            const surface = interaction.metadata?.surface || "unknown_surface";
            const data = getSurface(surface);
            const key = `${uId}::${cat}`;
            const relatedEvents = historyMap.get(key) || [];

            // A. Category Discovery
            data.eligibleExplorationInteractions++;
            const t30Before = new Date(interaction.createdAt);
            t30Before.setDate(t30Before.getDate() - 30);

            const hasPrior = relatedEvents.some(e => e.createdAt >= t30Before && e.createdAt < interaction.createdAt);
            if (!hasPrior) data.categoryDiscoveries++;

            // B. Transition
            data.eligibleExplorationTransitions++;
            const t30After = new Date(interaction.createdAt);
            t30After.setDate(t30After.getDate() + 30);

            const hasFuture = relatedEvents.some(e => 
                e.createdAt > interaction.createdAt && 
                e.createdAt <= t30After &&
                e.metadata?.source === "recommendation" &&
                e.metadata?.recommendationMode === "exploitation"
            );
            if (hasFuture) data.explorationToExploitationTransitions++;
        }
    };

    for await (const interaction of explorationCursor) {
        batch.push(interaction);
        processedCount++;
        if (batch.length >= BATCH_SIZE) {
            await processIntelligenceBatch(batch);
            batch = [];
        }
    }
    if (batch.length > 0) {
        await processIntelligenceBatch(batch);
    }
    console.log(`[Batch] Scaled intelligence processed ${processedCount} interactions in O(${Math.ceil(processedCount/BATCH_SIZE)}) queries.`);

    // 3. REVENUE ATTRIBUTION
    try {
        const purchaseCursor = Interaction.find({
            action: "PURCHASE",
            purchaseKey: { $ne: null, $type: "string" },
            createdAt: { $gte: startDate, $lte: endDate }
        }).lean().cursor();

        let purchaseBatch = [];
        const processRevenueBatch = async (items) => {
            const orderMap = new Map();
            const orderIds = new Set();

            for (const p of items) {
                const parts = p.purchaseKey.split(":");
                if (parts.length < 2) continue;
                const [orderId, productId] = parts;
                orderIds.add(orderId);
                if (!orderMap.has(orderId)) orderMap.set(orderId, []);
                orderMap.get(orderId).push({ productId, interaction: p });
            }

            if (orderIds.size === 0) return;

            // Fetch validated successful orders
            const orders = await Order.find({
                _id: { $in: Array.from(orderIds) },
                isPaid: true,
                status: { $nin: ["Cancelled", "Pending", "Failed"] }
            }).lean();

            for (const order of orders) {
                const orderIdStr = order._id.toString();
                const purchasesInOrder = orderMap.get(orderIdStr) || [];
                
                const itemLookup = new Map();
                order.orderItems.forEach(item => {
                    itemLookup.set(item.product.toString(), item);
                });

                for (const { productId, interaction } of purchasesInOrder) {
                    const orderItem = itemLookup.get(productId);
                    if (!orderItem) continue;

                    // Net calculation if schema supports refund amount. 
                    // Current schema (order.model.js) does NOT have refundAmount natively mapped per item.
                    // Using gross paid price.
                    const itemRevenue = orderItem.price * orderItem.quantity;
                    
                    const source = interaction.metadata?.source || "organic";
                    const mode = interaction.metadata?.recommendationMode || "organic";
                    const surface = interaction.metadata?.surface || "unknown_surface";
                    
                    const data = getSurface(surface);
                    
                    if (source === "organic") {
                        data.organicRevenue += itemRevenue;
                    } else if (source === "recommendation") {
                        data.recommendationRevenue += itemRevenue;
                        if (mode === "exploration") {
                            data.explorationRevenue += itemRevenue;
                        } else if (mode === "exploitation") {
                            data.exploitationRevenue += itemRevenue;
                        }
                    }
                }
            }
        };

        let revProcessedCount = 0;
        for await (const p of purchaseCursor) {
            purchaseBatch.push(p);
            revProcessedCount++;
            if (purchaseBatch.length >= BATCH_SIZE) {
                await processRevenueBatch(purchaseBatch);
                purchaseBatch = [];
            }
        }
        if (purchaseBatch.length > 0) {
            await processRevenueBatch(purchaseBatch);
        }
        console.log(`[Batch] Attributed revenue for ${revProcessedCount} items.`);
    } catch (err) {
        console.error("[Batch] Revenue attribution failed, proceeding with intelligence data.", err);
    }

    // 4. IDEMPOTENT SNAPSHOT PERSISTENCE
    const snapshots = [];
    for (const [surface, metrics] of Object.entries(surfaceMap)) {
        const snapshotId = `rec_insight_${surface}_${startDate.getTime()}_${endDate.getTime()}`;
        
        const snapshotData = {
            windowStart: startDate,
            windowEnd: endDate,
            surface,
            snapshotId,
            ...metrics,
            generatedAt: new Date()
        };
        
        const saved = await RecommendationInsight.findOneAndUpdate(
            { snapshotId },
            { $set: snapshotData },
            { upsert: true, new: true }
        );
        snapshots.push(saved);
    }
    
    return snapshots;
};
