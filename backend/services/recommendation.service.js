import Product from '../models/products/product.model.js';
import locationService from './location.service.js';
import { getCombinedInterestProfile } from './interaction.service.js';
import mongoose from 'mongoose';
import {
    recordRecommendationRequest,
    recordRecommendationSuccess,
    recordRecommendationError,
    recordLocationHealth,
    recordInterestHealth,
    recordExplorationEligible
} from './recommendationObservability.service.js';
import { getExperimentAssignment } from './recommendationExperiment.service.js';

const DEFAULT_RECOMMENDATION_LIMIT = 20;
const MAX_RECOMMENDATION_LIMIT = 50;

const RECOMMENDATION_WEIGHTS = {
    location: 0.40,
    interest: 0.30,
    search: 0.10,
    popularity: 0.15,
    availability: 0.05
};

// Phase 8.3 Centralized Configuration
export const EXPLORATION_CONFIG = {
    minScore: 0.30, // Safe bound: >= 0.20
    maxRatio: 0.20, // Safe bound: 0.00 to 0.20
    confidence: {
        search: 0.8, // Safe bound: 0.00 to 1.00
        session: 0.6,
        persistent: 0.3
    }
};

// Enforce safe bounds dynamically
EXPLORATION_CONFIG.minScore = Math.max(0.20, EXPLORATION_CONFIG.minScore);
EXPLORATION_CONFIG.maxRatio = Math.max(0.00, Math.min(0.20, EXPLORATION_CONFIG.maxRatio));
EXPLORATION_CONFIG.confidence.search = Math.max(0.00, Math.min(1.00, EXPLORATION_CONFIG.confidence.search));
EXPLORATION_CONFIG.confidence.session = Math.max(0.00, Math.min(1.00, EXPLORATION_CONFIG.confidence.session));
EXPLORATION_CONFIG.confidence.persistent = Math.max(0.00, Math.min(1.00, EXPLORATION_CONFIG.confidence.persistent));

const normalizeString = (str) => {
    if (!str) return "__unknown__";
    return str.toString().trim().toLowerCase().replace(/\s+/g, ' ');
};

const DIVERSITY_MULTIPLIERS = [1.00, 0.92, 0.82, 0.70, 0.60, 0.50];

const getDiversityMultiplier = (count) => {
    if (count < DIVERSITY_MULTIPLIERS.length) return DIVERSITY_MULTIPLIERS[count];
    return 0.40; // Floor for high repetition
};

const normalizeActiveWeights = (baseWeights, hasLocation, hasSearch, hasInterest) => {
    let activeWeights = { ...baseWeights };
    let totalWeight = 1.0;
    
    // Safety check - recompute total weight if it's not exactly 1
    totalWeight = activeWeights.location + activeWeights.interest + activeWeights.search + activeWeights.popularity + activeWeights.availability;

    if (!hasLocation) {
        totalWeight -= activeWeights.location;
        activeWeights.location = 0;
    }
    if (!hasSearch) {
        totalWeight -= activeWeights.search;
        activeWeights.search = 0;
    }
    if (!hasInterest) {
        totalWeight -= activeWeights.interest;
        activeWeights.interest = 0;
    }

    if (totalWeight <= 0) return activeWeights; // Should never happen logically

    // Renormalize
    return {
        location: activeWeights.location / totalWeight,
        interest: activeWeights.interest / totalWeight,
        search: activeWeights.search / totalWeight,
        popularity: activeWeights.popularity / totalWeight,
        availability: activeWeights.availability / totalWeight
    };
};

const calculateLocationScore = (distanceMeters) => {
    if (distanceMeters === null || distanceMeters === undefined) return 0;
    // max(0, 1 - distanceMeters / 5000)
    return Math.max(0, 1 - (distanceMeters / 5000));
};

const getEntityScore = (entitiesList, entityId, isString = false) => {
    if (!entitiesList || entitiesList.length === 0 || !entityId) return 0;
    const searchId = isString ? entityId.toLowerCase().trim() : entityId.toString();
    const found = entitiesList.find(e => e.id === searchId);
    return found ? found.score : 0;
};

