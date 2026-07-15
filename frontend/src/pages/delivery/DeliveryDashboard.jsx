import React, { useState, useEffect } from "react";
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Star, 
  Clock, 
  CheckCircle, 
  Shield, 
  TrendingUp, 
  User, 
  LogOut, 
  Activity 
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SEOHead from "../../components/seo/SEOHead";

export default function DeliveryDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/delivery/dashboard");
        if (response.data?.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load delivery statistics", error);
        toast.error("Could not fetch delivery details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <SEOHead title="Delivery Control Center | Indiafy" noindex={true} />
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium">Securing logistics terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <SEOHead title="Delivery Control Center | Indiafy" noindex={true} />

      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Truck size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Delivery Operations Control</h1>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Terminal Active
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              Welcome back, {user?.firstName || "Delivery Partner"} • ID: {user?._id?.slice(-6)?.toUpperCase()}
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="px-5 py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/20 rounded-2xl font-bold text-sm text-slate-300 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <LogOut size={16} />
          Logout Terminal
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* ACTIVE DELIVERIES */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-lg flex justify-between items-start">
          <div>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Active Deliveries</p>
            <h2 className="text-3xl font-black mt-2 text-white">{stats?.activeDeliveries || 0}</h2>
            <span className="text-[10px] font-bold text-slate-450 mt-2 block">Assigned in progress</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Activity size={22} />
          </div>
        </div>

        {/* PENDING PICKUPS */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-lg flex justify-between items-start">
          <div>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Pending Pickup</p>
            <h2 className="text-3xl font-black mt-2 text-white">{stats?.pendingRequests || 0}</h2>
            <span className="text-[10px] font-bold text-slate-455 mt-2 block text-amber-400">Awaiting processing</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock size={22} />
          </div>
        </div>

        {/* COMPLETED DELIVERIES */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-lg flex justify-between items-start">
          <div>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Completed Orders</p>
            <h2 className="text-3xl font-black mt-2 text-white">{stats?.completedDeliveries || 0}</h2>
            <span className="text-[10px] font-bold text-emerald-450 mt-2 block text-emerald-400">Total success rate</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle size={22} />
          </div>
        </div>

        {/* EARNINGS */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-lg flex justify-between items-start">
          <div>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Earnings This Week</p>
            <h2 className="text-2xl font-black mt-2 text-white">₹{(stats?.earningsThisWeek || 0).toLocaleString('en-IN')}</h2>
            <span className="text-[10px] font-bold text-slate-450 mt-2.5 flex items-center gap-0.5 text-emerald-400">
              <TrendingUp size={12} /> Direct payout active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
            <DollarSign size={22} />
          </div>
        </div>

      </div>

      {/* OPERATIONS SCHEDULE SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT ASSIGNED TASK LOG */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Truck size={20} className="text-slate-450" />
              Live Delivery Manifest
            </h2>
            <span className="text-xs font-semibold text-slate-400">Real-time status updates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-450 text-xs uppercase tracking-wider font-bold">
                  <th className="pb-3 pl-2">Task ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Address</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats?.recentDeliveries?.map((task, index) => (
                  <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 pl-2 font-bold text-sm text-slate-300">{task.id}</td>
                    <td className="py-4 font-semibold text-sm text-slate-100">{task.customerName}</td>
                    <td className="py-4 text-slate-400 text-sm flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-500" />
                      {task.address}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                        task.status === 'In Transit' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                        task.status === 'Pending Pickup' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                        'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECURITY & PROFILE SUMMARY */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Shield size={20} className="text-slate-450" />
              Logistics Terminal Security
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Star size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Driver Rating</p>
                  <p className="text-sm font-bold mt-0.5 text-white">{stats?.rating || "N/A"} / 5.0 Rating</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Clearance</p>
                  <p className="text-sm font-bold mt-0.5 text-white">Active Delivery Partner</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center">
            <p className="text-xs text-slate-450 leading-relaxed">
              Logistics terminal secure access. All location routes are monitored for tracking verification.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
