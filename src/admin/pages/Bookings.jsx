import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBookings, clearBookingHistory } from '../../api';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleStartPlay = (phone) => {
    navigate(`/admin?startBooking=${phone}`);
  };

  // Group bookings
  const pendingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending_admin');
  const historyBookings = bookings.filter(b => !['confirmed', 'pending_admin'].includes(b.status));

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoryBookings = historyBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historyBookings.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderTable = (data, title, isHistory = false) => (
    <div className="bookings-section">
      <div className="section-header-row">
        <h3 className="section-subtitle">{title} ({isHistory ? historyBookings.length : data.length})</h3>
      </div>
      <div className="bookings-list-card table-container">
        {data.length === 0 ? (
          <div className="empty-state">No {title.toLowerCase()} found.</div>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone Number</th>
                <th>Table</th>
                <th>Booking Slot</th>
                <th>Advance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((booking) => {
                const isConfirmed = booking.status === 'confirmed';
                const isFailed = booking.status === 'payment_failed';
                const isCompleted = booking.status === 'completed';
                
                let badgeClass = 'badge-success'; 
                if (booking.status === 'pending_admin') badgeClass = 'badge-warning';
                if (isCompleted) badgeClass = 'badge-secondary';
                if (isFailed) badgeClass = 'badge-danger';

                return (
                  <tr key={booking.id} className={isCompleted ? 'row-completed' : ''}>
                    <td>
                      <div className="cust-info">
                        <span className="cust-initial">{booking.name.charAt(0).toUpperCase()}</span>
                        <span className="cust-name">{booking.name}</span>
                      </div>
                    </td>
                    <td className="font-mono">
                      {isConfirmed ? (
                        <button className="phone-link" onClick={() => handleStartPlay(booking.phone)}>
                          {booking.phone}
                        </button>
                      ) : booking.phone}
                    </td>
                    <td>
                      <div className="table-badge">
                        {booking.tables ? `T${booking.tables.table_number}` : `ID: ${booking.table_id}`}
                      </div>
                    </td>
                    <td>
                      <div className="booking-slot">
                        <span className="slot-date">{formatDate(booking.booking_time)}</span>
                        <span className="slot-time">{formatTime(booking.booking_time)}</span>
                      </div>
                    </td>
                    <td className="font-mono text-success font-bold">₹{booking.advance_paid}</td>
                    <td>
                      <span className={`status-badge ${badgeClass}`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {isConfirmed && (
                        <button 
                          className="btn-start-play" 
                          onClick={() => handleStartPlay(booking.phone)}
                        >
                          ▶ Start Play
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isHistory && totalPages > 1 && (
        <div className="pagination-container">
          <button 
            className="pagination-btn" 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page <strong>{currentPage}</strong> of {totalPages}
          </div>

          <button 
            className="pagination-btn" 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-page bookings-page">
      <div className="page-header">
        <div>
          <h2>Online Bookings</h2>
          <p className="text-secondary">Manage and track your advance table reservations.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchBookings}>
          ↻ Refresh List
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading bookings...</div>
      ) : (
        <>
          {renderTable(pendingBookings, "Pending Reservations")}
          <div style={{ marginTop: '3rem' }}>
            {renderTable(currentHistoryBookings, "Booking History", true)}
          </div>
        </>
      )}
    </div>
  );
};

export default Bookings;
