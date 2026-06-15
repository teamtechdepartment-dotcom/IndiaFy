import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, MapPin, Globe, Sparkles, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function StoreManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingStore, setEditingStore] = useState(null);
  const [sectorsInput, setSectorsInput] = useState("");
  const [radiusInput, setRadiusInput] = useState(10);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/management/stores");
      const data = res.data || res;
      setStores(data || []);
    } catch (_err) {
      toast.error("Failed to load storefront directories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpenEdit = (store) => {
    setEditingStore(store);
    setSectorsInput(store.operatingSectors?.join(", ") || "");
    setRadiusInput(store.dispatchRadius || 10);
  };

  const handleSaveSEO = async () => {
    try {
      const sectorsArray = sectorsInput.split(",").map(s => s.trim()).filter(Boolean);
      await axiosInstance.put(`/admin/management/stores/${editingStore._id}/seo`, {
        operatingSectors: sectorsArray,
        dispatchRadius: radiusInput
      });
      toast.success("Store SEO & dispatch parameters saved");
      setEditingStore(null);
      fetchStores();
    } catch (_err) {
      toast.error("Failed to update store settings");
    }
  };

  const filteredStores = stores.filter(store => 
    store.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    store.customerId?.businessName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-hero-gradient text-slate-800 font-sans selection:bg-[#10B981] selection:text-white relative overflow-hidden">
      <Sidebar />

      {/* Decorative Blur Blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/30 to-teal-100/10 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/20 to-indigo-100/5 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] text-xs font-bold uppercase tracking-widest mb-2">
                  <Globe size={14} /> Storefront directory
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Store Governance</h1>
                <p className="text-slate-500 font-medium">
                  Review store status, assign geographical coverage parameters, and configure local delivery SEO.
                </p>
              </div>

              <div className="relative w-full md:w-80 group shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10B981] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search store names..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#10B981] rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:ring-4 focus:ring-[#10B981]/5"
                />
              </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-16 text-center text-slate-400 font-semibold">Loading storefront parameters...</div>
              ) : filteredStores.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 font-semibold">No active storefronts found.</div>
              ) : (
                filteredStores.map(store => (
                  <div key={store._id} className="bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-[2rem] p-6 shadow-md flex flex-col justify-between hover:shadow-lg hover:border-[#10B981]/30 transition-all duration-300">
                    
                    {/* Header */}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-[#10B981]/10 border border-[#10B981]/25 rounded-xl flex items-center justify-center text-[#10B981] font-extrabold text-lg">
                          {store.customerId?.businessName?.charAt(0) || "S"}
                        </div>
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                          store.warehouseVerificationStatus === "Verified" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}>
                          {store.warehouseVerificationStatus}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{store.customerId?.businessName || "Unnamed Store"}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">Owner: {store.firstName} {store.lastName}</p>
                      
                      <hr className="my-4 border-slate-100" />

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-400">Reputation index:</span>
                          <span className="font-bold flex items-center gap-1"><Sparkles size={12} className="text-[#10B981] fill-[#10B981]" /> {store.indiafyVerifiedBadge ? "Premium" : "Standard"}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-400">Merchant Type:</span>
                          <span className="font-bold uppercase text-slate-750">{store.sellerType}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-400">Delivery coverage:</span>
                          <span className="font-bold text-[#10B981]">{store.dispatchRadius || 10} km</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(store)}
                      className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-[#0F172A] text-white hover:bg-slate-800 font-bold rounded-xl text-xs transition active:scale-95 border border-slate-200"
                    >
                      Configure SEO & Radius
                    </button>

                  </div>
                ))
              )}
            </div>

          </div>
        </main>
      </div>

      {/* SEO Edit Dialog overlay */}
      {editingStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-md w-full p-6 shadow-2xl relative space-y-4 text-slate-850">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg leading-none">Configure Local SEO</h3>
              <p className="text-xs text-slate-400 mt-1">Configure geographical serving limits and SEO keywords for {editingStore.customerId?.businessName}.</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-400 mb-1">Serving Sectors / Local Keywords (comma separated)</label>
                <input 
                  type="text" 
                  value={sectorsInput}
                  onChange={(e) => setSectorsInput(e.target.value)}
                  placeholder="e.g. Sector 49, Cyber City, Golf Course Road"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Dispatch Radius Limit (in kilometers)</label>
                <input 
                  type="number" 
                  value={radiusInput}
                  onChange={(e) => setRadiusInput(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none font-medium text-slate-900 focus:bg-white focus:border-[#10B981]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setEditingStore(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSEO}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-[#10B981] text-white font-bold rounded-xl text-xs hover:opacity-90 transition shadow-lg shadow-emerald-500/20"
              >
                Save parameters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
