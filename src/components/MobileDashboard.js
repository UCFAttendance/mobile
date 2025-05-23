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
    const totalScore = validRecords.reduce(
      (sum, record) => sum + (record.status === "Success" ? 100 : 0),
      0
    );
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

const MobileDashboard = () => {
  const [userName, setUserName] = useState("Student");
  const [courses, setCourses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    // Detect theme preference from localStorage
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

    // Fetch attendance data
    const fetchAttendanceData = async () => {
      try {
        let token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found.");

        let response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Process attendance data
        const attendanceData = response.data;
        const uniqueCourses = {};
        const recordsByCourse = {};

        attendanceData.forEach((entry) => {
          const courseId = entry.session_id.course_id.id;
          const courseName = entry.session_id.course_id.name;

          if (!uniqueCourses[courseId]) {
            uniqueCourses[courseId] = { id: courseId, name: courseName };
            recordsByCourse[courseId] = [];
          }

          const createdAt = new Date(entry.created_at);
          recordsByCourse[courseId].push({
            date: createdAt.toLocaleDateString(),
            time: createdAt.toLocaleTimeString(),
            status:
              entry.is_present === true
                ? "Success"
                : entry.face_recognition_status === "PENDING"
                ? "Processing"
                : "Failed",
          });
        });

        setCourses(Object.values(uniqueCourses));
        setAttendanceRecords(recordsByCourse);
        setLoading(false);
      } catch (err) {
        // If a 401 error is received, attempt to refresh token and reload the page.
        if (err.response && err.response.status === 401) {
          console.error("Received 401 error, attempting token refresh...");
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token available.");

            const refreshResponse = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`,
              { refresh: refreshToken },
              { headers: { "Content-Type": "application/json" } }
            );

            if (!refreshResponse.data.access)
              throw new Error("Failed to refresh token.");

            const newToken = refreshResponse.data.access;
            localStorage.setItem("accessToken", newToken);

            // Reload the page after refreshing the token
            window.location.reload();
            return;
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            setError("Unable to load dashboard data.");
            setLoading(false);
          }
        } else {
          console.error("Error fetching attendance data:", err);
          setError("Unable to load dashboard data.");
          setLoading(false);
        }
      }
    };

    fetchAttendanceData();
  }, []);

  const calculateOverallAttendance = () => {
    const allRecords = Object.values(attendanceRecords).flat();
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
        <p className="text-gray-600">Loading dashboard data...</p>
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
      {/* Header Section */}
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
      <div className="p-6 flex-1 overflow-y-auto">
        {/* Greeting Widget */}
        <div
          className={`w-full max-w-[500px] mx-auto mb-4 rounded-lg shadow-md p-4 ${
            isDarkMode ? "bg-[#333] text-white" : "bg-white text-black"
          }`}
        >
          <h2 className="text-xl font-semibold text-center">
            {getGreeting()}, {userName}!
          </h2>
          <p className="text-center mt-2">
            Your overall attendance is {calculateOverallAttendance()}.
          </p>
        </div>

        {/* Dashboard Title */}
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {/* Course Widgets */}
        {courses.length === 0 ? (
          <p className="text-center text-gray-600">No courses found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses.map((course, index) => (
              <div key={course.id} className="w-full max-w-[500px] mx-auto">
                <CourseWidget
                  course={course}
                  attendanceRecords={attendanceRecords[course.id] || []}
                  index={index}
                  isDarkMode={isDarkMode}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileDashboard;
