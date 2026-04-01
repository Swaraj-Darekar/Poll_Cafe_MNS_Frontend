import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">P</div>
        <span className="brand-text">PoolCafe</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <span className="sidebar-icon">🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <span className="sidebar-icon">📅</span>
          <span>Bookings</span>
        </NavLink>

        <NavLink
          to="/admin/history"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <span className="sidebar-icon">🕒</span>
          <span>History</span>
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <span className="sidebar-icon">📊</span>
          <div className="sidebar-label">
            <span>Analytics</span>
            <span className="sidebar-lock-hint">🔒</span>
          </div>
        </NavLink>

        <NavLink
          to="/admin/expenses"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <span className="sidebar-icon">💸</span>
          <div className="sidebar-label">
            <span>Expenses</span>
            <span className="sidebar-lock-hint">🔒</span>
          </div>
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <span className="sidebar-icon">⚙️</span>
          <div className="sidebar-label">
            <span>Settings</span>
            <span className="sidebar-lock-hint">🔒</span>
          </div>
        </NavLink>
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <span className="logout-icon">↪</span>
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
