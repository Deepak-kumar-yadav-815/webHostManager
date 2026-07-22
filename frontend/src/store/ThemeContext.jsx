import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('whm-theme') || 'dark');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('whm-accent') || '#3b82f6'); // Default blue

  const PRESET_COLORS = [
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' }
  ];

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('whm-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply custom accent color
    document.documentElement.style.setProperty('--accent-primary', accentColor);
    
    // We can also calculate a secondary accent for gradients based on the primary, 
    // but for simplicity, we will just use the primary color with a fixed secondary or slight variation.
    localStorage.setItem('whm-accent', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeAccent = (hex) => {
    setAccentColor(hex);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, changeAccent, PRESET_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
};
