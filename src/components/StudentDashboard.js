import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import { FaHome, FaQrcode, FaBook, FaUserCircle, FaHistory, FaCog } from 'react-icons/fa';
import Dashboard from './Dashboard';
import Courses from './Courses';
import Scan from './Scan';
import ScanQR from './ScanQR';
import History from './History';
import Settings from './Settings';
import MobileDashboard from './MobileDashboard';
import BottomNav from './BottomNav';
import Appearance from "./Appearance";
import AccountSettings from "./AccountSettings";
import ChangePassword from "./ChangePassword";
import ForgotPassword from "./ForgotPassword";
import Location from "./Location";
import CameraPermissions from "./CameraPermissions";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('Student');
  const [isMobile, setIsMobile] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
 // Manage dark mode state here so it can be passed down
 const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  
 useEffect(() => {
   if (darkMode) {
     document.documentElement.classList.add("dark-theme");
     document.body.classList.add("dark-theme");
   } else {
     document.documentElement.classList.remove("dark-theme");
     document.body.classList.remove("dark-theme");
   }
   localStorage.setItem("theme", darkMode ? "dark" : "light");
 }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!hasRedirected) {
      if (window.location.pathname === '/student' || window.location.pathname === '/student/') {
        if (isMobile) {
          navigate('/student/dashboard'); // Instead of '/student/attendance'
        } else {
          navigate('/student/dashboard');
        }
      }
      setHasRedirected(true);
    }
  }, [isMobile, hasRedirected, navigate]);
  
  

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setStudentName(user.name || 'Student');
      } catch (error) {
        console.error('Error parsing student data:', error);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  // ---------- MOBILE LAYOUT ----------
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '60px' }}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="scan" element={<ScanQR />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
        <BottomNav /> {/* Ensure BottomNav is only shown on mobile */}
      </div>
    );
  }
  

  // ---------- DESKTOP LAYOUT ----------
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <nav style={{
        width: '250px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #ddd',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {/* Top Section */}
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <img 
              src="/images/team-logo.png" 
              alt="Team Logo" 
              style={{
                width: '50px',
                height: 'auto',
                borderRadius: '5px',
                marginRight: '10px',
              }} 
            />
          </div>

          {/* Sidebar Links */}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {/* Dashboard Entry */}
            <li style={{ marginBottom: '15px' }}>
              <NavLink to="/student/dashboard" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#007bff' : '#333',
                backgroundColor: isActive ? '#dee2e6' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '5px',
              })}>
                <FaHome style={{ marginRight: '10px', fontSize: '18px' }} />
                Dashboard
              </NavLink>
            </li>

            {/* Scan Entry */}
            <li style={{ marginBottom: '15px' }}>
              <NavLink to="/student/scan" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#007bff' : '#333',
                backgroundColor: isActive ? '#dee2e6' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '5px',
              })}>
                <FaQrcode style={{ marginRight: '10px', fontSize: '18px' }} />
                Scan
              </NavLink>
            </li>

            {/* Courses Entry */}
            <li style={{ marginBottom: '15px' }}>
              <NavLink to="/student/courses" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#007bff' : '#333',
                backgroundColor: isActive ? '#dee2e6' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '5px',
              })}>
                <FaBook style={{ marginRight: '10px', fontSize: '18px' }} />
                History
              </NavLink>
            </li>

            {/* Settings Page */}
            <li style={{ marginBottom: '15px' }}>
              <NavLink to="/student/settings" style={({ isActive }) => ({
                textDecoration: 'none',
                color: isActive ? '#007bff' : '#333',
                backgroundColor: isActive ? '#dee2e6' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderRadius: '5px',
              })}>
                <FaCog style={{ marginRight: '10px', fontSize: '18px' }} />
                Settings
              </NavLink>
            </li>
          </ul>
        </div>

        <div onClick={handleSignOut} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          cursor: 'pointer',
        }}>
          <FaUserCircle style={{ fontSize: '24px', marginRight: '10px' }} />
          <span style={{ fontSize: '16px', color: '#333' }}>{studentName}</span>
        </div>
      </nav>

      {/* Desktop Main Content Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="scan" element={<ScanQR />} />
          
          {/* Settings Route Wrapping All Settings Subpages */}
        <Route path="settings/*" element={<SettingsLayout darkMode={darkMode} setDarkMode={setDarkMode} />}>
          <Route index element={<Settings />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="account-settings" element={<AccountSettings />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="location" element={<Location />} />
            <Route path="camerapermissions" element={<CameraPermissions />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

// Settings Layout Wrapper (Keeps Sidebar Visible)
const SettingsLayout = ({ darkMode, setDarkMode }) => {
  return (
    <div style={{ width: '100%' }}>
      <Outlet context={{ darkMode, setDarkMode }} /> {/* This will render the active settings page (Appearance, Account, etc.) */}
    </div>
  );
};

export default StudentDashboard;
