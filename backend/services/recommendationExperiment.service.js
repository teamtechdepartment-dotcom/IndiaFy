import crypto from 'crypto';
import Interaction from '../models/customers/interaction.model.js';
import Order from '../models/orders/order.model.js';
import { getRecommendationHealth } from './recommendationObservability.service.js';

export const RECOMMENDATION_EXPERIMENTS = {
    ranking_v1: {
        enabled: true,
        status: "RUNNING",
        trafficPercent: 100, // percentage of traffic subjected to the experiment
        variants: {
            control: {
                weight: 50,
                config: {
                    location: 0.40,
                    interest: 0.30,
                    search: 0.10,
                    popularity: 0.15,
                    availability: 0.05
                }
            },
            experimentA: {
                weight: 50,
                config: {
                    location: 0.35,
                    interest: 0.35,
                    search: 0.10,
                    popularity: 0.15,
                    availability: 0.05
                }
            }
        }
    }
};

let isConfigValid = true;

const validateExperimentConfig = () => {
    try {
        for (const [key, exp] of Object.entries(RECOMMENDATION_EXPERIMENTS)) {
            if (typeof exp.enabled !== 'boolean') throw new Error(`Invalid enabled flag for ${key}`);
            if (!['DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED'].includes(exp.status)) throw new Error(`Invalid status for ${key}`);
            if (exp.trafficPercent < 0 || exp.trafficPercent > 100) throw new Error(`Invalid trafficPercent for ${key}`);
            
            let totalVariantWeight = 0;
            for (const vKey of Object.keys(exp.variants)) {
                const variant = exp.variants[vKey];
                if (variant.weight < 0) throw new Error(`Invalid variant weight for ${vKey}`);
                totalVariantWeight += variant.weight;
                
                const c = variant.config;
                if (c.location < 0 || c.location > 1 || 
                    c.interest < 0 || c.interest > 1 || 
                    c.search < 0 || c.search > 1 || 
                    c.popularity < 0 || c.popularity > 1 || 
                    c.availability < 0 || c.availability > 1) {
                    throw new Error(`Invalid recommendation weight range in ${vKey}`);
                }
                
                const totalRecWeight = c.location + c.interest + c.search + c.popularity + c.availability;
                // Allow small floating point variances, but conceptually should be 1.0
                if (Math.abs(totalRecWeight - 1.0) > 0.001) throw new Error(`Recommendation weights do not total 1.0 in ${vKey}`);
            }
            if (totalVariantWeight <= 0) throw new Error(`Total variant weight must be > 0 for ${key}`);
        }
    } catch (err) {
        console.error("Experiment Config Validation Error:", err.message);
        isConfigValid = false;
    }
};
validateExperimentConfig();

const MIN_EXPERIMENT_IMPRESSIONS = 500;

/**
 * Deterministically buckets a user into a variant.
 */
const getBucket = (hashStr) => {
    // Basic deterministic hash
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) {
        hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
        hash |= 0; // Convert to 32bit int
    }
    return Math.abs(hash) % 100;
};

export const getExperimentAssignment = (experimentKey, customerId, anonymousId, sessionId) => {
    const experiment = RECOMMENDATION_EXPERIMENTS[experimentKey];
    
    // Fallback to control if config invalid, experiment disabled, invalid, or missing
    if (!isConfigValid || !experiment || !experiment.enabled || experiment.status !== "RUNNING") {
        return { experimentKey, variant: "control", bucket: 0, config: RECOMMENDATION_EXPERIMENTS.ranking_v1.variants.control.config };
    }

    // Stable identity preservation rule:
    // If anonymousId is present, we rely on it as the deterministic seed for assignment.
    // This explicitly prevents a user's variant from shifting when they transition from anonymous -> authenticated
    // on the same device. If they log in on a new device with a new anonymousId, they get a new assignment (which is standard).
    // If NO anonymousId exists, fallback to customerId, then sessionId.
    const identity = anonymousId ? anonymousId.toString() : (customerId ? customerId.toString() : (sessionId || "unknown_identity"));
    const hashStr = `${experimentKey}::${identity}`;
    const bucket = getBucket(hashStr);

    // If bucket falls outside traffic percent, they get control natively
    if (bucket >= experiment.trafficPercent) {
        return { experimentKey, variant: "control", bucket, config: experiment.variants.control.config };
    }

    // Determine variant based on relative weights
    const variants = Object.keys(experiment.variants);
    let totalWeight = 0;
    variants.forEach(v => totalWeight += experiment.variants[v].weight);

    // Scale bucket (0 to trafficPercent) to totalWeight space
    const scaledBucket = (bucket / experiment.trafficPercent) * totalWeight;

    let cumulative = 0;
    for (const v of variants) {
        cumulative += experiment.variants[v].weight;
        if (scaledBucket < cumulative) {
            return { experimentKey, variant: v, bucket, config: experiment.variants[v].config };
        }
    }

    return { experimentKey, variant: "control", bucket, config: experiment.variants.control.config };
};

