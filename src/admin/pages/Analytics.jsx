import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import ProfitTable from '../components/ProfitTable';
import ExpenseDetailsModal from '../components/ExpenseDetailsModal';
import { settleMonth, getSettlements, getExpensesInRange } from '../../api';

import './Analytics.css';

const Analytics = () => {
  const { expenses, salesData, fetchAnalytics, handleResetExpenses, fetchExpenses } = useOutletContext();
  const [settlements, setSettlements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState({ month: '', expenses: [], total: 0 });
  
  const { thisMonthSales, todaysSales, totalBookings, todayTakeaways, yesterdaySales, yesterdayBookings, yesterdayTakeaways, yesterdayCash, yesterdayOnline } = {
    thisMonthSales: salesData.monthlySales,
    todaysSales: salesData.todaySales,
    totalBookings: salesData.totalBookings,
    todayTakeaways: salesData.todayTakeaways || 0,
    yesterdaySales: salesData.yesterdaySales,
    yesterdayBookings: salesData.yesterdayBookings,
    yesterdayTakeaways: salesData.yesterdayTakeaways || 0,
    yesterdayCash: salesData.yesterdayCash,
    yesterdayOnline: salesData.yesterdayOnline
  };

  // Fetch settlement history
  const fetchSettlementsHistory = async () => {
    try {
      const data = await getSettlements();
      if (Array.isArray(data)) {
        setSettlements(data);
      } else {
        console.warn("fetchSettlementsHistory returned non-array:", data);
        setSettlements([]);
      }
    } catch (error) {
      console.error("Failed to fetch settlements:", error);
    }
  };

  useEffect(() => {
    fetchSettlementsHistory();
  }, []);

  // Derived Calculations
  const totalMonthlyExpense = useMemo(() => {
    const validExpenses = Array.isArray(expenses) ? expenses : [];
    return validExpenses.reduce((sum, exp) => sum + exp.amount, 0);
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
          fetchSettlementsHistory(), // Update history list
          fetchExpenses() // Hook into latest settlement cut-off boundary
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
  const validSettlements = Array.isArray(settlements) ? settlements : [];
  const tableData = validSettlements.map((s, index, array) => {
    // Current settlement timestamp
    const endDate = s.created_at;
    // Add a 5-second buffer forward to the endDate for the fetch to catch 
    // expenses added at the exact same moment/second of settlement.
    const endPlusBuffer = new Date(new Date(endDate).getTime() + 5000).toISOString();
    
    // Previous settlement timestamp (if exists, it is the next index in the DESC sorted array)
    const startDate = array[index + 1]?.created_at || "2000-01-01T00:00:00Z"; 

    return {
      month: `${s.month} ${s.year}`,
      sales: s.total_revenue,
      expense: s.total_expense,
      profit: s.profit_loss,
      expense_details: s.expense_details, 
      date: new Date(s.created_at).toLocaleDateString(),
      startDate,
      endDate: endPlusBuffer // Use buffered end date for the query
    };
  });

  const handleExpenseClick = async (row) => {
    // 1. IMPROVED: Check for permanent snapshot first
    if (Array.isArray(row.expense_details) && row.expense_details.length > 0) {
      setSelectedMonthData({
        month: row.month,
        expenses: row.expense_details,
        total: row.expense,
        isLoading: false
      });
      setIsModalOpen(true);
      return;
    }

    // 2. Fallback: Dynamic range fetching for older settlements
    setSelectedMonthData({
      month: row.month,
      expenses: [],
      total: row.expense,
      isLoading: true
    });
    setIsModalOpen(true);

    try {
      let expenses = await getExpensesInRange(row.startDate, row.endDate);
      
      // 3. SECONDARY FALLBACK: If range returns empty, try matching by the user-entered date string
      if (expenses.length === 0) {
        console.log("Range fetch empty, attempting secondary date-string fallback...");
        const allExpenses = await getExpenses();
        if (Array.isArray(allExpenses)) {
          // Extract Month and Year from row.month (e.g., "March 2026")
          const [monthName, year] = row.month.split(" ");
          // Map of month names to their index strings
          const monthMap = {
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
          };
          const targetMonth = monthMap[monthName];
          const targetYear = year;
          
          // Filter expenses that match the specific month/year in their 'date' field (YYYY-MM-DD)
          expenses = allExpenses.filter(exp => {
            if (!exp.date) return false;
            return exp.date.startsWith(`${targetYear}-${targetMonth}`);
          });
        }
      }

      setSelectedMonthData({
        month: row.month,
        expenses: expenses,
        total: row.expense,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch historical expenses:", error);
      setSelectedMonthData(prev => ({ ...prev, isLoading: false }));
    }
  };


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
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
              <span style={{ background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#6366f1', fontWeight: 600 }}>🎱 {totalBookings} Bookings</span>
              {todayTakeaways > 0 && <span style={{ background: 'rgba(249,115,22,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#f97316', fontWeight: 600 }}>☕ {todayTakeaways} Takeaways</span>}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.03)', padding: '5px 8px', borderRadius: '4px' }}>
              <span><strong style={{ color: '#0ea5e9'}}>On:</strong> ₹{salesData.todayOnline?.toLocaleString() || 0}</span>
              <span><strong style={{ color: '#22c55e'}}>Ca:</strong> ₹{salesData.todayCash?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-icon">🌅</div>
          <div className="analytics-info">
            <p className="analytics-label">Yesterday's Sales</p>
            <h3 className="analytics-amount">₹{yesterdaySales.toLocaleString()}</h3>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.85rem', color: '#64748b' }}>
              <span style={{ background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#6366f1', fontWeight: 600 }}>🎱 {yesterdayBookings} Bookings</span>
              {yesterdayTakeaways > 0 && <span style={{ background: 'rgba(249,115,22,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#f97316', fontWeight: 600 }}>☕ {yesterdayTakeaways} Takeaways</span>}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.03)', padding: '5px 8px', borderRadius: '4px' }}>
              <span><strong style={{ color: '#0ea5e9'}}>On:</strong> ₹{yesterdayOnline?.toLocaleString() || 0}</span>
              <span><strong style={{ color: '#22c55e'}}>Ca:</strong> ₹{yesterdayCash?.toLocaleString() || 0}</span>
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
            <h3 className="analytics-amount" style={{ color: '#ef4444' }}>₹{totalMonthlyExpense.toLocaleString()}</h3>
            <p className="analytics-detail">{(Array.isArray(expenses) ? expenses : []).length} Records</p>
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

      <div className="table-section" style={{ marginTop: '2rem' }}>
        <h3 className="section-title-sm">Monthly Profit & Loss History</h3>
        <ProfitTable data={tableData} onExpenseClick={handleExpenseClick} />
      </div>

      <ExpenseDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        month={selectedMonthData.month}
        expenses={selectedMonthData.expenses}
        total={selectedMonthData.total}
        isLoading={selectedMonthData.isLoading}
      />

    </div>
  );
};

export default Analytics;
