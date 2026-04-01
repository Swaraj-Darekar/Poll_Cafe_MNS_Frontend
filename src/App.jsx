import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { testBackendConnection } from './api';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SectionGuard from './admin/components/SectionGuard';
import { AuthProvider } from './context/AuthContext';

// Admin Components
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Analytics from './admin/pages/Analytics';
import Expenses from './admin/pages/Expenses';
import Bookings from './admin/pages/Bookings';
import Settings from './admin/pages/Settings';
import History from './admin/pages/History';
import './index.css';

// Super Admin Components
import SuperAdminLayout from './superadmin/SuperAdminLayout';
import SADashboard from './superadmin/pages/Dashboard';
import SASettings from './superadmin/pages/Settings';

// Public Layout Component
const PublicLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const handleBookNow = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };

  return (
    <div className="app">
      <Navbar />
      <main>
        <Home onBookNow={handleBookNow} />
      </main>
      <Footer />
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        selectedTable={selectedTable} 
      />
    </div>
  );
};
function App() {
  useEffect(() => {
    // Eagerly ping the backend to "wake it up" from cold starts (Render/Vercel free tier)
    const wakeup = async () => {
      try {
        await testBackendConnection();
        console.log('Backend warmed up successfully');
      } catch (e) {
        console.error('Backend warm-up failed', e);
      }
    };
    wakeup();
  }, []);

  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/*" element={<PublicLayout />} />

        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<SectionGuard section="analytics"><Analytics /></SectionGuard>} />
            <Route path="history" element={<History />} />
            <Route path="expenses" element={<SectionGuard section="expenses"><Expenses /></SectionGuard>} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="settings" element={<SectionGuard section="settings"><Settings /></SectionGuard>} />
          </Route>
        </Route>

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SADashboard />} />
            <Route path="settings" element={<SASettings />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
