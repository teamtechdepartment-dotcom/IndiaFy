import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Clock, CheckCircle, AlertTriangle, ShieldAlert, ArrowLeft, RefreshCw, 
  FileText, ExternalLink, HelpCircle, Mail, Phone, Calendar
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import SEOHead from "../../components/seo/SEOHead";
import toast from "react-hot-toast";

export default function ApplicationStatus() {
  const { nodeType } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/seller/applications/node/${nodeType}`);
      if (res.success) {
        setApplication(res.application);
      } else {
        toast.error("Failed to load application status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading application.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [nodeType]);

  const normalizeStatus = (status) => {
    if (status === "pending") return "PENDING_REVIEW";
    if (status === "approved" || status === "APPROVED" || status === "ACTIVE") return "ACTIVE";
    if (status === "rejected") return "REJECTED";
    if (status === "additional_information_required") return "CHANGES_REQUESTED";
    return status || "PENDING_REVIEW";
  };

  const getStepStatus = (stepName) => {
    if (!application) return "waiting";
    const status = normalizeStatus(application.status);

    if (stepName === "submitted") {
      return "complete";
    }

    if (stepName === "review") {
      if (["PENDING_REVIEW", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(status)) return "current";
      if (["ACTIVE", "REJECTED", "SUSPENDED"].includes(status)) return "complete";
      return "waiting";
    }

    if (stepName === "approved") {
      if (status === "ACTIVE") return "complete";
      if (["REJECTED", "SUSPENDED"].includes(status)) return "failed";
      return "waiting";
    }

    if (stepName === "store_created") {
      if (status === "ACTIVE" && application.storeId) return "complete";
      return "waiting";
    }

    if (stepName === "live") {
      if (status === "ACTIVE" && application.storeId) return "complete";
      return "waiting";
    }

    return "waiting";
  };

  const getStepIcon = (stepName) => {
    const status = getStepStatus(stepName);
    if (status === "complete") return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === "current") return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
    if (status === "failed") return <ShieldAlert className="w-5 h-5 text-red-500" />;
    return <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />;
  };

  const getStatusCard = () => {
    if (!application) {
      return (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Application Found</h3>
          <p className="text-slate-500 text-sm mt-1 mb-6">You have not submitted an application for this node yet.</p>
          <Link to="/seller-hub">
            <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
              Apply Now
            </button>
          </Link>
        </div>
      );
    }

    const status = normalizeStatus(application.status);

    if (status === "PENDING_REVIEW" || status === "UNDER_REVIEW") {
      return (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
            <div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full tracking-wider">
                Pending Review
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-3">Under Review by Compliance Team</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Your application has been received successfully. Our compliance and auditing board is currently verifying your KYC documents, GST certificate, and bank details.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Clock size={14} />
                <span>Estimated Review Time: 24–48 Hours</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (status === "CHANGES_REQUESTED") {
      return (
        <div className="bg-orange-50/60 border border-orange-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-[10px] font-black uppercase rounded-full tracking-wider">
                Action Required
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-3">Additional Information Requested</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Our verification team needs clarification or document updates:
              </p>
              <div className="bg-white border border-orange-150 p-4 rounded-2xl my-3 text-slate-700 font-medium text-xs italic shadow-xs">
                "{application.rejectionReason || "Please verify bank statement or address details."}"
              </div>
              <button 
                onClick={() => navigate("/seller-hub")}
                className="mt-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Update KYC Details & Resubmit
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (status === "REJECTED") {
      return (
        <div className="bg-red-50/50 border border-red-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-[10px] font-black uppercase rounded-full tracking-wider">
                Rejected
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-3">KYC Application Rejected</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                We regret to inform you that your application did not pass our compliance checks. Reason:
              </p>
              <div className="bg-white border border-red-150 p-4 rounded-2xl my-3 text-slate-750 font-medium text-xs shadow-xs">
                {application.rejectionReason || "Incorrect PAN/GST validation or invalid document scans."}
              </div>
              <button 
                onClick={() => navigate("/seller-hub")}
                className="mt-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Re-apply & Resubmit
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (status === "SUSPENDED") {
      return (
        <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <span className="px-3 py-1 bg-slate-200 text-slate-800 text-[10px] font-black uppercase rounded-full tracking-wider">
                Suspended
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-3">Store Application Suspended</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Your seller store is currently suspended by admin review.
              </p>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl my-3 text-slate-700 font-medium text-xs shadow-xs">
                {application.rejectionReason || application.remarks || "Please contact partner support for next steps."}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (status === "ACTIVE") {
      return (
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full tracking-wider">
                Approved & Live
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-3">Congratulations! Your Store is Approved</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Your seller application has been approved. The store is created and live on the Indiafy marketplace.
              </p>
              <Link to={`/seller/dashboard/${application.storeId}/dashboard`}>
                <button className="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95">
                  Enter Seller Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-accent animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading Application Status...</p>
        </div>
      </div>
    );
  }

  const nodeLabel = nodeType?.replace(/_/g, " ");

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans relative overflow-hidden py-12 px-4 sm:px-6">
      <SEOHead title={`Application Status | Indiafy`} noindex={true} />

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Header Back Button */}
        <button 
          onClick={() => navigate("/seller-hub")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs"
        >
          <ArrowLeft size={14} />
          Return to Seller Hub
        </button>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            KYC Onboarding <span className="text-brand-accent">Status.</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Node Environment: <span className="font-bold text-slate-700 capitalize">{nodeLabel?.toLowerCase()}</span>
          </p>
        </div>

        {/* Status Card */}
        {getStatusCard()}

        {/* Verification Timeline */}
        {application && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Onboarding Progress Tracker</h4>

            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {/* Step 1: Submit */}
              <div className="flex items-start gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200 shrink-0 z-10">
                  {getStepIcon("submitted")}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Application Submitted</h5>
                  <p className="text-slate-500 text-xs mt-0.5">Your business profile data has been locked.</p>
                  {application.submittedAt && (
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 mt-1.5 inline-block font-medium">
                      {new Date(application.submittedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="flex items-start gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200 shrink-0 z-10">
                  {getStepIcon("review")}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">KYC Verification & Auditing</h5>
                  <p className="text-slate-500 text-xs mt-0.5">Documents are verified for anti-fraud check.</p>
                </div>
              </div>

              {/* Step 3: Approval */}
              <div className="flex items-start gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200 shrink-0 z-10">
                  {getStepIcon("approved")}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Compliance Decision</h5>
                  <p className="text-slate-500 text-xs mt-0.5">Admin issues approved store credentials.</p>
                </div>
              </div>

              {/* Step 4: Store Live */}
              <div className="flex items-start gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200 shrink-0 z-10">
                  {getStepIcon("live")}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Store Activated & Live</h5>
                  <p className="text-slate-500 text-xs mt-0.5">Your store catalog becomes visible in the marketplace.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
