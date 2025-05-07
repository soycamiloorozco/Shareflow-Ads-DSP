import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Outlet } from 'react-router-dom';
// import { AIAssistant } from './AIAssistant';

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        isCollapsed={isSidebarCollapsed} 
        onCollapsedChange={setIsSidebarCollapsed} 
      />
      <main 
        className={`
          transition-all duration-300 ease-in-out min-h-screen
          ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
        <Outlet />
      </main>
      {/* <AIAssistant /> */}
    </div>
  );
}