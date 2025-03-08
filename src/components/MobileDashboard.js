import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

const MobileDashboard = () => {
  const [userName, setUserName] = useState("Student");
  const [courses, setCourses] = useState([]);
  const [attendanceAverages, setAttendanceAverages] = useState([]);
  const [apiError, setApiError] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);
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
        let response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available.");

          const refreshResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!refreshResponse.ok) throw new Error("Failed to refresh token.");

          const refreshData = await refreshResponse.json();
          token = refreshData.access;
          localStorage.setItem("accessToken", token);

          response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) throw new Error("Failed to fetch attendance data after token refresh.");
        }

        const attendanceData = await response.json();
        const uniqueCourses = {};
        const courseAttendance = {};

        attendanceData.forEach((entry) => {
          const courseId = entry.session_id.course_id.id;
          const courseName = entry.session_id.course_id.name;

          if (!uniqueCourses[courseId]) {
            uniqueCourses[courseId] = courseName;
          }

          if (!courseAttendance[courseId]) {
            courseAttendance[courseId] = { total: 0, count: 0 };
          }

          courseAttendance[courseId].total += entry.is_present ? 100 : 0;
          courseAttendance[courseId].count += 1;
        });

        const attendanceAverages = Object.keys(courseAttendance).map((courseId, index) => ({
          id: courseId,
          name: uniqueCourses[courseId],
          percentage: Math.round(courseAttendance[courseId].total / courseAttendance[courseId].count),
        }));

        setCourses(Object.values(uniqueCourses));
        setAttendanceAverages(attendanceAverages);
        setShouldScroll(!(attendanceAverages.length < 3 && Object.values(uniqueCourses).length === 0));
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setApiError(true);
        setShouldScroll(false);
      }
    };

    fetchAttendanceData();
  }, []);

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? "#121212" : "#ffffff",
        color: isDarkMode ? "#E0E0E0" : "#333",
        height: "100vh",
        overflowY: shouldScroll ? "auto" : "hidden",
        overflowX: "hidden",
        padding: "0px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          backgroundColor: "#FFC904",
          height: "60px",
          padding: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "0px",
        }}
      >
        <img 
          src="/images/team-logo.png" 
          alt="Team Logo" 
          style={{
            width: "60px",
            height: "auto",
            paddingLeft: "10px",
            borderRadius: "5px",
          }} 
        />
      </div>

      <div style={{ marginTop: "20px", padding: "0px 25px", width: "100%", maxWidth: "500px" }}>
        <h3 style={{ marginTop: "20px", fontSize: "25px", padding: "0 20px", fontWeight: "bold" }}>
          Courses
        </h3>
        <div style={{ marginTop: "10px" }}>
          {apiError ? (
            <p style={{ fontSize: "16px", padding: "0 20px", color: "#888" }}>Failed to load courses.</p>
          ) : courses.length > 0 ? (
            courses.map((course, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: isDarkMode ? "#333" : "#fff",
                  border: isDarkMode ? "2px solid #555" : "2px solid #E0E0E0",
                  padding: "20px",
                  width: "85%", 
                  maxWidth: "350px", 
                  borderRadius: "20px",
                  marginBottom: "12px",
                  boxShadow: "0px 3px 7px rgba(0,0,0,0.1)",
                  fontSize: "16px",
                  fontWeight: "bold",
                  justifyContent: "center", 
                  marginLeft: "auto", 
                  marginRight: "auto", 
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: index % 2 === 0 ? "#3dc1d3" : "#ff6b6b",
                    marginRight: "12px",
                  }}
                ></div>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                  {course}
                </p>
              </div>
            ))
          ) : (
            <p style={{ fontSize: "16px", color: "#888" }}>No courses available</p>
          )}
        </div>

        <h3 style={{ marginTop: "40px", fontSize: "25px", padding: "0 20px", fontWeight: "bold" }}>
          Attendance Grades
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "10px", padding: "0 20px" }}>
          {attendanceAverages.map((course, index) => {
            const colors = ["#3dc1d3", "#ff6b6b", "#fbc531"];
            return (
              <div key={course.id} style={{ backgroundColor: colors[index % 3], padding: "20px", borderRadius: "25px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontWeight: "bold", color: "#000000", WebkitTextFillColor: "#000000" }}>{course.percentage}%</span>
                </div>
                <p style={{ fontSize: "14px", fontWeight: "bold", marginTop: "10px", color: "#FFFFFF" }}>{course.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
