
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/SharedUI";
import { 
  Video, 
  Truck, 
  CheckCircle, 
  Printer, 
  Search, 
  Box, 
  MapPin,
  Clock
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { toast } from "react-toastify";

export default function LiveOrders() {
  const { sellerOrders, fetchSellerOrders, updateOrderStatus } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  // Show only "Processing" orders
  const liveOrders = sellerOrders.filter(o => o.status === "Processing" || o.status === "Shipped").map(o => {
    const firstName = o.customer?.firstName || "";
    const lastName = o.customer?.lastName || "";
    const customerName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : "Customer";
    
    return {
      id: o._id,
      displayId: (o._id || "").toString().substring((o._id || "").toString().length - 8).toUpperCase(),
      customer: customerName,
      location: o.shippingAddress?.city + ", " + o.shippingAddress?.postalCode || "Local",
      time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: "₹" + (o.totalPrice || 0),
      items: `${o.orderItems?.length || 0} Item(s)`,
      status: o.status
    };
  });

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = liveOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Live Fulfillment
            {liveOrders.length > 0 && (
              <span className="bg-blue-50 text-blue-600 text-sm px-2.5 py-0.5 rounded-full font-bold">
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
            placeholder="Search active orders..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Live Orders List */}
      <div className="grid gap-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
              
              {/* Top Row: Info & Status */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      {order.status || "Packing In Progress"}
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> {order.time}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {order.displayId} <span className="text-slate-400 font-medium text-lg mx-1">•</span> {order.customer}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Box size={15}/> {order.items}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={15}/> {order.location}</span>
                  </div>
                </div>
                
                <div className="text-left sm:text-right bg-slate-50 px-4 py-3 rounded-xl w-full sm:w-auto">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Order Value</p>
                  <p className="text-2xl font-bold text-slate-900 leading-none">{order.amount}</p>
                </div>
              </div>

              {/* Bottom Row: Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-100 pt-5">
                {order.status === "Processing" ? (
                  <>
                    <Link to={`/video-verification/${order.id}`} className="w-full">
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
              </div>
            </Card>
          ))
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