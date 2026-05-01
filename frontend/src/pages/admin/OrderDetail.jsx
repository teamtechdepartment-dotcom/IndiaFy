import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Printer,
  Pencil,
  CheckCircle,
  Package,
  Truck,
  ChevronLeft,
} from "lucide-react";
import { generateInvoice } from "../../utils/generateInvoice";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const order = {
    id: `#${id}`,
    date: "12 Oct 2025",
    status: "Delivered",
    payment: "PAID",
    customer: {
      name: "Akhil Verma",
      email: "akhil@gmail.com",
      phone: "+91 98765 43210",
      address: "Mumbai, India",
    },
    items: [
      { name: "Floral Kurta", qty: 1, price: 2499 },
      { name: "Printed Dupatta", qty: 1, price: 1800 },
    ],
    summary: {
      subtotal: 4299,
      shipping: 0,
      total: 4299,
    },
  };

  return (
    <div className="flex min-h-screen bg-slate-50 w-full overflow-x-hidden">
      {/* Sidebar - tablet & laptop same */}
      <div className="hidden md:block md:w-64">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 p-4 md:p-6"
        >
          {/* BACK */}
          <div
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-slate-500 cursor-pointer hover:text-black w-fit"
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </div>

          {/* HEADER */}
          <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-lg md:text-2xl font-bold">
                  Order {order.id}
                </h1>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  IN TRANSIT
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Placed on Dec 24, 2025 at 2:15 PM
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => generateInvoice(order)}
                className="w-full md:w-auto px-4 h-10 border rounded-lg text-sm flex items-center gap-2 justify-center"
              >
                <Printer size={16} />
                Print Invoice
              </button>

              <button className="w-full md:w-auto px-4 h-10 bg-black text-white rounded-lg text-sm flex items-center gap-2 font-semibold justify-center">
                <Pencil size={16} />
                Edit Order
              </button>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="md:col-span-2 space-y-6 min-w-0">
              <div className="bg-white rounded-xl border p-4 md:p-6">
                <h3 className="font-semibold mb-4">Purchased Items (2)</h3>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b pb-4">
                    <div className="flex gap-4">
                      <div className="size-14 bg-slate-100 rounded-lg" />
                      <div>
                        <p className="font-semibold">Midnight Wool Overcoat</p>
                        <p className="text-xs text-slate-400">
                          UK 40 • Navy Blue
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm">Qty: 1</p>
                      <p className="font-semibold">₹2,40,000</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex gap-4">
                      <div className="size-14 bg-slate-100 rounded-lg" />
                      <div>
                        <p className="font-semibold">Heritage Gold Watch</p>
                        <p className="text-xs text-slate-400">
                          One Size • Yellow Gold
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm">Qty: 1</p>
                      <p className="font-semibold">₹85,000</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹3,25,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping (Express)</span>
                    <span>₹4,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Luxury Gift Wrap</span>
                    <span>₹1,500</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹3,31,000</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border p-4 md:p-6">
                  <h3 className="font-semibold mb-4">Customer Profile</h3>

                  <p className="font-semibold">Aamir Farid</p>
                  <p className="text-xs text-blue-600 mb-4">
                    ID #CUST-987654321
                  </p>

                  <div className="text-sm space-y-2">
                    <p>Email: aamir@luxury.in</p>
                    <p>Phone: +91 98765 43210</p>
                    <p>Address: 110025 South Delhi, Delhi NCR, India</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-4 md:p-6">
                  <h3 className="font-semibold mb-4">Payment & Billing</h3>

                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Apple Pay</p>
                    <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full">
                      AUTHORIZED
                    </span>
                  </div>

                  <p className="text-sm text-slate-500">
                    Card ending •••• 4412
                  </p>

                  <p className="text-sm mt-3">
                    Fraud Risk Score:{" "}
                    <span className="text-emerald-600 font-semibold">
                      Low (02/100)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-6 min-w-0">
              <div className="bg-white rounded-xl border p-4 md:p-6">
                <h3 className="font-semibold mb-4">Order Timeline</h3>

                <div className="space-y-4 text-sm">
                  {[
                    { label: "Order Placed", Icon: CheckCircle },
                    { label: "Payment Confirmed", Icon: CheckCircle },
                    { label: "Packed", Icon: Package },
                    { label: "Dispatched", Icon: Truck },
                  ].map(({ label, Icon }, index) => (
                    <div key={index} className="flex gap-3">
                      <Icon size={18} className="text-blue-600" />
                      <div>
                        <p className="font-semibold">{label}</p>
                        <p className="text-xs text-slate-400">Dec 24, 2025</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border p-4 md:p-6">
                <h3 className="font-semibold mb-4">Internal Admin Notes</h3>

                <textarea
                  className="w-full h-24 border rounded-lg p-3 text-sm"
                  placeholder="Add a private note..."
                />

                <button className="mt-3 w-full h-9 bg-black text-white rounded-lg text-sm">
                  Post Note
                </button>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
