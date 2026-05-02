import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    const isSellerPath = allowedRoles?.some(role => role.toLowerCase() === "seller");
    return <Navigate to={isSellerPath ? "/seller-auth" : "/login"} replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => role.toLowerCase() === user?.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
