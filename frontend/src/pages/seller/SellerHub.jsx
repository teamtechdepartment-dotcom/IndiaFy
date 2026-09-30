import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSellerAuthStore } from "../../store/sellerAuthStore";
import { useAuthStore } from "../../store/authStore";
import { useNodeStore } from "../../store/nodeStore";
import { useNotificationStore } from "../../store/notificationStore";
import {
  Store,
  Truck,
  Zap,
  Plus,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Home,
  Cpu,
  Heart,
  RefreshCw,
  Activity,
  AlertCircle,
  Clock,
  Loader2,
  LogOut,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import SEOHead from "../../components/seo/SEOHead";
import OrderNotificationBadge from "../../components/seller/OrderNotificationBadge";
import StoreCreationWizard from "./components/StoreCreationWizard";

/* ----------------------------------------------------------
   NODE ACTIVE HELPER
---------------------------------------------------------- */
const isNodeActive = (node) => {
  if (!node) return false;
  const s = node.status?.toUpperCase();
  const appS = node.approval?.status?.toUpperCase();
  return (s === "ACTIVE" || s === "APPROVED") && node.isActive !== false && (appS === "APPROVED" || !node.approval);
};
import { Skeleton } from "../../components/ui/Skeleton";
import axiosInstance from "../../utils/axiosInstance";

/* ----------------------------------------------------------
   NODE CARD DEFINITIONS
---------------------------------------------------------- */
const NODE_DEFINITIONS = [
  {
    title: "Local Retail",
    description: "Hyperlocal B2C commerce with real-time delivery and local customer operations.",
    type: "LOCAL_RETAIL",
    icon: Store,
    styles: {
      glow: "bg-blue-100/50",
      iconBg: "bg-blue-50 text-[#065F46]",
      hoverBorder: "hover:border-blue-200 hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] border-gray-200",
      activeBadgeBg: "bg-blue-50",
      activeBadgeText: "text-[#065F46]",
      activeBadgeBorder: "border-blue-200",
      buttonHover: "hover:bg-[#065F46] hover:text-white bg-blue-500 text-white",
      buttonInactive: "hover:bg-gray-50 border-gray-200 bg-white text-brand-primary"
    },
  },
  {
    title: "Wholesale B2B",
    description: "Bulk commerce infrastructure with warehouse logistics and tiered pricing.",
    type: "WHOLESALE_B2B",
    icon: Truck,
    styles: {
      glow: "bg-amber-100/50",
      iconBg: "bg-amber-50 text-amber-600",
      hoverBorder: "hover:border-amber-200 hover:shadow-[0_8px_24px_rgba(245,158,11,0.12)] border-gray-200",
      activeBadgeBg: "bg-amber-50",
      activeBadgeText: "text-amber-600",
      activeBadgeBorder: "border-amber-200",
      buttonHover: "hover:bg-amber-500 hover:text-white bg-amber-400 text-white",
      buttonInactive: "hover:bg-gray-50 border-gray-200 bg-white text-brand-primary"
    },
  },
  {
    title: "Quick Commerce",
    description: "under 30-minute dark store operations with live rider routing and instant dispatch.",
    type: "QUICK_COMMERCE",
    icon: Zap,
    styles: {
      glow: "bg-brand-accent/10",
      iconBg: "bg-emerald-50 text-brand-accent",
      hoverBorder: "hover:border-brand-accent/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)] border-gray-200",
      activeBadgeBg: "bg-emerald-50",
      activeBadgeText: "text-brand-accent",
      activeBadgeBorder: "border-brand-accent/30",
      buttonHover: "hover:bg-brand-accent-hover hover:text-white bg-brand-accent text-white",
      buttonInactive: "hover:bg-gray-50 border-gray-200 bg-white text-brand-primary"
    },
  },
  {
    title: "Home Essentials",
    description: "Daily household and grocery commerce ecosystem.",
    type: "HOME_ESSENTIALS",
    icon: Home,
    styles: {
      glow: "bg-orange-100/50",
      iconBg: "bg-orange-50 text-[#065F46]",
      hoverBorder: "hover:border-orange-200 hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)] border-gray-200",
      activeBadgeBg: "bg-orange-50",
      activeBadgeText: "text-[#065F46]",
      activeBadgeBorder: "border-orange-200",
      buttonHover: "hover:bg-[#065F46] hover:text-white bg-orange-400 text-white",
      buttonInactive: "hover:bg-gray-50 border-gray-200 bg-white text-brand-primary"
    },
  },
  {
    title: "Electronics",
    description: "Technical gadgets and high-value electronic inventory management.",
    type: "ELECTRONICS",
    icon: Cpu,
    styles: {
      glow: "bg-purple-100/50",
      iconBg: "bg-purple-50 text-[#065F46]",
      hoverBorder: "hover:border-purple-200 hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)] border-gray-200",
      activeBadgeBg: "bg-purple-50",
      activeBadgeText: "text-[#065F46]",
      activeBadgeBorder: "border-purple-200",
      buttonHover: "hover:bg-[#065F46] hover:text-white bg-[#065F46] text-white",
      buttonInactive: "hover:bg-gray-50 border-gray-200 bg-white text-brand-primary"
    },
  },
  {
    title: "Personal Care",
    description: "Beauty, wellness and self-care commerce infrastructure.",
    type: "PERSONAL_CARE",
    icon: Heart,
    styles: {
      glow: "bg-rose-100/50",
      iconBg: "bg-rose-50 text-rose-500",
      hoverBorder: "hover:border-rose-200 hover:shadow-[0_8px_24px_rgba(244,63,94,0.12)] border-gray-200",
      activeBadgeBg: "bg-rose-50",
      activeBadgeText: "text-rose-500",
      activeBadgeBorder: "border-rose-200",
      buttonHover: "hover:bg-rose-500 hover:text-white bg-rose-400 text-white",
      buttonInactive: "hover:bg-gray-50 border-gray-200 bg-white text-brand-primary"
    },
  },
];

const NodeNotificationBadge = React.memo(function NodeNotificationBadge({ nodeId, className = "" }) {
  const count = useNotificationStore((state) => state.unreadCounts[nodeId] || 0);
  return <OrderNotificationBadge count={count} className={className} />;
});

/* ----------------------------------------------------------
   COMPONENT
---------------------------------------------------------- */
export default function SellerHub() {
  const navigate = useNavigate();
  const location = useLocation();

  const sellerStore = useSellerAuthStore();
  const user = sellerStore?.user || null;
  const isAuthenticated = sellerStore?.isAuthenticated ?? false;
  const { logout } = useSellerAuthStore();
  const { logout: logoutCustomer } = useAuthStore();

  const { fetchAllNodes, nodes, isLoading, error, clearActiveNode } = useNodeStore();
  const fetchUnreadCounts = useNotificationStore((state) => state.fetchUnreadCounts);
  const unreadCounts = useNotificationStore((state) => state.unreadCounts);
  const clearBadge = useNotificationStore((state) => state.clearBadge);

  const [activeWizard, setActiveWizard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState([]);

  /* ----------------------------------------------------------
     FETCH NODES & APPLICATIONS
  ---------------------------------------------------------- */
  const loadNodes = useCallback(async () => {
    Promise.resolve().then(() => setRefreshing(true));
    const nodesList = await fetchAllNodes();
    try {
      const res = await axiosInstance.get("/seller/applications/my-applications");
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      console.error("Failed to load seller applications:", err);
    }
    setRefreshing(false);

    const activeNodes = (nodesList || []).filter(isNodeActive);
    fetchUnreadCounts(activeNodes.map((n) => n._id));
  }, [fetchAllNodes, fetchUnreadCounts]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/seller/login?redirect=/seller-hub", { replace: true });
      return;
    }
    loadNodes();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  const getExistingNode = (type) => nodes.find((n) => n.nodeType === type) || null;
  const normalizeStatus = (status) => {
    if (status === "pending") return "PENDING_REVIEW";
    if (status === "approved" || status === "APPROVED" || status === "ACTIVE") return "ACTIVE";
    if (status === "rejected") return "REJECTED";
    if (status === "additional_information_required") return "CHANGES_REQUESTED";
    return status || "";
  };
  const activeNodesCount = nodes.filter(isNodeActive).length;

  /* ----------------------------------------------------------
     WIZARD SUCCESS
  ---------------------------------------------------------- */
  const handleWizardSuccess = (nodeType, returnedNode) => {
    loadNodes();
    setActiveWizard(null);
    setTimeout(() => {
      if (returnedNode?._id) {
        navigate(`/seller/dashboard/${returnedNode._id}/dashboard`);
        return;
      }
      navigate(`/seller/application-status/${nodeType}`);
    }, 600);
  };

  /* ----------------------------------------------------------
     LOGOUT
  ---------------------------------------------------------- */
  const handleLogout = async () => {
    try {
      await Promise.allSettled([logout(), logoutCustomer()]);
      clearActiveNode();
      navigate("/", { replace: true });
    } catch {
      navigate("/", { replace: true });
    }
  };

  /* ----------------------------------------------------------
     LOADING
  ---------------------------------------------------------- */
  if (isLoading && !refreshing && nodes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <Skeleton className="w-64 h-12" />
          <Skeleton className="w-96 h-6" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {[...Array(6)].map((_, i) => (
             <Skeleton key={i} className="h-64 rounded" />
          ))}
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------
     UI
  ---------------------------------------------------------- */
  return (
    <div className="bg-[#f1f2f4] min-h-screen text-gray-900 font-sans relative overflow-hidden">
      <SEOHead title="Seller Hub | Indiafy" noindex={true} />
      
      {/* Background Blobs Removed for Flat UI */}

      <main className="relative z-10 pt-12 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-200 text-brand-primary">
              <Briefcase size={14} className="text-brand-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Multi-Node Ecosystem
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh */}
              <button
                onClick={loadNodes}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin text-[#065F46]" : "text-gray-400"} />
                Refresh
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded bg-white border border-gray-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all shadow-sm"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4">
            Seller{" "}
            <span className="text-[#065F46] relative inline-block">
              Hub.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#065F46]/20" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,10 Q50,-5 100,10" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
            Welcome back,{" "}
            <span className="text-gray-900 font-bold">
              {user?.firstName || "Seller"}
            </span>
            . Manage all your business operations from one unified command center.
          </p>
        </div>

        {/* =====================================================
            SUMMARY BAR
        ===================================================== */}
        {activeNodesCount > 0 && (
          <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Active Nodes
              </p>
              <p className="text-4xl font-black text-gray-900">
                {activeNodesCount}
              </p>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Available Nodes
              </p>
              <p className="text-4xl font-black text-gray-900">
                {NODE_DEFINITIONS.length - activeNodesCount}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white border border-gray-200 shadow-sm rounded p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-[#065F46]/10 flex items-center justify-center shrink-0">
                <Activity size={24} className="text-[#065F46]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Status
                </p>
                <p className="text-sm font-black text-gray-900">
                  All Systems Online
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR BANNER
        ===================================================== */}
        {error && (
          <div className="mb-8 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded text-brand-error shadow-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={loadNodes}
              className="ml-auto text-xs font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* =====================================================
            NODE GRID
        ===================================================== */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {NODE_DEFINITIONS.map((node) => {
            const existingNode = getExistingNode(node.type);
            const app = applications.find(a => a.nodeType === node.type);
            const lifecycleStatus = normalizeStatus(existingNode?.status || app?.status);
            const isActive = isNodeActive(existingNode);
            const nodeUnreadCount = existingNode?._id ? (unreadCounts[existingNode._id] || 0) : 0;
            const Icon = node.icon;

            return (
              <div
                key={node.type}
                className={`bg-white border rounded p-8 flex flex-col relative overflow-hidden transition-all duration-300 ${
                  isActive ? "border-gray-300 shadow-md" : "border-gray-200 shadow-sm hover:border-gray-300"
                }`}
              >
                {isActive && existingNode?._id && (
                  <NodeNotificationBadge
                    nodeId={existingNode._id}
                    className="absolute top-4 right-4 z-20"
                  />
                )}

                {/* HEADER */}
                <div className="flex items-center justify-between mb-7 relative z-10">
                  <div
                    className={`w-14 h-14 rounded bg-gray-50 text-gray-500 border border-gray-200 flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon size={24} />
                  </div>

                  {isActive ? (
                    <span
                      className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <ShieldCheck size={12} className="text-emerald-500 animate-bounce" />
                      Active
                    </span>
                  ) : (() => {
                    if (app || existingNode) {
                      if (lifecycleStatus === "DRAFT") {
                        return (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-full border border-gray-200">
                            Draft
                          </span>
                        );
                      }
                      if (lifecycleStatus === "PENDING_REVIEW") {
                        return (
                          <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-250 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Pending Review
                          </span>
                        );
                      }
                      if (lifecycleStatus === "UNDER_REVIEW") {
                        return (
                          <span className="px-3 py-1.5 bg-amber-50 text-amber-655 text-[10px] font-black uppercase rounded-full border border-amber-200 flex items-center gap-1.5">
                            <Loader2 size={12} className="animate-spin text-amber-500" />
                            Under Review
                          </span>
                        );
                      }
                      if (lifecycleStatus === "CHANGES_REQUESTED") {
                        return (
                          <span className="px-3 py-1.5 bg-orange-50 text-orange-850 text-[10px] font-black uppercase rounded-full border border-orange-200">
                            Action Required
                          </span>
                        );
                      }
                      if (lifecycleStatus === "REJECTED") {
                        return (
                          <span className="px-3 py-1.5 bg-rose-50 text-rose-700 text-[10px] font-black uppercase rounded-full border border-rose-200">
                            Rejected
                          </span>
                        );
                      }
                      if (lifecycleStatus === "SUSPENDED") {
                        return (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] font-black uppercase rounded-full border border-gray-200">
                            Suspended
                          </span>
                        );
                      }
                    }
                    return (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-full border border-gray-200">
                        Inactive
                      </span>
                    );
                  })()}
                </div>

                {/* BODY */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
                    {node.title}
                  </h3>

                  <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed flex-1">
                    {node.description}
                  </p>

                  {/* NEW ORDER NOTIFICATION BANNER */}
                  {nodeUnreadCount > 0 && (
                    <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200/80 rounded flex items-center justify-between shadow-sm animate-pulse">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        <span>🎉 {nodeUnreadCount} New Order{nodeUnreadCount > 1 ? "s" : ""} Received!</span>
                      </div>
                      <span className="text-[10px] bg-rose-600 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                        New Order
                      </span>
                    </div>
                  )}

                  {/* STORE NAME (if active or pending application) */}
                  {(existingNode?.storeName || app?.storeName) && (
                    <div className="mb-5 px-4 py-3 bg-gray-50 rounded border border-gray-200/60 shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-1">
                        Store Name
                      </p>
                      <p className="text-[15px] font-bold text-brand-primary truncate">
                        {existingNode?.storeName || app?.storeName}
                      </p>
                    </div>
                  )}

                  {/* Help / Timeline Status Descriptions */}
                  {lifecycleStatus === "PENDING_REVIEW" && (
                    <p className="text-xs text-amber-700 font-semibold mb-5 bg-amber-50/50 p-3 rounded border border-amber-200/50 leading-normal">
                      Your application is waiting for admin approval.
                    </p>
                  )}
                  {lifecycleStatus === "UNDER_REVIEW" && (
                    <p className="text-xs text-amber-700 font-semibold mb-5 bg-amber-50/50 p-3 rounded border border-amber-200/50 flex items-center gap-2 leading-normal">
                      <Loader2 size={12} className="animate-spin text-amber-500 shrink-0" />
                      Our compliance team is currently reviewing your documents.
                    </p>
                  )}
                  {lifecycleStatus === "REJECTED" && (
                    <div className="mb-5 bg-rose-50/50 p-3 rounded border border-rose-200/50 text-xs leading-normal">
                      <p className="text-rose-700 font-bold mb-1">Application Rejected</p>
                      <p className="text-gray-500 font-medium truncate">
                        Remarks: {app?.rejectionReason || existingNode?.approval?.remarks || "Compliance check failed."}
                      </p>
                    </div>
                  )}
                  {lifecycleStatus === "SUSPENDED" && (
                    <p className="text-xs text-gray-650 font-semibold mb-5 bg-gray-100/80 p-3 rounded border border-gray-200 leading-normal">
                      Store node suspended. Please contact customer support.
                    </p>
                  )}
                  {isActive && (
                    <div className="mb-5 flex flex-col gap-1 px-4 py-3 bg-emerald-50/40 rounded border border-emerald-200/50 shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                        <ShieldCheck size={11} className="text-emerald-500" /> Store Verified
                      </p>
                      <p className="text-[11px] font-bold text-gray-600">
                        Admin Approved
                      </p>
                    </div>
                  )}

                  <div className="mt-auto">
                    {isActive ? (
                      <Link
                        to={`/seller/dashboard/${existingNode._id}/dashboard`}
                        onClick={() => clearBadge(existingNode._id)}
                        state={{
                          sellerId: existingNode.seller,
                          nodeId: existingNode._id,
                          role: "Seller",
                          permissions: ["Products", "Orders", "Inventory", "Analytics", "Payments"]
                        }}
                        className="w-full py-3 rounded font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all shadow-sm bg-[#065F46] hover:bg-[#047857] text-white"
                      >
                        Go To Dashboard
                        <ArrowRight size={14} className="group-hover:trangray-x-1 transition-transform" />
                      </Link>
                    ) : (() => {
                      if (app || existingNode) {
                        if (lifecycleStatus === "DRAFT") {
                          return (
                            <button
                              onClick={() => setActiveWizard(node.type)}
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all border border-gray-200 hover:bg-gray-50 text-brand-primary active:scale-[0.98]"
                            >
                              <Plus size={14} />
                              Continue Setup
                            </button>
                          );
                        }
                        if (["PENDING_REVIEW", "UNDER_REVIEW"].includes(lifecycleStatus)) {
                          return (
                            <button
                              disabled
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                            >
                              <Clock size={14} />
                              Pending Approval
                            </button>
                          );
                        }
                        if (lifecycleStatus === "CHANGES_REQUESTED") {
                          return (
                            <Link
                              to={`/seller/application-status/${node.type}`}
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all border active:scale-[0.98] bg-[#065F46] hover:bg-[#065F46] text-white shadow-md"
                            >
                              <AlertTriangle size={14} />
                              Edit Application
                            </Link>
                          );
                        }
                        if (lifecycleStatus === "REJECTED") {
                          return (
                            <button
                              onClick={() => setActiveWizard(node.type)}
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all border active:scale-[0.98] bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                            >
                              <RefreshCw size={14} />
                              Resubmit
                            </button>
                          );
                        }
                        if (lifecycleStatus === "SUSPENDED") {
                          return (
                            <button
                              disabled
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border bg-gray-200 text-gray-400 cursor-not-allowed"
                            >
                              <AlertCircle size={14} />
                              Suspended
                            </button>
                          );
                        }
                      }
                      return (
                        <button
                          onClick={() => setActiveWizard(node.type)}
                          className={`w-full py-3 rounded font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all border active:scale-[0.98] border-gray-200 bg-white hover:bg-gray-50 text-gray-700`}
                        >
                          <Plus size={14} />
                          Activate Node
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================
            ACTIVE NODES QUICK SWITCH
        ===================================================== */}
        {activeNodesCount > 0 && (
          <div className="mt-12 bg-white/80 backdrop-blur-xl border border-gray-200 rounded p-7 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-brand-primary">
                Quick Switch
              </h2>
              <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
                {activeNodesCount} Active Node{activeNodesCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.filter(n => ["ACTIVE", "APPROVED"].includes(n.status)).map((n) => {
                const def = NODE_DEFINITIONS.find((d) => d.type === n.nodeType);
                if (!def) return null;
                const Icon = def.icon;
                return (
                  <Link
                    key={n._id}
                    to={`/seller/dashboard/${n._id}/dashboard`}
                    onClick={() => clearBadge(n._id)}
                    className="relative flex items-center gap-3 p-4 bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md rounded transition-all group"
                  >
                    <div
                      className={`w-10 h-10 rounded ${def.styles.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-brand-primary truncate">
                        {n.storeName || def.title}
                      </p>
                      <p className="text-[11px] text-brand-text-secondary font-medium">
                        {def.title}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <ChevronRight size={14} className="text-brand-text-secondary" />
                    </div>
                    <NodeNotificationBadge nodeId={n._id} className="absolute top-2 right-2 z-20" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================
            SECURITY FOOTER
        ===================================================== */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-center gap-2 text-brand-text-secondary">
          <ShieldCheck size={16} className="text-brand-accent" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Isolated Node Architecture • Enterprise Ready • Multi-Node Ecosystem
          </span>
        </div>
      </main>

      {/* =====================================================
          STORE CREATION WIZARD
      ===================================================== */}
      {activeWizard && (
        <StoreCreationWizard
          nodeType={activeWizard}
          onClose={() => setActiveWizard(null)}
          onSuccess={handleWizardSuccess}
        />
      )}
    </div>
  );
}
