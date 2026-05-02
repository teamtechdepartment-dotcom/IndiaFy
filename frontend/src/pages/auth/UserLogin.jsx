import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

import { useCartStore } from "../../store/cartStore";

const UserLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginAuth = useAuthStore((state) => state.login);
  const addToCart = useCartStore((state) => state.addToCart);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/customer/auth/login", data);
      if (res.success && res.data) {
        loginAuth(res.data, res.data.accessToken);
        toast.success("Welcome back to Indiafy!");
        reset();

        // Check for pending purchase
        const pendingPurchase = localStorage.getItem("pending_purchase");
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect");

        if (pendingPurchase && redirect === "checkout") {
          const { productId, quantity, product } = JSON.parse(pendingPurchase);
          localStorage.removeItem("pending_purchase");
          
          try {
            await addToCart(productId, quantity);
            navigate("/checkout", { state: { testProduct: product } });
          } catch (err) {
            navigate("/checkout", { state: { testProduct: product } });
          }
        } else {
          navigate("/");
        }
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] p-4 sm:p-8 selection:bg-indigo-100 font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="relative w-full max-w-[850px] bg-white rounded-[2.5rem] shadow-[0_32px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex min-h-[520px]">
        {/* --- LOGIN SECTION --- */}
        <div className="form-side w-full lg:w-[55%] p-10 sm:p-14 flex flex-col justify-center">
          <div className="w-full space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                Please enter your details to login to Indiafy.
              </p>
            </div>

            <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={18}
                  />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-wider">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={18}
                  />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-2xl py-3.5 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-bold pl-1 uppercase tracking-wider">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-slate-900 text-white rounded-2xl py-4 font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Sign In{" "}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs font-medium text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-indigo-600 font-bold hover:underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* --- DESIGN PANEL --- */}
        <div className="hidden lg:flex black-panel w-[45%] bg-[#0f172a] flex-col justify-center p-12 overflow-hidden shadow-2xl relative">
          {/* Animated Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-20 space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Revisit your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                journey.
              </span>
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]">
              Access your orders, wishlist, and lightning-fast local deliveries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
