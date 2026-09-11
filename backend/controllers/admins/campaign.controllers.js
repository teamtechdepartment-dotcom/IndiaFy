import mongoose from "mongoose";
import Campaign from "../../models/campaigns/campaign.model.js";
import ProductModel from "../../models/products/product.model.js";
import SellerModel from "../../models/sellers/auth.model.js";
import AdminModel from "../../models/admins/auth.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { logAdminAction } from "../../utils/auditLogger.js";
import { roundToTwoDecimals } from "../../services/pricing.service.js";
import { uploadBase64 } from "../../utils/cloudinary.js";

/**
 * @desc    Get all campaigns with filtering, search, and pagination
 * @route   GET /api/v1/indiafy/admin/management/campaigns
 * @access  Private (Admin)
 */
export const getCampaigns = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  const now = new Date();

  if (status && status !== "all" && status !== "ALL") {
    const s = status.toLowerCase();
    if (s === "active") {
      query.status = "active";
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (s === "expired") {
      query.$or = [
        { status: "expired" },
        { endDate: { $lt: now } }
      ];
    } else if (s === "scheduled") {
      query.$or = [
        { status: "scheduled" },
        { status: "active", startDate: { $gt: now } }
      ];
    } else if (s === "disabled") {
      query.status = "disabled";
    } else if (s === "draft") {
      query.status = "draft";
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Campaign.countDocuments(query);
  const campaigns = await Campaign.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("createdBy", "firstName lastName email")
    .lean();

  // Decorate with live effective status and counts
  const decorated = campaigns.map((c) => {
    let effectiveStatus = c.status;
    if (c.status !== "disabled" && c.status !== "draft") {
      if (now > new Date(c.endDate)) effectiveStatus = "expired";
      else if (now < new Date(c.startDate)) effectiveStatus = "scheduled";
      else effectiveStatus = "active";
    }

    const uniqueSellers = new Set(
      (c.products || []).map((p) => String(p.sellerId)).filter(Boolean)
    );

    return {
      ...c,
      effectiveStatus,
      productCount: c.products?.length || 0,
      sellerCount: uniqueSellers.size,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        campaigns: decorated,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Campaigns fetched successfully"
    )
  );
});

/**
 * @desc    Get single campaign by ID with populated products and preview prices
 * @route   GET /api/v1/indiafy/admin/management/campaigns/:id
 * @access  Private (Admin)
 */
export const getCampaignById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid campaign ID");
  }

  const campaign = await Campaign.findById(id)
    .populate({
      path: "products.productId",
      select: "productName slug productSkuId attribute price productImage categoryName brand stock isActive isDeleted",
    })
    .populate({
      path: "products.sellerId",
      select: "firstName lastName email businessName status",
    })
    .populate("createdBy", "firstName lastName email")
    .lean();

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const now = new Date();
  let effectiveStatus = campaign.status;
  if (campaign.status !== "disabled" && campaign.status !== "draft") {
    if (now > new Date(campaign.endDate)) effectiveStatus = "expired";
    else if (now < new Date(campaign.startDate)) effectiveStatus = "scheduled";
    else effectiveStatus = "active";
  }

  // Filter out any products that were completely deleted from DB, while preserving campaign structural validity
  const validProducts = [];
  const uniqueSellers = new Set();

  for (const item of campaign.products || []) {
    if (!item.productId) continue; // Deleted product safely ignored

    const prod = item.productId;
    const seller = item.sellerId;

    if (seller?._id) {
      uniqueSellers.add(String(seller._id));
    }

    const originalPrice = roundToTwoDecimals(
      prod.attribute?.salePrice !== undefined && prod.attribute?.salePrice !== null
        ? prod.attribute.salePrice
        : (prod.price || 0)
    );

    let discountAmount = 0;
    if (campaign.discountType === "percentage") {
      discountAmount = roundToTwoDecimals((originalPrice * campaign.discountValue) / 100);
    } else {
      discountAmount = roundToTwoDecimals(Math.min(originalPrice, campaign.discountValue));
    }
    const campaignSalePrice = roundToTwoDecimals(Math.max(0, originalPrice - discountAmount));

    validProducts.push({
      productId: prod._id,
      productName: prod.productName,
      slug: prod.slug,
      productSkuId: prod.productSkuId,
      thumbnail: prod.productImage?.[0] || "",
      categoryName: prod.categoryName,
      brand: prod.brand,
      stock: prod.stock,
      isActive: prod.isActive,
      sellerId: seller?._id,
      sellerName: seller ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.businessName || "Seller" : "Unknown Seller",
      sellerEmail: seller?.email || "",
      sellerBusinessName: seller?.businessName || "",
      originalPrice,
      discountAmount,
      salePrice: campaignSalePrice,
    });
  }

  const responseData = {
    ...campaign,
    effectiveStatus,
    products: validProducts,
    productCount: validProducts.length,
    sellerCount: uniqueSellers.size,
  };

  return res.status(200).json(new ApiResponse(200, responseData, "Campaign details fetched successfully"));
});

