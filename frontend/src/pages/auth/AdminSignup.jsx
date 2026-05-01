import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";


const AdminSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    secretKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/admin/signup",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          secretKey: formData.secretKey,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        navigate("/admin/login");
      } else {
        setError(res.data.message || "Signup failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    boxShadow: `
      6px 6px 14px rgba(160,160,160,0.9),
      -6px -6px 14px rgba(255,255,255,1),
      inset 2px 2px 4px rgba(160,160,160,0.6),
      inset -2px -2px 4px rgba(255,255,255,0.9)
    `,
  };

  const EyeIcon = ({ open }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.386-4.02M6.53 6.53A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.966 9.966 0 01-4.077 5.198M15 12a3 3 0 00-3-3m0 0a3 3 0 00-2.121.879M3 3l18 18" />
        </>
      )}
    </svg>
  );

  const KeyIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] px-4 sm:px-6 py-10 overflow-y-auto">
          <div
            className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl px-6 sm:px-8 py-8 sm:py-10 my-auto"
            style={{ boxShadow: "0 16px 40px rgb(128, 128, 128)" }}
          >
            <h2 className="text-2xl font-semibold text-black">Create Admin Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details to register
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSignup}>

              {/* NAME */}
              <div>
                <label className="text-xs font-medium tracking-wide text-gray-600">
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Akhil Jha"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm bg-[#ECEFF4] focus:outline-none mt-1"
                  style={inputStyle}
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-xs font-medium tracking-wide text-gray-600">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. admin@indiafy.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl text-sm bg-[#ECEFF4] focus:outline-none mt-1"
                  style={inputStyle}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-xs font-medium tracking-wide text-gray-600">
                  PASSWORD
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-10 rounded-2xl text-sm bg-[#ECEFF4] focus:outline-none"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

             

              {/* SECRET KEY */}
              <div>
                <label className="text-xs font-medium tracking-wide text-gray-600 flex items-center gap-1">
                  <KeyIcon />
                  ADMIN SECRET KEY
                </label>
                <p className="text-xs text-gray-400 mt-0.5 mb-1">
                  Required to verify admin privileges
                </p>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    name="secretKey"
                    placeholder="Enter secret key"
                    value={formData.secretKey}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-10 rounded-2xl text-sm bg-[#ECEFF4] focus:outline-none border border-gray-200"
                    style={{
                      boxShadow: `
                        6px 6px 14px rgba(160,160,160,0.9),
                        -6px -6px 14px rgba(255,255,255,1),
                        inset 2px 2px 4px rgba(160,160,160,0.6),
                        inset -2px -2px 4px rgba(255,255,255,0.9)
                      `,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                  >
                    <EyeIcon open={showSecret} />
                  </button>
                </div>
              </div>

              {/* SIGNUP BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-black text-white py-3 rounded-3xl text-sm font-medium hover:opacity-90 transition active:scale-95 disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "CREATE ACCOUNT"}
              </button>
            </form>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="mt-4 text-xs text-center text-red-500">
                {error}
              </p>
            )}

            {/* LOGIN LINK */}
            <p className="mt-4 text-xs text-center text-gray-600">
              Already have an admin account?{" "}
              <Link
                to="/admin/login"
                className="text-black font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>

          </div>
      </div>
    </>
  );
};

export default AdminSignup;