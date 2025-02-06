import React from 'react';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaMapMarkerAlt, FaCameraRetro } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';

const Settings = () => {
  return (
    <div
      style={{
        backgroundColor: '#f5f5f5', // Grey background
        minHeight: '100vh', // Ensure it covers the full screen height
        overflowY: 'auto', // Enable scrolling for long content
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          backgroundColor: '#FFD700', // Yellow header
          padding: '85px 20px',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '24px' }}>Settings</h2>
        <p style={{ margin: 0, fontSize: '14px' }}>Account Information</p>
      </div>

      {/* Merged Settings Section */}
      <div style={{ marginTop: '-66px', padding: '20px' }}>
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '20px',
          }}
        >
          {/* Login and Security Header */}
          <h4
            style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#888',
              paddingBottom: '10px',
              borderBottom: '1px solid #eee',
            }}
          >
            Login and security
          </h4>
          {/* Username */}
          <Option icon={<FaUser />} label="Username" />
          {/* Phone Number */}
          <Option icon={<FaPhone />} label="Phone Number" />
          {/* Email */}
          <Option icon={<FaEnvelope />} label="Email" />
          {/* Password */}
          <Option icon={<FaLock />} label="Password" />

          {/* Add Spacing Between Sections */}
          <div style={{ marginTop: '30px' }}></div>

          {/* Data and Permissions Header */}
          <h4
            style={{
              margin: '0 0 10px 0',
              fontSize: '14px',
              color: '#888',
              paddingBottom: '10px',
              borderBottom: '1px solid #eee',
            }}
          >
            Data and permissions
          </h4>
          {/* Location */}
          <Option icon={<FaMapMarkerAlt />} label="Location" />
          {/* Camera */}
          <Option icon={<FaCameraRetro />} label="Camera" />
        </div>
      </div>

      {/* Deactivate Section */}
      <div style={{ marginTop: '20px', padding: '20px' }}>
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease', // Animation
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9'; // Hover background
            e.currentTarget.style.transform = 'scale(1.02)'; // Slight scale-up
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff'; // Reset background
            e.currentTarget.style.transform = 'scale(1)'; // Reset scale
          }}
          onClick={() => alert('Logout or deactivate account')}
        >
          <div style={{ marginRight: '15px', color: 'red', fontSize: '18px' }}>
            <BiLogOut />
          </div>
          <div
            style={{
              flex: 1,
              fontSize: '16px',
              color: 'red',
              fontWeight: '500',
            }}
          >
            Logout
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Option Component
 * @param {Object} props
 */
const Option = ({ icon, label }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '15px 0',
      cursor: 'pointer',
      borderBottom: '1px solid #f0f0f0', // Add bottom border to separate items
      transition: 'background-color 0.3s ease, transform 0.2s ease', // Animation
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#f9f9f9'; // Hover background
      e.currentTarget.style.transform = 'scale(1.02)'; // Slight scale-up
      e.currentTarget.querySelector('.icon').style.transform = 'scale(1.1)'; // Scale icon
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent'; // Reset background
      e.currentTarget.style.transform = 'scale(1)'; // Reset scale
      e.currentTarget.querySelector('.icon').style.transform = 'scale(1)'; // Reset icon
    }}
    onClick={() => alert(`${label} settings`)}
  >
    <div
      className="icon"
      style={{
        marginRight: '15px',
        color: '#FFD700',
        fontSize: '18px',
        transition: 'transform 0.2s ease', // Smooth scaling
      }}
    >
      {icon}
    </div>
    <div
      style={{
        flex: 1,
        fontSize: '16px',
        color: '#333',
        fontWeight: '500', // Make text slightly thicker
      }}
    >
      {label}
    </div>
    {/* Larger arrow */}
    <div
      style={{
        color: '#888',
        fontSize: '40px', // Increase font size for the arrow only
        transition: 'transform 0.2s ease', // Smooth scaling for arrow
      }}
    >
      ›
    </div>
  </div>
);


export default Settings;
