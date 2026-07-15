import SellerNode from "../models/sellerNodes/sellerNode.model.js";
import ApiError from "../utils/apiError.js";

/**
 * DashboardGuard Middleware
 *
 * Restricts access to a seller node's dashboard resources.
 * Only allows access if:
 * - node.status === "ACTIVE"
 * - node.isActive === true
 * - node.approval.status === "APPROVED"
 *
 * Returns 403 "Your store is awaiting admin approval." otherwise.
 */
export const dashboardGuard = async (req, res, next) => {
  try {
    const nodeId = req.params.nodeId || req.query.nodeId || req.body.nodeId || req.headers["x-node-id"];
    const sellerId = req.user?.sellerId || req.user?._id;

    if (!nodeId) {
      console.warn(`[DashboardGuard] Access blocked: Node ID is missing.`);
      return res.status(400).json(new ApiError(400, "Node ID is required."));
    }

    const node = await SellerNode.findById(nodeId);
    if (!node) {
      console.warn(`[DashboardGuard] Access blocked: Node not found for ID ${nodeId}.`);
      return res.status(404).json(new ApiError(404, "Store node not found."));
    }

    // Security: seller can only access their own node
    if (node.seller.toString() !== sellerId.toString()) {
      console.warn(`[DashboardGuard] Access blocked: Seller ${sellerId} is not the owner of node ${nodeId}.`);
      return res.status(403).json(new ApiError(403, "Unauthorized access attempt."));
    }

    // Debugging logs requested: Seller ID, Node ID, Database Status, Approval Status, isActive, Permission Result, Middleware Result, Dashboard Loaded
    const isStatusOk = node.status === "ACTIVE";
    const isActiveOk = node.isActive === true;
    const isApprovalOk = node.approval?.status === "APPROVED";
    const canAccess = isStatusOk && isActiveOk && isApprovalOk;

    console.log(`[DashboardGuard DB LOGS]
    - Seller ID: ${sellerId}
    - Node ID: ${nodeId}
    - Database Status: ${node.status}
    - Approval Status: ${node.approval?.status}
    - isActive: ${node.isActive}
    - Permission Result: ${canAccess ? "GRANTED" : "DENIED"}
    - Middleware Result: ${canAccess ? "NEXT()" : "403 FORBIDDEN"}
    - Dashboard Loaded: ${canAccess ? "TRUE" : "FALSE"}`);

    if (!canAccess) {
      return res.status(403).json(new ApiError(403, "Your store is awaiting admin approval."));
    }

    next();
  } catch (err) {
    console.error("[DashboardGuard Error]:", err);
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export default dashboardGuard;
