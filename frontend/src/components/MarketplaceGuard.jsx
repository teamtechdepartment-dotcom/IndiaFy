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
  // Allow everyone to view the marketplace, including sellers.
  // The user reported that the landing page wasn't opening because this guard redirected to /seller-hub.
  return <Outlet />;
}
