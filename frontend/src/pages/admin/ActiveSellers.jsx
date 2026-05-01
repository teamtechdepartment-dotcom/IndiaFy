import React, { useState } from 'react';
import { Search, Store, ShieldCheck, Star, ExternalLink, Filter, MoreVertical, XCircle, SearchX } from 'lucide-react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

// --- INITIAL MOCK DATA ---
const initialSellers = [
  { id: 'SEL-10024', storeName: 'Luxe Attire', owner: 'Neha Gupta', joined: 'Jan 15, 2024', category: 'Fashion', status: 'Active', products: 124, rating: 4.8 },
  { id: 'SEL-10089', storeName: 'Gadget Galaxy', owner: 'Vikram Singh', joined: 'Mar 02, 2024', category: 'Electronics', status: 'Active', products: 430, rating: 4.5 },
  { id: 'SEL-10102', storeName: 'Home Essentials Plus', owner: 'Anjali Desai', joined: 'May 18, 2024', category: 'Home Kitchen', status: 'Warning', products: 89, rating: 3.9 },
  { id: 'SEL-10255', storeName: 'FitGear Pro', owner: 'Rahul Verma', joined: 'Aug 05, 2024', category: 'Sports', status: 'Active', products: 56, rating: 4.9 },
  { id: 'SEL-10311', storeName: 'Daily Organics', owner: 'Suresh Patil', joined: 'Sep 10, 2024', category: 'Grocery', status: 'Suspended', products: 0, rating: 2.1 },
];

export default function ActiveSellers() {
  const [sellers, setSellers] = useState(initialSellers);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Extract unique categories for a simple filter
  const categories = ['All', ...new Set(initialSellers.map(s => s.category))];

  // --- SEARCH & FILTER LOGIC ---
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategoryFilter === 'All' || seller.category === activeCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10 pb-20">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-2">
                  <ShieldCheck size={14} /> Platform Sellers
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Active Sellers</h1>
                <p className="text-slate-500 font-medium text-base sm:text-lg">
                  Manage and monitor {sellers.length} authorized storefronts.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search sellers or IDs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-10 text-sm font-medium text-slate-900 outline-none transition-all shadow-sm focus:shadow-md focus:ring-4 focus:ring-blue-500/10"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
                
                {/* Category Filter Dropdown (Functional) */}
                <div className="relative w-full sm:w-auto">
                  <select 
                    value={activeCategoryFilter}
                    onChange={(e) => setActiveCategoryFilter(e.target.value)}
                    className="w-full h-[54px] pl-10 pr-8 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm outline-none appearance-none cursor-pointer shadow-sm hover:bg-slate-50 transition-all focus:ring-4 focus:ring-slate-200"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat} Categories</option>
                    ))}
                  </select>
                  <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Sellers List / Table */}
            <div className="space-y-4">
              
              {/* Desktop Table Header */}
              {filteredSellers.length > 0 && (
                <div className="hidden xl:grid grid-cols-12 gap-6 px-8 pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <div className="col-span-4">Store & Owner</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Performance</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
              )}

              {/* Sellers Mapping */}
              {filteredSellers.length > 0 ? (
                filteredSellers.map((seller) => (
                  <div key={seller.id} className="bg-white border border-slate-200 rounded-[2rem] xl:rounded-2xl p-6 xl:p-5 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col xl:grid xl:grid-cols-12 xl:items-center gap-6">
                    
                    {/* Store Info */}
                    <div className="col-span-4 flex items-center gap-5 w-full">
                      <div className="w-14 h-14 bg-gradient-to-tr from-slate-50 to-blue-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600 font-extrabold text-xl shadow-sm">
                        {seller.storeName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-1 truncate">{seller.storeName}</h3>
                        <p className="text-sm text-slate-500 font-medium truncate">{seller.owner} <span className="mx-1 text-slate-300">•</span> {seller.id}</p>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 flex items-center">
                      <span className="xl:hidden text-xs font-bold text-slate-400 uppercase tracking-widest w-28">Category:</span>
                      <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold tracking-wide">
                        {seller.category}
                      </span>
                    </div>

                    {/* Performance Metrics */}
                    <div className="col-span-2 flex flex-row xl:flex-col items-center xl:items-start gap-4 xl:gap-1.5">
                      <span className="xl:hidden text-xs font-bold text-slate-400 uppercase tracking-widest w-28">Metrics:</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Store size={14} className="text-slate-400" />
                        {seller.products} <span className="font-medium text-slate-500">Products</span>
                      </div>
                      <div className="hidden xl:block w-full h-[1px] bg-slate-100 my-1"></div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        {seller.rating} <span className="font-medium text-slate-500">Rating</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-2 flex items-center">
                      <span className="xl:hidden text-xs font-bold text-slate-400 uppercase tracking-widest w-28">Status:</span>
                      <SellerStatus status={seller.status} />
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-3 mt-4 xl:mt-0 pt-6 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                      <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-colors shadow-sm active:scale-95">
                        Manage <ExternalLink size={16} />
                      </button>
                      <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border-2 border-transparent active:scale-95">
                        <MoreVertical size={20} />
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                /* EMPTY STATE UI */
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200 border-dashed rounded-[2rem]">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <SearchX size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">No sellers found</h3>
                  <p className="text-slate-500 max-w-sm">We couldn't find any active sellers matching your current search or filter criteria.</p>
                  {(searchQuery || activeCategoryFilter !== 'All') && (
                    <button onClick={() => { setSearchQuery(''); setActiveCategoryFilter('All'); }} className="mt-6 text-blue-600 font-bold hover:underline">
                      Clear Filters
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

// Status Component
function SellerStatus({ status }) {
  let styles = '';
  let dot = '';
  switch(status) {
    case 'Active': 
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dot = 'bg-emerald-500';
      break;
    case 'Warning': 
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'Suspended': 
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      break;
    default: 
      styles = 'bg-slate-50 text-slate-700 border-slate-200';
      dot = 'bg-slate-500';
  }
  return (
    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest border ${styles}`}>
      <div className={`w-2 h-2 rounded-full ${dot}`}></div>
      {status}
    </span>
  );
}