import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import {
  MessageSquare,
  Truck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

export default function WhatsAppAutomation() {
  const [enabled, setEnabled] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState("Order Confirmation");

  const templates = [
    {
      name: "Order Confirmation",
      icon: MessageSquare,
      message:
        "Hello {{customer_name}},\n\nThank you for your order {{order_id}}. Your order has been successfully placed and is being processed.\n\n– Team Graphura",
    },
    {
      name: "Order Shipped",
      icon: Truck,
      message:
        "Good news {{customer_name}} 🎉\n\nYour order {{order_id}} has been shipped and is on the way.\n\n– Team Graphura",
    },
    {
      name: "Order Delivered",
      icon: CheckCircle,
      message:
        "Hi {{customer_name}},\n\nYour order {{order_id}} has been delivered successfully. We hope you love it ❤️\n\n– Team Graphura",
    },
    {
      name: "Order Delayed",
      icon: AlertTriangle,
      message:
        "Hi {{customer_name}},\n\nWe’re sorry! Your order {{order_id}} is delayed due to logistics issues. We’re working on it.\n\n– Team Graphura",
    },
    {
      name: "Order Cancelled",
      icon: XCircle,
      message:
        "Hi {{customer_name}},\n\nYour order {{order_id}} has been cancelled. If you have questions, feel free to contact us.\n\n– Team Graphura",
    },
  ];

  const selectedTemplate = templates.find((t) => t.name === activeTemplate);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto w-full"
        >
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black">
              WhatsApp Automation
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Automate order updates & broadcast messages via WhatsApp
            </p>
          </div>

          {/* Enable / Disable */}
          <div className="bg-white border rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                WhatsApp Automation
              </h2>
              <p className="text-sm text-gray-500">
                Enable or disable automated WhatsApp messages
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 transition" />
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6" />
            </label>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Templates */}
            <div className="bg-white border rounded-2xl p-4 sm:p-6">
              <h2 className="font-bold mb-4">Message Templates</h2>

              <div className="space-y-2">
                {templates.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setActiveTemplate(t.name)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                        activeTemplate === t.name
                          ? "bg-black text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Icon size={18} />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Editor */}
            <div className="bg-white border rounded-2xl p-4 sm:p-6 xl:col-span-2">
              <h2 className="font-bold mb-4">Message Content</h2>

              <textarea
                rows={8}
                value={selectedTemplate.message}
                readOnly
                className="w-full border rounded-xl p-4 text-sm resize-none bg-gray-50"
              />

              <div className="mt-4 flex justify-end">
                <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-900 transition">
                  <Send size={16} />
                  Save Template
                </button>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="mt-8 sm:mt-10 bg-white border rounded-2xl p-4 sm:p-6 overflow-x-auto">
            <h2 className="font-bold mb-4">Message Logs</h2>

            <table className="w-full min-w-[500px] text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left">Customer</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t">
                  <td className="py-3">Rahul Sharma</td>
                  <td>Order Confirmation</td>
                  <td className="text-green-600 font-semibold">Sent</td>
                  <td>Today 11:32 AM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
