import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseWidget = ({ course, attendanceRecords, index }) => {
  
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
    <div className="rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div
        style={{ backgroundColor }}
        className="h-[60px] flex items-center justify-between px-4 relative"
      >
        {/* Percentage in top-left corner */}
        {percentage !== "N/A" && (
          <div
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full px-2 py-0.2"
            style={{ color: textColor }}
          >
            <span className="text-sm font-medium">{percentage}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white h-[60px] flex items-center justify-between px-4">
        <span
          className="font-semibold text-lg"
          style={{ color: textColor }}
        >
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

  useEffect(() => {
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No auth token found. Redirecting to login.");
      window.location.href = "/";
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

        let response = await instance.get("/api/v1/attendance/").catch(async (err) => {
          if (err.response?.status === 401) {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) throw new Error("No refresh token available.");

            const refreshResponse = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`,
              { refresh: refreshToken }
            );
            token = refreshResponse.data.access;
            localStorage.setItem("accessToken", token);

            return instance.get("/api/v1/attendance/");
          }
          throw err;
        });

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;