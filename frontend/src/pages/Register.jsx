import React, { useEffect } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { dark } from '@clerk/themes';
import { ThemeContext } from '../store/ThemeContext';
import { AuthContext } from '../store/AuthContext';

const Register = () => {
  const { theme } = React.useContext(ThemeContext);
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center animate-fade-in-up" style={{ flex: 1, padding: '2rem' }}>
      <SignUp 
        routing="path" 
        path="/register" 
        signInUrl="/login"
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
    </div>
  );
};

export default Register;
