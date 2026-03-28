import React, { useState } from 'react';
import './ExpenseForm.css';

const ExpenseForm = ({ onAddExpense }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0] // today's date
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    onAddExpense({
      id: Date.now(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      date: formData.date
    });

    setFormData({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="expense-form-card">
      <h3 className="expense-form-title">Add New Expense</h3>
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group-expense">
          <label>Expense Name</label>
          <input 
            type="text" 
            name="name" 
            placeholder="e.g. Rent, Electricity" 
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group-expense">
          <label>Amount (₹)</label>
          <input 
            type="number" 
            name="amount" 
            placeholder="0.00" 
            value={formData.amount}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        <div className="form-group-expense">
          <label>Date</label>
          <input 
            type="date" 
            name="date" 
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-add-expense">
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
