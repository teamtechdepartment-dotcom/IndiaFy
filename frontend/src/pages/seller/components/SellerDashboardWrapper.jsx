import React, { useEffect, useState, useCallback } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useNodeStore } from "../../../store/nodeStore";
import DashboardLayout from "../../../components/DashboardLayout";
import SellerErrorBoundary from "../../../components/SellerErrorBoundary";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";

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
  }, [nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // If activeNode._id already matches, skip re-fetch (persist layer)
    if (activeNode?._id?.toString() === nodeId) {
      setHasLoaded(true);
      return;
    }
    loadNode();
  }, [nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------------------------
     LOADING STATE
  ---------------------------------------------------------- */
  if (isLoading && !hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-slate-900 font-black tracking-widest uppercase text-xs mb-1">
            Loading Node Environment
          </h2>
          <p className="text-slate-400 text-xs">
            Initializing your seller dashboard...
          </p>
        </div>
      </div>
    );
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
