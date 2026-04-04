import React, { useState, useEffect } from 'react';
import { 
  getSettings, 
  updateSettings, 
  getMenu, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem 
} from '../../api';
import './Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    small_price_per_hour: '100',
    big_price_per_hour: '150',
    sd_price_per_hour: '200',
    upi_id: 'example@upi',
    merchant_name: 'Pool Cafe',
    mcc: '0000',
    is_commission_enabled: false
  });
  const [commissionAmount, setCommissionAmount] = useState(5);
  const [isSaved, setIsSaved] = useState(false);
  
  // Menu Management State
  const [menuItems, setMenuItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Snacks' });
  const [isLoading, setIsLoading] = useState(true);
  const [showMigrationHint, setShowMigrationHint] = useState(false);
  
  // Search and Edit State
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [settingsData, menuData] = await Promise.all([
          getSettings(),
          getMenu()
        ]);

        if (settingsData) {
          setFormData({
            small_price_per_hour: (settingsData.small_price_per_hour || 100).toString(),
            big_price_per_hour: (settingsData.big_price_per_hour || 150).toString(),
            sd_price_per_hour: (settingsData.sd_price_per_hour || 200).toString(),
            upi_id: settingsData.upi_id || 'example@upi',
            merchant_name: settingsData.merchant_name || 'Pool Cafe',
            mcc: settingsData.mcc || '0000',
            is_commission_enabled: settingsData.is_commission_enabled || false
          });
          setCommissionAmount(settingsData.commission_per_booking || 5);
        }

        if (Array.isArray(menuData)) {
          setMenuItems(menuData);
        } else {
          setMenuItems([]);
        }
      } catch (err) {
        console.error("Fetch data error:", err);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        small_price_per_hour: parseInt(formData.small_price_per_hour),
        big_price_per_hour: parseInt(formData.big_price_per_hour),
        sd_price_per_hour: parseInt(formData.sd_price_per_hour),
        upi_id: formData.upi_id,
        merchant_name: formData.merchant_name,
        mcc: formData.mcc,
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
      if (detail.includes("Database") || detail.includes("PGRST204")) {
        setShowMigrationHint(true);
      }
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    try {
      const addedItem = await addMenuItem({
        name: newItem.name,
        price: parseFloat(newItem.price),
        category: 'Snacks' // Default category
      });
      setMenuItems([...menuItems, addedItem]);
      setNewItem({ name: '', price: '', category: 'Snacks' });
      setIsAddModalOpen(false);
      alert('Item added successfully!');
    } catch (error) {
      alert('Failed to add item: ' + error.message);
    }
  };

  const handleUpdatePrice = async (id, updatedPrice) => {
    try {
      const updated = await updateMenuItem(id, { price: parseFloat(updatedPrice) });
      setMenuItems(prev => prev.map(item => item.id === id ? updated : item));
      setEditingId(null);
      setEditPrice('');
    } catch (error) {
      alert('Failed to update price');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredMenu = (Array.isArray(menuItems) ? menuItems : []).filter(item => {
    const name = item.name || '';
    const category = item.category || 'Others';
    const search = (searchTerm || '').toLowerCase();
    
    return name.toLowerCase().includes(search) || 
           category.toLowerCase().includes(search);
  });

  if (isLoading) {
    return (
      <div className="settings-page loading">
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Connecting to backend database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="section-title">Café Settings</h2>
        <p className="section-subtitle">
          Manage pricing and inventory.
          <span className="live-status">● Live Database Connected</span>
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
              <h3>SD Table</h3>
              <span className="card-badge">Pricing</span>
            </div>
            <div className="form-group-settings">
              <label>Price (per hour)</label>
              <div className="input-with-symbol">
                <span className="currency-symbol">₹</span>
                <input 
                   type="number" 
                   name="sd_price_per_hour"
                   value={formData.sd_price_per_hour}
                   onChange={handleChange}
                   required
                />
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3>Payment & UPI</h3>
              <span className="card-badge primary">Account</span>
            </div>
            <div className="payment-fields-group" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
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

              <div className="form-group-settings">
                <label>Business / Payee Name</label>
                <div className="input-outline">
                  <input 
                    type="text" 
                    name="merchant_name"
                    value={formData.merchant_name}
                    onChange={handleChange}
                    placeholder="e.g., Pool Cafe MNS"
                  />
                </div>
                <small style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Must match your registered bank name.
                </small>
              </div>

              <div className="form-group-settings">
                <label>Merchant Code (MCC)</label>
                <div className="input-outline">
                  <input 
                    type="text" 
                    name="mcc"
                    value={formData.mcc}
                    onChange={handleChange}
                    placeholder="e.g., 0000"
                  />
                </div>
                <small style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Use <b>0000</b> if unsure. Required for Business accounts.
                </small>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3>Menu Management</h3>
              <span className="card-badge primary">Inventory</span>
            </div>
            <div className="menu-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setIsAddModalOpen(true)}
              >
                + Add Item
              </button>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', backgroundColor: 'transparent' }}
                onClick={() => setIsViewModalOpen(true)}
              >
                👁 View Menu ({menuItems.length})
              </button>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3>Active Commission</h3>
              <span className="card-badge warning">₹{commissionAmount}</span>
            </div>
            <div className="commission-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                className={`btn ${formData.is_commission_enabled ? 'btn-success' : 'btn-outline'}`}
                style={{ flex: 1, fontSize: '0.8rem', padding: '10px', fontWeight: '600', backgroundColor: formData.is_commission_enabled ? '#10b981' : 'transparent', color: formData.is_commission_enabled ? '#fff' : '#64748b' }}
                onClick={() => setFormData({...formData, is_commission_enabled: true})}
              >
                Enable
              </button>
              <button 
                type="button"
                className={`btn ${!formData.is_commission_enabled ? 'btn-danger' : 'btn-outline'}`}
                style={{ flex: 1, fontSize: '0.8rem', padding: '10px', fontWeight: '600', backgroundColor: !formData.is_commission_enabled ? '#ef4444' : 'transparent', color: !formData.is_commission_enabled ? '#fff' : '#64748b' }}
                onClick={() => setFormData({...formData, is_commission_enabled: false})}
              >
                Disable
              </button>
            </div>
          </div>
        </div>

        {showMigrationHint && (
          <div className="migration-hint-card">
            <div className="hint-header">
              <span className="hint-icon">⚠️</span>
              <h4>Setup Required</h4>
            </div>
            <pre className="sql-box">
{`CREATE TABLE IF NOT EXISTS menu (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT DEFAULT 'Snacks'
);`}
            </pre>
            <p className="hint-footer">Run this SQL in Supabase to enable Menu Management.</p>
          </div>
        )}

        <div className="settings-actions">
          <button type="submit" className={`btn btn-save ${isSaved ? 'saved' : ''}`}>
            {isSaved ? '✓ Settings Saved' : 'Save All Changes'}
          </button>
        </div>
      </form>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Item</h3>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group-settings">
                <label>Item Name</label>
                <div className="input-outline">
                  <input 
                    type="text" 
                    placeholder="e.g. Sandwich"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group-settings" style={{ marginTop: '16px' }}>
                <label>Price</label>
                <div className="input-with-symbol">
                  <span className="currency-symbol">₹</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '24px' }}>
              <button className="btn btn-save" style={{ width: '100%' }} onClick={handleAddItem}>
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Menu Modal */}
      {isViewModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsViewModalOpen(false)}>
          <div className="modal-content menu-list-modal">
            <div className="modal-header">
              <h3>Cafe Inventory</h3>
              <button className="close-btn" onClick={() => setIsViewModalOpen(false)}>×</button>
            </div>
            <div className="menu-search-container">
              <span className="search-icon-fixed">🔍</span>
              <input 
                type="text" 
                className="menu-search-input" 
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn" 
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
            <div className="menu-table-container">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenu.length > 0 ? (
                    filteredMenu.map(item => (
                      <tr key={item.id}>
                        <td>
                          {item.name || "N/A"}
                        </td>
                        <td>
                          {editingId === item.id ? (
                            <input 
                              type="number" 
                              className="edit-input-small"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <span>₹{item.price}</span>
                          )}
                        </td>
                        <td>
                          <div className="menu-action-btns" style={{ justifyContent: 'flex-end' }}>
                            {editingId === item.id ? (
                              <button className="action-btn save" onClick={() => handleUpdatePrice(item.id, editPrice)}>✓</button>
                            ) : (
                              <button className="action-btn edit" onClick={() => {
                                setEditingId(item.id);
                                setEditPrice(item.price.toString());
                              }}>✏️</button>
                            )}
                            <button className="action-btn delete" onClick={() => handleDeleteItem(item.id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                        No matching items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
