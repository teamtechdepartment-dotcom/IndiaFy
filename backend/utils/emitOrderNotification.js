import OrderNotification from "../models/notifications/orderNotification.model.js";

/**
 * Fire-and-forget: emit ORDER_CREATED socket event AND persist an OrderNotification record.
 *
 * This is called AFTER the order has been successfully saved to MongoDB.
 * It NEVER modifies the order, throws to the caller, or delays the HTTP response.
 *
 * @param {Server}  io               - Socket.IO server instance
 * @param {Object}  createdOrder     - Saved Mongoose order document
 * @param {Array}   enrichedItems    - Array of { seller, nodeId, nodeType, quantity, price } from createOrder
 * @param {Object}  customerData     - Optional: { firstName, lastName } for display
 */
export const emitOrderNotification = async (io, createdOrder, enrichedItems, customerData = {}) => {
    try {
        if (!io || !createdOrder || !enrichedItems?.length) return;

        // Group items by seller + nodeId to avoid duplicate events
        const sellerNodeMap = new Map();
        for (const item of enrichedItems) {
            const sellerId = item.seller?.toString();
            const nodeId = item.nodeId?.toString();
            if (!sellerId || !nodeId) continue;

            const key = `${sellerId}::${nodeId}`;
            if (!sellerNodeMap.has(key)) {
                sellerNodeMap.set(key, {
                    sellerId: item.seller,
                    nodeId: item.nodeId,
                    nodeType: item.nodeType || "local",
                    items: [],
                });
            }
            sellerNodeMap.get(key).items.push(item);
        }

        const customerName = [customerData?.firstName, customerData?.lastName]
            .filter(Boolean)
            .join(" ") || "A customer";

        const orderNumber = createdOrder.orderNumber ||
            `IND-${createdOrder._id.toString().slice(-6).toUpperCase()}`;

        const promises = [];

        for (const [, entry] of sellerNodeMap) {
            const { sellerId, nodeId, nodeType, items } = entry;
            const totalAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

            const payload = {
                orderId: createdOrder._id,
                orderNumber,
                customerName,
                total: totalAmount,
                totalAmount,
                itemCount,
                paymentMethod: createdOrder.paymentMethod,
                status: createdOrder.status,
                sellerId: sellerId.toString(),
                storeId: nodeId.toString(),
                nodeId: nodeId.toString(),
                createdAt: createdOrder.createdAt || new Date(),
            };

            // --- Socket Emissions ---

            // 1. New precise room: seller_${sellerId}_node_${nodeId}
            const preciseRoom = `seller_${sellerId.toString()}_node_${nodeId.toString()}`;

            // 2. Legacy room (backward compat): seller_${sellerId}_node_${nodeType}
            const legacyRoom = `seller_${sellerId.toString()}_node_${nodeType}`;
            const sellerRoom = `seller:${sellerId.toString()}`;
            const nodeRoom = `node:${nodeId.toString()}`;

            // One chained emission prevents duplicate delivery to sockets in both rooms.
            io.to(preciseRoom).to(legacyRoom).to(sellerRoom).to(nodeRoom).emit("ORDER_CREATED", payload);

            console.log(`[Socket] ORDER_CREATED emitted → rooms: [${preciseRoom}] [${legacyRoom}] [${sellerRoom}] [${nodeRoom}]`);

            // --- Persist Notification to DB (async, non-blocking) ---
            promises.push(
                OrderNotification.create({
                    sellerId,
                    nodeId,
                    orderId: createdOrder._id,
                    orderNumber,
                    type: "ORDER",
                    customerName,
                    totalAmount,
                    itemCount,
                    paymentMethod: createdOrder.paymentMethod,
                    status: createdOrder.status,
                    read: false,
                    isRead: false,
                }).catch((err) => {
                    console.error("[OrderNotification] DB persist failed:", err.message);
                })
            );
        }

        await Promise.allSettled(promises);
    } catch (err) {
        // Never propagate — caller must not be affected
        console.error("[emitOrderNotification] Unexpected error:", err.message);
    }
};
