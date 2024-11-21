import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';
import { FaHome, FaQrcode, FaBook, FaUserCircle, FaHistory, FaCog } from 'react-icons/fa';
import axios from 'axios';
import Dashboard from './Dashboard';
import Courses from './Courses';
import Scan from './Scan';
import History from './History';
import Settings from './Settings';

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false); // Track if initial redirection is done
  const navigate = useNavigate();

  // Detect device type based on screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Mobile devices: width <= 768px
    };

    // Initial check and event listener for window resize
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup on component unmount
    };
  }, []);

  // Redirect to appropriate page on initial load
  useEffect(() => {
    if (!hasRedirected) {
      if (isMobile) {
        navigate('attendance'); // Redirect to Attendance page for mobile devices
      } else {
        navigate('dashboard'); // Redirect to Dashboard page for PC
      }
      setHasRedirected(true); // Ensure redirection happens only once
    }
  }, [isMobile, hasRedirected, navigate]);

  // Fetch Student Name from API
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api-auth/v1/me/`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the header
          },
        });
        setStudentName(response.data.name); // Assuming the API response has a `name` field
      } catch (error) {
        console.error('Error fetching student data:', error);
        setStudentName('Student'); // Fallback name
      }
    };

    fetchStudentData();
  }, []);

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('authToken'); // Clear token
    navigate('/'); // Redirect to login page
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="attendance" element={<Scan />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '10px 0',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #ddd',
        }}>
          <NavLink
            to="attendance"
            style={({ isActive }) => ({
              textAlign: 'center',
              color: isActive ? '#007bff' : '#333',
              textDecoration: 'none',
            })}
          >
            <FaQrcode size={24} />
            <p style={{ fontSize: '12px', marginTop: '5px' }}>Attendance</p>
          </NavLink>
          <NavLink
            to="history"
            style={({ isActive }) => ({
              textAlign: 'center',
              color: isActive ? '#007bff' : '#333',
              textDecoration: 'none',
            })}
          >
            <FaHistory size={24} />
            <p style={{ fontSize: '12px', marginTop: '5px' }}>History</p>
          </NavLink>
          <NavLink
            to="settings"
            style={({ isActive }) => ({
              textAlign: 'center',
              color: isActive ? '#007bff' : '#333',
              textDecoration: 'none',
            })}
          >
            <FaCog size={24} />
            <p style={{ fontSize: '12px', marginTop: '5px' }}>Settings</p>
          </NavLink>
        </nav>
      </div>
    );
  }

  // PC Layout
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
            <span style={{ fontSize: '16px', color: '#333' }}>{studentName || 'Student'}</span>
          </div>
        </div>
      </nav>

      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="scan" element={<Scan />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;
