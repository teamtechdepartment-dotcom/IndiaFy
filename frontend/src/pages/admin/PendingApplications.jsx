import React, { useState } from 'react';
import { Search, CheckCircle, Eye, User, FileText, Store, Mail, Clock, XCircle, SearchX } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

// --- INITIAL MOCK DATA ---
const initialApplications = [
  { id: 'APP-8A9F2C', storeName: 'TechHaven Electronics', applicant: 'Rajesh Kumar', date: 'Oct 24, 2024', email: 'rajesh@techhaven.in', status: 'Pending Review' },
  { id: 'APP-4B2E19', storeName: 'Organic Origins', applicant: 'Priya Sharma', date: 'Oct 23, 2024', email: 'hello@organicorigins.co', status: 'Documents Uploaded' },
  { id: 'APP-9C7D44', storeName: 'SneakerHeadz', applicant: 'Amit Patel', date: 'Oct 23, 2024', email: 'amit.p@sneakerheadz.com', status: 'Action Required' },
];

export default function PendingApplications() {
  const [applications, setApplications] = useState(initialApplications);
  const [searchQuery, setSearchQuery] = useState('');

  // --- FUNCTIONAL HANDLERS ---
  const handleApprove = (id) => {
    setApplications(apps => apps.filter(app => app.id !== id));
    // In a real app, you would make an API call here
  };

  const handleReject = (id) => {
    if(window.confirm("Are you sure you want to reject this application?")) {
      setApplications(apps => apps.filter(app => app.id !== id));
    }
  };

  // --- SEARCH FILTER LOGIC ---
  const filteredApps = applications.filter(app => 
    app.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto space-y-8 lg:space-y-10 pb-20">
            
            {/* Page Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest mb-2">
                  <Clock size={14} /> Action Required
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Review Applications</h1>
                <p className="text-slate-500 font-medium text-base sm:text-lg">
                  You have {applications.length} applications waiting for approval.
                </p>
              </div>
              
              <div className="relative w-full md:w-80 group shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by ID, Name or Store..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-blue-500/10"
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
              {filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col xl:flex-row gap-8 xl:items-center justify-between">
                    
                    {/* Store Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Store size={28} className="text-slate-400" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <h3 className="text-xl font-extrabold text-slate-900">{app.storeName}</h3>
                          <Badge status={app.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5 text-slate-700"><User size={16} /> {app.applicant}</span>
                          <span className="hidden sm:inline text-slate-300">•</span>
                          <span className="flex items-center gap-1.5"><Mail size={16} /> {app.email}</span>
                          <span className="hidden sm:inline text-slate-300">•</span>
                          <span className="flex items-center gap-1.5"><FileText size={16} /> {app.id}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-1">Applied on {app.date}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-t-0 border-slate-100 shrink-0">
                      <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 hover:border-slate-200 transition-all active:scale-95">
                        <Eye size={18} /> View
                      </button>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => handleReject(app.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all active:scale-95">
                          Reject
                        </button>
                        <button onClick={() => handleApprove(app.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                          Approve <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                /* EMPTY STATE UI */
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 border-dashed rounded-[2rem]">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <SearchX size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">No applications found</h3>
                  <p className="text-slate-500 max-w-sm">We couldn't find any pending applications matching your current search criteria.</p>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="mt-6 text-blue-600 font-bold hover:underline">
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar { scroll-behavior: smooth; }
      `}} />
    </div>
  );
}

function Badge({ status }) {
  let colorClass = '';
  switch(status) {
    case 'Pending Review': colorClass = 'bg-amber-100 text-amber-700 border-amber-200'; break;
    case 'Action Required': colorClass = 'bg-rose-100 text-rose-700 border-rose-200'; break;
    case 'Documents Uploaded': colorClass = 'bg-blue-100 text-blue-700 border-blue-200'; break;
    default: colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  }
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${colorClass}`}>
      {status}
    </span>
  );
}