import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sa-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sa-sidebar-header">
        <div className="sa-logo-container">
          <div className="sa-logo-icon">P</div>
          <span className="sa-logo-text">Pool Cafe <span className="sa-logo-badge">Super</span></span>
        </div>
        <button className="sa-sidebar-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="sa-sidebar-nav">
        <div className="sa-nav-section">
          <p className="sa-nav-label">Main Menu</p>
          <NavLink 
            to="/superadmin" 
            end
            className={({ isActive }) => `sa-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            <ChevronRight size={16} className="sa-item-arrow" />
          </NavLink>
        </div>

        <div className="sa-nav-section">
          <p className="sa-nav-label">System</p>
          <NavLink 
            to="/superadmin/settings" 
            className={({ isActive }) => `sa-nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Settings</span>
            <ChevronRight size={16} className="sa-item-arrow" />
          </NavLink>
        </div>
      </nav>

      <div className="sa-sidebar-footer">
        <button className="sa-logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
