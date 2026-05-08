import React, { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { useSellerAuthStore } from "./store/sellerAuthStore";
import { useCartStore } from "./store/cartStore";
import { useProfileStore } from "./store/profileStore";
import { useProductStore } from "./store/productStore";

// ================= LAYOUTS (eagerly loaded - needed for initial render) =================
import WebsiteLayout from "./components/WebsiteLayout";
import DashboardLayout from "./components/DashboardLayout";

// ================= LOADING FALLBACK =================
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-50" role="status" aria-label="Loading page">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading...</p>
    </div>
  </div>
);

// ================= LAZY-LOADED PUBLIC PAGES (code splitting) =================
const Home = lazy(() => import("./pages/public/Home"));
const About = lazy(() => import("./pages/public/About"));
const Wholesalepage = lazy(() => import("./pages/public/Wholesalepage"));
const QuickCommerce = lazy(() => import("./pages/public/QuickCommerce"));
const LocalSellers = lazy(() => import("./pages/public/LocalSellers"));
const Productdetailpage = lazy(() => import("./pages/public/Productdetailpage"));
const Categorylistingpage = lazy(() => import("./pages/public/Categorylistingpage"));
const Searchresultspage = lazy(() => import("./pages/public/Searchresultspage"));
const Storepage = lazy(() => import("./pages/public/StorePage"));
const PrivacyPolicy = lazy(() => import("./pages/public/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/public/TermsAndConditions"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

// ================= LAZY-LOADED CUSTOMER PAGES =================
const Cartpage = lazy(() => import("./pages/customer/Cartpage"));
const Checkoutpage = lazy(() => import("./pages/customer/Checkoutpage"));
const Paymentpage = lazy(() => import("./pages/customer/Paymentpage"));
const Ordersuccesspage = lazy(() => import("./pages/customer/Ordersuccesspage"));
const Customerprofile = lazy(() => import("./pages/customer/Customerprofile"));
const Savedaddresses = lazy(() => import("./pages/customer/Savedaddresses"));
const Orderhistorypage = lazy(() => import("./pages/customer/Orderhistorypage"));
const Ordertrackingpage = lazy(() => import("./pages/customer/Ordertrackingpage"));
const Customersupport = lazy(() => import("./pages/customer/Customersupport"));

// ================= LAZY-LOADED AUTH PAGES =================
const UserAuth = lazy(() => import("./pages/auth/UserSignup"));
const UserLogin = lazy(() => import("./pages/auth/UserLogin"));
const SellerAuth = lazy(() => import("./pages/auth/SellerAuth"));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));

// ================= LAZY-LOADED SELLER DASHBOARD =================
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

