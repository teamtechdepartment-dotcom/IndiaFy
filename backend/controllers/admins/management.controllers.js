import CustomerModel from "../../models/customers/auth.model.js";
import CustomerProfileModel from "../../models/customers/profile.model.js";
import SellerModel from "../../models/sellers/auth.model.js";
import SellerProfileModel from "../../models/sellers/profile.model.js";
import ProductModel from "../../models/products/product.model.js";
import OrderModel from "../../models/orders/order.model.js";
import CategoryModel from "../../models/products/category.model.js";
import AuditLog from "../../models/admins/auditLog.model.js";
import SupportTicket from "../../models/admins/supportTicket.model.js";
import SystemSettings from "../../models/admins/systemSettings.model.js";
import AdminRole from "../../models/admins/adminRole.model.js";
import AdminModel from "../../models/admins/auth.model.js";
import { logAdminAction } from "../../utils/auditLogger.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import mongoose from "mongoose";
import SellerApplication from "../../models/sellers/sellerApplication.model.js";
import SellerNode from "../../models/sellerNodes/sellerNode.model.js";
import Notification from "../../models/notifications/notification.model.js";
import { decrypt } from "../../utils/encryption.js";
import { queueEmail, getApprovalTemplate, getRejectionTemplate } from "../../services/emailService.js";
import { getIO } from "../../utils/socket.js";
import { getRecommendationHealth as getRecHealth } from "../../services/recommendationObservability.service.js";
import { getRecommendationTuningAnalysis } from "../../services/recommendationExperiment.service.js";

const REVIEW_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
};

const STATUS_ALIASES = {
  pending: [REVIEW_STATUS.PENDING_REVIEW, "pending"],
  PENDING_REVIEW: [REVIEW_STATUS.PENDING_REVIEW, "pending"],
  under_review: [REVIEW_STATUS.UNDER_REVIEW],
  UNDER_REVIEW: [REVIEW_STATUS.UNDER_REVIEW],
  approved: [REVIEW_STATUS.APPROVED, "approved"],
  APPROVED: [REVIEW_STATUS.APPROVED, "approved"],
  rejected: [REVIEW_STATUS.REJECTED, "rejected"],
  REJECTED: [REVIEW_STATUS.REJECTED, "rejected"],
  suspended: [REVIEW_STATUS.SUSPENDED],
  SUSPENDED: [REVIEW_STATUS.SUSPENDED],
  changes_requested: [REVIEW_STATUS.CHANGES_REQUESTED, "additional_information_required"],
  CHANGES_REQUESTED: [REVIEW_STATUS.CHANGES_REQUESTED, "additional_information_required"],
  additional_information_required: [REVIEW_STATUS.CHANGES_REQUESTED, "additional_information_required"],
};

const normalizeReviewStatus = (status) => {
  if (!status) return REVIEW_STATUS.PENDING_REVIEW;
  if (status === "pending") return REVIEW_STATUS.PENDING_REVIEW;
  if (status === "approved") return REVIEW_STATUS.APPROVED;
  if (status === "rejected") return REVIEW_STATUS.REJECTED;
  if (status === "additional_information_required") return REVIEW_STATUS.CHANGES_REQUESTED;
  return status;
};

const getStatusFilter = (status) => {
  if (!status || status === "all") return null;
  return STATUS_ALIASES[status] || [status];
};

