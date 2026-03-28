import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ExpenseForm from '../components/ExpenseForm';
import './Expenses.css';

const Expenses = () => {
  const { expenses, handleAddExpense, handleDeleteExpense } = useOutletContext();

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <h2 className="section-title">Expense Management</h2>
        <p className="section-subtitle">Track and manage your business expenditures</p>
      </div>

      <div className="expenses-grid">
        <div className="expense-form-section">
          <ExpenseForm onAddExpense={handleAddExpense} />
        </div>

        <div className="expenses-list-card">
          <h3 className="card-title">Recent Expenses</h3>
          <div className="table-responsive">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                  <th className="align-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="expense-row">
                      <td className="font-medium">{expense.name}</td>
                      <td className="expense-amount">₹{expense.amount.toLocaleString()}</td>
                      <td>{new Date(expense.date).toLocaleDateString('en-IN')}</td>
                      <td className="align-center">
                        <button 
                          className="btn-delete-expense"
                          onClick={() => handleDeleteExpense(expense.id)}
                          title="Delete Expense"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">No expenses recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
