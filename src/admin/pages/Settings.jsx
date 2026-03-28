import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../api';
import './Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    small_price_per_hour: '100',
    big_price_per_hour: '150',
    upi_id: 'example@upi',
    is_commission_enabled: false
  });
  const [commissionAmount, setCommissionAmount] = useState(5);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMigrationHint, setShowMigrationHint] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await getSettings();
        if (data) {
          setFormData({
            small_price_per_hour: (data.small_price_per_hour || 100).toString(),
            big_price_per_hour: (data.big_price_per_hour || 150).toString(),
            upi_id: data.upi_id || 'example@upi',
            is_commission_enabled: data.is_commission_enabled || false
          });
          setCommissionAmount(data.commission_per_booking || 5);
        }
      } catch (err) {
        console.error("Fetch settings error:", err);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        small_price_per_hour: parseInt(formData.small_price_per_hour),
        big_price_per_hour: parseInt(formData.big_price_per_hour),
        upi_id: formData.upi_id,
        is_commission_enabled: formData.is_commission_enabled
      });
      setIsSaved(true);
      setShowMigrationHint(false);
      alert('Settings saved successfully!');
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      const detail = error.response?.data?.detail || error.message;
      alert(`Failed to save settings: ${detail}`);
      if (detail.includes("Database schema mismatch") || detail.includes("PGRST204")) {
        setShowMigrationHint(true);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="settings-page loading">
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Fetching dynamic settings from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="section-title">Café Settings</h2>
        <p className="section-subtitle">
          Manage your café parameters. 
          <span className="live-status">● Live Connection Active</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-cards-grid">
          
          <div className="settings-card">
            <div className="card-header">
              <h3>Small Table</h3>
              <span className="card-badge">Pricing</span>
            </div>
            <div className="form-group-settings">
              <label>Price (per hour)</label>
              <div className="input-with-symbol">
                <span className="currency-symbol">₹</span>
                <input 
                   type="number" 
                   name="small_price_per_hour"
                   value={formData.small_price_per_hour}
                   onChange={handleChange}
                   required
                />
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3>Big Table</h3>
              <span className="card-badge">Pricing</span>
            </div>
            <div className="form-group-settings">
              <label>Price (per hour)</label>
              <div className="input-with-symbol">
                <span className="currency-symbol">₹</span>
                <input 
                  type="number" 
                  name="big_price_per_hour"
                  value={formData.big_price_per_hour}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3>Payment</h3>
              <span className="card-badge primary">UPI</span>
            </div>
            <div className="form-group-settings">
              <label>Receiver UPI ID</label>
              <div className="input-outline">
                <input 
                  type="text" 
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleChange}
                  placeholder="e.g., username@bank"
                  required
                />
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3>Commission</h3>
              <span className="card-badge warning">System</span>
            </div>
            <div className="commission-info" style={{ marginTop: '12px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Platform Charge: <strong style={{ color: '#4f46e5' }}>₹{commissionAmount}</strong></p>
              <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>
                Set by Super Admin. You can choose to add this to customer bills.
              </p>
            </div>
            <div className="commission-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                className={`btn ${formData.is_commission_enabled ? 'btn-success' : 'btn-outline'}`}
                style={{ 
                  flex: 1, 
                  fontSize: '0.8rem', 
                  padding: '10px', 
                  height: 'auto', 
                  border: formData.is_commission_enabled ? 'none' : '1px solid #e2e8f0',
                  backgroundColor: formData.is_commission_enabled ? '#10b981' : 'transparent',
                  color: formData.is_commission_enabled ? '#ffffff' : '#64748b',
                  fontWeight: '600'
                }}
                onClick={() => setFormData({...formData, is_commission_enabled: true})}
              >
                Add on Bill
              </button>
              <button 
                type="button"
                className={`btn ${!formData.is_commission_enabled ? 'btn-danger' : 'btn-outline'}`}
                style={{ 
                  flex: 1, 
                  fontSize: '0.8rem', 
                  padding: '10px', 
                  height: 'auto', 
                  border: !formData.is_commission_enabled ? 'none' : '1px solid #e2e8f0',
                  backgroundColor: !formData.is_commission_enabled ? '#ef4444' : 'transparent',
                  color: !formData.is_commission_enabled ? '#ffffff' : '#64748b',
                  fontWeight: '600'
                }}
                onClick={() => setFormData({...formData, is_commission_enabled: false})}
              >
                Remove from Bill
              </button>
            </div>
            {formData.is_commission_enabled && (
              <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', fontSize: '0.75rem', color: '#065f46', textAlign: 'center', fontWeight: 'bold' }}>
                ✓ Commission will be added to bill
              </div>
            )}
          </div>

        </div>

        {showMigrationHint && (
          <div className="migration-hint-card">
            <div className="hint-header">
              <span className="hint-icon">⚠️</span>
              <h4>Database Action Required</h4>
            </div>
            <p>Your database is missing some columns needed for multiple pricing. Please run this SQL in your <strong>Supabase SQL Editor</strong>:</p>
            <pre className="sql-box">
{`ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS small_price_per_hour INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS big_price_per_hour INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS is_commission_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0.0;`}
            </pre>
            <p className="hint-footer">After running this, refresh this page and try saving again.</p>
          </div>
        )}

        <div className="settings-actions">
          <button type="submit" className={`btn btn-save ${isSaved ? 'saved' : ''}`}>
            {isSaved ? '✓ Saved Successfully' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
