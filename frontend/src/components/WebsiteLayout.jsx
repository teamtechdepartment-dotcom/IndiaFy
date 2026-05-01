import React from 'react';
import { Outlet } from 'react-router-dom';


const WebsiteLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* This renders the content of the specific page you are on */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default WebsiteLayout;