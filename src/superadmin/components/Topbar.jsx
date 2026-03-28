import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ onMenuButtonClick }) => {
  return (
    <header className="sa-topbar">
      <div className="sa-topbar-left">
        <button className="sa-menu-btn" onClick={onMenuButtonClick}>
          <Menu size={20} />
        </button>
        <div className="sa-search-container">
          <Search size={18} className="sa-search-icon" />
          <input type="text" placeholder="Search for something..." className="sa-search-input" />
        </div>
      </div>

      <div className="sa-topbar-actions">
        <button className="sa-action-btn">
          <Bell size={20} />
          <span className="sa-notification-dot"></span>
        </button>

        <div className="sa-user-profile">
          <div className="sa-user-info">
            <span className="sa-user-name">Super Admin</span>
            <span className="sa-user-role">Administrator</span>
          </div>
          <div className="sa-user-avatar">
            <User size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
