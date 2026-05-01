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
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import { useProfileStore } from "../../store/profileStore";
import { useAuthStore } from "../../store/authStore";
import { useOrderStore } from "../../store/orderStore";

const fmtDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function CustomerProfile() {
  const { profile, fetchProfile, isLoading, deleteAddress, updateProfile, addAddress } = useProfileStore();
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
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteAddr = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id);
        toast.success("Address deleted");
      } catch (err) {
        toast.error("Failed to delete address");
      }
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Purge this order record from the Indiafy Node?")) {
      try {
        await deleteOrder(id);
        toast.success("Order record purged");
      } catch (err) {
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
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 animate-pulse">
            Synchronizing Node...
          </p>
        </div>
      </div>
    );
  }

  if (!profile && !isLoading) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-zinc-500 font-bold uppercase tracking-widest">Unable to load profile session</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest">Retry</button>
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
    <div className="bg-[#050505] min-h-screen text-zinc-400 font-sans selection:bg-emerald-500/30">
      <WebsiteNavbar />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        {/* HEADER HERO AREA */}
        <div className="relative mb-12">
          {/* Animated Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end gap-8 bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl rounded-[3.5rem] p-8 lg:p-12 shadow-2xl">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-zinc-800 to-zinc-900 border-4 border-zinc-950 overflow-hidden shadow-2xl relative">
                <img
                  src={profile.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.firstName}&backgroundColor=b6e3f4`}
                  alt="User"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                   <Camera size={24} className="text-white" />
                </div>
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-emerald-500 p-2.5 rounded-2xl border-4 border-zinc-900 shadow-xl"
              >
                <BadgeCheck size={24} className="text-white" />
              </motion.div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                  Verified Node Member
                </span>
                <span className="px-4 py-1.5 bg-zinc-950/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-zinc-800">
                  Member since {new Date(profile.createdAt).getFullYear()}
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
                {profile.firstName} <span className="text-zinc-700 italic">{profile.lastName}</span>
              </h1>
              <p className="text-zinc-500 font-bold flex items-center justify-center lg:justify-start gap-2">
                <Mail size={16} className="text-zinc-700" /> {profile.email}
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
               <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-4 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
               >
                 <Edit3 size={16} /> Edit Profile
               </button>
               <button 
                onClick={() => logout()}
                className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-red-950/20 hover:text-red-500 transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-500/20"
               >
                 <LogOut size={16} /> Logout Session
               </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-3 space-y-4">
             <nav className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-4 sticky top-32">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 pl-4 pt-2">Account Management</p>
                <div className="space-y-2">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 group ${
                        activeTab === tab.id 
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
                      }`}
                    >
                      <tab.icon size={18} className={activeTab === tab.id ? "text-white" : "group-hover:scale-110 transition-transform"} />
                      <span className="text-sm font-black uppercase tracking-tight">{tab.label}</span>
                      {activeTab === tab.id && <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
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

                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-10">
                       <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Recent Activity</h3>
                       <div className="space-y-6">
                          {orders.slice(0, 3).map((order, i) => (
                            <div key={order._id} className="flex items-center gap-6 p-6 bg-zinc-950/50 rounded-3xl border border-zinc-800/30 hover:border-zinc-700 transition-all group">
                               <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-colors">
                                  <ShoppingBag size={20} />
                               </div>
                               <div className="flex-1">
                                  <p className="text-sm font-black text-zinc-200">Order #{order._id.slice(-6).toUpperCase()}</p>
                                  <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest mt-1">{order.status} on {fmtDate(order.createdAt)}</p>
                               </div>
                               <p className="text-sm font-black text-white">₹{order.totalPrice}</p>
                               <ChevronRight size={18} className="text-zinc-800 group-hover:translate-x-1 transition-transform" />
                            </div>
                          ))}
                          {orders.length === 0 && (
                            <p className="text-center text-zinc-600 py-10 font-bold uppercase tracking-widest text-xs">No recent activity detected</p>
                          )}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Order Hub</h3>
                       <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">{orders.length} Orders Found</p>
                    </div>

                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                             <div className="flex items-center justify-between w-full">
                               <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                   <ShoppingBag size={24} />
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Order ID</p>
                                   <h4 className="text-lg font-black text-white uppercase tracking-tight">#{order._id.slice(-8).toUpperCase()}</h4>
                                 </div>
                               </div>
                               <button 
                                 onClick={() => handleDeleteOrder(order._id)}
                                 className="p-3 bg-zinc-950/50 text-zinc-800 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-zinc-800/50"
                                 title="Delete Order Record"
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                            <div className="flex gap-4">
                              <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Date</p>
                                <p className="text-sm font-bold text-zinc-300">{fmtDate(order.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total</p>
                                <p className="text-sm font-black text-emerald-500">₹{order.totalPrice}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8 border-t border-zinc-800/50 pt-8">
                             <div className="space-y-4">
                               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Package Contents</p>
                               {order.orderItems.map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-800">
                                      <img src={item.product?.productImage?.[0] || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-zinc-300 truncate uppercase">{item.product?.productName || "Sony WH-1000XM5"}</p>
                                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">Qty: {item.quantity} • ₹{item.price}</p>
                                   </div>
                                 </div>
                               ))}
                             </div>
                             
                             <div className="flex flex-col justify-between">
                                <div className="space-y-4">
                                   <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                                      <div className="flex items-center gap-3">
                                         <ShieldCheck size={16} className="text-emerald-500" />
                                         <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</p>
                                      </div>
                                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                         {order.status}
                                      </span>
                                   </div>
                                   {order.packingVideoUrl && (
                                     <button 
                                      onClick={() => window.open(order.packingVideoUrl)}
                                      className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all border border-zinc-700"
                                     >
                                        <Zap size={14} className="text-yellow-400" /> View Packing Video
                                     </button>
                                   )}
                                </div>
                                <button 
                                 onClick={() => navigate(`/track-order/${order._id}`)}
                                 className="w-full mt-4 py-4 bg-zinc-950 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-zinc-800 hover:text-white hover:border-zinc-600 transition-all"
                                >
                                   Track Order Node
                                </button>
                             </div>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
                           <ShoppingBag size={48} className="mx-auto text-zinc-800 mb-4" />
                           <p className="text-zinc-600 font-bold uppercase tracking-[0.2em] text-xs">No order history detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "personal" && (
                  <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-10">
                    <div className="flex items-center justify-between mb-12">
                       <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Identity Profile</h3>
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
                        className="w-full mt-12 py-5 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-900/20 hover:bg-emerald-400 transition-all"
                      >
                        Save Updated Identity
                      </motion.button>
                    )}
                  </div>
                )}

                {activeTab === "addresses" && (
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Sector Locations</h3>
                         <button 
                           onClick={() => setShowAddressForm(!showAddressForm)}
                           className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all"
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
                            <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-[2.5rem] p-8 space-y-4">
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Add New Address</p>
                              <div className="grid md:grid-cols-2 gap-4">
                                <input
                                  placeholder="Label (e.g. Home, Office)"
                                  value={addrForm.nearBy}
                                  onChange={(e) => setAddrForm({...addrForm, nearBy: e.target.value})}
                                  className="bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                                />
                                <input
                                  placeholder="City"
                                  value={addrForm.city}
                                  onChange={(e) => setAddrForm({...addrForm, city: e.target.value})}
                                  className="bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                                />
                              </div>
                              <input
                                placeholder="Full Street Address"
                                value={addrForm.street}
                                onChange={(e) => setAddrForm({...addrForm, street: e.target.value})}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                              />
                              <div className="grid md:grid-cols-2 gap-4">
                                <input
                                  placeholder="State"
                                  value={addrForm.state}
                                  onChange={(e) => setAddrForm({...addrForm, state: e.target.value})}
                                  className="bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                                />
                                <input
                                  placeholder="PIN Code / Country"
                                  value={addrForm.country}
                                  onChange={(e) => setAddrForm({...addrForm, country: e.target.value})}
                                  className="bg-zinc-950/50 border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-colors"
                                />
                              </div>
                              <button
                                onClick={handleAddAddress}
                                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-400 transition-all mt-2"
                              >
                                Save Address
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="grid md:grid-cols-2 gap-6">
                        {profile.address?.map((addr, i) => (
                          <div key={addr._id || i} className="group bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all relative">
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-colors">
                                   <MapPin size={20} />
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleDeleteAddr(addr._id)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
                                     <Trash2 size={16} />
                                  </button>
                                </div>
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Location: {addr.nearBy || "Address"}</p>
                             <h4 className="text-lg font-black text-white mb-2 leading-tight uppercase tracking-tight">{addr.street}</h4>
                             <p className="text-sm font-medium text-zinc-500 uppercase tracking-tighter">{addr.city}, {addr.state} - {addr.country}</p>
                             
                             {i === 0 && (
                               <div className="absolute top-6 right-16">
                                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">Default</span>
                               </div>
                             )}
                          </div>
                        ))}
                        {(!profile.address || profile.address.length === 0) && (
                          <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-zinc-800 rounded-[3rem]">
                             <MapPin size={48} className="mx-auto text-zinc-800 mb-4" />
                             <p className="text-zinc-600 font-bold uppercase tracking-[0.2em] text-xs">No saved addresses detected</p>
                             <button 
                               onClick={() => setShowAddressForm(true)}
                               className="mt-4 px-6 py-3 bg-zinc-800 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 transition-all"
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
                    <button className="w-full p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-zinc-600 group-hover:text-white">
                             <Lock size={24} />
                          </div>
                          <div className="text-left">
                             <p className="text-sm font-black text-white uppercase tracking-tight">Identity Credential Reset</p>
                             <p className="text-xs text-zinc-600 font-medium mt-1">Change your login password and security keys.</p>
                          </div>
                       </div>
                       <ChevronRight size={20} className="text-zinc-800 group-hover:text-white" />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM BANNER */}
        <div className="mt-24 p-12 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 rounded-[4rem] relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                 <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Indiafy Node Assurance</h3>
                 <p className="text-sm font-medium text-emerald-500/60 uppercase tracking-widest leading-relaxed max-w-xl">
                    Your data is strictly localized to your sector. We never transmit your PII to global marketing nodes. Pure Hyper-local integrity.
                 </p>
              </div>
              <ShieldCheck size={80} className="text-emerald-500/20 absolute -right-4 -bottom-4 rotate-12" />
              <button className="px-10 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl">
                 Privacy Protocol Details
              </button>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8 shadow-xl group hover:border-zinc-700 transition-all">
      <div className={`w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center ${color} mb-6 shadow-inner`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">{label}</p>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  );
}

