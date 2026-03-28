import React from 'react';
import tableImg from '../assets/table-img.png';
import { Users, Maximize2 } from 'lucide-react';
import './AvailabilityCards.css';

const AvailabilityCards = ({ availability, onBook }) => {
  const types = [
    {
      key: 'big',
      label: 'Big Table',
      description: 'Perfect for groups · More space',
      icon: <Maximize2 size={22} />,
      price: 150,
    },
    {
      key: 'small',
      label: 'Small Table',
      description: 'Standard table · Cozy & compact',
      icon: <Users size={22} />,
      price: 100,
    },
  ];

  return (
    <div className="avail-cards-wrapper">
      <h3 className="avail-cards-heading">Select Your Table Type</h3>
      <div className="avail-cards-grid">
        {types.map(type => {
          const info = availability[type.key] || { total: 0, available: 0, price: type.price };
          const isAvailable = info.available > 0;

          return (
            <div
              key={type.key}
              className={`avail-card glass ${!isAvailable ? 'avail-card--full' : ''}`}
            >
              <div className="avail-card-img-wrap">
                <img src={tableImg} alt={type.label} className="avail-card-img" />
                <div className="avail-card-img-overlay" />
                <div className="avail-card-price-tag">₹{info.price || type.price}/hr</div>
                {!isAvailable && (
                  <div className="avail-card-full-badge">🔴 Fully Booked</div>
                )}
              </div>

              <div className="avail-card-body">
                <div className="avail-card-top">
                  <div>
                    <h4 className="avail-card-title">{type.label}</h4>
                    <p className="avail-card-desc">{type.description}</p>
                  </div>
                  <div className={`avail-card-count ${isAvailable ? 'avail-card-count--open' : 'avail-card-count--full'}`}>
                    <span className="avail-count-num">{info.available}</span>
                    <span className="avail-count-label">of {info.total} free</span>
                  </div>
                </div>

                <div className="avail-card-footer">
                  <div className="avail-card-meta">
                    {isAvailable
                      ? `${info.available} table${info.available > 1 ? 's' : ''} available for your slot`
                      : 'All tables are booked for this time'}
                  </div>
                  <button
                    className={`btn avail-card-btn ${isAvailable ? 'btn-primary' : ''}`}
                    disabled={!isAvailable}
                    onClick={() => isAvailable && onBook(type.key)}
                  >
                    {isAvailable ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityCards;
