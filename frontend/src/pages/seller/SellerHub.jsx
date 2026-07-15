import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      iconBg: "bg-blue-50 text-blue-600",
      hoverBorder: "hover:border-blue-200 hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] border-slate-200",
      activeBadgeBg: "bg-blue-50",
      activeBadgeText: "text-blue-600",
      activeBadgeBorder: "border-blue-200",
      buttonHover: "hover:bg-blue-600 hover:text-white bg-blue-500 text-white",
      buttonInactive: "hover:bg-slate-50 border-slate-200 bg-white text-brand-primary"
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
      hoverBorder: "hover:border-amber-200 hover:shadow-[0_8px_24px_rgba(245,158,11,0.12)] border-slate-200",
      activeBadgeBg: "bg-amber-50",
      activeBadgeText: "text-amber-600",
      activeBadgeBorder: "border-amber-200",
      buttonHover: "hover:bg-amber-500 hover:text-white bg-amber-400 text-white",
      buttonInactive: "hover:bg-slate-50 border-slate-200 bg-white text-brand-primary"
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
      hoverBorder: "hover:border-brand-accent/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)] border-slate-200",
      activeBadgeBg: "bg-emerald-50",
      activeBadgeText: "text-brand-accent",
      activeBadgeBorder: "border-brand-accent/30",
      buttonHover: "hover:bg-brand-accent-hover hover:text-white bg-brand-accent text-white",
      buttonInactive: "hover:bg-slate-50 border-slate-200 bg-white text-brand-primary"
    },
  },
  {
    title: "Home Essentials",
    description: "Daily household and grocery commerce ecosystem.",
    type: "HOME_ESSENTIALS",
    icon: Home,
    styles: {
      glow: "bg-orange-100/50",
      iconBg: "bg-orange-50 text-orange-500",
      hoverBorder: "hover:border-orange-200 hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)] border-slate-200",
      activeBadgeBg: "bg-orange-50",
      activeBadgeText: "text-orange-500",
      activeBadgeBorder: "border-orange-200",
      buttonHover: "hover:bg-orange-500 hover:text-white bg-orange-400 text-white",
      buttonInactive: "hover:bg-slate-50 border-slate-200 bg-white text-brand-primary"
    },
  },
  {
    title: "Electronics",
    description: "Technical gadgets and high-value electronic inventory management.",
    type: "ELECTRONICS",
    icon: Cpu,
    styles: {
      glow: "bg-purple-100/50",
      iconBg: "bg-purple-50 text-purple-600",
      hoverBorder: "hover:border-purple-200 hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)] border-slate-200",
      activeBadgeBg: "bg-purple-50",
      activeBadgeText: "text-purple-600",
      activeBadgeBorder: "border-purple-200",
      buttonHover: "hover:bg-purple-600 hover:text-white bg-purple-500 text-white",
      buttonInactive: "hover:bg-slate-50 border-slate-200 bg-white text-brand-primary"
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
      hoverBorder: "hover:border-rose-200 hover:shadow-[0_8px_24px_rgba(244,63,94,0.12)] border-slate-200",
      activeBadgeBg: "bg-rose-50",
      activeBadgeText: "text-rose-500",
      activeBadgeBorder: "border-rose-200",
      buttonHover: "hover:bg-rose-500 hover:text-white bg-rose-400 text-white",
      buttonInactive: "hover:bg-slate-50 border-slate-200 bg-white text-brand-primary"
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

  const sellerStore = useSellerAuthStore();
  const user = sellerStore?.user || null;
  const isAuthenticated = sellerStore?.isAuthenticated ?? false;
  const { logout } = useSellerAuthStore();
  const { logout: logoutCustomer } = useAuthStore();

  const { fetchAllNodes, nodes, isLoading, error, clearActiveNode } = useNodeStore();
  const fetchUnreadCounts = useNotificationStore((state) => state.fetchUnreadCounts);
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

    // AUTO REDIRECT: If exactly ONE active/approved node exists
    const activeNodes = (nodesList || []).filter(
      (n) => n.status === "ACTIVE" && n.isActive === true && n.approval?.status === "APPROVED"
    );
    fetchUnreadCounts(activeNodes.map((n) => n._id));
    if (activeNodes.length === 1) {
      navigate(`/seller/dashboard/${activeNodes[0]._id}/dashboard`, { replace: true });
    }
  }, [fetchAllNodes, fetchUnreadCounts, navigate]);

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
  const activeNodesCount = nodes.filter((node) => node.status === "ACTIVE" && node.isActive === true && node.approval?.status === "APPROVED").length;

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
      <div className="min-h-screen bg-slate-50 pt-12 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <Skeleton className="w-64 h-12" />
          <Skeleton className="w-96 h-6" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {[...Array(6)].map((_, i) => (
             <Skeleton key={i} className="h-64 rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------
     UI
  ---------------------------------------------------------- */
  return (
    <div className="bg-slate-50 min-h-screen text-brand-primary font-sans relative overflow-hidden">
      <SEOHead title="Seller Hub | Indiafy" noindex={true} />

      {/* Background Blobs for Hero Theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] bg-gradient-to-br from-emerald-100/50 to-teal-100/30 rounded-full blur-[100px] -z-0" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[100px] -z-0" />
      </div>

      <main className="relative z-10 pt-12 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-slate-200 text-brand-primary">
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-brand-primary hover:bg-slate-50 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin text-brand-accent" : "text-brand-text-secondary"} />
                Refresh
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-brand-error hover:bg-red-50 text-xs font-bold transition-all shadow-sm"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-primary tracking-tighter mb-4">
            Seller{" "}
            <span className="text-brand-accent relative inline-block">
              Hub.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-accent/20" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,10 Q50,-5 100,10" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-brand-text-secondary text-lg font-medium max-w-2xl leading-relaxed">
            Welcome back,{" "}
            <span className="text-brand-primary font-bold">
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
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-text-secondary mb-2">
                Active Nodes
              </p>
              <p className="text-4xl font-black text-brand-primary">
                {activeNodesCount}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-text-secondary mb-2">
                Available Nodes
              </p>
              <p className="text-4xl font-black text-brand-primary">
                {NODE_DEFINITIONS.length - activeNodesCount}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Activity size={24} className="text-brand-accent" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-brand-text-secondary mb-1">
                  Status
                </p>
                <p className="text-sm font-black text-brand-primary">
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
          <div className="mb-8 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-brand-error shadow-sm">
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
            const isApproved = existingNode?.status === "ACTIVE" && existingNode?.isActive === true && existingNode?.approval?.status === "APPROVED";
            const isActive = !!isApproved;
            const Icon = node.icon;

            return (
              <div
                key={node.type}
                className={`bg-white/95 backdrop-blur-xl border rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden transition-all duration-300 ${node.styles.hoverBorder} ${
                  isActive ? "shadow-md hover:shadow-2xl hover:-translate-y-1" : "shadow-sm hover:shadow-lg"
                }`}
              >
                {/* GLOW */}
                <div
                  className={`absolute -top-10 -right-10 w-40 h-40 ${node.styles.glow} rounded-full blur-[50px] pointer-events-none`}
                />
                {isActive && existingNode?._id && (
                  <NodeNotificationBadge
                    nodeId={existingNode._id}
                    className="absolute top-4 right-4 z-20"
                  />
                )}

                {/* HEADER */}
                <div className="flex items-center justify-between mb-7 relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl ${node.styles.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
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
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full border border-slate-200">
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
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-full border border-slate-200">
                            Suspended
                          </span>
                        );
                      }
                    }
                    return (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full border border-slate-200">
                        Inactive
                      </span>
                    );
                  })()}
                </div>

                {/* BODY */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-brand-primary tracking-tight mb-2">
                    {node.title}
                  </h3>

                  <p className="text-sm font-medium text-brand-text-secondary mb-6 leading-relaxed flex-1">
                    {node.description}
                  </p>

                  {/* STORE NAME (if active or pending application) */}
                  {(existingNode?.storeName || app?.storeName) && (
                    <div className="mb-5 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200/60 shadow-inner">
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
                    <p className="text-xs text-amber-700 font-semibold mb-5 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/50 leading-normal">
                      Your application is waiting for admin approval.
                    </p>
                  )}
                  {lifecycleStatus === "UNDER_REVIEW" && (
                    <p className="text-xs text-amber-700 font-semibold mb-5 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/50 flex items-center gap-2 leading-normal">
                      <Loader2 size={12} className="animate-spin text-amber-500 shrink-0" />
                      Our compliance team is currently reviewing your documents.
                    </p>
                  )}
                  {lifecycleStatus === "REJECTED" && (
                    <div className="mb-5 bg-rose-50/50 p-3 rounded-2xl border border-rose-200/50 text-xs leading-normal">
                      <p className="text-rose-700 font-bold mb-1">Application Rejected</p>
                      <p className="text-slate-500 font-medium truncate">
                        Remarks: {app?.rejectionReason || existingNode?.approval?.remarks || "Compliance check failed."}
                      </p>
                    </div>
                  )}
                  {lifecycleStatus === "SUSPENDED" && (
                    <p className="text-xs text-slate-650 font-semibold mb-5 bg-slate-100/80 p-3 rounded-2xl border border-slate-200 leading-normal">
                      Store node suspended. Please contact customer support.
                    </p>
                  )}
                  {isActive && (
                    <div className="mb-5 flex flex-col gap-1 px-4 py-3 bg-emerald-50/40 rounded-2xl border border-emerald-200/50 shadow-inner">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                        <ShieldCheck size={11} className="text-emerald-500" /> Store Verified
                      </p>
                      <p className="text-[11px] font-bold text-slate-600">
                        Admin Approved
                      </p>
                    </div>
                  )}

                  {/* CTA */}
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
                        className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl active:scale-[0.98] bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white border-none transform hover:-translate-y-0.5"
                      >
                        Go To Dashboard
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : (() => {
                      if (app || existingNode) {
                        if (lifecycleStatus === "DRAFT") {
                          return (
                            <button
                              onClick={() => setActiveWizard(node.type)}
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all border border-slate-200 hover:bg-slate-50 text-brand-primary active:scale-[0.98]"
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
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
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
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all border active:scale-[0.98] bg-orange-500 hover:bg-orange-600 text-white shadow-md"
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
                              className="w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border bg-slate-200 text-slate-400 cursor-not-allowed"
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
                          className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all border active:scale-[0.98] ${node.styles.buttonInactive}`}
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
          <div className="mt-12 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-7 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-brand-primary">
                Quick Switch
              </h2>
              <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
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
                    className="relative flex items-center gap-3 p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl transition-all group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${def.styles.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
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
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
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
        <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-center gap-2 text-brand-text-secondary">
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
