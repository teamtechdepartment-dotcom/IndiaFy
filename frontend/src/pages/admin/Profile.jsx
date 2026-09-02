import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { User, Mail, Shield, Clock, Edit, Lock, LogOut, Check, Phone } from "lucide-react";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import { toast } from "react-toastify";

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user: adminUser, logout: logoutAdmin } = useAdminAuthStore();
  const [edit, setEdit] = useState(false);

  const [name, setName] = useState(
    adminUser ? `${adminUser.firstName || "Admin"} ${adminUser.lastName || ""}`.trim() : "Platform Administrator"
  );
  const [phone, setPhone] = useState("+91 98765 43210");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const email = adminUser?.email || "admin@indiafy.com";
  const role = adminUser?.role || "SUPER_ADMIN";
  const avatarInitial = (name[0] || "A").toUpperCase();

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out from the admin session?")) {
      await logoutAdmin();
      toast.success("Successfully logged out");
      navigate("/admin/login");
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setEdit(false);
    toast.success("Profile preferences updated successfully");
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

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
          {/* Page Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-slate-900 dark:text-white">
            Administrative Profile
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT – Profile Card */}
            <div className="lg:col-span-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#2874F0] to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg">
                  {avatarInitial}
                </div>

                <h2 className="mt-4 text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {name}
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-[#2874F0] dark:text-[#FB641B] mt-1">
                  {role}
                </p>

                <span className="mt-3 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                  Active Session
                </span>
              </div>

              <div className="mt-6 space-y-3.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 break-all">
                  <Mail size={15} className="shrink-0 text-slate-400" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                  <Phone size={15} className="shrink-0 text-slate-400" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                  <Clock size={15} className="shrink-0 text-slate-400" />
                  <span>Verified Administrator</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all cursor-pointer"
              >
                <LogOut size={15} />
                Terminate Session
              </button>
            </div>

            {/* RIGHT – Details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Info */}
              <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setEdit(!edit)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#2874F0] dark:text-[#FB641B] hover:underline cursor-pointer"
                  >
                    <Edit size={13} />
                    {edit ? "Cancel" : "Edit Details"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Full Name</label>
                    <input
                      disabled={!edit}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 disabled:opacity-75 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 outline-none focus:border-[#2874F0]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Email Address</label>
                    <input
                      disabled
                      value={email}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 disabled:cursor-not-allowed outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Phone Number</label>
                    <input
                      disabled={!edit}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 disabled:opacity-75 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 outline-none focus:border-[#2874F0]"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Administrative Role</label>
                    <input
                      disabled
                      value={role}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 disabled:cursor-not-allowed outline-none font-bold"
                    />
                  </div>
                </div>

                {edit && (
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={handleSaveChanges}
                      className="px-6 py-3 bg-gradient-to-r from-[#2874F0] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Security */}
              <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-black text-base sm:text-lg mb-4 text-slate-900 dark:text-white">
                  Security & Access Controls
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <Shield size={18} className="text-[#FB641B]" />
                    <span>Multi-factor Security & Master Passkey Protected</span>
                  </div>

                  <button
                    onClick={() => toast.info("To reset password, contact Super Admin or use the OTP reset flow.")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <Lock size={14} />
                    Change Password
                  </button>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-black text-base sm:text-lg mb-2 text-slate-900 dark:text-white">
                  Platform Session Metadata
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Authentication mode: JWT Bearer • ISO-27001 Certified • Admin privileges granted
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
