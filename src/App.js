import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import PWAWelcomeLogin from "./components/PWAWelcomeLogin";
import Dashboard from "./components/Dashboard";
import StudentDashboard from "./components/StudentDashboard";
import Appearance from "./components/Appearance";
import Settings from "./components/Settings";
import BottomNav from "./components/BottomNav";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css"; // Import global styles
import ScanQR from "./components/Scan";
import MobileDashboard from "./components/MobileDashboard";
import History from "./components/History";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./components/ForgotPassword";
import AccountSettings from "./components/AccountSettings";
import ChangePassword from "./components/ChangePassword";
import Location from "./components/Location";
import CameraPermissions from "./components/CameraPermissions";

const App = () => {
  // Load dark mode preference from localStorage
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Load location permission from localStorage
  const [locationEnabled, setLocationEnabled] = useState(
    localStorage.getItem("locationPermission") === "enabled"
  );

  // Load camera permission from localStorage
  const [cameraPermission, setCameraPermission] = useState(
    localStorage.getItem("cameraPermission") === "enabled"
  );

  
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

  return (
    <Router>
      <div className={`app-root ${darkMode ? "dark-theme" : "light-theme"}`}>
        <AppContent 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          locationEnabled={locationEnabled} 
          setLocationEnabled={setLocationEnabled} 
          cameraPermission = {cameraPermission}
          setCameraPermission = {setCameraPermission}
        />
      </div>
    </Router>
  );
};

const AppContent = ({ darkMode, setDarkMode, locationEnabled, setLocationEnabled, cameraPermission, setCameraPermission }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Check if screen width is for mobile
  const shouldShowBottomNav = location.pathname !== "/" && isMobile;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`app-container ${darkMode ? "dark-theme" : "light-theme"}`}
      // prevent overscroll behavior
      style={{
        height: "100vh",
        overflowY: "auto",
        overscrollBehavior: "contain",
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: "0px",
        }}
      >
        <Routes>
          <Route path="/" element={<PWAWelcomeLogin />} />

          {/* Desktop Routes */}
          {!isMobile && (
            <>
              <Route
                path="/student/*"
                element={<StudentDashboard darkMode={darkMode} />}
              />
              <Route
                path="/dashboard"
                element={<StudentDashboard darkMode={darkMode} />}
              />
              {/* <Route path="/student/settings" element={<Settings darkMode={darkMode} />} /> */}
            </>
          )}

          {/* Mobile Routes */}
          {isMobile && (
            <>
              <Route
                path="/student/dashboard"
                element={<MobileDashboard darkMode={darkMode} />}
              />
              <Route
                path="/student/attendance"
                element={<ScanQR darkMode={darkMode} />}
              />
              <Route
                path="/student/history"
                element={<History darkMode={darkMode} />}
              />
              <Route
                path="/student/settings"
                element={<Settings darkMode={darkMode} />}
              />
            </>
          )}

          {/* Shared Routes */}
          <Route
            path="/appearance"
            element={
              <Appearance darkMode={darkMode} setDarkMode={setDarkMode} />
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* ✅ Location Route (Fix) */}
          <Route 
            path="/location" 
            element={
              <Location 
                locationEnabled={locationEnabled} 
                setLocationEnabled={setLocationEnabled} 
              />
            } 
          />

          {/* ✅ Camera Route (Fix) */}
          <Route 
            path="/camerapermissions" 
            element={
              <CameraPermissions 
                cameraPermission={cameraPermission} 
                setCameraPermission={setCameraPermission} 
              />
            } 
          />
        </Routes>
      </div>

      {/* Conditionally render BottomNav */}
      {shouldShowBottomNav && <BottomNav />}
    </div>
  );
};

export default App;
