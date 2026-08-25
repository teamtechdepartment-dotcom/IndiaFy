import mongoose from "mongoose";
import SellerNode from "../../models/sellerNodes/sellerNode.model.js";
import OrderModel from "../../models/orders/order.model.js";
import ProductModel from "../../models/products/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadBase64 } from "../../utils/cloudinary.js";

/* =========================================================
   CREATE SELLER NODE
   POST /seller/nodes/create
   (Protected - seller must be logged in)
========================================================= */
export const createSellerNode = asyncHandler(async (req, res) => {
  try {
    const sellerId = req.user?.sellerId || req.user?._id;

    // Helper to upload base64 to Cloudinary
    const uploadField = async (base64Data, folder) => {
      if (base64Data && typeof base64Data === "string" && base64Data.startsWith("data:")) {
        try {
          const uploadedUrl = await uploadBase64(base64Data, folder);
          return uploadedUrl || "";
        } catch (e) {
          console.error(`Upload error for ${folder}:`, e.message);
          return "";
        }
      }
      return base64Data || "";
    };

    let logo = req.body.logo;
    let banner = req.body.banner;

    // Process logo & banner uploads
    logo = await uploadField(logo, "store_logos");
    banner = await uploadField(banner, "store_banners");

    // Process all document files
    const storeFrontPhoto = await uploadField(req.body.storeFrontPhoto, "store_docs");
    const storeInteriorPhoto = await uploadField(req.body.storeInteriorPhoto, "store_docs");
    const cancelledChequePhoto = await uploadField(req.body.cancelledChequePhoto, "store_docs");
    const bankStatementPhoto = await uploadField(req.body.bankStatementPhoto, "store_docs");
    const passbookFrontPhoto = await uploadField(req.body.passbookFrontPhoto, "store_docs");
    const gstCertificatePhoto = await uploadField(req.body.gstCertificatePhoto, "store_docs");
    const panCardPhoto = await uploadField(req.body.panCardPhoto, "store_docs");
    const aadhaarFrontPhoto = await uploadField(req.body.aadhaarFrontPhoto, "store_docs");
    const aadhaarBackPhoto = await uploadField(req.body.aadhaarBackPhoto, "store_docs");
    const shopEstablishmentLicensePhoto = await uploadField(req.body.shopEstablishmentLicensePhoto, "store_docs");
    const tradeLicensePhoto = await uploadField(req.body.tradeLicensePhoto, "store_docs");
    const foodLicensePhoto = await uploadField(req.body.foodLicensePhoto, "store_docs");
    const drugLicensePhoto = await uploadField(req.body.drugLicensePhoto, "store_docs");
    const msmeCertificatePhoto = await uploadField(req.body.msmeCertificatePhoto, "store_docs");
    const businessRegistrationPhoto = await uploadField(req.body.businessRegistrationPhoto, "store_docs");
    const utilityBillPhoto = await uploadField(req.body.utilityBillPhoto, "store_docs");
    const storeOwnershipProofPhoto = await uploadField(req.body.storeOwnershipProofPhoto, "store_docs");
    const rentAgreementPhoto = await uploadField(req.body.rentAgreementPhoto, "store_docs");
    const ownerSelfiePhoto = await uploadField(req.body.ownerSelfiePhoto, "store_docs");

    // Process storePhotos array
    let storePhotos = [];
    if (Array.isArray(req.body.storePhotos)) {
      for (const photo of req.body.storePhotos) {
        const url = await uploadField(photo, "store_docs");
        if (url) storePhotos.push(url);
      }
    }

    // --- Generate unique slug ---
    const storeNameStr = (req.body.storeName || "Store").trim();
    const slug = storeNameStr.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    // Set initial status to Pending review
    const initialVerificationStatus = {
      business: "Pending",
      address: "Pending",
      bank: "Pending",
      documents: "Pending",
      compliance: "Pending",
      storeApproval: "Pending"
    };

    // Create node
    const newNode = await SellerNode.create({
      seller: sellerId,
      nodeType: req.body.nodeType,
      storeName: storeNameStr,
      slug,
      email: req.body.email || "",
      phone: req.body.phone || "",
      address: req.body.address || "",
      city: req.body.city || "",
      state: req.body.state || "",
      pincode: req.body.pincode || "",
      deliveryRadius: Number(req.body.deliveryRadius) || 5,
      gstin: req.body.gstin || "",
      warehouseLocation: req.body.warehouseLocation || "",
      minOrderQty: Number(req.body.minOrderQty) || 1,
      minOrderValue: Number(req.body.minOrderValue) || 0,
      activeSectors: req.body.activeSectors || "",
      dispatchSpeed: req.body.dispatchSpeed || "30 mins",
      logo: logo || "",
      banner: banner || "",
      description: req.body.description || "",
      storeCategory: req.body.storeCategory || "",
      operatingHours: req.body.operatingHours || "",
      pickupAvailable: req.body.pickupAvailable === true || req.body.pickupAvailable === "true",
      accountName: req.body.accountName || "",
      accountNumber: req.body.accountNumber || "",
      ifsc: req.body.ifsc || "",
      bankName: req.body.bankName || "",

      // New onboarding schema attributes
      businessName: req.body.businessName || "",
      ownerFullName: req.body.ownerFullName || "",
      businessType: req.body.businessType || "",
      panNumber: req.body.panNumber || "",
      aadhaarNumber: req.body.aadhaarNumber || "",
      businessEmail: req.body.businessEmail || "",
      businessPhone: req.body.businessPhone || "",
      website: req.body.website || "",
      yearsInBusiness: Number(req.body.yearsInBusiness) || 0,
      businessDescription: req.body.businessDescription || "",

      subCategory: req.body.subCategory || "",
      storeTags: Array.isArray(req.body.storeTags) ? req.body.storeTags : [],
      openingTime: req.body.openingTime || "",
      closingTime: req.body.closingTime || "",
      physicalStoreAvailable: req.body.physicalStoreAvailable === true || req.body.physicalStoreAvailable === "true",
      expressDelivery: req.body.expressDelivery === true || req.body.expressDelivery === "true",

      addressLine1: req.body.addressLine1 || "",
      addressLine2: req.body.addressLine2 || "",
      area: req.body.area || "",
      country: req.body.country || "",
      latitude: Number(req.body.latitude) || 0,
      longitude: Number(req.body.longitude) || 0,
      storeFrontPhoto,
      storeInteriorPhoto,

      upiId: req.body.upiId || "",
      cancelledChequePhoto,
      bankStatementPhoto,
      passbookFrontPhoto,
      verificationMethod: req.body.verificationMethod || "Micro Deposit",

      gstCertificatePhoto,
      panCardPhoto,
      aadhaarFrontPhoto,
      aadhaarBackPhoto,
      shopEstablishmentLicensePhoto,
      tradeLicensePhoto,
      foodLicensePhoto,
      drugLicensePhoto,
      msmeCertificatePhoto,
      businessRegistrationPhoto,
      utilityBillPhoto,
      storeOwnershipProofPhoto,
      rentAgreementPhoto,
      storePhotos,
      ownerSelfiePhoto,

      storeManagerName: req.body.storeManagerName || "",
      supportPhone: req.body.supportPhone || "",
      supportEmail: req.body.supportEmail || "",
      orderProcessingTime: req.body.orderProcessingTime || "",
      avgDeliveryTime: req.body.avgDeliveryTime || "",
      maxDailyOrders: Number(req.body.maxDailyOrders) || 0,
      inventoryManagementType: req.body.inventoryManagementType || "",
      warehouseAvailable: req.body.warehouseAvailable === true || req.body.warehouseAvailable === "true",
      deliveryType: req.body.deliveryType || "",
      operatingDays: Array.isArray(req.body.operatingDays) ? req.body.operatingDays : [],
      holidaySchedule: req.body.holidaySchedule || "",

      inventoryReady: req.body.inventoryReady || "",
      expectedMonthlyOrders: req.body.expectedMonthlyOrders || "",
      productCategories: Array.isArray(req.body.productCategories) ? req.body.productCategories : [],
      productImagesAvailable: req.body.productImagesAvailable || "",
      bulkUploadRequired: req.body.bulkUploadRequired || "",
      importProductsNow: req.body.importProductsNow || "",

      isVerified: false, // Default unverified until approved
      verificationStatus: initialVerificationStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Store node created successfully",
      node: newNode,
    });

  } catch (error) {
    console.error("CREATE NODE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

/* =========================================================
   GET SELLER NODE BY ID
   GET /seller/nodes/:nodeId
   (Protected)
========================================================= */
export const getSellerNodeById = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;

  const node = await SellerNode.findById(nodeId);

  if (!node) {
    return res.status(404).json({ success: false, message: "Store not found" });
  }

  const requestSellerId = req.user?.sellerId || req.user?._id;
  if (node.seller.toString() !== requestSellerId.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  return res.status(200).json({ success: true, node });
});

/* =========================================================
   GET ALL SELLER NODES
   GET /seller/nodes
   (Protected)
========================================================= */
export const getSellerNodes = asyncHandler(async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;

  const nodes = await SellerNode.find({ seller: sellerId }).sort({ createdAt: -1 });

  const mappedNodes = nodes.map(node => ({
    _id: node._id,
    nodeType: node.nodeType,
    storeName: node.storeName,
    status: node.status,
    isActive: node.isActive,
    approval: node.approval || null,
    approvedAt: node.approvedAt || null,
    dashboardUrl: `/seller/dashboard/${node._id}`
  }));

  return res.status(200).json({
    success: true,
    nodes: mappedNodes
  });
});

/* =========================================================
   UPDATE SELLER NODE
   PUT /seller/nodes/:nodeId
   (Protected)
========================================================= */
export const updateSellerNode = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  const sellerId = req.user?.sellerId || req.user?._id;

  const node = await SellerNode.findById(nodeId);
  if (!node) {
    return res.status(404).json({ success: false, message: "Node not found" });
  }
  if (node.seller.toString() !== sellerId.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  let updateData = { ...req.body };

  // Helper to upload all base64 images dynamically during update
  for (const key of Object.keys(updateData)) {
    if (typeof updateData[key] === "string" && updateData[key].startsWith("data:")) {
      try {
        const folderName = key.includes("logo") ? "store_logos" : key.includes("banner") ? "store_banners" : "store_docs";
        const uploadedUrl = await uploadBase64(updateData[key], folderName);
        if (uploadedUrl) {
          updateData[key] = uploadedUrl;
        }
      } catch (e) {
        console.error(`Error uploading update field ${key}:`, e.message);
      }
    }
  }

  // Also support array of storePhotos if passed as base64 strings
  if (Array.isArray(updateData.storePhotos)) {
    let storePhotos = [];
    for (const photo of updateData.storePhotos) {
      if (typeof photo === "string" && photo.startsWith("data:")) {
        try {
          const uploadedUrl = await uploadBase64(photo, "store_docs");
          if (uploadedUrl) storePhotos.push(uploadedUrl);
        } catch (e) {
          console.error("Error uploading storePhoto:", e.message);
        }
      } else if (typeof photo === "string") {
        storePhotos.push(photo);
      }
    }
    updateData.storePhotos = storePhotos;
  }

  // Prevent overwriting immutable fields
  delete updateData.seller;
  delete updateData.slug;
  delete updateData._id;

  const updatedNode = await SellerNode.findByIdAndUpdate(
    nodeId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Store updated successfully",
    node: updatedNode,
  });
});

