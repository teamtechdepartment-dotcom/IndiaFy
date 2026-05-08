import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useSellerAuthStore } from "../store/sellerAuthStore";

const ProtectedRoute = ({ allowedRoles }) => {
  const customerAuth = useAuthStore();
  const sellerAuth = useSellerAuthStore();

  const isSellerAllowed = allowedRoles?.includes("seller");
  const isCustomerAllowed = allowedRoles?.includes("customer");
  const isAdminAllowed = allowedRoles?.includes("admin");

  // Dual Role (Customer or Seller)
  if (isCustomerAllowed && isSellerAllowed) {
    if (sellerAuth.isAuthenticated && sellerAuth.user) return <Outlet />;
    if (customerAuth.isAuthenticated && customerAuth.user) return <Outlet />;
    return <Navigate to="/login" replace />;
  }

  // Strict Seller Route
  if (isSellerAllowed && !isCustomerAllowed) {
    if (!sellerAuth.isAuthenticated || !sellerAuth.user) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  }

  // Default to Customer or Admin Route
  if (!customerAuth.isAuthenticated || !customerAuth.user) {
    if (isAdminAllowed) {
        return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => role.toLowerCase() === customerAuth.user?.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
