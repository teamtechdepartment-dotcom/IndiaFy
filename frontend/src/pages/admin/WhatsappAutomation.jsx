import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import {
  MessageSquare,
  Truck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const INITIAL_TEMPLATES = [
  {
    id: "conf",
    name: "Order Confirmation",
    icon: MessageSquare,
    message:
      "Hello {{customer_name}},\n\nThank you for your order {{order_id}}. Your order has been successfully placed with IndiaFy and is being prepared with love.\n\n– Team IndiaFy",
  },
  {
    id: "ship",
    name: "Order Shipped",
    icon: Truck,
    message:
      "Good news {{customer_name}} 🎉\n\nYour IndiaFy package {{order_id}} has been dispatched with our express delivery partner.\n\n– Team IndiaFy",
  },
  {
    id: "del",
    name: "Order Delivered",
    icon: CheckCircle,
    message:
      "Hi {{customer_name}},\n\nYour order {{order_id}} has been delivered successfully. We hope you cherish your new purchase ❤️\n\n– Team IndiaFy",
  },
  {
    id: "delay",
    name: "Order Delayed",
    icon: AlertTriangle,
    message:
      "Hi {{customer_name}},\n\nWe apologize! Your order {{order_id}} is running slightly behind schedule due to transit conditions. Our team is expediting it.\n\n– Team IndiaFy",
  },
  {
    id: "cancel",
    name: "Order Cancelled",
    icon: XCircle,
    message:
      "Hi {{customer_name}},\n\nYour IndiaFy order {{order_id}} has been cancelled. Any pre-authorized payment will be refunded within 3-5 business days.\n\n– Team IndiaFy",
  },
];

export default function WhatsAppAutomation() {
  const [enabled, setEnabled] = useState(true);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [activeTemplateName, setActiveTemplateName] = useState("Order Confirmation");

  const currentTemplate = templates.find((t) => t.name === activeTemplateName) || templates[0];

  const handleTemplateChange = (text) => {
    setTemplates((prev) =>
      prev.map((t) => (t.name === activeTemplateName ? { ...t, message: text } : t))
    );
  };

  const handleSaveTemplate = () => {
    toast.success(`Template "${activeTemplateName}" updated successfully!`);
  };

  const handleToggleAutomation = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      toast.success("WhatsApp Automation notifications enabled");
    } else {
      toast.warn("WhatsApp Automation paused");
    }
  };

  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen text-slate-900 dark:text-slate-100"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)",
      }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full"
        >
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              WhatsApp Automation Center
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
              Manage automatic event-triggered transactional messages for Indian marketplace customers.
            </p>
          </div>

          {/* Enable / Disable */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div>
              <h2 className="font-black text-base text-slate-900 dark:text-white">
                Live Messaging Gateway
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle all transactional WhatsApp webhook dispatches across IndiaFy storefront
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold ${enabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                {enabled ? "Active" : "Paused"}
              </span>
              <button
                type="button"
                onClick={handleToggleAutomation}
                className={`w-12 h-6 rounded-full p-1 transition cursor-pointer ${
                  enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transition transform ${
                    enabled ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Templates Selector */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <h2 className="font-black text-sm uppercase tracking-wider text-slate-400 mb-4">
                Message Templates
              </h2>

              <div className="space-y-2">
                {templates.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTemplateName === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setActiveTemplateName(t.name)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-[#2874F0] text-white shadow-md"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Editor */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 xl:col-span-2 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-sm uppercase tracking-wider text-slate-400">
                  Custom Template Editor: {activeTemplateName}
                </h2>
                <span className="text-[10px] font-bold text-slate-400">
                  Variables: &#123;&#123;customer_name&#125;&#125;, &#123;&#123;order_id&#125;&#125;
                </span>
              </div>

              <textarea
                rows={9}
                value={currentTemplate.message}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-medium resize-none bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0] leading-relaxed"
              />

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Sender: IndiaFy Official Verified Business Account
                </p>
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-2 bg-[#2874F0] hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition cursor-pointer"
                >
                  <Save size={14} />
                  Save Template
                </button>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="mt-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 overflow-x-auto shadow-sm">
            <h2 className="font-black text-sm uppercase tracking-wider text-slate-400 mb-4">
              Recent WhatsApp Delivery Logs
            </h2>

            <table className="w-full min-w-[500px] text-xs">
              <thead className="text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="text-left py-2 px-3 font-bold">Recipient Customer</th>
                  <th className="text-left py-2 px-3 font-bold">Trigger Template</th>
                  <th className="text-center py-2 px-3 font-bold">Delivery Status</th>
                  <th className="text-right py-2 px-3 font-bold">Dispatched At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">Rahul Sharma</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">Order Confirmation</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                      Delivered
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">Today 11:32 AM</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">Priya Verma</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">Order Shipped</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                      Delivered
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">Yesterday 04:15 PM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
