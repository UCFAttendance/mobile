import React, { useState, useEffect } from "react";
import axios from "axios";

const History = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");

    const fetchAttendanceData = async () => {
      try {
        let token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found.");

        const instance = axios.create({
          baseURL: process.env.REACT_APP_BASE_URL,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const response = await instance.get("/api/v1/attendance/");
        const attendanceData = response.data;

        const sortedRecords = attendanceData
          .map((entry) => ({
            courseName: entry.session_id.course_id.name,
            date: new Date(entry.created_at).toLocaleDateString(),
            time: new Date(entry.created_at).toLocaleTimeString(),
            status:
              entry.is_present === true
                ? "Success"
                : entry.face_recognition_status === "PENDING"
                ? "Processing"
                : "Failed",
            createdAt: new Date(entry.created_at),
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

        setAttendanceRecords(sortedRecords);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            setError("Authentication failed. Please log in again.");
            setLoading(false);
            return;
          }

          try {
            const refreshResponse = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`,
              { refresh: refreshToken }
            );
            const newToken = refreshResponse.data.access;
            localStorage.setItem("accessToken", newToken);
            window.location.reload(); // Reload the page to fetch data with the new token
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            setError("Unable to refresh token. Please log in again.");
            setLoading(false);
          }
        } else {
          console.error("Error fetching attendance data:", err);
          setError("Unable to load attendance history.");
          setLoading(false);
        }
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
            isDarkMode ? "bg-[#141414] text-white" : "bg-gray-50 text-gray-900"
        } flex flex-col`}>
      
      {/* Header (without title) */}
      <div
        className="bg-yellow-400 h-[60px] flex items-center justify-between w-full p-2"
        style={{
          borderBottomColor: isDarkMode ? "#333" : "#ddd", // Dark mode border fix
        }}
      >
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          className="w-[60px] h-auto pl-2 rounded-md"
        />
      </div>

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">History</h1>


        {attendanceRecords.length === 0 ? (
          <p className="text-center text-gray-600">No attendance records found.</p>
        ) : (
          <div className="space-y-2">
            {attendanceRecords.map((record, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-2 bg-white rounded-lg shadow-md ${
                  isDarkMode ? "bg-[#333]" : "bg-white"
                }`}
              >
                <div>
                  <p className={`${isDarkMode ? "font-bold text-gray-200" : "font-bold text-gray-800"}`}>
                    {`${record.courseName}`}</p>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {`${record.date}, ${record.time}`}</p>
                </div>
                <span
                  className="px-2 py-1 rounded-full font-medium"
                  style={{
                    ...(record.status === "Success"
                      ? {
                          backgroundColor: "#D4EDDA",
                          color: "#155724",
                          border: "2px solid #4A9A6E",
                        }
                      : record.status === "Failed"
                      ? {
                          backgroundColor: "#F8D7DA",
                          color: "#721C24",
                          border: "2px solid #A84444",
                        }
                      : {
                          backgroundColor: "#FFF3CD",
                          color: "#856404",
                          border: "2px solid #A68A1A",
                        }),
                  }}
                >
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-200 p-2 flex justify-around">
        <a href="#" className="text-gray-700 text-center">
          <span className="block">Dashboard</span>
          <i className="fas fa-home"></i>
        </a>
        <a href="#" className="text-gray-700 text-center">
          <span className="block">Attendance</span>
          <i className="fas fa-qrcode"></i>
        </a>
        <a href="#" className="text-blue-600 text-center">
          <span className="block">History</span>
          <i className="fas fa-history"></i>
        </a>
        <a href="#" className="text-gray-700 text-center">
          <span className="block">Settings</span>
          <i className="fas fa-cog"></i>
        </a>
      </div>
    </div>
  );
};

export default History;