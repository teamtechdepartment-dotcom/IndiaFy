import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSellerAuthStore } from "../store/sellerAuthStore";

/**
 * MarketplaceGuard
 *
 * Prevents logged-in sellers from visiting customer marketplace routes
 * and shopping flows. Redirects them back to the seller hub.
 */
export default function MarketplaceGuard() {
  const { isAuthenticated, user } = useSellerAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to="/seller-hub" replace />;
  }

  return <Outlet />;
}
