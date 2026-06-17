import { useState, useEffect } from "react";
import { 
  MapPin, 
  ChevronDown, 
  Zap, 
  User, 
  ArrowLeft, 
  X, 
  Search, 
  Navigation, 
  Map as MapIcon,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Map Libraries
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 1. Component to update map center from Search or GPS
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// 2. Component to track map center when user drags it
function MapCenterTracker({ setPosition }) {
  useMapEvents({
    dragend: (e) => {
      const newCenter = e.target.getCenter();
      setPosition({ lat: newCenter.lat, lng: newCenter.lng });
    },
  });
  return null;
}

export default function QuickHeader() {
  const navigate = useNavigate();
  const [locationOpen, setLocationOpen] = useState(false);
  
  // Header Display Address
  const [currentAddress, setCurrentAddress] = useState("Sector 45, Gurugram");
  
  // Map internal state
  const [mapPosition, setMapPosition] = useState({ lat: 28.4595, lng: 77.0266 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Auto-Detect GPS Location
  const locateUser = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsSearching(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please check browser permissions.");
          setIsSearching(false);
        }
      );
    }
  };

  // Manual Text Search (Geocoding)
  const handleManualSearch = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setMapPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
        } else {
          alert("Location not found. Please try a more specific area.");
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Convert dragged Pin to text address (Reverse Geocoding)
  const handleConfirmLocation = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition.lat}&lon=${mapPosition.lng}`);
      const data = await res.json();
      
      if (data && data.address) {
         // Create a clean short address (e.g. "Sector 45, Gurugram")
         const area = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.road || "Selected Location";
         const city = data.address.city || data.address.town || data.address.state_district || "";
         
         setCurrentAddress(`${area}${city ? ', ' + city : ''}`);
      } else {
         setCurrentAddress("Pinned Location");
      }
    } catch(e) {
      setCurrentAddress("Pinned Location");
    } finally {
      setIsConfirming(false);
      setLocationOpen(false);
    }
  };

  return (
    <>
      {/* Main Sticky Header - Blue Theme */}
      <header className="sticky top-0 z-50 bg-brand-primary shadow-sm border-b border-white/10 transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between gap-3 relative">
          
          {/* Left: Back + Logo + Location */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => navigate(-1)} 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
              >
                <ArrowLeft size={16} className="text-white" />
              </button>
              
              {/* Added Logo */}
              <img 
                loading="lazy" 
                decoding="async"
                src="/Images/logo.png" 
                alt="Indiafy" 
                onClick={() => navigate("/")}
                className="h-6 lg:h-7 w-auto object-contain cursor-pointer hidden sm:block hover:opacity-90 transition-opacity"
              />
            </div>

            <div className="h-6 w-px bg-white/20 hidden sm:block mx-1"></div>

            <button onClick={() => setLocationOpen(true)} className="flex items-center gap-1.5 min-w-0 group">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                <MapPin size={16} className="text-white" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Deliver to</span>
                  <ChevronDown size={12} className="text-white/70 group-hover:text-white transition-colors" />
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[140px] sm:max-w-[220px]">
                  {currentAddress}
                </p>
              </div>
            </button>
          </div>

          {/* Center: ETA Badge */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="hidden sm:flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full shrink-0"
          >
            <Zap size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] font-extrabold text-white whitespace-nowrap">12 min</span>
          </motion.div>

          {/* Right: Profile & Mobile ETA */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="sm:hidden flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md">
               <Zap size={10} className="text-yellow-400 fill-yellow-400" />
               <span className="text-[10px] font-extrabold text-white">12m</span>
            </div>
            <button 
              onClick={() => navigate("/profile")} 
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-zinc-100 active:scale-95 transition-all shadow-sm"
            >
              <User size={14} className="text-brand-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Location Map Selection Modal */}
      <AnimatePresence>
        {locationOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLocationOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} transition={{ duration: 0.2 }}
              /* FIX: Replaced max-h with strict h-[92dvh] on mobile to perfectly lock the layout into the screen */
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-[72px] md:left-4 lg:left-[calc(50%-720px+1rem)] w-full md:w-[420px] bg-white z-[101] rounded-t-3xl md:rounded-2xl shadow-2xl md:border md:border-zinc-200 flex flex-col overflow-hidden h-[92dvh] md:h-auto md:max-h-[80vh]"
            >
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                <div>
                  <h3 className="text-lg font-black text-zinc-900">Select Location</h3>
                  <p className="text-xs font-medium text-zinc-500">To check delivery availability</p>
                </div>
                <button onClick={() => setLocationOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors shrink-0">
                  <X size={18} />
                </button>
              </div>

              {/* FIX: min-h-0 forces this container to scroll instead of pushing the footer out of bounds */}
              <div className="flex-1 min-h-0 p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
                
                {/* Manual Search Bar */}
                <div className="relative flex items-center shrink-0">
                  <Search size={18} className="absolute left-3 text-zinc-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleManualSearch}
                    placeholder="Search for area, street (Press Enter)" 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-10 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  />
                  {isSearching && <Loader2 size={16} className="absolute right-3 text-brand-primary animate-spin" />}
                </div>

                {/* Auto-Detect GPS Button */}
                <button onClick={locateUser} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-left transition-colors group shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Navigation size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-600">Use current location</h4>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">Using GPS to locate you</p>
                  </div>
                </button>

                <hr className="border-zinc-100 shrink-0" />

                {/* Interactive Map */}
                <div className="flex flex-col gap-2 shrink-0 h-full">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Or Pin Point on Map</h4>
                  
                  {/* FIX: Added min-h to prevent the map from squishing too far on small screens */}
                  <div className="relative w-full flex-1 min-h-[220px] md:min-h-[280px] bg-[#e5e3df] rounded-2xl overflow-hidden border border-zinc-200 cursor-crosshair">
                    <div className="w-full h-full absolute inset-0 z-0">
                      <MapContainer 
                        center={[mapPosition.lat, mapPosition.lng]} 
                        zoom={16} 
                        zoomControl={false} 
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater center={mapPosition} />
                        <MapCenterTracker setPosition={setMapPosition} />
                      </MapContainer>
                    </div>
                    
                    {/* Fixed Center Pin Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="relative -top-6 flex flex-col items-center animate-bounce">
                         <div className="bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg mb-1">
                            Order Here
                         </div>
                         <MapIcon size={36} className="text-brand-primary drop-shadow-xl fill-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 text-center mt-1 pb-2">Drag the map to pinpoint your exact location</p>
                </div>
              </div>

              {/* Confirm Button - Guaranteed to stay locked to the bottom */}
              <div className="p-4 bg-white border-t border-zinc-100 mt-auto shrink-0">
                <button 
                  onClick={handleConfirmLocation}
                  disabled={isConfirming}
                  className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-brand-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isConfirming ? <Loader2 size={18} className="animate-spin" /> : "Confirm Location"}
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}