/**
 * @desc    Create new campaign
 * @route   POST /api/v1/indiafy/admin/management/campaigns
 * @access  Private (Admin)
 */
export const createCampaign = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    discountType = "percentage",
    discountValue,
    startDate,
    endDate,
    status = "draft",
    products = [],
    bannerImage,
    badgeText,
  } = req.body;

  // Validation
  if (!name || !name.trim()) {
    throw new ApiError(400, "Campaign name is required");
  }

  const numDiscount = Number(discountValue);
  if (isNaN(numDiscount) || numDiscount <= 0) {
    throw new ApiError(400, "Discount value must be greater than 0");
  }

  if (discountType === "percentage" && numDiscount > 100) {
    throw new ApiError(400, "Percentage discount cannot exceed 100%");
  }

  if (!startDate) {
    throw new ApiError(400, "Start date is required");
  }

  if (!endDate) {
    throw new ApiError(400, "End date is required");
  }

  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);

  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    throw new ApiError(400, "Invalid start or end date format");
  }

  if (parsedEnd <= parsedStart) {
    throw new ApiError(400, "End date must be strictly after start date");
  }

  // Validate and sanitize selected products
  const sanitizedProducts = [];
  const seenProductIds = new Set();

  if (Array.isArray(products) && products.length > 0) {
    for (const item of products) {
      const pId = item.productId || item._id;
      const sId = item.sellerId;

      if (!pId || !mongoose.Types.ObjectId.isValid(pId)) continue;
      if (seenProductIds.has(String(pId))) continue; // prevent duplicates
      seenProductIds.add(String(pId));

      let resolvedSellerId = sId;
      if (!resolvedSellerId || !mongoose.Types.ObjectId.isValid(resolvedSellerId)) {
        const prod = await ProductModel.findById(pId).select("sellerId").lean();
        if (prod && prod.sellerId) {
          resolvedSellerId = prod.sellerId;
        }
      }

      if (resolvedSellerId) {
        sanitizedProducts.push({
          productId: new mongoose.Types.ObjectId(pId),
          sellerId: new mongoose.Types.ObjectId(resolvedSellerId),
        });
      }
    }
  }

  let resolvedBannerUrl = "";
  if (bannerImage && typeof bannerImage === "string") {
    if (bannerImage.startsWith("data:")) {
      try {
        resolvedBannerUrl = await uploadBase64(bannerImage, "indiafy_campaigns");
      } catch (uploadErr) {
        console.warn("Banner image upload to Cloudinary failed:", uploadErr.message);
      }
    } else {
      resolvedBannerUrl = bannerImage.trim();
    }
  }

  const campaign = new Campaign({
    name: name.trim(),
    description: description ? description.trim() : "",
    discountType,
    discountValue: numDiscount,
    startDate: parsedStart,
    endDate: parsedEnd,
    status: ["draft", "active", "scheduled", "disabled"].includes(status) ? status : "draft",
    products: sanitizedProducts,
    bannerImage: resolvedBannerUrl || "",
    badgeText: badgeText || "Sale",
    createdBy: req.user?._id,
  });

  const savedCampaign = await campaign.save();

  await logAdminAction(
    req,
    "CREATE_CAMPAIGN",
    `campaign:${savedCampaign._id}`,
    null,
    { name: savedCampaign.name, discountValue: savedCampaign.discountValue, status: savedCampaign.status }
  );

  return res.status(201).json(new ApiResponse(201, savedCampaign, "Campaign created successfully"));
});

