import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, value, icon, trend, color, isWallet, onAddMoney }) => {
  return (
    <div className={`sa-card ${isWallet ? 'wallet-card' : ''}`}>
      <div className="sa-card-header">
        <div className="sa-card-icon" style={{ backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
        {trend && (
          <div className="sa-card-trend" style={{ color: trend.startsWith('+') ? '#10b981' : '#ef4444' }}>
            {trend}
          </div>
        )}
      </div>
      
      <div className="sa-card-content">
        <p className="sa-card-title">{title}</p>
        <h3 className="sa-card-value">{value}</h3>
      </div>

      {isWallet && (
        <button className="sa-add-money-btn" onClick={onAddMoney}>
          Add Money
        </button>
      )}
    </div>
  );
};

export default DashboardCard;
