import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";

// @desc    Get stats for Delivery Partner Dashboard
// @route   GET /api/v1/indiafy/delivery/dashboard
// @access  Protected (Delivery Partner Only)
export const getDeliveryDashboard = asyncHandler(async (req, res) => {
    // Return dummy metrics for skeleton Delivery Portal
    const stats = {
        activeDeliveries: 3,
        completedDeliveries: 42,
        pendingRequests: 5,
        rating: 4.8,
        earningsThisWeek: 4500,
        recentDeliveries: [
            { id: "DLV-001", customerName: "Aarav Sharma", status: "In Transit", address: "Sector 45, Gurugram" },
            { id: "DLV-002", customerName: "Priya Patel", status: "Pending Pickup", address: "Sector 21, Gurugram" },
            { id: "DLV-003", customerName: "Amit Kumar", status: "Delivered", address: "DLF Phase 3, Gurugram" }
        ]
    };
    return res.status(200).json(new ApiResponse(200, stats, "Delivery partner statistics retrieved successfully"));
});