// ================= LAZY-LOADED ADMIN PAGES =================
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminInventory = lazy(() => import("./pages/admin/Inventory"));
const ProductManagement = lazy(() => import("./pages/admin/ProductManagement"));
const AdminOrderManagement = lazy(() => import("./pages/admin/OrderManagement"));
const OrderDetail = lazy(() => import("./pages/admin/OrderDetail"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const Payments = lazy(() => import("./pages/admin/Payment"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));
const Coupons = lazy(() => import("./pages/admin/Coupons"));
const CustomerManagement = lazy(() => import("./pages/admin/CustomerManagement"));
const PendingApplications = lazy(() => import("./pages/admin/PendingApplications"));
const ActiveSellers = lazy(() => import("./pages/admin/ActiveSellers"));

export default function App() {
  const { user: customerUser, fetchMe: fetchCustomer, isAuthenticated: isCustomerAuthenticated } = useAuthStore();
  const { user: sellerUser, fetchMe: fetchSeller, isAuthenticated: isSellerAuthenticated } = useSellerAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchProfile } = useProfileStore();
  const { fetchProducts } = useProductStore();
  
  // --- ISOLATED NODE SETTINGS STATE ---
  const defaultSettings = {
    initials: "S",
    logo: null,
    email: "",
    phone: "",
    address: "",
    gstin: "",
    accountName: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    orderAlerts: true,
    autoAccept: false,
    promotionalEmails: true,
    isStoreOpen: true,
    isDeactivated: false,
  };

  const [nodeSettings, setNodeSettings] = useState({
    local: { ...defaultSettings, name: "Local Retail Store" },
    wholesale: { ...defaultSettings, name: "Wholesale B2B Store" },
    "quick-commerce": { ...defaultSettings, name: "Quick Commerce Store" },
    "home-essentials": { ...defaultSettings, name: "Home Essentials Store" },
    electronics: { ...defaultSettings, name: "Electronics Store" },
    "personal-care": { ...defaultSettings, name: "Personal Care Store" },
  });

  const updateNodeSettings = (nodeType, newSettings) => {
    setNodeSettings(prev => ({
      ...prev,
      [nodeType]: typeof newSettings === 'function' ? newSettings(prev[nodeType]) : newSettings
    }));
  };

  // Memoized init function to avoid re-creation on every render
  const initializeCustomer = useCallback(() => {
    if (customerUser?.role?.toLowerCase() === 'customer') {
      fetchCart();
      fetchProfile();
    }
  }, [customerUser?.role, fetchCart, fetchProfile]);

  const initializeSeller = useCallback(() => {
    if (sellerUser?.role?.toLowerCase() === 'seller' && sellerUser?._id) {
      fetchProducts('', '', sellerUser._id);
    }
  }, [sellerUser?.role, sellerUser?._id, fetchProducts]);

  useEffect(() => {
    fetchCustomer("customer");
    fetchSeller("seller");
  }, []);

  useEffect(() => {
    initializeCustomer();
  }, [initializeCustomer]);

  useEffect(() => {
    initializeSeller();
  }, [initializeSeller]);

  // Update isolated node details when user changes
  useEffect(() => {
    if (sellerUser && sellerUser.role?.toLowerCase() === 'seller') {
      const baseDetails = {
        email: sellerUser.email,
        logo: sellerUser.logo,
        address: sellerUser.address,
        city: sellerUser.city,
        gstin: sellerUser.gstin,
        accountName: sellerUser.accountName,
        accountNumber: sellerUser.accountNumber,
        ifsc: sellerUser.ifsc,
        bankName: sellerUser.bankName
      };

      setNodeSettings(prev => ({
        local: { ...prev.local, ...baseDetails, name: sellerUser.businessName ? `${sellerUser.businessName} (Retail)` : "Local Retail Store" },
        wholesale: { ...prev.wholesale, ...baseDetails, name: sellerUser.businessName ? `${sellerUser.businessName} (B2B)` : "Wholesale B2B Store" },
        "quick-commerce": { ...prev["quick-commerce"], ...baseDetails, name: sellerUser.businessName ? `${sellerUser.businessName} (Quick)` : "Quick Commerce Store" },
        "home-essentials": { ...prev["home-essentials"], ...baseDetails, name: sellerUser.businessName ? `${sellerUser.businessName} (Home)` : "Home Essentials Store" },
        electronics: { ...prev.electronics, ...baseDetails, name: sellerUser.businessName ? `${sellerUser.businessName} (Tech)` : "Electronics Store" },
        "personal-care": { ...prev["personal-care"], ...baseDetails, name: sellerUser.businessName ? `${sellerUser.businessName} (Care)` : "Personal Care Store" }
      }));
    }
  }, [sellerUser]);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ================= PUBLIC WEBSITE ROUTES ================= */}
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

            {/* Customer Profile Routes */}
            <Route element={<ProtectedRoute allowedRoles={["customer", "seller"]} />}>
              <Route path="/profile" element={<Customerprofile />} />
              <Route path="/addresses" element={<Savedaddresses />} />
              <Route path="/order-history" element={<Orderhistorypage />} />
              <Route path="/track-order/:orderId" element={<Ordertrackingpage />} />
              <Route path="/support" element={<Customersupport />} />
            </Route>
          </Route>

          {/* ================= STANDALONE AUTH ROUTE ================= */}
          <Route path="/seller-auth" element={
            isSellerAuthenticated ? <Navigate to="/seller-hub" replace /> : <SellerAuth />
          } />

          {/* ================= SELLER DASHBOARD ROUTES ================= */}
          <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
            <Route path="/seller-hub" element={<SellerHub />} />
            
            {/* --- LOCAL RETAIL NODE --- */}
            <Route path="/seller/local/*" element={
                <DashboardLayout storeDetails={nodeSettings.local} activeNode="local">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="live" element={<LiveOrders />} />
                    <Route path="products" element={<Products />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="history" element={<History />} />
                    <Route path="finance" element={<Finance />} />
                    <Route path="settings" element={<Settings storeDetails={nodeSettings.local} setStoreDetails={(s) => updateNodeSettings('local', s)} />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="video-verification/:id" element={<VideoVerification />} />
                    <Route path="*" element={<Navigate to="/seller/local/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
            } />

            {/* --- WHOLESALE NODE --- */}
            <Route path="/seller/wholesale/*" element={
                <DashboardLayout storeDetails={nodeSettings.wholesale} activeNode="wholesale">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="products" element={<Products />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="settings" element={<Settings storeDetails={nodeSettings.wholesale} setStoreDetails={(s) => updateNodeSettings('wholesale', s)} />} />
                    <Route path="*" element={<Navigate to="/seller/wholesale/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
            } />

            {/* --- QUICK COMMERCE NODE --- */}
            <Route path="/quick/*" element={
                <DashboardLayout storeDetails={nodeSettings["quick-commerce"]} activeNode="quick-commerce">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="products" element={<Products />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="settings" element={<Settings storeDetails={nodeSettings["quick-commerce"]} setStoreDetails={(s) => updateNodeSettings('quick-commerce', s)} />} />
                    <Route path="*" element={<Navigate to="/quick/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
            } />

            {/* --- HOME ESSENTIALS NODE --- */}
            <Route path="/seller/home/*" element={
                <DashboardLayout storeDetails={nodeSettings["home-essentials"]} activeNode="home-essentials">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="products" element={<Products />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="settings" element={<Settings storeDetails={nodeSettings["home-essentials"]} setStoreDetails={(s) => updateNodeSettings('home-essentials', s)} />} />
                    <Route path="*" element={<Navigate to="/seller/home/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
            } />

            {/* --- ELECTRONICS NODE --- */}
            <Route path="/seller/electronics/*" element={
                <DashboardLayout storeDetails={nodeSettings.electronics} activeNode="electronics">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="products" element={<Products />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="settings" element={<Settings storeDetails={nodeSettings.electronics} setStoreDetails={(s) => updateNodeSettings('electronics', s)} />} />
                    <Route path="*" element={<Navigate to="/seller/electronics/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
            } />

            {/* --- PERSONAL CARE NODE --- */}
            <Route path="/seller/personal-care/*" element={
                <DashboardLayout storeDetails={nodeSettings["personal-care"]} activeNode="personal-care">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="products" element={<Products />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="settings" element={<Settings storeDetails={nodeSettings["personal-care"]} setStoreDetails={(s) => updateNodeSettings('personal-care', s)} />} />
                    <Route path="*" element={<Navigate to="/seller/personal-care/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
            } />

            <Route path="*" element={<Navigate to="/seller-hub" replace />} />
          </Route>

          {/* User Auth */}
          <Route path="/signup" element={
            isCustomerAuthenticated ? <Navigate to="/" replace /> : <UserAuth />
          } />
          <Route path="/login" element={
            isCustomerAuthenticated ? <Navigate to="/" replace /> : <UserLogin />
          } />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Dashboard */}
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

          {/* Legal & Static standalone pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

          {/* Global 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
