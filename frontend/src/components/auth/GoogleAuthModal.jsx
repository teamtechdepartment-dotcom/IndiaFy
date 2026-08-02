import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";

/**
 * GoogleAuthModal — Real Google OAuth using Google Identity Services (GSI)
 * 
 * Loads the official Google GSI script dynamically.
 * Renders Google's real Sign-In button inside a clean modal.
 * Decodes the JWT credential to extract user info (email, name, picture, sub).
 * Passes the real Google user data to onSelectAccount.
 * 
 * Requires VITE_GOOGLE_CLIENT_ID in frontend .env
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Decode a JWT payload without external libraries
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (_e) {
    return null;
  }
};

// Load the Google GSI script once
let gsiScriptLoaded = false;
let gsiScriptLoading = false;
const gsiLoadCallbacks = [];

const loadGsiScript = () => {
  return new Promise((resolve, reject) => {
    if (gsiScriptLoaded && window.google?.accounts?.id) {
      resolve();
      return;
    }

    gsiLoadCallbacks.push({ resolve, reject });

    if (gsiScriptLoading) return; // Already loading, just wait for callbacks
    gsiScriptLoading = true;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gsiScriptLoaded = true;
      gsiScriptLoading = false;
      gsiLoadCallbacks.forEach((cb) => cb.resolve());
      gsiLoadCallbacks.length = 0;
    };
    script.onerror = () => {
      gsiScriptLoading = false;
      const err = new Error("Failed to load Google Identity Services script");
      gsiLoadCallbacks.forEach((cb) => cb.reject(err));
      gsiLoadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
};

const GoogleAuthModal = ({ isOpen, onClose, onSelectAccount, role = "customer", loading = false }) => {
  const [gsiReady, setGsiReady] = useState(false);
  const [gsiError, setGsiError] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const buttonContainerRef = useRef(null);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback((response) => {
    if (!response?.credential) {
      setGsiError("Google sign-in failed. Please try again.");
      return;
    }

    const payload = decodeJwtPayload(response.credential);
    if (!payload || !payload.email) {
      setGsiError("Could not decode Google credentials. Please try again.");
      return;
    }

    // Pass real Google user data to the parent component
    onSelectAccount({
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      picture: payload.picture || "",
      googleId: payload.sub, // Google's unique user ID
      credential: response.credential, // Raw JWT for backend verification if needed
    });
  }, [onSelectAccount]);

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      setGsiError("Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.");
      return;
    }

    setGsiError("");
    setIsInitializing(true);

    const initGsi = async () => {
      try {
        await loadGsiScript();
        setGsiReady(true);
        setIsInitializing(false);
      } catch (err) {
        setGsiError(err.message || "Failed to load Google authentication.");
        setIsInitializing(false);
      }
    };

    initGsi();
  }, [isOpen]);

  // Render the Google Sign-In button once GSI is ready and container is mounted
  useEffect(() => {
    if (!isOpen || !gsiReady || !buttonContainerRef.current || initializedRef.current || loading) return;
    if (!window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        ux_mode: "popup",
      });

      // Clear any previous button content
      buttonContainerRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: role === "seller" ? "signin_with" : "continue_with",
        shape: "rectangular",
        width: buttonContainerRef.current.offsetWidth || 352,
        logo_alignment: "left",
      });

      initializedRef.current = true;
    } catch (err) {
      console.error("Google GSI initialization error:", err);
      setGsiError("Failed to initialize Google Sign-In. Please refresh and try again.");
    }
  }, [isOpen, gsiReady, loading, handleCredentialResponse, role]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800"
        >
          {/* Header */}
          <div className="pt-8 px-8 pb-4 text-center relative">
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>

            <h3 className="font-medium text-[22px] leading-tight text-slate-900 tracking-tight">Sign in with Google</h3>
            <p className="text-[14px] text-slate-600 mt-1.5 font-normal">
              {role === "seller" 
                ? <>Continue to <span className="font-semibold text-brand-primary">IndiaFy Seller Partner</span></>
                : <>Continue to <span className="font-semibold text-brand-primary">IndiaFy</span></>
              }
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-2">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-9 h-9 text-[#4285F4] animate-spin" />
                <div>
                  <p className="font-semibold text-slate-800 text-base">Signing you in...</p>
                  <p className="text-xs text-slate-500 mt-1">Verifying credentials with Google</p>
                </div>
              </div>
            ) : gsiError ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Configuration Required</p>
                  <p className="text-xs text-slate-500 mt-2 max-w-[300px] leading-relaxed">{gsiError}</p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 py-2.5 px-6 rounded-full bg-slate-100 hover:bg-slate-200 font-semibold text-sm text-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : isInitializing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading Google Sign-In...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Google's official rendered button will appear here */}
                <div className="flex items-center justify-center min-h-[48px]">
                  <div ref={buttonContainerRef} className="w-full flex items-center justify-center" />
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Click the button above to sign in with your Google account
                </p>
              </div>
            )}

            {/* Privacy Disclaimer Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed text-center">
              To continue, Google will share your name, email address, and profile picture with IndiaFy. Before using this app, you can review IndiaFy's{" "}
              <a href="/privacy-policy" target="_blank" className="text-[#1a73e8] hover:underline">privacy policy</a> and{" "}
              <a href="/terms-and-conditions" target="_blank" className="text-[#1a73e8] hover:underline">terms of service</a>.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoogleAuthModal;
