/**
 * In-memory Observability and Health Monitoring for Recommendation Engine
 * These metrics are volatile and reset on server restart.
 */

const RECOMMENDATION_HEALTH_THRESHOLDS = {
    maxP95LatencyMs: 250,
    maxErrorRate: 0.02,
    maxEmptyRate: 0.10,
    minCandidatePool: 5
};

const metrics = {
    requests: { total: 0, success: 0, errors: 0 },
    errors: {
        LOCATION_ERROR: 0,
        INTEREST_ERROR: 0,
        CANDIDATE_ERROR: 0,
        RANKING_ERROR: 0,
        DATABASE_ERROR: 0,
        TIMEOUT: 0,
        UNKNOWN: 0
    },
    latency: {
        samples: [], // Store last 1000 samples for percentiles
        maxSamples: 1000
    },
    location: {
        locationRequests: 0, locationSuccess: 0, locationUnavailable: 0, locationInvalid: 0,
        nearbyNodeFound: 0, nearbyNodeEmpty: 0
    },
    interest: {
        sessionProfileAvailable: 0, persistentProfileAvailable: 0, combinedProfileAvailable: 0, coldStartRequests: 0
    },
    candidates: {
        localCandidates: 0, globalCandidates: 0, totalCandidates: 0, emptyCandidatePoolCount: 0,
        localTierUsed: 0, globalTierUsed: 0, localOnly: 0, fallbackOnly: 0, mixedLocalGlobal: 0
    },
    exploration: {
        explorationEligibleCandidates: 0, explorationSelected: 0, exploitationSelected: 0,
        explorationBudgetRequested: 0, explorationBudgetFilled: 0
    },
    diversity: {
        uniqueCategoriesSum: 0, uniqueBrandsSum: 0, feedsCount: 0
    },
    surfaces: {
        homepage: { requests: 0, success: 0, errors: 0 },
        search: { requests: 0, success: 0, errors: 0 }
    },
    variants: {} // Dynamically populated keys
};

const getVariantMetrics = (variant) => {
    if (!variant) return null;
    if (!metrics.variants[variant]) {
        metrics.variants[variant] = {
            requests: 0,
            success: 0,
            errors: 0,
            empty: 0,
            latencySamples: []
        };
    }
    return metrics.variants[variant];
};

const recordLatency = (ms) => {
    metrics.latency.samples.push(ms);
    if (metrics.latency.samples.length > metrics.latency.maxSamples) {
        metrics.latency.samples.shift(); // rolling window
    }
};

const calculatePercentile = (sorted, p) => {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
};

export const recordRecommendationRequest = (surface, variant) => {
    metrics.requests.total++;
    if (surface === 'homepage_recommendation') metrics.surfaces.homepage.requests++;
    if (surface === 'search_recommendation') metrics.surfaces.search.requests++;
    
    const vMetrics = getVariantMetrics(variant);
    if (vMetrics) vMetrics.requests++;
};

export const recordRecommendationSuccess = (surface, executionTimeMs, candidateData, finalResults, variant) => {
    metrics.requests.success++;
    if (surface === 'homepage_recommendation') metrics.surfaces.homepage.success++;
    if (surface === 'search_recommendation') metrics.surfaces.search.success++;
    
    recordLatency(executionTimeMs);
    const vMetrics = getVariantMetrics(variant);
    if (vMetrics) {
        vMetrics.success++;
        vMetrics.latencySamples.push(executionTimeMs);
        if (vMetrics.latencySamples.length > metrics.latency.maxSamples) {
            vMetrics.latencySamples.shift();
        }
    }

    // Candidates
    const { localCandidates, globalCandidates, totalCandidates } = candidateData;
    metrics.candidates.localCandidates += localCandidates;
    metrics.candidates.globalCandidates += globalCandidates;
    metrics.candidates.totalCandidates += totalCandidates;
    
    if (totalCandidates === 0) {
        metrics.candidates.emptyCandidatePoolCount++;
        if (vMetrics) vMetrics.empty++;
    }
    
    if (localCandidates > 0) metrics.candidates.localTierUsed++;
    if (globalCandidates > 0) metrics.candidates.globalTierUsed++;
    if (localCandidates > 0 && globalCandidates === 0) metrics.candidates.localOnly++;
    if (globalCandidates > 0 && localCandidates === 0) metrics.candidates.fallbackOnly++;
    if (localCandidates > 0 && globalCandidates > 0) metrics.candidates.mixedLocalGlobal++;

    // Exploration
    let explorationCount = 0;
    let exploitationCount = 0;
    let uniqueCategories = new Set();
    let uniqueBrands = new Set();

    finalResults.forEach(item => {
        if (item.product?.metadata?.recommendationMode === 'exploration') {
            explorationCount++;
        } else {
            exploitationCount++;
        }
        uniqueCategories.add(item.product?.categoryName);
        uniqueBrands.add(item.product?.brand);
    });

    metrics.exploration.explorationSelected += explorationCount;
    metrics.exploration.exploitationSelected += exploitationCount;
    
    metrics.diversity.feedsCount++;
    metrics.diversity.uniqueCategoriesSum += uniqueCategories.size;
    metrics.diversity.uniqueBrandsSum += uniqueBrands.size;
};

