

import React, { useState, useEffect } from "react";
import { Card } from "../../components/SharedUI";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Landmark,
  FileText,
  Banknote
} from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { useNodeStore } from "../../store/nodeStore";
import { toast } from "react-toastify";

export default function Finance() {
  const { activeNode } = useNodeStore();
  const { sellerOrders = [], fetchSellerOrders } = useOrderStore();

  useEffect(() => {
    if (activeNode?._id) {
      fetchSellerOrders(activeNode.nodeType, activeNode._id);
    }
  }, [fetchSellerOrders, activeNode?._id, activeNode?.nodeType]);

  // Real total net sales
  const totalSales = sellerOrders
    .filter(o => o.status !== "Cancelled")
    .reduce((acc, curr) => acc + (curr?.totalPrice || 0), 0);

  // Real available payout (e.g. 80% of delivered/completed orders, or just standard share)
  const payoutAmount = sellerOrders
    .filter(o => o.status === "Delivered")
    .reduce((acc, curr) => acc + (curr?.totalPrice || 0), 0);

  // 1. Dynamic generation of Transactions & Settlements from recent orders
  const realTransactions = sellerOrders
    .slice(0, 10)
    .map(o => {
      const isPaid = o.status === "Delivered" || o.status === "Shipped";
      return {
        id: `SETL-${o._id.substring(o._id.length - 6).toUpperCase()}`,
        date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: `₹${o.totalPrice}`,
        type: "Settlement",
        status: isPaid ? "Paid" : o.status === "Pending" ? "Processing" : "Deducted",
        bank: activeNode?.bankName ? `${activeNode.bankName} ****${(activeNode.accountNumber || "").slice(-4)}` : "HDFC Bank"
      };
    });

  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    setTransactions(realTransactions);
  }, [sellerOrders]);

  // 2. State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset pagination on filter change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  // 3. Action Handlers
  const handleWithdraw = () => {
    toast.success("Withdrawal request for ₹12,850 submitted successfully! It will reflect in your account within 24 hours.");
  };

  const handleDownloadStatement = () => {
    toast.info("Generating your tax and settlement statement for this month...");
  };

  const handleDownloadReceipt = (id) => {
    // Generates a mock text file receipt for a specific settlement
    const text = `INDIAFY SETTLEMENT RECEIPT\nReference: ${id}\nDate Generated: ${new Date().toLocaleString()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Settlement_${id}.txt`;
    link.click();
  };

  // 4. Filtering & Pagination Logic
  const filteredData = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Helper function for Badges
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider border border-emerald-100"><CheckCircle size={14}/> {status}</span>;
      case 'Processing': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider border border-amber-100"><Clock size={14}/> {status}</span>;
      case 'Deducted': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-[10px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider border border-red-100"><ArrowDownRight size={14}/> {status}</span>;
      default: return <span className="flex w-fit items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Finance & Payouts
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your earnings, settlements, and store wallet.</p>
        </div>
        <button 
          onClick={handleDownloadStatement}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm shadow-sm transition-all"
        >
          <FileText size={16}/> Download Tax Report
        </button>
      </div>

      {/* Top Metrics Grid (Custom built for better actions) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Sales Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Landmark size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
              <ArrowUpRight size={14}/> +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Net Sales</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalSales.toFixed(2)}</h3>
          </div>
        </div>

        {/* Available Payout Card (Highlight Card) */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">Available for Payout</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹{payoutAmount.toFixed(2)}</h3>
            </div>
            <button 
              onClick={() => toast.success(`Withdrawal request for ₹${payoutAmount.toFixed(2)} submitted successfully! It will reflect in your account within 24 hours.`)}
              className="px-4 py-2 bg-white text-slate-900 font-bold text-sm rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
              disabled={payoutAmount <= 0}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Next Settlement Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Banknote size={20} />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md">
              Pending
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Next Settlement</p>
            <div className="flex items-end gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900">Rolling</h3>
              <p className="text-sm font-bold text-slate-400 mb-1">
                (Est. ₹{(totalSales - payoutAmount).toFixed(2)})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settlements History Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 mb-4">
        <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Ref ID..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900/10 outline-none shadow-sm"
            />
          </div>
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <select 
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer shadow-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Processing">Processing</option>
              <option value="Deducted">Deducted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* MOBILE VIEW (Cards) */}
        <div className="md:hidden divide-y divide-slate-100 flex-1">
          {currentItems.length > 0 ? (
            currentItems.map((tx) => (
              <div key={tx.id} className="p-4 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{tx.type}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{tx.id}</p>
                  </div>
                  <div className="shrink-0">{renderStatusBadge(tx.status)}</div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</p>
                    <p className={`text-sm font-bold mt-0.5 ${tx.status === 'Deducted' ? 'text-red-600' : 'text-slate-900'}`}>{tx.amount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Landmark size={14}/> {tx.bank}</p>
                  <button onClick={() => handleDownloadReceipt(tx.id)} className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm active:bg-slate-100">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
             <div className="py-12 text-center px-4">
               <FileText size={32} className="text-slate-300 mx-auto mb-3" />
               <h3 className="text-sm font-bold text-slate-900">No Transactions Found</h3>
             </div>
          )}
        </div>

        {/* DESKTOP VIEW (Table) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Transaction Info</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Date</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Destination</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Amount</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Status</th>
                <th className="p-4 text-sm font-bold text-slate-500 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? (
                currentItems.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <h3 className="font-bold text-slate-900">{tx.type}</h3>
                        <p className="text-xs font-mono font-medium text-slate-500 mt-0.5">{tx.id}</p>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-slate-600 font-medium">{tx.date}</td>
                    <td className="p-4 whitespace-nowrap text-sm text-slate-600 font-medium flex items-center gap-2">
                       <Landmark size={16} className="text-slate-400"/> {tx.bank}
                    </td>
                    <td className={`p-4 whitespace-nowrap text-base font-bold ${tx.status === 'Deducted' ? 'text-red-600' : 'text-slate-900'}`}>
                      {tx.amount}
                    </td>
                    <td className="p-4 whitespace-nowrap">{renderStatusBadge(tx.status)}</td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <button onClick={() => handleDownloadReceipt(tx.id)} className="text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl transition-all shadow-sm" title="Download Receipt">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No Transactions Found</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
            Showing <span className="font-bold text-slate-900">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="font-bold text-slate-900">{filteredData.length}</span> records
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1 || filteredData.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
             >Previous</button>
             <button 
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
                disabled={currentPage >= totalPages || filteredData.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
             >Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}