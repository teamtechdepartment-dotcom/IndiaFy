
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Video, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Boxes,
  X,
  FileText,
  MapPin,
  ShoppingBag
} from 'lucide-react';

export default function History() {
  const [historyData] = useState([
    { id: "ORD-150", customer: "Vikas M.", phone: "+91 98765 43210", location: "Sector 22, Chandigarh", date: "Feb 18, 2026, 04:30 PM", amount: "₹1,850", items: "3 Items", status: "Delivered", video: true },
    { id: "ORD-149", customer: "Suresh K.", phone: "+91 98765 43211", location: "Sector 21, Chandigarh", date: "Feb 17, 2026, 01:15 PM", amount: "₹2,100", items: "1 Item", status: "Delivered", video: true },
    { id: "ORD-148", customer: "Priya Sharma", phone: "+91 98765 43212", location: "Sector 17, Chandigarh", date: "Feb 16, 2026, 11:20 AM", amount: "₹950", items: "2 Items", status: "Returned", video: true },
    { id: "ORD-147", customer: "Amit Patel", phone: "+91 98765 43213", location: "Sector 34, Chandigarh", date: "Feb 15, 2026, 06:45 PM", amount: "₹4,200", items: "5 Items", status: "Delivered", video: false },
    { id: "ORD-146", customer: "Neha Kapoor", phone: "+91 98765 43214", location: "Sector 15, Chandigarh", date: "Feb 15, 2026, 09:10 AM", amount: "₹350", items: "1 Item", status: "Cancelled", video: false },
    { id: "ORD-145", customer: "Rahul Singh", phone: "+91 98765 43215", location: "Phase 3B2, Mohali", date: "Feb 14, 2026, 02:20 PM", amount: "₹1,200", items: "2 Items", status: "Delivered", video: true },
    { id: "ORD-144", customer: "Anjali Verma", phone: "+91 98765 43216", location: "Sector 8, Panchkula", date: "Feb 13, 2026, 10:05 AM", amount: "₹5,600", items: "8 Items", status: "Delivered", video: true },
    { id: "ORD-143", customer: "Karan Gupta", phone: "+91 98765 43217", location: "Sector 43, Chandigarh", date: "Feb 12, 2026, 05:50 PM", amount: "₹780", items: "1 Item", status: "Returned", video: false },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null); 
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredHistory = historyData.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return alert("No data to export.");
    const headers = ["Order ID", "Customer", "Date", "Amount", "Items", "Status", "Video Verified"];
    const rows = filteredHistory.map(order => [
      order.id, `"${order.customer}"`, `"${order.date}"`, `"${order.amount}"`, order.items, order.status, order.video ? "Yes" : "No"
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Indiafy_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReceipt = (order) => {
    const receiptText = `
INDIAFY SELLER PORTAL - ORDER RECEIPT
=====================================
Order ID     : ${order.id}
Status       : ${order.status.toUpperCase()}
Date         : ${order.date}

CUSTOMER DETAILS
-------------------------------------
Name         : ${order.customer}
Phone        : ${order.phone}
Address      : ${order.location}

ORDER DETAILS
-------------------------------------
Items count  : ${order.items}
Total Amount : ${order.amount}
Video Secured: ${order.video ? 'Yes - Footage attached to system' : 'No - Manual packing'}

=====================================
Thank you for fulfilling with Indiafy!
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Receipt_${order.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider border border-emerald-100"><CheckCircle size={14}/> {status}</span>;
      case 'Cancelled': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-[10px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider border border-red-100"><XCircle size={14}/> {status}</span>;
      case 'Returned': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider border border-amber-100"><RotateCcw size={14}/> {status}</span>;
      default: return <span className="flex w-fit items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] md:text-[11px] font-bold rounded-lg uppercase tracking-wider border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Order History
            <span className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
              {filteredHistory.length}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review your past fulfillments, returns, and settlements.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID or Customer..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-sm"
            />
          </div>

          {/* FIX: Filter Dropdown Icon moved to the Left */}
          <div className="relative w-full sm:w-40 shrink-0">
            {/* Icon moved to left-3 */}
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <select 
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              // Padding swapped: pl-10 (left) and pr-4 (right)
              className="w-full appearance-none pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-sm cursor-pointer transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button 
            onClick={handleExportCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-sm shadow-sm transition-all shrink-0"
          >
            <Download size={16}/> Export CSV
          </button>
        </div>
      </div>

      {/* RESPONSIVE LIST/TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* MOBILE VIEW */}
        <div className="md:hidden divide-y divide-slate-100 flex-1">
          {currentItems.length > 0 ? (
            currentItems.map((order) => (
              <div key={order.id} className="p-4 space-y-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{order.id}</h3>
                    <p className="text-sm font-medium text-slate-600 mt-1">{order.customer}</p>
                  </div>
                  <div className="shrink-0">{renderStatusBadge(order.status)}</div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{order.amount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    {order.video ? (
                      <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 w-fit rounded-md border border-blue-100">
                        <Video size={12} /> <span className="text-[10px] font-bold uppercase tracking-wide">Secured</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">— No Video</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDownloadReceipt(order)} className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm active:bg-slate-100">
                      <Download size={16} />
                    </button>
                    <button onClick={() => setSelectedOrder(order)} className="p-2 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg shadow-sm active:bg-blue-100">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="py-16 text-center px-4">
               <Boxes size={32} className="text-slate-300 mx-auto mb-3" />
               <h3 className="text-base font-bold text-slate-900">No Orders Found</h3>
             </div>
          )}
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Order Info</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Date & Time</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Amount</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Status</th>
                <th className="p-4 text-sm font-bold text-slate-500 whitespace-nowrap">Security</th>
                <th className="p-4 text-sm font-bold text-slate-500 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? (
                currentItems.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div>
                        <h3 className="font-bold text-slate-900">{order.id}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-slate-500">{order.customer}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">{order.items}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm text-slate-600 font-medium">{order.date}</td>
                    <td className="p-4 whitespace-nowrap text-base font-bold text-slate-900">{order.amount}</td>
                    <td className="p-4 whitespace-nowrap">{renderStatusBadge(order.status)}</td>
                    <td className="p-4 whitespace-nowrap">
                      {order.video ? (
                        <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2.5 py-1.5 w-fit rounded-lg border border-blue-100" title="Video proof attached">
                          <Video size={14} />
                          <span className="text-[11px] font-bold uppercase tracking-wide">Secured</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium px-4">—</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-2 rounded-xl transition-all shadow-sm">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDownloadReceipt(order)} className="text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 p-2 rounded-xl transition-all shadow-sm">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Boxes size={32} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Orders Found</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
            Showing <span className="font-bold text-slate-900">{filteredHistory.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastItem, filteredHistory.length)}</span> of <span className="font-bold text-slate-900">{filteredHistory.length}</span> orders
          </p>
          
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1 || filteredHistory.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-slate-900 transition-all"
             >
                Previous
             </button>
             <button 
                onClick={handleNextPage} 
                disabled={currentPage >= totalPages || filteredHistory.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-slate-900 transition-all"
             >
                Next
             </button>
          </div>
        </div>

      </div>

      {/* --- MODAL FOR ORDER DETAILS --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="relative flex flex-col bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedOrder.id}</h2>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{selectedOrder.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 min-h-0 custom-scrollbar">
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                  {renderStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">{selectedOrder.amount}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Customer Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="p-1.5 bg-slate-100 text-slate-500 rounded-md shrink-0"><Eye size={16}/></span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedOrder.customer}</p>
                      <p className="text-xs text-slate-500 font-medium">{selectedOrder.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="p-1.5 bg-slate-100 text-slate-500 rounded-md shrink-0"><MapPin size={16}/></span>
                    <p className="text-sm font-medium text-slate-700 mt-1">{selectedOrder.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Fulfillment Data</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-slate-400"/>
                    <span className="text-sm font-bold text-slate-700">{selectedOrder.items} processed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video size={16} className={selectedOrder.video ? "text-blue-500" : "text-slate-400"}/>
                    <span className={`text-sm font-bold ${selectedOrder.video ? "text-blue-600" : "text-slate-500"}`}>
                      {selectedOrder.video ? "Video Secured" : "Manual Dispatch"}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex flex-col sm:flex-row gap-3">
              <button onClick={() => setSelectedOrder(null)} className="w-full sm:flex-1 py-3 sm:py-2.5 font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all">Close</button>
              <button onClick={() => { handleDownloadReceipt(selectedOrder); setSelectedOrder(null); }} className="w-full sm:flex-1 py-3 sm:py-2.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                <Download size={18}/> Save Receipt
              </button>
               <div className="h-60 w-full md:hidden shrink-0"></div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}