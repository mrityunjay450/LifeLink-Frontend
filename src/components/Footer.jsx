import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Column 1: Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <img src="/image/logo.png" alt="LifeLink Logo" />
            <h2>LifeLink</h2>
          </div>
          <p className="footer-desc">
            Empowering Medical Connectivity. Bridging the gap between blood donors, hospitals, and patients in real-time to save lives.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            {/* 🚀 FIXED: Sahi routes add kiye hain */}
            <li><Link to="/hospitals">Hospitals</Link></li>
            <li><Link to="/destinations">Donation Camps</Link></li>
            <li><Link to="/login">Register / Login</Link></li>
          </ul>
        </div>

        {/* Column 3: Important Info */}
        <div className="footer-col">
          <h3>Information</h3>
          <ul>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/">Privacy Policy</Link></li>
            <li><Link to="/">FAQs</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div className="footer-col contact-col">
          <h3>Get in Touch</h3>
          <p><a href="tel:+918271599028" style={{color: 'inherit', textDecoration: 'none'}}>📞 +91 8271599028</a></p>
          <p><a href="mailto:support@lifelink.com" style={{color: 'inherit', textDecoration: 'none'}}>✉️ livelinksaver@gmail.com</a></p>
          <p>📍 LifeLink Tech Park, Sector 13<br/>Moradabad, UP 244102, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} LifeLink. All rights reserved.</p>
        <div className="social-links">
          <span>🌐</span>
          <span>📱</span>
          <span>📧</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;