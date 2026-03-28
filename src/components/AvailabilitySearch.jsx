import React from 'react';
import { Calendar, Clock, Timer, Search } from 'lucide-react';
import { AVAILABILITY_DATA } from '../constants/data';

const AvailabilitySearch = () => {
  return (
    <section id="booking" className="search-section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title font-bold text-white">Find Your Perfect Time Slot</h2>
          <div className="section-divider"></div>
        </div>

        <div className="glass-card search-form shadow-2xl">
          <div className="grid-3 mb-8" style={{ marginBottom: '2rem' }}>
            {/* Choose Date */}
            <div className="form-group">
              <label className="form-label">Choose Date</label>
              <div className="input-wrapper">
                <Calendar className="input-icon" />
                <select className="form-select">
                  {AVAILABILITY_DATA.dates.map((date, index) => (
                    <option key={index} value={date} style={{ backgroundColor: '#0f172a' }}>{date}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Select Time */}
            <div className="form-group">
              <label className="form-label">Select Time</label>
              <div className="input-wrapper">
                <Clock className="input-icon" />
                <select className="form-select">
                  {AVAILABILITY_DATA.times.map((time, index) => (
                    <option key={index} value={time} style={{ backgroundColor: '#0f172a' }}>{time}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="form-group">
              <label className="form-label">Duration</label>
              <div className="input-wrapper">
                <Timer className="input-icon" />
                <select className="form-select">
                  {AVAILABILITY_DATA.durations.map((duration, index) => (
                    <option key={index} value={duration} style={{ backgroundColor: '#0f172a' }}>{duration}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-secondary" style={{ backgroundColor: 'var(--secondary)', display: 'flex', gap: '0.5rem', padding: '1rem 3rem' }}>
              <Search className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvailabilitySearch;