/* =========================================================
   DELETE SELLER NODE
   DELETE /seller/nodes/:nodeId
   (Protected)
========================================================= */
export const deleteSellerNode = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  const sellerId = req.user?.sellerId || req.user?._id;

  const node = await SellerNode.findById(nodeId);
  if (!node) {
    return res.status(404).json({ success: false, message: "Node not found" });
  }
  if (node.seller.toString() !== sellerId.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  await SellerNode.findByIdAndDelete(nodeId);

  return res.status(200).json({
    success: true,
    message: "Store deleted successfully",
  });
});

/* =========================================================
   GET PUBLIC STORES (No auth required)
   GET /public/stores
   Returns all active, non-deactivated stores for marketplace
========================================================= */
export const getPublicStores = asyncHandler(async (req, res) => {
  const { nodeType, city, search, limit = 50, skip = 0 } = req.query;

  const filter = {
    isActive: true,
    isDeactivated: false,
  };

  if (nodeType) filter.nodeType = nodeType;
  if (city) filter.city = { $regex: new RegExp(city, "i") };
  if (search) {
    filter.$or = [
      { storeName: { $regex: new RegExp(search, "i") } },
      { description: { $regex: new RegExp(search, "i") } },
      { storeCategory: { $regex: new RegExp(search, "i") } },
    ];
  }

  const stores = await SellerNode.find(filter)
    .sort({ isStoreOpen: -1, createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    // Exclude sensitive bank/financial fields from public response
    .select("-accountNumber -ifsc -accountName -bankName -gstin -seller");

  const total = await SellerNode.countDocuments(filter);

  return res.status(200).json({
    success: true,
    total,
    stores,
  });
});

/* =========================================================
   GET PUBLIC STORE BY ID OR SLUG
   GET /public/stores/:identifier
   Returns single store node data for public storefront
========================================================= */
export const getPublicStoreByIdOrSlug = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  if (!identifier) {
    return res.status(400).json({ success: false, message: "Store identifier is required" });
  }

  let store = await SellerNode.findOne({
    slug: identifier,
    isActive: true,
    isDeactivated: false,
  }).select("-accountNumber -ifsc -accountName -bankName -gstin -seller");

  if (!store && mongoose.Types.ObjectId.isValid(identifier)) {
    store = await SellerNode.findOne({
      _id: identifier,
      isActive: true,
      isDeactivated: false,
    }).select("-accountNumber -ifsc -accountName -bankName -gstin -seller");
  }

  // Safe fallback if not found with isActive flag
  if (!store && mongoose.Types.ObjectId.isValid(identifier)) {
    store = await SellerNode.findById(identifier)
      .select("-accountNumber -ifsc -accountName -bankName -gstin -seller");
  }

  if (!store) {
    return res.status(404).json({ success: false, message: "Store not found" });
  }

  return res.status(200).json({
    success: true,
    store,
  });
});