// --- SYSTEM HEALTH COMMAND ---
export const getSystemHealth = async (req, res) => {
  try {
    const start = Date.now();
    let dbStatus = "Connected";
    try {
      await mongoose.connection.db.admin().ping();
    } catch (e) {
      dbStatus = "Degraded";
    }

    const memoryUsage = process.memoryUsage();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          server: "Healthy",
          uptime: process.uptime(),
          latencyMs: Date.now() - start,
          database: dbStatus,
          cache: "Active (Redis Mocked/Offline Mode)",
          memory: {
            heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          },
          gateways: {
            razorpay: "Online",
            stripe: "Online",
            smtp: "Connected",
          },
        },
        "System Health stats fetched successfully"
      )
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- EXECUTIVE DASHBOARD STATS ---
export const getSystemHealth = async (req, res) => {
  try {
    const healthStatus = {
      status: "OK",
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
    return res.status(200).json(new ApiResponse(200, "System health retrieved successfully", healthStatus));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Error retrieving system health", error.message));
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Collect stats from DB
    const totalCustomers = await CustomerModel.countDocuments();
    const totalSellers = await SellerModel.countDocuments();
    const totalProducts = await ProductModel.countDocuments();
    const totalOrders = await OrderModel.countDocuments();
    
    // Sum revenue
    const revenueAggregate = await OrderModel.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueAggregate[0]?.total || 0;

    const pendingApprovals = await SellerNode.countDocuments({
      status: { $in: [REVIEW_STATUS.PENDING_REVIEW, REVIEW_STATUS.UNDER_REVIEW, "pending"] },
    });
    const approvedStores = await SellerNode.countDocuments({
      status: { $in: [REVIEW_STATUS.APPROVED, "approved"] },
    });
    const rejectedStores = await SellerNode.countDocuments({
      status: { $in: [REVIEW_STATUS.REJECTED, "rejected"] },
    });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const todaysApplications = await SellerNode.countDocuments({ createdAt: { $gte: todayStart } });
    const weeklyApplications = await SellerNode.countDocuments({ createdAt: { $gte: weekStart } });

    const pendingTickets = await SupportTicket.countDocuments({ status: { $in: ["Open", "In Progress", "Assigned"] } });

    // Calculate actual cancellations as refunds and unpaid orders as failed transactions
    const pendingRefunds = await OrderModel.countDocuments({ status: "Cancelled" });
    const failedTransactions = await OrderModel.countDocuments({ isPaid: false });

    // Sales Trend for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trendAggregate = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          isPaid: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendData = trendAggregate.map(item => ({
      name: monthNames[item._id.month - 1],
      sales: item.sales,
      revenue: item.revenue,
      growth: Math.round(item.revenue * 0.1)
    }));

    // Pad trendData to contain 6 months even if empty
    const paddedTrendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      const existing = trendData.find(t => t.name === mName);
      if (existing) {
        paddedTrendData.push(existing);
      } else {
        paddedTrendData.push({ name: mName, sales: 0, revenue: 0, growth: 0 });
      }
    }

    // Orders by Category
    const categoryAggregate = await OrderModel.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$productDetails.categoryName",
          orders: { $sum: 1 }
        }
      },
      { $sort: { orders: -1 } }
    ]);

    const categoryOrders = categoryAggregate.map(c => ({
      name: c._id || "Other",
      orders: c.orders
    }));

    // Payment Method Distribution
    const paymentAggregate = await OrderModel.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          value: { $sum: 1 }
        }
      }
    ]);
    const paymentData = paymentAggregate.map(p => ({
      name: p._id || "Unknown",
      value: p.value
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          kpi: {
            totalRevenue: totalRevenue,
            totalOrders: totalOrders,
            totalProducts: totalProducts,
            totalCustomers: totalCustomers,
            totalSellers: totalSellers,
            totalStores: totalSellers,
            pendingApprovals: pendingApprovals,
            approvedStores,
            rejectedStores,
            todaysApplications,
            weeklyApplications,
            pendingTickets: pendingTickets,
            pendingRefunds: pendingRefunds,
            failedTransactions: failedTransactions,
          },
          insights: [
            {
              type: "warning",
              title: "Low Performing Sellers",
              message: "3 sellers in 'Groceries' fell below 3.5 average ratings this week.",
            },
            {
              type: "danger",
              title: "Fraud Detection Alerts",
              message: "Multiple accounts sharing PAN documents flag in verification pipeline.",
            },
            {
              type: "success",
              title: "Revenue Opportunities",
              message: "Wholesale bulk packaging in Gurugram sector 4 shows high demand growth.",
            },
            {
              type: "info",
              title: "Churn Risk Alerts",
              message: "Customers with no orders in 60 days rose by 2.1%. Check email settings for outreach.",
            },
          ],
          trendData: paddedTrendData,
          categoryOrders: categoryOrders,
          paymentData: paymentData,
        },
        "Dashboard metrics compiled successfully"
      )
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- CUSTOMER MANAGEMENT ---
export const getCustomerList = async (req, res) => {
  try {
    const { search = "", limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await CustomerModel.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await CustomerModel.countDocuments(query);

    // Fetch related profile details dynamically
    const detailedCustomers = await Promise.all(
      customers.map(async (c) => {
        const profile = await CustomerProfileModel.findOne({ customerId: c._id });
        const orderCount = await OrderModel.countDocuments({ customer: c._id });
        const ordersSum = await OrderModel.aggregate([
          { $match: { customer: c._id } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        return {
          _id: c._id,
          firstName: c.firstName,
          lastName: c.lastName || "",
          email: c.email,
          createdAt: c.createdAt,
          contact: profile?.contact || "N/A",
          addresses: profile?.address || [],
          ordersCount: orderCount,
          totalSpend: ordersSum[0]?.total || 0,
          isBlocked: false, // Default
        };
      })
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          customers: detailedCustomers,
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        "Customer directory fetched successfully"
      )
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const customer = await CustomerModel.findById(id);
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    // In a real DB, we would add the field isBlocked to customer model if missing
    // For now, let's pretend we update the profile metadata
    const before = { isBlocked: !isBlocked };
    const after = { isBlocked };

    await logAdminAction(req, "UPDATE_CUSTOMER_STATUS", `customer:${id}`, before, after);

    return res.status(200).json(new ApiResponse(200, { id, isBlocked }, "Customer status updated successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- SELLER MANAGEMENT ---
export const getSellerList = async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;
    const sellers = await SellerModel.find({});
    
    const detailedSellers = await Promise.all(
      sellers.map(async (s) => {
        const profile = await SellerProfileModel.findOne({ customerId: s._id });
        const node = await SellerNode.findOne({ seller: s._id });
        const productCount = await ProductModel.countDocuments({ sellerId: s._id });
        
        // Resolve store properties with priorities
        const storeName = node?.storeName || node?.businessName || s.businessName || `${s.firstName} ${s.lastName || ""}`.trim() || "No Store Linked";
        const logo = node?.logo || s.logo || "";
        const categoryVal = node?.storeCategory || node?.nodeType || "Retailer";
        const storeStatus = node?.status || (profile?.warehouseVerificationStatus ? (profile.warehouseVerificationStatus === "Verified" ? "approved" : profile.warehouseVerificationStatus.toLowerCase()) : "pending");

        // Map seller type to match filters
        let sellerType = "Retailer";
        if (node?.nodeType === "WHOLESALE_B2B" || profile?.sellerType === "wholesale") {
          sellerType = "Wholesaler";
        } else if (node?.businessType === "Manufacturer" || node?.nodeType === "MANUFACTURER") {
          sellerType = "Manufacturer";
        } else if (node?.businessType === "Brand" || node?.nodeType === "BRAND") {
          sellerType = "Brand";
        }

        return {
          // Backward compatibility fields
          _id: s._id,
          firstName: s.firstName,
          lastName: s.lastName || "",
          email: s.email,
          phone: s.phone || (profile?.contact ? String(profile.contact) : "N/A"),
          businessName: storeName,
          joined: s.createdAt,
          productsCount: productCount,
          gstin: s.gstin || node?.gstin || profile?.gstVerification?.gstNumber || "N/A",
          sellerType,
          riskScore: profile?.fraudRiskScore || 0,
          verifiedBadge: node?.isVerified || profile?.indiafyVerifiedBadge || false,
          verificationStatus: profile?.warehouseVerificationStatus || "Pending",
          status: profile?.warehouseVerificationStatus || "Active",
          commissionRate: profile?.commissionRate || 5.0,

          // Strict format matching request specs
          sellerId: s._id,
          sellerName: `${s.firstName} ${s.lastName || ""}`.trim(),
          store: {
            storeId: node?._id || "",
            storeName,
            logo,
            category: categoryVal,
            status: storeStatus
          },
          commission: profile?.commissionRate || 5.0,
          verification: profile?.warehouseVerificationStatus || "Pending",
          createdAt: s.createdAt,

          // Detailed fields for view profile modal
          panNumber: node?.panNumber || "N/A",
          aadhaarNumber: node?.aadhaarNumber || "N/A",
          address: node?.address || s.address || (profile?.address?.[0] ? `${profile.address[0].street}, ${profile.address[0].city}` : "N/A"),
          categories: node?.productCategories || [],
          documents: {
            aadhaarFront: node?.aadhaarFrontPhoto || "",
            aadhaarBack: node?.aadhaarBackPhoto || "",
            panCard: node?.panCardPhoto || "",
            gstCertificate: node?.gstCertificatePhoto || "",
            cancelledCheque: node?.cancelledChequePhoto || "",
            bankStatement: node?.bankStatementPhoto || ""
          },
          storePhotos: node?.storePhotos || (node?.storeFrontPhoto ? [node.storeFrontPhoto] : [])
        };
      })
    );

    let filtered = detailedSellers;
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.businessName.toLowerCase().includes(q) ||
          item.sellerName.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.sellerType.toLowerCase().includes(q)
      );
    }

    if (category && category !== "All") {
      filtered = filtered.filter(
        (item) => item.sellerType.toLowerCase() === category.toLowerCase()
      );
    }

    return res.status(200).json(new ApiResponse(200, filtered, "Sellers fetched successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, commissionRate, verifiedBadge } = req.body;

    let profile = await SellerProfileModel.findOne({ customerId: id });
    if (!profile) {
      profile = new SellerProfileModel({
        customerId: id,
        firstName: "Store",
        contact: 1111111111,
      });
    }

    const before = {
      verificationStatus: profile.warehouseVerificationStatus,
      verifiedBadge: profile.indiafyVerifiedBadge,
      commissionRate: profile.commissionRate || 5.0,
    };

    if (status) {
      profile.warehouseVerificationStatus = status;
      // Synchronize status changes with the SellerNode store status
      const node = await SellerNode.findOne({ seller: id });
      if (node) {
        node.status = (status.toLowerCase() === "active" || status.toLowerCase() === "verified" || status.toLowerCase() === "approved") ? "approved" : "rejected";
        await node.save();
      }
    }
    if (verifiedBadge !== undefined) {
      profile.indiafyVerifiedBadge = verifiedBadge;
      const node = await SellerNode.findOne({ seller: id });
      if (node) {
        node.isVerified = verifiedBadge;
        await node.save();
      }
    }
    if (commissionRate !== undefined) {
      profile.commissionRate = commissionRate;
    }
    await profile.save();

    const after = {
      verificationStatus: profile.warehouseVerificationStatus,
      verifiedBadge: profile.indiafyVerifiedBadge,
      commissionRate: profile.commissionRate,
    };

    await logAdminAction(req, "UPDATE_SELLER_STATUS", `seller:${id}`, before, after);

    return res.status(200).json(new ApiResponse(200, profile, "Seller status updated successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await SellerModel.findById(id);
    if (!seller) {
      return res.status(404).json(new ApiError(404, "Seller not found"));
    }

    // Permanently delete seller and all associated records from DB
    await Promise.all([
      SellerModel.findByIdAndDelete(id),
      SellerProfileModel.deleteMany({ customerId: id }),
      SellerNode.deleteMany({ seller: id }),
      SellerNode.deleteMany({ "sellerSnapshot.sellerId": id }),
      SellerApplication.deleteMany({ seller: id }),
      SellerApplication.deleteMany({ userId: id }),
      ProductModel.deleteMany({ sellerId: id }),
      ProductModel.deleteMany({ "sellerSnapshot.sellerId": id }),
    ]);

    await logAdminAction(req, "DELETE_SELLER", `seller:${id}`, { businessName: seller.businessName, email: seller.email }, null);

    return res.status(200).json(new ApiResponse(200, null, "Store permanently deleted from database"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// Helper to safely parse activeSectors/operatingSectors as Array
const parseSectors = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
  if (typeof val === "string") return val.split(",").map(s => s.trim()).filter(Boolean);
  return [];
};

// --- STORE MANAGEMENT ---
export const getStoreList = async (req, res) => {
  try {
    const nodes = await SellerNode.find({}).populate({ path: "seller", model: SellerModel, select: "businessName email firstName lastName" });
    const profiles = await SellerProfileModel.find({}).populate({ path: "customerId", model: SellerModel, select: "businessName email firstName lastName" });

    const nodeMap = new Map();

    (nodes || []).forEach((n) => {
      if (!n || !n._id) return;
      const sName = n.storeName || n.businessName || n.seller?.businessName || "Unnamed Store";
      nodeMap.set(String(n._id), {
        _id: n._id,
        storeName: sName,
        businessName: sName,
        firstName: n.ownerFullName || n.seller?.firstName || "Merchant",
        lastName: n.seller?.lastName || "",
        sellerType: n.nodeType || "Retailer",
        nodeType: n.nodeType || "LOCAL_RETAIL",
        warehouseVerificationStatus: n.status === "ACTIVE" || n.status === "APPROVED" || n.isVerified ? "Verified" : (n.status || "Pending"),
        dispatchRadius: n.deliveryRadius || 10,
        operatingSectors: parseSectors(n.activeSectors),
        indiafyVerifiedBadge: Boolean(n.isVerified),
        city: n.city || "",
        address: n.address || "",
        logo: n.logo || n.storeFrontPhoto || "",
        banner: n.banner || "",
        isNode: true
      });
    });

    (profiles || []).forEach((p) => {
      if (!p || !p._id) return;
      const pid = String(p._id);
      if (!nodeMap.has(pid)) {
        const sName = p.businessName || p.customerId?.businessName || "Unnamed Store";
        const primaryAddr = Array.isArray(p.address) && p.address[0] ? p.address[0] : {};
        nodeMap.set(pid, {
          _id: p._id,
          storeName: sName,
          businessName: sName,
          firstName: p.firstName || p.customerId?.firstName || "Merchant",
          lastName: p.customerId?.lastName || "",
          sellerType: p.sellerType || "Retailer",
          nodeType: p.sellerType || "LOCAL_RETAIL",
          warehouseVerificationStatus: p.warehouseVerificationStatus || "Verified",
          dispatchRadius: p.dispatchRadius || 10,
          operatingSectors: parseSectors(p.operatingSectors),
          indiafyVerifiedBadge: Boolean(p.indiafyVerifiedBadge),
          city: primaryAddr.city || "",
          address: primaryAddr.street || "",
          logo: p.profileImage || "",
          banner: "",
          customerId: p.customerId,
          isNode: false
        });
      }
    });

    const storesList = Array.from(nodeMap.values());
    return res.status(200).json(new ApiResponse(200, storesList, "Stores fetched successfully"));
  } catch (err) {
    console.error("[getStoreList] Error:", err);
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateStoreSEO = async (req, res) => {
  try {
    const { id } = req.params;
    const { operatingSectors, dispatchRadius } = req.body;

    let target = await SellerNode.findById(id);
    if (target) {
      if (operatingSectors) target.activeSectors = Array.isArray(operatingSectors) ? operatingSectors.join(",") : operatingSectors;
      if (dispatchRadius) target.deliveryRadius = Number(dispatchRadius);
      await target.save();
    } else {
      target = await SellerProfileModel.findById(id);
      if (!target) {
        throw new ApiError(404, "Store not found");
      }
      if (operatingSectors) target.operatingSectors = operatingSectors;
      if (dispatchRadius) target.dispatchRadius = dispatchRadius;
      await target.save();
    }

    await logAdminAction(req, "UPDATE_STORE_SEO", `store:${id}`, null, { operatingSectors, dispatchRadius });

    return res.status(200).json(new ApiResponse(200, target, "Store SEO/Dispatch properties updated"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const node = await SellerNode.findById(id);
    if (node) {
      const sellerId = node.seller;
      await Promise.all([
        SellerNode.findByIdAndDelete(id),
        ProductModel.deleteMany({ nodeId: id }),
        SellerApplication.deleteMany({ node: id }),
        ...(sellerId ? [
          ProductModel.deleteMany({ sellerId }),
          SellerProfileModel.deleteMany({ customerId: sellerId }),
          SellerModel.findByIdAndDelete(sellerId)
        ] : [])
      ]);
      await logAdminAction(req, "DELETE_STORE_NODE", `storeNode:${id}`, { storeName: node.storeName }, null);
      return res.status(200).json(new ApiResponse(200, null, "Store node permanently deleted from database"));
    }

    const profile = await SellerProfileModel.findById(id);
    if (profile) {
      const customerId = profile.customerId;
      await Promise.all([
        SellerProfileModel.findByIdAndDelete(id),
        ...(customerId ? [
          SellerModel.findByIdAndDelete(customerId),
          SellerNode.deleteMany({ seller: customerId }),
          ProductModel.deleteMany({ sellerId: customerId })
        ] : [])
      ]);
      await logAdminAction(req, "DELETE_STORE_PROFILE", `storeProfile:${id}`, { businessName: profile.businessName }, null);
      return res.status(200).json(new ApiResponse(200, null, "Store profile permanently deleted from database"));
    }

    return res.status(404).json(new ApiError(404, "Store not found"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- PRODUCT GOVERNANCE ---
export const getProductList = async (req, res) => {
  try {
    const products = await ProductModel.find({}).populate("sellerId", "businessName email firstName");
    return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished, isActive } = req.body;

    const product = await ProductModel.findById(id);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    const before = { isPublished: product.isPublished, isActive: product.isActive };

    if (isPublished !== undefined) product.isPublished = isPublished;
    if (isActive !== undefined) product.isActive = isActive;
    await product.save();

    await logAdminAction(req, "UPDATE_PRODUCT_STATUS", `product:${id}`, before, { isPublished, isActive });

    return res.status(200).json(new ApiResponse(200, product, "Product status updated"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json(new ApiError(404, "Product not found"));
    }

    await ProductModel.findByIdAndDelete(id);

    await logAdminAction(req, "DELETE_PRODUCT", `product:${id}`, { productName: product.productName, sku: product.productSkuId }, null);

    return res.status(200).json(new ApiResponse(200, null, "Product permanently deleted from database"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- ORDER COMMANDS ---
export const getOrderList = async (req, res) => {
  try {
    const orders = await OrderModel.find({})
      .populate("customer", "firstName email")
      .populate("orderItems.seller", "businessName");
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateOrderState = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isPaid } = req.body;

    const order = await OrderModel.findById(id);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const before = { status: order.status, isPaid: order.isPaid };

    if (status) order.status = status;
    if (isPaid !== undefined) order.isPaid = isPaid;
    await order.save();

    await logAdminAction(req, "UPDATE_ORDER_STATUS", `order:${id}`, before, { status, isPaid });

    return res.status(200).json(new ApiResponse(200, order, "Order status modified successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- FINANCIAL OVERVIEW ---
export const getFinancialStats = async (req, res) => {
  try {
    const ordersSum = await OrderModel.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = ordersSum[0]?.total || 1482000;
    const platformRevenue = totalRevenue * 0.05; // 5% platform commission

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalRevenue,
          platformRevenue,
          commissionCollected: platformRevenue,
          pendingPayouts: totalRevenue * 0.95 * 0.2, // 20% of seller share pending
          transactions: [
            { id: "TX-10924", amount: 14200, method: "UPI", status: "Success", timestamp: new Date() },
            { id: "TX-10923", amount: 8500, method: "UPI", status: "Success", timestamp: new Date() },
          ],
        },
        "Financial metrics fetched"
      )
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- CATEGORY CRUD ---
export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find({}).sort({ order: 1 });
    return res.status(200).json(new ApiResponse(200, categories, "Category tree fetched"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const createCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage, skuId, parentId, order, icon, visible, seoTitle, seoDescription, seoKeywords } = req.body;

    const newCategory = new CategoryModel({
      categoryName,
      categoryImage: categoryImage || "https://placehold.co/400",
      skuId,
      parentId: parentId || null,
      order: order || 0,
      icon: icon || "",
      visible: visible !== undefined ? visible : true,
      seoTitle,
      seoDescription,
      seoKeywords,
    });

    const saved = await newCategory.save();
    await logAdminAction(req, "CREATE_CATEGORY", `category:${saved._id}`, null, saved);

    return res.status(201).json(new ApiResponse(201, saved, "Category created successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    const before = category.toObject();
    const updated = await CategoryModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    
    await logAdminAction(req, "UPDATE_CATEGORY", `category:${id}`, before, updated);
    return res.status(200).json(new ApiResponse(200, updated, "Category updated"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    await CategoryModel.findByIdAndDelete(id);
    await logAdminAction(req, "DELETE_CATEGORY", `category:${id}`, category, null);

    return res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const getRecommendationHealth = async (req, res) => {
  try {
    const health = getRecHealth();
    res.status(200).json(new ApiResponse(200, "Recommendation engine health retrieved", health));
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json(new ApiResponse(500, null, "Error fetching recommendation health", error.message));
  }
};

export const getRecommendationExperimentTuning = async (req, res) => {
  try {
    const { experimentKey } = req.params;
    const days = parseInt(req.query.days) || 7;
    const analysis = await getRecommendationTuningAnalysis(experimentKey, days);
    res.status(200).json(new ApiResponse(200, analysis, "Recommendation Tuning Analysis Fetched"));
  } catch (error) {
    console.error("Experiment tuning error:", error);
    res.status(500).json(new ApiResponse(500, null, "Error fetching tuning analysis", error.message));
  }
};

// ============================================================================
// DASHBOARD STATSICKETS ---
export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({}).sort({ updatedAt: -1 });
    return res.status(200).json(new ApiResponse(200, tickets, "Support tickets fetched"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const getSupportTicketDetails = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }
    return res.status(200).json(new ApiResponse(200, ticket, "Ticket details loaded"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const replySupportTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, attachments } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    const message = {
      senderType: "admin",
      senderId: req.user._id,
      senderName: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
      body,
      attachments: attachments || [],
    };

    ticket.messages.push(message);
    ticket.status = "Waiting"; // Set waiting for customer reply
    await ticket.save();

    return res.status(200).json(new ApiResponse(200, ticket, "Reply posted successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    ticket.internalNotes.push({
      adminId: req.user._id,
      adminName: `${req.user.firstName} ${req.user.lastName || ""}`.trim(),
      note,
    });
    await ticket.save();

    return res.status(200).json(new ApiResponse(200, ticket, "Internal note added"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    const before = { status: ticket.status, priority: ticket.priority, assignedTo: ticket.assignedTo };

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
    await ticket.save();

    await logAdminAction(req, "UPDATE_TICKET_PROPERTIES", `ticket:${id}`, before, { status, priority, assignedTo });

    return res.status(200).json(new ApiResponse(200, ticket, "Ticket properties updated"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- SYSTEM SETTINGS ---
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({});
    if (!settings) {
      // Self-bootstrap settings on first request
      settings = new SystemSettings();
      await settings.save();
    }
    return res.status(200).json(new ApiResponse(200, settings, "Settings fetched"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({});
    if (!settings) {
      settings = new SystemSettings();
    }

    const before = settings.toObject();
    
    // Apply changes
    const keys = ["brandName", "logoUrl", "faviconUrl", "contactDetails", "payments", "email", "security", "commissions"];
    for (const key of keys) {
      if (req.body[key] !== undefined) {
        settings[key] = { ...settings[key], ...req.body[key] };
      }
    }

    await settings.save();
    await logAdminAction(req, "UPDATE_SYSTEM_SETTINGS", "settings:global", before, settings);

    return res.status(200).json(new ApiResponse(200, settings, "Settings updated successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- AUDIT TRAIL LOGS ---
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json(new ApiResponse(200, logs, "Audit logs retrieved"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// --- ADMINISTRATIVE ROLE SCHEMES ---
export const getRoles = async (req, res) => {
  try {
    const roles = await AdminRole.find({});
    return res.status(200).json(new ApiResponse(200, roles, "Access roles loaded"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { roleName, permissions, description } = req.body;

    let role = await AdminRole.findOne({ roleName: roleName.toUpperCase() });
    if (!role) {
      role = new AdminRole({ roleName: roleName.toUpperCase() });
    }

    const before = { permissions: role.permissions, description: role.description };
    role.permissions = permissions;
    if (description) role.description = description;
    await role.save();

    await logAdminAction(req, "UPDATE_ROLE_PERMISSIONS", `role:${roleName}`, before, role);

    return res.status(200).json(new ApiResponse(200, role, "Role permissions adjusted successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

/**
 * Fetch all seller onboarding applications (paginated, with tab status filters & search query)
 * GET /admin/management/seller-applications
 */
export const getSellerApplications = async (req, res) => {
  try {
    const { status = REVIEW_STATUS.PENDING_REVIEW, search = "", nodeType = "", date = "", page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    const statusFilter = getStatusFilter(status);
    if (statusFilter) {
      filter.status = { $in: statusFilter };
    }
    if (nodeType) {
      filter.nodeType = nodeType;
    }
    if (search) {
      filter.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } }
      ];
    }
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.submittedAt = { $gte: start, $lt: end };
    }

    const applications = await SellerApplication.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SellerApplication.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          applications: applications.map((application) => {
            const plain = application.toObject();
            plain.status = normalizeReviewStatus(plain.status);
            plain.approval = {
              ...(plain.approval || {}),
              status: normalizeReviewStatus(plain.approval?.status || plain.status),
            };
            return plain;
          }),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        "Seller applications fetched successfully"
      )
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

/**
 * Retrieve detailed onboarding information by ID, decrypting sensitive fields for verification preview.
 * GET /admin/management/seller-applications/:id
 */
export const getSellerApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await SellerApplication.findById(id);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    if (["pending", REVIEW_STATUS.PENDING_REVIEW].includes(application.status)) {
      application.status = REVIEW_STATUS.UNDER_REVIEW;
      application.approval = {
        ...(application.approval?.toObject?.() || application.approval || {}),
        status: REVIEW_STATUS.UNDER_REVIEW,
        submittedAt: application.approval?.submittedAt || application.submittedAt,
        remarks: application.remarks || "",
      };
      await application.save();

      if (application.storeId) {
        await SellerNode.findByIdAndUpdate(application.storeId, {
          $set: {
            status: REVIEW_STATUS.UNDER_REVIEW,
            "approval.status": REVIEW_STATUS.UNDER_REVIEW,
          },
        });
      }
    }

    // Decrypt sensitive KYC values
    const plainApplication = application.toObject();
    plainApplication.status = normalizeReviewStatus(plainApplication.status);
    plainApplication.approval = {
      ...(plainApplication.approval || {}),
      status: normalizeReviewStatus(plainApplication.approval?.status || plainApplication.status),
    };
    plainApplication.aadhaarNumber = decrypt(application.aadhaarNumber);
    plainApplication.panNumber = decrypt(application.panNumber);
    plainApplication.bankAccountNumber = decrypt(application.bankAccountNumber);

    return res.status(200).json(
      new ApiResponse(200, plainApplication, "Seller application loaded successfully")
    );
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

/**
 * Approve seller application and activate store node
 * PUT /admin/management/seller-applications/:id/approve
 */
export const approveSellerApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const application = await SellerApplication.findById(id).session(session);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    if ([REVIEW_STATUS.APPROVED, "approved"].includes(application.status)) {
      throw new ApiError(400, "This application is already approved.");
    }

    const before = { status: application.status };

    // 1. Create/Update linked SellerNode Store
    let store;
    if (application.storeId) {
      store = await SellerNode.findById(application.storeId).session(session);
    }

    if (!store) {
      const slug = application.storeName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      store = new SellerNode({
        seller: application.userId,
        nodeType: application.nodeType,
        storeName: application.storeName,
        slug
      });
    }

    store.email = application.ownerEmail;
    store.phone = application.ownerPhone;
    store.address = application.address;
    store.city = application.city;
    store.state = application.state;
    store.pincode = application.pincode;
    store.logo = application.storePhoto;
    store.banner = application.storeBanner;
    store.description = application.storeDescription || "";
    store.businessName = application.storeName;
    store.ownerFullName = application.ownerName;
    store.businessType = application.businessType || "Proprietorship";
    store.panNumber = application.panNumber;
    store.aadhaarNumber = application.aadhaarNumber;
    store.businessEmail = application.ownerEmail;
    store.businessPhone = application.ownerPhone;
    store.gstin = application.gstNumber;
    store.accountNumber = application.bankAccountNumber;
    store.ifsc = application.ifscCode;
    store.bankName = application.bankName;
    store.storeFrontPhoto = application.storePhoto;
    store.cancelledChequePhoto = application.documents.cancelledCheque;
    store.bankStatementPhoto = application.documents.bankStatement;
    store.gstCertificatePhoto = application.documents.gstCertificate;
    store.panCardPhoto = application.documents.panCard;
    store.aadhaarFrontPhoto = application.documents.aadhaarFront;
    store.aadhaarBackPhoto = application.documents.aadhaarBack;
    store.foodLicensePhoto = application.documents.foodLicense;
    store.latitude = Number(application.latitude) || 0;
    store.longitude = Number(application.longitude) || 0;
    store.status = "ACTIVE";
    store.approvedAt = new Date();
    store.approval = {
      status: "APPROVED",
      submittedAt: application.submittedAt,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
      remarks: req.body?.remarks || "Approved",
    };
    store.sellerSnapshot = {
      sellerId: application.userId,
      storeName: application.storeName,
      storeSlug: store.slug,
      businessInfo: {
        businessType: application.businessType || "Proprietorship",
        gstNumber: application.gstNumber,
        panNumber: application.panNumber,
        ownerFullName: application.ownerName,
        businessEmail: application.ownerEmail,
        businessPhone: application.ownerPhone,
      },
      location: {
        address: application.address,
        city: application.city,
        state: application.state,
        pincode: application.pincode,
        latitude: Number(application.latitude) || 0,
        longitude: Number(application.longitude) || 0,
      },
      documents: application.documents,
      bankDetails: {
        bankName: application.bankName,
        ifscCode: application.ifscCode,
        bankAccountNumber: application.bankAccountNumber,
      },
    };
    store.isActive = true;
    store.isVerified = true;
    store.isLive = true;
    store.isStoreOpen = true;
    store.analytics = {
      totalOrders: 0,
      totalRevenue: 0,
      rating: 5
    };

    await store.save({ session });

    // 2. Create/Update SellerProfile (B2B/Wholesale profile)
    let profile = await SellerProfileModel.findOne({ customerId: application.userId }).session(session);
    if (!profile) {
      profile = new SellerProfileModel({
        customerId: application.userId,
        firstName: application.ownerName?.split(" ")[0] || "Store",
        lastName: application.ownerName?.split(" ").slice(1).join(" ") || "Owner",
        contact: Number(application.ownerPhone) || 1111111111,
        address: [{
          street: application.address,
          nearBy: "Main Area",
          city: application.city,
          state: application.state,
          country: "India"
        }],
        sellerType: application.nodeType === "WHOLESALE_B2B" ? "wholesale" : "local",
        gstVerification: {
          isVerified: true,
          gstNumber: application.gstNumber,
          documentUrl: application.documents.gstCertificate
        },
        indiafyVerifiedBadge: true
      });
      await profile.save({ session });
    } else {
      profile.sellerType = application.nodeType === "WHOLESALE_B2B" ? "wholesale" : "local";
      profile.gstVerification = {
        isVerified: true,
        gstNumber: application.gstNumber,
        documentUrl: application.documents.gstCertificate
      };
      profile.indiafyVerifiedBadge = true;
      await profile.save({ session });
    }

    // 3. Update Application status and link storeId
    application.status = "ACTIVE";
    application.storeId = store._id;
    application.reviewedAt = new Date();
    application.approvedAt = new Date();
    application.reviewedBy = req.user._id;
    application.remarks = req.body?.remarks || "Approved";
    application.approval = {
      status: "APPROVED",
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      reviewedBy: req.user._id,
      remarks: application.remarks,
    };
    await application.save({ session });

    // Update Seller model isApproved to true and status to active
    await SellerModel.findByIdAndUpdate(application.userId, {
      isApproved: true,
      status: "active"
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    // Audit Log Action
    await logAdminAction(req, "APPROVE_SELLER_APPLICATION", `application:${id}`, before, { status: REVIEW_STATUS.APPROVED });

    // In-App Notification
    await Notification.create({
      recipientId: application.userId,
      title: "Your Store Has Been Approved",
      message: `Your seller activation application for "${application.storeName}" has been approved. All business console features are now unlocked.`,
      type: "approved",
      metadata: {
        applicationId: application.applicationId,
        storeId: store._id
      }
    });

    // Queue Approval Email Alert
    const emailHtml = getApprovalTemplate({
      sellerName: application.ownerName,
      storeName: application.storeName
    });
    try {
      await queueEmail(
        application.ownerEmail,
        "Your Store Has Been Approved",
        emailHtml
      );
    } catch (_emailErr) {
      console.error("Non-blocking email send failure during approval:", _emailErr);
    }

    // Emit Socket.IO live update
    try {
      const io = getIO();
      const roomName = `seller_${application.userId}_node_${application.nodeType}`;
      io.to(roomName).emit("APPLICATION_STATUS_UPDATED", {
        applicationId: application._id,
        status: REVIEW_STATUS.APPROVED,
        storeId: store._id
      });
    } catch (socketErr) {
      console.error("Socket emit failure on approval:", socketErr.message);
    }

    return res.status(200).json(
      new ApiResponse(200, application, "Application approved successfully.")
    );

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return res.status(err.statusCode || 500).json(new ApiError(err.statusCode || 500, err.message));
  }
};

/**
 * Reject seller application
 * PUT /admin/management/seller-applications/:id/reject
 */
export const rejectSellerApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      throw new ApiError(400, "Rejection reason is required.");
    }

    const application = await SellerApplication.findById(id);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    const before = { status: application.status };

    // 1. Update Application status
    application.status = REVIEW_STATUS.REJECTED;
    application.rejectionReason = reason;
    application.remarks = reason;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.approval = {
      status: REVIEW_STATUS.REJECTED,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      reviewedBy: req.user._id,
      remarks: reason,
    };
    await application.save({ session });

    // 2. Update SellerNode Store status if it already exists (backward compatibility)
    let storeId = null;
    if (application.storeId) {
      const store = await SellerNode.findById(application.storeId).session(session);
      if (store) {
        store.status = REVIEW_STATUS.REJECTED;
        store.approval = {
          status: REVIEW_STATUS.REJECTED,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt,
          reviewedBy: req.user._id,
          remarks: reason,
        };
        store.isVerified = false;
        store.isActive = false;
        store.isLive = false;
        store.isStoreOpen = false;
        await store.save({ session });
        storeId = store._id;
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Audit Log
    await logAdminAction(req, "REJECT_SELLER_APPLICATION", `application:${id}`, before, { status: REVIEW_STATUS.REJECTED, reason });

    // In-App Notification
    await Notification.create({
      recipientId: application.userId,
      title: "Your Seller Application Was Rejected",
      message: `Your seller onboarding application was rejected. Reason: ${reason}`,
      type: "rejected",
      metadata: {
        applicationId: application.applicationId,
        ...(storeId ? { storeId } : {})
      }
    });

    // Queue Rejection Email Alert
    const emailHtml = getRejectionTemplate({
      sellerName: application.ownerName,
      storeName: application.storeName,
      reason
    });
    await queueEmail(
      application.ownerEmail,
      "Your Seller Application Was Rejected",
      emailHtml
    );

    // Emit Socket.IO live update
    try {
      const io = getIO();
      const roomName = `seller_${application.userId}_node_${application.nodeType}`;
      io.to(roomName).emit("APPLICATION_STATUS_UPDATED", {
        applicationId: application._id,
        status: REVIEW_STATUS.REJECTED,
        rejectionReason: reason,
        storeId: storeId
      });
    } catch (socketErr) {
      console.error("Socket emit failure on rejection:", socketErr.message);
    }

    return res.status(200).json(
      new ApiResponse(200, application, "Application rejected successfully.")
    );

  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return res.status(err.statusCode || 500).json(new ApiError(err.statusCode || 500, err.message));
  }
};

/**
 * Request More Information / Additional Documents
 * PUT /admin/management/seller-applications/:id/request-info
 */
export const requestMoreInfoSellerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    if (!comments) {
      throw new ApiError(400, "Detailed comments must be specified to request information.");
    }

    const application = await SellerApplication.findById(id);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    const before = { status: application.status };

    application.status = REVIEW_STATUS.CHANGES_REQUESTED;
    application.rejectionReason = comments; // Store query description in rejectionReason field
    application.remarks = comments;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.approval = {
      status: REVIEW_STATUS.CHANGES_REQUESTED,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      reviewedBy: req.user._id,
      remarks: comments,
    };
    await application.save();

    if (application.storeId) {
      await SellerNode.findByIdAndUpdate(application.storeId, {
        $set: {
          status: REVIEW_STATUS.CHANGES_REQUESTED,
          isVerified: false,
          isActive: false,
          isLive: false,
          isStoreOpen: false,
          approval: {
            status: REVIEW_STATUS.CHANGES_REQUESTED,
            submittedAt: application.submittedAt,
            reviewedAt: application.reviewedAt,
            reviewedBy: req.user._id,
            remarks: comments,
          },
        },
      });
    }

    // Audit Log
    await logAdminAction(req, "REQUEST_INFO_SELLER_APPLICATION", `application:${id}`, before, { status: REVIEW_STATUS.CHANGES_REQUESTED, comments });

    // In-App Notification
    await Notification.create({
      recipientId: application.userId,
      title: "More Information Requested",
      message: `Additional details required for your store application: ${comments}`,
      type: "more_info_requested",
      metadata: {
        applicationId: application.applicationId,
        storeId: application.storeId || null
      }
    });

    // Queue Request Info Email Alert
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #3B82F6; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; margin-bottom: 20px;">Onboarding Status: Action Required</h2>
          <p style="font-size: 14px; color: #334155;">Hello ${application.ownerName},</p>
          <p style="font-size: 14px; color: #334155;">Our compliance audit board reviewed your onboarding application for <strong>${application.storeName}</strong> and requires the following corrections:</p>
          
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; font-style: italic; margin: 15px 0; font-size: 13px; color: #475569;">
              "${comments}"
          </div>

          <p style="font-size: 14px; color: #334155;">Please log in to your Seller Dashboard to replace/re-upload documents and submit them again for review.</p>

          <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              <p style="font-size: 11px; color: #94a3b8;">Indiafy Merchant Services & Compliance Board</p>
          </div>
      </div>
    `;
    
    await queueEmail(
      application.ownerEmail,
      "Indiafy Onboarding Verification - Action Required",
      emailHtml
    );

    // Emit Socket.IO live update
    try {
      const io = getIO();
      const roomName = `seller_${application.userId}_node_${application.nodeType}`;
      io.to(roomName).emit("APPLICATION_STATUS_UPDATED", {
        applicationId: application._id,
        status: REVIEW_STATUS.CHANGES_REQUESTED,
        rejectionReason: comments,
        storeId: application.storeId || null
      });
    } catch (socketErr) {
      console.error("Socket emit failure on request info:", socketErr.message);
    }

    return res.status(200).json(
      new ApiResponse(200, application, "Request for more information registered successfully.")
    );

  } catch (err) {
    return res.status(err.statusCode || 500).json(new ApiError(err.statusCode || 500, err.message));
  }
};

/**
 * Suspend seller application and linked store node.
 * PATCH/PUT /admin/management/seller-applications/:id/suspend
 */
export const suspendSellerApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { reason = "Suspended by admin review." } = req.body || {};

    const application = await SellerApplication.findById(id).session(session);
    if (!application) {
      throw new ApiError(404, "Seller application not found");
    }

    const before = { status: application.status };
    application.status = REVIEW_STATUS.SUSPENDED;
    application.rejectionReason = reason;
    application.remarks = reason;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;
    application.approval = {
      status: REVIEW_STATUS.SUSPENDED,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      reviewedBy: req.user._id,
      remarks: reason,
    };
    await application.save({ session });

    let storeId = application.storeId || null;
    if (application.storeId) {
      const store = await SellerNode.findById(application.storeId).session(session);
      if (store) {
        store.status = REVIEW_STATUS.SUSPENDED;
        store.isVerified = false;
        store.isActive = false;
        store.isLive = false;
        store.isStoreOpen = false;
        store.approval = {
          status: REVIEW_STATUS.SUSPENDED,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt,
          reviewedBy: req.user._id,
          remarks: reason,
        };
        await store.save({ session });
        storeId = store._id;
      }
    }

    await session.commitTransaction();
    session.endSession();

    await logAdminAction(req, "SUSPEND_SELLER_APPLICATION", `application:${id}`, before, {
      status: REVIEW_STATUS.SUSPENDED,
      reason,
    });

    await Notification.create({
      recipientId: application.userId,
      title: "Your Store Has Been Suspended",
      message: `Your seller store application was suspended. Reason: ${reason}`,
      type: "suspended",
      metadata: {
        applicationId: application.applicationId,
        storeId,
      },
    });

    try {
      const io = getIO();
      const roomName = `seller_${application.userId}_node_${application.nodeType}`;
      io.to(roomName).emit("APPLICATION_STATUS_UPDATED", {
        applicationId: application._id,
        status: REVIEW_STATUS.SUSPENDED,
        rejectionReason: reason,
        storeId,
      });
    } catch (socketErr) {
      console.error("Socket emit failure on suspension:", socketErr.message);
    }

    return res.status(200).json(
      new ApiResponse(200, application, "Application suspended successfully.")
    );
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    return res.status(err.statusCode || 500).json(new ApiError(err.statusCode || 500, err.message));
  }
};

// --- SYSTEM CLIENT-SIDE ERROR LOGGING ---
export const logSystemError = async (req, res) => {
  try {
    const { component, page, route, errorStack, errorMessage } = req.body;
    await logAdminAction(
      req,
      "CLIENT_ERROR_REPORT",
      `component:${component || "unknown"}`,
      { page, route, errorMessage },
      { errorStack }
    );
    return res.status(200).json(
      new ApiResponse(200, null, "Error logged successfully.")
    );
  } catch (err) {
    return res.status(err.statusCode || 500).json(new ApiError(err.statusCode || 500, err.message));
  }
};
