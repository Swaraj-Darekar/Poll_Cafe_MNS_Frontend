import React from 'react';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <a href="/" className="logo-link">
            <img src={logo} alt="M416 Logo" className="navbar-logo-img" />
          </a>
        </div>
        
        <ul className="nav-links">
          <li><a href="#" className="nav-link">Home</a></li>
          <li><a href="#tables" className="nav-link">Tables</a></li>
          <li><a href="#booking" className="nav-link">Booking</a></li>
          <li><a href="#" className="nav-link">Contact</a></li>
        </ul>

        <div className="admin-contact">
          <div className="contact-icon">📞</div>
          <div className="contact-info">
            <span className="contact-label">Call us</span>
            <a href="tel:+917020374328" className="contact-number">+91 70203 74328</a>
          </div>
        </div>

        <div className="mobile-menu-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
