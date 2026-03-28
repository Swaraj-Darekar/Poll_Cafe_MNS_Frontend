import React from 'react';

const HeroSection = () => {
  return (
    <section className="hero">
      {/* Background Image with Overlay */}
      <div 
        className="hero-bg"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        <div className="hero-overlay"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title font-bold">
          Book Your Pool Table <span className="text-primary">Instantly</span>
        </h1>
        <div className="hero-subtitle">
          <span>Real-time Availability</span>
          <span className="hidden md-inline text-primary">•</span>
          <span>Instant Booking</span>
          <span className="hidden md-inline text-primary">•</span>
          <span>No Waiting</span>
        </div>
        
        <div className="hero-btns">
          <a href="#booking" className="btn btn-primary">Book Now</a>
          <a href="#tables" className="btn btn-outline">View Tables</a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.5 }}>
        <svg className="bounce" style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
