import React, { useState, useEffect } from 'react';
import './AdminTableCard.css';

const AdminTableCard = ({ table, rate, orders = [], onStart, onEnd, onAddItem, onViewOrder, isWalletBlocked }) => {
  const [elapsed, setElapsed] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every minute for booking warnings
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval;
    const isActuallyRunning = table.isRunning || !!table.sessionId;
    
    if (isActuallyRunning && table.startTime) {
      const updateElapsed = () => {
        const now = Date.now();
        const diffInSeconds = Math.max(0, Math.floor((now - table.startTime) / 1000));
        setElapsed(diffInSeconds);
      };

      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [table.isRunning, table.startTime, table.id, table.sessionId]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  // Conflict Detection Logic
  let isWarning = false;
  let isBlocked = false;
  let bookingInfo = null;

  if (!table.isRunning && !table.sessionId && table.nextBooking) {
    const bookingTime = new Date(table.nextBooking.booking_time).getTime();
    const diffMs = bookingTime - currentTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins > 0 && diffMins <= 60) {
      isBlocked = true;
      bookingInfo = `Booking in ${diffMins}m`;
      if (diffMins <= 30) {
        isWarning = true;
      }
    }
  }

  const handleStart = () => {
    if (isBlocked) {
      alert(`This table has an advance booking starting in less than 60 minutes. Please use 'Find Booking' to start that specific booking.`);
      return;
    }
    onStart(table);
  };

  const cardClasses = [
    'admin-table-card',
    (table.isRunning || table.sessionId) ? 'running' : 'available',
    isWarning ? 'warning-booking' : '',
    isBlocked ? 'blocked-booking' : ''
  ].join(' ');

  return (
    <div className={cardClasses}>
      <div className="table-header-center">
        <h3 className="table-title">{table.name}</h3>
        <span className="table-type">{table.type === 'big' ? 'BIG TABLE' : 'SMALL TABLE'}</span>
        {rate && <span className="table-rate">₹{rate}/hr</span>}
      </div>

      {(table.isRunning || table.sessionId) ? (
        <div className="card-active-content">
          <div className="timer-section">
            <div className="timer-display">{formatTime(elapsed)}</div>
            <p className="customer-name">{table.customerName || 'Guest'}</p>
            {table.customerPhone && <p className="customer-phone">{table.customerPhone}</p>}
          </div>

          <div className="table-actions-row">
            <button className="action-btn-circle add-item-btn" onClick={() => onAddItem(table)} title="Add Item">
              +
            </button>
            <button className="btn-end-pill" onClick={() => onEnd(table)}>
              END TABLE
            </button>
            <button className="action-btn-circle view-order-btn" onClick={() => onViewOrder(table)} title="View Order" style={{ position: 'relative' }}>
              👁
              {orders.length > 0 && (
                <span className="order-count-bubble">{orders.length}</span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="idle-section" onClick={handleStart}>
          <button className="btn-add-circle" disabled={isBlocked}>+</button>
          <span className="start-text">{isBlocked ? 'RESERVED' : 'START'}</span>
          {bookingInfo && <span className="booking-alert-text">{bookingInfo}</span>}
        </div>
      )}
    </div>
  );
};

export default AdminTableCard;