const calculateInterestScore = (product, sessionInterest, persistentInterest) => {
    if (!sessionInterest && !persistentInterest) return 0;

    const calculateForProfile = (profile) => {
        if (!profile) return 0;
        
        const prodScore = getEntityScore(profile.products, product._id);
        const brandScore = getEntityScore(profile.brands, product.brand, true);
        const catScore = getEntityScore(profile.categories, product.categoryName, true);

        // Product Interest -> strongest, Brand -> medium, Category -> supporting
        // Combine them avoiding double counting exceeding 1.0
        // e.g. 0.6 * Prod + 0.3 * Brand + 0.1 * Cat (if all match perfectly)
        const combined = (0.6 * prodScore) + (0.3 * brandScore) + (0.1 * catScore);
        return Math.min(1.0, combined);
    };

    const sessionScore = calculateForProfile(sessionInterest);
    const persistentScore = calculateForProfile(persistentInterest);

    // Session = 0.60, Persistent = 0.40
    return (0.60 * sessionScore) + (0.40 * persistentScore);
};

const calculatePopularityScore = (totalSales, totalViews, maxSalesSignal, maxViewsSignal) => {
    const salesSignal = Math.log10(1 + (totalSales || 0));
    const viewsSignal = Math.log10(1 + (totalViews || 0));

    const normSales = maxSalesSignal > 0 ? salesSignal / maxSalesSignal : 0;
    const normViews = maxViewsSignal > 0 ? viewsSignal / maxViewsSignal : 0;

    return (0.70 * normSales) + (0.30 * normViews);
};

const calculateAvailabilityScore = (product) => {
    if (!product.isActive || product.isDeleted || product.status !== "ACTIVE") return 0;
    if (product.stock > product.lowStockThreshold) return 1.0;
    if (product.stock > 0) return 0.5; // Low stock
    return 0.0; // Out of stock
};

const calculateSearchScore = (product, searchQuery) => {
    if (!searchQuery) return 0;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return 0;

    let score = 0;
    const name = (product.productName || "").toLowerCase();
    const desc = (product.description || "").toLowerCase();
    const cat = (product.categoryName || "").toLowerCase();
    const brand = (product.brand || "").toLowerCase();

    if (name === query) score = 1.0;
    else if (name.includes(query)) score = 0.8;
    else if (brand === query) score = 0.7;
    else if (cat === query) score = 0.6;
    else if (desc.includes(query)) score = 0.4;

    // Use MongoDB text search score if available from the aggregation pipeline
    if (product.textScore) {
        // textScore can be > 1.0, normalize it heuristically or just cap
        const normalizedTextScore = Math.min(1.0, product.textScore / 10.0);
        score = Math.max(score, normalizedTextScore);
    }

    return score;
};

/**
 * Main candidate generation and ranking engine
 */
