import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="sa-layout">
      <div 
        className={`sa-sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
        onClick={closeSidebar}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="sa-main-content">
        <Topbar onMenuButtonClick={toggleSidebar} />
        <main className="sa-page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
