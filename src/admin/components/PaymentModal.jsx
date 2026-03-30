import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, table, duration, totalAmount, grossAmount, advanceAmount, commissionAmount, upiId: manualUpiId, rate, orderItems = [], onPaid, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cashReceived, setCashReceived] = useState('');

  if (!isOpen || !table) return null;

  const safeTotal = parseFloat(totalAmount || 0);
  const safeGross = parseFloat(grossAmount || 0);
  const safeAdvance = parseFloat(advanceAmount || 0);
  const safeCommission = parseFloat(commissionAmount || 0);
  const safeDuration = parseFloat(duration || 0);

  const parsedCash = parseFloat(cashReceived || 0);
  const returnAmount = parsedCash > safeTotal ? parsedCash - safeTotal : 0;

  const upiId = manualUpiId || "example@upi"; 
  const upiUrl = `upi://pay?pa=${upiId}&pn=Pool%20Cafe&am=${safeTotal.toFixed(2)}&cu=INR`;

  const formatTime = (totalSeconds) => {
    const s = Math.floor(totalSeconds);
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="modal-header">
          <h3>{table.type === 'takeaway' ? 'Take Away Bill' : `Checkout - ${table.name}`}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="payment-content">
          {/* Left Side: Bill Details */}
          <div className="bill-details">
            <div className="bill-scroll-content">
              <h4 className="section-subtitle-modal">Billing Details</h4>
              <div className="bill-item">
                <span>Table Type</span>
                <span className="value">{table.type === 'big' ? 'Big Table' : 'Small Table'}</span>
              </div>
              <div className="bill-item">
                <span>Customer Name</span>
                <span className="value">{table.customerName || 'Guest'}</span>
              </div>
              <div className="bill-item">
                <span>Phone Number</span>
                <span className="value">{table.customerPhone || 'N/A'}</span>
              </div>
              {table.type !== 'takeaway' && (
                <>
                  <div className="bill-item">
                    <span>Duration</span>
                    <span className="value">{formatTime(safeDuration)}</span>
                  </div>
                  <div className="bill-item">
                    <span>Time Charge ({rate || (table.type === 'big' ? '150' : '100')}/hr)</span>
                    <span className="value">₹{(safeGross - (orderItems?.reduce((sum, i) => sum + i.price, 0) || 0)).toLocaleString()}</span>
                  </div>
                </>
              )}

              {/* Extra Orders Section */}
              {orderItems && orderItems.length > 0 && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cafe Orders</span>
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="bill-item" style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '0.875rem', color: '#475569' }}>• {item.name}</span>
                      <span className="value">₹{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>

            <div className="bill-summary-card">
              <div className="summary-line subtotal">
                <span>Subtotal</span>
                <span className="amount">₹{safeGross.toLocaleString()}</span>
              </div>
              {safeCommission > 0 && (
                <div className="summary-line commission">
                  <span>Platform Fees</span>
                  <span className="amount">+₹{safeCommission.toLocaleString()}</span>
                </div>
              )}
              {safeAdvance > 0 && (
                <div className="summary-line advance">
                  <span>Advance Payment</span>
                  <span className="amount">-₹{safeAdvance.toLocaleString()}</span>
                </div>
              )}
              
              <div className="summary-divider"></div>

              <div className="total-row">
                <span className="label">Total</span>
                <span className="amount">₹{safeTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Side: QR Payment & Method Selection */}
          <div className="qr-section">
            <h4 className="section-subtitle-modal">Payment Method</h4>
            <div className="payment-method-toggle" style={{ display: 'flex', gap: '15px', marginBottom: '20px', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#1e293b', fontWeight: 600, fontSize: '0.95rem' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="online" 
                  checked={paymentMethod === 'online'} 
                  onChange={() => setPaymentMethod('online')} 
                  style={{ accentColor: '#1e293b', width: '16px', height: '16px' }}
                />
                Online
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#1e293b', fontWeight: 600, fontSize: '0.95rem' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cash" 
                  checked={paymentMethod === 'cash'} 
                  onChange={() => setPaymentMethod('cash')} 
                  style={{ accentColor: '#1e293b', width: '16px', height: '16px' }}
                />
                Cash
              </label>
            </div>

            {paymentMethod === 'cash' ? (
              <div className="cash-section" style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', textAlign: 'left', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>Amount Received (₹)</label>
                  <input 
                    type="number" 
                    value={cashReceived} 
                    onChange={(e) => setCashReceived(e.target.value)} 
                    placeholder="Enter cash amount"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                {parsedCash > 0 && (
                  <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'block' }}>Change to Return:</span>
                    <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>₹{Math.round(returnAmount).toLocaleString()}</strong>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h4 className="section-subtitle-modal" style={{ marginTop: '10px' }}>Scan to Pay</h4>
                <div className="qr-container">
                  <QRCodeSVG value={upiUrl} size={180} />
                </div>
                <div className="amount-badge">₹{safeTotal.toLocaleString()}</div>
                <p className="upi-id">{upiId}</p>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-mark-paid" onClick={() => onPaid(paymentMethod)}>
            {table.type === 'takeaway' ? 'Mark as Paid & Complete' : 'Mark as Paid & Reset Table'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
