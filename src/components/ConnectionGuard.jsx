import React, { useState, useEffect, useCallback } from 'react';
import { healthCheck } from '../api';
import './ConnectionGuard.css';

/**
 * ConnectionGuard wraps the application and ensures the backend is active.
 * It shows a "Waking up server" overlay if Render has spun down the service.
 */
const ConnectionGuard = ({ children }) => {
  const [isServerReady, setIsServerReady] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const checkConnection = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsWakingUp(true);
      
      const response = await healthCheck();
      
      if (response && response.status === 'ok') {
        setIsServerReady(true);
        setIsWakingUp(false);
        console.log('✅ Server Connection Established');
      } else {
        throw new Error('Server not ready');
      }
    } catch (error) {
      console.warn('🕒 Server cold start detected, retrying...', error.message);
      setIsServerReady(false);
      setIsWakingUp(true);
      // Retry after 5 seconds
      setTimeout(() => setRetryCount(prev => prev + 1), 5000);
    }
  }, []);

  useEffect(() => {
    // Check connection on mount
    checkConnection(true);

    // Listen for visibility changes (e.g. tablet screen turn on)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 Tablet woke up, verifying server connection...');
        checkConnection(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkConnection, retryCount]);

  // Keep-alive ping every 10 minutes (Render free tier timeout is 15 mins)
  useEffect(() => {
    const keepAliveInterval = setInterval(() => {
      if (isServerReady) {
        console.log('💓 Sending keep-alive ping...');
        healthCheck();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(keepAliveInterval);
  }, [isServerReady]);

  if (!isServerReady && isWakingUp) {
    return (
      <>
        {/* We still render children but they will be hidden under the overlay */}
        <div style={{ pointerEvents: 'none', opacity: 0.3, filter: 'blur(4px)' }}>
          {children}
        </div>
        
        <div className="cg-overlay">
          <div className="cg-card">
            <div className="cg-icon-wrapper">
              <div className="cg-spinner"></div>
            </div>
            <h2 className="cg-title">Waking up Server</h2>
            <p className="cg-subtitle">
              We're preparing the system for you. This usually takes 30-40 seconds after a period of inactivity.
            </p>
            <div className="cg-status-badge">
              Status: {retryCount > 0 ? `Optimizing connection (Attempt ${retryCount})...` : 'Establishing secure link...'}
            </div>
          </div>
        </div>
      </>
    );
  }

  return children;
};

export default ConnectionGuard;
