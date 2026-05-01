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
  const [myCamps, setMyCamps] = useState([]);

  // 🟢 1. FETCH INVENTORY
  const fetchInventory = async () => {
    try {
      const encodedName = encodeURIComponent(userName);
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/inventory/${encodedName}`);
      const data = await response.json();
      if (response.ok) setInventory(data);
    } catch (error) {
      console.error("Inventory Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [userName]);

  // 🟢 2. FETCH ACTIVE MATCHES (Incoming Donors)
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

  // 🟢 3. FETCH HOSPITAL'S OWN CAMPS
  const fetchMyCamps = async () => {
    try {
      const encodedName = encodeURIComponent(userName);
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/camps/hospital/${encodedName}`);
      const data = await response.json();
      if (response.ok) setMyCamps(data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchMyCamps();
  }, [userName]);

  // 🟢 4. MANUAL STOCK UPDATE (Buttons ke liye)
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

  // 🟢 5. COMPLETE DONATION (🚀 Backend handles stock increment now)
  const handleComplete = async (requestId, bloodGroup) => {
    const confirmDone = window.confirm(`Has the donor successfully donated? This will close the request and automatically add 1 Unit of ${bloodGroup} to your inventory.`);
    if (!confirmDone) return;
    
    try {
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/requests/complete/${requestId}`, { method: 'PUT' });
      if (response.ok) {
        alert(`✅ Donation successfully recorded! Backend has updated your ${bloodGroup} stock.`);
        
        // UI Update: List se hatao aur inventory fresh fetch karo
        setActiveMatches(activeMatches.filter(match => match._id !== requestId));
        fetchInventory(); // 🚀 Fresh stock data mangwao backend se
      }
    } catch (error) { 
      alert("Error completing donation."); 
    }
  };

  // Form States & Handlers
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

  const [campData, setCampData] = useState({ campName: '', date: '', time: '', location: '', description: '' });
  const handleCampChange = (e) => setCampData({ ...campData, [e.target.name]: e.target.value });

  // 🚀 FIXED: handleCampSubmit updated with hospitalId requirement
  const handleCampSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🟢 localstorage se ID fetch karna (Agar ID login ke waqt '_id' naam se save hai toh ise badal dena)
      const userId = localStorage.getItem('userId') || localStorage.getItem('_id') || localStorage.getItem('id'); 

      if (!userId) {
        alert("Hospital ID not found! Please login again.");
        return;
      }

      const campPayload = { 
        ...campData, 
        hospitalName: userName,
        hospitalId: userId // 🚀 YE FIELD ADD KI GAYI HAI
      }; 

      const response = await fetch('https://lifelink-api-tlx8.onrender.com/api/camps/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campPayload)
      });

      if (response.ok) {
        alert("📢 Camp successfully published!");
        setCampData({ campName: '', date: '', time: '', location: '', description: '' });
        fetchMyCamps(); // Form clean hone ke baad updated list fetch karo
      } else {
        alert("❌ Error publishing camp! Check the console.");
      }
    } catch (error) { 
      alert("Server error!"); 
    }
  };

  const handleCompleteCamp = async (campId) => {
    if (!window.confirm("Mark this camp as Completed?")) return;
    try {
      const response = await fetch(`https://lifelink-api-tlx8.onrender.com/api/camps/complete/${campId}`, { method: 'PUT' });
      if (response.ok) {
        alert("✅ Camp marked as Completed!");
        fetchMyCamps();
      }
    } catch (error) {}
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
          <h2>{userName} Control Room 🏥</h2>
          <p>Manage your blood bank inventory and verify incoming donors.</p>
        </div>

        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <h3>🩸 Live Blood Stock</h3>
            {!inventory ? <p>Loading inventory...</p> : (
              <div className="inventory-grid">
                {Object.keys(inventory).map((group) => (
                  <div className={`blood-card ${inventory[group] < 5 ? 'low-stock' : ''}`} key={group}>
                    <p className="blood-type">{group}</p>
                    <p className="blood-units">{inventory[group]} Units</p>
                    <div className="stock-controls">
                      <button className="stock-btn" onClick={() => updateStock(group, -1)}>-</button>
                      <button className="stock-btn" onClick={() => updateStock(group, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create-request' && (
          <div className="request-form-container">
            <h3 style={{ borderLeft: '4px solid #d32f2f', paddingLeft: '10px' }}>🚨 Generate Urgent Blood Request</h3>
            <form onSubmit={handleSubmit} className="req-form-grid">
              <div className="req-input-group"><label>Patient Name *</label><input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required /></div>
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

        {activeTab === 'organize-camp' && (
          <div className="request-form-container">
            <h3 style={{ borderLeft: '4px solid #4CAF50', paddingLeft: '10px' }}>📅 Camps Manager</h3>
            <form onSubmit={handleCampSubmit} className="req-form-grid">
              <div className="req-input-group full-width"><label>Camp Name *</label><input type="text" name="campName" value={campData.campName} onChange={handleCampChange} required /></div>
              <div className="req-input-group"><label>Date *</label><input type="date" name="date" value={campData.date} onChange={handleCampChange} required /></div>
              <div className="req-input-group"><label>Time *</label><input type="time" name="time" value={campData.time} onChange={handleCampChange} required /></div>
              <div className="req-input-group full-width"><label>Location *</label><input type="text" name="location" value={campData.location} onChange={handleCampChange} required /></div>
              <button type="submit" className="submit-req-btn full-width" style={{backgroundColor: '#4CAF50'}}>Publish Camp</button>
            </form>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="inventory-section">
            <h3>📋 Incoming Donors</h3>
            <div className="request-feed">
              {activeMatches.length === 0 ? <p>No active donors arriving right now.</p> : (
                activeMatches.map((match) => (
                  <div className="request-card" key={match._id} style={{ borderLeft: '5px solid #1976D2' }}>
                    <div className="req-details">
                      <h4>Patient: {match.patientName} ({match.bloodGroup})</h4>
                      <p>🩸 Donor: <strong>{match.acceptedBy}</strong> | 📞 {match.donorContact}</p>
                    </div>
                    <button className="btn-accept" style={{backgroundColor: '#1976D2'}} onClick={() => handleComplete(match._id, match.bloodGroup)}>✅ Blood Received</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="inventory-section">
            <h3>⚙️ Hospital Settings</h3>
            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <p><strong>Name:</strong> {userName}</p>
              <p><strong>Account Type:</strong> Blood Bank Admin</p>
            </div>
            <div style={{ background: '#fff5f5', padding: '20px', borderRadius: '10px', border: '1px solid #ffcdd2' }}>
              <h4 style={{ color: '#d32f2f' }}>⚠️ Danger Zone</h4>
              <p>Permanently remove your hospital from the LifeLink network.</p>
              <button onClick={handleDeleteAccount} className="stock-btn" style={{color: '#d32f2f', border: '1px solid #d32f2f', padding: '10px', width: 'auto'}}>🗑️ Delete Hospital Account</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalDashboard;