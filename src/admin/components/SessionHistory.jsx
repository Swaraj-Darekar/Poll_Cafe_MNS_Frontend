import React, { useState, useEffect } from 'react';
import { getSessionHistory } from '../../api';
import './SessionHistory.css';

const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const SessionRow = ({ session }) => {
  const isTakeaway = session.is_takeaway;
  const hasDiscount = session.discount > 0;
  const hasExtra = session.extra_amount > 0;
  const grossAmount = session.gross_amount || 0;
  const finalTotal = session.total_amount || 0;

  return (
    <div className={`sh-row ${isTakeaway ? 'sh-row--takeaway' : ''}`}>
      <div className="sh-row-left">
        <span className={`sh-type-badge ${isTakeaway ? 'badge-takeaway' : 'badge-table'}`}>
          {isTakeaway ? '☕' : '🎱'}
        </span>
        <div className="sh-row-info">
          <span className="sh-table-name">{session.table_name}</span>
          {!isTakeaway && (
            <span className="sh-customer">{session.customer_name}</span>
          )}
        </div>
      </div>

      <div className="sh-row-mid">
        {!isTakeaway && (
          <span className="sh-duration">{formatDuration(session.total_minutes)}</span>
        )}
        <span className="sh-time">{session.end_time}</span>
      </div>

      <div className="sh-row-right">
        <div className="sh-price-breakdown">
          {hasDiscount && (
            <>
              <span className="sh-gross-strikethru">₹{grossAmount.toLocaleString()}</span>
              <span className="sh-discount-tag">-₹{session.discount}</span>
            </>
          )}
          {hasExtra && (
            <span className="sh-extra-tag">+₹{session.extra_amount}</span>
          )}
          <span className="sh-amount-final">₹{finalTotal.toLocaleString()}</span>
        </div>
        <span className={`sh-method-badge ${session.payment_method === 'cash' ? 'method-cash' : 'method-online'}`}>
          {session.payment_method === 'cash' ? 'Cash' : 'Online'}
        </span>
      </div>
    </div>
  );
};

const DayCard = ({ dayData, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const tableSessions = dayData.sessions.filter(s => !s.is_takeaway);
  const takeawaySessions = dayData.sessions.filter(s => s.is_takeaway);

  return (
    <div className={`sh-day-card ${isOpen ? 'sh-day-card--open' : ''}`}>
      {/* Card Header */}
      <div className="sh-day-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="sh-day-header-left">
          <span className="sh-day-label">{dayData.label}</span>
          <div className="sh-day-badges">
            {dayData.table_count > 0 && (
              <span className="sh-count-badge badge-table">🎱 {dayData.table_count} Tables</span>
            )}
            {dayData.takeaway_count > 0 && (
              <span className="sh-count-badge badge-takeaway">☕ {dayData.takeaway_count} Takeaways</span>
            )}
          </div>
        </div>
        <div className="sh-day-header-right">
          <span className="sh-day-total">₹{dayData.day_total.toLocaleString()}</span>
          <span className={`sh-chevron ${isOpen ? 'sh-chevron--up' : ''}`}>▾</span>
        </div>
      </div>

      {/* Sessions List */}
      {isOpen && (
        <div className="sh-day-body">
          {tableSessions.length > 0 && (
            <>
              {takeawaySessions.length > 0 && (
                <div className="sh-section-label">Table Sessions</div>
              )}
              {tableSessions.map(s => (
                <SessionRow key={s.id} session={s} />
              ))}
            </>
          )}

          {takeawaySessions.length > 0 && (
            <>
              {tableSessions.length > 0 && (
                <div className="sh-section-label sh-section-label--takeaway">Takeaways</div>
              )}
              {takeawaySessions.map(s => (
                <SessionRow key={s.id} session={s} />
              ))}
            </>
          )}

          {dayData.sessions.length === 0 && (
            <div className="sh-empty">No sessions recorded</div>
          )}

          <div className="sh-day-footer">
            <span>Total for {dayData.label}</span>
            <strong>₹{dayData.day_total.toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

const SessionHistory = ({ onSettled }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getSessionHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Re-fetch whenever settlement happens (onSettled value changes)
  useEffect(() => {
    if (onSettled) fetchHistory();
  }, [onSettled]);

  if (isLoading) {
    return (
      <div className="sh-loading">
        <div className="sh-spinner" />
        <span>Loading history…</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="sh-empty-state">
        <div className="sh-empty-icon">📋</div>
        <p>No sessions recorded in the last 30 days.</p>
      </div>
    );
  }

  return (
    <div className="session-history">
      {history.map((dayData, index) => (
        <DayCard
          key={dayData.date}
          dayData={dayData}
          defaultOpen={false}  /* Always closed by default */
        />
      ))}
    </div>
  );
};

export default SessionHistory;
