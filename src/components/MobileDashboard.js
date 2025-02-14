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
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setShouldScroll(false);
          throw new Error("Failed to fetch attendance data.");
        }

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
        backgroundColor: "#fdf4e3",
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
          backgroundColor: "#f6a96b",
          padding: "20px",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "94%",
          maxWidth: "500px",
          marginTop: "0px", // Ensure it's not fixed and flows naturally
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
          {/* Profile Picture */}
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              border: "4px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              marginBottom: "10px",
            }}
          >
            <FaUserCircle size={50} color="#333" />
          </div>
          <h2 style={{ fontSize: "18px", marginTop: "-2px", fontWeight: "bold", color: "#333" }}>{userName}</h2>
        </div>
      </div>

      {/* Push content down to avoid overlap */}
      <div style={{ marginTop: "20px", padding: "0px 25px", width: "100%", maxWidth: "500px" }}>
        {/* My Courses Section */}
        <h3 style={{ marginTop: "20px", color: "#333", fontSize: "22px", padding: "0 20px", fontWeight: "bold" }}>
          My Courses
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
                    padding: "20px",
                    width: "85%", /* Ensure it's not too wide */
                    maxWidth: "350px", /* Prevents stretching on wider screens */
                    borderRadius: "20px",
                    marginBottom: "12px",
                    boxShadow: "0px 3px 7px rgba(0,0,0,0.1)",
                    fontSize: "16px",
                    fontWeight: "bold",
                    justifyContent: "center", /* Centers content inside */
                    marginLeft: "auto", /* Centers the box */
                    marginRight: "auto", /* Centers the box */
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
        <h3 style={{ marginTop: "20px", color: "#333", fontSize: "22px", padding: "0 20px", fontWeight: "bold" }}>
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
                  <p style={{ fontSize: "14px", fontWeight: "bold", marginTop: "5px" }}>{course.name}</p>
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
