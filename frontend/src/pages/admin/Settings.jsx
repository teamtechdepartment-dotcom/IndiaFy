import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Save, User, Settings as SettingsIcon, CreditCard, Mail, ShieldCheck } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);

  // Form states matching backend schema
  const [brandName, setBrandName] = useState("Indiafy");
  const [logoUrl, setLogoUrl] = useState("/Images/logo.png");
  const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");
  
  const [contactEmail, setContactEmail] = useState("support@indiafy.com");
  const [contactPhone, setContactPhone] = useState("+91 80 4719 1000");

  const [razorpayActive, setRazorpayActive] = useState(true);
  const [stripeActive, setStripeActive] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState("");
  const [razorpaySecret, setRazorpaySecret] = useState("");

  const [smtpHost, setSmtpHost] = useState("smtp.brevo.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");

  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelist, setIpWhitelist] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/settings");
      const data = res.data || res;
      if (data) {
        setBrandName(data.brandName || "Indiafy");
        setLogoUrl(data.logoUrl || "/Images/logo.png");
        setFaviconUrl(data.faviconUrl || "/favicon.ico");
        setContactEmail(data.contactDetails?.email || "support@indiafy.com");
        setContactPhone(data.contactDetails?.phone || "+91 80 4719 1000");
        setRazorpayActive(data.payments?.razorpayActive !== false);
        setStripeActive(data.payments?.stripeActive || false);
        setRazorpayKey(data.payments?.razorpayKey || "");
        setRazorpaySecret(data.payments?.razorpaySecret || "");
        setSmtpHost(data.email?.smtpHost || "smtp.brevo.com");
        setSmtpPort(data.email?.smtpPort || 587);
        setSmtpUser(data.email?.smtpUser || "");
        setSmtpPass(data.email?.smtpPass || "");
        setSessionTimeout(data.security?.sessionTimeoutMinutes || 30);
        setIpWhitelist(data.security?.ipWhitelist?.join(", ") || "");
      }
    } catch (_err) {
      toast.error("Failed to load global settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const whitelistArray = ipWhitelist.split(",").map(ip => ip.trim()).filter(Boolean);
      await axiosInstance.put("/admin/management/settings", {
        brandName,
        logoUrl,
        faviconUrl,
        contactDetails: {
          email: contactEmail,
          phone: contactPhone
        },
        payments: {
          razorpayActive,
          stripeActive,
          razorpayKey,
          razorpaySecret
        },
        email: {
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPass
        },
        security: {
          sessionTimeoutMinutes: parseInt(sessionTimeout),
          ipWhitelist: whitelistArray
        }
      });
      toast.success("System configurations saved successfully!");
      fetchSettings();
    } catch (_err) {
      toast.error("Failed to save settings");
    }
  };

  const tabs = [
    { id: "general", label: "General Brand", icon: SettingsIcon },
    { id: "payments", label: "Payment Gateways", icon: CreditCard },
    { id: "email", label: "Outbound SMTP", icon: Mail },
    { id: "security", label: "Security Policies", icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-[#0B1528] tracking-tight">System Settings</h1>
              <p className="text-sm text-gray-500 font-medium">Configure outbound mailers, transaction hooks, API tokens, and access whitelists.</p>
            </div>

            {/* Main Tabs Container */}
            <div className="bg-white border rounded-[2rem] shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
              
              {/* Left Tabs selectors */}
              <div className="md:w-64 border-r bg-slate-50/50 p-4 flex flex-col gap-1 shrink-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition text-left ${
                        activeTab === tab.id
                          ? "bg-[#0B1528] text-[#D4AF37] border border-[#D4AF37]/20 shadow-md"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Form settings container */}
              <div className="flex-1 p-6 sm:p-8">
                {loading ? (
                  <p className="text-center text-slate-400 font-semibold py-10">Loading settings configs...</p>
                ) : (
                  <form onSubmit={handleSave} className="space-y-6 text-xs font-semibold text-slate-700">
                    
                    {/* General Settings */}
                    {activeTab === "general" && (
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-[#0B1528] text-base mb-4">Branding & Assets</h3>
                        
                        <div>
                          <label className="block text-gray-400 mb-1">Company / Brand Name</label>
                          <input 
                            type="text" 
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white focus:border-[#D4AF37]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-400 mb-1">Logo image link</label>
                            <input 
                              type="text" 
                              value={logoUrl}
                              onChange={(e) => setLogoUrl(e.target.value)}
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">Favicon tag icon</label>
                            <input 
                              type="text" 
                              value={faviconUrl}
                              onChange={(e) => setFaviconUrl(e.target.value)}
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-400 mb-1">Help Desk Email</label>
                            <input 
                              type="email" 
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">Customer Care Contact</label>
                            <input 
                              type="text" 
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payments Toggles */}
                    {activeTab === "payments" && (
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-[#0B1528] text-base mb-4">Settlements Integrations</h3>
                        
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={razorpayActive}
                              onChange={(e) => setRazorpayActive(e.target.checked)}
                              className="w-4 h-4 accent-[#0B1528]"
                            />
                            <div>
                              <p className="font-bold text-slate-900">Razorpay payment Gateway</p>
                              <p className="text-[10px] text-gray-400 font-medium">Activate UPI and Indian card settlements.</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={stripeActive}
                              onChange={(e) => setStripeActive(e.target.checked)}
                              className="w-4 h-4 accent-[#0B1528]"
                            />
                            <div>
                              <p className="font-bold text-slate-900">Stripe Global (Fallback Mode)</p>
                              <p className="text-[10px] text-gray-400 font-medium">Activate international card processing.</p>
                            </div>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-400 mb-1">Razorpay Key ID</label>
                            <input 
                              type="text" 
                              value={razorpayKey}
                              onChange={(e) => setRazorpayKey(e.target.value)}
                              placeholder="rzp_test_..."
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">Razorpay Secret</label>
                            <input 
                              type="password" 
                              value={razorpaySecret}
                              onChange={(e) => setRazorpaySecret(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email SMTP Outbound settings */}
                    {activeTab === "email" && (
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-[#0B1528] text-base mb-4">Outbound Transactional SMTP</h3>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <label className="block text-gray-400 mb-1">SMTP Host Server</label>
                            <input 
                              type="text" 
                              value={smtpHost}
                              onChange={(e) => setSmtpHost(e.target.value)}
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div className="col-span-1">
                            <label className="block text-gray-400 mb-1">Port</label>
                            <input 
                              type="number" 
                              value={smtpPort}
                              onChange={(e) => setSmtpPort(e.target.value)}
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-400 mb-1">SMTP Username</label>
                            <input 
                              type="text" 
                              value={smtpUser}
                              onChange={(e) => setSmtpUser(e.target.value)}
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">SMTP Password</label>
                            <input 
                              type="password" 
                              value={smtpPass}
                              onChange={(e) => setSmtpPass(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security policy Settings */}
                    {activeTab === "security" && (
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-[#0B1528] text-base mb-4">Platform Security Schemes</h3>
                        
                        <div>
                          <label className="block text-gray-400 mb-1">Session Inactive Timeout (minutes)</label>
                          <input 
                            type="number" 
                            value={sessionTimeout}
                            onChange={(e) => setSessionTimeout(e.target.value)}
                            className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-1">Allowed Admin IP Whitelist (comma separated)</label>
                          <textarea 
                            value={ipWhitelist}
                            onChange={(e) => setIpWhitelist(e.target.value)}
                            rows="3"
                            placeholder="e.g. 192.168.1.1, 103.45.18.2"
                            className="w-full bg-slate-50 border rounded-xl p-3.5 outline-none font-medium text-slate-900 focus:bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Save button */}
                    <div className="border-t border-slate-100 pt-5 flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-[#0B1528] text-white hover:bg-black font-bold text-xs rounded-xl py-3.5 px-6 border border-[#D4AF37]/20 transition shadow-md active:scale-95"
                      >
                        <Save size={16} className="text-[#D4AF37]" /> Save Config
                      </button>
                    </div>

                  </form>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