/**
 * Offline analytics for Experiment comparison
 */
export const getRecommendationExperimentMetrics = async (experimentKey, days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchQuery = {
        "metadata.source": "recommendation",
        "metadata.recommendationExperiment": experimentKey,
        "metadata.recommendationVariant": { $in: ["control", "experimentA"] }, // Ignore unknown variants
        createdAt: { $gte: startDate }
    };

    const stats = await Interaction.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: {
                    variant: "$metadata.recommendationVariant",
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

    const createBucket = () => ({ impressions: 0, clicks: 0, wishlistAdds: 0, cartAdds: 0, purchases: 0 });
    
    const variants = {
        control: { overall: createBucket(), homepage_recommendation: createBucket(), search_recommendation: createBucket(), exploration: createBucket(), exploitation: createBucket(), coldStart: createBucket() },
        experimentA: { overall: createBucket(), homepage_recommendation: createBucket(), search_recommendation: createBucket(), exploration: createBucket(), exploitation: createBucket(), coldStart: createBucket() }
    };

    stats.forEach(s => {
        const v = s._id.variant;
        if (variants[v]) {
            const add = (bucket) => {
                bucket.impressions += s.impressions;
                bucket.clicks += s.clicks;
                bucket.wishlistAdds += s.wishlistAdds;
                bucket.cartAdds += s.cartAdds;
                bucket.purchases += s.purchases;
            };

            add(variants[v].overall);
            
            if (s._id.surface === 'homepage_recommendation') add(variants[v].homepage_recommendation);
            if (s._id.surface === 'search_recommendation') add(variants[v].search_recommendation);
            if (s._id.mode === 'exploration') add(variants[v].exploration);
            if (s._id.mode === 'exploitation') add(variants[v].exploitation);
            if (s._id.isColdStart) add(variants[v].coldStart);
        }
    });

    const calcRates = (data) => {
        data.ctr = data.impressions > 0 ? data.clicks / data.impressions : 0;
        data.cartConversion = data.clicks > 0 ? data.cartAdds / data.clicks : 0;
        // purchases represents unique purchases since cart filters duplicates prior to checkout.
        data.purchaseConversion = data.clicks > 0 ? data.purchases / data.clicks : 0;
        data.wishlistConversion = data.clicks > 0 ? data.wishlistAdds / data.clicks : 0;
    };

    for (const v of Object.keys(variants)) {
        Object.values(variants[v]).forEach(calcRates);
    }

    let status = "NO_CLEAR_WINNER";
    let relativeLift = null;
    let absoluteDifference = null;

    if (variants.control.overall.impressions < MIN_EXPERIMENT_IMPRESSIONS || variants.experimentA.overall.impressions < MIN_EXPERIMENT_IMPRESSIONS) {
        status = "INSUFFICIENT_SAMPLE";
    } else {
        const cConv = variants.control.overall.purchaseConversion;
        const eConv = variants.experimentA.overall.purchaseConversion;
        
        if (cConv === 0) {
            status = "INSUFFICIENT_BASELINE";
        } else {
            absoluteDifference = eConv - cConv;
            relativeLift = absoluteDifference / cConv;
            
            if (relativeLift > 0.05) status = "OBSERVED_POSITIVE_LIFT"; // 5% MIN_OBSERVED_LIFT_FOR_LEADERSHIP
            else if (relativeLift > 0) status = "EXPERIMENT_LEADING"; // Small positive
            else if (relativeLift < -0.05) status = "CONTROL_LEADING"; // -5% MIN_OBSERVED_LIFT_FOR_LEADERSHIP
            else if (relativeLift < 0) status = "CONTROL_LEADING"; // Small negative
            else status = "NO_CLEAR_WINNER"; // 0 difference
        }
    }

    return {
        experimentKey,
        days,
        status,
        metrics: variants,
        lift: {
            controlValue: variants.control?.overall?.purchaseConversion || 0,
            experimentValue: variants.experimentA?.overall?.purchaseConversion || 0,
            absoluteDifference,
            relativeLift
        }
    };
};

export const getRecommendationTuningAnalysis = async (experimentKey, days = 7) => {
    // 1. Get base metrics (Impressions, Clicks, Cart Adds, Purchases)
    const baseMetrics = await getRecommendationExperimentMetrics(experimentKey, days);
    
    if (!baseMetrics || !baseMetrics.metrics) {
        throw new Error("Failed to generate base metrics");
    }

    const { control: cMetrics, experimentA: eMetrics } = baseMetrics.metrics;

    // 2. Lookup Revenue for UNIQUE purchases via Interaction -> Order lookup
    // Since doing a large join is expensive, we use the aggregation pipeline carefully
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueMatch = {
        "metadata.source": "recommendation",
        "metadata.recommendationExperiment": experimentKey,
        "metadata.recommendationVariant": { $in: ["control", "experimentA"] },
        action: "PURCHASE",
        purchaseKey: { $type: "string" },
        createdAt: { $gte: startDate }
    };

    const purchases = await Interaction.find(revenueMatch, { 
        purchaseKey: 1, 
        "metadata.recommendationVariant": 1 
    }).lean();

    const orderIdToPurchases = new Map();
    const orderIds = new Set();
    
    purchases.forEach(p => {
        if (!p.purchaseKey) return;
        const parts = p.purchaseKey.split(":");
        if (parts.length >= 2) {
            const oId = parts[0];
            orderIds.add(oId);
            if (!orderIdToPurchases.has(oId)) orderIdToPurchases.set(oId, []);
            orderIdToPurchases.get(oId).push(p);
        }
    });

    let controlRev = 0;
    let expRev = 0;

    if (orderIds.size > 0) {
        const orders = await Order.find({
            _id: { $in: Array.from(orderIds) },
            isPaid: true,
            status: { $nin: ["Cancelled", "Pending", "Failed"] }
        }, { orderItems: 1 }).lean();

        orders.forEach(order => {
            const oIdStr = order._id.toString();
            const matchingPurchases = orderIdToPurchases.get(oIdStr) || [];
            
            const itemMap = new Map();
            if (order.orderItems) {
                order.orderItems.forEach(item => {
                    itemMap.set(item.product.toString(), item.price * item.quantity);
                });
            }

            matchingPurchases.forEach(mp => {
                const parts = mp.purchaseKey.split(":");
                const pId = parts[1];
                const rev = itemMap.get(pId) || 0;
                if (mp.metadata.recommendationVariant === "control") {
                    controlRev += rev;
                } else if (mp.metadata.recommendationVariant === "experimentA") {
                    expRev += rev;
                }
            });
        });
    }

    const cImp = cMetrics.overall.impressions;
    const cClick = cMetrics.overall.clicks;
    const eImp = eMetrics.overall.impressions;
    const eClick = eMetrics.overall.clicks;

    const controlRPI = cImp > 0 ? controlRev / cImp : 0;
    const controlRPC = cClick > 0 ? controlRev / cClick : 0;
    const expRPI = eImp > 0 ? expRev / eImp : 0;
    const expRPC = eClick > 0 ? expRev / eClick : 0;

    const rpiLift = controlRPI > 0 ? (expRPI - controlRPI) / controlRPI : 0;

    // 3. Operational Health
    const health = getRecommendationHealth();
    let cHealth = { p95: 0, errorRate: 0, emptyRate: 0 };
    let eHealth = { p95: 0, errorRate: 0, emptyRate: 0 };

    if (health.variants) {
        if (health.variants.control) {
            cHealth.p95 = health.variants.control.p95 || 0;
            const r = health.variants.control.requests || 1;
            cHealth.errorRate = (health.variants.control.errors || 0) / r;
            cHealth.emptyRate = (health.variants.control.empty || 0) / r;
        }
        if (health.variants.experimentA) {
            eHealth.p95 = health.variants.experimentA.p95 || 0;
            const r = health.variants.experimentA.requests || 1;
            eHealth.errorRate = (health.variants.experimentA.errors || 0) / r;
            eHealth.emptyRate = (health.variants.experimentA.empty || 0) / r;
        }
    }

    // 4. Determine Winner
    let status = baseMetrics.status; // Base status handles MIN thresholds for conversions

    // Health regression check
    const isHealthMateriallyWorse = 
        eHealth.p95 > cHealth.p95 * 1.2 || // 20% latency regression
        eHealth.errorRate > cHealth.errorRate + 0.02 || // +2% error regression
        eHealth.emptyRate > cHealth.emptyRate + 0.05; // +5% empty regression

    if (status === "EXPERIMENT_LEADING") {
        if (isHealthMateriallyWorse) {
            status = "NO_CLEAR_WINNER";
        } else if (rpiLift < 0) {
            status = "NO_CLEAR_WINNER"; // Conversion is up, but revenue is down
        } else if (eClick < 100) {
            status = "INSUFFICIENT_SAMPLE"; // Hard floor of 100 clicks
        }
    } else if (status === "CONTROL_LEADING") {
        if (isHealthMateriallyWorse) {
            // Even worse
        } else if (rpiLift > 0.05 && baseMetrics.lift.relativeLift > -0.05) {
            status = "NO_CLEAR_WINNER"; // Revenue up significantly, conversion down slightly
        }
    }

    let recommendationText = "Current weighting appears balanced.";
    if (status === "EXPERIMENT_LEADING") {
        recommendationText = "Observed evidence favors Experiment A parameter weighting.";
    } else if (status === "CONTROL_LEADING") {
        recommendationText = "Observed evidence favors Control parameter weighting.";
    }

    return {
        experimentKey,
        status,
        primaryMetric: {
            name: "purchaseConversion",
            control: baseMetrics.lift.controlValue,
            experiment: baseMetrics.lift.experimentValue,
            relativeLift: baseMetrics.lift.relativeLift
        },
        revenue: {
            control: controlRev,
            experiment: expRev,
            revenuePerImpressionLift: rpiLift
        },
        operationalHealth: {
            controlP95: cHealth.p95,
            experimentP95: eHealth.p95,
            controlErrorRate: cHealth.errorRate,
            experimentErrorRate: eHealth.errorRate
        },
        recommendation: recommendationText,
        // Include full base metric contexts for UI details
        fullMetrics: {
            control: {
                ...cMetrics.overall,
                revenue: controlRev,
                revenuePerImpression: controlRPI,
                revenuePerClick: controlRPC
            },
            experimentA: {
                ...eMetrics.overall,
                revenue: expRev,
                revenuePerImpression: expRPI,
                revenuePerClick: expRPC
            },
            segments: {
                homepage: { control: cMetrics.homepage_recommendation, experimentA: eMetrics.homepage_recommendation },
                search: { control: cMetrics.search_recommendation, experimentA: eMetrics.search_recommendation },
                exploration: { control: cMetrics.exploration, experimentA: eMetrics.exploration },
                exploitation: { control: cMetrics.exploitation, experimentA: eMetrics.exploitation },
                coldStart: { control: cMetrics.coldStart, experimentA: eMetrics.coldStart }
            }
        }
    };
};
