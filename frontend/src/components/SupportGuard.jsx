import React from "react";
import { Outlet } from "react-router-dom";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { useSupportAuthStore } from "../store/supportAuthStore";
import SupportLogin from "../pages/support/SupportLogin";

const SupportGuard = () => {
  const adminAuth = useAdminAuthStore();
  const supportAuth = useSupportAuthStore();

  const isSupportMember = supportAuth.isAuthenticated && supportAuth.user;
  const isAdmin = adminAuth.isAuthenticated && adminAuth.user;

  if (!isSupportMember && !isAdmin) {
    return <SupportLogin />;
  }

  return (
    <div className="support-theme-wrapper min-h-screen w-full select-none overflow-x-hidden bg-[#f1f2f4]">
      <Outlet />
    </div>
  );
};

export default SupportGuard;
