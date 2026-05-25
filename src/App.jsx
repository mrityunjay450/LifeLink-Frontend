import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🚀 --- SOCKET & TOAST IMPORTS SHURU --- 🚀
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// 🚀 --- SOCKET & TOAST IMPORTS KHATAM --- 🚀

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

// Donation Camps page ko import kiya
import DonationCamps from './Pages/DonationCamps'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || "");

  // 🔐 --- 30-MINUTE AUTO LOGOUT (SECURITY LOGIC) SHURU --- 🔐
  useEffect(() => {
    let inactivityTimer;
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 mins in milliseconds

    const forceLogout = () => {
      // Check karte hain ki kya user sach me logged in hai
      const hasToken = localStorage.getItem('token'); 
      if (hasToken) {
        localStorage.clear(); // Saara data delete (token, naam, date sab saaf)
        window.location.href = '/login'; // User ko wapas login page par bhej do
      }
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      // Tab close hone par bhi time yaad rakhne ke liye save karo
      localStorage.setItem('lastActiveTime', new Date().getTime().toString());
      
      // Naya 30 minute ka timer start karo
      inactivityTimer = setTimeout(forceLogout, THIRTY_MINUTES);
    };

    const checkTabReopen = () => {
      const lastActive = localStorage.getItem('lastActiveTime');
      if (lastActive) {
        const timePassed = new Date().getTime() - parseInt(lastActive);
        if (timePassed > THIRTY_MINUTES) {
          forceLogout(); // Agar 30 min se zyada ho gaye toh app khulte hi bahar
        }
      }
    };

    checkTabReopen();

    // Mouse ya keyboard hilne par timer reset karo
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
    };
  }, []);
  // 🔐 --- AUTO LOGOUT LOGIC KHATAM --- 🔐


  // 🚀 --- REAL-TIME NOTIFICATION LOGIC SHURU --- 🚀
  useEffect(() => {
    const socket = io("https://lifelink-api-tlx8.onrender.com"); 

    socket.on("connect", () => {
      console.log("🟢 Frontend Connected to Socket.io:", socket.id);
    });

    socket.on("newBloodRequest", (data) => {
      
      const userRole = localStorage.getItem('role') ? localStorage.getItem('role').toLowerCase() : ""; 
      const isDonorPage = window.location.pathname.includes('donor');

      if (userRole === 'donor' || isDonorPage) {
        toast.error(`🚨 URGENT: ${data.message}`, {
          position: "top-right",
          autoClose: 10000, 
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  // 🚀 --- REAL-TIME NOTIFICATION LOGIC KHATAM --- 🚀

  return (
    <Router>
      <ToastContainer />
      
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