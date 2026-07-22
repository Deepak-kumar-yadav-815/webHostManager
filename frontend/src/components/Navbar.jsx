import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../store/ThemeContext';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const Navbar = () => {
  const { theme, toggleTheme, accentColor, changeAccent, PRESET_COLORS } = useContext(ThemeContext);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      padding: '1rem 2rem',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>WHM</h2>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
          <Link to="/contact" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>Contact Us</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Color Picker Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-outline" 
            style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: accentColor, border: 'none' }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change Accent Color"
          ></button>
          
          {showColorPicker && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.5rem',
              display: 'flex',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.2s ease-in'
            }}>
              {PRESET_COLORS.map(c => (
                <div 
                  key={c.name}
                  onClick={() => { changeAccent(c.hex); setShowColorPicker(false); }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: c.hex,
                    cursor: 'pointer',
                    border: accentColor === c.hex ? '2px solid var(--text-primary)' : '2px solid transparent'
                  }}
                  title={c.name}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          className="btn btn-outline" 
          style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <SignedOut>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Login</Link>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" appearance={{ baseTheme: theme === 'dark' ? dark : undefined }} />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
