/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  CreditCard,
  Lock,
  LogOut,
  Plus,
  Edit3,
  ChevronRight,
  BadgeCheck,
  Zap,
  ShoppingBag,
  Bell,
  Heart,
  Settings as SettingsIcon,
  Trash2,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Layout Components
import SEOHead from "../../components/seo/SEOHead";
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import { useProfileStore } from "../../store/profileStore";
import { useAuthStore } from "../../store/authStore";
import { useOrderStore } from "../../store/orderStore";
import { Skeleton } from "../../components/ui/Skeleton";

const fmtDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function CustomerProfile() {
  const { profile, fetchProfile, isLoading, deleteAddress, updateProfile, addAddress, deleteAccount } = useProfileStore();
  const { user: authUser, logout } = useAuthStore();
  const { orders, fetchMyOrders, deleteOrder } = useOrderStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ street: "", nearBy: "", city: "", state: "", country: "India" });

  useEffect(() => {
    fetchProfile();
    fetchMyOrders();
  }, [fetchProfile, fetchMyOrders]);

  // Auto-refresh orders every 30s when viewing orders tab
  useEffect(() => {
    if (activeTab !== "orders" && activeTab !== "overview") return;
    const interval = setInterval(() => {
      fetchMyOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchMyOrders]);

  useEffect(() => {
    if (profile) {
      setEditData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        contact: profile.contact,
        email: profile.email,
      });
    }
  }, [profile]);

  const handleUpdate = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (_err) {
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteAddr = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id);
        toast.success("Address deleted");
      } catch (_err) {
        toast.error("Failed to delete address");
      }
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Purge this order record from the Indiafy Node?")) {
      try {
        await deleteOrder(id);
        toast.success("Order record purged");
      } catch (_err) {
        toast.error("Failed to delete record");
      }
    }
  };

  const handleAddAddress = async () => {
    if (!addrForm.street.trim() || !addrForm.city.trim()) {
      toast.warning("Please fill in street and city");
      return;
    }
    try {
      await addAddress(addrForm);
      toast.success("Address saved!");
      setShowAddressForm(false);
      setAddrForm({ street: "", nearBy: "", city: "", state: "", country: "India" });
    } catch (_err) {
      toast.error("Failed to save address");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch (_err) {
      console.error("Logout issue:", _err);
      navigate("/", { replace: true });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("WARNING: Are you sure you want to permanently delete your account? All your order history, profile data, and saved addresses will be deleted permanently in accordance with GDPR Right to be Forgotten. This action is irreversible.")) {
      try {
        await deleteAccount();
        toast.success("Account permanently deleted. Hope to see you again!");
        logout();
        navigate("/", { replace: true });
      } catch (_err) {
        toast.error("Failed to delete account. Please try again.");
      }
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="bg-gray-50 min-h-screen pt-32 px-4 max-w-7xl mx-auto space-y-12">
        <div className="flex items-center gap-8 bg-white/90 rounded-[3.5rem] p-12">
          <Skeleton className="w-40 h-40 rounded" />
          <div className="space-y-4">
            <Skeleton className="w-64 h-12" />
            <Skeleton className="w-48 h-6" />
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3 space-y-4"><Skeleton className="h-[400px] rounded-[2.5rem]" /></div>
          <div className="lg:col-span-9 space-y-6"><Skeleton className="h-[200px] rounded" /><Skeleton className="h-[300px] rounded" /></div>
        </div>
      </div>
    );
  }

  if (!profile && !isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500 font-bold uppercase tracking-widest">Unable to load profile session</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-full font-bold text-xs uppercase tracking-widest">Retry</button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview", icon: Zap },
    { id: "personal", label: "Personal Info", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Order Hub", icon: ShoppingBag },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="bg-[#f1f2f4] min-h-screen text-gray-700 font-sans">
      <SEOHead 
        title="Dashboard | Indiafy"
        noindex={true}
      />
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">

      {/* Background Blobs Removed for Flat UI */}
      
        {/* HEADER HERO AREA */}
        <div className="relative mb-8">
          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end gap-8 bg-white shadow-sm border border-gray-200 rounded p-6 lg:p-8">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded bg-white border-2 border-white overflow-hidden shadow-sm relative">
                <img loading="lazy" decoding="async"
                  src={profile.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.firstName}&backgroundColor=b6e3f4`}
                  alt="User"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                   <Camera size={24} className="text-gray-900" />
                </div>
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-emerald-500 p-2.5 rounded border-4 border-zinc-900 shadow-xl"
              >
                <BadgeCheck size={24} className="text-gray-900" />
              </motion.div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <span className="px-3 py-1 bg-[#065F46]/10 text-[#065F46] text-[10px] font-bold uppercase tracking-widest rounded border border-[#065F46]/20">
                  Verified Node Member
                </span>
                <span className="px-3 py-1 bg-white text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded border border-gray-200">
                  Member since {new Date(profile.createdAt).getFullYear()}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                {profile.firstName} <span className="text-gray-600">{profile.lastName}</span>
              </h1>
              <p className="text-gray-500 text-sm flex items-center justify-center lg:justify-start gap-2">
                <Mail size={16} className="text-gray-400" /> {profile.email}
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
               <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-3 bg-[#065F46] text-white hover:bg-[#047857] rounded font-bold uppercase tracking-widest text-xs shadow-sm transition-all flex items-center justify-center gap-2"
               >
                 <Edit3 size={16} /> Edit Profile
               </button>
               <button 
                onClick={handleLogout}
                className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded font-bold uppercase tracking-widest text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
               >
                 <LogOut size={16} /> Logout
               </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* SIDEBAR NAVIGATION */}
           <div className="lg:col-span-3 space-y-4">
             <nav className="bg-white shadow-sm border border-gray-200 rounded p-4 sticky top-32">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 pl-4 pt-2">Account</p>
                <div className="space-y-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded transition-all duration-200 ${
                        activeTab === tab.id 
                          ? "bg-[#065F46]/10 text-[#065F46] border-l-4 border-[#065F46]" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                    >
                      <tab.icon size={18} className={activeTab === tab.id ? "text-[#065F46]" : "text-gray-400"} />
                      <span className="text-sm font-bold uppercase tracking-widest">{tab.label}</span>
                    </button>
                  ))}
                </div>
             </nav>
          </div>

          {/* DYNAMIC CONTENT AREA */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-3 gap-6">
                       <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} color="text-blue-500" />
                       <StatCard label="Reward Points" value={orders.length * 50} icon={Zap} color="text-emerald-500" />
                       <StatCard label="Saved Items" value="0" icon={Heart} color="text-rose-500" />
                    </div>

                    <div className="bg-white shadow-sm border border-gray-200 rounded p-6 md:p-8">
                       <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-6">Recent Activity</h3>
                       <div className="space-y-4">
                          {orders.slice(0, 3).map((order, i) => (
                            <div key={order._id} className="flex items-center gap-4 p-4 bg-white rounded border border-gray-200 hover:border-gray-300 transition-all group">
                               <div className="w-10 h-10 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
                                  <ShoppingBag size={18} />
                               </div>
                               <div className="flex-1">
                                  <p className="text-sm font-black text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{order.status} on {fmtDate(order.createdAt)}</p>
                               </div>
                               <p className="text-sm font-black text-gray-900">₹{order.totalPrice}</p>
                               <ChevronRight size={18} className="text-gray-700 group-hover:trangray-x-1 transition-transform" />
                            </div>
                          ))}
                          {orders.length === 0 && (
                            <p className="text-center text-gray-500 py-10 font-bold uppercase tracking-widest text-xs">No recent activity detected</p>
                          )}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Order Hub</h3>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{orders.length} Orders Found</p>
                    </div>

                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="bg-white shadow-sm border border-gray-200 rounded p-6 hover:border-[#065F46]/30 transition-all">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                             <div className="flex items-center justify-between w-full">
                               <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center text-gray-500 border border-gray-200">
                                   <ShoppingBag size={20} />
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order ID</p>
                                   <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">#{order._id.slice(-8).toUpperCase()}</h4>
                                 </div>
                               </div>
                               <button 
                                 onClick={() => handleDeleteOrder(order._id)}
                                 className="p-3 bg-white text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded transition-all border border-gray-200"
                                 title="Delete Order Record"
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                            <div className="flex gap-4">
                              <div className="text-right">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</p>
                                <p className="text-sm font-bold text-gray-700">{fmtDate(order.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total</p>
                                <p className="text-sm font-black text-emerald-500">₹{order.totalPrice}</p>
                              </div>
                            </div>
                          </div>                           <div className="grid md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
                             <div className="space-y-3">
                               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Package Contents</p>
                               {order.orderItems.map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded overflow-hidden border border-gray-200">
                                      <img loading="lazy" decoding="async" src={item.product?.productImage?.[0] || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-gray-700 truncate">{item.product?.productName || "Product"}</p>
                                      <p className="text-[10px] text-gray-500 font-medium">Qty: {item.quantity} • ₹{item.price}</p>
                                   </div>
                                 </div>
                               ))}
                             </div>
                             
                             <div className="flex flex-col justify-between">
                                <div className="space-y-4">
                                   <div className="flex justify-between items-center bg-white p-4 rounded border border-gray-200">
                                      <div className="flex items-center gap-3">
                                         <ShieldCheck size={16} className="text-emerald-500" />
                                         <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</p>
                                      </div>
                                       <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${
                                          order.status === "Cancelled" 
                                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                                            : order.status === "Accepted"
                                              ? "bg-blue-500/10 text-[#065F46] border-blue-500/20" 
                                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                       }`}>
                                          {order.status === "Cancelled" ? "Rejected / Cancelled" : order.status}
                                       </span>
                                   </div>
                                   {order.packingVideoUrl && (
                                     <button 
                                      onClick={() => window.open(order.packingVideoUrl)}
                                      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 border border-gray-200 text-gray-900 rounded text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-300"
                                     >
                                        <Zap size={14} className="text-yellow-400" /> View Packing Video
                                     </button>
                                   )}
                                </div>
                                <button 
                                 onClick={() => navigate(`/track-order/${order._id}`)}
                                 className="w-full mt-4 py-4 bg-white text-gray-500 rounded text-[10px] font-black uppercase tracking-widest border border-gray-200 hover:text-gray-900 hover:border-zinc-600 transition-all"
                                >
                                   Track Order Node
                                </button>
                             </div>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded">
                           <ShoppingBag size={48} className="mx-auto text-gray-700 mb-4" />
                           <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">No order history detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "personal" && (
                  <div className="bg-white shadow-sm border border-gray-200 rounded p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Personal Info</h3>
                       <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 border-b-2 border-emerald-500/20 pb-1"
                       >
                         {isEditing ? "Cancel Edit" : "Modify Details"}
                       </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                       <InfoField label="First Name" value={profile.firstName} icon={User} editing={isEditing} name="firstName" editData={editData} setEditData={setEditData} />
                       <InfoField label="Last Name" value={profile.lastName} icon={User} editing={isEditing} name="lastName" editData={editData} setEditData={setEditData} />
                       <InfoField label="Contact Number" value={profile.contact} icon={Phone} editing={isEditing} name="contact" editData={editData} setEditData={setEditData} />
                       <InfoField label="Email Address" value={profile.email} icon={Mail} disabled />
                    </div>

                    {isEditing && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleUpdate}
                        className="w-full mt-8 py-3 bg-[#065F46] text-white rounded font-bold uppercase tracking-widest text-xs shadow-sm hover:bg-[#047857] transition-all"
                      >
                        Save Details
                      </motion.button>
                    )}
                  </div>
                )}

                {activeTab === "addresses" && (
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Sector Locations</h3>
                         <button 
                           onClick={() => setShowAddressForm(!showAddressForm)}
                           className="flex items-center gap-2 px-6 py-3 bg-white shadow-sm border border-gray-200 border border-gray-200 text-gray-900 rounded font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 border border-gray-200 transition-all"
                         >
                            <Plus size={16} /> {showAddressForm ? "Cancel" : "New Location"}
                         </button>
                      </div>

                      {/* Address Form */}
                      <AnimatePresence>
                        {showAddressForm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-white shadow-sm border border-gray-200 rounded p-6 space-y-4">
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Add New Address</p>
                              <div className="grid md:grid-cols-2 gap-4">
                                <input
                                  placeholder="Label (e.g. Home, Office)"
                                  value={addrForm.nearBy}
                                  onChange={(e) => setAddrForm({...addrForm, nearBy: e.target.value})}
                                  className="bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#065F46] transition-colors"
                                />
                                <input
                                  placeholder="City"
                                  value={addrForm.city}
                                  onChange={(e) => setAddrForm({...addrForm, city: e.target.value})}
                                  className="bg-white border border-gray-200 rounded px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 transition-colors"
                                />
                              </div>
                              <input
                                placeholder="Full Street Address"
                                value={addrForm.street}
                                onChange={(e) => setAddrForm({...addrForm, street: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 transition-colors"
                              />
                              <div className="grid md:grid-cols-2 gap-4">
                                <input
                                  placeholder="State"
                                  value={addrForm.state}
                                  onChange={(e) => setAddrForm({...addrForm, state: e.target.value})}
                                  className="bg-white border border-gray-200 rounded px-5 py-4 text-sm font-bold text-gray-900 outline-none focus:border-emerald-500 transition-colors"
                                />
                                <input
                                  placeholder="PIN Code / Country"
                                  value={addrForm.country}
                                  onChange={(e) => setAddrForm({...addrForm, country: e.target.value})}
                                  className="bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#065F46] transition-colors"
                                />
                              </div>
                              <button
                                onClick={handleAddAddress}
                                className="w-full py-3 bg-[#065F46] text-white rounded font-bold uppercase tracking-widest text-xs shadow-sm hover:bg-[#047857] transition-all mt-2"
                              >
                                Save Address
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid md:grid-cols-2 gap-4">
                        {profile.address?.map((addr, i) => (
                          <div key={addr._id || i} className="group bg-white shadow-sm border border-gray-200 rounded p-6 hover:border-[#065F46]/30 transition-all relative">
                             <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center text-gray-500 group-hover:text-[#065F46] transition-colors border border-gray-200">
                                   <MapPin size={18} />
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleDeleteAddr(addr._id)} className="p-2 text-gray-700 hover:text-red-500 transition-colors">
                                     <Trash2 size={16} />
                                  </button>
                                </div>
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Location: {addr.nearBy || "Address"}</p>
                             <h4 className="text-lg font-black text-gray-900 mb-2 leading-tight uppercase tracking-tight">{addr.street}</h4>
                             <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter">{addr.city}, {addr.state} - {addr.country}</p>
                             
                             {i === 0 && (
                               <div className="absolute top-6 right-16">
                                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">Default</span>
                               </div>
                             )}
                          </div>
                        ))}
                        {(!profile.address || profile.address.length === 0) && (
                          <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-gray-200 rounded">
                             <MapPin size={48} className="mx-auto text-gray-700 mb-4" />
                             <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">No saved addresses detected</p>
                             <button 
                               onClick={() => setShowAddressForm(true)}
                               className="mt-4 px-6 py-3 bg-gray-100 border border-gray-200 text-gray-900 rounded font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                             >
                               Add Your First Address
                             </button>
                          </div>
                        )}
                      </div>
                   </div>
                )}

                {activeTab === "security" && (
                  <div className="max-w-2xl space-y-6">
                    <SecurityCard 
                      title="Two-Step Verification" 
                      desc="Secure your account with multi-factor biometric authentication via Indiafy Node."
                      active={true}
                    />
                    <SecurityCard 
                      title="Device Session Control" 
                      desc="Active sessions detected from 2 devices in Gurugram, India."
                      active={true}
                    />
                    <button className="w-full p-6 bg-white shadow-sm border border-gray-200 rounded flex items-center justify-between group hover:border-[#065F46]/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-500 group-hover:text-gray-900">
                             <Lock size={18} />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Password Reset</p>
                             <p className="text-xs text-gray-500 font-medium mt-1">Change your login password.</p>
                          </div>
                       </div>
                       <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900" />
                    </button>
                    
                    {/* GDPR Danger Zone */}
                    <div className="p-6 bg-red-50 border border-red-200 rounded space-y-4 mt-8">
                       <div className="flex items-start gap-4">
                          <div className="bg-red-500/10 p-3 rounded shrink-0 border border-red-500/20">
                             <Trash2 className="w-6 h-6 text-red-500" />
                          </div>
                          <div>
                             <h4 className="text-gray-900 font-bold text-base mb-1 tracking-tight">Danger Zone: GDPR Data Erasure</h4>
                             <p className="text-gray-500 text-xs font-semibold leading-relaxed">
                                In accordance with GDPR (General Data Protection Regulation), you have the Right to Erasure ("Right to be Forgotten"). Clicking the button below will immediately and permanently delete your account, order history, profile details, and address records.
                             </p>
                          </div>
                       </div>
                       <button
                         onClick={handleDeleteAccount}
                         className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                       >
                          <Trash2 size={14} /> Request Account Erasure
                       </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM BANNER REMOVED FOR CLEANER UI */}
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded p-6 group hover:border-gray-300 transition-all">
      <div className={`w-10 h-10 rounded bg-gray-50 border border-gray-200 flex items-center justify-center ${color} mb-4`}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoField({ label, value, icon: Icon, editing, name, editData, setEditData, disabled }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 pl-2">{label}</label>
      <div className={`flex items-center gap-3 p-4 bg-white rounded border ${editing && !disabled ? "border-[#065F46]/50 bg-[#065F46]/5" : "border-gray-200"}`}>
        <Icon size={16} className="text-gray-400" />
        {editing && !disabled ? (
          <input 
            type="text" 
            value={editData[name] || ""} 
            onChange={(e) => setEditData({ ...editData, [name]: e.target.value })}
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full"
          />
        ) : (
          <p className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}>{value || "Not Set"}</p>
        )}
      </div>
    </div>
  );
}

function SecurityCard({ title, desc, active }) {
  return (
    <div className="p-6 bg-white shadow-sm border border-gray-200 rounded flex items-center justify-between group hover:border-gray-300 transition-all">
       <div className="space-y-1">
          <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">{title}</p>
          <p className="text-xs text-gray-500 font-medium max-w-sm">{desc}</p>
       </div>
       <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${active ? "bg-[#065F46]" : "bg-gray-100 border border-gray-200"}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? "trangray-x-5" : "trangray-x-0"}`} />
       </div>
    </div>
  );
}
