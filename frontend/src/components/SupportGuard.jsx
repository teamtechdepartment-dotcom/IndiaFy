import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "../store/adminAuthStore";

const SupportGuard = () => {
  const adminAuth = useAdminAuthStore();

  if (!adminAuth.isAuthenticated || !adminAuth.user) {
    return <Navigate to="/admin/login" replace />;
  }

  const role = (adminAuth.user.role || "").toLowerCase();
  const permissions = adminAuth.user.permissions || [];

  const isSuperAdmin = role === "super_admin" || role === "superadmin";
  const hasSupportPerm = permissions.includes("tickets:write") || permissions.includes("tickets:read") || permissions.includes("*") || isSuperAdmin;

  if (!hasSupportPerm) {
    return <Navigate to="/403" replace />;
  }

  return (
    <div className="support-theme-wrapper min-h-screen w-full select-none overflow-x-hidden bg-[#f1f2f4]">
      <Outlet />
    </div>
  );
};

export default SupportGuard;
