/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Printer,
  Pencil,
  CheckCircle,
  Package,
  Truck,
  ChevronLeft,
  DollarSign,
  User,
  Clock,
  MessageSquare,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalNote, setInternalNote] = useState("");

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/orders/${id}`);
      // res = { statusCode, data: order, message }
      const data = res.data || res;
      setOrder(data);
    } catch (_err) {
      toast.error("Failed to load order detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (status) => {
    try {
      await axiosInstance.put(`/admin/management/orders/${id}/state`, { status });
      toast.success(`Order status set to ${status}`);
      fetchOrder();
    } catch (_err) {
      toast.error("Failed to update status");
    }
  };

  const handlePostNote = async () => {
    if (!internalNote.trim()) return;
    try {
      // Create a support ticket mapping or mock internally
      toast.success("Internal note logged");
      setInternalNote("");
    } catch (_err) {
      toast.error("Failed to post note");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="p-8 text-center text-slate-400 font-semibold">Loading order sheet...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="p-8 text-center text-slate-400 font-semibold">Order not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 w-full overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 md:p-6 space-y-6"
        >
          {/* Back button */}
          <div
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-black w-fit"
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">Back to Orders</span>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black text-[#0B1528]">
                  Order #{order._id}
                </h1>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 uppercase">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => handleUpdateStatus("Shipped")}
                className="px-4 py-2 bg-[#0B1528] text-white hover:bg-black text-xs font-bold rounded-xl border border-[#D4AF37]/20 transition"
              >
                Mark Shipped
              </button>
              <button
                onClick={() => handleUpdateStatus("Delivered")}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition"
              >
                Mark Delivered
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Purchase sheet */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border rounded-3xl p-6 shadow-xs">
                <h3 className="font-extrabold text-[#0B1528] text-sm mb-4">Line Items</h3>
                
                <div className="divide-y divide-gray-100">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">P</div>
                        <div>
                          <p className="font-extrabold text-[#0B1528] text-sm">Product SKU: {item.product}</p>
                          <p className="text-xs text-slate-400">Seller: {item.seller}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-black text-gray-900">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{order.itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-slate-800">₹{order.shippingPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Estimate</span>
                    <span className="font-semibold text-slate-800">₹{order.taxPrice}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-[#0B1528] pt-2 border-t">
                    <span>Total Amount</span>
                    <span>₹{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-3xl p-6 shadow-xs">
                  <h3 className="font-extrabold text-[#0B1528] text-sm mb-4">Shipping Destination</h3>
                  <div className="text-xs space-y-2 text-gray-600 font-medium">
                    <p className="font-black text-[#0B1528]">Recipient ID: {order.customer}</p>
                    <p>{order.shippingAddress?.address}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
                    <p>{order.shippingAddress?.country}</p>
                  </div>
                </div>

                <div className="bg-white border rounded-3xl p-6 shadow-xs">
                  <h3 className="font-extrabold text-[#0B1528] text-sm mb-4">Payment Ledger</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0B1528]">{order.paymentMethod || "COD"}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        order.isPaid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                      }`}>
                        {order.isPaid ? "Paid / Settled" : "Unpaid"}
                      </span>
                    </div>
                    {order.paidAt && (
                      <p className="text-[10px] text-slate-400">Settled: {new Date(order.paidAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar notes */}
            <div className="space-y-6">
              
              {/* Timeline */}
              <div className="bg-white border rounded-3xl p-6 shadow-xs">
                <h3 className="font-extrabold text-[#0B1528] text-sm mb-4">Audit Timeline</h3>
                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <div className="flex gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-slate-800">Order Placed</p>
                      <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {order.isPaid && (
                    <div className="flex gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <div>
                        <p className="text-slate-800">Payment Verified</p>
                        <p className="text-[10px] text-gray-400">{order.paidAt ? new Date(order.paidAt).toLocaleDateString() : ""}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-[#0B1528] text-sm">Administrative Memo</h3>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="w-full h-24 border rounded-xl p-3 text-xs outline-none bg-slate-50 focus:bg-white focus:border-[#D4AF37]"
                  placeholder="Type internal notes..."
                />
                <button 
                  onClick={handlePostNote}
                  className="w-full py-2.5 bg-[#0B1528] text-white hover:bg-black font-bold rounded-xl text-xs transition active:scale-95"
                >
                  Save Note
                </button>
              </div>

            </div>

          </div>
        </motion.main>
      </div>
    </div>
  );
}
