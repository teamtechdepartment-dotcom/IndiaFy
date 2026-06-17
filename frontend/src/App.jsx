/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React, {
  lazy,
  Suspense,
  useEffect,
  useCallback,
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute";
import CookieConsent from "./components/CookieConsent";
import ErrorBoundary from "./components/ErrorBoundary";

import { useAuthStore } from "./store/authStore";
import { useSellerAuthStore } from "./store/sellerAuthStore";
import { useCartStore } from "./store/cartStore";
import { useProfileStore } from "./store/profileStore";
import { useProductStore } from "./store/productStore";
import axiosInstance from "./utils/axiosInstance";

/* =========================================================
   LAYOUTS
========================================================= */

import WebsiteLayout from "./components/WebsiteLayout";
import DashboardLayout from "./components/DashboardLayout";
import SellerDashboardWrapper from "./pages/seller/components/SellerDashboardWrapper";

import { Skeleton, SkeletonText } from "./components/ui/Skeleton";
import { HeroSkeleton } from "./components/ui/skeletons/HeroSkeleton";
import { WholesaleSkeleton } from "./components/ui/skeletons/WholesaleSkeleton";
import { ProductSkeleton } from "./components/ui/skeletons/ProductSkeleton";
import { BlogSkeleton } from "./components/ui/skeletons/BlogSkeleton";
import DashboardSkeleton from "./components/ui/skeletons/DashboardSkeleton";

const PageLoader = () => (
  <div className="min-h-screen pt-20 px-4 max-w-7xl mx-auto w-full space-y-8">
    <Skeleton className="w-1/3 h-12 mb-8" />
    <div className="space-y-4">
      <Skeleton className="w-full h-64 rounded-2xl" />
      <SkeletonText lines={4} />
    </div>
  </div>
);

/* =========================================================
   PUBLIC PAGES & COMPONENTS
========================================================= */

import Home from "./pages/public/Home";
const About = lazy(() => import("./pages/public/About"));
const Wholesalepage = lazy(() => import("./pages/public/Wholesalepage"));
const QuickCommerce = lazy(() => import("./pages/public/QuickCommerce"));
const LocalSellers = lazy(() => import("./pages/public/LocalSellers"));
const Productdetailpage = lazy(() => import("./pages/public/Productdetailpage"));
const Categorylistingpage = lazy(() => import("./pages/public/Categorylistingpage"));
const Searchresultspage = lazy(() => import("./pages/public/Searchresultspage"));
const Storepage = lazy(() => import("./pages/public/StorePage"));
const Stores = lazy(() => import("./pages/public/Stores"));
const PrivacyPolicy = lazy(() => import("./pages/public/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/public/TermsAndConditions"));
const Contact = lazy(() => import("./pages/public/Contact"));
const RefundPolicy = lazy(() => import("./pages/public/RefundPolicy"));
const SellerGuidelines = lazy(() => import("./pages/public/SellerGuidelines"));
const CommunityStandards = lazy(() => import("./pages/public/CommunityStandards"));
const TrustSafety = lazy(() => import("./pages/public/TrustSafety"));
const BecomeSellerInfo = lazy(() => import("./pages/public/BecomeSellerInfo"));
const HelpCenter = lazy(() => import("./pages/public/HelpCenter"));
const FAQ = lazy(() => import("./pages/public/FAQ"));

// ADDED: Quick Commerce Hero Component
const Hero = lazy(() => import("./components/QuickCommerce/Hero"));

/* =========================================================
   SEO LANDING PAGES
========================================================= */
const BestShoppingPlatform = lazy(() => import("./pages/public/seo/BestShoppingPlatform"));
const QuickCommerceSEO = lazy(() => import("./pages/public/seo/QuickCommerceSEO"));
const WholesaleSuppliersSEO = lazy(() => import("./pages/public/seo/WholesaleSuppliersSEO"));
const VerifiedSellersSEO = lazy(() => import("./pages/public/seo/VerifiedSellersSEO"));
const HyperlocalMarketplaceSEO = lazy(() => import("./pages/public/seo/HyperlocalMarketplaceSEO"));

/* =========================================================
   BLOG PAGES
========================================================= */
const BlogList = lazy(() => import("./pages/public/blog/BlogList"));
const BlogPost = lazy(() => import("./pages/public/blog/BlogPost"));

/* =========================================================
   ERROR PAGES
========================================================= */

const NotFound = lazy(() => import("./pages/errors/NotFound"));
const ServerError = lazy(() => import("./pages/errors/ServerError"));
const NetworkError = lazy(() => import("./pages/errors/NetworkError"));
const AccessDenied = lazy(() => import("./pages/errors/AccessDenied"));
const Maintenance = lazy(() => import("./pages/errors/Maintenance"));
const SessionExpired = lazy(() => import("./pages/errors/SessionExpired"));

/* =========================================================
   CUSTOMER PAGES
========================================================= */

const Cartpage = lazy(() => import("./pages/customer/Cartpage"));
const Checkoutpage = lazy(() => import("./pages/customer/Checkoutpage"));
const Paymentpage = lazy(() => import("./pages/customer/Paymentpage"));
const Ordersuccesspage = lazy(() => import("./pages/customer/Ordersuccesspage"));
const Customerprofile = lazy(() => import("./pages/customer/Customerprofile"));
const Savedaddresses = lazy(() => import("./pages/customer/Savedaddresses"));
const Orderhistorypage = lazy(() => import("./pages/customer/Orderhistorypage"));
const Ordertrackingpage = lazy(() => import("./pages/customer/Ordertrackingpage"));
const Customersupport = lazy(() => import("./pages/customer/Customersupport"));

/* =========================================================
   AUTH
========================================================= */

const UserAuth = lazy(() => import("./pages/auth/UserSignup"));
const UserLogin = lazy(() => import("./pages/auth/UserLogin"));
const SellerLogin = lazy(() => import("./pages/auth/SellerLogin"));
const SellerSignup = lazy(() => import("./pages/auth/SellerSignup"));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));

