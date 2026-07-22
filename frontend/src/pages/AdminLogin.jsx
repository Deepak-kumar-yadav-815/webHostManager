import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const { adminLogin, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'Admin') {
      navigate('/admin-dashboard');
    } else if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // The admin email is fixed as per the backend initAdmin script
      await adminLogin('admin@webhostmanager.com', password);
    } catch (err) {
      alert('Admin login failed. Incorrect password.');
    }
  };

  return (
    <div className="flex items-center justify-center animate-fade-in-up" style={{ flex: 1, padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--danger)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--danger)' }}>Admin Portal</h2>
        <form onSubmit={handleSubmit} className="flex-col">
          <div className="input-group">
            <label>Admin Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Access Admin Panel</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
