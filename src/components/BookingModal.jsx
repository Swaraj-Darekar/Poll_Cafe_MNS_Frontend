import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, CheckCircle } from 'lucide-react';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, selectedTable }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="modal-backdrop"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="glass modal-card"
        >
          <div className="modal-header">
            <h2 className="modal-title font-bold">Book Your Table</h2>
            <button onClick={onClose} className="btn-close">
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <div className="input-field">
                  <User className="field-icon" size={18} />
                  <input type="text" placeholder="Enter full name" className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-field">
                  <Phone className="field-icon" size={18} />
                  <input type="tel" placeholder="+91 00000 00000" className="form-input" />
                </div>
              </div>

              {selectedTable && (
                <div className="booking-info-box">
                  <div className="info-item">
                    <span className="info-label">Selected: </span>
                    <span className="info-value">{selectedTable.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Time: </span>
                    <span className="info-value">6:00 PM</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Duration: </span>
                    <span className="info-value">1 Hour</span>
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-confirm">
                <CheckCircle size={22} />
                Confirm Booking
              </button>

              <p className="modal-terms">
                By confirming, you agree to our terms and conditions.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
