import React, { useState, useEffect } from "react";

import { Card } from "../../components/SharedUI";
import { 
  MapPin, 
  Clock, 
  Search, 
  CheckCircle, 
  XCircle, 
  ShoppingBag,
  Inbox
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { useNodeStore } from "../../store/nodeStore";
import { useNotificationStore } from "../../store/notificationStore";
import { toast } from "react-toastify";

export default function Orders() {
  const { activeNode } = useNodeStore();

  const { sellerOrders, fetchSellerOrders, updateOrderStatus } = useOrderStore();
  const { clearBadge, markAllRead } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (activeNode?._id) {
      clearBadge(activeNode._id);
      markAllRead(activeNode._id);
      fetchSellerOrders(activeNode.nodeType, activeNode._id);
    }
  }, [fetchSellerOrders, clearBadge, markAllRead, activeNode?._id, activeNode?.nodeType]);

  const orderRows = sellerOrders.map(o => ({
    id: o._id,
    parentOrderId: o.parentOrderId,
    displayId: o._id.substring(o._id.length - 8).toUpperCase(),
    customer: o.customerName || `${o.customer?.firstName || ""} ${o.customer?.lastName || ""}`.trim() || "Customer",
    location: o.shippingAddress?.city + ", " + o.shippingAddress?.postalCode || "Local",
    time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: "₹" + o.totalPrice,
    items: `${o.orderItems.length} Item(s)`,
    status: o.status
  }));
  const pendingCount = orderRows.filter(o => o.status === "Pending").length;

  const handleAccept = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "Accepted");
      toast.success("Order accepted and moved to Live Fulfillment");
    } catch (_err) {
      toast.error("Failed to accept order");
    }
  };

  const handleReject = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "Cancelled");
      toast.info("Order rejected");
    } catch (_err) {
      toast.error("Failed to reject order");
    }
  };

  const handleNextStatus = async (orderId, nextStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      toast.success(`Order marked as ${nextStatus}`);
    } catch (_err) {
      toast.error("Failed to update order");
    }
  };

  // Filtering Logic
  const filteredOrders = orderRows.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.parentOrderId?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNextStatus = (status) => {
    if (status === "Accepted") return "Packed";
    if (status === "Packed") return "Dispatched";
    if (status === "Dispatched" || status === "Shipped") return "Delivered";
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Orders Inbox 
            {pendingCount > 0 && (
              <span className="bg-red-50 text-red-600 text-sm px-2.5 py-0.5 rounded-full font-bold">
                {pendingCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage live customer orders.</p>
        </div>

        {/* Localized Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ID, Name, or Area..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Orders List Container */}
      <div className="grid gap-4">
        
        {/* Render Filtered Orders */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:border-slate-300 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Order Info (Left Side) */}
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-sm">
                    {order.displayId.slice(0, 4)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">
                      {order.customer} 
                      <span className="text-slate-400 font-medium text-sm ml-2 px-2 py-0.5 bg-slate-100 rounded-md">
                        {order.displayId}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><MapPin size={15} className="text-slate-400"/> {order.location}</span>
                      <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md"><Clock size={14}/> {order.time}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Divider */}
                <div className="h-px w-full bg-slate-100 lg:hidden"></div>

                {/* Order Financials & Actions (Right Side) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-4 sm:gap-6 w-full lg:w-auto">
                  
                  {/* Financials */}
                  <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                    <p className="text-lg font-bold text-slate-900">{order.amount}</p>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <ShoppingBag size={14}/> {order.items}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {order.status === "Pending" ? (
                      <>
                        <button 
                          onClick={() => handleReject(order.id)}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} /> <span className="sm:hidden xl:inline">Reject</span>
                        </button>
                        
                        <button 
                          onClick={() => handleAccept(order.id)}
                          className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} /> Accept
                        </button>
                      </>
                    ) : getNextStatus(order.status) ? (
                      <button
                        onClick={() => handleNextStatus(order.id, getNextStatus(order.status))}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} /> Mark {getNextStatus(order.status)}
                      </button>
                    ) : (
                      <span className="px-4 py-2.5 bg-slate-100 text-slate-500 font-bold text-sm rounded-xl">
                        {order.status}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            </Card>
          ))
        ) : (
          /* Empty State Handling */
          <div className="text-center py-16 px-4 bg-white border border-slate-200 border-dashed rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Inbox size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {orderRows.length === 0 ? "No orders yet" : "No matches found"}
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {orderRows.length === 0
                ? "New customer orders for this node will appear here automatically."
                : `We couldn't find any orders matching "${searchTerm}".`}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
