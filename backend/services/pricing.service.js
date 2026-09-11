import Campaign from "../models/campaigns/campaign.model.js";
import ProductModel from "../models/products/product.model.js";

/**
 * Helper to safely round numbers to 2 decimal places to prevent floating point inaccuracies.
 */
export const roundToTwoDecimals = (num) => {
  return Math.round((Number(num) || 0) * 100) / 100;
};

/**
 * Fetches all currently active campaigns based on server timestamp.
 * A campaign is considered active if:
 * 1. status is 'active'
 * 2. startDate <= now <= endDate
 *
 * @param {Date} checkDate
 * @returns {Promise<Array>}
 */
export const getActiveCampaigns = async (checkDate = new Date()) => {
  return await Campaign.find({
    status: "active",
    startDate: { $lte: checkDate },
    endDate: { $gte: checkDate },
  }).lean();
};

/**
 * Resolves effective campaign pricing for a single product against a list of active campaigns.
 *
 * RULE: If a product is present in multiple active campaigns, the campaign providing
 * the HIGHEST discount percentage wins deterministically. No discount stacking.
 *
 * @param {Object} product - Product document or object
 * @param {Array} activeCampaigns - Array of active campaigns
 * @returns {Object} Pricing breakdown
 */
export const resolveProductPricing = (product, activeCampaigns = []) => {
  if (!product) {
    return {
      originalPrice: 0,
      salePrice: 0,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      campaign: null,
    };
  }

  const pId = String(product._id || product.id || "");
  const rawOriginalPrice =
    product.attribute?.salePrice !== undefined && product.attribute?.salePrice !== null
      ? product.attribute.salePrice
      : (product.price || 0);

  const originalPrice = roundToTwoDecimals(rawOriginalPrice);

  // Find all campaigns that include this product
  const matchingCampaigns = activeCampaigns.filter((campaign) =>
    campaign.products?.some(
      (cp) => String(cp.productId) === pId
    )
  );

  if (!matchingCampaigns || matchingCampaigns.length === 0) {
    return {
      originalPrice,
      salePrice: originalPrice,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      campaign: null,
    };
  }

  // Deterministic conflict resolution: Sort descending by discountValue. Highest discount wins.
  // Secondary sort by latest createdAt / update for determinism.
  matchingCampaigns.sort((a, b) => {
    const diff = (b.discountValue || 0) - (a.discountValue || 0);
    if (diff !== 0) return diff;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const bestCampaign = matchingCampaigns[0];
  const discountType = bestCampaign.discountType || "percentage";
  const discountValue = Number(bestCampaign.discountValue) || 0;

  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = roundToTwoDecimals((originalPrice * discountValue) / 100);
  } else if (discountType === "fixed") {
    discountAmount = roundToTwoDecimals(Math.min(originalPrice, discountValue));
  }

  const salePrice = roundToTwoDecimals(Math.max(0, originalPrice - discountAmount));

  return {
    originalPrice,
    salePrice,
    discountType,
    discountValue,
    discountAmount,
    campaign: {
      id: bestCampaign._id?.toString() || bestCampaign.id,
      _id: bestCampaign._id,
      name: bestCampaign.name,
      discountType,
      discountValue,
      badgeText: bestCampaign.badgeText || "Sale",
    },
  };
};

/**
 * Batched pricing decorator for product lists or single product.
 * Executes ONE single DB query for campaigns matching any of the supplied product IDs.
 *
 * Attaches pricing fields backward-compatibly without modifying stored database records.
 *
 * @param {Array|Object} products - Array of product objects/documents or a single product
 * @param {Date} checkDate - Reference timestamp
 * @returns {Promise<Array|Object>} Decorated products
 */
export const attachCampaignPricingToProducts = async (products, checkDate = new Date()) => {
  if (!products) return products;

  const isArray = Array.isArray(products);
  const productList = isArray ? products : [products];

  if (productList.length === 0) {
    return isArray ? [] : null;
  }

  // 1. Collect all product ObjectIds
  const productIds = productList
    .map((p) => p._id || p.id)
    .filter(Boolean);

  if (productIds.length === 0) {
    return products;
  }

  // 2. Fetch all active campaigns that contain any of these product IDs in ONE single batched query
  const activeCampaigns = await Campaign.find({
    status: "active",
    startDate: { $lte: checkDate },
    endDate: { $gte: checkDate },
    "products.productId": { $in: productIds },
  }).lean();

  // 3. Decorate each product
  for (let i = 0; i < productList.length; i++) {
    let p = productList[i];

    // If it's a Mongoose document, convert or work directly with plain representation
    const isMongoose = typeof p.toObject === "function";
    const plain = isMongoose ? p.toObject() : p;

    const pricing = resolveProductPricing(plain, activeCampaigns);

    if (pricing.campaign) {
      // Product has an active campaign applied
      plain.originalPrice = pricing.originalPrice;
      plain.salePrice = pricing.salePrice;
      plain.price = pricing.salePrice; // Backward-compatible root price
      plain.pricing = pricing;
      plain.campaign = pricing.campaign;
      plain.discountPercentage = pricing.discountValue;

      if (plain.attribute) {
        if (!plain.attribute.originalSellerPrice) {
          plain.attribute.originalSellerPrice = pricing.originalPrice;
        }
        plain.attribute.salePrice = pricing.salePrice;
      }
    } else {
      // No active campaign
      plain.originalPrice = pricing.originalPrice;
      plain.salePrice = pricing.originalPrice;
      plain.pricing = pricing;
      plain.campaign = null;
    }

    if (isMongoose) {
      // Also mutate the in-memory mongoose doc properties for callers that expect the doc
      p.originalPrice = plain.originalPrice;
      p.salePrice = plain.salePrice;
      p.price = plain.price;
      p.pricing = plain.pricing;
      p.campaign = plain.campaign;
      p.discountPercentage = plain.discountPercentage;
      if (p.attribute) {
        p.attribute.salePrice = plain.attribute?.salePrice;
        p.attribute.originalSellerPrice = plain.attribute?.originalSellerPrice;
      }
      if (p._doc) {
        p._doc.originalPrice = plain.originalPrice;
        p._doc.salePrice = plain.salePrice;
        p._doc.price = plain.price;
        p._doc.pricing = plain.pricing;
        p._doc.campaign = plain.campaign;
        p._doc.discountPercentage = plain.discountPercentage;
        if (p._doc.attribute) {
          p._doc.attribute.salePrice = plain.attribute?.salePrice;
          p._doc.attribute.originalSellerPrice = plain.attribute?.originalSellerPrice;
        }
      }
      productList[i] = p;
    } else {
      productList[i] = plain;
    }
  }

  return isArray ? productList : productList[0];
};

/**
 * Resolves single item pricing by fetching product and checking active campaigns.
 * Used during Cart Add/Checkout validation to prevent trusting client prices.
 *
 * @param {string|ObjectId} productId
 * @param {Date} checkDate
 * @returns {Promise<{ product: Object, pricing: Object }>}
 */
export const resolveItemEffectivePrice = async (productId, checkDate = new Date()) => {
  const product = await ProductModel.findById(productId).lean();
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const activeCampaigns = await Campaign.find({
    status: "active",
    startDate: { $lte: checkDate },
    endDate: { $gte: checkDate },
    "products.productId": product._id,
  }).lean();

  const pricing = resolveProductPricing(product, activeCampaigns);
  return { product, pricing };
};

export default {
  roundToTwoDecimals,
  getActiveCampaigns,
  resolveProductPricing,
  attachCampaignPricingToProducts,
  resolveItemEffectivePrice,
};
