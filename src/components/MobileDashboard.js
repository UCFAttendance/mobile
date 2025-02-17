import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

const MobileDashboard = () => {
  const [userName, setUserName] = useState("Student");
  const [courses, setCourses] = useState([]);
  const [attendanceGrades, setAttendanceGrades] = useState([]);
  const [apiError, setApiError] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);

  useEffect(() => {
    // Retrieve user's name from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "Student");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Fetch courses and attendance grades
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
          // Token expired, attempt to refresh
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available.");
  
          const refreshResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });
  
          if (!refreshResponse.ok) throw new Error("Failed to refresh token.");
  
          const refreshData = await refreshResponse.json();
          token = refreshData.access; // New access token
          localStorage.setItem("accessToken", token); // Store new token
  
          // Retry fetching attendance data with the new token
          response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) throw new Error("Failed to fetch attendance data after token refresh.");
        }








        // if (!response.ok) {
        //   setShouldScroll(false);
        //   throw new Error("Failed to fetch attendance data.");
        // }

        const attendanceData = await response.json();

        // Extract unique courses
        const uniqueCourses = {};
        const grades = [];

        attendanceData.forEach((entry) => {
          const courseId = entry.session_id.course_id.id;
          const courseName = entry.session_id.course_id.name;

          if (!uniqueCourses[courseId]) {
            uniqueCourses[courseId] = courseName;
          }

          // Assuming attendance percentage can be calculated from attendance records
          const attendancePercentage = entry.is_present ? 100 : 0;
          grades.push({ name: courseName, percentage: attendancePercentage });
        });

        setCourses(Object.values(uniqueCourses)); // Convert object to array
        setAttendanceGrades(grades);

        // Disable scrolling if there are fewer than 3 attendance grades, no courses, or API error
        setShouldScroll(!(grades.length < 3 && Object.values(uniqueCourses).length === 0));
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setApiError(true);
        setShouldScroll(false); // Disable scrolling if API call fails
      }
    };

    fetchAttendanceData();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        height: "100vh",
        overflowY: shouldScroll ? "auto" : "hidden",
        overflowX: "hidden",
        padding: "0px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header Section - NOT Fixed */}
      <div
        style={{
          backgroundColor: "#FFC904",
          height: "60px",
          padding: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginTop: "0px", // Ensure it's not fixed and flows naturally
        }}
      >

        {/* Team Logo (Left) */}
        <img 
          src="/images/team-logo.png" 
          alt="Team Logo" 
          style={{
            width: "60px",  // Adjusted size for better visibility
            height: "auto",
            paddingLeft: "10px",
            borderRadius: "5px",
          }} 
        />

      </div>

      {/* Push content down to avoid overlap */}
      <div style={{ marginTop: "20px", padding: "0px 25px", width: "100%", maxWidth: "500px" }}>
        {/* My Courses Section */}
        <h3 style={{ marginTop: "20px", color: "#333", fontSize: "25px", padding: "0 20px", fontWeight: "bold" }}>
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
                    backgroundColor: "#fff",
                    border: '2px solid #E0E0E0',
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
                      backgroundColor: index % 2 === 0 ? "#ff6b6b" : "#fbc531",
                      marginRight: "12px",
                    }}
                  ></div>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#333" }}>
                    {course}
                  </p>
                </div>
              ))
          ) : (
            <p style={{ fontSize: "16px", color: "#888" }}>No courses available</p>
          )}
        </div>

        {/* Attendance Grades Section */}
        <h3 style={{ marginTop: "40px", color: "#333", fontSize: "25px", padding: "0 20px", fontWeight: "bold" }}>
          Attendance Grades
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px", // Increased spacing between widgets
            marginTop: "10px",
            padding: "0 20px",
            gridAutoRows: "minmax(120px, auto)", // Ensures proper spacing and prevents overlap
          }}
        >
          {apiError ? (
            <p style={{ fontSize: "16px", color: "#888" }}>Failed to load attendance data.</p>
          ) : attendanceGrades.length > 0 ? (
            attendanceGrades.map((course, index) => {
              // Array of three alternating colors
              const colors = ["#3dc1d3", "#ff6b6b", "#fbc531"];
              const backgroundColor = colors[index % 3]; // Cycle through colors

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: backgroundColor, // Assign the alternating color
                    padding: "20px",
                    borderRadius: "25px",
                    border: '2px solid #E0E0E0',
                    color: "#fff",
                    textAlign: "center",
                    boxShadow: "0px 3px 7px rgba(0,0,0,0.1)",
                    height: "auto", // Ensures dynamic height instead of fixed
                    minHeight: "120px", // Prevents overlap
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Circular Progress Indicator */}
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <span style={{ fontWeight: "bold", color: "#333" }}>{course.percentage}%</span>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: "bold", marginTop: "15px" }}>{course.name}</p>
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: "16px", color: "#888" }}>No attendance data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
