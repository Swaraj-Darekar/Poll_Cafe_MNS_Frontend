import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BookingNotifications from './components/BookingNotifications';
import { getAnalytics, getSuperAdminStats } from '../api';
import './AdminLayout.css';

const AdminLayout = () => {
  const [expenses, setExpenses] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null); 
  const [isWalletBlocked, setIsWalletBlocked] = useState(false);

  const [salesData, setSalesData] = useState({
    todaySales: 0,
    monthlySales: 0,
    totalBookings: 0,
    todayCash: 0,
    todayOnline: 0
  });

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics();
      if (data) {
        setSalesData({
          todaySales: data.today.revenue,
          monthlySales: data.cycle.revenue,
          totalBookings: data.today.bookings,
          todayCash: data.today.cash_total || 0,
          todayOnline: data.today.online_total || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const fetchWallet = async () => {
    try {
      console.log("DEBUG: Fetching Wallet Stats...");
      const stats = await getSuperAdminStats();
      if (stats && typeof stats.wallet_balance !== 'undefined') {
        const balance = Number(stats.wallet_balance);
        console.log("DEBUG: Wallet Balance Fetched:", balance);
        setWalletBalance(balance);
        const blocked = balance <= 10;
        setIsWalletBlocked(blocked);
        // Debugging hook for dev console
        window.currentWalletBalance = balance;
        window.isWalletBlocked = blocked;
      } else {
        console.warn("DEBUG: Wallet stats empty or invalid:", stats);
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchWallet();
    // Poll stats more frequently (30s)
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchWallet();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddExpense = (newExpense) => {
    setExpenses(prev => [...prev, newExpense]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const handleResetExpenses = () => {
    setExpenses([]);
  };

  const handleAddSale = (amount, paymentMethod) => {
    setSalesData(prev => ({
      ...prev,
      todaySales: prev.todaySales + amount,
      monthlySales: prev.monthlySales + amount,
      totalBookings: prev.totalBookings + 1,
      todayCash: paymentMethod === 'cash' ? prev.todayCash + amount : prev.todayCash,
      todayOnline: paymentMethod !== 'cash' ? prev.todayOnline + amount : prev.todayOnline
    }));
    // Also re-fetch wallet balance after a sale (since commission was deducted)
    setTimeout(fetchWallet, 1000);
  };

  return (
    <div className="admin-layout">
      {walletBalance !== null && (
        <>
          {walletBalance <= 10 && (
            <div className="sa-global-overlay-banner error">
              ⚠️ <strong>CRITICAL: Insufficient Wallet Balance (₹{walletBalance})</strong>. System is blocked. Please add money in Super Admin panel.
            </div>
          )}
          {walletBalance > 10 && walletBalance < 15 && (
            <div className="sa-global-overlay-banner warning">
              🔔 <strong>Low Wallet Balance (₹{walletBalance})</strong>. Please recharge soon to avoid block.
            </div>
          )}
        </>
      )}
      <Sidebar />
      <div className="admin-main" style={{ marginTop: (walletBalance !== null && walletBalance < 15) ? '48px' : '0' }}>
        <Topbar />
        <div className="admin-content">
          <Outlet context={{ 
            expenses, 
            handleAddExpense, 
            handleDeleteExpense,
            handleResetExpenses,
            salesData,
            handleAddSale,
            fetchAnalytics,
            walletBalance,
            isWalletBlocked,
            fetchWallet
          }} />
        </div>
      </div>
      <BookingNotifications />
    </div>
  );
};


export default AdminLayout;
