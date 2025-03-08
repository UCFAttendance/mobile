import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaCameraRetro,
  FaEye,
} from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";

const Settings = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setDarkMode(theme === "dark");
  }, []);

  // Logout function
  const handleLogout = () => {
    // Remove authentication details
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Redirect user to login page
    navigate("/");
  };

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#000" : "#f5f5f5",
        minHeight: "100vh",
        overflowY: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          backgroundColor: "#FFC904", // Yellow header
          padding: "85px 20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px" }}>Settings</h2>
        <p style={{ margin: 0, fontSize: "14px" }}>Account Information</p>
      </div>

      {/* Merged Settings Section */}
      <div style={{ marginTop: "-66px", padding: "20px" }}>
        <div
          style={{
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            borderRadius: "10px",
            boxShadow: darkMode
              ? "0 4px 6px rgba(255, 255, 255, 0.1)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "20px",
          }}
        >
          {/* Data and Permissions Header */}
          <h4
            style={{
              margin: "0 0 10px 0",
              fontSize: "14px",
              color: darkMode ? "#bbb" : "#888",
              paddingBottom: "10px",
              borderBottom: darkMode ? "1px solid #444" : "1px solid #eee",
            }}
          >
            Data and permissions
          </h4>
          <Option
            icon={<FaMapMarkerAlt />}
            label="Location"
            onClick={() => navigate("/location")}
            darkMode={darkMode}
          />
          <Option 
            icon={<FaCameraRetro />} 
            label="Camera" 
            onClick={() => navigate("/camerapermissions")}
            darkMode={darkMode} />
          <Option
            icon={<FaEye />}
            label="Appearance"
            onClick={() => navigate("/appearance")}
            darkMode={darkMode}
          />

          {/* Add Spacing Between Sections */}
          <div style={{ marginTop: "30px" }}></div>

          {/* Login and security Header */}
          <h4
            style={{
              margin: "0 0 10px 0",
              fontSize: "14px",
              color: darkMode ? "#bbb" : "#888",
              paddingBottom: "10px",
              borderBottom: darkMode ? "1px solid #444" : "1px solid #eee",
            }}
          >
            Login and security
          </h4>
          <Option
            icon={<FaUser />}
            label="Account Settings"
            darkMode={darkMode}
            onClick={() => navigate("/account-settings")}
          />
          <Option
            icon={<FaLock />}
            label="Change Password"
            darkMode={darkMode}
            onClick={() => navigate("/change-password")}
          />
        </div>
      </div>

      {/* Logout Section */}
      <div style={{ marginTop: "20px", padding: "20px" }}>
        <div
          style={{
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            borderRadius: "10px",
            boxShadow: darkMode
              ? "0 4px 6px rgba(255, 255, 255, 0.1)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            transition: "background-color 0.3s ease, transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkMode
              ? "#222"
              : "#f9f9f9";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = darkMode
              ? "#1e1e1e"
              : "#fff";
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={handleLogout} // Call logout function
        >
          <div style={{ marginRight: "15px", color: "red", fontSize: "18px" }}>
            <BiLogOut />
          </div>
          <div
            style={{
              flex: 1,
              fontSize: "16px",
              color: "red",
              fontWeight: "500",
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
 * Option Component - Updated to Accept `onClick`
 * @param {Object} props
 */
const Option = ({ icon, label, onClick, darkMode }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "15px 0",
      cursor: "pointer",
      borderBottom: darkMode ? "1px solid #444" : "1px solid #f0f0f0",
      transition: "background-color 0.3s ease, transform 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = darkMode ? "#222" : "#f9f9f9";
      e.currentTarget.style.transform = "scale(1.02)";
      e.currentTarget.querySelector(".icon").style.transform = "scale(1.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.querySelector(".icon").style.transform = "scale(1)";
    }}
    onClick={onClick} // Handle Clicks Properly
  >
    <div
      className="icon"
      style={{
        marginRight: "15px",
        color: "#FFD700",
        fontSize: "18px",
        transition: "transform 0.2s ease",
      }}
    >
      {icon}
    </div>
    <div
      style={{
        flex: 1,
        fontSize: "16px",
        color: darkMode ? "#fff" : "#333",
        fontWeight: "500",
      }}
    >
      {label}
    </div>
    <div
      style={{
        color: darkMode ? "#bbb" : "#888",
        fontSize: "40px",
        transition: "transform 0.2s ease",
      }}
    >
      ›
    </div>
  </div>
);

export default Settings;
