import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <a href="#" className="logo">Pool Cafe MNS</a>
                    <p className="copyright">© 2026 Pool Cafe Management System. All rights reserved.</p>
                </div>
                
                <div className="footer-links">
                    <a href="#" className="footer-link">Privacy Policy</a>
                    <a href="#" className="footer-link">Terms of Service</a>
                    <Link to="/admin" className="footer-link admin-link">Admin Login</Link>
                    <Link to="/superadmin" className="sa-access-link">Admin Access</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