/* =========================================================
   SELLER PAGES
========================================================= */

const SellerHub = lazy(() => import("./pages/seller/SellerHub"));
const Dashboard = lazy(() => import("./pages/seller/Dashboard"));
const Orders = lazy(() => import("./pages/seller/Orders"));
const LiveOrders = lazy(() => import("./pages/seller/LiveOrders"));
const History = lazy(() => import("./pages/seller/History"));
const Products = lazy(() => import("./pages/seller/Products"));
const Inventory = lazy(() => import("./pages/seller/Inventory"));
const Finance = lazy(() => import("./pages/seller/Finance"));
const Settings = lazy(() => import("./pages/seller/Settings"));
const Notifications = lazy(() => import("./pages/seller/Notifications"));
const VideoVerification = lazy(() => import("./pages/seller/VideoVerification"));

/* =========================================================
   ADMIN PAGES
========================================================= */

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const CustomerManagement = lazy(() => import("./pages/admin/CustomerManagement"));
const AdminOrderManagement = lazy(() => import("./pages/admin/OrderManagement"));
const OrderDetail = lazy(() => import("./pages/admin/OrderDetail"));
const Payments = lazy(() => import("./pages/admin/Payment"));
const ProductManagement = lazy(() => import("./pages/admin/ProductManagement"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const AdminInventory = lazy(() => import("./pages/admin/Inventory"));
const ActiveSellers = lazy(() => import("./pages/admin/ActiveSellers"));
const PendingApplications = lazy(() => import("./pages/admin/PendingApplications"));
const StoreManagement = lazy(() => import("./pages/admin/StoreManagement"));
const CategoryManagement = lazy(() => import("./pages/admin/CategoryManagement"));
const SupportInbox = lazy(() => import("./pages/admin/SupportInbox"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));

/* =========================================================
   APP
========================================================= */

export default function App() {
  const {
    user: customerUser,
    fetchMe: fetchCustomer,
    isAuthenticated: isCustomerAuthenticated,
  } = useAuthStore();

  const {
    user: sellerUser,
    fetchMe: fetchSeller,
    isAuthenticated: isSellerAuthenticated,
  } = useSellerAuthStore();

  const { fetchCart } = useCartStore();
  const { fetchProfile } = useProfileStore();
  const { fetchProducts } = useProductStore();

  // Track whether auth init has completed so we don't redirect based on stale state
  const [authReady, setAuthReady] = useState(false);

  /* =========================================================
     INITIALIZATION
  ========================================================= */

  const initializeCustomer = useCallback(() => {
    if (authReady && customerUser?.role?.toLowerCase() === "customer") {
      fetchCart();
      fetchProfile();
    }
  }, [authReady, customerUser?.role, fetchCart, fetchProfile]);

  const initializeSeller = useCallback(() => {
    if (
      authReady &&
      sellerUser?.role?.toLowerCase() === "seller" &&
      sellerUser?._id
    ) {
      fetchProducts("", "", sellerUser._id);
    }
  }, [authReady, sellerUser?.role, sellerUser?._id, fetchProducts]);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        // Ping a lightweight endpoint to check availability
        // If your backend has a dedicated /health, use that, otherwise this will gracefully fail if offline
        await axiosInstance.get('/health');
      } catch (_error) {
        if (_error?.code === 'ERR_NETWORK') {
          toast.error("Backend server is offline. Running in degraded mode.", { id: 'backend-offline', duration: 8000 });
        }
      }
    };

    checkBackendHealth();

    // Run both fetchMe calls in parallel, then mark auth as ready
    Promise.allSettled([
      fetchCustomer("customer"),
      fetchSeller("seller"),
    ]).finally(() => {
      setAuthReady(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initializeCustomer();
  }, [initializeCustomer]);

  useEffect(() => {
    initializeSeller();
  }, [initializeSeller]);

  /* =========================================================
     ROUTES
  ========================================================= */

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <CookieConsent />

      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>

          {/* =====================================================
              PUBLIC WEBSITE
          ===================================================== */}

          <Route element={<WebsiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/wholesale" element={<Suspense fallback={<WholesaleSkeleton />}><Wholesalepage /></Suspense>} />
            <Route path="/cart" element={<Cartpage />} />
            <Route path="/checkout" element={<Checkoutpage />} />
            <Route path="/payment" element={<Paymentpage />} />
            <Route path="/order-success" element={<Ordersuccesspage />} />
            <Route path="/search" element={<Searchresultspage />} />
            <Route path="/local-sellers" element={<LocalSellers />} />
            <Route path="/product/:id" element={<Productdetailpage />} />
            <Route path="/category/:categoryName" element={<Categorylistingpage />} />
            <Route path="/store/:id" element={<Storepage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/seller-guidelines" element={<SellerGuidelines />} />
            <Route path="/community-standards" element={<CommunityStandards />} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            <Route path="/become-seller-info" element={<BecomeSellerInfo />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQ />} />

            {/* ADDED: Hero standalone preview route */}
            <Route path="/hero" element={<Suspense fallback={<HeroSkeleton />}><Hero /></Suspense>} />

            {/* =====================================================
                SEO LANDING PAGES
            ===================================================== */}
            <Route path="/best-shopping-platform-gurugram" element={<BestShoppingPlatform />} />
            <Route path="/quick-commerce-gurugram" element={<QuickCommerceSEO />} />
            <Route path="/wholesale-suppliers-gurugram" element={<WholesaleSuppliersSEO />} />
            <Route path="/verified-sellers-gurugram" element={<VerifiedSellersSEO />} />
            <Route path="/hyperlocal-marketplace-gurugram" element={<HyperlocalMarketplaceSEO />} />

            {/* =====================================================
                BLOG PAGES
            ===================================================== */}
            <Route path="/blog" element={<Suspense fallback={<BlogSkeleton />}><BlogList /></Suspense>} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Route>

          {/* Marketplace stores page — has its own Navbar/Footer */}
          <Route path="/stores" element={<Stores />} />

          {/* Quick Commerce — standalone app-like experience */}
          <Route path="/quick-commerce" element={<Suspense fallback={<div className="p-8 max-w-7xl mx-auto"><ProductSkeleton count={12} variant="grid" /></div>}><QuickCommerce /></Suspense>} />

          {/* =====================================================
              CUSTOMER (protected)
          ===================================================== */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["customer", "seller"]} />
            }
          >
            <Route path="/profile" element={<Customerprofile />} />
            <Route path="/addresses" element={<Savedaddresses />} />
            <Route path="/order-history" element={<Orderhistorypage />} />
            <Route path="/track-order/:orderId" element={<Ordertrackingpage />} />
            <Route path="/support" element={<Customersupport />} />
          </Route>

          {/* =====================================================
              AUTH
          ===================================================== */}

          <Route
            path="/signup"
            element={
              isCustomerAuthenticated
                ? <Navigate to="/" replace />
                : <UserAuth />
            }
          />

          <Route
            path="/login"
            element={
              isCustomerAuthenticated
                ? <Navigate to="/" replace />
                : <UserLogin />
            }
          />

          <Route
            path="/seller/login"
            element={
              !authReady
                ? <PageLoader />
                : (isSellerAuthenticated && sellerUser?._id)
                  ? <Navigate to="/seller-hub" replace />
                  : <SellerLogin />
            }
          />
          <Route
            path="/seller/signup"
            element={
              !authReady
                ? <PageLoader />
                : (isSellerAuthenticated && sellerUser?._id)
                  ? <Navigate to="/seller-hub" replace />
                  : <SellerSignup />
            }
          />

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* =====================================================
              SELLER (protected)
          ===================================================== */}

          <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>

            {/* Seller Hub — node switcher & creator */}
            <Route path="/seller-hub" element={<SellerHub />} />

            {/* -----------------------------------------------
                DYNAMIC MULTI-NODE DASHBOARD
                /seller/dashboard/:nodeId/*
                SellerDashboardWrapper fetches the node by ID,
                sets activeNode, then renders DashboardLayout
                which contains <Outlet> for child routes.
            ----------------------------------------------- */}
            <Route
              path="/seller/dashboard/:nodeId"
              element={<SellerDashboardWrapper />}
            >
              {/* Index → redirect to dashboard sub-route */}
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<Suspense fallback={<div className="p-6"><DashboardSkeleton /></div>}><Dashboard /></Suspense>} />
              <Route path="orders" element={<Orders />} />
              <Route path="live" element={<LiveOrders />} />
              <Route path="products" element={<Products />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="history" element={<History />} />
              <Route path="finance" element={<Finance />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="video-verification/:id" element={<VideoVerification />} />
            </Route>

          </Route>

          {/* =====================================================
              ADMIN
          ===================================================== */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Suspense fallback={<div className="p-6"><DashboardSkeleton /></div>}><AdminDashboard /></Suspense>} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            <Route path="/admin/orders" element={<AdminOrderManagement />} />
            <Route path="/admin/orders/:id" element={<OrderDetail />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/products" element={<ProductManagement />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profiles" element={<AdminProfile />} />
            <Route path="/admin/coupons" element={<Coupons />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/active-sellers" element={<ActiveSellers />} />
            <Route path="/admin/pending-applications" element={<PendingApplications />} />
            <Route path="/admin/stores" element={<StoreManagement />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/tickets" element={<SupportInbox />} />
            <Route path="/admin/roles" element={<RoleManagement />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
          </Route>

          {/* =====================================================
              ERRORS
          ===================================================== */}
          <Route path="/500" element={<ServerError />} />
          <Route path="/403" element={<AccessDenied />} />
          <Route path="/network-error" element={<NetworkError />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/session-expired" element={<SessionExpired />} />

          {/* =====================================================
              404
          ===================================================== */}

          <Route path="*" element={<NotFound />} />

        </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}