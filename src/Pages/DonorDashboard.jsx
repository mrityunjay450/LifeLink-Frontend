import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf'; 
import './DonorDashboard.css';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Hero';
  const userRole = localStorage.getItem('userRole');
  // 🚀 NAYA: User ka email chahiye backend me profile update karne ke liye
  const userEmail = localStorage.getItem('userEmail') || 'donor@email.com'; 

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState("Calculating...");
  const [isEligible, setIsEligible] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // 🚀 NAYA: Profile Photo State
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userRole !== 'donor') navigate('/');
  }, [navigate, userRole]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('https://lifelink-api-tlx8.onrender.com/api/requests/active');
        const data = await response.json();
        if (response.ok) setRequests(data);
      } catch (error) {} finally { setLoading(false); }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const checkEligibility = () => {
      const lastDonation = localStorage.getItem('lastDonationDate');
      if (!lastDonation) {
        setIsEligible(true);
        setTimeLeft("Ready to Donate");
        return;
      }
      const lastDate = new Date(lastDonation);
      const eligibleDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      const timer = setInterval(() => {
        const now = new Date();
        const difference = eligibleDate - now;
        if (difference <= 0) {
          setIsEligible(true);
          setTimeLeft("Ready to Donate");
          clearInterval(timer);
        } else {
          setIsEligible(false);
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);
      return () => clearInterval(timer);
    };
    checkEligibility();
  }, []);

  const handleAccept = async (requestId) => {
    if (!isEligible) { alert("❌ Please wait for your 90-day recovery period."); return; }
    const donorContact = window.prompt("Please enter your mobile number:");
    if (!donorContact) return; 
    try {
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/requests/accept/${requestId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ donorName: userName, donorContact: donorContact })
      });
      if (response.ok) {
        alert("🎉 Request Accepted!");
        localStorage.setItem('lastDonationDate', new Date().toISOString());
        window.location.reload(); 
      }
    } catch (error) { alert("Server error!"); }
  };

  const generateCertificate = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const centerX = 297 / 2; 
    doc.setDrawColor(178, 34, 34); doc.setLineWidth(3); doc.rect(10, 10, 277, 190);
    doc.setDrawColor(218, 165, 32); doc.setLineWidth(1); doc.rect(15, 15, 267, 180);
    doc.setFont("times", "bold"); doc.setFontSize(36); doc.setTextColor(178, 34, 34); doc.text("LIFELINK", centerX, 45, null, null, "center");
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(50, 50, 50); doc.text("CERTIFICATE OF APPRECIATION", centerX, 65, null, null, "center");
    doc.setFont("times", "italic"); doc.setFontSize(16); doc.setTextColor(80, 80, 80); doc.text("This certificate is proudly presented to", centerX, 90, null, null, "center");
    doc.setFont("times", "bolditalic"); doc.setFontSize(36); doc.setTextColor(0, 0, 0); doc.text(userName, centerX, 115, null, null, "center");
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(80, 120, 217, 120);
    doc.setFont("helvetica", "normal"); doc.setFontSize(14); doc.setTextColor(60, 60, 60);
    doc.text("In profound recognition of your selfless act of donating blood.", centerX, 135, null, null, "center");
    doc.text("Your noble contribution has given the gift of life to someone in urgent need.", centerX, 145, null, null, "center");
    doc.setFontSize(14); doc.setFont("times", "normal"); doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 60, 180, null, null, "center"); doc.line(40, 182, 80, 182); 
    doc.text("Authorized Signature", 237, 180, null, null, "center"); doc.line(207, 175, 267, 175); 
    doc.save(`LifeLink_Donor_${userName}.pdf`);
  };

  // 🚀 NAYA: Edit Photo Handlers
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setProfilePic(base64); // UI update karega turant
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const saveProfile = async () => {
    try {
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/auth/update-profile/${userEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: profilePic })
      });
      if (response.ok) {
        alert("✅ Profile picture updated successfully!");
        localStorage.setItem('profilePic', profilePic); // Local me bhi save karo
        setIsEditing(false);
      } else {
        alert("❌ Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</li>
          <li className={activeTab === 'donations' ? 'active' : ''} onClick={() => setActiveTab('donations')}>🩸 My Donations</li>
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>⚙️ Profile Settings</li>
          <li onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h2>Welcome back, {userName}! 🩸</h2>
            <p>Your dashboard to track donations and save lives.</p>
          </div>
          <div className="status-toggle">
            {isEligible ? '🟢 Available for Emergency' : '🔴 Resting Period (Not Available)'}
          </div>
        </div>

        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="stat-icon">❤️</div>
                  <div className="stat-info"><h3>Total Donations</h3><p>01</p></div>
                </div>
                <button onClick={generateCertificate} style={{ marginTop: '15px', padding: '8px 12px', backgroundColor: '#fff', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                  📥 Download Certificate
                </button>
              </div>
              <div className="stat-card"><div className="stat-icon">🩸</div><div className="stat-info"><h3>Your Blood Group</h3><p>Ready</p></div></div>
              <div className="stat-card" style={{ borderBottomColor: isEligible ? '#2e7d32' : '#f57c00' }}>
                <div className="stat-icon">⏳</div>
                <div className="stat-info"><h3>Next Eligibility</h3><p style={{ fontSize: '1.2rem', color: isEligible ? '#2e7d32' : '#f57c00', fontWeight: 'bold' }}>{timeLeft}</p></div>
              </div>
            </div>

            <div className="requests-section">
              <h3>🚨 Urgent Matches Near You</h3>
              <div className="request-feed">
                {loading ? <p>Loading live requests...</p> : requests.length === 0 ? <p>No urgent blood requests at the moment.</p> : (
                  requests.map((req) => (
                    <div className="request-card" key={req._id}>
                      <div className="req-details">
                        <h4>Need {req.bloodGroup} Blood <span className={`tag ${req.urgency}`}>{req.urgency === 'critical' ? '🔴 Critical' : '🟡 High Priority'}</span></h4>
                        <p>👤 Patient: {req.patientName}</p><p>🏥 Location: {req.hospitalName} ({req.location})</p><p>📞 Contact: {req.contactNumber}</p>
                      </div>
                      <div className="req-actions">
                        <button className="btn-map" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.hospitalName + ' ' + req.location)}`, '_blank')}>📍 View Map</button>
                        <button className="btn-accept" onClick={() => handleAccept(req._id)} disabled={!isEligible} style={{ opacity: isEligible ? 1 : 0.5, cursor: isEligible ? 'pointer' : 'not-allowed' }}>✅ Accept Request</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: MY DONATIONS HISTORY */}
        {activeTab === 'donations' && (
          <div className="requests-section">
            <h3>🩸 My Donation History</h3>
            <div className="request-card" style={{ borderLeft: '5px solid #2e7d32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="req-details">
                <h4 style={{ color: '#2e7d32', margin: '0 0 5px 0' }}>Successful Donation</h4>
                <p style={{ margin: '3px 0' }}>📍 Donated via LifeLink Network</p>
                <p style={{ margin: '3px 0' }}>📅 Date: {localStorage.getItem('lastDonationDate') ? new Date(localStorage.getItem('lastDonationDate')).toLocaleDateString() : 'No recent donations recorded'}</p>
              </div>
              <button className="btn-accept" onClick={generateCertificate} style={{ backgroundColor: '#2e7d32' }}>📥 Get Certificate</button>
            </div>
          </div>
        )}

        {/* 🚀 TAB 3: PROFILE SETTINGS (EDIT MODE ADDED) */}
        {activeTab === 'profile' && (
          <div className="requests-section">
            <h3>⚙️ Profile Settings</h3>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderTop: '4px solid #333', display: 'flex', gap: '30px', alignItems: 'center' }}>
              
              {/* Profile Photo Area */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #d32f2f', marginBottom: '15px' }}>
                  <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {isEditing ? (
                  <>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ fontSize: '0.8rem', width: '150px' }} />
                    <button 
                      onClick={saveProfile} 
                      style={{ display: 'block', marginTop: '10px', width: '100%', padding: '8px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      💾 Save Photo
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={{ padding: '8px 15px', background: '#f1f1f1', color: '#333', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    ✏️ Edit Photo
                  </button>
                )}
              </div>

              {/* Profile Details Area */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}><strong>Name:</strong> {userName}</p>
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}><strong>Email:</strong> {userEmail}</p>
                <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}><strong>Role:</strong> Lifesaver (Verified Donor) 🌟</p>
                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
                <p style={{ color: '#666', fontStyle: 'italic' }}>* To update email or contact number, please contact support.</p>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default DonorDashboard;