/**
 * @desc    Update campaign
 * @route   PUT /api/v1/indiafy/admin/management/campaigns/:id
 * @access  Private (Admin)
 */
export const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid campaign ID");
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const before = campaign.toObject();

  const {
    name,
    description,
    discountType,
    discountValue,
    startDate,
    endDate,
    status,
    products,
    bannerImage,
    badgeText,
  } = req.body;

  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, "Campaign name cannot be empty");
    campaign.name = name.trim();
  }

  if (description !== undefined) campaign.description = description.trim();

  if (discountType !== undefined) {
    if (!["percentage", "fixed"].includes(discountType)) {
      throw new ApiError(400, "Discount type must be percentage or fixed");
    }
    campaign.discountType = discountType;
  }

  if (discountValue !== undefined) {
    const num = Number(discountValue);
    if (isNaN(num) || num <= 0) throw new ApiError(400, "Discount value must be greater than 0");
    if ((campaign.discountType === "percentage") && num > 100) {
      throw new ApiError(400, "Percentage discount cannot exceed 100%");
    }
    campaign.discountValue = num;
  }

  if (startDate !== undefined) {
    const sDate = new Date(startDate);
    if (isNaN(sDate.getTime())) throw new ApiError(400, "Invalid start date");
    campaign.startDate = sDate;
  }

  if (endDate !== undefined) {
    const eDate = new Date(endDate);
    if (isNaN(eDate.getTime())) throw new ApiError(400, "Invalid end date");
    campaign.endDate = eDate;
  }

  if (campaign.endDate <= campaign.startDate) {
    throw new ApiError(400, "End date must be strictly after start date");
  }

  if (status !== undefined) {
    if (!["draft", "active", "scheduled", "disabled", "expired"].includes(status)) {
      throw new ApiError(400, "Invalid status");
    }
    campaign.status = status;
  }

  if (bannerImage !== undefined) {
    if (typeof bannerImage === "string" && bannerImage.startsWith("data:")) {
      try {
        campaign.bannerImage = await uploadBase64(bannerImage, "indiafy_campaigns");
      } catch (uploadErr) {
        console.warn("Banner image update upload failed:", uploadErr.message);
      }
    } else {
      campaign.bannerImage = (bannerImage || "").trim();
    }
  }
  if (badgeText !== undefined) campaign.badgeText = badgeText;

  if (Array.isArray(products)) {
    const sanitized = [];
    const seen = new Set();
    for (const item of products) {
      const pId = item.productId || item._id;
      let sId = item.sellerId;
      if (!pId || !mongoose.Types.ObjectId.isValid(pId)) continue;
      if (seen.has(String(pId))) continue;
      seen.add(String(pId));

      if (!sId || !mongoose.Types.ObjectId.isValid(sId)) {
        const prod = await ProductModel.findById(pId).select("sellerId").lean();
        if (prod && prod.sellerId) sId = prod.sellerId;
      }

      if (sId) {
        sanitized.push({
          productId: new mongoose.Types.ObjectId(pId),
          sellerId: new mongoose.Types.ObjectId(sId),
        });
      }
    }
    campaign.products = sanitized;
  }

  const updatedCampaign = await campaign.save();

  await logAdminAction(
    req,
    "UPDATE_CAMPAIGN",
    `campaign:${id}`,
    { name: before.name, status: before.status },
    { name: updatedCampaign.name, status: updatedCampaign.status }
  );

  return res.status(200).json(new ApiResponse(200, updatedCampaign, "Campaign updated successfully"));
});

/**
 * @desc    Toggle campaign status (activate or disable)
 * @route   PATCH /api/v1/indiafy/admin/management/campaigns/:id/status
 * @access  Private (Admin)
 */