export const getRecommendations = async ({ 
    latitude, 
    longitude, 
    sessionId, 
    customerId, 
    anonymousId, 
    searchQuery, 
    limit = DEFAULT_RECOMMENDATION_LIMIT 
}) => {
    const startTime = Date.now();
    const hasSearch = !!(searchQuery && searchQuery.trim());
    const surface = hasSearch ? 'search_recommendation' : 'homepage_recommendation';
    
    // Experiment Assignment First (Need it for request telemetry)
    const experimentAssignment = getExperimentAssignment("ranking_v1", customerId, anonymousId, sessionId);
    const baseWeights = experimentAssignment.config;

    recordRecommendationRequest(surface, experimentAssignment.variant);



    try {
        const finalLimit = Math.min(limit, MAX_RECOMMENDATION_LIMIT);
        
        let hasLocation = false;
        let nearbyNodesMap = new Map();

        if (latitude && longitude) {
            try {
                const nodes = await locationService.getNearbySellerNodes(latitude, longitude, 5000);
                recordLocationHealth({
                    requested: true,
                    success: true,
                    unavailable: false,
                    invalid: false,
                    nodeFound: nodes && nodes.length > 0,
                    nodeEmpty: !nodes || nodes.length === 0
                });
                if (nodes && nodes.length > 0) {
                    hasLocation = true;
                    nodes.forEach(n => {
                        nearbyNodesMap.set(n._id.toString(), n.distanceMeters);
                    });
                }
            } catch (err) {
                recordLocationHealth({ requested: true, success: false, unavailable: true, invalid: false, nodeFound: false, nodeEmpty: false });
                recordRecommendationError(surface, 'LOCATION_ERROR', experimentAssignment.variant);
            }
        } else {
            recordLocationHealth({ requested: false, success: false, unavailable: true, invalid: true, nodeFound: false, nodeEmpty: false });
        }

        let sessionInterest = null;
        let persistentInterest = null;
        try {
            const profiles = await getCombinedInterestProfile(customerId, anonymousId, sessionId);
            sessionInterest = profiles.sessionInterest;
            persistentInterest = profiles.persistentInterest;
        } catch (err) {
            recordRecommendationError(surface, 'INTEREST_ERROR', experimentAssignment.variant);
        }

        const hasSessionInterest = sessionInterest && sessionInterest.products && sessionInterest.products.length > 0;
        const hasPersistentInterest = persistentInterest && persistentInterest.products && persistentInterest.products.length > 0;
        const hasInterest = hasSessionInterest || hasPersistentInterest;
        
        recordInterestHealth({
            session: hasSessionInterest,
            persistent: hasPersistentInterest,
            coldStart: !hasSessionInterest && !hasPersistentInterest
        });
    
    // Candidate Generation Pipeline Base Match
    const baseMatch = { status: "ACTIVE", isDeleted: false, isActive: true };
    if (hasSearch) baseMatch.$text = { $search: searchQuery };

    const getPipeline = (limitCount, extraMatch = {}) => {
        const pipeline = [ { $match: { ...baseMatch, ...extraMatch } } ];
        if (hasSearch) {
            pipeline.push({ $addFields: { textScore: { $meta: "textScore" } } });
            pipeline.push({ $sort: { textScore: -1 } });
        } else {
            pipeline.push({ $sort: { totalSales: -1, totalViews: -1 } });
        }
        pipeline.push({ $limit: limitCount });
        return pipeline;
    };

    // Parallel Candidate Fetching (Two-Tier Strategy)
    const promises = [];
    let expectedLocal = 0;
    let expectedGlobal = 0;
    
    if (hasLocation) {
        const localNodeIds = Array.from(nearbyNodesMap.keys()).map(id => new mongoose.Types.ObjectId(id));
        promises.push(Product.aggregate(getPipeline(150, { nodeId: { $in: localNodeIds } })));
        promises.push(Product.aggregate(getPipeline(150)));
        expectedLocal = 1;
        expectedGlobal = 1;
    } else {
        promises.push(Product.aggregate(getPipeline(300)));
        expectedGlobal = 1;
    }

    let resultsBatches = [];
    try {
        resultsBatches = await Promise.all(promises);
    } catch (err) {
        recordRecommendationError(surface, 'CANDIDATE_ERROR');
        resultsBatches = expectedLocal ? [[], []] : [[]];
    }
    
    const localCandidatesCount = expectedLocal ? resultsBatches[0].length : 0;
    const globalCandidatesCount = expectedLocal ? resultsBatches[1].length : resultsBatches[0].length;
    
    const candidates = resultsBatches.flat();

    if (candidates.length === 0) {
        recordRecommendationSuccess(surface, Date.now() - startTime, {
            localCandidates: 0, globalCandidates: 0, totalCandidates: 0
        }, []);
        return {
            products: [],
            context: {
                hasLocation,
                hasSessionInterest,
                hasPersistentInterest,
                hasSearch,
                recommendationExperiment: experimentAssignment.experimentKey,
                recommendationVariant: experimentAssignment.variant
            }
        };
    }

    // Deduplication by productId while resolving best location score
    const deduplicatedMap = new Map();

    // Determine max popularity values for normalization
    let maxSalesSignal = 0;
    let maxViewsSignal = 0;

    for (const prod of candidates) {
        const salesSignal = Math.log10(1 + (prod.totalSales || 0));
        const viewsSignal = Math.log10(1 + (prod.totalViews || 0));
        if (salesSignal > maxSalesSignal) maxSalesSignal = salesSignal;
        if (viewsSignal > maxViewsSignal) maxViewsSignal = viewsSignal;

        const pid = prod._id.toString();
        const nodeDist = nearbyNodesMap.get(prod.nodeId.toString());
        
        if (!deduplicatedMap.has(pid)) {
            prod.bestDistance = nodeDist !== undefined ? nodeDist : null;
            deduplicatedMap.set(pid, prod);
        } else {
            const existing = deduplicatedMap.get(pid);
            if (nodeDist !== undefined && (existing.bestDistance === null || nodeDist < existing.bestDistance)) {
                existing.bestDistance = nodeDist; // Keep the closest node distance
            }
        }
    }

    const uniqueCandidates = Array.from(deduplicatedMap.values());
    const activeWeights = normalizeActiveWeights(baseWeights, hasLocation, hasSearch, hasInterest);

    const scoredProducts = uniqueCandidates.map(prod => {
        const locScore = hasLocation ? calculateLocationScore(prod.bestDistance) : 0;
        const intScore = hasInterest ? calculateInterestScore(prod, sessionInterest, persistentInterest) : 0;
        const popScore = calculatePopularityScore(prod.totalSales, prod.totalViews, maxSalesSignal, maxViewsSignal);
        const availScore = calculateAvailabilityScore(prod);
        const srchScore = hasSearch ? calculateSearchScore(prod, searchQuery) : 0;

        let finalScore = 
            (activeWeights.location * locScore) +
            (activeWeights.interest * intScore) +
            (activeWeights.search * srchScore) +
            (activeWeights.popularity * popScore) +
            (activeWeights.availability * availScore);

        // Safety guards
        if (isNaN(finalScore) || finalScore < 0) finalScore = 0;
        if (finalScore > 1) finalScore = 1;

        return {
            product: prod,
            scores: {
                location: parseFloat(locScore.toFixed(4)) || 0,
                interest: parseFloat(intScore.toFixed(4)) || 0,
                search: parseFloat(srchScore.toFixed(4)) || 0,
                popularity: parseFloat(popScore.toFixed(4)) || 0,
                availability: parseFloat(availScore.toFixed(4)) || 0,
                finalScore: parseFloat(finalScore.toFixed(4)) || 0
            }
        };
    });

    // Base Ranking Logic for Tie-Breakers and initial sort
    // 1. finalScore descending
    // 2. availability descending
    // 3. distance ascending
    // 4. popularity descending
    // 5. deterministic productId tie-breaker
    scoredProducts.sort((a, b) => {
        if (b.scores.finalScore !== a.scores.finalScore) return b.scores.finalScore - a.scores.finalScore;
        if (b.scores.availability !== a.scores.availability) return b.scores.availability - a.scores.availability;
        const distA = a.product.bestDistance !== null ? a.product.bestDistance : 999999;
        const distB = b.product.bestDistance !== null ? b.product.bestDistance : 999999;
        if (distA !== distB) return distA - distB;
        if (b.scores.popularity !== a.scores.popularity) return b.scores.popularity - a.scores.popularity;
        return a.product._id.toString().localeCompare(b.product._id.toString());
    });

    // Diversity Re-ranking Phase
    const diversifiedProducts = [];
    const remaining = [...scoredProducts];
    const categoryCounts = new Map();
    const brandCounts = new Map();

    // We process ALL candidates to find potential exploration items deep in the pool
    const maxDiversityLimit = candidates.length; 

    while (diversifiedProducts.length < maxDiversityLimit && remaining.length > 0) {
        let bestIndex = 0;
        let bestAdjustedScore = -1;

        for (let i = 0; i < remaining.length; i++) {
            const item = remaining[i];
            const cat = normalizeString(item.product.categoryName);
            const brand = normalizeString(item.product.brand || "__unknown_brand__");

            const catMultiplier = getDiversityMultiplier(categoryCounts.get(cat) || 0);
            const brandMultiplier = getDiversityMultiplier(brandCounts.get(brand) || 0);
            
            const diversityMultiplier = catMultiplier * brandMultiplier;
            const adjustedScore = item.scores.finalScore * diversityMultiplier;

            // Strict deterministic resolution
            if (adjustedScore > bestAdjustedScore) {
                bestAdjustedScore = adjustedScore;
                bestIndex = i;
            } else if (adjustedScore === bestAdjustedScore) {
                // Rely on existing sort order
            }
        }

        const chosen = remaining.splice(bestIndex, 1)[0];
        
        const chosenCat = normalizeString(chosen.product.categoryName);
        const chosenBrand = normalizeString(chosen.product.brand || "__unknown_brand__");

        chosen.scores.diversityAdjustedScore = parseFloat(bestAdjustedScore.toFixed(4));
        chosen.scores.diversityMultiplier = parseFloat((getDiversityMultiplier(categoryCounts.get(chosenCat) || 0) * getDiversityMultiplier(brandCounts.get(chosenBrand) || 0)).toFixed(4));
        
        diversifiedProducts.push(chosen);

        categoryCounts.set(chosenCat, (categoryCounts.get(chosenCat) || 0) + 1);
        brandCounts.set(chosenBrand, (brandCounts.get(chosenBrand) || 0) + 1);
    }

    // Candidate Classification and Budget (Phase 8.2 & 8.3)
    const EXPLORATION_MIN_SCORE = EXPLORATION_CONFIG.minScore;
    
    // Determine deterministic confidence based on query strength and interest
    let confidence = 0;
    if (hasSearch) confidence += EXPLORATION_CONFIG.confidence.search;
    if (hasSessionInterest) confidence += EXPLORATION_CONFIG.confidence.session;
    if (hasPersistentInterest) confidence += EXPLORATION_CONFIG.confidence.persistent;
    confidence = Math.min(1.0, confidence);

    const maxExplorationPercent = EXPLORATION_CONFIG.maxRatio;
    // Lower confidence = more exploration budget
    const explorationBudget = Math.floor(finalLimit * maxExplorationPercent * (1.0 - confidence));

    const exploitationList = [];
    const explorationList = [];

    for (const item of diversifiedProducts) {
        // Prepare metadata namespace safely
        item.product.metadata = item.product.metadata || {};

        let isExploration = false;

        // Qualification rule
        if (item.scores.finalScore >= EXPLORATION_MIN_SCORE && item.scores.availability > 0) {
            // Is it highly relevant natively?
            if (item.scores.search > 0.4 || item.scores.interest > 0.4) {
                isExploration = false; // Exploitation
            } else {
                isExploration = true; // High enough score (e.g. popular/nearby) but not direct intent match
            }
        }

        // Search safety override: if explicit search, very hard to be exploration unless closely related
        if (hasSearch && item.scores.search < 0.2) {
            isExploration = false;
        }

        if (isExploration) {
            item.product.metadata.recommendationMode = "exploration";
        } else {
            item.product.metadata.recommendationMode = "exploitation";
        }

        if (!hasSessionInterest && !hasPersistentInterest) {
            item.product.metadata.isColdStart = true;
        }

        item.product.metadata.recommendationExperiment = experimentAssignment.experimentKey;
        item.product.metadata.recommendationVariant = experimentAssignment.variant;

        if (isExploration) {
            explorationList.push(item);
        } else {
            exploitationList.push(item);
        }
    }

    // Controlled Exploration Assembly
    const availableExploration = Math.min(explorationBudget, explorationList.length);
    let neededExploitation = Math.min(finalLimit - availableExploration, exploitationList.length);
    let actualExplorationCount = availableExploration;
    let actualExploitationCount = neededExploitation;

    // Fill logic if candidate pools are unbalanced
    if (actualExplorationCount + actualExploitationCount < finalLimit) {
        actualExploitationCount = Math.min(exploitationList.length, finalLimit - actualExplorationCount);
    }
    if (actualExplorationCount + actualExploitationCount < finalLimit) {
        actualExplorationCount = Math.min(explorationList.length, finalLimit - actualExploitationCount);
    }

    recordExplorationEligible(explorationList.length, explorationBudget, actualExplorationCount);

    const finalExploitation = exploitationList.slice(0, actualExploitationCount);
    const finalExploration = explorationList.slice(0, actualExplorationCount);

    // Deterministic Interleaving: ensures exploration isn't always pushed out of sight at the bottom,
    // placing them proportionally throughout the feed.
    const combinedResults = [];
    let exploIndex = 0;
    let exploraIndex = 0;
    const totalSelected = actualExploitationCount + actualExplorationCount;

    for (let i = 0; i < totalSelected; i++) {
        const expectedExploration = (i + 1) * (actualExplorationCount / totalSelected);
        if (expectedExploration > exploraIndex + 0.5 && exploraIndex < actualExplorationCount) {
            combinedResults.push(finalExploration[exploraIndex++]);
        } else if (exploIndex < actualExploitationCount) {
            combinedResults.push(finalExploitation[exploIndex++]);
        } else {
            combinedResults.push(finalExploration[exploraIndex++]);
        }
    }

    const results = combinedResults.map(item => {
        const prod = { ...item.product };
        delete prod.bestDistance;
        delete prod.textScore;
        // The frontend does not use internal debug scoring information
        // so we drop item.scores here unless we inject it under _debugScores
        if (process.env.NODE_ENV !== 'production') {
            prod._debugScores = item.scores;
        }
        return prod;
    });

    recordRecommendationSuccess(surface, Date.now() - startTime, {
        localCandidates: candidates.filter(c => c.distanceMeters !== undefined).length,
        globalCandidates: candidates.filter(c => c.distanceMeters === undefined).length,
        totalCandidates: candidates.length
    }, results.length, experimentAssignment.variant);

    return {
        products: results,
        context: {
            hasLocation,
            hasSessionInterest,
            hasPersistentInterest,
            hasSearch
        }
    };
};
