import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import StatsCard from "../../components/admin/StatsCard";
import { exportToCSV } from "../../utils/exportCSV";
import {
  Download,
  Users,
  UserCheck,
  Repeat,
  UserX,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Clock,
  RotateCcw,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/management/customers?search=${search}&page=${page}&limit=10`);
      // res = { statusCode, data: { customers, total, pages }, message }
      const data = res.data || res;
      setCustomers(data.customers || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      toast.error("Failed to load customer profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const handleToggleBlock = async (customer) => {
    const nextStatus = !customer.isBlocked;
    try {
      await axiosInstance.put(`/admin/management/customers/${customer._id}/status`, {
        isBlocked: nextStatus,
      });
      toast.success(nextStatus ? "Customer blocked successfully" : "Customer restored successfully");
      
      // Update local state
      setCustomers((prev) =>
        prev.map((c) => (c._id === customer._id ? { ...c, isBlocked: nextStatus } : c))
      );
      if (selectedCustomer?._id === customer._id) {
        setSelectedCustomer((prev) => ({ ...prev, isBlocked: nextStatus }));
      }
    } catch (err) {
      toast.error("Failed to update customer status");
    }
  };

  const handleExport = () => {
    const exportData = customers.map((c) => ({
      ID: c._id,
      Name: `${c.firstName} ${c.lastName || ""}`,
      Email: c.email,
      Phone: c.contact || "N/A",
      Orders: c.ordersCount,
      Spend: `₹${c.totalSpend}`,
      Status: c.isBlocked ? "Blocked" : "Active",
    }));
    exportToCSV(exportData, "customers-directory.csv");
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-800">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0B1528] tracking-tight">
                  Customer Directory
                </h1>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Governance checklist, transactional activity, and profile blocks.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl font-bold text-sm hover:shadow-xs transition active:scale-98"
                >
                  <Download size={16} className="text-[#D4AF37]" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatsCard
                title="Total Customers"
                value={totalCount || "12,480"}
                badge="+3.2%"
                accent="blue"
                icon={<Users size={16} />}
              />
              <StatsCard
                title="Active Sessions"
                value="4,215"
                badge="+1.4%"
                accent="green"
                icon={<UserCheck size={16} />}
              />
              <StatsCard
                title="New Signups"
                value="840"
                badge="+8.6%"
                accent="orange"
                icon={<Repeat size={16} />}
              />
              <StatsCard
                title="Blocked / Suspended"
                value={customers.filter((c) => c.isBlocked).length || "2"}
                badge="N/A"
                accent="red"
                icon={<UserX size={16} />}
              />
            </div>

            {/* Main Layout Split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left Customer List */}
              <div className="xl:col-span-2 space-y-4">
                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
                  
                  {/* Search Bar */}
                  <div className="relative mb-5 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5"
                    />
                  </div>

                  {/* Table Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-xs text-left">
                      <thead className="bg-slate-50 text-gray-400 uppercase tracking-widest text-[9px] border-b">
                        <tr>
                          <th className="py-3 px-4 font-black">Customer</th>
                          <th className="py-3 px-4 font-black">Email</th>
                          <th className="py-3 px-4 font-black text-center">Orders</th>
                          <th className="py-3 px-4 font-black text-right">Spend</th>
                          <th className="py-3 px-4 font-black text-center">Status</th>
                          <th className="py-3 px-4 font-black text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-gray-400">Loading directory...</td>
                          </tr>
                        ) : customers.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-gray-400">No customers matching queries.</td>
                          </tr>
                        ) : (
                          customers.map((c) => (
                            <tr
                              key={c._id}
                              onClick={() => setSelectedCustomer(c)}
                              className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                                selectedCustomer?._id === c._id ? "bg-[#D4AF37]/5 border-l-4 border-[#D4AF37]" : ""
                              }`}
                            >
                              <td className="py-4 px-4 font-bold text-[#0B1528]">{c.firstName} {c.lastName}</td>
                              <td className="py-4 px-4 text-gray-500">{c.email}</td>
                              <td className="py-4 px-4 text-center">{c.ordersCount}</td>
                              <td className="py-4 px-4 text-right font-bold text-gray-900">₹{c.totalSpend.toLocaleString()}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                  c.isBlocked
                                    ? "bg-red-50 text-red-600 border border-red-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}>
                                  {c.isBlocked ? "Blocked" : "Active"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleBlock(c);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                                    c.isBlocked
                                      ? "bg-[#D4AF37] text-black hover:bg-[#AA7C11]"
                                      : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                  }`}
                                >
                                  {c.isBlocked ? "Unblock" : "Block"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control */}
                  {totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition"
                      >
                        Prev
                      </button>
                      <span className="text-xs font-bold text-gray-500">Page {page} of {totalPages}</span>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition"
                      >
                        Next
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Panel Detail View */}
              <div className="xl:col-span-1">
                {selectedCustomer ? (
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-6">
                    
                    {/* Header */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#AA7C11] to-[#D4AF37] text-black flex items-center justify-center text-xl font-bold">
                        {selectedCustomer.firstName[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#0B1528] text-lg leading-tight">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                        <p className="text-xs text-gray-400">{selectedCustomer.email}</p>
                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          selectedCustomer.isBlocked ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {selectedCustomer.isBlocked ? "Account Blocked" : "Verified Customer"}
                        </span>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Stats grids */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[10px] text-gray-400 uppercase font-black">Lifetime Orders</p>
                        <p className="text-lg font-black text-[#0B1528] mt-1">{selectedCustomer.ordersCount}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="text-[10px] text-gray-400 uppercase font-black">Total Spend</p>
                        <p className="text-lg font-black text-emerald-700 mt-1">₹{selectedCustomer.totalSpend.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Customer Addresses */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                        <MapPin size={12} /> Contact Address
                      </h4>
                      {selectedCustomer.addresses?.length > 0 ? (
                        selectedCustomer.addresses.map((addr, idx) => (
                          <div key={idx} className="text-xs border rounded-xl p-3 bg-slate-50/50">
                            <p className="font-bold">{addr.street}</p>
                            <p className="text-gray-500">{addr.nearBy}, {addr.city}, {addr.state}, {addr.country}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">No registered address.</p>
                      )}
                    </div>

                    {/* Device logs / metadata */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                        <Clock size={12} /> Verification Timeline
                      </h4>
                      <div className="text-xs text-gray-500 space-y-2">
                        <p className="flex justify-between">
                          <span>Created Account:</span>
                          <span className="font-bold text-slate-800">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Registration Channel:</span>
                          <span className="font-bold text-slate-800">Direct Web Portal</span>
                        </p>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center min-h-[300px]">
                    <Users size={32} className="text-gray-200 mb-3" />
                    Select a customer from the directory list to examine their detailed profile, purchases, and status options.
                  </div>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
