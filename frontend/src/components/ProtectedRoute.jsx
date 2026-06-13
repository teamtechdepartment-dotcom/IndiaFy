import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import { useSellerAuthStore } from "../store/sellerAuthStore";
import { useAdminAuthStore } from "../store/adminAuthStore";

/**
 * ProtectedRoute
 *
 * Handles three route categories:
 * 1. Seller-only routes        → allowedRoles=["seller"]
 * 2. Customer+Seller routes    → allowedRoles=["customer","seller"]
 * 3. Admin routes              → allowedRoles=["admin"]
 * 4. Customer-only routes      → allowedRoles=["customer"]
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const customerAuth = useAuthStore();
  const sellerAuth = useSellerAuthStore();
  const adminAuth = useAdminAuthStore();

  const isSellerAllowed = allowedRoles?.includes("seller");
  const isCustomerAllowed = allowedRoles?.includes("customer");
  const isAdminAllowed = allowedRoles?.includes("admin");

  useEffect(() => {
    const now = Date.now();
    if (sellerAuth.isAuthenticated && sellerAuth.expiresAt && now > sellerAuth.expiresAt) {
      sellerAuth.clearSession();
      toast.error("Your session has expired. Please login again.", { toastId: 'session-expired' });
    }
    if (customerAuth.isAuthenticated && customerAuth.expiresAt && now > customerAuth.expiresAt) {
      customerAuth.clearSession();
      toast.error("Your session has expired. Please login again.", { toastId: 'session-expired' });
    }
    if (adminAuth.isAuthenticated && adminAuth.expiresAt && now > adminAuth.expiresAt) {
      adminAuth.clearSession();
      toast.error("Your session has expired. Please login again.", { toastId: 'session-expired' });
    }
  }, [sellerAuth, customerAuth, adminAuth]);

  /* ----------------------------------------------------------
     Seller-only routes
  ---------------------------------------------------------- */
  if (isSellerAllowed && !isCustomerAllowed && !isAdminAllowed) {
    if (sellerAuth.isAuthenticated && sellerAuth.user) {
      return <Outlet />;
    }
    // Not authenticated as seller → redirect to seller auth
    return <Navigate to="/seller/login" replace />;
  }

  /* ----------------------------------------------------------
     Dual: Customer OR Seller
  ---------------------------------------------------------- */
  if (isCustomerAllowed && isSellerAllowed) {
    if (sellerAuth.isAuthenticated && sellerAuth.user) return <Outlet />;
    if (customerAuth.isAuthenticated && customerAuth.user) return <Outlet />;
    return <Navigate to="/login" replace />;
  }

  /* ----------------------------------------------------------
     Admin-only routes
  ---------------------------------------------------------- */
  if (isAdminAllowed) {
    if (
      adminAuth.isAuthenticated &&
      adminAuth.user?.role?.toLowerCase() === "admin"
    ) {
      return <Outlet />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  /* ----------------------------------------------------------
     Customer-only routes
  ---------------------------------------------------------- */
  if (!customerAuth.isAuthenticated || !customerAuth.user) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.some(
      (role) => role.toLowerCase() === customerAuth.user?.role?.toLowerCase()
    )
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
