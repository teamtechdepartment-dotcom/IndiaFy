import React, { useState, useEffect } from 'react';
import { Search, Globe, Sparkles, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import AdminErrorBoundary from "../../components/admin/AdminErrorBoundary";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function StoreManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editingStore, setEditingStore] = useState(null);
  const [sectorsInput, setSectorsInput] = useState("");
  const [radiusInput, setRadiusInput] = useState(10);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/management/stores");
      const raw = res?.data?.stores ?? res?.data ?? res ?? [];
      const safeData = Array.isArray(raw) ? raw : [];
      setStores(safeData);
    } catch (_err) {
      console.error("Error fetching stores:", _err);
      setError("Failed to load storefront directories.");
      toast.error("Failed to load storefront directories");
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpenEdit = (store) => {
    if (!store) return;
    setEditingStore(store);
    const sectors = Array.isArray(store.operatingSectors) ? store.operatingSectors.join(", ") : "";
    setSectorsInput(sectors);
    setRadiusInput(store.dispatchRadius ?? 10);
  };

  const handleSaveSEO = async () => {
    if (!editingStore?._id) return;
    try {
      const sectorsArray = (sectorsInput ?? "").split(",").map(s => s.trim()).filter(Boolean);
      await axiosInstance.put(`/admin/management/stores/${editingStore._id}/seo`, {
        operatingSectors: sectorsArray,
        dispatchRadius: Number(radiusInput) || 10
      });
      toast.success("Store SEO & dispatch parameters saved");
      setEditingStore(null);
      fetchStores();
    } catch (_err) {
      toast.error("Failed to update store settings");
    }
  };

  const handleDeleteStore = async (id, storeName) => {
    if (!id) return;
    const confirmed = window.confirm(
      `Are you sure you want to PERMANENTLY delete store "${storeName || 'Store'}" from the database? This action CANNOT be undone.`
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/admin/management/stores/${id}`);
      toast.success(`Store "${storeName || 'Store'}" permanently deleted successfully!`);
      fetchStores();
    } catch (_err) {
      console.error("Error deleting store:", _err);
      toast.error(_err?.response?.data?.message || "Failed to delete store");
    }
  };

  const safeStores = Array.isArray(stores) ? stores : [];

  const filteredStores = safeStores.filter((store) => {
    if (!store) return false;
    const query = (search ?? "").toLowerCase().trim();
    if (!query) return true;

    const firstName = (store.firstName ?? "").toLowerCase();
    const lastName = (store.lastName ?? "").toLowerCase();
    const bName = (store.storeName ?? store.businessName ?? store.customerId?.businessName ?? "").toLowerCase();
    const nodeType = (store.nodeType ?? store.sellerType ?? "").toLowerCase();
    const city = (store.city ?? "").toLowerCase();

    return firstName.includes(query) || lastName.includes(query) || bName.includes(query) || nodeType.includes(query) || city.includes(query);
  });

  return (
    <div className="flex min-h-screen font-sans" style={{background:"radial-gradient(ellipse at 20% 50%, rgba(40,116,240,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,100,27,0.04) 0%, transparent 60%), linear-gradient(135deg, #050811 0%, #080C1A 50%, #050811 100%)"}}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#2874F0] text-xs font-bold uppercase tracking-widest mb-2">
                  <Globe size={14} /> Storefront directory
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Store Governance</h1>
                <p className="text-slate-500 font-medium">
                  Review store status, assign geographical coverage parameters, and configure local delivery SEO.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={fetchStores}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>

                <div className="relative w-full sm:w-72 group shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2874F0] transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search store names..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#10B981] rounded-2xl py-3 pl-11 pr-4 text-xs font-medium text-slate-900 outline-none transition-all shadow-xs focus:ring-4 focus:ring-[#10B981]/5"
                  />
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button onClick={fetchStores} className="underline hover:text-red-900">Retry</button>
              </div>
            )}

            {/* Grid display wrapped in Error Boundary */}
            <AdminErrorBoundary title="Unable to load storefront governance directory">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  [1, 2, 3].map((idx) => (
                    <div key={idx} className="h-64 bg-slate-200/60 rounded-[2rem] animate-pulse" />
                  ))
                ) : filteredStores.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-slate-400 font-semibold bg-white rounded-3xl border">
                    No active storefronts found.
                  </div>
                ) : (
                  filteredStores.map((store) => {
                    const sId = store?._id || Math.random().toString();
                    const bName = store?.storeName ?? store?.businessName ?? store?.customerId?.businessName ?? "Unnamed Store";
                    const fName = store?.firstName ?? "";
                    const lName = store?.lastName ?? "";
                    const status = store?.warehouseVerificationStatus ?? "Verified";
                    const isVerified = status === "Verified";
                    const radius = store?.dispatchRadius ?? 10;
                    const logoUrl = store?.logo || store?.profileImage || store?.storeFrontPhoto;

                    return (
                      <div key={sId} className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
                        
                        {/* Header */}
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            {logoUrl ? (
                              <img 
                                src={logoUrl} 
                                alt={bName} 
                                className="w-12 h-12 rounded-xl border border-slate-200 object-cover bg-white shadow-xs"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <div 
                              className="w-12 h-12 bg-[#10B981]/10 border border-[#10B981]/25 rounded-xl flex items-center justify-center text-[#2874F0] font-extrabold text-lg"
                              style={{ display: logoUrl ? 'none' : 'flex' }}
                            >
                              {(bName[0] ?? "S").toUpperCase()}
                            </div>
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                              isVerified ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"
                            }`}>
                              {status}
                            </span>
                          </div>

                          <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{bName}</h3>
                          <p className="text-xs text-slate-400 font-medium mt-1">
                            Owner: {fName} {lName} {store?.city ? `• ${store.city}` : ""}
                          </p>
                          
                          <hr className="my-4 border-slate-100" />

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400">Reputation index:</span>
                              <span className="font-bold flex items-center gap-1">
                                <Sparkles size={12} className="text-[#2874F0] fill-[#10B981]" />
                                {store?.indiafyVerifiedBadge ? "Premium" : "Standard"}
                              </span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400">Merchant Type:</span>
                              <span className="font-bold uppercase text-slate-750">{store?.sellerType ?? store?.nodeType ?? "Retailer"}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400">Delivery coverage:</span>
                              <span className="font-bold text-[#2874F0]">{radius} km</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(store)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white hover:bg-black font-bold rounded-xl text-xs transition active:scale-95 border border-slate-200 cursor-pointer"
                          >
                            Configure SEO & Radius
                          </button>
                          <button
                            onClick={() => handleDeleteStore(store._id, bName)}
                            className="p-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center"
                            title="Delete Store Permanently"
                          >
                            <Trash2 size={16} />
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

      {/* SEO Edit Dialog overlay */}
      {editingStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-[2rem] max-w-md w-full p-6 shadow-2xl relative space-y-4 text-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg leading-none">Configure Local SEO</h3>
              <p className="text-xs text-slate-400 mt-1">Configure geographical serving limits and SEO keywords for {editingStore.customerId?.businessName ?? "store"}.</p>
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
                  onChange={(e) => setRadiusInput(parseInt(e.target.value) || 0)}
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
                className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-black transition shadow-sm"
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