/* =========================================================
   GET NODE ANALYTICS
   GET /seller/nodes/:nodeId/analytics
   (Protected)
========================================================= */
export const getNodeAnalytics = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  const sellerId = req.user?.sellerId || req.user?._id;

  const node = await SellerNode.findById(nodeId);
  if (!node) {
    return res.status(404).json({ success: false, message: "Node not found" });
  }
  if (node.seller.toString() !== sellerId.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  // Aggregate orders by nodeId
  const [orderStats] = await OrderModel.aggregate([
    { $match: { "orderItems.nodeId": node._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        pendingOrders: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
        processingOrders: { $sum: { $cond: [{ $eq: ["$status", "Processing"] }, 1, 0] } },
        deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
        cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } },
      },
    },
  ]);

  const productCount = await ProductModel.countDocuments({ nodeId, isDeleted: false });
  const lowStockCount = await ProductModel.countDocuments({ nodeId, isDeleted: false, stock: { $lte: 5, $gt: 0 } });
  const outOfStockCount = await ProductModel.countDocuments({ nodeId, isDeleted: false, stock: 0 });

  return res.status(200).json({
    success: true,
    analytics: {
      orders: {
        total: orderStats?.totalOrders || 0,
        revenue: orderStats?.totalRevenue || 0,
        pending: orderStats?.pendingOrders || 0,
        processing: orderStats?.processingOrders || 0,
        delivered: orderStats?.deliveredOrders || 0,
        cancelled: orderStats?.cancelledOrders || 0,
      },
      products: {
        total: productCount,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      node: {
        _id: node._id,
        storeName: node.storeName,
        nodeType: node.nodeType,
        isStoreOpen: node.isStoreOpen,
        isVerified: node.isVerified,
        createdAt: node.createdAt,
      },
    },
  });
});

