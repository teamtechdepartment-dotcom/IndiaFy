import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, SearchX, Store, User, Mail, Calendar, Eye, 
  XCircle, Clock, CreditCard, FileText, Download, ZoomOut, ZoomIn, 
  Maximize2, AlertTriangle
} from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function PendingApplications() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [activeTab, setActiveTab] = useState('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Details side panel
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [infoModal, setInfoModal] = useState(false);
  const [infoComments, setInfoComments] = useState('');

  // Image preview lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxFullscreen, setLightboxFullscreen] = useState(false);

  const normalizeStatus = (status) => {
    if (status === "pending") return "PENDING_REVIEW";
    if (status === "approved") return "APPROVED";
    if (status === "rejected") return "REJECTED";
    if (status === "additional_information_required") return "CHANGES_REQUESTED";
    return status || "PENDING_REVIEW";
  };

  const isActionableStatus = (status) =>
    ["PENDING_REVIEW", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(normalizeStatus(status));

  const handleDownload = (base64Data, filename) => {
    if (!base64Data) {
      toast.error("File not found");
      return;
    }
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/admin/store-applications', {
        params: {
          status: activeTab,
          search: searchQuery,
          nodeType: selectedNode,
          date: selectedDate,
          page,
          limit: 10
        }
      });
      if (res && res.success && res.data) {
        setApplications((res.data.applications || []).map((app) => ({
          ...app,
          status: normalizeStatus(app.status),
        })));
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } else {
        setApplications([]);
        setTotal(0);
        setPages(1);
        setError("Invalid response payload from server.");
      }
    } catch (_err) {
      setError(_err?.response?.data?.message || _err?.message || "Failed to load seller applications");
      toast.error("Failed to load seller applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApplications = () => fetchApplications();
  const loadPendingApplications = () => fetchApplications();

  useEffect(() => {
    fetchApplications();
  }, [activeTab, searchQuery, selectedNode, selectedDate, page]);

  const loadApplicationDetails = async (id) => {
    setLoadingDetails(true);
    try {
      const res = await axiosInstance.get(`/admin/store-applications/${id}`);
      if (res.success && res.data) {
        setSelectedApp({ ...res.data, status: normalizeStatus(res.data.status) });
      }
    } catch (_err) {
      toast.error("Failed to load application details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this seller application and activate store node?")) return;
    try {
      const res = await axiosInstance.patch(`/admin/store-applications/${id}/approve`);
      if (res.success) {
        toast.success("Seller store approved and activated live!");
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (_err) {
      toast.error(_err?.response?.data?.message || "Failed to approve store.");
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/admin/store-applications/${id}/reject`, {
        reason: rejectionReason
      });
      if (res.success) {
        toast.success("Seller application rejected.");
        setRejectModal(false);
        setRejectionReason('');
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (_err) {
      toast.error(_err?.response?.data?.message || "Failed to reject application.");
    }
  };

  const handleRequestInfo = async (id) => {
    if (!infoComments.trim()) {
      toast.error("Please explain what additional information is required.");
      return;
    }
    try {
      const res = await axiosInstance.patch(`/admin/store-applications/${id}/request-changes`, {
        comments: infoComments
      });
      if (res.success) {
        toast.success("Requested more information from seller.");
        setInfoModal(false);
        setInfoComments('');
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (_err) {
      toast.error(_err?.response?.data?.message || "Failed to submit request.");
    }
  };

  const handleSuspend = async (id) => {
    const reason = window.prompt("Reason for suspension:");
    if (!reason?.trim()) return;
    try {
      const res = await axiosInstance.patch(`/admin/store-applications/${id}/suspend`, {
        reason
      });
      if (res.success) {
        toast.success("Seller store suspended.");
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (_err) {
      toast.error(_err?.response?.data?.message || "Failed to suspend store.");
    }
  };

  return (
    <div className="flex min-h-screen font-sans" style={{background:"radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6 pb-20">
            
            {/* Header Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seller Approval Center</h1>
              <p className="text-slate-500 font-medium">Audit registrations, review documents, and activate hyperlocal seller nodes.</p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex gap-2 border-b border-slate-200">
              {[
                { id: 'PENDING_REVIEW', label: 'Pending' },
                { id: 'UNDER_REVIEW', label: 'Under Review' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'REJECTED', label: 'Rejected' },
                { id: 'CHANGES_REQUESTED', label: 'Changes Requested' },
                { id: 'SUSPENDED', label: 'Suspended' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-all
                    ${activeTab === tab.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-450 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white border border-slate-250/60 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xs">
              <div className="flex flex-wrap gap-4 items-center flex-1">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search store or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 focus:border-slate-400 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <select
                  value={selectedNode}
                  onChange={(e) => setSelectedNode(e.target.value)}
                  className="bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold outline-none focus:border-slate-400"
                >
                  <option value="">All Node Types</option>
                  <option value="LOCAL_RETAIL">Local Retail</option>
                  <option value="WHOLESALE_B2B">Wholesale B2B</option>
                  <option value="QUICK_COMMERCE">Quick Commerce</option>
                  <option value="HOME_ESSENTIALS">Home Essentials</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="PERSONAL_CARE">Personal Care</option>
                </select>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-semibold outline-none focus:border-slate-400 text-slate-650"
                />
              </div>

              {(searchQuery || selectedNode || selectedDate) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedNode('');
                    setSelectedDate('');
                  }}
                  className="text-xs text-rose-500 font-bold underline hover:no-underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* APPLICATIONS GRID LIST */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center text-slate-400 font-semibold flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin text-slate-500" size={20} />
                  Loading application pipeline...
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 border-dashed rounded-[2rem]">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle size={32} className="text-rose-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Failed to load applications</h3>
                  <p className="text-slate-500 max-w-sm mb-6">{error}</p>
                  <button
                    onClick={fetchPendingApplications}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow active:scale-95 transition"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Reload Pipeline
                  </button>
                </div>
              ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 border-dashed rounded-[2rem]">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <SearchX size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">No applications found</h3>
                  <p className="text-slate-500 max-w-sm mb-6">No seller onboarding records found matching these criteria.</p>
                  <button
                    onClick={fetchPendingApplications}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-xl text-xs flex items-center gap-1.5 bg-white shadow-xs transition"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Refresh
                  </button>
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app._id} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-md transition duration-200 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        {app.storePhoto ? (
                          <img src={app.storePhoto} alt={app.storeName} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Store size={24} className="text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-slate-900 truncate">{app.storeName}</h3>
                          <span className="bg-slate-100 text-slate-650 border border-slate-200 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                            {app.nodeType.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1 text-slate-700 font-bold"><User size={13} /> {app.ownerName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Mail size={13} /> {app.ownerEmail}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(app.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-none border-slate-100">
                      <button
                        onClick={() => loadApplicationDetails(app._id)}
                        className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs flex items-center gap-1.5 bg-white shadow-xs transition"
                      >
                        <Eye size={14} /> Review Application
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* PAGINATION */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg text-xs disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-slate-500">Page {page} of {pages}</span>
                <button
                  disabled={page === pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-650 font-bold rounded-lg text-xs disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* DETAIL SIDE OVERLAY PANEL */}
      {selectedApp && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedApp(null)} />
          
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-900">Compliance Review Node</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Application ID: {selectedApp.applicationId}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-200 rounded-full transition">
                <XCircle size={22} className="text-slate-400" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Timeline Stage Indicator */}
              <div className="bg-slate-50 border p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Current Stage Status</span>
                </div>
                <span className="bg-amber-100 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {normalizeStatus(selectedApp.status).replace(/_/g, " ")}
                </span>
              </div>

              {/* Store Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-1 flex items-center gap-1.5">
                  <Store size={14} className="text-blue-500" /> Store Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Store Name</span>
                    <span className="text-slate-800 font-black mt-0.5">{selectedApp.storeName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Node Type</span>
                    <span className="text-slate-800 font-bold mt-0.5">{selectedApp.nodeType.replace(/_/g, " ")}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Description</span>
                    <p className="text-slate-650 font-medium mt-0.5 leading-relaxed">{selectedApp.storeDescription || "No description provided."}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Address</span>
                    <span className="text-slate-800">{selectedApp.address}, {selectedApp.city}, {selectedApp.state} - {selectedApp.pincode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Latitude</span>
                    <span className="text-slate-800">{selectedApp.latitude || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Longitude</span>
                    <span className="text-slate-800">{selectedApp.longitude || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-1 flex items-center gap-1.5">
                  <User size={14} className="text-blue-500" /> Owner Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Full Name</span>
                    <span className="text-slate-800 font-black mt-0.5">{selectedApp.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                    <span className="text-slate-850 mt-0.5">{selectedApp.ownerEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile Phone</span>
                    <span className="text-slate-850 mt-0.5">{selectedApp.ownerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">PAN Number (Decrypted)</span>
                    <span className="text-slate-850 font-black mt-0.5 uppercase">{selectedApp.panNumber}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Aadhaar (Decrypted)</span>
                    <span className="text-slate-850 font-black mt-0.5">{selectedApp.aadhaarNumber}</span>
                  </div>
                </div>
              </div>

              {/* Business & Bank details */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-1 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-blue-500" /> Business & Banking Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Business Type</span>
                    <span className="text-slate-850 mt-0.5">{selectedApp.businessType || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">GST Number</span>
                    <span className="text-slate-850 font-black mt-0.5 uppercase">{selectedApp.gstNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Food License Number</span>
                    <span className="text-slate-850 mt-0.5">{selectedApp.foodLicenseNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Bank Name</span>
                    <span className="text-slate-850 mt-0.5">{selectedApp.bankName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">IFSC Code</span>
                    <span className="text-slate-850 font-black mt-0.5 uppercase">{selectedApp.ifscCode}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Number (Decrypted)</span>
                    <span className="text-slate-850 font-black mt-0.5">{selectedApp.bankAccountNumber}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-1 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-500" /> Compliance Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Aadhaar Card Front", key: "aadhaarFront", file: selectedApp.documents.aadhaarFront },
                    { label: "Aadhaar Card Back", key: "aadhaarBack", file: selectedApp.documents.aadhaarBack },
                    { label: "PAN Card Document", key: "panCard", file: selectedApp.documents.panCard },
                    { label: "GST Registration Certificate", key: "gstCertificate", file: selectedApp.documents.gstCertificate },
                    { label: "Cancelled Settlement Cheque", key: "cancelledCheque", file: selectedApp.documents.cancelledCheque },
                    { label: "Settlement Bank Statement", key: "bankStatement", file: selectedApp.documents.bankStatement },
                    { label: "Food License (FSSAI)", key: "foodLicense", file: selectedApp.documents.foodLicense },
                    { label: "Store Front Photo", key: "storePhoto", file: selectedApp.storePhoto },
                    { label: "Store Banner Image", key: "storeBanner", file: selectedApp.storeBanner }
                  ].map(doc => {
                    if (!doc.file) return null;
                    return (
                      <div key={doc.key} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-700 truncate">{doc.label}</p>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase mt-0.5">Scanned File</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setLightboxUrl(doc.file);
                              setLightboxScale(1);
                              setLightboxFullscreen(false);
                            }}
                            className="p-1.5 bg-white border rounded-lg text-slate-600 hover:text-slate-900 transition hover:bg-slate-50"
                            title="Preview file"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.file, `${doc.key}.png`)}
                            className="p-1.5 bg-white border rounded-lg text-slate-650 hover:text-slate-900 transition hover:bg-slate-50"
                            title="Download file"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Action buttons (only active for pending) */}
            {isActionableStatus(selectedApp.status) && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => setInfoModal(true)}
                  className="px-4 py-3 bg-slate-100 border border-slate-200 text-slate-650 hover:bg-slate-200 hover:text-slate-900 font-bold rounded-xl text-xs transition"
                >
                  Request Info
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSuspend(selectedApp._id)}
                    className="px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl font-bold text-xs transition active:scale-95"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => setRejectModal(true)}
                    className="px-5 py-3 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-xs transition active:scale-95"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp._id)}
                    className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs transition shadow active:scale-95"
                  >
                    Approve Store Node
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW LIGHTBOX WITH SCALE / FULLSCREEN / INVALID CHECKS */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-4xl w-full bg-white rounded-3xl p-4 flex flex-col items-center shadow-2xl h-[85vh]">
            
            {/* Header controls */}
            <div className="w-full flex items-center justify-between border-b pb-3 mb-3 shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verification Lightbox Tool</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxScale(s => Math.max(0.5, s - 0.25))}
                  className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-bold text-slate-700 w-12 text-center">{Math.round(lightboxScale * 100)}%</span>
                <button
                  onClick={() => setLightboxScale(s => Math.min(3, s + 0.25))}
                  className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setLightboxFullscreen(!lightboxFullscreen)}
                  className={`p-1.5 rounded-lg transition ${lightboxFullscreen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  title="Toggle Fullscreen"
                >
                  <Maximize2 size={14} />
                </button>
                <button
                  onClick={() => handleDownload(lightboxUrl, "document.png")}
                  className="p-1.5 bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-lg transition"
                  title="Download File"
                >
                  <Download size={14} />
                </button>
                
                {/* Mark Invalid Button */}
                <button
                  onClick={() => {
                    const promptComment = window.prompt("Explain why this document is invalid:");
                    if (promptComment) {
                      setInfoComments(`Document rejection: ${promptComment}`);
                      setLightboxUrl(null);
                      setInfoModal(true);
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition"
                >
                  Mark Invalid
                </button>

                <button
                  onClick={() => setLightboxUrl(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-full transition ml-2"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Image viewer */}
            <div className="flex-1 w-full overflow-auto flex items-center justify-center bg-slate-100 rounded-2xl relative">
              <div 
                className="transition-transform duration-100 origin-center"
                style={{ transform: `scale(${lightboxScale})` }}
              >
                {lightboxUrl.startsWith("data:application/pdf") ? (
                  <div className="p-8 text-center text-slate-500 font-bold">
                    PDF Document preview not supported in lightbox. Use download action to audit files.
                  </div>
                ) : (
                  <img
                    src={lightboxUrl}
                    alt="Document Review"
                    className={`max-w-full rounded-lg ${lightboxFullscreen ? 'h-[70vh] object-contain' : 'max-h-[50vh] object-scale-down'}`}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-[2rem] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-[#0B1528] text-lg">Input Rejection Reason</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. GST certificate mismatch or PAN details invalid."
              className="w-full bg-slate-50 border rounded-xl p-3 text-sm font-semibold outline-none resize-none focus:border-slate-400 focus:bg-white"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setRejectModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button 
                onClick={() => handleReject(selectedApp._id)} 
                className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST MORE INFO MODAL */}
      {infoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-[2rem] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-[#0B1528] text-lg">Request More Information</h3>
            <textarea
              rows={3}
              value={infoComments}
              onChange={(e) => setInfoComments(e.target.value)}
              placeholder="Describe what corrections or files are required from the merchant..."
              className="w-full bg-slate-50 border rounded-xl p-3 text-sm font-semibold outline-none resize-none focus:border-slate-400 focus:bg-white"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setInfoModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button 
                onClick={() => handleRequestInfo(selectedApp._id)} 
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
