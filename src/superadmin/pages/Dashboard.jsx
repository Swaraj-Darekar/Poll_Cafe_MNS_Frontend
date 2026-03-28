import React, { useState, useEffect } from 'react';
import { IndianRupee, Calendar, TrendingUp, Users, Wallet } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import WalletModal from '../components/WalletModal';
import { getSuperAdminStats, addWalletMoney, settleSuperAdminMonth, getSuperAdminSettlements } from '../../api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch superadmin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlements = async () => {
    try {
      const data = await getSuperAdminSettlements();
      setSettlements(data || []);
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSettlements();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddMoney = async (amount) => {
    try {
      await addWalletMoney(amount);
      await fetchStats();
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to add money. Please try again.");
    }
  };

  const handleSettle = async () => {
    if (!stats || stats.month_bookings === 0) {
      alert("Nothing to settle for this month yet.");
      return;
    }

    const monthName = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();

    if (!window.confirm(`Are you sure you want to settle ${monthName} ${year}?\nTotal Bookings: ${stats.month_bookings}\nTotal Earnings: ₹${stats.month_earnings}`)) {
      return;
    }

    try {
      setIsSettling(true);
      await settleSuperAdminMonth({
        month_name: monthName,
        year: year,
        total_bookings: stats.month_bookings,
        total_earnings: stats.month_earnings
      });
      alert("Monthly settlement completed successfully!");
      fetchSettlements();
      fetchStats();
    } catch (error) {
      alert("Failed to complete settlement.");
    } finally {
      setIsSettling(false);
    }
  };

  if (loading && !stats) {
    return <div className="sa-loading">Loading Super Admin Dashboard...</div>;
  }

  const dashboardStats = [
    {
      title: "Today's Bookings",
      value: stats?.today_bookings || "0",
      icon: <Calendar size={24} />,
      trend: stats?.today_bookings > 0 ? "+New" : "0",
      color: "#3b82f6"
    },
    {
      title: "Monthly Bookings",
      value: stats?.month_bookings || "0",
      icon: <Users size={24} />,
      trend: "+Active",
      color: "#8b5cf6"
    },
    {
      title: "Today Earnings",
      value: `₹${stats?.today_earnings || 0}`,
      icon: <TrendingUp size={24} />,
      trend: `+₹${stats?.commission || 5}/ea`,
      color: "#10b981"
    },
    {
      title: "Monthly Earnings",
      value: `₹${(stats?.month_earnings || 0).toLocaleString()}`,
      icon: <IndianRupee size={24} />,
      trend: "Total",
      color: "#f59e0b"
    }
  ];

  return (
    <div className="sa-dashboard">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-page-title">Welcome back, Admin</h1>
          <p className="sa-page-subtitle">Here's what's happening at the cafe today.</p>
        </div>
        <div className="sa-header-actions">
          <button 
            className="sa-btn sa-btn-primary" 
            onClick={handleSettle}
            disabled={isSettling}
          >
            {isSettling ? 'Settling...' : 'Monthly Settlement'}
          </button>
        </div>
      </div>

      <div className="sa-stats-grid">
        <DashboardCard 
          title="Wallet Balance"
          value={`₹${(stats?.wallet_balance || 0).toLocaleString()}`}
          icon={<Wallet size={24} />}
          color="#6366f1"
          isWallet={true}
          onAddMoney={() => setIsModalOpen(true)}
        />
        
        {dashboardStats.map((stat, index) => (
          <DashboardCard key={index} {...stat} />
        ))}
      </div>

      <div className="sa-content-row">
        <div className="sa-overview-card">
          <div className="sa-card-header">
            <h3>Settlement History</h3>
            <button className="sa-view-all" onClick={fetchSettlements}>Refresh</button>
          </div>
          {settlements.length > 0 ? (
            <div className="sa-settlement-list">
              {settlements.map((settle) => (
                <div key={settle.id} className="sa-settlement-item">
                  <div className="sa-settle-info">
                    <span className="sa-settle-month">{settle.month_name} {settle.year}</span>
                    <span className="sa-settle-date">{new Date(settle.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="sa-settle-stats">
                    <span className="sa-settle-bookings">{settle.total_bookings} Bookings</span>
                    <span className="sa-settle-amount">₹{settle.total_earnings}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sa-empty-state">
              <div className="sa-empty-icon">📊</div>
              <p>No settlement history found for this café.</p>
            </div>
          )}
        </div>

        <div className="sa-overview-card mini">
          <div className="sa-card-header">
            <h3>Quick Links</h3>
          </div>
          <div className="sa-quick-links">
            <button className="sa-quick-link" onClick={() => window.location.href='/superadmin/settings'}>Configure Commission</button>
            <button className="sa-quick-link" onClick={() => window.location.href='/admin/settings'}>Table Settings</button>
            <button className="sa-quick-link">System Health</button>
          </div>
        </div>
      </div>

      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddMoney}
      />
    </div>
  );
};

export default Dashboard;
