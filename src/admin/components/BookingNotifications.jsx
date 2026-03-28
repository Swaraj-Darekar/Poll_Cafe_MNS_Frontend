import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getPendingNotifications, approveBooking, rejectBooking } from '../../api';
import './BookingNotifications.css';

// A more reliable, pleasant notification sound
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const BookingNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [approving, setApproving] = useState(null);
  const [isMuted, setIsMuted] = useState(true); // Default to muted to avoid autoplay blocks
  const [showEnableAudio, setShowEnableAudio] = useState(false);
  const audioRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    const data = await getPendingNotifications();
    if (Array.isArray(data)) {
      setNotifications(data);
      // If new notifications arrive and we are "muted" (initial state), suggest enabling audio
      if (data.length > 0 && isMuted) {
        setShowEnableAudio(true);
      }
    }
  }, [isMuted]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Audio initialization and control
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      audioRef.current.loop = true;
    }

    if (!isMuted && notifications.length > 0) {
      audioRef.current.play().catch(e => {
        console.warn("Audio play failed:", e);
        setShowEnableAudio(true);
      });
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [notifications.length, isMuted]);

  const handleEnableAudio = () => {
    setIsMuted(false);
    setShowEnableAudio(false);
    // Explicit user interaction allows audio to play
    if (audioRef.current && notifications.length > 0) {
      audioRef.current.play().catch(e => console.error("Play failed after interaction:", e));
    }
  };

  const handleAction = async (id, action) => {
    setApproving(id);
    const result = action === 'approve' ? await approveBooking(id) : await rejectBooking(id);
    if (result) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
    setApproving(null);
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  if (notifications.length === 0) return null;

  return (
    <div className="bn-container">
      {/* Autoplay Helper Overlay - appears if sound is blocked or muted when bookings exist */}
      {showEnableAudio && (
        <div className="bn-audio-helper" onClick={handleEnableAudio}>
          <span>🔔 Tap to enable sound alert</span>
        </div>
      )}

      <div className="bn-header">
        <div className="bn-header-left">
          <span className="bn-dot" />
          <span className="bn-title">New Bookings ({notifications.length})</span>
        </div>
        <button 
          className={`bn-mute-btn ${isMuted ? 'is-muted' : ''}`}
          onClick={() => {
            setIsMuted(!isMuted);
            setShowEnableAudio(false);
          }}
          title={isMuted ? "Unmute sound" : "Mute sound"}
        >
          {isMuted ? '🔇' : '🔔'}
        </button>
      </div>
      <div className="bn-list">
        {notifications.map(n => (
          <div key={n.id} className="bn-card">
            <div className="bn-card-top">
              <div className="bn-name">{n.name}</div>
              <div className="bn-paid-badge">₹100 Paid</div>
            </div>
            <div className="bn-phone">📞 {n.phone}</div>
            <div className="bn-time">
              🕐 {formatTime(n.booking_time)}
            </div>
            <div className="bn-table-type">
              🎱 {n.tables?.type === 'big' ? 'Big Table' : 'Small Table'} #{n.tables?.table_number}
            </div>
            
            <div className="bn-actions">
              <button
                className="bn-approve-btn"
                onClick={() => handleAction(n.id, 'approve')}
                disabled={approving === n.id}
              >
                {approving === n.id ? '...' : '✓ Mark Done'}
              </button>
              <button
                className="bn-reject-btn"
                onClick={() => handleAction(n.id, 'reject')}
                disabled={approving === n.id}
              >
                {approving === n.id ? '...' : '✕ Not Received'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingNotifications;
