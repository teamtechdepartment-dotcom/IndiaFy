import React, { useState, useEffect } from 'react';
import { Search, Store, ShieldCheck, Star, ExternalLink, Filter, MoreVertical, XCircle, SearchX, CheckCircle, Ban, AlertTriangle } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ActiveSellers() {
  const [sellers, setSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/sellers");
      // res = { statusCode, data: sellers, message }
      const data = res.data || res;
      setSellers(data || []);
    } catch (_err) {
      toast.error("Failed to load platform sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/management/sellers/${id}/status`, { status });
      toast.success(`Seller status updated to ${status}`);
      // Refresh
      fetchSellers();
    } catch (_err) {
      toast.error("Failed to modify seller status");
    }
  };

  const handleAdjustCommission = async (id, commissionRate) => {
    try {
      await axiosInstance.put(`/admin/management/sellers/${id}/status`, { commissionRate });
      toast.success("Seller commission rate updated successfully");
      fetchSellers();
    } catch (_err) {
      toast.error("Failed to adjust commission");
    }
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller._id?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategoryFilter === 'All' || seller.sellerType === activeCategoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-2">
                  <ShieldCheck size={14} /> Platform Sellers
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Sellers</h1>
                <p className="text-slate-500 font-medium">
                  Manage storefront permissions, adjust commission percentages, and monitor merchant listings.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by store or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#D4AF37] rounded-2xl py-3.5 pl-12 pr-10 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm focus:ring-4 focus:ring-[#D4AF37]/5"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
                
                {/* Type Filter */}
                <div className="relative w-full sm:w-auto">
                  <select 
                    value={activeCategoryFilter}
                    onChange={(e) => setActiveCategoryFilter(e.target.value)}
                    className="w-full h-[50px] pl-10 pr-8 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-all focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="All">All Sellers</option>
                    <option value="Local">Local Retail</option>
                    <option value="Wholesale">Wholesale B2B</option>
                  </select>
                  <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* List / Table */}
            <div className="space-y-4">
              
              {/* Desktop Table Header */}
              {filteredSellers.length > 0 && (
                <div className="hidden xl:grid grid-cols-12 gap-6 px-8 pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <div className="col-span-3">Store Details</div>
                  <div className="col-span-2">Contact / Email</div>
                  <div className="col-span-2">Fulfillment Mode</div>
                  <div className="col-span-2">Security Risk Score</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2 text-right">Administrative Actions</div>
                </div>
              )}

              {loading ? (
                <div className="py-20 text-center text-slate-400 font-semibold">Loading merchant directories...</div>
              ) : filteredSellers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 border-dashed rounded-[2rem]">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <SearchX size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">No sellers registered</h3>
                  <p className="text-slate-500 max-w-sm">No storefront directory items matched the query.</p>
                </div>
              ) : (
                filteredSellers.map((seller) => (
                  <div key={seller._id} className="bg-white border border-slate-200 rounded-3xl p-6 xl:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col xl:grid xl:grid-cols-12 xl:items-center gap-6">
                    
                    {/* Store Info */}
                    <div className="col-span-3 flex items-center gap-5 w-full">
                      <div className="w-12 h-12 bg-[#0B1528] text-[#D4AF37] border border-[#D4AF37]/20 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-lg shadow-sm">
                        {seller.businessName?.charAt(0) || seller.firstName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight mb-0.5 truncate">{seller.businessName}</h3>
                        <p className="text-xs text-slate-400 font-medium truncate">Owner: {seller.firstName} {seller.lastName}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">{seller._id}</p>
                      </div>
                    </div>

                    {/* Email / Contact */}
                    <div className="col-span-2 flex flex-col text-xs text-slate-600 font-medium">
                      <span>{seller.email}</span>
                      <span className="text-slate-400 mt-0.5">{seller.phone}</span>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 flex items-center">
                      <span className="px-3.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {seller.sellerType || "local"}
                      </span>
                    </div>

                    {/* Performance Metrics */}
                    <div className="col-span-2 flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <span>GSTIN: {seller.gstin}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-md max-w-fit">
                        <AlertTriangle size={12} />
                        <span>Risk Score: {seller.riskScore}%</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-1 flex items-center">
                      <SellerStatus status={seller.verificationStatus} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-2.5 pt-6 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                      {seller.verificationStatus === "Verified" ? (
                        <button
                          onClick={() => handleUpdateStatus(seller._id, "Suspended")}
                          className="flex-1 xl:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 active:scale-95 transition"
                        >
                          <Ban size={14} /> Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(seller._id, "Verified")}
                          className="flex-1 xl:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 active:scale-95 transition"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          const rate = prompt("Enter Commission Rate percentage (e.g. 5.5):");
                          if (rate) handleAdjustCommission(seller._id, parseFloat(rate));
                        }}
                        className="px-3 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition active:scale-95"
                      >
                        Adjust Fee
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}

// Status Component
function SellerStatus({ status }) {
  let styles = '';
  let dot = '';
  switch(status) {
    case 'Verified': 
    case 'Approved':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500';
      break;
    case 'Pending': 
    case 'Under Review':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'Suspended': 
    case 'Rejected':
    case 'Banned':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      break;
    default: 
      styles = 'bg-slate-50 text-slate-700 border-slate-200';
      dot = 'bg-slate-500';
  }
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>
      {status}
    </span>
  );
}