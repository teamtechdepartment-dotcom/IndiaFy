/**
 * signupSchemas.js
 * ─────────────────────────────────────────────────────────────
 * Shared, production-grade Zod validation schemas for all
 * signup flows.  Frontend complexity rules are intentionally
 * kept in sync with the backend regex so validation never
 * silently disagrees across the stack.
 *
 * Backend regex (customers + sellers):
 *   /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
 *
 * Special characters accepted by backend: @  $  !  %  *  ?  &
 * ─────────────────────────────────────────────────────────────
 */

import * as z from "zod";

/* ── Shared helpers ─────────────────────────────────────────── */

/** Letters-only regex (Unicode-aware, allows accents) */
const LETTERS_ONLY = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;

/** Backend-compatible special-character set */
const SPECIAL_CHARS = /[@$!%*?&]/;

/** Full RFC-5322-ish email (react-hook-form + zod handles most edge cases) */
const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.")
  .max(254, "Email address is too long.")
  .transform((v) => v.toLowerCase());

/** Password with full complexity rules */
const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .min(8, "Password must be at least 8 characters.")
  .max(64, "Password must be 64 characters or fewer.")
  .refine((v) => /[A-Z]/.test(v), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((v) => /[a-z]/.test(v), {
    message: "Password must contain at least one lowercase letter.",
  })
  .refine((v) => /\d/.test(v), {
    message: "Password must contain at least one number.",
  })
  .refine((v) => SPECIAL_CHARS.test(v), {
    message: "Password must contain at least one special character (@$!%*?&).",
  });

/* ── User (Customer) Signup Schema ──────────────────────────── */

export const userSignupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .min(2, "First name must be at least 2 characters.")
      .max(50, "First name must be 50 characters or fewer.")
      .refine((v) => LETTERS_ONLY.test(v), {
        message: "First name can only contain letters.",
      }),

    lastName: z
      .string()
      .trim()
      .max(50, "Last name must be 50 characters or fewer.")
      .refine((v) => v === "" || LETTERS_ONLY.test(v), {
        message: "Last name can only contain letters.",
      })
      .optional()
      .or(z.literal("")),

    email: emailSchema,
    password: passwordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/* ── Seller Signup Schema ────────────────────────────────────── */

export const sellerSignupSchema = z
  .object({
    ownerName: z
      .string()
      .trim()
      .min(1, "Full name is required.")
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must be 100 characters or fewer.")
      .refine((v) => LETTERS_ONLY.test(v), {
        message: "Full name can only contain letters.",
      }),

    email: emailSchema,
    password: passwordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/* ── Admin Signup Schema ─────────────────────────────────────── */

export const adminSignupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Full name is required.")
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name must be 100 characters or fewer."),

    email: emailSchema,

    password: passwordSchema,

    secretKey: z
      .string()
      .min(1, "Admin secret key is required."),
  });

/* ── Utility: sanitize plain text input (strip XSS) ─────────── */

export const sanitizeText = (value) => {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/* ── Utility: sanitize email ─────────────────────────────────── */

export const sanitizeEmail = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toLowerCase();
};

/* ── Utility: map backend field error → react-hook-form ──────── */

/**
 * Parses a backend error response and calls setError() for the
 * matching field so the error appears inline under the input.
 *
 * Backend response shape:
 *   { statusCode, field?, message, success }
 *
 * @param {object} axiosError  - The error thrown by axiosInstance
 * @param {function} setError  - react-hook-form's setError()
 * @param {function} fallback  - Called with a string message when no field is matched
 */
export const mapBackendError = (axiosError, setError, fallback) => {
  const data = axiosError?.response?.data;
  const message =
    data?.message ||
    axiosError?.message ||
    "Something went wrong. Please try again.";

  // Structured field error from backend
  if (data?.field && setError) {
    setError(data.field, { type: "server", message });
    return;
  }

  // Attempt to infer field from message keywords
  if (setError) {
    const lower = message.toLowerCase();
    if (lower.includes("email") && lower.includes("exist")) {
      setError("email", { type: "server", message });
      return;
    }
    if (lower.includes("password")) {
      setError("password", { type: "server", message });
      return;
    }
    if (lower.includes("first name") || lower.includes("firstname")) {
      setError("firstName", { type: "server", message });
      return;
    }
  }

  // No field match — use fallback (toast)
  if (fallback) fallback(message);
};
