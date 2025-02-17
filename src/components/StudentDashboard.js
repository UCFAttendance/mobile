import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import { FaHome, FaQrcode, FaBook, FaUserCircle, FaHistory, FaCog } from 'react-icons/fa';
import Dashboard from './Dashboard';
import Courses from './Courses';
import Scan from './Scan';
import ScanQR from './ScanQR';
import History from './History';
import Settings from './Settings';
import MobileDashboard from './MobileDashboard'; // Import the new MobileDashboard component

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('Student'); // Default fallback
  const [isMobile, setIsMobile] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

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

  // Redirect to appropriate page on initial load
  useEffect(() => {
    if (!hasRedirected) {
      if (isMobile) {
        navigate('attendance'); // Mobile default
      } else {
        navigate('dashboard');  // Desktop default
      }
      setHasRedirected(true);
    }
  }, [isMobile, hasRedirected, navigate]);

  // Retrieve Student Info from Local Storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setStudentName(user.name || 'Student'); // Set the student's name if available
      } catch (error) {
        console.error('Error parsing student data:', error);
      }
    }
  }, []);

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderScanComponent = <ScanQR />;

  // ---------- MOBILE LAYOUT ----------
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Routes>
            <Route path="dashboard" element={<MobileDashboard />} />
            <Route path="attendance" element={<Scan />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
        <nav style={{
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '5px 0', // Increased padding to maintain navbar position
  backgroundColor: '#ffffff',
  borderTop: '2px solid #E0E0E0',
}}>
  <NavLink to="dashboard" style={({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: isActive ? '#007bff' : '#333',
    textDecoration: 'none',
    paddingTop: '3px', // Moves content down without shifting navbar
  })}>
    <FaHome size={24} />
    <p style={{ fontSize: '12px', marginTop: '2px',  marginBottom: '7px' }}>Dashboard</p>
  </NavLink>

  <NavLink to="attendance" style={({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: isActive ? '#007bff' : '#333',
    textDecoration: 'none',
    paddingTop: '3px', // Moves content down without shifting navbar
  })}>
    <FaQrcode size={24} />
    <p style={{ fontSize: '12px', marginTop: '3px',  marginBottom: '7px' }}>Attendance</p>
  </NavLink>

  <NavLink to="history" style={({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: isActive ? '#007bff' : '#333',
    textDecoration: 'none',
    paddingTop: '3px', // Moves content down without shifting navbar
  })}>
    <FaHistory size={24} />
    <p style={{ fontSize: '12px', marginTop: '3px',  marginBottom: '7px' }}>History</p>
  </NavLink>

  {/* <NavLink to="settings" style={({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: isActive ? '#007bff' : '#333',
    textDecoration: 'none',
    paddingTop: '3px', // Moves content down without shifting navbar
  })}>
    <FaCog size={24} />
    <p style={{ fontSize: '12px', marginTop: '3px',  marginBottom: '7px'}}>Settings</p>
  </NavLink> */}
</nav>
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
          {/* Team Logo */}
          <div style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
          }}>
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
              <NavLink
                to="dashboard"
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive ? '#007bff' : '#333',
                  backgroundColor: isActive ? '#dee2e6' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  borderRadius: '5px',
                })}
              >
                <FaHome style={{ marginRight: '10px', fontSize: '18px' }} />
                Dashboard
              </NavLink>
            </li>

            {/* Scan Entry */}
            <li style={{ marginBottom: '15px' }}>
              <NavLink
                to="scan"
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive ? '#007bff' : '#333',
                  backgroundColor: isActive ? '#dee2e6' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  borderRadius: '5px',
                })}
              >
                <FaQrcode style={{ marginRight: '10px', fontSize: '18px' }} />
                Scan
              </NavLink>
            </li>

            {/* Courses Entry */}
            <li>
              <NavLink
                to="courses"
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive ? '#007bff' : '#333',
                  backgroundColor: isActive ? '#dee2e6' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  borderRadius: '5px',
                })}
              >
                <FaBook style={{ marginRight: '10px', fontSize: '18px' }} />
                Courses
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Bottom Section: Sign Out */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={handleSignOut}
          >
            <FaUserCircle style={{ fontSize: '24px', marginRight: '10px' }} />
            <span style={{ fontSize: '16px', color: '#333' }}>
              {studentName || 'Student'}
            </span>
          </div>
        </div>
      </nav>

      {/* Desktop Main Content Area */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="scan" element={renderScanComponent} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
