import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './SectionGuard.css';

const SectionGuard = ({ children, section }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { isSectionUnlocked, unlockSection } = useAuth();
  
  // Checks both memory and superadmin bypass
  const unlocked = isSectionUnlocked(section);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === 'password') {
      unlockSection(section);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (unlocked) {
    return children;
  }

  return (
    <div className="section-guard-overlay">
      <div className="section-guard-card">
        <div className="lock-icon-wrapper">
          <span className="lock-icon">🔒</span>
        </div>
        <h2 className="guard-title">Locked Section</h2>
        <p className="guard-subtitle">
          Please enter the Admin Password to access <strong>{section.charAt(0).toUpperCase() + section.slice(1)}</strong>
        </p>

        {error && <div className="guard-error">Invalid Password. Please try again.</div>}

        <form onSubmit={handleUnlock} className="guard-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            autoFocus
            required
          />
          <button type="submit" className="guard-btn">
            Unlock Section
          </button>
        </form>
      </div>
    </div>
  );
};

export default SectionGuard;