export const toggleCampaignStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid campaign ID");
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const beforeStatus = campaign.status;

  if (status) {
    if (!["active", "disabled", "draft"].includes(status)) {
      throw new ApiError(400, "Status must be 'active', 'disabled', or 'draft'");
    }
    if (status === "active" && new Date() > campaign.endDate) {
      throw new ApiError(400, "Cannot activate a campaign whose end date is in the past. Please update end date first.");
    }
    campaign.status = status;
  } else {
    // Toggle active <-> disabled
    if (campaign.status === "active") {
      campaign.status = "disabled";
    } else {
      if (new Date() > campaign.endDate) {
        throw new ApiError(400, "Cannot activate a campaign whose end date is in the past. Please update end date first.");
      }
      campaign.status = "active";
    }
  }

  await campaign.save();

  await logAdminAction(
    req,
    "TOGGLE_CAMPAIGN_STATUS",
    `campaign:${id}`,
    { status: beforeStatus },
    { status: campaign.status }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { id: campaign._id, status: campaign.status, effectiveStatus: campaign.effectiveStatus },
      `Campaign ${campaign.status === "active" ? "activated" : "disabled"} successfully`
    )
  );
});

/**
 * @desc    Delete campaign
 * @route   DELETE /api/v1/indiafy/admin/management/campaigns/:id
 * @access  Private (Admin)
 */
export const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid campaign ID");
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  await Campaign.findByIdAndDelete(id);

  await logAdminAction(
    req,
    "DELETE_CAMPAIGN",
    `campaign:${id}`,
    { name: campaign.name, status: campaign.status },
    null
  );

  return res.status(200).json(new ApiResponse(200, null, "Campaign deleted successfully"));
});

/**
 * @desc    Add products to campaign
 * @route   POST /api/v1/indiafy/admin/management/campaigns/:id/products
 * @access  Private (Admin)
 */
export const addProductsToCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { products = [] } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid campaign ID");
  }

  if (!Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, "Products array is required");
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const existingProductIds = new Set(
    campaign.products.map((p) => String(p.productId))
  );

  let addedCount = 0;

  for (const item of products) {
    const pId = item.productId || item._id;
    if (!pId || !mongoose.Types.ObjectId.isValid(pId)) continue;
    if (existingProductIds.has(String(pId))) continue;

    let sId = item.sellerId;
    if (!sId || !mongoose.Types.ObjectId.isValid(sId)) {
      const prod = await ProductModel.findById(pId).select("sellerId").lean();
      if (prod && prod.sellerId) sId = prod.sellerId;
    }

    if (sId) {
      campaign.products.push({
        productId: new mongoose.Types.ObjectId(pId),
        sellerId: new mongoose.Types.ObjectId(sId),
      });
      existingProductIds.add(String(pId));
      addedCount++;
    }
  }

  await campaign.save();

  await logAdminAction(
    req,
    "ADD_CAMPAIGN_PRODUCTS",
    `campaign:${id}`,
    null,
    { addedCount, totalProducts: campaign.products.length }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { addedCount, totalProducts: campaign.products.length },
      `${addedCount} product(s) added to campaign`
    )
  );
});

/**
 * @desc    Remove single product from campaign
 * @route   DELETE /api/v1/indiafy/admin/management/campaigns/:id/products/:productId
 * @access  Private (Admin)
 */
export const removeProductFromCampaign = asyncHandler(async (req, res) => {
  const { id, productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid campaign or product ID");
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  const initialCount = campaign.products.length;
  campaign.products = campaign.products.filter(
    (p) => String(p.productId) !== String(productId)
  );

  if (campaign.products.length === initialCount) {
    throw new ApiError(404, "Product is not part of this campaign");
  }

  await campaign.save();

  await logAdminAction(
    req,
    "REMOVE_CAMPAIGN_PRODUCT",
    `campaign:${id}`,
    { removedProductId: productId },
    { remainingProducts: campaign.products.length }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { remainingProducts: campaign.products.length },
      "Product removed from campaign successfully"
    )
  );
});

