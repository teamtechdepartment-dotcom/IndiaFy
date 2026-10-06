/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Home,
  Briefcase,
  MoreVertical,
  Trash2,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  X,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Layout Components
import WebsiteNavbar from "../../components/WebsiteNavbar";
import Footer from "../../components/Footer";
import { useProfileStore } from "../../store/profileStore";
import { toast } from "react-toastify";

export default function SavedAddresses() {
  const { profile, fetchProfile, addAddress, deleteAddress } = useProfileStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);

  // Form State
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Gurugram");
  const [stateForm, setStateForm] = useState("Haryana");
  const [pin, setPin] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const addresses = profile?.address || [];

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      toast.success("Address deleted");
    } catch(e) {
      toast.error("Failed to delete address");
    }
  };

  const setAsDefault = (id) => {
    // Implement logic if we add "isDefault" to backend schema
  };

  const handleSave = async () => {
    if (!street.trim() || !city.trim()) {
      toast.warning("Please fill in street and city");
      return;
    }
    try {
      await addAddress({
        street: street,
        nearBy: label || "Home",
        city: city,
        state: stateForm,
        country: pin || "India"
      });
      toast.success("Address saved!");
      setIsModalOpen(false);
      // Reset form
      setLabel("");
      setStreet("");
      setCity("Gurugram");
      setStateForm("Haryana");
      setPin("");
    } catch(e) {
      toast.error("Failed to save address");
    }
  };

  return (
    <div className="bg-[#f1f2f4] min-h-screen text-gray-700 font-sans">
      <WebsiteNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24">
      
      {/* Background Blobs Removed for Flat UI */}
      
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              My <span className="text-[#065F46]">Locations</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Manage your verified sector-mapped delivery addresses.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAddr(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#065F46] text-white rounded font-bold uppercase tracking-widest text-xs shadow-sm hover:bg-[#047857] transition-all"
          >
            <Plus size={18} /> Add New Address
          </button>
        </div>

        {/* Addresses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {addresses.map((addr, index) => (
              <motion.div
                key={addr._id || index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative p-6 bg-white shadow-sm rounded border transition-all ${index === 0 ? "border-[#065F46] hover:border-[#065F46]" : "border-gray-200 hover:border-[#065F46]/30"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center border ${index === 0 ? "bg-[#065F46]/10 border-[#065F46]/20 text-[#065F46]" : "bg-gray-50 border-gray-200 text-gray-500"}`}
                  >
                    <MapPin size={18} />
                  </div>
                  {index === 0 && (
                    <span className="px-3 py-1 bg-[#065F46]/10 text-[#065F46] text-[10px] font-bold uppercase rounded tracking-widest border border-[#065F46]/20">
                      Default
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                    {addr.nearBy}
                  </h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {profile?.firstName}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {addr.street}, {addr.city}, {addr.state}
                  </p>
                  <p className="text-xs font-bold text-gray-900 mt-2">
                    {profile?.contact}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingAddr(addr);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-[#065F46] transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  {index !== 0 && (
                    <button
                      onClick={() => setAsDefault(addr._id)}
                      className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#065F46] transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Ghost Card for adding */}
          <button
            onClick={() => {
              setEditingAddr(null);
              setIsModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-6 bg-white shadow-sm rounded border border-dashed border-gray-300 hover:border-[#065F46] hover:bg-gray-50 transition-all group min-h-[250px]"
          >
            <div className="w-10 h-10 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#065F46] transition-colors mb-3">
              <Plus size={24} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Add Location
            </p>
          </button>
        </div>

        {/* Verification Banner Removed For Cleanliness */}
      </main>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-white/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white shadow-lg border border-gray-200 rounded p-6 md:p-8 overflow-hidden"
            >
              <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase mb-6">
                {editingAddr ? "Edit Location" : "New Location"}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="Label (e.g. Home)"
                    className="w-full bg-white border border-gray-200 rounded px-4 py-3 font-medium text-sm text-gray-900 focus:outline-none focus:border-[#065F46] transition-colors"
                  />
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-white border border-gray-200 rounded px-4 py-3 font-medium text-sm text-gray-900 focus:outline-none focus:border-[#065F46] transition-colors"
                  />
                </div>
                <input
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Street Address / Building"
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 font-medium text-sm text-gray-900 focus:outline-none focus:border-[#065F46] transition-colors"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="PIN Code"
                    className="w-full bg-white border border-gray-200 rounded px-4 py-3 font-medium text-sm text-gray-900 focus:outline-none focus:border-[#065F46] transition-colors"
                  />
                  <input
                    value={stateForm}
                    onChange={e => setStateForm(e.target.value)}
                    placeholder="State"
                    className="w-full bg-white border border-gray-200 rounded px-4 py-3 font-medium text-sm text-gray-900 focus:outline-none focus:border-[#065F46] transition-colors"
                  />
                </div>
                <button onClick={handleSave} className="w-full py-3 bg-[#065F46] text-white rounded font-bold uppercase tracking-widest text-xs shadow-sm hover:bg-[#047857] transition-all mt-4">
                  {editingAddr ? "Update Address" : "Save Address"}
                </button>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
