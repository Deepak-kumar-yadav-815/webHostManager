import React, { useState } from 'react';

const ContactUs = () => {
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const name = e.target.elements[0].value + ' ' + e.target.elements[1].value;
      const email = e.target.elements[2].value;
      const comment = e.target.elements[3].value;
      
      const response = await fetch('https://webhostmanager-tvh1.onrender.com/api/feedback/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, comment })
      });
      
      if (!response.ok) throw new Error('Failed to submit');
      
      setStatus('Message sent successfully! We will get back to you soon.');
      e.target.reset();
    } catch (error) {
      setStatus('Error sending message. Please try again later.');
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '4rem 2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem' }}>Get in <span className="text-gradient">Touch</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.2rem' }}>
          Have questions about your hosting plan or need technical support? We're here to help.
        </p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '3rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>First Name</label>
              <input type="text" className="input-field" required placeholder="John" />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Last Name</label>
              <input type="text" className="input-field" required placeholder="Doe" />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input type="email" className="input-field" required placeholder="john@example.com" />
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Message</label>
            <textarea 
              className="input-field" 
              required 
              placeholder="How can we help you?" 
              style={{ minHeight: '150px', resize: 'vertical' }}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }} disabled={status === 'Submitting...'}>
            {status === 'Submitting...' ? 'Sending...' : 'Send Message'}
          </button>

          {status && status !== 'Submitting...' && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: '8px', textAlign: 'center' }}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
