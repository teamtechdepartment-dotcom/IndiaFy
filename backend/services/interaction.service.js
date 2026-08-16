import Interaction from "../models/customers/interaction.model.js";

// Centralized signal weights for initial behavioral intelligence
export const EVENT_WEIGHTS = {
    SEARCH: 2,
    VIEW: 2,
    CLICK: 3,
    CATEGORY_VIEW: 2,
    WISHLIST_ADD: 5,
    WISHLIST_REMOVE: -5,
    CART_ADD: 6,
    CART_REMOVE: -6,
    PURCHASE: 10
};

const normalizeSearchQuery = (query) => {
    if (!query) return null;
    const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
    return normalized === '' ? null : normalized.substring(0, 100); // max 100 chars
};

const sanitizeMetadata = (metadata) => {
    if (!metadata || typeof metadata !== 'object') return {};
    const sanitized = { ...metadata };
    const forbiddenKeys = ['password', 'token', 'jwt', 'authorization', 'payment', 'creditcard', 'lat', 'lng', 'location'];
    for (const key of Object.keys(sanitized)) {
        if (key === 'recommendationMode') {
            if (sanitized[key] !== 'exploration' && sanitized[key] !== 'exploitation') {
                delete sanitized[key];
            }
            continue;
        }
        if (key === 'isColdStart') {
            if (sanitized[key] !== true) delete sanitized[key];
            continue;
        }
        if (key === 'recommendationExperiment' || key === 'recommendationVariant') {
            // Must be explicitly allowed strings
            if (typeof sanitized[key] !== 'string' || sanitized[key].length > 50) {
                delete sanitized[key];
            }
            continue;
        }
        if (forbiddenKeys.some(fk => key.toLowerCase().includes(fk))) {
            delete sanitized[key];
        }
    }
    // Hard limit size
    if (JSON.stringify(sanitized).length > 2000) return {};
    return sanitized;
};

// Simple in-memory cache for profiles
const profileCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedProfile = (key) => {
    const cached = profileCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
};

const setCachedProfile = (key, data) => {
    profileCache.set(key, { data, timestamp: Date.now() });
};

export const invalidateProfileCache = (customerId, anonymousId, sessionId) => {
    if (sessionId) profileCache.delete(`session_${sessionId}`);
    if (customerId) profileCache.delete(`persistent_${customerId}`);
    if (anonymousId) profileCache.delete(`persistent_${anonymousId}`);
    if (customerId && anonymousId && sessionId) profileCache.delete(`combined_${customerId}_${anonymousId}_${sessionId}`);
};

/**
 * Process a batch of interaction events from the frontend.
 * @param {Array} events - Array of event objects
 * @param {String} customerId - Optional authenticated customer ID
 * @param {String} sessionId - Required anonymous/session ID
 * @param {String} anonymousId - Required anonymous long-lived ID
 */
export const processInteractionBatch = async (events, customerId, sessionId, anonymousId) => {
    if (!events || !Array.isArray(events) || events.length === 0) return;
    if (!sessionId) throw new Error("Session ID is required for interactions");

    const validActions = Object.keys(EVENT_WEIGHTS);
    
    // Server-side deduplication within the batch
    const uniqueEventsMap = new Map();

    const bulkOperations = [];

    for (const event of events) {
        if (!event.action || !validActions.includes(event.action)) continue;
        
        // Basic validation
        if (event.productId && typeof event.productId !== 'string' && typeof event.productId !== 'object') continue;
        
        const normSearch = normalizeSearchQuery(event.searchQuery);
        // Do not process empty searches
        if (event.action === 'SEARCH' && !normSearch) continue;

        const safeMetadata = sanitizeMetadata(event.metadata);
        
        // Build purchaseKey for idempotency
        let purchaseKey = null;
        if (event.action === 'PURCHASE' && safeMetadata.orderId && event.productId) {
            purchaseKey = `${safeMetadata.orderId}:${event.productId}`;
        }

        // Deduplication signature
        let sig = `${event.action}`;
        if (event.action === 'SEARCH') {
            sig += `_${normSearch}`;
        } else if (event.productId) {
            sig += `_${event.productId}`;
        } else if (event.categoryName) {
            sig += `_${event.categoryName}`;
        } else {
            sig += `_${Date.now()}`; // No deduplication possible
        }

        // Enhance intra-batch deduplication for purchases
        if (purchaseKey) {
            sig = `PURCHASE_${purchaseKey}`;
        }
        
        if (!uniqueEventsMap.has(sig)) {
            uniqueEventsMap.set(sig, true);
            
            bulkOperations.push({
                insertOne: {
                    document: {
                        customerId: customerId || null,
                        anonymousId: anonymousId || null,
                        sessionId: sessionId,
                        action: event.action,
                        productId: event.productId || null,
                        categoryName: event.categoryName || null,
                        brand: event.brand || null,
                        searchQuery: normSearch,
                        metadata: safeMetadata,
                        purchaseKey: purchaseKey,
                        createdAt: event.timestamp ? new Date(event.timestamp) : new Date()
                    }
                }
            });
        }
    }

    if (bulkOperations.length > 0) {
        try {
            // Execute bulk insert (unordered to continue on error like duplicate purchaseKey)
            await Interaction.bulkWrite(bulkOperations, { ordered: false });
        } catch (error) {
            // 11000 is DuplicateKey. We safely ignore duplicate purchase logs
            if (error.code !== 11000 && !error.message?.includes('11000') && !error.message?.includes('E11000')) {
                console.error("Interaction bulk write error:", error);
            }
        }
        
        // Meaningful interaction occurred, invalidate cache
        invalidateProfileCache(customerId, anonymousId, sessionId);
    }
};

