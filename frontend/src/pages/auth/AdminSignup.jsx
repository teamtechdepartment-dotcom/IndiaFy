import React, { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Key,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { adminSignupSchema, sanitizeEmail, mapBackendError } from "../../lib/signupSchemas";
import PasswordStrength from "../../components/ui/PasswordStrength";
import axiosInstance from "../../utils/axiosInstance";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Submit guard ─────────────────────────────────────────────────
  const isSubmittingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(adminSignupSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const passwordValue = watch("password", "");

  const handleSignup = useCallback(async (data) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      // Backend expects: firstName, email, password, securityKey, position
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

      const res = await axiosInstance.post(
        "/admin/auth/signup",
        {
          firstName,
          lastName,
          email: sanitizeEmail(data.email),
          password: data.password,
          securityKey: data.secretKey,
          position: "admin",
        },
        {
          signal: abortControllerRef.current.signal,
          withCredentials: true,
        }
      );

      if (res?.success) {
        toast.success("Admin account created! Please sign in.", {
          id: "auth-success",
          duration: 3000,
        });
        navigate("/admin/login");
      } else {
        toast.error(res?.message || "Signup failed. Please try again.", {
          id: "auth-error",
        });
      }
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

      if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
        toast.error("No internet connection. Please check your network.", {
          id: "auth-error",
        });
        return;
      }

      const status = err?.response?.status;
      if (status === 409) {
        setError("email", {
          type: "server",
          message: err?.response?.data?.message || "An account with this email already exists.",
        });
        return;
      }

      if (status === 401 || (status === 403 && err?.response?.data?.message?.toLowerCase().includes("key"))) {
        setError("secretKey", {
          type: "server",
          message: err?.response?.data?.message || "Invalid admin secret key.",
        });
        return;
      }

      if (status === 429) {
        toast.error("Too many attempts. Please wait and try again.", {
          id: "auth-error",
        });
        return;
      }

      mapBackendError(
        err,
        setError,
        (message) => toast.error(message, { id: "auth-error" })
      );

      if (process.env.NODE_ENV !== "production") {
        console.error("[AdminSignup] signup error:", err);
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [navigate, setError]);

  // ── Field renderer ───────────────────────────────────────────────
  const renderField = ({ name, label, type = "text", placeholder, autoComplete, icon: Icon, showToggle, isVisible, onToggle, hint }) => {
    const hasError = !!errors[name];
    const errorId = `admin-${name}-error`;
    const inputId = `admin-signup-${name}`;

    return (
      <div key={name}>
        <label htmlFor={inputId} className="text-xs font-medium tracking-wide text-gray-600 flex items-center gap-1">
          {Icon && <Icon size={13} className="text-gray-400" aria-hidden="true" />}
          {label.toUpperCase()}
        </label>
        {hint && <p className="text-xs text-gray-400 mt-0.5 mb-1">{hint}</p>}
        <div className="relative mt-1">
          <input
            id={inputId}
            type={showToggle ? (isVisible ? "text" : "password") : type}
            {...register(name)}
            disabled={loading}
            autoComplete={autoComplete}
            placeholder={placeholder}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            aria-required="true"
            className={`w-full px-4 py-3 ${showToggle ? "pr-10" : ""} rounded-2xl text-sm bg-[#ECEFF4] focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed
              ${hasError
                ? "ring-2 ring-red-400 bg-red-50"
                : "focus:ring-emerald-400/60"
              }`}
            style={!hasError ? {
              boxShadow: `6px 6px 14px rgba(160,160,160,0.9), -6px -6px 14px rgba(255,255,255,1), inset 2px 2px 4px rgba(160,160,160,0.6), inset -2px -2px 4px rgba(255,255,255,0.9)`,
            } : {}}
          />
          {showToggle && (
            <button
              type="button"
              onClick={onToggle}
              disabled={loading}
              aria-label={isVisible ? "Hide" : "Show"}
              className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 rounded"
            >
              {isVisible ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
            </button>
          )}
        </div>
        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs text-red-500 font-semibold flex items-center gap-1"
          >
            <AlertCircle size={11} aria-hidden="true" />
            {errors[name]?.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] px-4 sm:px-6 py-10 overflow-y-auto">
      <div
        className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl px-6 sm:px-8 py-8 sm:py-10 my-auto"
        style={{ boxShadow: "0 16px 40px rgb(128, 128, 128)" }}
      >
        <h1 className="text-2xl font-semibold text-black">Create Admin Account</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to register</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(handleSignup)} noValidate aria-label="Admin signup form">

          {renderField({
            name: "name",
            label: "Full Name",
            placeholder: "e.g. Akhil Jha",
            autoComplete: "name",
          })}

          {renderField({
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "e.g. admin@indiafy.com",
            autoComplete: "email",
          })}

          <div>
            {renderField({
              name: "password",
              label: "Password",
              type: "password",
              placeholder: "••••••••",
              autoComplete: "new-password",
              showToggle: true,
              isVisible: showPassword,
              onToggle: () => setShowPassword((p) => !p),
            })}
            <PasswordStrength password={passwordValue} className="mt-1 px-1" />
          </div>

          {renderField({
            name: "secretKey",
            label: "Admin Secret Key",
            icon: Key,
            type: "password",
            placeholder: "Enter secret key",
            autoComplete: "off",
            showToggle: true,
            isVisible: showSecret,
            onToggle: () => setShowSecret((p) => !p),
            hint: "Required to verify admin privileges",
          })}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-label={loading ? "Creating account, please wait" : "Create admin account"}
            className="w-full mt-2 bg-black text-white py-3 rounded-3xl text-sm font-medium hover:opacity-90 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Creating Account...
              </>
            ) : (
              "CREATE ACCOUNT"
            )}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-600">
          Already have an admin account?{" "}
          <Link to="/admin/login" className="text-black font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;