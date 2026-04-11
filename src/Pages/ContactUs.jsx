import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Real app me ye data backend par post hoga. Abhi ke liye hum alert show karenge.
    alert("🎉 Thank you for contacting LifeLink! Our support team will get back to you shortly.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      
      {/* 🟢 Hero Header */}
      <div className="contact-header">
        <h1>Get in Touch 📩</h1>
        <p>Have questions, feedback, or need urgent assistance? The LifeLink support team is available 24/7 to help you.</p>
      </div>

      <div className="contact-container">
        
        {/* 🟢 Contact Info Cards */}
        <div className="contact-info">
          <div className="info-card">
            <span className="info-icon">📍</span>
            <h3>Head Office</h3>
            <p>LifeLink Tech Park, Sector 62<br/>Noida, UP 201301</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📞</span>
            <h3>24/7 Helpline</h3>
            <p>Emergency: +91 82715-99028<br/>Support: +91 90272-06045</p>
          </div>
          <div className="info-card">
            <span className="info-icon">✉️</span>
            <h3>Email Support</h3>
            <p>livelinksaver@gmail.com<br/>livelinksaver@gmail.com</p>
          </div>
        </div>

        {/* 🟢 Form & Map Layout */}
        <div className="contact-bottom">
          
          {/* Contact Form */}
          <div className="contact-form-container">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="input-group">
                <label>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., John Doe" />
              </div>
              <div className="input-group">
                <label>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="mail@example.com" />
              </div>
              <div className="input-group">
                <label>Subject *</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="How can we help?" />
              </div>
              <div className="input-group">
                <label>Message *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Write your message here..."></textarea>
              </div>
              <button type="submit" className="btn-submit-contact">Send Message 🚀</button>
            </form>
          </div>

          {/* Google Map Embedded (Dummy Location) */}
          <div className="contact-map">
            <iframe
              title="LifeLink HQ"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112001.38531063991!2d77.26674937740263!3d28.5355161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a43173357b%3A0x37ffce30c87cc03f!2sNoida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '15px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;