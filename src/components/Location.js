import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Location = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("prompt"); // "granted", "denied", or "prompt"
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check browser permission status
  useEffect(() => {
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionStatus(result.state);
        setLocationEnabled(result.state === "granted");

        result.onchange = () => {
          setPermissionStatus(result.state);
          setLocationEnabled(result.state === "granted");
        };
      });
    }

    // Detect dark mode preference
    setIsDarkMode(localStorage.getItem("theme") === "dark");
  }, []);

  const toggleLocationPermission = () => {
    if (locationEnabled) {
      localStorage.setItem("locationPermission", "false");
      setLocationEnabled(false);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem("locationPermission", "true");
          setLocationEnabled(true);
          setPermissionStatus("granted");
        },
        (error) => {
          alert("Location permission denied. Enable GPS in browser settings.");
          setPermissionStatus("denied");
        }
      );
    }
  };

  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#141414" : "#f5f5f5",
      }}
    >
      {/* Header Section - Always Yellow */}
      <div
        style={{
          backgroundColor: "#FFD700",
          padding: "85px 20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>Location</h2>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>Manage location access</p>
      </div>

      {/* Location Permission Box */}
      <div style={{ marginTop: "-66px", padding: "20px" }}>
        <div
          className="settings-box"
          style={{
            backgroundColor: isDarkMode ? "#333 !important" : "#fff",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: isDarkMode
              ? "0 4px 6px rgba(255, 255, 255, 0.1)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: isDarkMode ? "none" : "1px solid #ddd",
          }}
        >
          <h4
            style={{
              margin: "0 0 10px 0",
              fontSize: "14px",
              color: isDarkMode ? "#bbb" : "#888",
              paddingBottom: "10px",
              borderBottom: isDarkMode ? "1px solid #444" : "1px solid #eee",
            }}
          >
            Location Services
          </h4>

          <div className="settings-option" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0" }}>
            <span
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            >
              Location Permission
            </span>
            <label className="switch">
              <input type="checkbox" checked={locationEnabled} onChange={toggleLocationPermission} />
              <span className="slider"></span>
            </label>
          </div>

          {/* Show the current permission status */}
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color:
                permissionStatus === "granted"
                  ? "green"
                  : permissionStatus === "denied"
                  ? "red"
                  : "gray",
            }}
          >
            {permissionStatus === "granted" && "✔ Location Access Granted"}
            {permissionStatus === "denied" && "❌ Permission Denied. Enable in browser settings."}
            {permissionStatus === "prompt" && "⚠ Permission Required"}
          </p>
        </div>
      </div>

      {/* Back to Settings Button */}
      <div
        style={{
          position: "absolute",
          left: "20px",
          top: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#fff",
          fontWeight: "bold"
        }}
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft style={{ marginRight: "5px" }} />
        <span>Back</span>
      </div>
    </div>
  );
};

export default Location;
