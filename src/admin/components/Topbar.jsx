import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/analytics': 'Analytics',
  '/admin/history': 'History',
  '/admin/expenses': 'Expenses',
  '/admin/settings': 'Settings',
  '/admin/bookings': 'Bookings',
};

const Topbar = () => {
  const { userRole } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const title = pageTitles[currentPath] || 'Dashboard';

  return (
    <header className="admin-topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-user">
        <span className="topbar-username">
          {userRole === 'superadmin' ? 'Super Admin' : 'Cafe Admin'}
        </span>
        <div className="topbar-avatar">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
