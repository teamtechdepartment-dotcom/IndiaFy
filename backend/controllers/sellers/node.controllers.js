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
    const sellerId = req.user._id;

    let {
      nodeType, storeName, email, phone, address, city, state, pincode,
      deliveryRadius, gstin, warehouseLocation, minOrderQty, minOrderValue,
      activeSectors, dispatchSpeed, logo, banner, description, storeCategory,
      operatingHours, pickupAvailable,
      accountName, accountNumber, ifsc, bankName,
    } = req.body;

    // --- Validation ---
    if (!nodeType || !storeName || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: nodeType, storeName, email, phone, address",
      });
    }

    // --- Check duplicate store name for this seller ---
    const existingNode = await SellerNode.findOne({
      seller: sellerId,
      storeName: { $regex: new RegExp(`^${storeName.trim()}$`, "i") },
    });
    if (existingNode) {
      return res.status(409).json({
        success: false,
        message: "A store with this name already exists under your account",
      });
    }

    // --- Logo upload to Cloudinary ---
    if (logo && typeof logo === "string" && logo.startsWith("data:image")) {
      try {
        const uploadedUrl = await uploadBase64(logo, "store_logos");
        if (uploadedUrl) logo = uploadedUrl;
      } catch (e) {
        console.error("Logo upload error:", e.message);
        logo = "";
      }
    }

    // --- Banner upload to Cloudinary ---
    if (banner && typeof banner === "string" && banner.startsWith("data:image")) {
      try {
        const uploadedUrl = await uploadBase64(banner, "store_banners");
        if (uploadedUrl) banner = uploadedUrl;
      } catch (e) {
        console.error("Banner upload error:", e.message);
        banner = "";
      }
    }

    // --- Generate unique slug ---
    const slug = storeName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    // --- Create node ---
    const newNode = await SellerNode.create({
      seller: sellerId,
      nodeType,
      storeName,
      slug,
      email,
      phone,
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      deliveryRadius: Number(deliveryRadius) || 5,
      gstin: gstin || "",
      warehouseLocation: warehouseLocation || "",
      minOrderQty: Number(minOrderQty) || 1,
      minOrderValue: Number(minOrderValue) || 0,
      activeSectors: activeSectors || "",
      dispatchSpeed: dispatchSpeed || "30 mins",
      logo: logo || "",
      banner: banner || "",
      description: description || "",
      storeCategory: storeCategory || "",
      operatingHours: operatingHours || "",
      pickupAvailable: pickupAvailable === true || pickupAvailable === "true",
      accountName: accountName || "",
      accountNumber: accountNumber || "",
      ifsc: ifsc || "",
      bankName: bankName || "",
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

  // Security: seller can only view their own node
  if (node.seller.toString() !== req.user._id.toString()) {
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
  const sellerId = req.user._id;

  const nodes = await SellerNode.find({ seller: sellerId }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    totalNodes: nodes.length,
    nodes,
  });
});

/* =========================================================
   UPDATE SELLER NODE
   PUT /seller/nodes/:nodeId
   (Protected)
========================================================= */
export const updateSellerNode = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  const sellerId = req.user._id;

  const node = await SellerNode.findById(nodeId);
  if (!node) {
    return res.status(404).json({ success: false, message: "Node not found" });
  }
  if (node.seller.toString() !== sellerId.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  let updateData = { ...req.body };

  // Handle logo update via Cloudinary
  if (updateData.logo && typeof updateData.logo === "string" && updateData.logo.startsWith("data:image")) {
    try {
      const uploadedUrl = await uploadBase64(updateData.logo, "store_logos");
      if (uploadedUrl) updateData.logo = uploadedUrl;
    } catch (e) {
      delete updateData.logo;
    }
  }

  // Handle banner update via Cloudinary
  if (updateData.banner && typeof updateData.banner === "string" && updateData.banner.startsWith("data:image")) {
    try {
      const uploadedUrl = await uploadBase64(updateData.banner, "store_banners");
      if (uploadedUrl) updateData.banner = uploadedUrl;
    } catch (e) {
      delete updateData.banner;
    }
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
  const sellerId = req.user._id;

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
   GET NODE ANALYTICS
   GET /seller/nodes/:nodeId/analytics
   (Protected)
========================================================= */
export const getNodeAnalytics = asyncHandler(async (req, res) => {
  const { nodeId } = req.params;
  const sellerId = req.user._id;

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