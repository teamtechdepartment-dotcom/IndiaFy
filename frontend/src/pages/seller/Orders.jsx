import React, { useState, useEffect } from "react";

import { Card } from "../../components/SharedUI";
import { 
  MapPin, 
  Clock, 
  Search, 
  CheckCircle, 
  XCircle, 
  ShoppingBag,
  Inbox,
  Package,
  User,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
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
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (activeNode?._id) {
      clearBadge(activeNode._id);
      markAllRead(activeNode._id);
      fetchSellerOrders(activeNode.nodeType, activeNode._id);
    }
  }, [fetchSellerOrders, clearBadge, markAllRead, activeNode?._id, activeNode?.nodeType]);

  // Only show Pending orders in Orders Inbox
  const orderRows = sellerOrders
    .filter(o => o.status === "Pending")
    .map(o => ({
      id: o._id,
      parentOrderId: o.parentOrderId,
      displayId: o._id.substring(o._id.length - 8).toUpperCase(),
      customer: o.customerName || `${o.customer?.firstName || ""} ${o.customer?.lastName || ""}`.trim() || "Customer",
      customerEmail: o.customer?.email || "",
      location: (o.shippingAddress?.city || "") + ", " + (o.shippingAddress?.postalCode || ""),
      fullAddress: o.shippingAddress ? `${o.shippingAddress.address || ""}, ${o.shippingAddress.city || ""}, ${o.shippingAddress.state || ""} ${o.shippingAddress.postalCode || ""}` : "Local",
      time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      amount: "₹" + (o.totalPrice || 0),
      itemCount: o.orderItems?.length || 0,
      status: o.status,
      paymentMethod: o.paymentMethod || "COD",
      orderItems: (o.orderItems || []).map(item => ({
        productName: item.product?.productName || item.productName || "Unknown Product",
        productImage: item.product?.productImage?.[0] || "",
        shortDescription: item.product?.shortDescription || item.product?.description || "",
        quantity: item.quantity || 1,
        price: item.price || 0,
      }))
    }));
  const pendingCount = orderRows.length;

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

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
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderItems.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getNextStatus = (status) => {
    if (status === "Accepted") return "Packed";
    if (status === "Packed") return "Dispatched";
    if (status === "Dispatched" || status === "Shipped") return "Delivered";
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Accepted": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Processing": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Packed": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Dispatched":
      case "Shipped": return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Orders Inbox 
            {pendingCount > 0 && (
              <span className="bg-red-50 text-red-600 text-sm px-2.5 py-0.5 rounded-full font-bold animate-pulse">
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
            placeholder="Search ID, Name, Product..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Orders List Container */}
      <div className="grid gap-4">
        
        {/* Render Filtered Orders */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders[order.id];
            return (
              <Card key={order.id} className={`hover:border-slate-300 transition-all overflow-hidden ${order.status === "Pending" ? "border-l-4 border-l-amber-400" : ""}`}>
                
                {/* Order Header Row */}
                <div className="flex flex-col gap-4">
                  
                  {/* Top: Customer Info + Status + Amount */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Customer & Order Meta */}
                    <div className="flex gap-3 items-start flex-1 min-w-0">
                      <div className="w-11 h-11 bg-slate-800 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                            {order.customer}
                          </h3>
                          <span className="text-slate-400 font-mono text-xs px-1.5 py-0.5 bg-slate-100 rounded shrink-0">
                            #{order.displayId}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400"/> {order.location}</span>
                          <span className="flex items-center gap-1 text-amber-600"><Clock size={12}/> {order.date}, {order.time}</span>
                          <span className="flex items-center gap-1"><CreditCard size={12} className="text-slate-400"/> {order.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount + Items + Actions */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">{order.amount}</p>
                        <p className="text-xs font-medium text-slate-500 flex items-center justify-end gap-1">
                          <Package size={12}/> {order.itemCount} Item{order.itemCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {order.status === "Pending" ? (
                          <>
                            <button 
                              onClick={() => handleReject(order.id)}
                              className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                              title="Reject Order"
                            >
                              <XCircle size={16} /> Reject
                            </button>
                            <button 
                              onClick={() => handleAccept(order.id)}
                              className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                              title="Accept Order"
                            >
                              <CheckCircle size={16} /> Accept
                            </button>
                          </>
                        ) : getNextStatus(order.status) ? (
                          <button
                            onClick={() => handleNextStatus(order.id, getNextStatus(order.status))}
                            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle size={16} /> Mark {getNextStatus(order.status)}
                          </button>
                        ) : (
                          <span className={`px-3 py-2 font-bold text-xs rounded-xl border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Items Preview (always visible — first 2 items) */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-100 overflow-hidden">
                    {order.orderItems.slice(0, isExpanded ? order.orderItems.length : 2).map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? "border-t border-slate-100" : ""}`}>
                        {/* Product Image */}
                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                          {item.productImage ? (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <ImageIcon size={20} className="text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{item.productName}</p>
                          {item.shortDescription && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.shortDescription}</p>
                          )}
                        </div>

                        {/* Qty & Price */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-900">₹{item.price * item.quantity}</p>
                          <p className="text-[11px] text-slate-500 font-medium">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>
                    ))}

                    {/* Show More / Less toggle */}
                    {order.orderItems.length > 2 && (
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 border-t border-slate-100"
                      >
                        {isExpanded ? (
                          <><ChevronUp size={14} /> Show Less</>
                        ) : (
                          <><ChevronDown size={14} /> +{order.orderItems.length - 2} More Item{order.orderItems.length - 2 > 1 ? "s" : ""}</>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Shipping Address (compact) */}
                  {order.fullAddress && order.fullAddress !== "Local" && (
                    <div className="flex items-start gap-2 text-xs text-slate-500 px-1">
                      <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{order.fullAddress}</span>
                    </div>
                  )}
                </div>

              </Card>
            );
          })
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

