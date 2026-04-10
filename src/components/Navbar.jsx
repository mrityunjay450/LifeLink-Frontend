import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, userName, setIsLoggedIn, setUserName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // 🚀 NAYA: Role get karna taaki sahi dashboard par bhej sake
  const userRole = localStorage.getItem('userRole');

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
    // 🚀 FIXED: Full refresh ke sath logout (taaki state proper clear ho)
    window.location.href = '/login'; 
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link">
          <img src="/image/logo.png" alt="LifeLink Logo" className="logo-img" />
          <div className="logo-text">
            <h1>LifeLink</h1>
            <p>Empowering Medical Connectivity</p>
          </div>
        </Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        
        {/* 🚀 FIXED: Ab ye buttons alag-alag pages par point kar rahe hain */}
        <li><Link to="/hospitals">Hospitals</Link></li>
        <li><Link to="/destinations">Donation Camps</Link></li>
        <li><Link to="/donors">Our Donors</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>

        {isLoggedIn ? (
          <li 
            className="user-dropdown-container"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <div className="user-profile-btn">
              👤 Hi, {userName} <span className="arrow">▼</span>
            </div>
            
            {dropdownOpen && (
              <div className="dropdown-menu">
                {/* 🚀 FIXED: Ab har user apne-apne dashboard par jayega */}
                <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)}>📊 My Dashboard</Link>
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>⚙️ Profile Settings</Link>
                <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
              </div>
            )}
          </li>
        ) : (
          <li><Link to="/login" className="login-btn">Login / Register</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;