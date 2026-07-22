import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../store/AuthContext';
import { ThemeContext } from '../store/ThemeContext';
import api from '../services/api';
import NotificationBell from '../components/NotificationBell';

import { Shield, LayoutDashboard, Settings, LogOut, Activity, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, accentColor, changeAccent, PRESET_COLORS } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('Overview');
  const [plans, setPlans] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchPlans();
    fetchFeedbacks();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/feedback/platform');
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    const payload = {
      name: e.target.name.value,
      priceINR: e.target.price.value,
      billingCycle: e.target.cycle.value,
      features: e.target.features.value.split(','),
      maxWebsites: e.target.maxWebsites.value,
      storageLimitMB: e.target.storage.value
    };

    try {
      await api.post('/plans', payload);
      fetchPlans();
      e.target.reset();
      alert('Plan Created!');
    } catch (err) {
      alert('Failed to create plan');
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar flex flex-col justify-between" style={{ padding: '2rem 1.5rem' }}>
        <div>
          <h2 className="text-gradient" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={28} /> Admin Center
          </h2>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'Overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
              { id: 'Plans', icon: <Activity size={20} />, label: 'Manage Plans' },
              { id: 'Analytics', icon: <Activity size={20} />, label: 'Global Analytics' },
              { id: 'Feedback', icon: <MessageSquare size={20} />, label: 'User Feedback' },
              { id: 'Settings', icon: <Settings size={20} />, label: 'Settings' }
            ].map(item => (
              <li 
                key={item.id}
                style={{ 
                  padding: '0.75rem 1rem', 
                  cursor: 'pointer', 
                  color: activeTab === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: activeTab === item.id ? 'var(--accent-primary)' : 'transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontWeight: activeTab === item.id ? 600 : 400,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon} {item.label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>{user.name}</p>
            <span className="badge badge-active" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{user.role}</span>
          </div>
          <button className="btn btn-outline" onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="main-content" style={{ padding: 0 }}>
        
        {/* Top Header */}
        <div style={{ 
          padding: '1.5rem 2rem', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            Admin Dashboard - {activeTab}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
        
        {activeTab === 'Plans' && (
          <>
            <div className="glass-panel" style={{ marginTop: '2rem' }}>
              <h3>Create Hosting Plan</h3>
              <form onSubmit={handleCreatePlan} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="input-group">
                  <input name="name" className="input-field" placeholder="Plan Name" required />
                </div>
                <div className="input-group">
                  <input name="price" type="number" className="input-field" placeholder="Price (INR)" required />
                </div>
                <div className="input-group">
                  <select name="cycle" className="input-field" required>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="input-group">
                  <input name="features" className="input-field" placeholder="Features (comma separated)" required />
                </div>
                <div className="input-group">
                  <input name="maxWebsites" type="number" className="input-field" placeholder="Max Websites" required />
                </div>
                <div className="input-group">
                  <input name="storage" type="number" className="input-field" placeholder="Storage (MB)" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Add Plan</button>
              </form>
            </div>

            <h3 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Available Plans</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {plans.map(plan => (
                <div key={plan._id} className="glass-panel flex-col gap-2">
                  <h4>{plan.name}</h4>
                  <h2 className="text-gradient">₹{plan.priceINR}/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Max Websites: {plan.maxWebsites}</p>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              ))}
              {plans.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No plans created yet.</p>}
            </div>
          </>
        )}

        { (activeTab === 'Analytics' || activeTab === 'Overview') && (
          <div style={{ marginTop: '2rem' }}>
            {analytics ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-secondary)' }}>Total Users</h4>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{analytics.totalUsers}</h2>
                  </div>
                  <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-secondary)' }}>Active Subscriptions</h4>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--success)' }}>{analytics.activeSubscriptions}</h2>
                  </div>
                  <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-secondary)' }}>Active Nodes</h4>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--accent-primary)' }}>{analytics.totalWebsitesHosted}</h2>
                  </div>
                  <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-secondary)' }}>Repositories</h4>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--warning)' }}>{analytics.totalRepositories}</h2>
                  </div>
                  <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-secondary)' }}>Total Revenue</h4>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: 'var(--success)' }}>{analytics.totalRevenue}</h2>
                  </div>
                </div>

                <div className="glass-panel">
                  <h3>Recent Platform Activity</h3>
                  <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                    {analytics.recentActivity.map(activity => (
                      <li key={activity.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{activity.action}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{activity.time}</span>
                      </li>
                    ))}
                    {analytics.recentActivity.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No recent activity.</p>}
                  </ul>
                </div>
              </>
            ) : (
              <p>Loading analytics...</p>
            )}
          </div>
        )}

        {activeTab === 'Feedback' && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>User Feedback</h3>
            {feedbacks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {feedbacks.map(fb => (
                  <div key={fb._id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{fb.name || 'Anonymous User'}</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {fb.email || 'No email provided'}
                        </p>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {fb.rating && (
                      <div style={{ display: 'flex', gap: '0.2rem', color: '#fbbf24' }}>
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                      </div>
                    )}
                    
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      "{fb.comment}"
                    </div>
                    
                    {fb.website && (
                      <div style={{ fontSize: '0.875rem', color: 'var(--accent-primary)' }}>
                        Related to Website: {fb.website.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <MessageSquare size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <p>No feedback received yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Settings' && (
          <div style={{ marginTop: '2rem', maxWidth: '600px' }}>
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
              <h3>Appearance</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Customize your admin dashboard theme.</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                <span>Theme Mode</span>
                <button className="btn btn-outline" onClick={toggleTheme}>
                  {theme === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
                </button>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <span style={{ display: 'block', marginBottom: '1rem' }}>Accent Color</span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {PRESET_COLORS.map(c => (
                    <div 
                      key={c.name}
                      onClick={() => changeAccent(c.hex)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: c.hex,
                        cursor: 'pointer',
                        border: accentColor === c.hex ? '3px solid var(--text-primary)' : '3px solid transparent',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      title={c.name}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