export const recordExplorationEligible = (eligibleCount, budgetRequested, budgetFilled) => {
    metrics.exploration.explorationEligibleCandidates += eligibleCount;
    metrics.exploration.explorationBudgetRequested += budgetRequested;
    metrics.exploration.explorationBudgetFilled += budgetFilled;
};

export const recordRecommendationError = (surface, errorType, variant) => {
    metrics.requests.errors++;
    if (metrics.errors[errorType] !== undefined) {
        metrics.errors[errorType]++;
    } else {
        metrics.errors.UNKNOWN++;
    }

    if (surface === 'homepage_recommendation') metrics.surfaces.homepage.errors++;
    if (surface === 'search_recommendation') metrics.surfaces.search.errors++;
    
    const vMetrics = getVariantMetrics(variant);
    if (vMetrics) vMetrics.errors++;
};

export const recordLocationHealth = ({ requested, success, unavailable, invalid, nodeFound, nodeEmpty }) => {
    if (requested) metrics.location.locationRequests++;
    if (success) metrics.location.locationSuccess++;
    if (unavailable) metrics.location.locationUnavailable++;
    if (invalid) metrics.location.locationInvalid++;
    if (nodeFound) metrics.location.nearbyNodeFound++;
    if (nodeEmpty) metrics.location.nearbyNodeEmpty++;
};

export const recordInterestHealth = ({ session, persistent, coldStart }) => {
    if (session) metrics.interest.sessionProfileAvailable++;
    if (persistent) metrics.interest.persistentProfileAvailable++;
    if (session && persistent) metrics.interest.combinedProfileAvailable++;
    if (coldStart) metrics.interest.coldStartRequests++;
};

export const getRecommendationHealth = () => {
    const sortedLatency = [...metrics.latency.samples].sort((a, b) => a - b);
    const p50 = calculatePercentile(sortedLatency, 50);
    const p95 = calculatePercentile(sortedLatency, 95);
    const p99 = calculatePercentile(sortedLatency, 99);

    const errorRate = metrics.requests.total > 0 ? metrics.requests.errors / metrics.requests.total : 0;
    const emptyRate = metrics.requests.total > 0 ? metrics.candidates.emptyCandidatePoolCount / metrics.requests.total : 0;
    const avgCandidates = metrics.requests.total > 0 ? Math.round(metrics.candidates.totalCandidates / metrics.requests.total) : 0;

    let status = "HEALTHY";
    if (errorRate > RECOMMENDATION_HEALTH_THRESHOLDS.maxErrorRate) {
        status = "CRITICAL";
    } else if (p95 > RECOMMENDATION_HEALTH_THRESHOLDS.maxP95LatencyMs || emptyRate > RECOMMENDATION_HEALTH_THRESHOLDS.maxEmptyRate) {
        status = "WARNING";
    }

    return {
        status,
        latency: { p50, p95, p99 },
        requests: {
            total: metrics.requests.total,
            success: metrics.requests.success,
            errors: metrics.requests.errors
        },
        errorBreakdown: { ...metrics.errors },
        candidates: {
            average: avgCandidates,
            emptyRate: parseFloat(emptyRate.toFixed(4)),
            localOnly: metrics.candidates.localOnly,
            fallbackOnly: metrics.candidates.fallbackOnly,
            mixedLocalGlobal: metrics.candidates.mixedLocalGlobal
        },
        location: {
            successRate: metrics.location.locationRequests > 0 ? parseFloat((metrics.location.locationSuccess / metrics.location.locationRequests).toFixed(4)) : 0,
            emptyRate: metrics.location.nearbyNodeFound > 0 ? parseFloat((metrics.location.nearbyNodeEmpty / metrics.location.nearbyNodeFound).toFixed(4)) : 0
        },
        exploration: {
            eligible: metrics.exploration.explorationEligibleCandidates,
            selected: metrics.exploration.explorationSelected,
            fillRate: metrics.exploration.explorationBudgetRequested > 0 ? parseFloat((metrics.exploration.explorationBudgetFilled / metrics.exploration.explorationBudgetRequested).toFixed(4)) : 0
        },
        diversity: {
            avgUniqueCategories: metrics.diversity.feedsCount > 0 ? parseFloat((metrics.diversity.uniqueCategoriesSum / metrics.diversity.feedsCount).toFixed(2)) : 0,
            avgUniqueBrands: metrics.diversity.feedsCount > 0 ? parseFloat((metrics.diversity.uniqueBrandsSum / metrics.diversity.feedsCount).toFixed(2)) : 0
        },
        surfaces: metrics.surfaces,
        variants: Object.keys(metrics.variants).reduce((acc, v) => {
            const vm = metrics.variants[v];
            const sorted = [...vm.latencySamples].sort((a, b) => a - b);
            acc[v] = {
                requests: vm.requests,
                success: vm.success,
                errors: vm.errors,
                empty: vm.empty,
                p50: calculatePercentile(sorted, 50),
                p95: calculatePercentile(sorted, 95),
                p99: calculatePercentile(sorted, 99)
            };
            return acc;
        }, {}),
        thresholds: { ...RECOMMENDATION_HEALTH_THRESHOLDS }
    };
};
