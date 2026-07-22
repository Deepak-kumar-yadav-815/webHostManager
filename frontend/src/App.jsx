import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { ClerkProvider } from '@clerk/clerk-react';

import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import ContactUs from './pages/ContactUs';
import Navbar from './components/Navbar';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const PrivateRoute = ({ children, requireAdmin }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div style={{color:'var(--text-primary)', padding: '2rem'}}>Loading Authentication...</div>;

  if (!user) return <Navigate to="/login" />;

  if (requireAdmin && user.role !== 'Admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Wrapper for public pages that need the Navbar
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  </>
);

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes with Navbar */}
              <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactUs /></PublicLayout>} />
              <Route path="/login/*" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register/*" element={<PublicLayout><Register /></PublicLayout>} />
              <Route path="/admin-login" element={<PublicLayout><AdminLogin /></PublicLayout>} />
              
              {/* Private Routes (Dashboards have their own internal sidebar layout) */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <UserDashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/admin-dashboard" 
                element={
                  <PrivateRoute requireAdmin={true}>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