/**
 * @desc    Get eligible seller products for campaign selector with live discount preview
 * @route   GET /api/v1/indiafy/admin/management/campaigns/products/eligible
 * @access  Private (Admin)
 */
export const getEligibleProducts = asyncHandler(async (req, res) => {
  const { search, sellerId, categoryName, discountValue = 10, discountType = "percentage", page = 1, limit = 20 } = req.query;

  const filter = {
    isDeleted: { $ne: true },
    isActive: { $ne: false },
    status: { $ne: "INACTIVE" },
  };

  if (search && search.trim()) {
    filter.$or = [
      { productName: { $regex: search.trim(), $options: "i" } },
      { productSkuId: { $regex: search.trim(), $options: "i" } },
      { brand: { $regex: search.trim(), $options: "i" } }
    ];
  }

  if (sellerId && sellerId !== "all" && sellerId !== "All") {
    if (mongoose.Types.ObjectId.isValid(sellerId)) {
      filter.sellerId = new mongoose.Types.ObjectId(sellerId);
    } else {
      filter.sellerId = sellerId;
    }
  }

  if (categoryName && categoryName.trim() && categoryName !== "all" && categoryName !== "All") {
    filter.categoryName = { $regex: new RegExp(`^${categoryName.trim()}$`, "i") };
  }

  const numLimit = Math.min(200, Math.max(1, Number(limit) || 50));
  const skip = (Number(page) - 1) * numLimit;
  const total = await ProductModel.countDocuments(filter);

  const products = await ProductModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(numLimit)
    .populate("sellerId", "firstName lastName email businessName status")
    .lean();

  const numDiscount = Math.max(0, Math.min(100, Number(discountValue) || 0));

  const items = products.map((p) => {
    const originalPrice = roundToTwoDecimals(
      p.attribute?.salePrice !== undefined && p.attribute?.salePrice !== null
        ? p.attribute.salePrice
        : (p.price || 0)
    );

    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = roundToTwoDecimals((originalPrice * numDiscount) / 100);
    } else {
      discountAmount = roundToTwoDecimals(Math.min(originalPrice, numDiscount));
    }

    const salePrice = roundToTwoDecimals(Math.max(0, originalPrice - discountAmount));

    const sellerName = p.sellerId
      ? `${p.sellerId.firstName || ''} ${p.sellerId.lastName || ''}`.trim() || p.sellerId.businessName || "Seller"
      : "Unknown Seller";

    let thumbnail = "";
    if (Array.isArray(p.productImage) && p.productImage.length > 0) {
      thumbnail = p.productImage[0];
    } else if (typeof p.productImage === "string") {
      thumbnail = p.productImage;
    } else if (p.thumbnail) {
      thumbnail = p.thumbnail;
    }

    return {
      _id: p._id,
      productName: p.productName,
      productSkuId: p.productSkuId,
      categoryName: p.categoryName || "General",
      brand: p.brand || "",
      thumbnail,
      stock: p.stock !== undefined ? p.stock : (p.attribute?.quantity || 0),
      sellerId: p.sellerId?._id,
      sellerName,
      sellerBusinessName: p.sellerId?.businessName || sellerName,
      sellerEmail: p.sellerId?.email || "",
      originalPrice,
      discountAmount,
      salePrice,
    };
  });

  // Get distinct categories and sellers for filter dropdowns
  const categories = await ProductModel.distinct("categoryName", { isDeleted: { $ne: true } });
  const sellers = await SellerModel.find({ status: { $ne: "blocked" } })
    .select("_id firstName lastName businessName email")
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: items,
        categories: categories.filter(Boolean),
        sellers: sellers.map((s) => ({
          _id: s._id,
          name: s.businessName || `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email,
          businessName: s.businessName || "",
          email: s.email,
        })),
        pagination: {
          total,
          page: Number(page),
          limit: numLimit,
          pages: Math.ceil(total / numLimit),
        },
      },
      "Eligible products retrieved successfully"
    )
  );
});