/* =========================================================
   GET DASHBOARD ACCESS PERMISSIONS
   GET /api/v1/seller/dashboard-access
========================================================= */
export const getDashboardAccess = asyncHandler(async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;

  // Fetch the latest node
  const node = await SellerNode.findOne({ seller: sellerId }).sort({ createdAt: -1 });

  if (!node) {
    return res.status(200).json({
      success: true,
      canAccessDashboard: false,
      status: "DRAFT",
      permissions: []
    });
  }

  const isStatusOk = node.status === "ACTIVE";
  const isActiveOk = node.isActive === true;
  const isApprovalOk = node.approval?.status === "APPROVED";
  const canAccess = isStatusOk && isActiveOk && isApprovalOk;

  // Debugging logs requested: Seller ID, Node ID, Database Status, Approval Status, isActive, Permission Result, Middleware Result, Dashboard Loaded
  console.log(`[getDashboardAccess API LOGS]
  - Seller ID: ${sellerId}
  - Node ID: ${node._id}
  - Database Status: ${node.status}
  - Approval Status: ${node.approval?.status}
  - isActive: ${node.isActive}
  - Permission Result: ${canAccess ? "GRANTED" : "DENIED"}
  - Middleware Result: ${canAccess ? "SUCCESS" : "DENIED"}
  - Dashboard Loaded: ${canAccess ? "TRUE" : "FALSE"}`);

  return res.status(200).json({
    success: true,
    canAccessDashboard: canAccess,
    status: node.status,
    permissions: canAccess ? [
      "products",
      "orders",
      "analytics",
      "payments"
    ] : []
  });
});

/* =========================================================
   GET LATEST NODE STATUS
   GET /api/v1/seller/node/status
========================================================= */
export const getLatestNodeStatus = asyncHandler(async (req, res) => {
  const sellerId = req.user?.sellerId || req.user?._id;

  const node = await SellerNode.findOne({ seller: sellerId }).sort({ createdAt: -1 });

  if (!node) {
    return res.status(200).json({
      success: true,
      status: "DRAFT",
      nodeId: null
    });
  }


  return res.status(200).json({
    success: true,
    status: node.status,
    nodeId: node._id
  });
});