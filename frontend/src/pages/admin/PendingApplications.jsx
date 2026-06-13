import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Eye, User, FileText, Store, Mail, Clock, XCircle, SearchX } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function PendingApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentOverlay, setDocumentOverlay] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/sellers");
      // filter only pending or under review
      const data = res.data || res;
      const pendings = (data || []).filter(
        (seller) => seller.verificationStatus === "Pending" || seller.verificationStatus === "Under Review"
      );
      setApplications(pendings);
    } catch (err) {
      toast.error("Failed to load seller applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/admin/management/sellers/${id}/status`, {
        status: "Verified",
      });
      toast.success("Merchant application approved!");
      fetchApplications();
    } catch (err) {
      toast.error("Approval action failed");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this merchant application?")) {
      try {
        await axiosInstance.put(`/admin/management/sellers/${id}/status`, {
          status: "Rejected",
        });
        toast.success("Merchant application rejected");
        fetchApplications();
      } catch (err) {
        toast.error("Rejection action failed");
      }
    }
  };

  const filteredApps = applications.filter(app => 
    app.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            
            {/* Page Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-2">
                  <Clock size={14} /> Action Required
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Review Applications</h1>
                <p className="text-slate-500 font-medium">
                  Review registrations, preview verification documents, and audit credentials.
                </p>
              </div>
              
              <div className="relative w-full md:w-80 group shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by ID or Store..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#D4AF37] rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:ring-4 focus:ring-[#D4AF37]/5"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-6">
              {loading ? (
                <div className="py-20 text-center text-slate-400 font-semibold">Loading applications queue...</div>
              ) : filteredApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 border-dashed rounded-[2rem]">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <SearchX size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">No pending reviews</h3>
                  <p className="text-slate-500 max-w-sm">There are no applications currently waiting in the verification queue.</p>
                </div>
              ) : (
                filteredApps.map((app) => (
                  <div key={app._id} className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col xl:flex-row gap-8 xl:items-center justify-between">
                    
                    {/* Store Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Store size={28} className="text-slate-400" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <h3 className="text-xl font-extrabold text-slate-900">{app.businessName}</h3>
                          <Badge status={app.verificationStatus} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5 text-slate-700"><User size={16} /> {app.firstName} {app.lastName}</span>
                          <span className="hidden sm:inline text-slate-300">•</span>
                          <span className="flex items-center gap-1.5"><Mail size={16} /> {app.email}</span>
                          <span className="hidden sm:inline text-slate-300">•</span>
                          <span className="flex items-center gap-1.5"><FileText size={16} /> ID: {app._id}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">Gstin: {app.gstin || "Not provided"}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-t-0 border-slate-100 shrink-0">
                      <button 
                        onClick={() => {
                          setDocumentOverlay({
                            gstin: app.gstin,
                            accountNumber: app.accountNumber,
                            bankName: app.bankName,
                            ifsc: app.ifsc
                          });
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition active:scale-95"
                      >
                        <Eye size={16} /> View Docs
                      </button>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => handleReject(app._id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition active:scale-95 border border-rose-200">
                          Reject
                        </button>
                        <button onClick={() => handleApprove(app._id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0B1528] text-white hover:bg-black rounded-xl font-bold text-xs border border-[#D4AF37]/30 transition shadow-md active:scale-95">
                          Approve
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Verification Docs Dialog */}
      {documentOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border rounded-[2rem] max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="font-extrabold text-[#0B1528] text-lg mb-4">Credentials Audit</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border">
                <p className="font-black text-gray-400 uppercase text-[9px] mb-1">Tax Certificate</p>
                <p className="font-bold text-slate-800">GSTIN: {documentOverlay.gstin || "N/A"}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border">
                <p className="font-black text-gray-400 uppercase text-[9px] mb-1">Bank Settlement Details</p>
                <p className="font-semibold text-slate-800">Bank: {documentOverlay.bankName || "N/A"}</p>
                <p className="font-semibold text-slate-800">Account: {documentOverlay.accountNumber || "N/A"}</p>
                <p className="font-semibold text-slate-800">IFSC Code: {documentOverlay.ifsc || "N/A"}</p>
              </div>
            </div>

            <button 
              onClick={() => setDocumentOverlay(null)}
              className="mt-6 w-full py-3 bg-[#0B1528] text-white hover:bg-black font-bold rounded-xl text-xs transition active:scale-95"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ status }) {
  let colorClass = '';
  switch(status) {
    case 'Pending': 
    case 'Pending Review': 
      colorClass = 'bg-amber-100 text-amber-700 border-amber-200'; 
      break;
    case 'Action Required': 
      colorClass = 'bg-rose-100 text-rose-700 border-rose-200'; 
      break;
    case 'Under Review':
    case 'Documents Uploaded': 
      colorClass = 'bg-blue-100 text-blue-700 border-blue-200'; 
      break;
    default: 
      colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  }
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${colorClass}`}>
      {status}
    </span>
  );
}