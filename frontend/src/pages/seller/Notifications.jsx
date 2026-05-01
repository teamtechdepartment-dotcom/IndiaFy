
import React, { useState } from "react";
import { Package, ShieldAlert, CheckCircle2, Megaphone, Check, Bell, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // <-- Imported for navigation

export default function Notifications() {
  const navigate = useNavigate(); // <-- Initialize navigation

  // Initial Mock Data
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Order #ORD-203", desc: "Amit Singh placed an order for ₹850. Please pack and keep it ready for the rider.", time: "10 mins ago", type: "order", unread: true },
    { id: 2, title: "Payout Successful", desc: "₹4,200 has been successfully settled to your HDFC bank account ending in 1234.", time: "2 hrs ago", type: "success", unread: true },
    { id: 3, title: "Low Stock Alert", desc: "Royal Basmati Rice is running low (5 left). Update your inventory to avoid missing out on sales.", time: "1 day ago", type: "alert", unread: false },
    { id: 4, title: "System Update", desc: "Indiafy seller portal will undergo scheduled maintenance tonight at 2:00 AM for approximately 30 minutes.", time: "2 days ago", type: "system", unread: false },
    { id: 5, title: "Order Cancelled #ORD-146", desc: "Neha Kapoor cancelled their order. No further action is required from your end.", time: "3 days ago", type: "alert", unread: false },
  ]);

  // Derived State
  const unreadCount = notifications.filter(n => n.unread).length;

  // --- FUNCTIONAL ACTIONS ---

  // 1. Mark everything as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // 2. Mark individual notification as read when clicked
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // 3. Handle Contextual Button Clicks (Routing)
  const handleActionClick = (e, notif) => {
    e.stopPropagation(); // Prevents the row click event from firing at the same time
    markAsRead(notif.id); // Mark it as read when acted upon

    // Route to the correct page based on the notification type
    if (notif.type === 'order') {
      navigate('/orders'); // Go to Orders Inbox
    } else if (notif.type === 'alert' && notif.id === 3) {
      navigate('/inventory'); // Go to Inventory page for low stock
    }
  };

  // Helper for rendering icons
  const getIcon = (type) => {
    const baseClass = "p-3 rounded-2xl border flex items-center justify-center shadow-sm";
    switch(type) {
      case 'order': return <div className={`${baseClass} bg-blue-50/80 border-blue-100/50 text-blue-600`}><Package size={20}/></div>;
      case 'success': return <div className={`${baseClass} bg-emerald-50/80 border-emerald-100/50 text-emerald-600`}><CheckCircle2 size={20}/></div>;
      case 'alert': return <div className={`${baseClass} bg-amber-50/80 border-amber-100/50 text-amber-600`}><ShieldAlert size={20}/></div>;
      case 'system': return <div className={`${baseClass} bg-purple-50/80 border-purple-100/50 text-purple-600`}><Megaphone size={20}/></div>;
      default: return <div className={`${baseClass} bg-slate-50/80 border-slate-200/50 text-slate-600`}><Bell size={20}/></div>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sticky top-0 bg-slate-50/80 backdrop-blur-xl py-4 z-20 border-b border-slate-200/60 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Notifications 
            {unreadCount > 0 && (
              <span className="bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm shadow-slate-900/20 uppercase tracking-widest">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Stay updated with your store activity and alerts.</p>
        </div>
        
        <button 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <Check size={16} /> Mark all as read
        </button>
      </div>

      {/* --- NOTIFICATIONS LIST --- */}
      <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 ring-1 ring-slate-200/60 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => markAsRead(notif.id)} // Clicking the row marks it read
              className={`p-5 sm:p-6 flex items-start gap-4 sm:gap-5 transition-colors duration-300 cursor-pointer ${notif.unread ? 'bg-slate-50/50 hover:bg-slate-50' : 'bg-white hover:bg-slate-50/30'}`}
            >
              {/* Premium Icon with Badge */}
              <div className="relative shrink-0 mt-1">
                {getIcon(notif.type)}
                {notif.unread && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full shadow-sm"></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 mb-1.5">
                  <h3 className={`text-base font-bold truncate ${notif.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </h3>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-1 sm:mt-0 whitespace-nowrap">
                    <Clock size={12} /> {notif.time}
                  </span>
                </div>
                
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                  {notif.desc}
                </p>
                
                {/* --- CONNECTED ACTION BUTTONS --- */}
                {notif.type === 'order' && (
                   <button 
                     onClick={(e) => handleActionClick(e, notif)}
                     className="mt-4 flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 w-fit group"
                   >
                     View Order Details <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                   </button>
                )}
                
                {notif.type === 'alert' && notif.id === 3 && (
                   <button 
                     onClick={(e) => handleActionClick(e, notif)}
                     className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 hover:bg-amber-100 hover:border-amber-300 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 w-fit group"
                   >
                     Update Inventory <ArrowRight size={14} className="text-amber-500 group-hover:text-amber-600 transition-colors" />
                   </button>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
             <div className="p-12 text-center">
               <Bell className="mx-auto text-slate-300 mb-4" size={40} />
               <h3 className="text-lg font-bold text-slate-900">You're all caught up!</h3>
               <p className="text-sm text-slate-500 mt-1">No new notifications at the moment.</p>
             </div>
          )}
        </div>
      </div>
      
      {/* Footer / End of List Indicator */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-6 pb-4 pointer-events-none">
          <div className="h-px bg-slate-200 flex-1 max-w-[100px]"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of notifications</p>
          <div className="h-px bg-slate-200 flex-1 max-w-[100px]"></div>
        </div>
      )}

    </div>
  );
}