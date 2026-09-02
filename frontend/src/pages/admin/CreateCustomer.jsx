import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { motion } from "framer-motion";
import { UploadCloud, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

/* ================== SEGMENT COLORS ================== */
const SEGMENT_COLORS = {
  New: "#facc15",
  Loyal: "#3b82f6",
  "High Value": "#22c55e",
  "At Risk": "#ef4444",
};

export default function CreateCustomer() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("Indiafy@2026");

  const [active, setActive] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSaveCustomer = async (redirectOrder = false) => {
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/admin/management/customers", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim() || "Customer@123",
        isBlocked: !active,
      });

      toast.success("Customer created successfully");
      if (redirectOrder) {
        navigate(`/admin/orders/create?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else {
        navigate("/admin/customers");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to create customer";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
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
          className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8"
        >
          <div className="max-w-[950px] mx-auto mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate("/admin/customers")}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Directory
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Create New Customer Profile
            </h1>
          </div>

          {error && (
            <div className="max-w-[950px] mx-auto mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="max-w-[950px] mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* ================= HEADER ================= */}
            <section className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-6 items-center">
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
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition ${
                  dragging
                    ? "border-[#2874F0] bg-blue-50/50"
                    : "border-slate-300 dark:border-slate-700 hover:border-[#2874F0]"
                }`}
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
                    loading="lazy"
                    decoding="async"
                    src={avatar}
                    alt="Customer Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UploadCloud className="text-slate-400" size={24} />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Customer Profile Insights
                </h2>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mt-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: `${SEGMENT_COLORS[segment]}22`,
                      color: SEGMENT_COLORS[segment],
                    }}
                  >
                    {segment} Segment
                  </span>

                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Est. Lifetime Value: ₹{lifetimeValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={26}
                      outerRadius={38}
                      dataKey="value"
                    >
                      <Cell fill={SEGMENT_COLORS[segment]} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* ================= BASIC INFO ================= */}
            <Section title="Customer Credentials & Identity">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">First Name *</label>
                  <Input
                    placeholder="e.g. Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Last Name</label>
                  <Input
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Contact Phone</label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Initial Temporary Password</label>
                <Input
                  type="text"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </Section>

            {/* ================= ANALYTICS INPUT ================= */}
            <Section title="Historical Context (Optional)">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
                  Prior External Purchases Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={orders}
                  onChange={(e) => setOrders(Number(e.target.value))}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-[#2874F0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-3">
                <Info label="Customer Classification" value={segment} />
                <Info
                  label="Calculated Initial LTV"
                  value={`₹${lifetimeValue.toLocaleString()}`}
                />
              </div>
            </Section>

            {/* ================= ACCOUNT ================= */}
            <Section title="Security & Notifications Policy">
              <Toggle
                label="Account Status Active"
                desc="Allow customer login and checkout privileges"
                enabled={active}
                setEnabled={setActive}
              />
              <Toggle
                label="WhatsApp Automation Alerts"
                desc="Send transactional tracking notifications via WhatsApp"
                enabled={whatsapp}
                setEnabled={setWhatsapp}
              />
            </Section>

            {/* ================= ACTIONS ================= */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <button
                disabled={loading}
                onClick={() => handleSaveCustomer(false)}
                className="w-full bg-[#2874F0] hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
              >
                {loading ? "Registering Customer..." : "Save Customer"}
              </button>
              <button
                disabled={loading}
                onClick={() => handleSaveCustomer(true)}
                className="w-full border border-slate-300 dark:border-slate-700 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                Save & Create First Order
              </button>
              <button
                disabled={loading}
                onClick={() => navigate("/admin/customers")}
                className="w-full text-xs font-bold text-slate-400 hover:text-red-500 py-1 cursor-pointer transition"
              >
                Cancel and Return
              </button>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Section({ title, children }) {
  return (
    <section className="p-6 border-b border-slate-200 dark:border-slate-800">
      <h3 className="text-[11px] font-black tracking-widest text-slate-400 uppercase mb-4">
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
      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-[#2874F0] outline-none transition"
    />
  );
}

function Info({ label, value }) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/40">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

function Toggle({ label, desc, enabled, setEnabled }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <div>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-400">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`w-12 h-6 rounded-full p-1 transition cursor-pointer ${
          enabled ? "bg-[#2874F0]" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full transition transform ${
            enabled ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}
