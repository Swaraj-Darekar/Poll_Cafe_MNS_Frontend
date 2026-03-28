import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero';
import SearchSection from '../components/SearchSection';
import AvailabilityCards from '../components/AvailabilityCards';
import TableCard from '../components/TableCard';
import { getTables, getActiveSessions, bookTable, getSettings, checkAvailability, getBookingStatus } from '../api';
import { formatTime12Hour } from '../constants/data';
import heroBg from '../assets/hero-bg.png';
import './Home.css';

// Generate time slots from 08:00 to 22:30 in 30-min intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 22) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots();

const formatDate = (d) =>
  d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

const Home = () => {
  // Table & settings state
  const [tables, setTables] = useState([]);
  const [upiId, setUpiId] = useState('yourname@upi');
  const [rates, setRates] = useState({ big: 150, small: 100 });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Search / availability state
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [availability, setAvailability] = useState(null); // { big: {...}, small: {...} }
  const [isSearching, setIsSearching] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null); // 'big' | 'small'
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState(null); // { id, status }
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingFailed, setBookingFailed] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [step, setStep] = useState(1); // 1=details, 2=payment, 3=waiting
  const [callTimer, setCallTimer] = useState(40);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const pollRef = useRef(null);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const buildUpiUrl = () => {
    const note = encodeURIComponent(`BOOKING ${name || 'ADV'} ( don't remove this )`);
    const n = encodeURIComponent('Pool Cafe MNS');
    return `upi://pay?pa=${upiId}&pn=${n}&am=100&cu=INR&tn=${note}`;
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(buildUpiUrl())}`;

  const fetchTableStatus = async () => {
    try {
      const [tablesData, sessionsData, settingsData] = await Promise.all([
        getTables(),
        getActiveSessions(),
        getSettings()
      ]);
      if (settingsData) {
        if (settingsData.upi_id) setUpiId(settingsData.upi_id);
        const smallPrice = settingsData.small_price_per_hour || settingsData.price_per_hour_small || settingsData.price_per_hour || 100;
        const bigPrice = settingsData.big_price_per_hour || settingsData.price_per_hour_big || 150;
        setRates({ big: bigPrice, small: smallPrice });
      }
      const merged = tablesData.map(t => {
        const session = sessionsData.find(s => s.table_id === t.id);
        const isOccupied = !!(session || t.status === 'occupied');
        return {
          ...t,
          status: isOccupied ? 'occupied' : 'available',
        };
      });
      setTables(merged);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  useEffect(() => {
    fetchTableStatus();
    const interval = setInterval(fetchTableStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Poll booking status after booking is submitted
  useEffect(() => {
    if (bookingResult?.id && step === 3) {
      pollRef.current = setInterval(async () => {
        const status = await getBookingStatus(bookingResult.id);
        if (status?.status === 'confirmed') {
          clearInterval(pollRef.current);
          setBookingConfirmed(true);
        } else if (status?.status === 'payment_failed') {
          clearInterval(pollRef.current);
          setBookingFailed(true);
        }
      }, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [bookingResult, step]);

  useEffect(() => {
    let timer;
    if (step === 3 && !bookingConfirmed && !bookingFailed && callTimer > 0) {
      timer = setInterval(() => setCallTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, bookingConfirmed, bookingFailed, callTimer]);

  const handleSearch = async (criteria) => {
    try {
      setIsSearching(true);
      setSearchCriteria(criteria);
      setAvailability(null);

      const todayDate = new Date();
      const targetDate = criteria.date === 'Today'
        ? todayDate
        : new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);
      const [h, m] = criteria.time.split(':');
      targetDate.setHours(parseInt(h), parseInt(m), 0, 0);

      const result = await checkAvailability(targetDate.toISOString(), criteria.duration);
      setAvailability(result);

      setTimeout(() => {
        document.getElementById('availability-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const openModal = (tableType) => {
    setSelectedType(tableType);
    setName('');
    setPhone('');
    setStep(1);
    setCallTimer(40);
    setShowQR(false);
    setBookingResult(null);
    setBookingConfirmed(false);
    setBookingFailed(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    clearInterval(pollRef.current);
    setIsModalOpen(false);
    setStep(1);
    setBookingResult(null);
    setBookingConfirmed(false);
    setBookingFailed(false);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);
      const todayDate = new Date();
      const targetDate = searchCriteria.date === 'Today'
        ? todayDate
        : new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);
      const [h, m] = searchCriteria.time.split(':');
      targetDate.setHours(parseInt(h), parseInt(m), 0, 0);

      const response = await bookTable({
        table_type: selectedType,
        name,
        phone,
        booking_time: targetDate.toISOString(),
        duration: searchCriteria.duration
      });

      if (response?.id) {
        setBookingResult(response);
        setStep(3);
        // Refresh availability counts
        const result = await checkAvailability(targetDate.toISOString(), searchCriteria.duration);
        setAvailability(result);
      } else {
        alert('Booking failed: ' + (response?.detail || 'Slot might be taken.'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Something went wrong.');
    } finally {
      setIsBooking(false);
    }
  };

  const availableCount = tables.filter(t => t.status === 'available').length;
  const typePrice = selectedType === 'big' ? rates.big : rates.small;

  return (
    <div className="home-page" style={{ backgroundImage: `url(${heroBg})` }}>
      <Hero />
      <div className="content-wrapper">
        <SearchSection onSearch={handleSearch} isSearching={isSearching} />

        {/* Availability Results */}
        {availability && (
          <section id="availability-result" className="tables-section" style={{ paddingTop: '30px' }}>
            <div className="container">
              <AvailabilityCards
                availability={availability}
                onBook={openModal}
              />
            </div>
          </section>
        )}

        {/* Live table status bar */}
        {!availability && (
          <section id="tables" className="tables-section">
            <div className="container">
              <div className="tables-header-row">
                <div className="section-head-left">
                  <h2 className="section-title font-bold">Tables</h2>
                  <div className="divider" style={{ margin: '0' }} />
                </div>
              </div>

              {/* Tables Grid */}
              <div className="tables-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                {tables.slice(0, 6).map(table => (
                  <TableCard
                    key={table.id}
                    table={{
                      ...table,
                      price: table.type === 'big' ? rates.big : rates.small,
                      description: table.type === 'big' ? 'Big Match Table' : 'Standard 4-Player Table'
                    }}
                    onBookNow={() => {
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── Booking Modal ── */}
      {isModalOpen && (
        <div className="bm-overlay" onClick={(e) => e.target === e.currentTarget && step !== 3 && closeModal()}>
          <div className="bm-card">

            {/* Header */}
            <div className="bm-header">
              <div>
                <h3 className="bm-title">Reserve {selectedType === 'big' ? 'Big Table' : 'Small Table'}</h3>
                <p className="bm-subtitle">
                  {selectedType === 'big' ? 'Big Table · Perfect for groups' : 'Standard Table · Cozy & compact'} · ₹{typePrice}/hr
                </p>
              </div>
              {step !== 3 && <button className="bm-close" onClick={closeModal}>✕</button>}
            </div>

            {/* Slot summary pill */}
            {searchCriteria && (
              <div className="bm-slot-pill">
                📅&nbsp;
                <strong>{searchCriteria.date}</strong> at&nbsp;
                <strong>{formatTime12Hour(searchCriteria.time)}</strong> &nbsp;·&nbsp;
                <strong>{searchCriteria.duration}h</strong>
              </div>
            )}

            {/* Step indicator */}
            {step < 3 && (
              <div className="bm-steps">
                <div className={`bm-step ${step >= 1 ? 'active' : ''}`}>
                  <div className="bm-step-dot">1</div>
                  <span>Details</span>
                </div>
                <div className="bm-step-line" />
                <div className={`bm-step ${step >= 2 ? 'active' : ''}`}>
                  <div className="bm-step-dot">2</div>
                  <span>Payment</span>
                </div>
              </div>
            )}

            {/* ── STEP 1: Details ── */}
            {step === 1 && (
              <form className="bm-body" onSubmit={handleDetailsSubmit}>
                <div className="bm-advance-pill">
                  <span className="bm-advance-icon">💳</span>
                  <span><strong>₹100 advance</strong> · deducted from your final bill</span>
                </div>

                <div className="bm-field">
                  <label className="bm-label">Full Name</label>
                  <input
                    className="bm-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="bm-field">
                  <label className="bm-label">Phone Number</label>
                  <input
                    className="bm-input"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <button type="submit" className="bm-btn-primary">
                  Continue to Payment →
                </button>
              </form>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 2 && (
              <div className="bm-body">
                <div className="bm-summary">
                  <div className="bm-summary-row">
                    <span>Name</span><strong>{name}</strong>
                  </div>
                  <div className="bm-summary-row">
                    <span>Phone</span><strong>{phone}</strong>
                  </div>
                  <div className="bm-summary-row bm-summary-total">
                    <span>Advance</span><strong>₹100</strong>
                  </div>
                </div>

                <p className="bm-pay-heading">Pay ₹100 using:</p>

                <div className="bm-pay-grid">
                  <a className="bm-pay-app bm-phonepe"
                    onClick={handleConfirmBooking}
                    href={`upi://pay?pa=${upiId}&pn=${encodeURIComponent("PoolCafe")}&am=100&cu=INR&tn=${encodeURIComponent("BOOKING " + name + " (don't remove this)")}&tr=${encodeURIComponent("BOOK_" + Date.now())}`}>
                    <svg className="bm-app-logo" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="24" fill="#5f259f"/>
                      <path d="M33 17.5C33 15 31 13 28.5 13H16v22h5v-8h7.5C31 27 33 25 33 22.5V17.5z" fill="white"/>
                      <rect x="21" y="17" width="7" height="6" rx="2" fill="#5f259f"/>
                    </svg>
                    <span>PhonePe</span>
                  </a>

                  <a className="bm-pay-app bm-gpay"
                    onClick={handleConfirmBooking}
                    href={`upi://pay?pa=${upiId}&pn=${encodeURIComponent("PoolCafe")}&am=100&cu=INR&tn=${encodeURIComponent("BOOKING " + name + " (don't remove this)")}&tr=${encodeURIComponent("BOOK_" + Date.now())}`}>
                    <svg className="bm-app-logo" viewBox="0 0 40 40">
                      <rect width="40" height="40" rx="8" fill="white"/>
                      <path d="M26.5 20.2c0-.5-.1-1-.2-1.4h-6.1v2.7h3.5c-.2.9-.6 1.6-1.3 2.1v1.7h2.1c1.3-1.2 2-2.9 2-5.1z" fill="#4285F4"/>
                      <path d="M20.2 26.6c1.7 0 3.2-.6 4.3-1.5l-2.1-1.7c-.6.4-1.4.6-2.2.6-1.7 0-3.1-1.1-3.6-2.7h-2.2v1.7c1.1 2.1 3.2 3.6 5.8 3.6z" fill="#34A853"/>
                      <path d="M16.6 21.3c-.1-.4-.2-.8-.2-1.3s.1-.9.2-1.3v-1.7h-2.2c-.4.8-.6 1.7-.6 2.7s.2 1.9.6 2.7l2.2-1.1z" fill="#FBBC04"/>
                      <path d="M20.2 16.1c.9 0 1.8.3 2.5 1l1.9-1.9c-1.2-1.1-2.8-1.8-4.4-1.8-2.6 0-4.7 1.5-5.8 3.6l2.2 1.7c.5-1.6 2-2.6 3.6-2.6z" fill="#EA4335"/>
                    </svg>
                    <span>Google Pay</span>
                  </a>
                </div>

                <div className="bm-qr-section">
                  <button className="bm-qr-toggle" type="button" onClick={() => setShowQR(!showQR)}>
                    {showQR ? '▲ Hide QR Code' : '▼ Show QR Code to scan'}
                  </button>
                  {showQR && (
                    <div className="bm-qr-box">
                      <p className="bm-qr-label">Scan & Pay ₹100</p>
                      <img src={qrUrl} alt="UPI QR Code" className="bm-qr-img" />
                      <p className="bm-qr-upi">{upiId}</p>
                    </div>
                  )}
                </div>

                <button
                  className="bm-btn-paid"
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  type="button"
                >
                  {isBooking ? '⏳ Submitting...' : '✅ Payment Done — Confirm Booking'}
                </button>

                <button className="bm-btn-back" onClick={() => setStep(1)} disabled={isBooking}>
                  ← Back to Details
                </button>
              </div>
            )}

            {/* ── STEP 3: Waiting / Confirmed ── */}
            {step === 3 && (
              <div className="bm-body bm-waiting-body">
                {bookingConfirmed ? (
                  <div className="bm-confirmed">
                    <div className="bm-confirmed-icon">✅</div>
                    <h3 className="bm-confirmed-title">Booking Confirmed!</h3>
                    <p className="bm-confirmed-msg">
                      Please arrive <strong>10 minutes before</strong> your time slot.<br />
                      Show your phone number <strong>{phone}</strong> at the desk.
                    </p>
                    <button className="bm-btn-primary" onClick={closeModal}>Done</button>
                  </div>
                ) : bookingFailed ? (
                  <div className="bm-confirmed">
                    <div className="bm-confirmed-icon" style={{ filter: 'grayscale(1) sepia(1) hue-rotate(-50deg)' }}>❌</div>
                    <h3 className="bm-confirmed-title" style={{ color: '#ef4444' }}>Payment Not Verified</h3>
                    <p className="bm-confirmed-msg">
                      The admin could not verify your payment.<br />
                      <strong>Please contact +91 7020374328</strong> for assistance.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', width: '100%' }}>
                      <a 
                        href="tel:+917020374328" 
                        className="bm-btn-primary" 
                        style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#3b82f6' }}
                      >
                        📞 Call Admin
                      </a>
                      <button className="bm-btn-back" onClick={closeModal} style={{ flex: 1, margin: 0 }}>
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bm-pending">
                    <div className="bm-pending-spinner" />
                    <h3 className="bm-pending-title">⏳ Awaiting Admin Confirmation</h3>
                    <p className="bm-pending-msg">
                      Your payment of <strong>₹100</strong> has been received.<br />
                      The admin is reviewing your booking. Please wait a moment…
                    </p>
                    <div className="bm-pending-details" style={{ marginBottom: '1.5rem' }}>
                      <span>Name: <strong>{name}</strong></span>
                      <span>Phone: <strong>{phone}</strong></span>
                    </div>
                    {callTimer > 0 ? (
                      <button className="bm-btn-primary" disabled style={{ background: '#94a3b8', cursor: 'not-allowed', opacity: 0.8 }}>
                        Call Admin in {callTimer}s
                      </button>
                    ) : (
                      <a 
                        href="tel:+917020374328" 
                        className="bm-btn-primary" 
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#3b82f6' }}
                      >
                        📞 Call Admin Now
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
