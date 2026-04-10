import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HospitalDashboard.css';
import './DonorDashboard.css'; 

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Hospital Admin';
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (userRole !== 'hospital') navigate('/');
  }, [navigate, userRole]);

  // States
  const [inventory, setInventory] = useState(null);
  const [activeMatches, setActiveMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  
  // 🚀 NAYA: Hospital ke apne camps store karne ka state
  const [myCamps, setMyCamps] = useState([]);

  // Fetch Inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const encodedName = encodeURIComponent(userName);
        const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/inventory/${encodedName}`);
        const data = await response.json();
        if (response.ok) setInventory(data);
      } catch (error) {}
    };
    fetchInventory();
  }, [userName]);

  // Fetch Active Matches
  const fetchActiveMatches = async () => {
    try {
      const encodedName = encodeURIComponent(userName); 
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/requests/hospital-matches/${encodedName}`);
      const data = await response.json();
      if (response.ok) setActiveMatches(data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchActiveMatches();
  }, [userName]);

  // 🚀 NAYA: Fetch Hospital's Own Camps
  const fetchMyCamps = async () => {
    try {
      const encodedName = encodeURIComponent(userName);
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/camps/hospital/${encodedName}`);
      const data = await response.json();
      if (response.ok) setMyCamps(data);
    } catch (error) {
      console.error("Error fetching camps", error);
    }
  };

  // Jab page load ho tab camps fetch karo
  useEffect(() => {
    fetchMyCamps();
  }, [userName]);

  const updateStock = async (bloodGroup, change) => {
    try {
      const response = await fetch('https://lifelink-api-tlx8.onrender.com/api/inventory/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalName: userName, bloodGroup, change })
      });
      const updatedStock = await response.json();
      if (response.ok) setInventory(updatedStock);
    } catch (error) {}
  };

  const handleComplete = async (requestId, bloodGroup) => {
    const confirmDone = window.confirm(`Has the donor successfully donated? This will close the request and add 1 Unit of ${bloodGroup} to your inventory.`);
    if (!confirmDone) return;
    try {
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/requests/complete/${requestId}`, { method: 'PUT' });
      if (response.ok) {
        alert(`✅ Donation successfully recorded! 1 Unit of ${bloodGroup} added to stock.`);
        setActiveMatches(activeMatches.filter(match => match._id !== requestId));
        updateStock(bloodGroup, 1);
      }
    } catch (error) { alert("Error completing donation."); }
  };

  const [formData, setFormData] = useState({ patientName: '', bloodGroup: '', contactNumber: '', urgency: 'high', location: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestPayload = { ...formData, hospitalName: userName };
      const response = await fetch('https://lifelink-api-tlx8.onrender.com/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      if (response.ok) {
        alert("🚨 Urgent Blood Request Generated Successfully!");
        setFormData({ patientName: '', bloodGroup: '', contactNumber: '', urgency: 'high', location: '' });
      }
    } catch (error) { alert("Server error!"); }
  };

  // Organize Camp Logic
  const [campData, setCampData] = useState({ campName: '', date: '', time: '', location: '', description: '' });
  const handleCampChange = (e) => setCampData({ ...campData, [e.target.name]: e.target.value });

  const handleCampSubmit = async (e) => {
    e.preventDefault();
    try {
      const campPayload = { ...campData, hospitalName: userName, hospitalId: '60d5ecb8b392d700153ee000' }; 
      const response = await fetch('https://lifelink-api-tlx8.onrender.com/api/camps/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campPayload)
      });
      
      if (response.ok) {
        alert("📢 Camp successfully published!");
        setCampData({ campName: '', date: '', time: '', location: '', description: '' });
        fetchMyCamps(); // 🚀 Form submit hote hi list refresh karo
      }
    } catch (error) { alert("Server error!"); }
  };

  // 🚀 NAYA: Camp ko complete mark karne ka function
  const handleCompleteCamp = async (campId) => {
    const confirm = window.confirm("Are you sure you want to mark this camp as Completed? It will be removed from the public page.");
    if (!confirm) return;

    try {
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/camps/complete/${campId}`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert("✅ Camp marked as Completed!");
        fetchMyCamps(); // List dubara refresh karo
      }
    } catch (error) {
      alert("Error updating camp status.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmName = window.prompt(`DANGER ZONE: Type "${userName}" to unregister your hospital.`);
    if (confirmName === userName) {
      try {
        const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/auth/delete-account/${encodeURIComponent(userName)}`, { method: 'DELETE' });
        if (response.ok) {
          localStorage.clear();
          window.location.href = '/'; 
        }
      } catch (error) { alert("Server Error!"); }
    } else if (confirmName !== null) {
      alert("❌ Name did not match.");
    }
  };

  return (
    <div className="hospital-wrapper">
      
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>🏥 Blood Inventory</li>
          <li className={activeTab === 'create-request' ? 'active' : ''} onClick={() => setActiveTab('create-request')}>🚨 Create Request</li>
          <li className={activeTab === 'organize-camp' ? 'active' : ''} onClick={() => setActiveTab('organize-camp')}>📅 Camps Manager</li>
          <li className={activeTab === 'verify' ? 'active' : ''} onClick={() => setActiveTab('verify')}>📋 Verify Donors</li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>⚙️ Settings</li>
          <li onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="hospital-main">
        <div className="dashboard-header">
          <div>
            <h2>{userName} Control Room 🏥</h2>
            <p>Manage your blood bank inventory and verify incoming donors.</p>
          </div>
        </div>

        {/* TAB 1: LIVE INVENTORY SECTION */}
        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <h3>🩸 Live Blood Stock</h3>
            {!inventory ? <p>Loading...</p> : (
              <div className="inventory-grid">
                {Object.keys(inventory).map((group) => {
                  const units = inventory[group];
                  const isLowStock = units < 5;
                  return (
                    <div className={`blood-card ${isLowStock ? 'low-stock' : ''}`} key={group}>
                      <p className="blood-type">{group}</p>
                      <p className="blood-units">{units} Units</p>
                      {isLowStock && <p style={{ color: '#d32f2f', fontSize: '0.85rem', fontWeight: 'bold', margin: '0' }}>⚠️ Low Stock</p>}
                      <div className="stock-controls">
                        <button className="stock-btn" onClick={() => updateStock(group, -1)}>-</button>
                        <button className="stock-btn" onClick={() => updateStock(group, 1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREATE REQUEST FORM */}
        {activeTab === 'create-request' && (
          <div className="request-form-container" style={{ marginTop: '20px' }}>
             <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px' }}>🚨 Generate Urgent Blood Request</h3>
            <form onSubmit={handleSubmit} className="req-form-grid">
              <div className="req-input-group"><label>Patient Name *</label><input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required /></div>
              <div className="req-input-group">
                <label>Blood Group Needed *</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                  <option value="">Select Group</option><option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option>
                  <option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
              <div className="req-input-group"><label>Contact Number *</label><input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required /></div>
              <div className="req-input-group">
                <label>Urgency Level *</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange} required>
                  <option value="critical">🔴 Critical</option><option value="high">🟡 High</option><option value="normal">🟢 Normal</option>
                </select>
              </div>
              <div className="req-input-group full-width"><label>Location / City *</label><input type="text" name="location" value={formData.location} onChange={handleChange} required /></div>
              <button type="submit" className="submit-req-btn full-width">Broadcast Request</button>
            </form>
          </div>
        )}

        {/* 🚀 TAB 3: CAMPS MANAGER */}
        {activeTab === 'organize-camp' && (
          <>
            <div className="request-form-container" style={{ marginTop: '20px' }}>
              <h3 style={{ borderLeft: '4px solid #4CAF50', paddingLeft: '10px' }}>📢 Organize New Camp</h3>
              <form onSubmit={handleCampSubmit} className="req-form-grid">
                <div className="req-input-group full-width"><label>Camp Name / Title *</label><input type="text" name="campName" value={campData.campName} onChange={handleCampChange} required /></div>
                <div className="req-input-group"><label>Date *</label><input type="date" name="date" value={campData.date} onChange={handleCampChange} required /></div>
                <div className="req-input-group"><label>Time *</label><input type="time" name="time" value={campData.time} onChange={handleCampChange} required /></div>
                <div className="req-input-group full-width"><label>Location (Full Address) *</label><input type="text" name="location" value={campData.location} onChange={handleCampChange} required /></div>
                <div className="req-input-group full-width"><label>Short Description</label><textarea name="description" value={campData.description} onChange={handleCampChange} rows="2"></textarea></div>
                <button type="submit" className="submit-req-btn full-width" style={{backgroundColor: '#4CAF50'}}>Push to Live Network</button>
              </form>
            </div>

            {/* 🚀 NAYA: My Hosted Camps List */}
            <div className="inventory-section" style={{ marginTop: '40px' }}>
              <h3 style={{ borderLeft: '4px solid #333', paddingLeft: '10px' }}>📋 Your Hosted Camps</h3>
              {myCamps.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic', padding: '10px' }}>You haven't organized any camps yet.</p>
              ) : (
                <div className="request-feed">
                  {myCamps.map(camp => (
                    <div className="request-card" key={camp._id} style={{ borderLeft: camp.status === 'Completed' ? '5px solid #9e9e9e' : '5px solid #4CAF50' }}>
                      <div className="req-details">
                        <h4 style={{ color: camp.status === 'Completed' ? '#666' : '#4CAF50', margin: '0 0 5px' }}>{camp.campName}</h4>
                        <p style={{ margin: '3px 0' }}>📅 {camp.date} at {camp.time}</p>
                        <p style={{ margin: '3px 0' }}>📍 {camp.location}</p>
                        <span style={{ 
                          display: 'inline-block', marginTop: '5px', padding: '3px 10px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold',
                          background: camp.status === 'Completed' ? '#e0e0e0' : '#e8f5e9', 
                          color: camp.status === 'Completed' ? '#666' : '#2e7d32' 
                        }}>
                          {camp.status}
                        </span>
                      </div>
                      
                      <div className="req-actions">
                        {camp.status !== 'Completed' && (
                          <button 
                            className="btn-accept" 
                            style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                            onClick={() => handleCompleteCamp(camp._id)}
                          >
                            ✅ Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 4: VERIFY DONORS */}
        {activeTab === 'verify' && (
          <div className="inventory-section" style={{ marginTop: '20px' }}>
            <h3 style={{ borderLeft: '4px solid #1976D2', paddingLeft: '10px' }}>📋 Incoming Donors (Verify)</h3>
            <div className="request-feed">
              {activeMatches.length === 0 ? <p>No active donors arriving right now.</p> : (
                activeMatches.map((match) => (
                  <div className="request-card" key={match._id} style={{ borderLeft: '5px solid #1976D2' }}>
                    <div className="req-details">
                      <h4 style={{ color: '#1976D2', margin: '0 0 5px' }}>Patient: {match.patientName} ({match.bloodGroup})</h4>
                      <p>🩸 Donor Expected: <strong>{match.acceptedBy}</strong></p>
                      <p>📞 Donor Contact: {match.donorContact}</p>
                    </div>
                    <div className="req-actions">
                      <button className="btn-accept" style={{ backgroundColor: '#1976D2', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleComplete(match._id, match.bloodGroup)}>✅ Blood Received</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="inventory-section" style={{ marginTop: '20px' }}>
            <h3 style={{ borderLeft: '4px solid #333', paddingLeft: '10px' }}>⚙️ Hospital Settings</h3>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <p style={{ fontSize: '1.1rem' }}><strong>Hospital Name:</strong> {userName}</p>
              <p style={{ fontSize: '1.1rem' }}><strong>Account Type:</strong> Verified Blood Bank</p>
            </div>
            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px', color: '#d32f2f' }}>⚠️ Danger Zone</h3>
            <div style={{ background: '#fff5f5', padding: '25px', borderRadius: '12px', border: '1px solid #ffcdd2' }}>
              <h4 style={{ color: '#d32f2f', margin: '0 0 10px 0', fontSize: '1.2rem' }}>Unregister Hospital</h4>
              <p style={{ color: '#555', marginBottom: '20px' }}>Once you delete your hospital account, there is no going back.</p>
              <button onClick={handleDeleteAccount} style={{ backgroundColor: 'transparent', color: '#d32f2f', border: '2px solid #d32f2f', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>🗑️ Permanently Delete Account</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalDashboard;