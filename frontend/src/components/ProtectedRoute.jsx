import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSellerAuthStore } from "../store/sellerAuthStore";

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

  const isSellerAllowed = allowedRoles?.includes("seller");
  const isCustomerAllowed = allowedRoles?.includes("customer");
  const isAdminAllowed = allowedRoles?.includes("admin");

  /* ----------------------------------------------------------
     Seller-only routes
  ---------------------------------------------------------- */
  if (isSellerAllowed && !isCustomerAllowed && !isAdminAllowed) {
    if (sellerAuth.isAuthenticated && sellerAuth.user) {
      return <Outlet />;
    }
    // Not authenticated as seller → redirect to seller auth
    return <Navigate to="/seller-auth" replace />;
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
      customerAuth.isAuthenticated &&
      customerAuth.user?.role?.toLowerCase() === "admin"
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
