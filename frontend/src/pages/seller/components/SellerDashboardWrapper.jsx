import React, { useEffect, useState, useCallback } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useNodeStore } from "../../../store/nodeStore";
import DashboardLayout from "../../../components/DashboardLayout";
import SellerErrorBoundary from "../../../components/SellerErrorBoundary";
import { AlertCircle, ArrowLeft } from "lucide-react";
import DashboardSkeleton from "../../../components/ui/skeletons/DashboardSkeleton";

/**
 * SellerDashboardWrapper
 *
 * Reads :nodeId from URL → fetches node from API → sets activeNode in
 * nodeStore → renders DashboardLayout (which contains <Outlet>).
 *
 * Route: /seller/dashboard/:nodeId/*
 */
export default function SellerDashboardWrapper() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const { fetchNodeDetails, activeNode, isLoading, error, clearError } =
    useNodeStore();
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadNode = useCallback(async () => {
    if (!nodeId) return;
    clearError();
    await fetchNodeDetails(nodeId);
    setHasLoaded(true);
  }, [nodeId, clearError, fetchNodeDetails]);

  useEffect(() => {
    // If activeNode._id already matches, skip re-fetch (persist layer)
    if (activeNode?._id?.toString() === nodeId) {
      Promise.resolve().then(() => setHasLoaded(true));
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNode();
  }, [nodeId, activeNode?._id, loadNode]);

  /* ----------------------------------------------------------
     LOADING STATE
  ---------------------------------------------------------- */
  if (isLoading && !hasLoaded) {
    return <DashboardSkeleton />;
  }

  /* ----------------------------------------------------------
     ERROR STATE
  ---------------------------------------------------------- */
  if (error && hasLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Node Access Error
          </h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={loadNode}
              className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/seller-hub")}
              className="w-full py-3.5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Return to Seller Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------
     NO NODE AFTER LOAD → redirect to hub
  ---------------------------------------------------------- */
  if (!activeNode && hasLoaded) {
    return <Navigate to="/seller-hub" replace />;
  }

  /* ----------------------------------------------------------
     SECONDARY FALLBACK — waiting for load effect
  ---------------------------------------------------------- */
  if (!activeNode) {
    return null;
  }

  /* ----------------------------------------------------------
     GATE ACTIVE/APPROVED STATUS FOR DASHBOARD ACCESS
  ---------------------------------------------------------- */
  const isApproved = activeNode?.status === "ACTIVE" && activeNode?.isActive === true && activeNode?.approval?.status === "APPROVED";
  if (hasLoaded && activeNode && !isApproved) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl text-center border border-slate-200">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertCircle className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Access Forbidden (403)
          </h2>
          <p className="text-slate-550 text-sm mb-6 leading-relaxed font-semibold">
            Your store is awaiting admin approval.
          </p>
          <button
            onClick={() => navigate("/seller-hub")}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95"
          >
            Return to Seller Hub
          </button>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------
     SUCCESS — Render Dashboard with node data
  ---------------------------------------------------------- */
  const storeProps = {
    name: activeNode.storeName || "Store",
    logo: activeNode.logo || null,
    email: activeNode.email || "",
    phone: activeNode.phone || "",
    address: activeNode.address || "",
    nodeType: activeNode.nodeType || "",
    nodeId: activeNode._id,
  };

  // Format nodeType display label: LOCAL_RETAIL → "Local Retail"
  const displayNodeType =
    activeNode.nodeType
      ?.toLowerCase()
      ?.split("_")
      ?.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      ?.join(" ") || "Seller Store";

  return (
    <SellerErrorBoundary pageName={displayNodeType}>
      <DashboardLayout storeDetails={storeProps} activeNode={displayNodeType} />
    </SellerErrorBoundary>
  );
}
