import React, { useState, useEffect } from "react";
import axios from "axios";

const CourseWidget = ({ course, attendanceRecords, index, isDarkMode }) => {
  const headerColors = ["#3dc1d3", "#ff6b6b", "#ffc904"];
  const backgroundColor = headerColors[index % 3];
  const textColor = backgroundColor;

  const calculateAverageGrade = (records) => {
    if (!records || records.length === 0) return "N/A";
    const validRecords = records.filter((record) => record.status !== "Processing");
    if (validRecords.length === 0) return "N/A";
    const totalScore = validRecords.reduce((sum, record) => sum + (record.status === "Success" ? 100 : 0), 0);
    const average = totalScore / validRecords.length;
    return Number.isInteger(average) ? `${average}%` : `${average.toFixed(2)}%`;
  };

  const percentage = calculateAverageGrade(attendanceRecords);

  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${isDarkMode ? "bg-[#333]" : "bg-white"}`}>
      {/* Header */}
      <div
        style={{ backgroundColor }}
        className="h-[60px] flex items-center justify-between px-4 relative"
      >
        {percentage !== "N/A" && (
          <div
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full px-2 py-0.5"
            style={{ color: textColor }}
          >
            <span className="text-sm font-medium">{percentage}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="h-[60px] flex items-center justify-between px-4">
        <span className="font-semibold text-lg" style={{ color: textColor }}>
          {course.name}
        </span>
      </div>
    </div>
  );
};

const History = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");

    // Retrieve user's name
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "Student");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

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
            window.location.reload();
            return;
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

  const calculateOverallAttendance = () => {
    const allRecords = attendanceRecords;
    const validRecords = allRecords.filter((record) => record.status !== "Processing");

    if (validRecords.length === 0) return "N/A";

    const totalScore = validRecords.reduce(
      (sum, record) => sum + (record.status === "Success" ? 100 : 0),
      0
    );
    const average = totalScore / validRecords.length;

    return Number.isInteger(average) ? `${average}%` : `${average.toFixed(2)}%`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

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
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-[#141414] text-white" : "bg-gray-50 text-gray-900"
      } flex flex-col`}
    >
      {/* Header Section - Using MobileDashboard's header component */}
      <div
        className="bg-yellow-400 h-[60px] flex items-center justify-between w-full sticky top-0 z-50 border-b-2 border-gray-300"
        style={{
          borderBottomColor: isDarkMode ? "#333" : "#ddd",
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
          <p className="text-center text-gray-600">
            No attendance records found.
          </p>
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
                  <p
                    className={`${
                      isDarkMode ? "font-bold text-gray-200" : "font-bold text-gray-800"
                    }`}
                  >
                    {`${record.courseName}`}
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {`${record.date}, ${record.time}`}
                  </p>
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
    </div>
  );
};

export default History;
