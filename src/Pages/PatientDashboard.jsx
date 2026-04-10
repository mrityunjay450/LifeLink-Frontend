import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientDashboard.css';
import './HospitalDashboard.css'; 

const PatientDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Patient';
  const userRole = localStorage.getItem('userRole');

  const [myRequests, setMyRequests] = useState([]);
  
  // 🚀 NAYA: Sidebar Tabs ko control karne ke liye State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Security Check
  useEffect(() => {
    if (userRole !== 'patient') navigate('/');
  }, [navigate, userRole]);

  // FETCH PATIENT'S OWN REQUESTS
  const fetchMyRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/my-requests/${userName}`);
      const data = await response.json();
      if (response.ok) setMyRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [userName]);

  // Form State
  const [formData, setFormData] = useState({
    bloodGroup: '', hospitalName: '', contactNumber: '', urgency: 'high', location: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // CREATE NEW EMERGENCY REQUEST
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestPayload = { ...formData, patientName: userName };

      const response = await fetch('http://localhost:5000/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      if (response.ok) {
        alert("🚨 Emergency Request Broadcasted to Donors!");
        setFormData({ bloodGroup: '', hospitalName: '', contactNumber: '', urgency: 'high', location: '' });
        fetchMyRequests(); // Form submit hote hi list update karo
        
        // 🚀 MAGIC: Submit hone ke baad turant Tracker wale tab par bhej do
        setActiveTab('dashboard'); 
      }
    } catch (error) {
      alert("Server error!");
    }
  };

  return (
    <div className="patient-wrapper">
      
      {/* 🚀 NAYA: CLICKABLE SIDEBAR WITH LOGOUT FIX */}
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            📊 My Dashboard
          </li>
          <li className={activeTab === 'new-request' ? 'active' : ''} onClick={() => setActiveTab('new-request')}>
            🚨 New Request
          </li>
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            ⚙️ Profile Settings
          </li>
          <li onClick={() => {
            localStorage.clear();
            window.location.href = '/'; // 🚀 FIXED: Navbar update ke liye
          }}>
            🚪 Logout
          </li>
        </ul>
      </aside>

      {/* 🟢 MAIN CONTENT */}
      <main className="patient-main">
        <div className="dashboard-header">
          <div>
            <h2>Hi, {userName} 👤</h2>
            <p>Track your blood requests and connect with donors.</p>
          </div>
        </div>

        {/* 🚀 TAB 1: LIVE TRACKER SECTION */}
        {activeTab === 'dashboard' && (
          <div className="tracker-section">
            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px' }}>📡 Live Request Tracker</h3>
            
            <div className="tracker-grid">
              {myRequests.length === 0 ? (
                <p>You have no active blood requests.</p>
              ) : (
                myRequests.map((req) => (
                  <div className={`tracker-card ${req.status}`} key={req._id}>
                    <div className="tracker-info">
                      <h4>Need {req.bloodGroup} Blood at {req.hospitalName}</h4>
                      <p>📅 Requested on: {new Date(req.createdAt).toLocaleDateString()}</p>
                      <p>📍 Location: {req.location} | 📞 Your Contact: {req.contactNumber}</p>
                    </div>
                    
                    <div className={`status-badge ${req.status}`}>
                      {req.status === 'pending' ? '⏳ Searching for Donors...' : '✅ Donor Found!'}
                    </div>
                    
                    {/* WhatsApp aur Call Buttons */}
                    {req.status === 'accepted' && (
                      <div className="contact-actions" style={{ width: '100%' }}>
                        <p className="donor-info">🩸 Accepted by Hero: <strong>{req.acceptedBy}</strong></p>
                        <div className="action-buttons">
                          
                          <a 
                            href={`https://wa.me/91${req.donorContact}?text=Hi ${req.acceptedBy}, thank you for accepting my blood request on LifeLink! Where can we meet?`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn-whatsapp"
                          >
                            💬 WhatsApp
                          </a>

                          <a href={`tel:${req.donorContact}`} className="btn-call">
                            📞 Call Now
                          </a>

                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 🚀 TAB 2: CREATE REQUEST FORM */}
        {activeTab === 'new-request' && (
          <div className="request-form-container">
            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px' }}>🚨 Need Blood? Create Request</h3>
            
            <form onSubmit={handleSubmit} className="req-form-grid">
              <div className="req-input-group">
                <label>Blood Group Needed *</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                  <option value="">Select Group</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>

              <div className="req-input-group">
                <label>Admitted Hospital Name *</label>
                <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} placeholder="e.g., AIIMS Patna" required />
              </div>

              <div className="req-input-group">
                <label>Your Contact Number *</label>
                <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
              </div>

              <div className="req-input-group">
                <label>Urgency Level *</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange} required>
                  <option value="critical">🔴 Critical (Immediate)</option>
                  <option value="high">🟡 High (24 hours)</option>
                  <option value="normal">🟢 Normal</option>
                </select>
              </div>

              <div className="req-input-group full-width">
                <label>City / Complete Address *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required />
              </div>

              <button type="submit" className="submit-req-btn full-width">
                Submit Request
              </button>
            </form>
          </div>
        )}

        {/* 🚀 TAB 3: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="tracker-section">
            <h3 style={{ borderLeft: '4px solid #333', paddingLeft: '10px' }}>⚙️ Profile Settings</h3>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '1.1rem' }}><strong>Name:</strong> {userName}</p>
              <p style={{ fontSize: '1.1rem' }}><strong>Role:</strong> Patient / Receiver</p>
              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
              <p style={{ color: '#666', fontStyle: 'italic' }}>* Full profile editing will be unlocked soon.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default PatientDashboard;