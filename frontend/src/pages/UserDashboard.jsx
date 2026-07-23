import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../store/AuthContext';
import { ThemeContext } from '../store/ThemeContext';
import api from '../services/api';
import WebsiteControlPanel from '../components/WebsiteControlPanel';
import NotificationBell from '../components/NotificationBell';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Server, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  Activity, 
  PlusCircle, 
  ExternalLink, 
  MessageSquare, 
  Cpu,
  Folder,
  Shield,
  Trash2
} from 'lucide-react';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, accentColor, changeAccent, PRESET_COLORS } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('Websites');
  
  const [websites, setWebsites] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [subscription, setSubscription] = useState(null);
  
  const [allPlans, setAllPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedWebsiteFeedback, setSelectedWebsiteFeedback] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [activeControlPanel, setActiveControlPanel] = useState(null);

  useEffect(() => {
    fetchData();
    fetchPlans();
    fetchInvoices();
  }, [user._id]);

  const fetchData = async () => {
    try {
      const subRes = await api.get('/subscriptions/me');
      setSubscription(subRes.data);
      const webRes = await api.get('/websites');
      setWebsites(webRes.data);
      const repoRes = await api.get('/repositories');
      setRepositories(repoRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setAllPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchase = async (planId, isQueue = false) => {
    try {
      const endpoint = isQueue ? '/subscriptions/queue' : '/subscriptions/purchase';
      await api.post(endpoint, { planId });
      alert(`Plan ${isQueue ? 'queued' : 'purchased'} successfully!`);
      fetchData();
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process plan');
    }
  };

  const cancelActive = async () => {
    if (!window.confirm('Are you sure you want to cancel your active plan? Your hosted nodes will be suspended immediately.')) return;
    try {
      await api.post('/subscriptions/cancel-active');
      alert('Active plan cancelled.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const cancelQueued = async () => {
    if (!window.confirm('Are you sure you want to cancel your queued plan?')) return;
    try {
      await api.post('/subscriptions/cancel-queued');
      alert('Queued plan cancelled.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const hostRepo = async (repoId) => {
    const slug = prompt('Enter a domain name (slug) for this node:');
    if (!slug) return;
    try {
      await api.post(`/repositories/${repoId}/host`, { customSlug: slug });
      alert('Node hosted successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to host node');
    }
  };

  const unhostRepo = async (repoId) => {
    if (!window.confirm('Are you sure you want to unhost this node? It will become inactive.')) return;
    try {
      await api.post(`/repositories/${repoId}/unhost`);
      alert('Node unhosted successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unhost');
    }
  };

  const deleteLegacyNode = async (websiteId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this legacy node? This action cannot be undone.')) return;
    try {
      await api.delete(`/websites/${websiteId}`);
      alert('Legacy Node deleted successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete node');
    }
  };

  const [deploying, setDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStep, setDeployStep] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Start Simulation
    setDeploying(true);
    setDeployProgress(10);
    setDeployStep('Provisioning Server Container...');

    // Simulate steps
    await new Promise(r => setTimeout(r, 1500));
    setDeployProgress(40);
    setDeployStep('Installing Dependencies & Environment...');

    await new Promise(r => setTimeout(r, 1500));
    setDeployProgress(70);
    setDeployStep('Uploading Source Code...');

    await new Promise(r => setTimeout(r, 1500));
    setDeployProgress(90);
    setDeployStep('Configuring Domain Routing...');

    const formData = new FormData();
    formData.append('name', form.name.value);
    formData.append('htmlFile', form.htmlFile.files[0]);

    try {
      await api.post('/repositories', formData);
      setDeployProgress(100);
      setDeployStep('Upload Complete!');
      
      setTimeout(() => {
        setDeploying(false);
        fetchData();
        form.reset();
      }, 1000);
    } catch (err) {
      setDeploying(false);
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const generateAIReport = async (websiteId) => {
    try {
      const res = await api.post(`/analytics/${websiteId}/ai-report`);
      alert(res.data.report);
    } catch (err) {
      alert('Failed to generate report');
    }
  };

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    
    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary accent color
    doc.text('WHM Platform Invoice', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice ID: ${invoice._id}`, 20, 30);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 35);
    
    // Add User Details
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Billed To:', 20, 50);
    doc.setFontSize(10);
    doc.text(user?.name || 'User', 20, 55);
    doc.text(user?.email || 'N/A', 20, 60);

    // Add Table
    const tableData = [
      ['Plan/Description', 'Billing Cycle', 'Amount (INR)']
    ];
    
    // Assuming plan is populated or we just use general terms
    tableData.push([
      'Hosting Plan Subscription',
      'Recurring',
      `Rs. ${invoice.amountPaidINR}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Add Total
    const finalY = doc.lastAutoTable.finalY || 70;
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(`Total Paid: Rs. ${invoice.amountPaidINR}`, 20, finalY + 15);

    // Save
    doc.save(`Invoice_${invoice._id}.pdf`);
  };

  const viewFeedback = async (website) => {
    try {
      const res = await api.get(`/feedback/website/${website._id}`);
      setFeedbackList(res.data);
      setSelectedWebsiteFeedback(website.name);
    } catch (err) {
      alert('Failed to load feedback');
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sleek Sidebar */}
      <div className="sidebar flex flex-col justify-between" style={{ padding: '2rem 1.5rem' }}>
        <div>
          <h2 className="text-gradient" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={28} /> WHM
          </h2>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'Websites', icon: <Server size={20} />, label: 'Active Nodes' },
              { id: 'Repository', icon: <Folder size={20} />, label: 'Repository' },
              { id: 'Subscription', icon: <Shield size={20} />, label: 'Subscription' },
              { id: 'Billing', icon: <CreditCard size={20} />, label: 'Billing & Plans' },
              { id: 'Invoices', icon: <FileText size={20} />, label: 'Invoices' },
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
                onClick={() => { setActiveTab(item.id); setActiveControlPanel(null); }}
              >
                {item.icon} {item.label}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</p>
          </div>
          <button className="btn btn-outline" onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
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
            {activeControlPanel ? `${activeControlPanel.name} Control Panel` : activeTab}
          </h2>
          {subscription && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--success)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
              <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 500 }}>{subscription.plan?.name} Active</span>
            </div>
          )}
        </div>

        <div style={{ padding: '2rem' }}>
          
          {/* Notifications are now handled by the NotificationBell component in the header */}


          {activeTab === 'Repository' && (
            <div className="animate-fade-in-up">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ border: '1px dashed var(--accent-primary)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <PlusCircle color="var(--accent-primary)" size={24} />
                    <h3 style={{ margin: 0 }}>Upload New Node to Repository</h3>
                  </div>
                  
                  {deploying ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1.5rem' }}>
                      <Server size={48} className="text-gradient" style={{ animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '100%', background: 'var(--bg-secondary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${deployProgress}%`, 
                          height: '100%', 
                          background: 'var(--accent-primary)',
                          transition: 'width 0.5s ease-out'
                        }}></div>
                      </div>
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-secondary)' }}>{deployStep}</p>
                      <span style={{ fontSize: '0.8rem' }}>{deployProgress}% Completed</span>
                    </div>
                  ) : (
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                      <input name="name" className="input-field" placeholder="Node Name (e.g. Production Alpha)" required />
                      <input type="file" name="htmlFile" className="input-field" accept=".html" required style={{ padding: '0.5rem' }} />
                      <button type="submit" className="btn btn-primary" style={{ marginTop: 'auto' }}>Upload to Repository</button>
                    </form>
                  )}
                </div>
              </div>
              
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Folder size={24} /> Your Repositories</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repositories.map(repo => (
                      <tr key={repo._id}>
                        <td style={{ fontWeight: 600 }}>{repo.name}</td>
                        <td><span className={`badge badge-${repo.status === 'hosted' ? 'active' : 'queued'}`}>{repo.status}</span></td>
                        <td>
                          {repo.status === 'unhosted' ? (
                            <button onClick={() => hostRepo(repo._id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Host This</button>
                          ) : (
                            <button onClick={() => unhostRepo(repo._id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Unhost</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {repositories.length === 0 && <tr><td colSpan="3" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>No repositories found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Subscription' && (
            <div className="animate-fade-in-up">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={24} /> Current Active Plan</h3>
                    {subscription && subscription.status === 'active' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Plan Name</span>
                          <strong style={{ color: 'var(--accent-primary)' }}>{subscription.plan?.name}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                          <span className={`badge badge-${subscription.status}`}>{subscription.status}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Nodes Deployed</span>
                          <strong>{websites.length} / {subscription.plan?.maxWebsites}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Renewal Date</span>
                          <strong>{new Date(subscription.endDate).toLocaleDateString()}</strong>
                        </div>
                        <button className="btn btn-outline" style={{ marginTop: '1rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={cancelActive}>Cancel Active Plan</button>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)' }}>You do not have an active plan. Purchase one to deploy nodes.</p>
                    )}
                  </div>
                </div>

                {subscription && subscription.queuedPlan && (
                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={24} /> Queued Plan</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Plan Name</span>
                          <strong style={{ color: 'var(--accent-primary)' }}>{subscription.queuedPlan?.name || 'Queued Plan'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Starts On</span>
                          <strong>{new Date(subscription.queuedPlanStartDate).toLocaleDateString()}</strong>
                        </div>
                        <button className="btn btn-outline" style={{ marginTop: '1rem', color: 'var(--warning)', borderColor: 'var(--warning)' }} onClick={cancelQueued}>Cancel Queued Plan</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Websites' && (
            <div className="animate-fade-in-up">
              {activeControlPanel ? (
                <WebsiteControlPanel website={activeControlPanel} onBack={() => setActiveControlPanel(null)} />
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Server size={24} /> Active Server Nodes</h3>
                    <button className="btn btn-outline" onClick={() => setActiveTab('Repository')}><PlusCircle size={16} style={{marginRight: '0.5rem'}} /> Go to Repository</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {websites.map((site, index) => (
                      <div 
                        key={site._id} 
                        className="glass-panel" 
                        style={{ 
                          padding: '1.5rem',
                          cursor: 'pointer', 
                          transition: 'all 0.2s ease', 
                          position: 'relative',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`,
                          opacity: 0,
                          transform: 'translateY(10px)'
                        }} 
                        onClick={() => setActiveControlPanel(site)}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.borderColor = 'var(--accent-primary)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                      >
                        {site.status === 'active' && (
                          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--success)', filter: 'blur(50px)', opacity: 0.2 }}></div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{site.name}</h4>
                            <a 
                              href={`https://webhostmanager-tvh1.onrender.com/s/${site.shortUrlAlias}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={(e) => e.stopPropagation()} 
                              style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem', textDecoration: 'none', fontSize: '0.9rem' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                              /{site.shortUrlAlias} <ExternalLink size={14} />
                            </a>
                          </div>
                          <div title={site.status} style={{ width: '12px', height: '12px', borderRadius: '50%', background: site.status === 'active' ? 'var(--success)' : 'var(--danger)', boxShadow: `0 0 10px ${site.status === 'active' ? 'var(--success)' : 'var(--danger)'}` }}></div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                            onClick={(e) => { e.stopPropagation(); setActiveControlPanel(site); }}
                          >
                            <Cpu size={16} /> Telemetry
                          </button>
                          <button 
                            className="btn btn-outline" 
                            style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                            onClick={(e) => { e.stopPropagation(); viewFeedback(site); }}
                          >
                            <MessageSquare size={16} /> Feedback
                          </button>
                          {(() => {
                            const repo = repositories.find(r => (r.activeWebsiteId?._id === site._id) || (r.activeWebsiteId === site._id));
                            if (repo) {
                              return (
                                <button 
                                  title="Unhost Node"
                                  className="btn btn-outline" 
                                  style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--warning)', borderColor: 'var(--warning)' }}
                                  onClick={(e) => { e.stopPropagation(); unhostRepo(repo._id); }}
                                >
                                  <Trash2 size={16} /> Unhost
                                </button>
                              );
                            } else {
                              return (
                                <button 
                                  title="Delete Legacy Node"
                                  className="btn btn-outline" 
                                  style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                  onClick={(e) => { e.stopPropagation(); deleteLegacyNode(site._id); }}
                                >
                                  <Trash2 size={16} /> Delete
                                </button>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    ))}
                    {websites.length === 0 && (
                      <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                        <Server size={48} style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No active server nodes. Host a node from the Repository to see it here.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'Billing' && (
            <div className="animate-fade-in-up">
              <h3 style={{ marginBottom: '1.5rem' }}>Available Plans</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {allPlans.map(plan => (
                  <div key={plan._id} className="glass-panel flex-col justify-between" style={{ borderTop: `4px solid var(--accent-primary)` }}>
                    <div>
                      <h4 style={{ fontSize: '1.25rem' }}>{plan.name}</h4>
                      <div style={{ margin: '1.5rem 0' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>₹{plan.priceINR}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '1rem' }}>Includes {plan.maxWebsites} server nodes</p>
                      <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                        {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                    {subscription && subscription.status === 'active' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={() => handlePurchase(plan._id, false)}>
                          Switch Plan (Instant)
                        </button>
                        <button className="btn btn-outline" style={{ width: '100%', padding: '0.8rem' }} onClick={() => handlePurchase(plan._id, true)}>
                          Queue Plan
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => handlePurchase(plan._id, false)}>
                        Purchase Plan
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Invoices' && (
            <div className="animate-fade-in-up">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Date</th>
                      <th>Amount (INR)</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv._id}>
                        <td style={{ fontFamily: 'monospace' }}>{inv._id}</td>
                        <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600 }}>₹{inv.amountPaidINR}</td>
                        <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                        <td>
                          <button onClick={() => downloadPDF(inv)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={14} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>No invoices found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="animate-fade-in-up" style={{ maxWidth: '600px' }}>
              <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Appearance</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Customize your dashboard theme.</p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <strong style={{ display: 'block' }}>Theme Mode</strong>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Toggle between light and dark UI</span>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', borderRadius: '30px' }} onClick={toggleTheme}>
                    {theme === 'dark' ? 'Switch to Light ☀️' : 'Switch to Dark 🌙'}
                  </button>
                </div>

                <div style={{ marginTop: '2.5rem' }}>
                  <strong style={{ display: 'block', marginBottom: '1rem' }}>Accent Color</strong>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {PRESET_COLORS.map(c => (
                      <div 
                        key={c.name}
                        onClick={() => changeAccent(c.hex)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: c.hex,
                          cursor: 'pointer',
                          border: accentColor === c.hex ? '3px solid var(--text-primary)' : '3px solid transparent',
                          transition: 'all 0.2s ease',
                          boxShadow: accentColor === c.hex ? `0 0 15px ${c.hex}80` : 'none'
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

      {/* Feedback Modal */}
      {selectedWebsiteFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedWebsiteFeedback(null)} style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', animation: 'slideUp 0.3s ease-out' }}>
            <button className="modal-close" onClick={() => setSelectedWebsiteFeedback(null)}>&times;</button>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={24} color="var(--accent-primary)" /> Feedback: {selectedWebsiteFeedback}
            </h3>
            
            {feedbackList.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No feedback received for this node yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {feedbackList.map((fb, idx) => (
                  <div key={fb._id} style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    borderLeft: `4px solid ${fb.rating >= 4 ? 'var(--success)' : fb.rating === 3 ? 'var(--warning)' : 'var(--danger)'}`,
                    animation: `fadeInUp 0.3s ease-out ${idx * 0.1}s forwards`,
                    opacity: 0
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{Array(fb.rating).fill('⭐').join('')}</strong>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>"{fb.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
