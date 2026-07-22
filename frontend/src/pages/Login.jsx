import React, { useEffect } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { dark } from '@clerk/themes';
import { ThemeContext } from '../store/ThemeContext';
import { AuthContext } from '../store/AuthContext';

const Login = () => {
  const { theme } = React.useContext(ThemeContext);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center animate-fade-in-up" style={{ flex: 1, padding: '2rem', flexDirection: 'column', gap: '2rem' }}>
      <SignIn 
        routing="path" 
        path="/login" 
        signUpUrl="/register"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          baseTheme: theme === 'dark' ? dark : undefined,
          elements: {
            card: {
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)'
            },
            headerTitle: { color: 'var(--text-primary)' },
            headerSubtitle: { color: 'var(--text-secondary)' },
            socialButtonsBlockButton: { border: '1px solid var(--border-subtle)' },
            dividerLine: { background: 'var(--border-subtle)' },
            dividerText: { color: 'var(--text-secondary)' },
            formFieldLabel: { color: 'var(--text-primary)' },
            formFieldInput: { 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            },
            formButtonPrimary: { 
              background: 'var(--accent-primary)',
              color: 'white'
            },
            footerActionText: { color: 'var(--text-secondary)' },
            footerActionLink: { color: 'var(--accent-primary)' }
          }
        }}
      />
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          Are you an administrator? <Link to="/admin-login" style={{ color: 'var(--danger)', fontWeight: 500 }}>Admin Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
