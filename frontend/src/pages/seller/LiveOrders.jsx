/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */

import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Card } from "../../components/SharedUI";
import { 
  Video, 
  Truck, 
  CheckCircle, 
  Printer, 
  Search, 
  Box, 
  MapPin,
  Clock,
  Package,
  User,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { useNodeStore } from "../../store/nodeStore";
import { toast } from "react-toastify";

export default function LiveOrders() {
  const { nodeId } = useParams();  // always correct — from URL
  const { activeNode } = useNodeStore();

  const { sellerOrders, fetchSellerOrders, updateOrderStatus } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (activeNode?._id) {
      fetchSellerOrders(activeNode.nodeType, activeNode._id);
    }
  }, [fetchSellerOrders, activeNode?._id, activeNode?.nodeType]);

  // Show "Accepted", "Processing", and "Shipped" orders in Live Dispatch
  const liveOrders = sellerOrders.filter(o => o.status === "Accepted" || o.status === "Processing" || o.status === "Shipped").map(o => {
    const firstName = o.customer?.firstName || "";
    const lastName = o.customer?.lastName || "";
    const customerName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : "Customer";
    
    return {
      id: o._id,
      displayId: (o._id || "").toString().substring((o._id || "").toString().length - 8).toUpperCase(),
      customer: customerName,
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
    };
  });

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
    } catch (_e) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order from Live Dispatch?")) return;
    try {
      await updateOrderStatus(orderId, "Cancelled");
      toast.info("Order deleted from Live Dispatch & marked as Rejected for customer.");
    } catch (_e) {
      toast.error("Failed to delete order");
    }
  };

  const filteredOrders = liveOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderItems.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Processing": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Shipped": return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Live Fulfillment
            {liveOrders.length > 0 && (
              <span className="bg-blue-50 text-blue-600 text-sm px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                {liveOrders.length} Active
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Pack, record, and dispatch accepted orders.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders or products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Live Orders List */}
      <div className="grid gap-5">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders[order.id];
            return (
              <Card key={order.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all overflow-hidden">
                
                <div className="flex flex-col gap-4">

                  {/* Top Row: Customer Info + Status + Amount */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Customer & Order Meta */}
                    <div className="flex gap-3 items-start flex-1 min-w-0">
                      <div className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
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
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
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

                    {/* Amount */}
                    <div className="text-left sm:text-right bg-slate-50 px-4 py-2.5 rounded-xl shrink-0">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Order Value</p>
                      <p className="text-xl font-black text-slate-900 leading-none">{order.amount}</p>
                      <p className="text-xs font-medium text-slate-500 flex items-center justify-end gap-1 mt-1">
                        <Package size={12}/> {order.itemCount} Item{order.itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Product Items Detail */}
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

                  {/* Shipping Address */}
                  {order.fullAddress && order.fullAddress !== "Local" && (
                    <div className="flex items-start gap-2 text-xs text-slate-500 px-1">
                      <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{order.fullAddress}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-100 pt-4">
                    {order.status === "Accepted" ? (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, "Processing")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm rounded-xl shadow-md transition-all col-span-2"
                      >
                        <CheckCircle size={18}/> Start Processing
                      </button>
                    ) : order.status === "Processing" ? (
                      <>
                        <Link to={`/seller/dashboard/${nodeId || activeNode?._id}/video-verification/${order.id}`} className="w-full">
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-bold text-sm rounded-xl transition-colors">
                            <Video size={16}/> Record Packing
                          </button>
                        </Link>
                        
                        <button 
                          onClick={() => handleUpdateStatus(order.id, "Shipped")}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm rounded-xl shadow-md transition-all"
                        >
                          <Truck size={18}/> Ship Order
                        </button>
                      </>
                    ) : order.status === "Shipped" ? (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, "Delivered")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm rounded-xl shadow-md transition-all col-span-2"
                      >
                        <CheckCircle size={18}/> Mark Delivered
                      </button>
                    ) : null}
                    
                    <button 
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 font-bold text-sm rounded-xl transition-colors"
                    >
                      <Printer size={16}/> Print Invoice
                    </button>

                    <button 
                      onClick={() => handleDeleteOrder(order.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold text-sm rounded-xl transition-colors"
                      title="Delete Order from Live Dispatch"
                    >
                      <Trash2 size={16}/> Delete Order
                    </button>
                  </div>

                </div>
              </Card>
            );
          })
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white border border-slate-200 border-dashed rounded-3xl">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Box size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Orders</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {searchTerm ? `No live orders matching "${searchTerm}".` : "Accept an order from your Inbox to start fulfillment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}