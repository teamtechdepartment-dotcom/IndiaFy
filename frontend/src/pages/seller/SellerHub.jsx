import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSellerAuthStore } from "../../store/sellerAuthStore";
import { useAuthStore } from "../../store/authStore";
import { useNodeStore } from "../../store/nodeStore";
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
  TrendingUp,
  Package,
  Activity,
  AlertCircle,
  Loader2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import StoreCreationWizard from "./components/StoreCreationWizard";

/* ----------------------------------------------------------
   NODE CARD DEFINITIONS
---------------------------------------------------------- */
const NODE_DEFINITIONS = [
  {
    title: "Local Retail",
    description:
      "Hyperlocal B2C commerce with real-time delivery and local customer operations.",
    type: "LOCAL_RETAIL",
    icon: Store,
    styles: {
      glow: "bg-blue-500/10",
      iconBg: "bg-blue-500/10",
      iconText: "text-blue-500",
      hoverBorder: "hover:border-blue-500/40",
      activeAccent: "bg-blue-600",
      activeBadgeBg: "bg-blue-500/10",
      activeBadgeText: "text-blue-400",
      activeBadgeBorder: "border-blue-500/20",
      buttonHover: "hover:bg-blue-600",
    },
  },
  {
    title: "Wholesale B2B",
    description:
      "Bulk commerce infrastructure with warehouse logistics and tiered pricing.",
    type: "WHOLESALE_B2B",
    icon: Truck,
    styles: {
      glow: "bg-amber-500/10",
      iconBg: "bg-amber-500/10",
      iconText: "text-amber-500",
      hoverBorder: "hover:border-amber-500/40",
      activeAccent: "bg-amber-500",
      activeBadgeBg: "bg-amber-500/10",
      activeBadgeText: "text-amber-400",
      activeBadgeBorder: "border-amber-500/20",
      buttonHover: "hover:bg-amber-500",
    },
  },
  {
    title: "Quick Commerce",
    description:
      "10-minute dark store operations with live rider routing and instant dispatch.",
    type: "QUICK_COMMERCE",
    icon: Zap,
    styles: {
      glow: "bg-teal-500/10",
      iconBg: "bg-teal-500/10",
      iconText: "text-teal-500",
      hoverBorder: "hover:border-teal-500/40",
      activeAccent: "bg-teal-600",
      activeBadgeBg: "bg-teal-500/10",
      activeBadgeText: "text-teal-400",
      activeBadgeBorder: "border-teal-500/20",
      buttonHover: "hover:bg-teal-600",
    },
  },
  {
    title: "Home Essentials",
    description: "Daily household and grocery commerce ecosystem.",
    type: "HOME_ESSENTIALS",
    icon: Home,
    styles: {
      glow: "bg-orange-500/10",
      iconBg: "bg-orange-500/10",
      iconText: "text-orange-500",
      hoverBorder: "hover:border-orange-500/40",
      activeAccent: "bg-orange-500",
      activeBadgeBg: "bg-orange-500/10",
      activeBadgeText: "text-orange-400",
      activeBadgeBorder: "border-orange-500/20",
      buttonHover: "hover:bg-orange-500",
    },
  },
  {
    title: "Electronics",
    description:
      "Technical gadgets and high-value electronic inventory management.",
    type: "ELECTRONICS",
    icon: Cpu,
    styles: {
      glow: "bg-purple-500/10",
      iconBg: "bg-purple-500/10",
      iconText: "text-purple-500",
      hoverBorder: "hover:border-purple-500/40",
      activeAccent: "bg-purple-600",
      activeBadgeBg: "bg-purple-500/10",
      activeBadgeText: "text-purple-400",
      activeBadgeBorder: "border-purple-500/20",
      buttonHover: "hover:bg-purple-600",
    },
  },
  {
    title: "Personal Care",
    description:
      "Beauty, wellness and self-care commerce infrastructure.",
    type: "PERSONAL_CARE",
    icon: Heart,
    styles: {
      glow: "bg-rose-500/10",
      iconBg: "bg-rose-500/10",
      iconText: "text-rose-500",
      hoverBorder: "hover:border-rose-500/40",
      activeAccent: "bg-rose-500",
      activeBadgeBg: "bg-rose-500/10",
      activeBadgeText: "text-rose-400",
      activeBadgeBorder: "border-rose-500/20",
      buttonHover: "hover:bg-rose-500",
    },
  },
];

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

  const { fetchAllNodes, nodes, isLoading, error, clearActiveNode } =
    useNodeStore();

  const [activeWizard, setActiveWizard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ----------------------------------------------------------
     FETCH NODES
  ---------------------------------------------------------- */
  const loadNodes = useCallback(async () => {
    setRefreshing(true);
    await fetchAllNodes();
    setRefreshing(false);
  }, [fetchAllNodes]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/seller-auth", { replace: true });
      return;
    }
    loadNodes();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  const getExistingNode = (type) =>
    nodes.find((n) => n.nodeType === type) || null;

  const activeNodesCount = nodes.length;

  /* ----------------------------------------------------------
     WIZARD SUCCESS
  ---------------------------------------------------------- */
  const handleWizardSuccess = (nodeType, returnedNode) => {
    // Reload all nodes to refresh state
    loadNodes();
    setActiveWizard(null);
    // Navigate to the new node dashboard
    if (returnedNode?._id) {
      setTimeout(() => {
        navigate(`/seller/dashboard/${returnedNode._id}/dashboard`);
      }, 600);
    }
  };

  /* ----------------------------------------------------------
     LOGOUT
  ---------------------------------------------------------- */
  const handleLogout = async () => {
    try {
      await Promise.allSettled([
        logout(),
        logoutCustomer()
      ]);
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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">
            Loading Seller Hub...
          </p>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------
     UI
  ---------------------------------------------------------- */
  return (
    <div className="bg-[#050505] min-h-screen text-zinc-400 font-sans selection:bg-blue-500 selection:text-white">
      <WebsiteNavbar />

      <main className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <Briefcase size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Multi-Node Ecosystem
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh */}
              <button
                onClick={loadNodes}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                <RefreshCw
                  size={12}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-bold transition-all"
              >
                <LogOut size={12} />
                Logout
              </button>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-3">
            Seller{" "}
            <span className="text-zinc-700 italic">Hub.</span>
          </h1>

          <p className="text-zinc-500 text-lg font-medium max-w-2xl leading-relaxed">
            Welcome back,{" "}
            <span className="text-zinc-300">
              {user?.firstName || "Seller"}
            </span>
            . Manage all your business operations from one unified command center.
          </p>
        </div>

        {/* =====================================================
            SUMMARY BAR
        ===================================================== */}
        {activeNodesCount > 0 && (
          <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-1">
                Active Nodes
              </p>
              <p className="text-3xl font-black text-white">
                {activeNodesCount}
              </p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-1">
                Available Nodes
              </p>
              <p className="text-3xl font-black text-white">
                {NODE_DEFINITIONS.length - activeNodesCount}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex items-center gap-3">
              <Activity size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-1">
                  Status
                </p>
                <p className="text-sm font-black text-emerald-400">
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
          <div className="mb-8 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {NODE_DEFINITIONS.map((node) => {
            const existingNode = getExistingNode(node.type);
            const isActive = !!existingNode;
            const Icon = node.icon;

            return (
              <div
                key={node.type}
                className={`bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-7 flex flex-col relative overflow-hidden transition-all duration-300 ${node.styles.hoverBorder} ${
                  isActive ? "shadow-lg" : ""
                }`}
              >
                {/* GLOW */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${node.styles.glow} rounded-full blur-[60px] pointer-events-none`}
                />

                {/* HEADER */}
                <div className="flex items-center justify-between mb-7">
                  <div
                    className={`w-12 h-12 rounded-2xl ${node.styles.iconBg} flex items-center justify-center ${node.styles.iconText} shrink-0`}
                  >
                    <Icon size={22} />
                  </div>

                  {isActive ? (
                    <span
                      className={`px-2.5 py-1 ${node.styles.activeBadgeBg} ${node.styles.activeBadgeText} text-[10px] font-black uppercase rounded-full border ${node.styles.activeBadgeBorder} flex items-center gap-1`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase rounded-full border border-zinc-700">
                      Inactive
                    </span>
                  )}
                </div>

                {/* BODY */}
                <h3 className="text-xl font-black text-white tracking-tight mb-2">
                  {node.title}
                </h3>

                <p className="text-sm font-medium text-zinc-500 mb-6 leading-relaxed flex-1">
                  {node.description}
                </p>

                {/* STORE NAME (if active) */}
                {isActive && existingNode?.storeName && (
                  <div className="mb-4 px-3 py-2 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">
                      Store
                    </p>
                    <p className="text-sm font-bold text-zinc-300 truncate">
                      {existingNode.storeName}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-auto">
                  {isActive ? (
                    <Link
                      to={`/seller/dashboard/${existingNode._id}/dashboard`}
                      className={`w-full py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 ${node.styles.buttonHover} hover:text-white transition-all shadow-lg`}
                    >
                      Enter Dashboard
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => setActiveWizard(node.type)}
                      className="w-full py-4 bg-zinc-800 text-white rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all border border-zinc-700"
                    >
                      <Plus size={14} />
                      Activate Node
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================
            ACTIVE NODES QUICK SWITCH
        ===================================================== */}
        {activeNodesCount > 0 && (
          <div className="mt-12 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white">
                Quick Switch
              </h2>
              <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                {activeNodesCount} Active Node{activeNodesCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nodes.map((n) => {
                const def = NODE_DEFINITIONS.find((d) => d.type === n.nodeType);
                if (!def) return null;
                const Icon = def.icon;
                return (
                  <Link
                    key={n._id}
                    to={`/seller/dashboard/${n._id}/dashboard`}
                    className="flex items-center gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-2xl transition-all group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${def.styles.iconBg} flex items-center justify-center ${def.styles.iconText} shrink-0`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {n.storeName || def.title}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        {def.title}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================
            SECURITY FOOTER
        ===================================================== */}
        <div className="mt-16 pt-8 border-t border-zinc-900 flex items-center justify-center gap-2 text-zinc-600">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Isolated Node Architecture • Enterprise Ready • Multi-Node Ecosystem
          </span>
        </div>
      </main>

      <Footer />

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