import React from 'react';

import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-bg-overlay"></div>
      
      <div className="container hero-content">
        <h1 className="hero-title">
          Book Your Pool Table Instantly
        </h1>
        
        <p className="hero-subtitle">
          Real-time Availability <span className="dot">•</span> Instant Booking <span className="dot">•</span> No Waiting
        </p>
        
        <div className="hero-actions">
          <a href="#booking" className="btn btn-primary hero-btn">Book Now</a>
          <a href="#tables" className="btn btn-outline hero-btn">View Tables</a>
        </div>
      </div>

      <div className="scroll-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.6 }}>
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
