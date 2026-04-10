import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx'; 

import Home from './Pages/Home.jsx';
import Login from './Pages/Login.jsx';
import DonorDashboard from './Pages/DonorDashboard.jsx';
import HospitalDashboard from './Pages/HospitalDashboard.jsx';
import PatientDashboard from './Pages/PatientDashboard.jsx';
import Hospitals from './Pages/Hospitals';
import ContactUs from './Pages/ContactUs';
import DonorsList from './Pages/DonorsList';

// 🚀 NAYA: Donation Camps page ko import kiya
import DonationCamps from './Pages/DonationCamps'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || "");

  return (
    <Router>
      <Navbar 
        isLoggedIn={isLoggedIn} 
        userName={userName} 
        setIsLoggedIn={setIsLoggedIn} 
        setUserName={setUserName} 
      /> 
      
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/destinations" element={<DonationCamps />} />
        <Route path="/donors" element={<DonorsList />} />
        <Route path="/contact" element={<ContactUs />} />
        
        <Route 
          path="/login" 
          element={<Login setIsLoggedIn={setIsLoggedIn} setUserName={setUserName} />} 
        />
        
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
      </Routes>
      
      <Footer />
    </Router>
  );
}

export default App;