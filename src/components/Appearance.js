import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Appearance = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Apply dark mode globally when the user selects it
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);


  // Detect if it's a mobile device
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`} style={{ minHeight: '100vh' }}>
      {/* Header Section - Keep Yellow Always */}
      <div style={{ backgroundColor: '#FFD700', padding: '85px 20px', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Appearance</h2>
        <p style={{ margin: 0, fontSize: '14px' }}>Customize the theme</p>
      </div>

      {/* Theme Selection Box */}
      <div style={{ marginTop: '-66px', padding: '20px' }}>
        <div
          className="theme-box"
          style={{
            backgroundColor: darkMode ? '#333' : '#fff', // Match the light theme when not in dark mode
            borderRadius: '10px',
            padding: '20px',
            boxShadow: darkMode ? '0 4px 6px rgba(255, 255, 255, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: darkMode ? 'none' : '1px solid #ddd', // Add a light border in light mode
          }}
        >
          <h4
            style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: darkMode ? '#bbb' : '#888',
              paddingBottom: '10px',
              borderBottom: darkMode ? '1px solid #444' : '1px solid #eee',
            }}
          >
            Theme
          </h4>
          
          {/* Add Spacing Between Sections */}
          <div style={{ marginTop: '30px' }}></div>
          
          <div className="theme-option">
            <span style={{ color: darkMode ? '#fff' : '#000',  fontSize: '16px', fontWeight: '500',}}>Dark Mode</span>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="slider"></span>
            </label>
          </div>
          
          <div
            style={{
              paddingBottom: '10px',
              borderBottom: darkMode ? '1px solid #444' : '1px solid #eee',
            }}
          ></div>
        </div>
      </div>

      {/* Back to Settings Button */}
      <div style={{ textAlign: 'center', marginTop: '20px', padding: '0 20px' }}>
        <div
            style={{
            backgroundColor: darkMode ? '#333' : '#fff',
            borderRadius: '15px', // Rounded corners
            padding: '15px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            color: darkMode ? '#fff' : '#000',
            boxShadow: darkMode ? '0 4px 6px rgba(255, 255, 255, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.1)',  // box shadow effect
            border: darkMode ? 'none' : '1px solid #ddd',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
            e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.transform = 'scale(1)';
            }}
            onClick={() => navigate(isMobile ? '/student/settings' : '/settings')} className="settings-button">
            Back to Settings
        </div>
      </div>

    </div>
  );
};

export default Appearance;
