import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import AdminTableCard from './AdminTableCard';
import PaymentModal from './PaymentModal';
import { getTables, startSession, getActiveSessions, endSession, markPaid, getSettings, getBookingByPhone, getUpcomingBookingsPerTable } from '../../api';
import './TableManager.css';

const TableManager = ({ onUpdateStats }) => {
  const { handleAddSale, isWalletBlocked, walletBalance } = useOutletContext();
  const [tables, setTables] = useState([]);
  const [activeSessions, setActiveSessions] = useState({}); // To track session IDs for active tables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  // Linked booking from "Find Booking" flow
  const [foundBooking, setFoundBooking] = useState(null);
  // Find Booking separate modal
  const [isFindBookingOpen, setIsFindBookingOpen] = useState(false);
  const [findPhone, setFindPhone] = useState('');
  const [isFindingBooking, setIsFindingBooking] = useState(false);
  const [foundBookingResult, setFoundBookingResult] = useState(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [settings, setSettings] = useState({ price_per_hour: 100, upi_id: 'example@upi' });
  const [isStarting, setIsStarting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch tables and active sessions from backend
  const fetchTables = async () => {
    try {
      console.log('DEBUG: Fetching tables and active sessions...');
      const [tablesData, activeSessionsData, settingsData, upcomingBookings] = await Promise.all([
        getTables(),
        getActiveSessions(),
        getSettings(),
        getUpcomingBookingsPerTable()
      ]);

      console.log('DEBUG: Tables Data Received:', tablesData);
      console.log('DEBUG: Active Sessions Received:', activeSessionsData);

      if (settingsData) {
        setSettings(settingsData);
      }

      const mappedTables = tablesData.map(t => {
        const activeSession = activeSessionsData.find(s => String(s.table_id) === String(t.id));

        if (activeSession) {
          localStorage.setItem(`session_${t.id}`, activeSession.id);
        }

        const isRunning = activeSession ? true : t.status === 'occupied';

        return {
          ...t,
          id: t.id,
          name: t.type === 'big' ? `Big Table ${t.table_number}` : `Table ${t.table_number}`,
          isRunning: isRunning,
          startTime: activeSession ? new Date(activeSession.start_time).getTime() : null,
          customerName: activeSession ? activeSession.customer_name : '',
          customerPhone: activeSession ? activeSession.customer_phone : '',
          sessionId: activeSession ? activeSession.id : null,
          nextBooking: upcomingBookings[t.id] || null
        };
      });

      setTables(mappedTables);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Handle auto-search from query param
  useEffect(() => {
    const bookingPhone = searchParams.get('startBooking');
    if (bookingPhone) {
      setFindPhone(bookingPhone);
      setIsFindBookingOpen(true);
      autoSearchBooking(bookingPhone);
      // Clear the param after opening to avoid re-triggering on refresh
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const autoSearchBooking = async (phone) => {
    try {
      setIsFindingBooking(true);
      const booking = await getBookingByPhone(phone);
      if (booking && booking.id) {
        setFoundBookingResult(booking);
      }
    } catch (error) {
      console.error("Auto-search failed:", error);
    } finally {
      setIsFindingBooking(false);
    }
  };

  // Update parent stats
  useEffect(() => {
    if (tables.length > 0) {
      const activeCount = tables.filter(t => t.isRunning).length;
      onUpdateStats({
        total: tables.length,
        active: activeCount,
        available: tables.length - activeCount
      });
    }
  }, [tables, onUpdateStats]);

  // "Find Booking" button on dashboard — opens separate modal
  const handleFindBookingSearch = async () => {
    if (!findPhone.trim()) {
      alert("Please enter a phone number.");
      return;
    }
    try {
      setIsFindingBooking(true);
      const booking = await getBookingByPhone(findPhone.trim());
      if (booking && booking.id) {
        setFoundBookingResult(booking);
      } else {
        alert("No active booking found for this number.");
      }
    } catch (error) {
      console.error("Booking search failed:", error);
      alert("Error searching booking.");
    } finally {
      setIsFindingBooking(false);
    }
  };

  // Start a table from the Find Booking modal (link booking)
  const handleStartFromBooking = (table) => {
    setFoundBooking(foundBookingResult);
    setFormData({ name: foundBookingResult.name, phone: findPhone });
    setSelectedTable(table);
    setIsFindBookingOpen(false);
    setIsModalOpen(true);
  };

  const handleStartClick = (table) => {
    if (isWalletBlocked) {
      alert(`System Blocked: Your wallet balance (₹${walletBalance}) is too low. Please recharge 5 rs in the Super Admin panel to continue.`);
      return;
    }
    setSelectedTable(table);
    setFormData({ name: '', phone: '' });
    setFoundBooking(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    setFoundBooking(null);
  };

  const handleStartTable = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Name and Phone are required.");
      return;
    }

    try {
      setIsStarting(true);
      const session = await startSession(
        selectedTable.id,
        formData.name,
        formData.phone,
        foundBooking?.id || null
      );

      if (session && !session.error && !session.detail) {
        setActiveSessions(prev => ({ ...prev, [selectedTable.id]: session.id }));
        localStorage.setItem(`session_${selectedTable.id}`, session.id);
        await fetchTables();
        handleModalClose();
      } else {
        alert("Failed to start table: " + (session.detail || "Unknown error"));
      }
    } catch (error) {
      console.error('Error starting table:', error);
      alert("An unexpected error occurred.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndTable = async (table) => {
    let sessionId = table.sessionId || activeSessions[table.id] || localStorage.getItem(`session_${table.id}`);
    if (!sessionId) {
      alert("Session ID not found. Please refresh.");
      return;
    }

    try {
      const response = await endSession(sessionId, true);
      if (response && !response.error && !response.detail) {
        setPaymentData({
          table,
          sessionId: sessionId,
          duration: response.total_seconds || (response.total_minutes * 60),
          durationMinutes: response.total_minutes || Math.floor(response.total_seconds / 60),
          totalAmount: response.total_amount,
          grossAmount: response.gross_amount,
          advanceAmount: response.advance_amount,
          commissionAmount: response.commission_amount,
          upiId: response.upi_id || settings.upi_id,
          rate: response.rate
        });
        setIsPaymentModalOpen(true);
      } else {
        alert("Failed to end table session: " + (response.detail || "Unknown error"));
      }
    } catch (error) {
      console.error('Error ending table:', error);
      alert("Error ending table. If this continues, please check your database connection or run the SQL migration in Settings.");
    }
  };

  const handleMarkAsPaid = async (paymentMethod) => {
    if (!paymentData) return;
    try {
      await markPaid(paymentData.sessionId, {
        total_amount: paymentData.totalAmount,
        gross_amount: paymentData.grossAmount,
        commission_amount: paymentData.commissionAmount,
        duration_minutes: paymentData.durationMinutes,
        payment_method: paymentMethod || 'online'
      });
      localStorage.removeItem(`session_${paymentData.table.id}`);
      setActiveSessions(prev => {
        const newState = { ...prev };
        delete newState[paymentData.table.id];
        return newState;
      });
      handleAddSale(paymentData.totalAmount, paymentMethod || 'online');
      await fetchTables();
      setIsPaymentModalOpen(false);
      setPaymentData(null);
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  return (
    <div className="table-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Table Management</h2>
        <button
          className="btn btn-outline-dark"
          onClick={() => { 
            if (isWalletBlocked) {
              alert(`System Blocked: Your wallet balance (₹${walletBalance}) is too low. Please recharge.`);
              return;
            }
            setIsFindBookingOpen(true); 
            setFindPhone(''); 
            setFoundBookingResult(null); 
          }}
          disabled={isWalletBlocked}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '0.9rem', opacity: isWalletBlocked ? 0.6 : 1 }}
        >
          🔍 Find Booking
        </button>
      </div>
      <div className="tables-grid">
        {tables.map(table => {
          const tableRate = table.type === 'big' ? settings.big_price_per_hour : settings.small_price_per_hour;
          return (
            <AdminTableCard
              key={table.id}
              table={table}
              rate={tableRate || (table.type === 'big' ? 150 : 100)}
              onStart={handleStartClick}
              onEnd={handleEndTable}
              isWalletBlocked={isWalletBlocked}
            />
          );
        })}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        table={paymentData?.table}
        duration={paymentData?.duration}
        totalAmount={paymentData?.totalAmount}
        grossAmount={paymentData?.grossAmount}
        advanceAmount={paymentData?.advanceAmount}
        commissionAmount={paymentData?.commissionAmount}
        upiId={paymentData?.upiId}
        rate={paymentData?.rate}
        onPaid={handleMarkAsPaid}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* ── Original Start Table Modal (Name → Phone) ── */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Start {selectedTable?.name}</h3>
              <button className="close-btn" onClick={handleModalClose}>&times;</button>
            </div>
            <form onSubmit={handleStartTable} className="modal-form">
              {foundBooking && (
                <div style={{
                  backgroundColor: '#e0f2fe',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  color: '#0369a1',
                  border: '1px solid #bae6fd'
                }}>
                  ✅ Booking Linked: <strong>₹{foundBooking.advance_paid} will be deducted</strong>
                </div>
              )}
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="Enter phone"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline-dark" onClick={handleModalClose} disabled={isStarting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isStarting}>
                  {isStarting ? "Starting..." : "Start Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Find Booking Separate Modal ── */}
      {isFindBookingOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>🔍 Find Booking</h3>
              <button className="close-btn" onClick={() => setIsFindBookingOpen(false)}>&times;</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Customer Phone Number</label>
                <input
                  type="tel"
                  value={findPhone}
                  onChange={(e) => { setFindPhone(e.target.value); setFoundBookingResult(null); }}
                  placeholder="Enter phone number"
                  autoFocus
                />
              </div>
              <div className="modal-actions" style={{ marginBottom: foundBookingResult ? '16px' : '0' }}>
                <button type="button" className="btn btn-outline-dark" onClick={() => setIsFindBookingOpen(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleFindBookingSearch} disabled={isFindingBooking}>
                  {isFindingBooking ? "Searching..." : "Search"}
                </button>
              </div>

              {foundBookingResult && (
                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.25)', marginBottom: '16px' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#064e3b' }}>{foundBookingResult.name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                      Advance Paid: <strong style={{ color: '#10b981' }}>₹{foundBookingResult.advance_paid}</strong>
                    </p>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '10px' }}>Select a table to start:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tables.filter(t => !t.isRunning).map(t => {
                      // Find the type of the table originally assigned to this booking
                      const bookingOriginalTable = tables.find(bt => Number(bt.id) === Number(foundBookingResult.table_id));
                      const bookingType = bookingOriginalTable?.type;
                      const isTypeMismatch = bookingType && t.type !== bookingType;

                      return (
                        <button
                          key={t.id}
                          className={`btn ${isTypeMismatch ? 'btn-outline-secondary' : 'btn-primary'}`}
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '0.85rem',
                            opacity: isTypeMismatch ? 0.5 : 1,
                            cursor: isTypeMismatch ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => {
                            if (isTypeMismatch) {
                              alert(`This booking is for a ${bookingType} table. Please select a ${bookingType} table.`);
                              return;
                            }
                            handleStartFromBooking(t);
                          }}
                          title={isTypeMismatch ? `Requires ${bookingType} table` : ''}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                    {tables.filter(t => !t.isRunning).length === 0 && (
                      <p style={{ color: '#f87171', fontSize: '0.85rem' }}>No available tables right now.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManager;
