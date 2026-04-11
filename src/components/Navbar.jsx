import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, userName, setIsLoggedIn, setUserName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // 🚀 NAYA: Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  // Mobile menu toggle functions
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  // 🚀 MAGIC: Dynamic Dashboard Link Generator
  const getDashboardLink = () => {
    if (userRole === 'donor') return '/donor-dashboard';
    if (userRole === 'hospital') return '/hospital-dashboard';
    if (userRole === 'patient') return '/patient-dashboard';
    return '/login';
  };

  // Logout Function
  const handleLogout = () => {
    setIsLoggedIn(false);
    if (setUserName) setUserName("");
    localStorage.clear();
    
    setDropdownOpen(false); 
    closeMenu(); // 🚀 Mobile menu bhi band kar do
    window.location.href = '/login'; 
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link" onClick={closeMenu}>
          <img src="/image/logo.png" alt="LifeLink Logo" className="logo-img" />
          <div className="logo-text">
            <h1>LifeLink</h1>
            <p>Empowering Medical Connectivity</p>
          </div>
        </Link>
      </div>

      {/* 🚀 NAYA: Hamburger Icon for Mobile */}
      <div className="menu-icon" onClick={toggleMenu}>
        {isMobileMenuOpen ? '✖' : '☰'}
      </div>

      {/* 🚀 Class 'active' add hogi jab menu open hoga */}
      <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link to="/hospitals" onClick={closeMenu}>Hospitals</Link></li>
        <li><Link to="/destinations" onClick={closeMenu}>Donation Camps</Link></li>
        <li><Link to="/donors" onClick={closeMenu}>Our Donors</Link></li>
        <li><Link to="/contact" onClick={closeMenu}>Contact Us</Link></li>

        {isLoggedIn ? (
          <li 
            className="user-dropdown-container"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
            onClick={() => setDropdownOpen(!dropdownOpen)} // Mobile par click se khulega
          >
            <div className="user-profile-btn">
              👤 Hi, {userName} <span className="arrow">▼</span>
            </div>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to={getDashboardLink()} onClick={closeMenu}>📊 My Dashboard</Link>
                <Link to="/profile" onClick={closeMenu}>⚙️ Profile Settings</Link>
                <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
              </div>
            )}
          </li>
        ) : (
          <li><Link to="/login" className="login-btn" onClick={closeMenu}>Login / Register</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;