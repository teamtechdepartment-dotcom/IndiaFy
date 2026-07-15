import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const isSellerAllowed = allowedRoles?.includes("seller");
  const isCustomerAllowed = allowedRoles?.includes("customer");
  const isAdminAllowed = allowedRoles?.includes("admin");
  const isDeliveryAllowed = allowedRoles?.includes("delivery_partner");

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
     Delivery-partner routes
  ---------------------------------------------------------- */
  if (isDeliveryAllowed) {
    if (
      customerAuth.isAuthenticated &&
      customerAuth.user?.role?.toLowerCase() === "delivery_partner"
    ) {
      return <Outlet />;
    }
    if (sellerAuth.isAuthenticated || customerAuth.isAuthenticated) {
      return <Navigate to="/403" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  /* ----------------------------------------------------------
     Seller-only routes
  ---------------------------------------------------------- */
  if (isSellerAllowed && !isCustomerAllowed && !isAdminAllowed) {
    if (sellerAuth.isAuthenticated && sellerAuth.user) {
      return <Outlet />;
    }
    if (customerAuth.isAuthenticated && customerAuth.user) {
      // Logged in as customer, block and redirect to 403 Access Denied
      return <Navigate to="/403" replace />;
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
      (adminAuth.user?.role?.toLowerCase() === "admin" || adminAuth.user?.role?.toLowerCase() === "super_admin")
    ) {
      return (
        <div className="admin-theme-wrapper min-h-screen w-full select-none overflow-x-hidden">
          <Outlet />
        </div>
      );
    }
    return <Navigate to="/admin/login" replace />;
  }

  /* ----------------------------------------------------------
     Customer-only routes
  ---------------------------------------------------------- */
  const returnUrl = encodeURIComponent(location.pathname + location.search);

  if (!customerAuth.isAuthenticated || !customerAuth.user) {
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.some(
      (role) => role.toLowerCase() === customerAuth.user?.role?.toLowerCase()
    )
  ) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
