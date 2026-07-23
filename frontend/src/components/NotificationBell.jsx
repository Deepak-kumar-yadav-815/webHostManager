import React, { useState, useEffect, useContext } from 'react';
import { Bell } from 'lucide-react';
import { AuthContext } from '../store/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Fetch existing notifications from DB
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();

    // Connect to Socket.io for real-time updates
    const newSocket = io('https://webhostmanager-tvh1.onrender.com');
    setSocket(newSocket);

    newSocket.emit('join', user._id.toString());

    newSocket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn btn-outline"
        style={{ 
          padding: '0.5rem', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative'
        }}
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (unreadCount > 0 && !showDropdown) {
            markAllAsRead();
          }
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'var(--danger)',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '120%',
          right: 0,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          width: '320px',
          maxHeight: '400px',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={markAllAsRead}>
                Mark all as read
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.length > 0 ? notifications.map(notif => (
              <div key={notif._id} style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{notif.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(notif.createdAt).toLocaleTimeString()} - {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
