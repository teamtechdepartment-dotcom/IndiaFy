import mongoose from "mongoose";
import OrderNotification from "../../models/notifications/orderNotification.model.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

/**
 * @desc    Get paginated order notifications for the authenticated seller
 * @route   GET /api/v1/indiafy/seller/notifications?nodeId=xxx&page=1&limit=20
 * @access  Private (Seller)
 */
export const getOrderNotifications = asyncHandler(async (req, res) => {
    const rawSellerId = req.user._id || req.user.sellerId || req.user.id;
    const sellerIdObj = mongoose.Types.ObjectId.isValid(rawSellerId) ? new mongoose.Types.ObjectId(rawSellerId) : rawSellerId;
    const { nodeId, page = 1, limit = 20 } = req.query;

    const query = { sellerId: { $in: [sellerIdObj, String(rawSellerId)] } };
    if (nodeId) {
        if (!mongoose.Types.ObjectId.isValid(nodeId)) {
            throw new ApiError(400, "Invalid nodeId");
        }
        query.nodeId = new mongoose.Types.ObjectId(nodeId);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
        OrderNotification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        OrderNotification.countDocuments(query)
    ]);

    return res.status(200).json(new ApiResponse(200, {
        notifications,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
    }, "Notifications fetched successfully"));
});

/**
 * @desc    Get unread notification counts per nodeId for the authenticated seller
 * @route   GET /api/v1/indiafy/seller/notifications/unread-count?nodeIds=id1,id2
 * @access  Private (Seller)
 */
export const getUnreadCounts = asyncHandler(async (req, res) => {
    const rawSellerId = req.user._id || req.user.sellerId || req.user.id;
    const sellerIdObj = mongoose.Types.ObjectId.isValid(rawSellerId) ? new mongoose.Types.ObjectId(rawSellerId) : rawSellerId;
    const { nodeIds } = req.query;

    if (!nodeIds) {
        return res.status(200).json(new ApiResponse(200, {}, "No node IDs provided"));
    }

    const nodeIdArray = nodeIds
        .split(",")
        .map(id => id.trim())
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));

    if (nodeIdArray.length === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "No valid node IDs"));
    }

    const counts = await OrderNotification.aggregate([
        {
            $match: {
                sellerId: { $in: [sellerIdObj, String(rawSellerId)] },
                nodeId: { $in: nodeIdArray },
                $or: [
                    { read: false },
                    { read: { $exists: false }, isRead: false }
                ]
            }
        },
        {
            $group: {
                _id: "$nodeId",
                count: { $sum: 1 }
            }
        }
    ]);

    const result = {};
    counts.forEach(c => {
        result[c._id.toString()] = c.count;
    });

    return res.status(200).json(new ApiResponse(200, result, "Unread counts fetched"));
});

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/v1/indiafy/seller/notifications/:id/read
 * @access  Private (Seller)
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const rawSellerId = req.user._id || req.user.sellerId || req.user.id;
    const sellerIdObj = mongoose.Types.ObjectId.isValid(rawSellerId) ? new mongoose.Types.ObjectId(rawSellerId) : rawSellerId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid notification ID");
    }

    const notification = await OrderNotification.findOneAndUpdate(
        { _id: id, sellerId: { $in: [sellerIdObj, String(rawSellerId)] } },
        { $set: { read: true, isRead: true } },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return res.status(200).json(new ApiResponse(200, notification, "Marked as read"));
});

/**
 * @desc    Mark all notifications for a node as read
 * @route   PUT /api/v1/indiafy/seller/notifications/read-all?nodeId=xxx
 * @access  Private (Seller)
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
    const rawSellerId = req.user._id || req.user.sellerId || req.user.id;
    const sellerIdObj = mongoose.Types.ObjectId.isValid(rawSellerId) ? new mongoose.Types.ObjectId(rawSellerId) : rawSellerId;
    const { nodeId } = req.query;

    const query = {
        sellerId: { $in: [sellerIdObj, String(rawSellerId)] },
        $or: [
            { read: false },
            { read: { $exists: false }, isRead: false }
        ]
    };
    if (nodeId) {
        if (!mongoose.Types.ObjectId.isValid(nodeId)) {
            throw new ApiError(400, "Invalid nodeId");
        }
        query.nodeId = new mongoose.Types.ObjectId(nodeId);
    }

    const result = await OrderNotification.updateMany(query, { $set: { read: true, isRead: true } });

    return res.status(200).json(new ApiResponse(200, {
        modifiedCount: result.modifiedCount
    }, "All notifications marked as read"));
});