/**
 * Calculates scores from pre-aggregated MongoDB actions or Node grouped actions
 * Formula: contribution = BaseWeight * (1 + alpha * log10(count)) * average_decay
 */
const calculateEntityScores = (entities) => {
    const scores = [];
    const alpha = 1.0;

    for (const entity of entities) {
        let totalScore = 0;
        let totalCount = 0;

        for (const actionStats of entity.actions) {
            const baseWeight = EVENT_WEIGHTS[actionStats.action] || 0;
            if (baseWeight === 0) continue;

            const avgDecay = actionStats.decaySum / actionStats.count;
            const actionScore = baseWeight * (1 + alpha * Math.log10(actionStats.count)) * avgDecay;
            
            totalScore += actionScore;
            totalCount += actionStats.count;
        }

        if (totalScore > 0) {
            scores.push({
                id: entity._id,
                score: totalScore,
                interactionCount: totalCount,
                lastInteractionAt: entity.lastInteractionAt
            });
        }
    }
    return scores;
};

/**
 * Normalizes scores to 0-1 bounds and sorts
 */
const normalizeInterests = (scoresList, limit) => {
    let maxScore = 0;
    for (const item of scoresList) {
        if (item.score > maxScore) maxScore = item.score;
    }

    if (maxScore === 0) return [];

    return scoresList
        .map(item => ({
            id: item.id,
            score: parseFloat((item.score / maxScore).toFixed(4)),
            lastInteractionAt: item.lastInteractionAt,
            interactionCount: item.interactionCount
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/**
 * Groups raw session interactions (in Node, safe for small session sizes)
 */
const groupSessionInteractions = (interactions) => {
    const categoryData = new Map();
    const brandData = new Map();
    const productData = new Map();

    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    interactions.forEach(event => {
        const weight = EVENT_WEIGHTS[event.action] || 0;
        if (weight === 0) return;

        const ageMs = now - new Date(event.createdAt).getTime();
        const ageDays = Math.max(0, ageMs / ONE_DAY);
        const decayFactor = Math.pow(0.5, ageDays / 7);

        const updateDict = (dict, id) => {
            if (!id) return;
            if (!dict.has(id)) {
                dict.set(id, { _id: id, actionsMap: new Map(), lastInteractionAt: event.createdAt });
            }
            const entity = dict.get(id);
            if (!entity.actionsMap.has(event.action)) {
                entity.actionsMap.set(event.action, { count: 0, decaySum: 0 });
            }
            const stat = entity.actionsMap.get(event.action);
            stat.count += 1;
            stat.decaySum += decayFactor;

            if (new Date(event.createdAt) > new Date(entity.lastInteractionAt)) {
                entity.lastInteractionAt = event.createdAt;
            }
        };

        if (event.categoryName) {
            const normCat = event.categoryName.trim().toLowerCase().replace(/\s+/g, ' ');
            updateDict(categoryData, normCat);
        }
        if (event.brand) {
            const normBrand = event.brand.trim().toLowerCase().replace(/\s+/g, ' ');
            updateDict(brandData, normBrand);
        }
        if (event.productId) {
            updateDict(productData, event.productId.toString());
        }
    });

    const formatForCalculate = (dict) => {
        return Array.from(dict.values()).map(entity => {
            const actions = Array.from(entity.actionsMap.entries()).map(([action, stats]) => ({
                action,
                count: stats.count,
                decaySum: stats.decaySum
            }));
            return { _id: entity._id, actions, lastInteractionAt: entity.lastInteractionAt };
        });
    };

    return {
        categories: calculateEntityScores(formatForCalculate(categoryData)),
        brands: calculateEntityScores(formatForCalculate(brandData)),
        products: calculateEntityScores(formatForCalculate(productData))
    };
};

/**
 * Short-term session interest profile
 */
export const getSessionInterestProfile = async (sessionId) => {
    if (!sessionId) return { categories: [], brands: [], products: [] };

    const cacheKey = `session_${sessionId}`;
    const cached = getCachedProfile(cacheKey);
    if (cached) return cached;

    // Session limit is reasonable for in-memory Node parsing
    const interactions = await Interaction.find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();

    if (interactions.length === 0) {
        return { categories: [], brands: [], products: [] };
    }

    const { categories, brands, products } = groupSessionInteractions(interactions);

    const result = {
        categories: normalizeInterests(categories, 10),
        brands: normalizeInterests(brands, 10),
        products: normalizeInterests(products, 20)
    };

    setCachedProfile(cacheKey, result);
    return result;
};

/**
 * Executes a MongoDB aggregation pipeline for interest profiling
 */
const aggregateInterestDB = async (matchStage, entityField) => {
    return Interaction.aggregate([
        { $match: { ...matchStage, [entityField]: { $ne: null } } },
        { 
            $project: {
                [entityField]: { $toLower: { $trim: { input: `$${entityField}` } } },
                action: 1,
                createdAt: 1,
                // Pre-calculate age in days for decay formula
                ageDays: {
                    $divide: [
                        { $subtract: [new Date(), "$createdAt"] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },
        {
            $group: {
                _id: { entity: `$${entityField}`, action: "$action" },
                count: { $sum: 1 },
                // decay = 0.5 ^ (ageDays / 7)
                decaySum: {
                    $sum: {
                        $pow: [0.5, { $divide: [{ $max: ["$ageDays", 0] }, 7] }]
                    }
                },
                lastInteractionAt: { $max: "$createdAt" }
            }
        },
        {
            $group: {
                _id: "$_id.entity",
                actions: {
                    $push: {
                        action: "$_id.action",
                        count: "$count",
                        decaySum: "$decaySum"
                    }
                },
                lastInteractionAt: { $max: "$lastInteractionAt" }
            }
        }
    ]);
};

/**
 * Long-term persistent interest profile (authenticated or long-lived anonymous)
 */
export const getPersistentInterestProfile = async (customerId, anonymousId) => {
    if (!customerId && !anonymousId) return { categories: [], brands: [], products: [] };

    const cacheKey = `persistent_${customerId || anonymousId}`;
    const cached = getCachedProfile(cacheKey);
    if (cached) return cached;

    const matchStage = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (customerId && anonymousId) {
        matchStage.$or = [{ customerId: customerId }, { anonymousId: anonymousId }];
    } else if (customerId) {
        matchStage.customerId = customerId;
    } else {
        matchStage.anonymousId = anonymousId;
    }
    matchStage.createdAt = { $gte: thirtyDaysAgo };

    // Run aggregations in parallel to avoid N+1 and minimize latency
    const [catAgg, brandAgg, prodAgg] = await Promise.all([
        aggregateInterestDB(matchStage, "categoryName"),
        aggregateInterestDB(matchStage, "brand"),
        // Special case: productId doesn't need toLower/trim, but the pipeline handles it safely because productId is usually an ObjectId or string
        Interaction.aggregate([
            { $match: { ...matchStage, productId: { $ne: null } } },
            { 
                $project: {
                    productId: 1, action: 1, createdAt: 1,
                    ageDays: { $divide: [ { $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24 ] }
                }
            },
            {
                $group: {
                    _id: { entity: "$productId", action: "$action" },
                    count: { $sum: 1 },
                    decaySum: { $sum: { $pow: [0.5, { $divide: [{ $max: ["$ageDays", 0] }, 7] }] } },
                    lastInteractionAt: { $max: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: "$_id.entity",
                    actions: { $push: { action: "$_id.action", count: "$count", decaySum: "$decaySum" } },
                    lastInteractionAt: { $max: "$lastInteractionAt" }
                }
            }
        ])
    ]);

    const result = {
        categories: normalizeInterests(calculateEntityScores(catAgg), 20),
        brands: normalizeInterests(calculateEntityScores(brandAgg), 20),
        products: normalizeInterests(calculateEntityScores(prodAgg), 40)
    };

    setCachedProfile(cacheKey, result);
    return result;
};

/**
 * Combined interest profile for API output
 */
export const getCombinedInterestProfile = async (customerId, anonymousId, sessionId) => {
    const cacheKey = `combined_${customerId || 'none'}_${anonymousId || 'none'}_${sessionId || 'none'}`;
    const cached = getCachedProfile(cacheKey);
    if (cached) return cached;

    const [sessionInterest, persistentInterest] = await Promise.all([
        getSessionInterestProfile(sessionId),
        getPersistentInterestProfile(customerId, anonymousId)
    ]);

    const result = { sessionInterest, persistentInterest };
    setCachedProfile(cacheKey, result);
    return result;
};
