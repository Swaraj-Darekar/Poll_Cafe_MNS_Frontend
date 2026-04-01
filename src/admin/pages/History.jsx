import React from 'react';
import { useOutletContext } from 'react-router-dom';
import SessionHistory from '../components/SessionHistory';
import './History.css';

const History = () => {
  const { fetchAnalytics } = useOutletContext();
  // We can also pass a refresh trigger if needed, but SessionHistory handles its own fetch on mount.
  
  return (
    <div className="history-page">
      <div className="history-header">
        <div className="header-text">
          <h2 className="section-title">Session History</h2>
          <p className="section-subtitle">Detailed record of all table sessions and takeaways</p>
        </div>
        <div className="header-badge">
          Since Last Settlement
        </div>
      </div>

      <div className="history-content">
        <SessionHistory />
      </div>
    </div>
  );
};

export default History;
