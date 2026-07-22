import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { Sparkles, X, RefreshCw, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const WebsiteControlPanel = ({ website, onBack }) => {
  const [metricsData, setMetricsData] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState({ cpuUsage: 0, ramUsage: 0, activeVisitors: 0 });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiUpdatedAt, setAiUpdatedAt] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    // Subscribe to this specific website's telemetry
    socket.emit('subscribe-telemetry', website._id);

    socket.on('telemetry-update', (data) => {
      setCurrentMetrics(data);
      
      setMetricsData(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), cpu: data.cpuUsage, ram: data.ramUsage }];
        // Keep only last 20 data points for the chart
        if (newData.length > 20) return newData.slice(newData.length - 20);
        return newData;
      });
    });

    return () => {
      socket.emit('unsubscribe-telemetry', website._id);
      socket.disconnect();
    };
  }, [website._id]);

  const fetchAIInsights = async (refresh = false) => {
    setIsGeneratingAI(true);
    if (!refresh) setShowAiModal(true);
    try {
      console.log('Fetching AI Insights with refresh:', refresh);
      const res = await api.get(`/websites/${website._id}/ai-insights${refresh ? '?refresh=true' : ''}`);
      setAiInsights(res.data.insights);
      setAiUpdatedAt(res.data.updatedAt);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setAiInsights('Failed to generate insights. Please try again later.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%', animation: 'fadeIn 0.3s ease-in' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center gap-4">
          <button className="btn btn-outline" onClick={onBack} style={{ padding: '0.5rem 1rem' }}>&larr; Back</button>
          <h2 className="text-gradient" style={{ margin: 0 }}>{website.name} Control Panel</h2>
          <button 
            className="btn btn-primary flex items-center gap-2" 
            style={{ padding: '0.5rem 1rem', marginLeft: '1rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            onClick={() => fetchAIInsights(false)}
          >
            <Sparkles size={18} /> AI Insights
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: website.status === 'active' ? 'var(--success)' : 'var(--danger)', boxShadow: `0 0 10px ${website.status === 'active' ? 'var(--success)' : 'var(--danger)'}` }}></div>
          <span style={{ fontWeight: 'bold', color: website.status === 'active' ? 'var(--success)' : 'var(--danger)' }}>
            {website.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center', border: '1px solid var(--accent-primary)' }}>
          <h4 style={{ color: 'var(--text-secondary)' }}>Active Visitors (Now)</h4>
          <h2 style={{ fontSize: '3rem', color: 'var(--accent-primary)', textShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
            {currentMetrics.activeVisitors}
          </h2>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-secondary)' }}>CPU Usage</h4>
          <h2 style={{ fontSize: '2.5rem' }}>{currentMetrics.cpuUsage}%</h2>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-secondary)' }}>RAM Usage</h4>
          <h2 style={{ fontSize: '2.5rem' }}>{currentMetrics.ramUsage} MB</h2>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-secondary)' }}>Public URL</h4>
          <a href={`http://localhost:5000/s/${website.shortUrlAlias}`} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '1rem', color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
            localhost:5000/s/{website.shortUrlAlias}
          </a>
        </div>
      </div>

      <h3>Live Resource Telemetry</h3>
      <div style={{ width: '100%', height: 300, marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metricsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="ram" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showAiModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
              onClick={() => setShowAiModal(false)}
            >
              <X size={24} />
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Sparkles size={24} /> AI UX & Code Insights
              </h2>
              {aiUpdatedAt && !isGeneratingAI && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', marginRight: '2rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> Last updated: {new Date(aiUpdatedAt).toLocaleString()}
                  </span>
                  <button 
                    className="btn btn-outline flex items-center gap-2" 
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => fetchAIInsights(true)}
                  >
                    <RefreshCw size={14} /> Refresh Insights
                  </button>
                </div>
              )}
            </div>
            
            {isGeneratingAI ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ borderTopColor: 'var(--accent-primary)', width: '40px', height: '40px', margin: '0 auto', marginBottom: '1rem' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Analyzing feedback and source code...</p>
              </div>
            ) : (
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '1.5rem',
                borderRadius: '8px',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 style={{ color: 'var(--accent-primary)', marginTop: '1.5rem' }} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{ color: 'var(--text-secondary)', marginTop: '1rem' }} {...props} />,
                    p: ({node, ...props}) => <p style={{ marginBottom: '1rem' }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                    li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? 
                        <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', color: 'var(--accent-secondary)' }} {...props} /> :
                        <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', overflowX: 'auto', marginBottom: '1rem' }}><code {...props} /></pre>
                  }}
                >
                  {aiInsights}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteControlPanel;
