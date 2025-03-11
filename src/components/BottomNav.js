import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaQrcode, FaHistory, FaCog } from 'react-icons/fa';

const BottomNav = () => {
  const location = useLocation();
  const darkMode = document.documentElement.classList.contains('dark-theme'); // Detect dark mode

  const getNavItemStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textDecoration: 'none',
      color: isActive ? '#007bff' : darkMode ? '#bbb' : '#333',
      flex: 1, // Ensures equal spacing and prevents shifting
    };
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 0',
        backgroundColor: darkMode ? '#222' : '#ffffff',
        borderTop: darkMode ? '2px solid #333' : '2px solid #E0E0E0',
        zIndex: 1000,
      }}
    >
      <NavLink to="/student/dashboard" style={getNavItemStyle('/student/dashboard')}>
        <FaHome
          size={24}
          style={{ color: location.pathname === '/student/dashboard' ? '#007bff' : darkMode ? '#bbb' : '#333' }}
        />
        <p
          style={{
            fontSize: '12px',
            marginTop: '3px',
            // Removed fontWeight toggle to prevent shifting
            color: location.pathname === '/student/dashboard' ? '#007bff' : darkMode ? '#bbb' : '#333',
          }}
        >
          Dashboard
        </p>
      </NavLink>

      <NavLink to="/student/attendance" style={getNavItemStyle('/student/attendance')}>
        <FaQrcode
          size={24}
          style={{ color: location.pathname === '/student/attendance' ? '#007bff' : darkMode ? '#bbb' : '#333' }}
        />
        <p
          style={{
            fontSize: '12px',
            marginTop: '3px',
            color: location.pathname === '/student/attendance' ? '#007bff' : darkMode ? '#bbb' : '#333',
          }}
        >
          Attendance
        </p>
      </NavLink>

      <NavLink to="/student/history" style={getNavItemStyle('/student/history')}>
        <FaHistory
          size={24}
          style={{ color: location.pathname === '/student/history' ? '#007bff' : darkMode ? '#bbb' : '#333' }}
        />
        <p
          style={{
            fontSize: '12px',
            marginTop: '3px',
            color: location.pathname === '/student/history' ? '#007bff' : darkMode ? '#bbb' : '#333',
          }}
        >
          History
        </p>
      </NavLink>

      <NavLink to="/student/settings" style={getNavItemStyle('/student/settings')}>
        <FaCog
          size={24}
          style={{ color: location.pathname === '/student/settings' ? '#007bff' : darkMode ? '#bbb' : '#333' }}
        />
        <p
          style={{
            fontSize: '12px',
            marginTop: '3px',
            color: location.pathname === '/student/settings' ? '#007bff' : darkMode ? '#bbb' : '#333',
          }}
        >
          Settings
        </p>
      </NavLink>
    </nav>
  );
};

export default BottomNav;