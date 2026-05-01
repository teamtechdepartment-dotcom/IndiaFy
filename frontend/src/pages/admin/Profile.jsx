import { useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { User, Mail, Shield, Clock, Edit, Lock, LogOut } from "lucide-react";

export default function AdminProfile() {
  const [edit, setEdit] = useState(false);

  const admin = {
    name: "Aamir Farid",
    role: "Product Admin",
    email: "admin@graphura.com",
    phone: "+91 98765 43210",
    status: "Active",
    lastLogin: "02 Feb 2026 • 12:40 AM",
    joined: "15 Jan 2025",
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
          {/* Page Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8">
            Admin Profile
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT – Profile Card */}
            <div className="lg:col-span-4 bg-white border rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black text-white flex items-center justify-center text-2xl sm:text-3xl font-bold">
                  A
                </div>

                <h2 className="mt-4 text-lg sm:text-xl font-semibold">
                  {admin.name}
                </h2>
                <p className="text-sm text-gray-500">{admin.role}</p>

                <span className="mt-3 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                  {admin.status}
                </span>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 break-all">
                  <Mail size={16} />
                  {admin.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  Joined {admin.joined}
                </div>
              </div>

              <button
                onClick={() => alert("Logged out")}
                className="mt-6 w-full flex items-center justify-center gap-2 py-2 border rounded-xl text-sm hover:bg-gray-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>

            {/* RIGHT – Details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Info */}
              <div className="bg-white border rounded-2xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base sm:text-lg">
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setEdit(!edit)}
                    className="flex items-center gap-1 text-sm text-blue-600"
                  >
                    <Edit size={14} />
                    {edit ? "Cancel" : "Edit"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500">Full Name</label>
                    <input
                      disabled={!edit}
                      defaultValue={admin.name}
                      className="w-full mt-1 border rounded-xl px-3 py-2 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="text-gray-500">Email</label>
                    <input
                      disabled
                      defaultValue={admin.email}
                      className="w-full mt-1 border rounded-xl px-3 py-2 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="text-gray-500">Phone</label>
                    <input
                      disabled={!edit}
                      defaultValue={admin.phone}
                      className="w-full mt-1 border rounded-xl px-3 py-2 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="text-gray-500">Role</label>
                    <input
                      disabled
                      defaultValue={admin.role}
                      className="w-full mt-1 border rounded-xl px-3 py-2 bg-gray-50"
                    />
                  </div>
                </div>

                {edit && (
                  <button className="mt-4 px-5 py-2 bg-black text-white rounded-xl text-sm hover:opacity-90">
                    Save Changes
                  </button>
                )}
              </div>

              {/* Security */}
              <div className="bg-white border rounded-2xl p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-4">
                  Security
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield size={16} />
                    Password & Authentication
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm hover:bg-gray-50">
                    <Lock size={16} />
                    Change Password
                  </button>
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white border rounded-2xl p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-2">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-500">
                  Last login: {admin.lastLogin}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
