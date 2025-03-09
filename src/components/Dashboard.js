import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseWidget = ({ course, attendanceRecords, index, isDarkMode }) => {
  
  const calculateAverageGrade = (records) => {
    if (!records || records.length === 0) return "N/A";

    const validRecords = records.filter((record) => record.status !== "Processing");
    if (validRecords.length === 0) return "N/A";

    const totalScore = validRecords.reduce((sum, record) => {
      return sum + (record.status === "Success" ? 100 : 0);
    }, 0);

    const average = totalScore / validRecords.length;

    if (Number.isInteger(average)) {
      return `${average}%`;
    }
    return `${average.toFixed(2)}%`;
  };

  const headerColors = ["#3dc1d3", "#ff6b6b", "#ffc904"];
  const backgroundColor = headerColors[index % 3];
  const textColor = backgroundColor;

  const percentage = calculateAverageGrade(attendanceRecords);

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${
        isDarkMode ? "bg-[#333] text-white" : "bg-white"
      }`}
    >
      {/* Header */}
      <div
        style={{ backgroundColor }}
        className="h-[60px] flex items-center justify-between px-4 relative"
      >
        {percentage !== "N/A" && (
          <div
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full px-2 py-0.5"
            style={{ color: backgroundColor }}
          >
            <span className="text-sm font-medium">{percentage}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="h-[60px] flex items-center justify-between px-4">
        <span className="font-semibold text-lg" style={{ color: backgroundColor }}>
          {course.name}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
      );
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No auth token found. Redirecting to login.");
      window.location.href = "/";
      return;
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

        const response = await instance.get("/api/v1/attendance/").catch(async (err) => {
          if (err.response?.status === 401) {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token available.");

            const refreshResponse = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`,
              { refresh: refreshToken }
            );
            token = refreshResponse.data.access;
            localStorage.setItem("accessToken", token);

            // Refresh the page after successfully updating the token
            window.location.reload();
            return; // Exit the catch block to prevent further execution
          }
          throw err;
        });

        // If we reach here, it means no 401 error occurred or the catch block returned
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
        console.error("Error fetching attendance data:", err);
        setError("Unable to load dashboard data.");
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

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
      {/* Header */}
      <header
        className={`shadow-sm p-4 ${
          isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-white text-gray-800"
        }`}
      >
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {courses.length === 0 ? (
          <p className="text-center text-gray-600">No courses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course, index) => (
              <CourseWidget
                key={course.id}
                course={course}
                attendanceRecords={attendanceRecords[course.id] || []}
                index={index}
                isDarkMode={isDarkMode} // Ensure it applies to widgets
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

};

export default Dashboard;