import React, { useState, useEffect } from 'react'; // 🚀 useEffect add kiya
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

  // 🚀 --- REAL-TIME NOTIFICATION LOGIC SHURU --- 🚀
  useEffect(() => {
    // Aapke Render backend ki link yahan lagayi hai
    const socket = io("https://lifelink-api-tlx8.onrender.com"); 

    // Jab Frontend socket se connect ho
    socket.on("connect", () => {
      console.log("🟢 Frontend Connected to Socket.io:", socket.id);
    });

    // Jab Backend se 'newBloodRequest' ka signal aaye (Jo humne requestRoutes me banaya tha)
    socket.on("newBloodRequest", (data) => {
      // Toastify se mast sa laal rang (error theme) ka Pop-up dikhana
      toast.error(`🚨 URGENT: ${data.message}`, {
        position: "top-right",
        autoClose: 10000, // 10 second baad apne aap band hoga
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    });

    // Cleanup function
    return () => {
      socket.disconnect();
    };
  }, []);
  // 🚀 --- REAL-TIME NOTIFICATION LOGIC KHATAM --- 🚀

  return (
    <Router>
      {/* 🚀 ToastContainer yahan lagaya hai taaki kisi bhi page par pop-up aa sake */}
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