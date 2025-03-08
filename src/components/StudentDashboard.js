import React, { useState, useEffect } from "react";
import { NavLink, Routes, Route, useNavigate, Outlet } from "react-router-dom";
import { FaHome, FaQrcode, FaBook, FaUserCircle, FaHistory, FaCog } from "react-icons/fa";
import Dashboard from "./Dashboard";
import Courses from "./Courses";
import Scan from "./Scan";
import ScanQR from "./ScanQR";
import History from "./History";
import Settings from "./Settings";
import MobileDashboard from "./MobileDashboard";
import BottomNav from "./BottomNav";
import Appearance from "./Appearance";
import AccountSettings from "./AccountSettings";
import ChangePassword from "./ChangePassword";
import ForgotPassword from "./ForgotPassword";
import Location from "./Location";
import CameraPermissions from "./CameraPermissions";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState("Student");
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
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!hasRedirected) {
      if (window.location.pathname === "/student" || window.location.pathname === "/student/") {
        if (isMobile) {
          navigate("/student/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      }
      setHasRedirected(true);
    }
  }, [isMobile, hasRedirected, navigate]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setStudentName(user.name || "Student");
      } catch (error) {
        console.error("Error parsing student data:", error);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  // ---------- MOBILE LAYOUT ----------
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-16">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="scan" element={<ScanQR />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ---------- DESKTOP LAYOUT ----------
  return (
    <div className="flex h-screen">
      <nav className="w-[250px] bg-gray-100 border-r border-gray-200 p-5 flex flex-col justify-between">
        {/* Top Section */}
        <div>
          <div className="mb-5 flex items-center">
            <img
              src="/images/team-logo.png"
              alt="Team Logo"
              className="w-[50px] h-auto rounded-md mr-3"
            />
          </div>

          {/* Sidebar Links */}
          <ul className="list-none p-0">
            {/* Dashboard Entry */}
            <li className="mb-4">
              <NavLink
                to="/student/dashboard"
                className={({ isActive }) =>
                  `no-underline flex items-center p-2 rounded-md ${
                    isActive ? "text-blue-700 bg-gray-200" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                <FaHome className="mr-2 text-lg" />
                Dashboard
              </NavLink>
            </li>

            {/* Scan Entry */}
            <li className="mb-4">
              <NavLink
                to="/student/scan"
                className={({ isActive }) =>
                  `no-underline flex items-center p-2 rounded-md ${
                    isActive ? "text-blue-700 bg-gray-200" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                <FaQrcode className="mr-2 text-lg" />
                Scan
              </NavLink>
            </li>

            {/* Courses Entry */}
            <li className="mb-4">
              <NavLink
                to="/student/courses"
                className={({ isActive }) =>
                  `no-underline flex items-center p-2 rounded-md ${
                    isActive ? "text-blue-700 bg-gray-200" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                <FaHistory className="mr-2 text-lg" />
                History
              </NavLink>
            </li>

            {/* Settings Page */}
            <li className="mb-4">
              <NavLink
                to="/student/settings"
                className={({ isActive }) =>
                  `no-underline flex items-center p-2 rounded-md ${
                    isActive ? "text-blue-700 bg-gray-200" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                <FaCog className="mr-2 text-lg" />
                Settings
              </NavLink>
            </li>
          </ul>
        </div>

        <div
          onClick={handleSignOut}
          className="flex items-center p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
        >
          <FaUserCircle className="text-2xl mr-2" />
          <span className="text-base text-gray-700">{studentName}</span>
        </div>
      </nav>

      {/* Desktop Main Content Area */}
      <div className="flex-1 overflow-y-auto">
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