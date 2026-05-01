import Sidebar from "../../components/admin/Sidebar";
import { motion } from "framer-motion";

export default function Settings() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-[1200px] mx-auto w-full"
      >
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
            Settings / Profile
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
            Account Settings
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl text-sm sm:text-base">
            Personalize your professional identity and manage your account
            preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Identity */}
            <div className="bg-white border rounded-2xl p-4 sm:p-6">
              <h2 className="font-bold text-gray-900 mb-6">Identity</h2>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <img
                  src="https://res.cloudinary.com/dttjgnypq/image/upload/v1770481020/Aamir_Passport_Picture_llwlzj.jpg"
                  alt="avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border"
                />

                <div>
                  <p className="font-medium text-gray-800">Profile Photo</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Recommended 800×800 JPG or PNG
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Change Avatar
                    </button>
                    <button className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white border rounded-2xl p-4 sm:p-6">
              <h2 className="font-bold text-gray-900 mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Full Name" defaultValue="Aamir Farid" />
                <Input
                  label="Email Address"
                  defaultValue="aamir@graphura.com"
                />
                <Input label="Phone Number" defaultValue="+91 98765 43210" />
                <Input label="Job Title" defaultValue="Product Admin" />
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white border rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Professional Bio</h2>
                <span className="text-xs text-gray-400">0 / 500</span>
              </div>

              <textarea
                rows="5"
                placeholder="Write a short professional bio..."
                className="w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6 lg:space-y-8">
            {/* Preferences */}
            <div className="bg-white border rounded-2xl p-4 sm:p-6">
              <h2 className="font-bold text-gray-900 mb-4">Preferences</h2>

              <label className="flex items-center gap-3 mb-4 text-sm">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 accent-blue-600"
                />
                Email Notifications
              </label>

              <label className="flex items-center gap-3 text-sm text-gray-400">
                <input type="checkbox" disabled className="w-4 h-4" />
                Dark Mode (coming soon)
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-gray-50">
                Discard
              </button>
              <button className="flex-1 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>

            <p className="text-xs text-gray-400 text-right">
              Last updated: Feb 01, 2026 at 12:15 PM
            </p>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

/* ===== Reusable Input ===== */
function Input({ label, defaultValue }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <input
        defaultValue={defaultValue}
        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}