function InfoField({ label, value, icon: Icon, editing, name, editData, setEditData, disabled }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 pl-4">{label}</label>
      <div className={`flex items-center gap-4 p-5 bg-zinc-950/50 rounded-3xl border ${editing && !disabled ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-800/50"}`}>
        <Icon size={18} className="text-zinc-700" />
        {editing && !disabled ? (
          <input 
            type="text" 
            value={editData[name] || ""} 
            onChange={(e) => setEditData({ ...editData, [name]: e.target.value })}
            className="bg-transparent border-none outline-none text-sm font-black text-white w-full"
          />
        ) : (
          <p className={`text-sm font-black ${disabled ? "text-zinc-600" : "text-zinc-300"}`}>{value || "Not Set"}</p>
        )}
      </div>
    </div>
  );
}

function SecurityCard({ title, desc, active }) {
  return (
    <div className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] flex items-center justify-between group hover:border-zinc-700 transition-all">
       <div className="space-y-1">
          <p className="text-sm font-black text-white uppercase tracking-tight">{title}</p>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed uppercase tracking-tighter max-w-sm">{desc}</p>
       </div>
       <div className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? "bg-emerald-500" : "bg-zinc-800"}`}>
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? "translate-x-6" : "translate-x-0"}`} />
       </div>
    </div>
  );
}
