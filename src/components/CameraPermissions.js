import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const CameraPermissions = () => {
  const navigate = useNavigate();
  const [cameraPermission, setCameraPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("prompt"); // "granted", "denied", "prompt"

  // Detect screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check current camera permission status
  useEffect(() => {
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "camera" }).then((result) => {
        setPermissionStatus(result.state);
        setCameraPermission(result.state === "granted");

        result.onchange = () => {
          setPermissionStatus(result.state);
          setCameraPermission(result.state === "granted");
        };
      });
    }
  }, []);

  const toggleCameraPermission = async () => {
    if (cameraPermission) {
      // User wants to turn OFF camera access
      localStorage.setItem("cameraPermission", "false");
      setCameraPermission(false);
    } else {
      // User wants to turn ON camera - Request camera access again
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (stream) {
          localStorage.setItem("cameraPermission", "true");
          setCameraPermission(true);
          setPermissionStatus("granted");
          stream.getTracks().forEach((track) => track.stop()); // Stop camera after granting permission
        }
      } catch (error) {
        console.error("Camera access denied:", error);
        alert("Camera permission denied. Enable in browser settings.");
        setPermissionStatus("denied");
      }
    }
  };

  return (
    <div className="app-container" style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header Section - Keep Yellow Always */}
      <div
        style={{
          backgroundColor: "#FFD700",
          padding: "85px 20px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px" }}>Camera</h2>
        <p style={{ margin: 0, fontSize: "14px" }}>Manage camera access</p>
      </div>

      {/* Camera Permission Box */}
      <div style={{ marginTop: "-66px", padding: "20px" }}>
        <div
          className="settings-box"
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #ddd",
          }}
        >
          <h4
            style={{
              margin: "0 0 10px 0",
              fontSize: "14px",
              color: "#888",
              paddingBottom: "10px",
              borderBottom: "1px solid #eee",
            }}
          >
            Camera Access
          </h4>

          <div className="settings-option" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0" }}>
            <span style={{ fontSize: "16px", fontWeight: "500", color: "#000" }}>Camera Permission</span>
            <label className="switch">
              <input type="checkbox" checked={cameraPermission} onChange={toggleCameraPermission} />
              <span className="slider"></span>
            </label>
          </div>

          {/* Show current permission status */}
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: permissionStatus === "granted" ? "green" : permissionStatus === "denied" ? "red" : "gray",
            }}
          >
            {permissionStatus === "granted" && "✔ Camera Access Granted"}
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
          color: "#000",
        }}
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft style={{ marginRight: "5px" }} />
        <span>Back</span>
      </div>
    </div>
  );
};

export default CameraPermissions;
