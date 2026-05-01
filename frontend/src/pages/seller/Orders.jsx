
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
import { toast } from "react-toastify";

export default function Orders() {
  const { sellerOrders, fetchSellerOrders, updateOrderStatus } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  // Filter out orders that are already processed or cancelled. Show only "Pending" or similar in inbox.
  // Wait, the status is "Pending".
  const inboxOrders = sellerOrders.filter(o => o.status === "Pending").map(o => ({
    id: o._id,
    displayId: o._id.substring(o._id.length - 8).toUpperCase(),
    customer: o.customer?.firstName + " " + o.customer?.lastName || "Customer",
    location: o.shippingAddress?.city + ", " + o.shippingAddress?.postalCode || "Local",
    time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: "₹" + o.totalPrice,
    items: `${o.orderItems.length} Item(s)`,
    status: o.status
  }));

  const handleAccept = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "Processing");
      toast.success("Order accepted and moved to Live Fulfillment");
    } catch (e) {
      toast.error("Failed to accept order");
    }
  };

  const handleReject = async (orderId) => {
    try {
      await updateOrderStatus(orderId, "Cancelled");
      toast.info("Order rejected");
    } catch (e) {
      toast.error("Failed to reject order");
    }
  };

  // Filtering Logic
  const filteredOrders = inboxOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Orders Inbox 
            {inboxOrders.length > 0 && (
              <span className="bg-red-50 text-red-600 text-sm px-2.5 py-0.5 rounded-full font-bold">
                {inboxOrders.length} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review and accept incoming customer orders.</p>
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
              {inboxOrders.length === 0 ? "You're all caught up!" : "No matches found"}
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {inboxOrders.length === 0 
                ? "There are no pending orders in your inbox at the moment. Take a breather!" 
                : `We couldn't find any pending orders matching "${searchTerm}".`}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}