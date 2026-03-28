import React, { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProfitTable from '../components/ProfitTable';
import { settleMonth, getSettlements } from '../../api';
import './Analytics.css';

const Analytics = () => {
  const { expenses, salesData, fetchAnalytics, handleResetExpenses } = useOutletContext();
  const [settlements, setSettlements] = useState([]);
  
  const { thisMonthSales, todaysSales, totalBookings } = {
    thisMonthSales: salesData.monthlySales,
    todaysSales: salesData.todaySales,
    totalBookings: salesData.totalBookings
  };

  // Fetch settlement history
  const fetchSettlementsHistory = async () => {
    try {
      const data = await getSettlements();
      if (data) setSettlements(data);
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
    }
  };

  useEffect(() => {
    fetchSettlementsHistory();
  }, []);

  // Derived Calculations
  const totalMonthlyExpense = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const netProfit = thisMonthSales - totalMonthlyExpense;

  const handleSettle = async () => {
    const confirmSettle = window.confirm(
      `Are you sure you want to settle the current month?\n\nTotal Revenue: ₹${thisMonthSales}\nTotal Expense: ₹${totalMonthlyExpense}\nNet Profit: ₹${netProfit}\n\nThis will reset your dashboard for the next month.`
    );

    if (!confirmSettle) return;

    try {
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();
      
      const response = await settleMonth(month, year, totalMonthlyExpense);
      if (response && !response.error) {
        alert("Monthly settlement successful!");
        handleResetExpenses(); // Clear current expenses
        await Promise.all([
          fetchAnalytics(), // Reset dashboard sales/bookings
          fetchSettlementsHistory() // Update history list
        ]);
      } else {
        alert("Settlement failed: " + (response.detail || "Unknown error"));
      }
    } catch (error) {
      console.error("Settlement error:", error);
      alert("An error occurred during settlement.");
    }
  };

  // Formatting for the Table (Historical Settlements Only)
  const tableData = settlements.map(s => ({
    month: `${s.month} ${s.year}`,
    sales: s.total_revenue,
    expense: s.total_expense,
    profit: s.profit_loss,
    date: new Date(s.created_at).toLocaleDateString()
  }));

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="header-text">
          <h2 className="section-title">Business Analytics</h2>
          <p className="section-subtitle">Financial performance since last settlement</p>
        </div>
        <button className="btn-settle" onClick={handleSettle}>
          Settle This Month
        </button>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-icon">💰</div>
          <div className="analytics-info">
            <p className="analytics-label">Today's Sales</p>
            <h3 className="analytics-amount">₹{todaysSales.toLocaleString()}</h3>
            <p className="analytics-detail">{totalBookings} Bookings</p>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.03)', padding: '5px 8px', borderRadius: '4px' }}>
              <span><strong style={{ color: '#0ea5e9'}}>On:</strong> ₹{salesData.todayOnline?.toLocaleString() || 0}</span>
              <span><strong style={{ color: '#22c55e'}}>Ca:</strong> ₹{salesData.todayCash?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon">📅</div>
          <div className="analytics-info">
            <p className="analytics-label">This Month Sales</p>
            <h3 className="analytics-amount">₹{thisMonthSales.toLocaleString()}</h3>
            <p className="analytics-detail">Since last settlement</p>
          </div>
        </div>

        <div className="analytics-card card-expense">
          <div className="analytics-icon">📉</div>
          <div className="analytics-info">
            <p className="analytics-label">This Month Expense</p>
            <h3 className="analytics-amount">₹{totalMonthlyExpense.toLocaleString()}</h3>
            <p className="analytics-detail">{expenses.length} Records</p>
          </div>
        </div>

        <div className="analytics-card card-profit">
          <div className="analytics-icon">📈</div>
          <div className="analytics-info">
            <p className="analytics-label">Net Profit</p>
            <h3 className="analytics-amount" style={{ color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
              ₹{netProfit.toLocaleString()}
            </h3>
            <p className="analytics-detail">After Expenses</p>
          </div>
        </div>
      </div>

      <div className="table-section">
        <h3 className="section-title-sm">Monthly Profit & Loss History</h3>
        <ProfitTable data={tableData} />
      </div>
    </div>
  );
};

export default Analytics;
