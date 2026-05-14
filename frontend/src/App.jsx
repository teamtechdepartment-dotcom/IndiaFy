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

import { useAuthStore } from "./store/authStore";
import { useSellerAuthStore } from "./store/sellerAuthStore";
import { useCartStore } from "./store/cartStore";
import { useProfileStore } from "./store/profileStore";
import { useProductStore } from "./store/productStore";

/* =========================================================
   LAYOUTS
========================================================= */

import WebsiteLayout from "./components/WebsiteLayout";
import DashboardLayout from "./components/DashboardLayout";
import SellerDashboardWrapper from "./pages/seller/components/SellerDashboardWrapper";

/* =========================================================
   LOADER
========================================================= */

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
        Loading...
      </p>
    </div>
  </div>
);

/* =========================================================
   PUBLIC PAGES
========================================================= */

const Home = lazy(() => import("./pages/public/Home"));
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
const NotFound = lazy(() => import("./pages/public/NotFound"));

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
const SellerAuth = lazy(() => import("./pages/auth/SellerAuth"));
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
    if (customerUser?.role?.toLowerCase() === "customer") {
      fetchCart();
      fetchProfile();
    }
  }, [customerUser?.role, fetchCart, fetchProfile]);

  const initializeSeller = useCallback(() => {
    if (
      sellerUser?.role?.toLowerCase() === "seller" &&
      sellerUser?._id
    ) {
      fetchProducts("", "", sellerUser._id);
    }
  }, [sellerUser?.role, sellerUser?._id, fetchProducts]);

  useEffect(() => {
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

      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* =====================================================
              PUBLIC WEBSITE
          ===================================================== */}

          <Route element={<WebsiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/wholesale" element={<Wholesalepage />} />
            <Route path="/quick-commerce" element={<QuickCommerce />} />
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
          </Route>

          {/* Marketplace stores page — has its own Navbar/Footer */}
          <Route path="/stores" element={<Stores />} />

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
            path="/seller-auth"
            element={
              // Wait for auth init before deciding to redirect
              // This prevents stale persisted isAuthenticated from causing incorrect redirect
              !authReady
                ? <PageLoader />
                : (isSellerAuthenticated && sellerUser?._id)
                  ? <Navigate to="/seller-hub" replace />
                  : <SellerAuth />
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

              <Route path="dashboard" element={<Dashboard />} />
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

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
          </Route>

          {/* =====================================================
              404
          ===================================================== */}

          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}