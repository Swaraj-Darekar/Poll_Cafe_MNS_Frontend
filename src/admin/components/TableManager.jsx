import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import AdminTableCard from './AdminTableCard';
import PaymentModal from './PaymentModal';
import { 
  getTables, 
  startSession, 
  getActiveSessions, 
  endSession, 
  markPaid, 
  getSettings, 
  getBookingByPhone, 
  getUpcomingBookingsPerTable,
  getMenu,
  recordTakeawaySale
} from '../../api';
import { getTableOrders, addOrderItem, removeOrderItem, clearTableOrders } from '../../utils/menuUtils';
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

  // Order Management State
  const [tableOrders, setTableOrders] = useState({});
  const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(false);
  const [isViewActiveOrderOpen, setIsViewActiveOrderOpen] = useState(false);
  const [activeOrderTable, setActiveOrderTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tables and active sessions from backend
  const fetchTables = async () => {
    try {
      console.log('DEBUG: Fetching tables and active sessions...');
      const [tablesData, activeSessionsData, settingsData, upcomingBookings, menuData] = await Promise.all([
        getTables(),
        getActiveSessions(),
        getSettings(),
        getUpcomingBookingsPerTable(),
        getMenu()
      ]);

      console.log('DEBUG: Tables Data Received:', tablesData);
      console.log('DEBUG: Active Sessions Received:', activeSessionsData);

      if (settingsData) {
        setSettings(settingsData);
      }

      if (menuData) {
        setMenuItems(menuData);
      }

      const activeSessionsMap = activeSessionsData.reduce((acc, cur) => {
        acc[String(cur.table_id)] = cur;
        return acc;
      }, {});

      // Defer localStorage writes
      Promise.resolve().then(() => {
        activeSessionsData.forEach(session => {
            localStorage.setItem(`session_${session.table_id}`, session.id);
        });
      });

      const mappedTables = tablesData.map(t => {
        const activeSession = activeSessionsMap[String(t.id)];

        const isRunning = activeSession ? true : t.status === 'occupied';

        let tableName = `Table ${t.table_number}`;
        if (t.type === 'big') tableName = `Big Table ${t.table_number}`;
        if (t.type === 'sd' || t.table_number == 5) tableName = "SD Gaming Table";

        let tableRate = t.type === 'big' ? settings.big_price_per_hour : settings.small_price_per_hour;
        if (t.type === 'sd' || t.table_number == 5) tableRate = settings.sd_price_per_hour || 200;

        return {
          ...t,
          id: t.id,
          name: tableName,
          rate: tableRate || (t.type === 'big' ? 150 : 100),
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
    setTableOrders(getTableOrders());
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

    const tableId = selectedTable.id;
    const previousTables = [...tables];
    const previousSessions = { ...activeSessions };
    const tempSessionId = `temp_${Date.now()}`;
    const nameToSave = formData.name;
    const phoneToSave = formData.phone;
    const bookingIdToSave = foundBooking?.id || null;

    // Optimistically update UI instantly
    setTables(prev => prev.map(t => 
        t.id === tableId ? { 
            ...t, 
            isRunning: true, 
            customerName: nameToSave, 
            customerPhone: phoneToSave,
            startTime: Date.now(),
            sessionId: tempSessionId
        } : t
    ));
    setActiveSessions(prev => ({ ...prev, [tableId]: tempSessionId }));
    
    // Close modal instantly for a snappy feel
    handleModalClose();

    try {
      const session = await startSession(
        tableId,
        nameToSave,
        phoneToSave,
        bookingIdToSave
      );

      if (session && !session.error && !session.detail) {
        // Re-align with real DB session ID
        setActiveSessions(prev => ({ ...prev, [tableId]: session.id }));
        localStorage.setItem(`session_${tableId}`, session.id);
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, sessionId: session.id } : t));
        fetchTables(); // Sync silently
      } else {
        // Rollback
        setTables(previousTables);
        setActiveSessions(previousSessions);
        alert("Failed to start table: " + (session.detail || "Unknown error"));
      }
    } catch (error) {
      setTables(previousTables);
      setActiveSessions(previousSessions);
      console.error('Error starting table:', error);
      alert("An unexpected error occurred.");
    }
  };

  const handleAddItemClick = (table) => {
    setActiveOrderTable(table);
    setIsOrderMenuOpen(true);
  };

  const handleViewOrderClick = (table) => {
    setActiveOrderTable(table);
    setIsViewActiveOrderOpen(true);
  };

  const handleAddMenuToTable = (item) => {
    if (!activeOrderTable) return;
    const updatedOrders = addOrderItem(activeOrderTable.id, item);
    setTableOrders({ ...tableOrders, [activeOrderTable.id]: updatedOrders });
    // alert(`${item.name} added to ${activeOrderTable.name}`);
  };

  const handleRemoveOrderItem = (orderSnapshotId) => {
    if (!activeOrderTable) return;
    const updatedOrders = removeOrderItem(activeOrderTable.id, orderSnapshotId);
    setTableOrders({ ...tableOrders, [activeOrderTable.id]: updatedOrders });
  };

  const getItemQuantity = (itemId) => {
    if (!activeOrderTable) return 0;
    const currentOrders = tableOrders[activeOrderTable.id] || [];
    return currentOrders.filter(i => i.id === itemId).length;
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
        const currentOrders = tableOrders[table.id] || [];
        const orderTotal = currentOrders.reduce((sum, item) => sum + item.price, 0);
        
        setPaymentData({
          table,
          sessionId: sessionId,
          duration: response.total_seconds || (response.total_minutes * 60),
          durationMinutes: response.total_minutes || Math.floor(response.total_seconds / 60),
          totalAmount: response.total_amount + orderTotal,
          grossAmount: response.gross_amount + orderTotal,
          advanceAmount: response.advance_amount,
          commissionAmount: response.commission_amount,
          upiId: response.upi_id || settings.upi_id,
          rate: response.rate,
          orderItems: currentOrders // Pass order items to PaymentModal
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
    
    const tableId = paymentData.table.id;
    const amount = paymentData.totalAmount;
    const sessionId = paymentData.sessionId;
    const payloadData = {
        total_amount: amount,
        gross_amount: paymentData.grossAmount,
        commission_amount: paymentData.commissionAmount,
        duration_minutes: paymentData.durationMinutes,
        payment_method: paymentMethod || 'online'
    };

    // Close modal and update UI instantly (Optimistic UI)
    setIsPaymentModalOpen(false);
    
    // For Take Away, we just clear the orders and update sales stats
    if (tableId === 'takeaway') {
      handleAddSale(amount, payloadData.payment_method);
      setPaymentData(null);
      clearTableOrders('takeaway');
      setTableOrders(getTableOrders());
      // Persist to backend so analytics picks it up
      try {
        const result = await recordTakeawaySale(amount, payloadData.payment_method);
        if (!result || result.detail) {
          console.error('Takeaway sale backend record failed:', result);
        } else {
          console.log('Takeaway sale recorded in backend:', result);
        }
      } catch (err) {
        console.error('Error recording takeaway sale to backend:', err);
      }
      return; 
    }

    localStorage.removeItem(`session_${tableId}`);
    setActiveSessions(prev => {
      const newState = { ...prev };
      delete newState[tableId];
      return newState;
    });
    setTables(prev => prev.map(t => t.id === tableId ? {
        ...t, 
        isRunning: false, 
        customerName: '', 
        customerPhone: '', 
        startTime: null, 
        sessionId: null 
    } : t));
    
    handleAddSale(amount, payloadData.payment_method);
    setPaymentData(null);
    clearTableOrders(tableId); // Important: Clear orders after payment
    setTableOrders(getTableOrders()); // Refresh state

    try {
      await markPaid(sessionId, payloadData);
      fetchTables(); // Sync without blocking
    } catch (error) {
      console.error('Error marking as paid:', error);
      fetchTables(); // Reset on error
    }
  };

  // ── Take Away Specific Handlers ──
  const handleTakeAwayClick = () => {
    setActiveOrderTable({ id: 'takeaway', name: 'Take Away' });
    setIsOrderMenuOpen(true);
  };

  const handleTakeAwayCheckout = () => {
    const currentOrders = tableOrders['takeaway'] || [];
    if (currentOrders.length === 0) {
      alert("No items added to Take Away yet.");
      return;
    }
    const orderTotal = currentOrders.reduce((sum, item) => sum + item.price, 0);
    
    setPaymentData({
      table: { id: 'takeaway', name: 'Take Away', type: 'takeaway' },
      sessionId: `takeaway_${Date.now()}`,
      duration: 0,
      durationMinutes: 0,
      totalAmount: orderTotal,
      grossAmount: orderTotal,
      advanceAmount: 0,
      commissionAmount: 0,
      upiId: settings.upi_id,
      rate: 0,
      orderItems: currentOrders 
    });
    setIsPaymentModalOpen(true);
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
          let tableRate = table.type === 'big' ? settings.big_price_per_hour : settings.small_price_per_hour;
          if (table.type === 'sd' || table.table_number == 5) tableRate = settings.sd_price_per_hour || 200;
          
          return (
            <AdminTableCard
              key={table.id}
              table={table}
              rate={tableRate || (table.type === 'big' ? 150 : 100)}
              orders={tableOrders[table.id] || []}
              onStart={handleStartClick}
              onEnd={handleEndTable}
              onAddItem={handleAddItemClick}
              onViewOrder={handleViewOrderClick}
              isWalletBlocked={isWalletBlocked}
            />
          );
        })}

        {/* ── Take Away Card (Moved to end) ── */}
        <div className={`admin-table-card takeaway-card ${tableOrders['takeaway']?.length > 0 ? 'running' : 'available'}`}>
          <div className="table-header-center">
            <h3 className="table-title">Take Away</h3>
            <span className="table-type">CAFÉ ORDERS</span>
          </div>
          {tableOrders['takeaway']?.length > 0 ? (
            <div className="card-active-content">
              <div className="timer-section">
                <div className="order-count-badge">{tableOrders['takeaway'].length} Items</div>
                <p className="customer-name">Active Take-Away</p>
                <p className="order-total-preview">₹{tableOrders['takeaway'].reduce((sum, i) => sum + i.price, 0)}</p>
              </div>
              <div className="table-actions-row">
                <button className="action-btn-circle add-item-btn" onClick={handleTakeAwayClick} title="Add Item">+</button>
                <button className="btn-end-pill checkout-takeaway-btn" onClick={handleTakeAwayCheckout}>CHECKOUT</button>
                <button className="action-btn-circle view-order-btn" onClick={() => handleViewOrderClick({ id: 'takeaway', name: 'Take Away' })} title="View Order">👁</button>
              </div>
            </div>
          ) : (
            <div className="idle-section" onClick={handleTakeAwayClick}>
              <button className="btn-add-circle">+</button>
              <span className="start-text">ADD ORDER</span>
            </div>
          )}
        </div>
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
        orderItems={paymentData?.orderItems}
        onPaid={handleMarkAsPaid}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      {/* ── Order Selection Modal (Menu) ── */}
      {isOrderMenuOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal order-menu-modal">
            <div className="modal-header">
              <h3>Order for {activeOrderTable?.name}</h3>
              <button className="close-btn" onClick={() => { setIsOrderMenuOpen(false); setSearchTerm(''); }}>&times;</button>
            </div>
            <div className="menu-search-container">
              <span className="search-icon-fixed">🔍</span>
              <input
                type="text"
                placeholder="Search menu items..."
                className="menu-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn" 
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
            <div className="menu-grid-container">
              <div className="menu-items-grid">
                {menuItems
                  .filter(item => (item.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                  .map(item => {
                    const quantity = getItemQuantity(item.id);
                    return (
                      <div 
                        key={item.id} 
                        className={`menu-order-card ${quantity > 0 ? 'menu-order-card--selected' : ''}`} 
                        onClick={() => handleAddMenuToTable(item)}
                      >
                        <div className="menu-card-info">
                          <span className="menu-card-name">{item.name}</span>
                          <span className="menu-card-price">₹{item.price}</span>
                        </div>
                        <div className="menu-card-action">
                          {quantity > 0 && <span className="item-qty-badge">x{quantity}</span>}
                          <button className="add-plus-btn">+</button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="modal-actions menu-modal-footer">
              <button className="btn btn-outline-dark" onClick={() => setIsViewActiveOrderOpen(true)}>View Order</button>
              <button 
                className="btn btn-primary" 
                onClick={() => { 
                  setIsOrderMenuOpen(false); 
                  setSearchTerm(''); 
                  // If it's a takeaway, automatically open the bill after clicking Done
                  if (activeOrderTable?.id === 'takeaway') {
                    handleTakeAwayCheckout();
                  }
                }}
              >
                {activeOrderTable?.id === 'takeaway' ? 'Finish & Bill' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Active Order Modal ── */}
      {isViewActiveOrderOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal active-order-modal">
            <div className="modal-header">
              <h3>Orders - {activeOrderTable?.name}</h3>
              <button className="close-btn" onClick={() => setIsViewActiveOrderOpen(false)}>&times;</button>
            </div>
            <div className="order-list-container">
              {tableOrders[activeOrderTable?.id]?.length > 0 ? (
                <ul className="active-order-list">
                  {tableOrders[activeOrderTable.id].map(item => (
                    <li key={item.orderSnapshotId} className="active-order-item">
                      <span className="item-name">{item.name}</span>
                      <div className="item-right">
                        <span className="item-price">₹{item.price}</span>
                        <button className="remove-btn" onClick={() => handleRemoveOrderItem(item.orderSnapshotId)}>&times;</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-order-msg">No items ordered yet.</div>
              )}
            </div>
            {tableOrders[activeOrderTable?.id]?.length > 0 && (
              <div className="order-summary-footer">
                <span>Total:</span>
                <strong>₹{tableOrders[activeOrderTable.id].reduce((sum, i) => sum + i.price, 0)}</strong>
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="btn btn-outline-dark" onClick={() => setIsViewActiveOrderOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

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
