import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, Info, Trash2, AlertTriangle } from 'lucide-react';
import { getSuperAdminStats, updateSuperAdminSettings, resetSuperAdminSystem } from '../../api';
import './Settings.css';

const Settings = () => {
  const [commission, setCommission] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminStats();
      if (data) {
        setCommission(data.commission || 5);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatus({ type: '', message: '' });
      await updateSuperAdminSettings(commission);
      setStatus({ type: 'success', message: 'Settings updated successfully!' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (resetConfirmText !== 'RESET') return;
    
    try {
      setResetting(true);
      await resetSuperAdminSystem();
      alert("System has been restarted from scratch. All data cleared.");
      window.location.reload();
    } catch (error) {
      alert("Reset failed. Please try again.");
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (loading) return <div className="sa-loading">Loading Settings...</div>;

  return (
    <div className="sa-settings-page">
      <div className="sa-page-header">
        <div>
          <h1 className="sa-page-title">System Settings</h1>
          <p className="sa-page-subtitle">Configure global platform parameters and commission rates.</p>
        </div>
      </div>

      <div className="sa-settings-grid">
        <div className="sa-settings-card">
          <div className="sa-card-header">
            <h3>Commission Configuration</h3>
          </div>
          
          <form onSubmit={handleSave} className="sa-settings-form">
            <div className="sa-form-group">
              <label>Commission Per Booking (₹)</label>
              <div className="sa-input-wrapper">
                <input 
                  type="number" 
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  step="0.5"
                  min="0"
                  required
                />
                <span className="sa-input-unit">RS</span>
              </div>
              <p className="sa-input-help">This amount will be deducted from the cafe wallet for every completed session.</p>
            </div>

            <div className="sa-settings-info">
              <Info size={18} />
              <span>Changing this value will only affect future transactions.</span>
            </div>

            {status.message && (
              <div className={`sa-status-msg ${status.type}`}>
                {status.message}
              </div>
            )}

            <div className="sa-form-actions">
              <button type="button" className="sa-btn sa-btn-outline" onClick={fetchSettings} disabled={saving}>
                <RefreshCcw size={18} />
                Reset
              </button>
              <button type="submit" className="sa-btn sa-btn-primary" disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>

        <div className="sa-settings-card help">
          <h3>Platform Info</h3>
          <div className="sa-platform-details">
            <div className="sa-detail-item">
              <span>System Version</span>
              <strong>v2.1.0-wallet</strong>
            </div>
            <div className="sa-detail-item">
              <span>Last Settlement</span>
              <strong>Monthly Logic Enabled</strong>
            </div>
            <div className="sa-detail-item">
              <span>Wallet Threshold</span>
              <strong>₹10.00 (Blocked)</strong>
            </div>
          </div>
        </div>

        <div className="sa-settings-card danger">
          <div className="sa-card-header">
            <h3>System Control</h3>
          </div>
          <div className="sa-danger-zone">
            <div className="sa-danger-info">
              <AlertTriangle className="sa-warning-icon" />
              <div>
                <h4>Global System Reset</h4>
                <p>Delete all bookings, sessions, expenses, and transactions. Restart application fresh.</p>
              </div>
            </div>

            {!showResetConfirm ? (
              <button 
                type="button" 
                className="sa-btn sa-btn-danger"
                onClick={() => setShowResetConfirm(true)}
              >
                <Trash2 size={18} />
                Reset All Data
              </button>
            ) : (
              <div className="sa-reset-confirmation">
                <p>Type <strong>RESET</strong> to confirm:</p>
                <input 
                  type="text" 
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Type RESET here"
                  className="sa-confirm-input"
                />
                <div className="sa-confirm-actions">
                  <button 
                    className="sa-btn sa-btn-outline"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="sa-btn sa-btn-danger"
                    disabled={resetConfirmText !== 'RESET' || resetting}
                    onClick={handleReset}
                  >
                    {resetting ? 'Resetting...' : 'Confirm Destruction'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
