
import React, { useState, useEffect, useRef } from "react";
import { Bell, Menu, CalendarClock, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setSidebarOpen, storeDetails }) {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // --- CLOCK LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const formattedDate = time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  // --- CLICK OUTSIDE TO CLOSE DROPDOWN ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- MOCK RECENT NOTIFICATIONS ---
  const recentNotifications = [
    { id: 1, title: "New Order #ORD-203", desc: "Amit Singh placed an order for ₹850.", time: "Just now", type: "order", unread: true },
    { id: 2, title: "Payout Successful", desc: "₹4,200 has been settled to your bank.", time: "2 hrs ago", type: "success", unread: true },
    { id: 3, title: "Low Stock Alert", desc: "Royal Basmati Rice is running low (5 left).", time: "1 day ago", type: "alert", unread: false },
  ];

  const handleNotificationClick = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border border-slate-200/60 px-4 sm:px-6 py-2.5 sm:py-3 sticky top-4 z-40 mx-4 md:mx-6 mb-4 rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1),inset_0_-8px_15px_-3px_rgba(0,0,0,0.05),inset_0_4px_10px_rgba(255,255,255,0.9)] transition-all flex items-center justify-between relative">
      
      {/* --- LEFT SECTION: Menu & Clock --- */}
      <div className="flex flex-1 items-center gap-2 sm:gap-3">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 hover:bg-slate-100 rounded-full text-slate-600 active:scale-95 transition-all shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)] shrink-0" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Live Clock */}
        <div className="flex items-center gap-2 sm:gap-3 select-none overflow-hidden shrink-0">
          <div className="p-1.5 sm:p-2 bg-slate-50 shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)] border border-slate-100/50 text-slate-500 rounded-full shrink-0">
            <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="hidden min-[400px]:flex flex-col justify-center truncate px-3 py-1 bg-slate-50/50 rounded-full shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)] border border-slate-50">
            <span className="text-[11px] sm:text-sm font-bold text-slate-900 leading-none truncate drop-shadow-sm">
              {formattedTime}
            </span>
            <span className="text-[9px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1 truncate hidden sm:block">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* --- RIGHT SECTION: Notifications & Profile --- */}
      <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
        
        {/* Notification Dropdown */}
        <div className="relative pointer-events-auto" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full relative transition-all active:scale-95 ${showNotifications ? 'bg-slate-100 text-slate-900 shadow-[inset_0_2px_5px_rgba(0,0,0,0.08)]' : 'text-slate-500 hover:bg-slate-50 hover:shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)]'}`}
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
          </button>

          {/* Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[300px] sm:w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-left">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shadow-[inset_0_-10px_10px_-10px_rgba(0,0,0,0.04)] relative z-10">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full shadow-[inset_0_1px_3px_rgba(255,255,255,0.3)]">2 New</span>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col relative bg-white">
                {recentNotifications.map((notif) => (
                  <button key={notif.id} onClick={handleNotificationClick} className="w-full text-left p-4 hover:bg-slate-50 hover:shadow-[inset_0_2px_5px_rgba(0,0,0,0.02)] border-b border-slate-100 transition-all flex items-start gap-3 relative">
                    {notif.unread && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></span>}
                    <div className={`p-2 rounded-2xl shrink-0 mt-0.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] ${notif.type === 'order' ? 'bg-blue-50 text-blue-600' : notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {notif.type === 'order' ? <Package size={16}/> : notif.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${notif.unread ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-2">{notif.desc}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">{notif.time}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="p-3 bg-slate-50 border-t border-slate-100 shadow-[inset_0_10px_10px_-10px_rgba(0,0,0,0.04)] relative z-10">
                <button onClick={handleNotificationClick} className="w-full py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)] rounded-full transition-all shadow-sm">
                  View all messages
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Recessed divider line */}
        <div className="h-6 sm:h-8 w-[1px] bg-slate-200 mx-1 shadow-[1px_0_0_rgba(255,255,255,0.5)]"></div>
        
        {/* Profile Button */}
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 p-1 pr-2 sm:pr-4 hover:bg-slate-50 hover:shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)] rounded-full transition-all active:scale-95 group border border-transparent hover:border-slate-100 pointer-events-auto"
        >
          {storeDetails?.logo ? (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
               <img src={storeDetails.logo} alt="Store" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 shadow-[inset_0_2px_5px_rgba(255,255,255,0.2)] rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-extrabold shrink-0 group-hover:bg-slate-800 transition-colors">
              {storeDetails?.initials || "JS"}
            </div>
          )}
          <span className="text-sm font-bold text-slate-700 hidden lg:inline group-hover:text-slate-900 transition-colors drop-shadow-sm">
            {storeDetails?.name || "Jai Store"}
          </span>
        </button>
      </div>

    </header>
  );
}