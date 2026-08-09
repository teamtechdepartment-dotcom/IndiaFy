import mongoose from "mongoose";
import SellerOrder from "../models/orders/sellerOrder.model.js";
import SellerNode from "../models/sellerNodes/sellerNode.model.js";

const getCustomerName = (customerData = {}) =>
  [customerData.firstName, customerData.lastName].filter(Boolean).join(" ") || "Customer";

const getOrderNumber = (order) =>
  order.orderNumber || `IND-${order._id.toString().slice(-6).toUpperCase()}`;

export const groupItemsBySellerNode = (items = []) => {
  const groups = new Map();

  for (const item of items) {
    const sellerId = item.seller?.toString();
    const nodeId = item.nodeId?.toString();

    if (!sellerId || !nodeId) {
      throw new Error(`Seller mapping missing sellerId or nodeId for product ${item.product}`);
    }

    const key = `${sellerId}:${nodeId}`;
    if (!groups.has(key)) {
      groups.set(key, {
        sellerId: item.seller,
        nodeId: item.nodeId,
        storeId: item.nodeId,
        nodeType: item.nodeType,
        items: [],
      });
    }

    groups.get(key).items.push(item);
  }

  return Array.from(groups.values());
};

export const createSellerOrderMappings = async (createdOrder, enrichedItems, customerData = {}) => {
  if (!createdOrder?._id || !enrichedItems?.length) return [];

  const groups = groupItemsBySellerNode(enrichedItems);
  const orderNumber = getOrderNumber(createdOrder);
  const customerName = getCustomerName(customerData);
  const mappings = [];

  for (const group of groups) {
    const sellerId = group.sellerId?.toString();
    const nodeId = group.nodeId?.toString();

    if (!mongoose.Types.ObjectId.isValid(sellerId) || !mongoose.Types.ObjectId.isValid(nodeId)) {
      throw new Error(`Invalid seller-node mapping: sellerId=${sellerId}, nodeId=${nodeId}`);
    }

    const node = await SellerNode.findOne({ _id: group.nodeId, seller: group.sellerId }).select("_id seller nodeType storeName");
    if (!node) {
      throw new Error(`Seller node ownership mismatch: sellerId=${sellerId}, nodeId=${nodeId}`);
    }

    const totalAmount = group.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const itemCount = group.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const mapping = await SellerOrder.findOneAndUpdate(
      {
        parentOrderId: createdOrder._id,
        sellerId: group.sellerId,
        nodeId: group.nodeId,
      },
      {
        $set: {
          orderNumber,
          customerId: createdOrder.customer,
          sellerId: group.sellerId,
          storeId: group.storeId,
          nodeId: group.nodeId,
          nodeType: node.nodeType || group.nodeType,
          items: group.items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price,
            gstAmount: item.gstAmount || 0,
          })),
          itemCount,
          totalAmount,
          paymentMethod: createdOrder.paymentMethod,
          paymentStatus: createdOrder.isPaid ? "Paid" : "Pending",
          orderStatus: "Pending",
          customerName,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    mappings.push(mapping);
    console.log(`[Seller Mapping] Order ${createdOrder._id} -> seller ${sellerId}, node ${nodeId}, total ${totalAmount}`);
  }

  return mappings;
};
