
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useSocket } from "../hooks/useSocket";

// 1. Accept storeDetails and activeNode here
export default function DashboardLayout({ children, storeDetails, activeNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize Socket.io connection for this node
  useSocket(activeNode);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      
      {/* Sidebar - Pass setSidebarOpen to close it on mobile after click */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeNode={activeNode} />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. Navbar - Pass storeDetails down so the profile updates dynamically */}
        <Navbar 
          setSidebarOpen={setSidebarOpen} 
          storeDetails={storeDetails} 
          activeNode={activeNode}
        />

        {/* Dynamic Page Content */}
        {/* Notice the overflow-x-hidden and min-w-0 which prevents horizontal scrolling bugs */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        
        {/* Mobile bottom spacer */}
        <div className="h-80 w-full md:hidden shrink-0"></div>
        
      </div>
    </div>
  );
}