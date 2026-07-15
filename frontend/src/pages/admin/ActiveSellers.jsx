import React, { useState, useEffect } from 'react';
import {
  Search, Store, ShieldCheck, Star, ExternalLink, Filter, MoreVertical,
  XCircle, SearchX, CheckCircle, Ban, AlertTriangle, RefreshCw, Eye, Settings
} from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function ActiveSellers() {
  const [sellers, setSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal Profile Details State
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/sellers");
      const raw = res?.data?.sellers ?? res?.data ?? res ?? [];
      const safeData = Array.isArray(raw) ? raw : [];
      setSellers(safeData);
    } catch (_err) {
      console.error("Error fetching sellers:", _err);
      setError("Failed to load platform sellers list.");
      toast.error("Failed to load platform sellers");
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!id) return;
    try {
      await axiosInstance.put(`/admin/management/sellers/${id}/status`, { status });
      toast.success(`Seller status updated to ${status}`);
      fetchSellers();
    } catch (_err) {
      toast.error("Failed to modify seller status");
    }
  };

  const handleAdjustCommission = async (id, commissionRate) => {
    if (!id) return;
    try {
      await axiosInstance.put(`/admin/management/sellers/${id}/status`, { commissionRate });
      toast.success("Seller commission rate updated successfully");
      fetchSellers();
    } catch (_err) {
      toast.error("Failed to adjust commission");
    }
  };

  const safeSellers = Array.isArray(sellers) ? sellers : [];

  const filteredSellers = safeSellers.filter((seller) => {
    if (!seller) return false;

    const query = (searchQuery ?? "").toLowerCase().trim();
    
    // Check multiple matching fields
    const matchesSearch =
      !query ||
      (seller.businessName ?? "").toLowerCase().includes(query) ||
      (seller.firstName ?? "").toLowerCase().includes(query) ||
      (seller.lastName ?? "").toLowerCase().includes(query) ||
      (seller.email ?? "").toLowerCase().includes(query) ||
      (seller.phone ?? "").toLowerCase().includes(query) ||
      (seller._id ?? "").toLowerCase().includes(query);

    const sType = (seller.sellerType ?? "").toLowerCase();
    const matchesCategory =
      activeCategoryFilter === 'All' || sType === activeCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen font-sans selection:bg-orange-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#2874F0] dark:text-[#FB641B] bg-[#2874F0]/10 dark:bg-orange-500/10 border border-[#2874F0]/20 dark:border-orange-500/20 mb-2">
                  <ShieldCheck size={13} /> Platform Sellers
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Active Sellers</h1>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
                  Manage storefront permissions, adjust commission percentages, and monitor compliance records.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={fetchSellers}
                  className="admin-btn-secondary p-3 flex items-center justify-center cursor-pointer"
                  title="Refresh Seller List"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin text-[#2874F0] dark:text-[#FB641B]" : ""} />
                </button>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#2874F0] transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by store name, owner, or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold rounded-2xl bg-white/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-100 transition-all focus:outline-none focus:border-[#2874F0] focus:ring-4 focus:ring-[#2874F0]/10 placeholder-slate-400 dark:placeholder-slate-600"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650">
                      <XCircle size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['All', 'Retailer', 'Wholesaler', 'Manufacturer', 'Brand'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeCategoryFilter === cat
                      ? "bg-[#2874F0] dark:bg-[#FB641B] text-white shadow-sm"
                      : "bg-white/60 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Error Notification */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={fetchSellers} className="underline hover:text-red-600 cursor-pointer">Retry</button>
              </div>
            )}

            {/* Sellers Table Wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load platform sellers directory">
              {/* Desktop Table View */}
              <div className="hidden lg:block admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="py-4 px-6">Merchant & Store</th>
                      <th className="py-4 px-6">Category / Type</th>
                      <th className="py-4 px-6 text-center">Commission Rate</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-center">Joined Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/20">
                    {loading ? (
                      [1, 2, 3, 4].map((idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                              <div className="space-y-1">
                                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                                <div className="w-20 h-2 bg-slate-100 dark:bg-slate-900 rounded" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6"><div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                          <td className="py-4 px-6 text-center"><div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                          <td className="py-4 px-6 text-center"><div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded-md mx-auto" /></td>
                          <td className="py-4 px-6 text-center"><div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                          <td className="py-4 px-6 text-right"><div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredSellers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-slate-600 font-bold text-sm">
                          No active sellers found.
                        </td>
                      </tr>
                    ) : (
                      filteredSellers.map((seller) => {
                        const sId = seller?._id || Math.random().toString();
                        const bName = seller?.businessName ?? "No Store Linked";
                        const fName = seller?.firstName ?? "Merchant";
                        const email = seller?.email ?? "No Email";
                        const commission = seller?.commissionRate ?? 5.0;
                        const isApproved = seller?.status === "Approved" || seller?.status === "Active" || seller?.status === "Verified";
                        const joinedDate = seller?.joined ? new Date(seller.joined).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A";
                        const storeLogo = seller?.store?.logo;

                        return (
                          <tr key={sId} className="admin-table-row">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-orange-500/10 text-[#2874F0] dark:text-[#FB641B] font-black flex items-center justify-center border border-blue-500/15 dark:border-orange-500/15 shrink-0 text-sm overflow-hidden">
                                  {storeLogo ? (
                                    <img src={storeLogo} alt="Store logo" className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{bName[0]?.toUpperCase() ?? "S"}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-extrabold text-slate-900 dark:text-slate-200 text-sm">{bName}</p>
                                    {seller?.verifiedBadge && (
                                      <ShieldCheck size={14} className="text-[#2874F0] dark:text-[#FB641B]" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{fName} • {email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">
                              {seller?.sellerType ?? "Retailer"}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-350 rounded-lg font-black text-xs">
                                  {commission}%
                                </span>
                                <button
                                  onClick={() => {
                                    const rate = prompt(`Adjust commission rate for "${bName}" (%):`, commission);
                                    if (rate !== null && !isNaN(rate) && rate.trim() !== "") {
                                      handleAdjustCommission(seller._id, parseFloat(rate));
                                    }
                                  }}
                                  className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                                  title="Adjust Commission Rate"
                                >
                                  <Settings size={12} />
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                isApproved
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                                  : "bg-orange-500/10 text-orange-500 border-orange-500/25"
                              }`}>
                                {seller?.status ?? "Active"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-455 text-[11px] font-bold">
                              {joinedDate}
                            </td>
                            <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => { setSelectedSeller(seller); setModalOpen(true); }}
                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-[#2874F0] dark:text-blue-400 border border-blue-500/25 rounded-xl text-[10px] font-bold transition flex-inline items-center gap-1 cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(seller?._id, isApproved ? "Suspended" : "Active")}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                                  isApproved
                                    ? "bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/20"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20"
                                }`}
                              >
                                {isApproved ? "Suspend" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Stacked Cards View */}
              <div className="block lg:hidden space-y-4">
                {loading ? (
                  [1, 2].map((idx) => (
                    <div key={idx} className="admin-card p-5 animate-pulse space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                        <div className="space-y-1">
                          <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-900 rounded" />
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                  ))
                ) : filteredSellers.length === 0 ? (
                  <div className="admin-card p-8 text-center text-slate-400 dark:text-slate-655 font-bold">
                    No active sellers found.
                  </div>
                ) : (
                  filteredSellers.map((seller) => {
                    const sId = seller?._id || Math.random().toString();
                    const bName = seller?.businessName ?? "No Store Linked";
                    const fName = seller?.firstName ?? "Merchant";
                    const email = seller?.email ?? "No Email";
                    const commission = seller?.commissionRate ?? 5.0;
                    const isApproved = seller?.status === "Approved" || seller?.status === "Active" || seller?.status === "Verified";
                    const storeLogo = seller?.store?.logo;

                    return (
                      <div key={sId} className="admin-card p-5 space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-orange-500/10 text-[#2874F0] dark:text-[#FB641B] font-black flex items-center justify-center border border-blue-500/15 dark:border-orange-500/15 shrink-0 text-sm overflow-hidden">
                              {storeLogo ? (
                                <img src={storeLogo} alt="Store logo" className="w-full h-full object-cover" />
                              ) : (
                                <span>{bName[0]?.toUpperCase() ?? "S"}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-extrabold text-slate-900 dark:text-slate-200 text-sm">{bName}</p>
                                {seller?.verifiedBadge && (
                                  <ShieldCheck size={14} className="text-[#2874F0] dark:text-[#FB641B]" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">{fName} • {email}</p>
                            </div>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                              : "bg-orange-500/10 text-orange-500 border-orange-500/25"
                          }`}>
                            {seller?.status ?? "Active"}
                          </span>
                        </div>

                        {/* Metadata fields */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 dark:bg-slate-955/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Commission</p>
                            <p className="font-bold text-slate-800 dark:text-slate-350 mt-0.5">{commission}%</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Type</p>
                            <p className="font-bold text-slate-800 dark:text-slate-350 mt-0.5">{seller?.sellerType ?? "Retailer"}</p>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2 pt-1.5">
                          <button
                            onClick={() => { setSelectedSeller(seller); setModalOpen(true); }}
                            className="flex-1 px-3 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-[#2874F0] dark:text-blue-400 border border-blue-500/25 rounded-xl text-[10px] font-black uppercase tracking-widest transition text-center cursor-pointer"
                          >
                            View Profile Details
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(seller?._id, isApproved ? "Suspended" : "Active")}
                            className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition cursor-pointer ${
                              isApproved
                                ? "bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20"
                            }`}
                          >
                            {isApproved ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </AdminErrorBoundary>

          </div>
        </main>
      </div>

      {/* Seller Details Glassmorphism Modal */}
      <AnimatePresence>
        {modalOpen && selectedSeller && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setModalOpen(false); setSelectedSeller(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="admin-card relative w-full max-w-4xl max-h-[85vh] overflow-y-auto admin-scrollbar p-6 z-10 bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/50 dark:border-slate-800/40 rounded-[28px] text-slate-800 dark:text-slate-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/20 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-orange-500/10 text-[#2874F0] dark:text-[#FB641B] font-black flex items-center justify-center border border-blue-500/15 dark:border-orange-500/15 shrink-0 text-lg overflow-hidden">
                    {selectedSeller.store?.logo ? (
                      <img src={selectedSeller.store.logo} alt="Store logo" className="w-full h-full object-cover" />
                    ) : (
                      <span>{selectedSeller.businessName[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedSeller.businessName}
                      {selectedSeller.verifiedBadge && (
                        <ShieldCheck size={18} className="text-[#2874F0] dark:text-[#FB641B]" />
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">
                      ID: {selectedSeller._id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setModalOpen(false); setSelectedSeller(null); }}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-650 cursor-pointer"
                >
                  <XCircle size={22} />
                </button>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Primary Details */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-[#2874F0] dark:text-[#FB641B] border-b border-slate-100 dark:border-slate-800/60 pb-1">
                    Merchant Contacts
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <span className="text-slate-450 dark:text-slate-500 font-bold">Owner Name:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-semibold">{selectedSeller.firstName} {selectedSeller.lastName}</span>

                    <span className="text-slate-455 dark:text-slate-500 font-bold">Email Address:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-semibold">{selectedSeller.email}</span>

                    <span className="text-slate-455 dark:text-slate-500 font-bold">Phone Number:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-semibold">{selectedSeller.phone}</span>

                    <span className="text-slate-455 dark:text-slate-500 font-bold">Physical Address:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-semibold">{selectedSeller.address}</span>
                  </div>
                </div>

                {/* Business Governance */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-[#2874F0] dark:text-[#FB641B] border-b border-slate-100 dark:border-slate-800/60 pb-1">
                    Legal & Operations
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <span className="text-slate-455 dark:text-slate-500 font-bold">GSTIN/Tax ID:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-semibold uppercase">{selectedSeller.gstin}</span>

                    <span className="text-slate-455 dark:text-slate-500 font-bold">PAN Number:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-semibold uppercase">{selectedSeller.panNumber}</span>

                    <span className="text-slate-455 dark:text-slate-500 font-bold">Merchant Type:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-semibold">{selectedSeller.sellerType}</span>

                    <span className="text-slate-455 dark:text-slate-500 font-bold">Commission Rate:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-extrabold">{selectedSeller.commissionRate}%</span>

                    <span className="text-slate-455 dark:text-slate-500 font-bold">Catalog Count:</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-300 font-bold">{selectedSeller.productsCount} active listings</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {selectedSeller.categories && selectedSeller.categories.length > 0 && (
                <div className="mb-6 space-y-2">
                  <h3 className="font-extrabold text-sm text-[#2874F0] dark:text-[#FB641B] border-b border-slate-100 dark:border-slate-800/60 pb-1">
                    Linked Product Categories
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedSeller.categories.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black rounded-lg uppercase tracking-wider">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Compliance Documents */}
              <div className="space-y-4 mb-6">
                <h3 className="font-extrabold text-sm text-[#2874F0] dark:text-[#FB641B] border-b border-slate-100 dark:border-slate-800/60 pb-1">
                  Legal Compliance Documentation
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(selectedSeller.documents || {}).map(([key, url]) => {
                    if (!url) return null;
                    const labelMap = {
                      aadhaarFront: "Aadhaar Front",
                      aadhaarBack: "Aadhaar Back",
                      panCard: "PAN Card Document",
                      gstCertificate: "GST Certificate",
                      cancelledCheque: "Cancelled Cheque",
                      bankStatement: "Bank Statement",
                    };
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl flex flex-col items-center justify-between text-center group hover:bg-[#2874F0]/5 dark:hover:bg-orange-500/5 transition-all text-xs font-bold"
                      >
                        <ExternalLink size={16} className="text-slate-400 group-hover:text-[#2874F0] dark:group-hover:text-[#FB641B] mb-2" />
                        <span className="text-slate-600 dark:text-slate-300">{labelMap[key] || key}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Store Photos */}
              {selectedSeller.storePhotos && selectedSeller.storePhotos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-sm text-[#2874F0] dark:text-[#FB641B] border-b border-slate-100 dark:border-slate-800/60 pb-1">
                    Storefront Images
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedSeller.storePhotos.map((url, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-slate-250 dark:border-slate-800 h-36">
                        <img src={url} alt={`Store interior ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}