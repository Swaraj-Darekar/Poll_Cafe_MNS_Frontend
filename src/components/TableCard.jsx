import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import tableImg from '../assets/table-img.png';
import './TableCard.css';

const TableCard = ({ table, onBookNow }) => {
  const isAvailable = table.status === 'available';
  const isOccupied = table.status === 'unavailable' || table.status === 'occupied';

  // reservedBy = wait time string e.g. "Available in ~45 min"
  const waitText = table.reservedBy || 'Available in ~1 hr';

  return (
    <div className={`glass table-card ${isOccupied ? 'occupied-card' : ''}`}>
      <div className="table-img-container">
        <img 
          src={tableImg} 
          alt={table.name}
          className="table-img"
        />
        <div className="table-img-overlay"></div>
        <div className="price-tag">₹{table.price}/hr</div>
        {isOccupied && <div className="occupied-overlay">🎱 In Play</div>}
      </div>

      <div className="table-details">
        <div className="table-header">
          <div className="table-title-group">
            <h3 className="table-name font-bold">{table.name}</h3>
            <p className="table-type">{table.description}</p>
          </div>
          
          <div className={`table-status ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            <span>{isAvailable ? 'Available Now' : 'Occupied'}</span>
          </div>
        </div>

        <div className="table-action-footer">
          <div className="table-meta">
            {isAvailable ? 'Instant Booking' : waitText}
          </div>
          
          <button 
            disabled={!isAvailable}
            onClick={() => onBookNow(table)}
            className={`btn table-btn ${isAvailable ? 'btn-primary' : 'btn-occupied'}`}
          >
            {isAvailable ? 'Book Now' : 'Occupied'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
