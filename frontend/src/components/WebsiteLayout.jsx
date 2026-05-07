import React from 'react';
import { Outlet } from 'react-router-dom';

const WebsiteLayout = React.memo(() => {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Main content area - target for skip-to-content link */}
      <main id="main-content" role="main">
        <Outlet />
      </main>
    </div>
  );
});

WebsiteLayout.displayName = 'WebsiteLayout';

export default WebsiteLayout;