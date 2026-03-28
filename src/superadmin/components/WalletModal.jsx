import React, { useState } from 'react';
import { X, IndianRupee, ArrowRight } from 'lucide-react';
import './WalletModal.css';

const WalletModal = ({ isOpen, onClose, onAdd }) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    onAdd(amount);
    setAmount('');
    onClose();
  };

  return (
    <div className="sa-modal-overlay">
      <div className="sa-modal-container">
        <div className="sa-modal-header">
          <h3>Add Money to Wallet</h3>
          <button className="sa-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="sa-modal-body" onSubmit={handleSubmit}>
          <div className="sa-input-group">
            <label htmlFor="amount">Enter Amount (₹)</label>
            <div className="sa-amount-input-wrapper">
              <IndianRupee size={18} className="sa-input-icon" />
              <input 
                type="number" 
                id="amount" 
                placeholder="e.g. 500" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="sa-modal-footer">
            <button type="button" className="sa-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sa-btn-primary">
              Add Money <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletModal;
