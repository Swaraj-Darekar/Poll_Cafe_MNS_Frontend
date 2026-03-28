import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import TableManager from '../components/TableManager';
import './Dashboard.css';

const Dashboard = () => {
  const { walletBalance, isWalletBlocked } = useOutletContext();
  const [tableStats, setTableStats] = useState({
    total: 0,
    active: 0,
    available: 0
  });

  const stats = [
    {
      id: 'total-tables',
      label: 'Total Tables',
      value: tableStats.total,
      variant: 'default',
    },
    {
      id: 'active-sessions',
      label: 'Active Sessions',
      value: tableStats.active,
      variant: 'green',
    },
    {
      id: 'available-tables',
      label: 'Available Tables',
      value: tableStats.available,
      variant: 'default',
    },
    {
      id: 'wallet-balance',
      label: 'Wallet Balance',
      value: `₹${walletBalance !== null ? walletBalance : '...'}`,
      variant: isWalletBlocked ? 'red' : 'blue',
    }
  ];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`stat-card stat-card--${stat.variant}`}
          >
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <TableManager onUpdateStats={setTableStats} />
    </div>
  );
};

export default Dashboard;
