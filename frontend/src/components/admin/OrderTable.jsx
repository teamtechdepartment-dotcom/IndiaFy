import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ordersData = [
  {
    id: "#GR-2045",
    customer: "Akhil Verma",
    date: "12 Oct 2025",
    payment: "PAID",
    status: "Shipped",
    amount: "₹4,299",
  },
  {
    id: "#GR-2044",
    customer: "Ashiwad Kumar",
    date: "11 Oct 2025",
    payment: "COD",
    status: "Processing",
    amount: "₹1,850",
  },
  {
    id: "#GR-2043",
    customer: "Ronak Singh",
    date: "11 Oct 2025",
    payment: "PAID",
    status: "Delivered",
    amount: "₹6,400",
  },
  {
    id: "#GR-2042",
    customer: "Satyam Gupta",
    date: "10 Oct 2025",
    payment: "REFUNDED",
    status: "Cancelled",
    amount: "₹2,100",
  },
  {
    id: "#GR-2041",
    customer: "Akhil Singh",
    date: "9 Oct 2025",
    payment: "PAID",
    status: "Processing",
    amount: "₹3,500",
  },
];

export default function OrderTable() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredOrders = ordersData.filter(
    (order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="order-table-wrapper bg-white rounded-2xl border p-4 w-full max-w-none mx-0"
      >
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Order ID, Customer Name..."
          className="w-full mb-4 px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
        />

        {/* MOBILE VIEW */}
        <div className="space-y-4 md:hidden">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-xl p-4 shadow-sm w-full"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-blue-600">{order.id}</p>
                <p className="font-semibold">{order.amount}</p>
              </div>

              <p className="text-sm mb-1">{order.customer}</p>
              <p className="text-xs text-gray-500 mb-2">{order.date}</p>

              <div className="flex gap-2 mb-3 flex-wrap">
                <PaymentBadge text={order.payment} />
                <StatusBadge status={order.status} />
              </div>

              <div
                onClick={() =>
                  navigate(`/admin/orders/${order.id.replace("#", "")}`)
                }
                className="text-blue-600 text-sm cursor-pointer hover:underline"
              >
                View Order
              </div>
            </motion.div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No orders found
            </div>
          )}
        </div>

        {/* TABLET & DESKTOP VIEW */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="order-table w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="py-3 pr-4">Order ID</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="py-3 pr-4 font-medium text-blue-600">
                    {order.id}
                  </td>
                  <td className="py-3 pr-4">{order.customer}</td>
                  <td className="py-3 pr-4">{order.date}</td>
                  <td className="py-3 pr-4">
                    <PaymentBadge text={order.payment} />
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pr-4">{order.amount}</td>
                  <td
                    onClick={() =>
                      navigate(`/admin/orders/${order.id.replace("#", "")}`)
                    }
                    className="py-3 text-blue-600 cursor-pointer hover:underline"
                  >
                    View Order
                  </td>
                </motion.tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* MEDIA QUERY */}
      <style>
        {`
        @media (max-width: 768px) {
          .order-table-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            padding: 16px !important;
            border-radius: 0 !important;
          }

          .order-table {
            width: 100% !important;
            min-width: 100% !important;
            font-size: 13px !important;
          }
        }
      `}
      </style>
    </>
  );
}

/* Payment Badge */
function PaymentBadge({ text }) {
  const color =
    text === "PAID"
      ? "bg-green-100 text-green-700"
      : text === "COD"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${color}`}
    >
      {text}
    </span>
  );
}

/* Status Badge */
function StatusBadge({ status }) {
  const colors = {
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
    Processing: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${colors[status]}`}
    >
      {status}
    </span>
  );
}
