import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Timer, Search } from 'lucide-react';
import { AVAILABILITY_DATA, formatTime12Hour } from '../constants/data';
import './SearchSection.css';

const SearchSection = ({ onSearch }) => {
  const [date, setDate] = useState(AVAILABILITY_DATA.dates[0]);
  const [availableTimes, setAvailableTimes] = useState(AVAILABILITY_DATA.times);
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(AVAILABILITY_DATA.durations[0].value);

  useEffect(() => {
    let times = AVAILABILITY_DATA.times;
    if (date === 'Today') {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const nowTime = currentHour * 60 + currentMinute;
      
      times = times.filter(t => {
        const [h, m] = t.split(':').map(Number);
        return (h * 60 + m) > nowTime;
      });
    }
    setAvailableTimes(times);
    
    // Auto-select nearest slot
    if (times.length > 0) {
      if (!times.includes(time) || date === 'Today') {
        setTime(times[0]);
      }
    } else {
      setTime(''); // No slots available today
    }
  }, [date]);

  const handleSearch = () => {
    if (onSearch && time) {
      onSearch({ date, time, duration });
    }
  };

  return (
    <section id="booking" className="search-section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title font-bold text-white">Find Your Perfect Time Slot</h2>
          <div className="divider"></div>
        </div>

        <div className="glass search-card">
          <div className="search-grid">
            <div className="form-group">
              <label className="form-label text-white">Choose Date</label>
              <div className="input-wrapper">
                <Calendar className="input-icon" size={20} />
                <select 
                  className="form-select"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                >
                  {AVAILABILITY_DATA.dates.map((d, index) => (
                    <option key={index} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-white">Select Time</label>
              <div className="input-wrapper">
                <Clock className="input-icon" size={20} />
                <select 
                  className="form-select"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  {availableTimes.length > 0 ? (
                    availableTimes.map((t, index) => (
                      <option key={index} value={t}>{formatTime12Hour(t)}</option>
                    ))
                  ) : (
                    <option value="">No slots available</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-white">Duration</label>
              <div className="input-wrapper">
                <Timer className="input-icon" size={20} />
                <select 
                  className="form-select"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                >
                  {AVAILABILITY_DATA.durations.map((dur, index) => (
                    <option key={index} value={dur.value}>{dur.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="search-footer">
            <button 
              className="btn btn-secondary search-btn"
              onClick={handleSearch}
              disabled={!time}
            >
              <Search size={20} />
              Check Availability
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
