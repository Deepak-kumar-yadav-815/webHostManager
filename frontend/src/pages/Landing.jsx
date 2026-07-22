import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const features = [
    {
      title: "Real-Time Telemetry",
      description: "Watch your server CPU, RAM, and global active visitors spike in real-time with stunning WebGL charts and WebSockets.",
      icon: "⚡"
    },
    {
      title: "Geo-IP Interception",
      description: "Instantly track the geographical location of every single visitor hitting your hosted websites.",
      icon: "🌍"
    },
    {
      title: "Custom Slugs",
      description: "Claim your brand identity. Assign beautiful, human-readable custom URLs to your raw HTML uploads.",
      icon: "🔗"
    },
    {
      title: "AI Website Analytics",
      description: "Let our Gemini AI scan your HTML code and provide instant, actionable insights on UX and SEO improvements.",
      icon: "🧠"
    },
    {
      title: "Dynamic Feedback Hub",
      description: "Automatically inject a floating feedback widget into your hosted sites. Read visitor ratings straight from your dashboard.",
      icon: "💬"
    },
    {
      title: "Smart Billing",
      description: "Upgrade, downgrade, and queue subscription plans effortlessly with our Indian INR standardized billing system.",
      icon: "💳"
    }
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
      <section className="animate-fade-in-up" style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Abstract floating background elements */}
        <div className="animate-float delay-100" style={{ position: 'absolute', top: '10%', left: '10%', width: '150px', height: '150px', background: 'var(--accent-primary)', filter: 'blur(100px)', opacity: 0.5, borderRadius: '50%', zIndex: -1 }}></div>
        <div className="animate-float delay-300" style={{ position: 'absolute', bottom: '20%', right: '10%', width: '200px', height: '200px', background: 'var(--accent-secondary)', filter: 'blur(120px)', opacity: 0.4, borderRadius: '50%', zIndex: -1 }}></div>

        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
          The Future of <br/><span className="text-gradient">Web Hosting</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2.5rem' }}>
          Experience next-generation server telemetry, AI-driven insights, and a world-class UI. Host your HTML projects in seconds.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', boxShadow: 'var(--shadow-glow)' }}>
            Get Started Free
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features Grid Section */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in-up delay-100">
            <h2 style={{ fontSize: '2.5rem' }}>Platform <span className="text-gradient">Features</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Everything you need to scale your web presence.</p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className={`glass-panel animate-fade-in-up delay-${(idx % 3 + 1) * 100}`}
                style={{ 
                  padding: '2rem', 
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'default',
                  border: '1px solid var(--border-subtle)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} Web Host Manager. Built for the Future.</p>
        <Link to="/admin-login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.8rem', opacity: 0.7 }}>Admin Portal</Link>
      </footer>
    </div>
  );
};

export default Landing;
