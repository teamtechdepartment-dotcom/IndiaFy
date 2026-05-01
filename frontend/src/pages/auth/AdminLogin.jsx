import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../utils/axiosInstance";

const AdminLogin = () => {
  const navigate = useNavigate();
  const loginAuth = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/admin/login", { email, password });

      // axiosInstance unwraps res.data or returns the object
      const data = res.data || res;
      
      if (data) {
        // Normalize role for ProtectedRoute
        const userData = { ...data, role: "admin" };
        loginAuth(userData, null); // userCookies handles token
        navigate("/admin/dashboard");
      } else {
        setError("Login failed: Invalid response");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Server error. Please try again."
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] px-4 sm:px-6 py-10">
      <div
        className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl px-6 sm:px-8 py-8 sm:py-10"
        style={{ boxShadow: "0 16px 40px rgb(128, 128, 128)" }}
      >
        <h2 className="text-2xl font-semibold text-black">Admin Login</h2>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>

          {/* EMAIL */}
          <div>
            <label className="text-xs font-medium tracking-wide text-gray-600">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="e.g. admin@indiafy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-black text-white py-3 rounded-3xl text-sm font-medium hover:opacity-90 transition active:scale-95 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        {/* ERROR MESSAGE */}
        {error && (
          <p className="mt-4 text-xs text-center text-red-500">{error}</p>
        )}

        {/* ADMIN SIGNUP LINK */}
        {/* <p className="mt-4 text-xs text-center text-gray-600">
          Don't have an admin account?{" "}
          <Link
            to="/admin/signup"
            className="text-black font-semibold hover:underline"
          >
            Create Admin Account
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default AdminLogin;