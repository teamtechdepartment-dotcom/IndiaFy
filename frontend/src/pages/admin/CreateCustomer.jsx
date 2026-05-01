import Sidebar from "../../components/admin/Sidebar";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/* ================== SEGMENT COLORS ================== */
const SEGMENT_COLORS = {
  New: "#facc15",
  Loyal: "#3b82f6",
  "High Value": "#22c55e",
  "At Risk": "#ef4444",
};

export default function CreateCustomer() {
  const [active, setActive] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);

  const [avatar, setAvatar] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [orders, setOrders] = useState(0);
  const avgOrderValue = 2800;

  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image")) return;
    setAvatar(URL.createObjectURL(file));
  };

  const getSegment = () => {
    if (!active) return "At Risk";
    if (orders >= 5) return "High Value";
    if (orders >= 1) return "Loyal";
    return "New";
  };

  const segment = getSegment();
  const lifetimeValue = orders * avgOrderValue;

  const chartData = [{ name: segment, value: 100 }];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#fafafa]">
      <Sidebar />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center">
          Add Customer
        </h1>

        <div className="max-w-[950px] mx-auto bg-white rounded-3xl border overflow-hidden">
          {/* ================= HEADER ================= */}
          <section className="p-4 sm:p-6 border-b flex flex-col sm:flex-row gap-6 items-center">
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer
                ${dragging ? "border-black bg-gray-100" : "border-gray-300"}
              `}
            >
              <input
                ref={fileRef}
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {avatar ? (
                <img
                  src={avatar}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UploadCloud className="text-gray-400" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-semibold">
                Customer Profile
              </h2>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mt-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${SEGMENT_COLORS[segment]}22`,
                    color: SEGMENT_COLORS[segment],
                  }}
                >
                  {segment}
                </span>

                <span className="text-sm text-gray-500">
                  Lifetime Value: ₹{lifetimeValue.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-24 h-24 sm:w-28 sm:h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={30}
                    outerRadius={45}
                    dataKey="value"
                  >
                    <Cell fill={SEGMENT_COLORS[segment]} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ================= BASIC INFO ================= */}
          <Section title="Basic Information">
            <Input placeholder="Full Name" />
            <Input placeholder="Email Address" />
            <Input placeholder="Phone Number" />
          </Section>

          {/* ================= ANALYTICS INPUT ================= */}
          <Section title="Customer Analytics">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Total Orders
              </label>
              <input
                type="number"
                value={orders}
                onChange={(e) => setOrders(Number(e.target.value))}
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Info label="Segment" value={segment} />
              <Info
                label="Lifetime Value"
                value={`₹${lifetimeValue.toLocaleString()}`}
              />
            </div>
          </Section>

          {/* ================= ACCOUNT ================= */}
          <Section title="Account Settings">
            <Toggle
              label="Active Status"
              desc="Allow customer to login"
              enabled={active}
              setEnabled={setActive}
            />
            <Toggle
              label="WhatsApp Notifications"
              desc="Send order updates on WhatsApp"
              enabled={whatsapp}
              setEnabled={setWhatsapp}
            />
          </Section>

          {/* ================= ACTIONS ================= */}
          <div className="p-4 sm:p-6 bg-gray-50 space-y-3">
            <button className="w-full bg-black text-white py-3 rounded-xl font-semibold">
              Save Customer
            </button>
            <button className="w-full border border-black py-3 rounded-xl font-semibold hover:bg-black hover:text-white transition">
              Save & Create Order
            </button>
            <button className="w-full text-sm text-gray-500 hover:text-red-500">
              Cancel
            </button>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Section({ title, children }) {
  return (
    <section className="p-4 sm:p-6 border-b">
      <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
    />
  );
}

function Info({ label, value }) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold mt-1">{value}</p>
    </div>
  );
}

function Toggle({ label, desc, enabled, setEnabled }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-12 h-6 rounded-full p-1 transition ${
          enabled ? "bg-black" : "bg-gray-300"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full transition ${
            enabled ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}
