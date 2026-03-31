import React from 'react';
import './ExpenseDetailsModal.css';

const ExpenseDetailsModal = ({ isOpen, onClose, month, expenses = [], total, isLoading }) => {

  if (!isOpen) return null;

  return (
    <div className="expense-modal-overlay" onClick={onClose}>
      <div className="expense-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="expense-modal-header">
          <div className="header-info">
            <h2 className="expense-modal-title">Expense Details</h2>
            <p className="expense-modal-subtitle">Breakdown for {month}</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        <div className="expense-modal-body">
          {isLoading ? (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Fetching real records...</p>
            </div>
          ) : expenses.length > 0 ? (
            <div className="expense-list-table">
              <table className="modal-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th className="align-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, index) => (
                    <tr key={expense.id || index}>
                      <td className="expense-date">{expense.date}</td>
                      <td className="expense-name">{expense.name}</td>
                      <td className="expense-amount align-right">₹{expense.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-modal-state">
              <p>No individual records found for this period.</p>
            </div>
          )}

        </div>

        <div className="expense-modal-footer">
          <div className="total-label">Total Expenditure</div>
          <div className="total-value">₹{total.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal;
