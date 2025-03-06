import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import axios from "axios";


const CourseWidget = ({ course, isExpanded, onToggle, attendanceRecords, index }) => {
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

 
  useLayoutEffect(() => {
    if (isExpanded && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    } else {
      setContentHeight(0);
    }
  }, [isExpanded, attendanceRecords]);


  const headerColors = ["#3dc1d3", "#ff6b6b"];
  const backgroundColor = headerColors[index % 2]; 

  return (
    <div
      className="rounded-lg shadow-md overflow-hidden transition-all duration-300"
      style={{ width: "100%", minHeight: "15vh" }}
    >
      {/* Header - Clickable to Toggle */}
      <div
        style={{
          backgroundColor: backgroundColor,
          height: "7.5vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          cursor: "pointer",
        }}
        onClick={onToggle}
      >
        <span
          className="font-semibold text-black"
          style={{ fontSize: "1.1rem" }}
        >
          {course.name}
        </span>
        <span className="text-white text-2xl">{isExpanded ? "−" : "+"}</span>
      </div>

      {/* White Base Section */}
      <div
        style={{
          backgroundColor: "#ffffff",
          height: isExpanded ? "0vh" : "7.5vh",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          transition: isExpanded ? "none" : "height 1.1s ease-in-out",
          cursor: "pointer",
        }}
        onClick={onToggle} 
      >
        {/* Add static content here if needed */}
      </div>

      {/* Expandable Attendance Section - Clickable to Collapse */}
      <div
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.7s ease-in-out",
          backgroundColor: "#ffffff",
          cursor: isExpanded ? "pointer" : "default", 
        }}
        onClick={isExpanded ? onToggle : undefined} 
      >
        <div style={{ padding: "2vh" }}>
          {attendanceRecords && attendanceRecords.length > 0 ? (
            attendanceRecords.map((record, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1vh 0",
                }}
              >
                <div>
                  <p style={{ fontWeight: "bold", color: "#333" }}>
                    {course.name}
                  </p>
                  <p style={{ color: "#666" }}>{`${record.date}, ${record.time}`}</p>
                </div>
                <span
                  style={{
                    padding: "0.5vh 1vh",
                    borderRadius: "9999px",
                    fontWeight: "medium",
                    ...(record.status === "Success"
                      ? {
                          backgroundColor: "#D4EDDA",
                          color: "#155724",
                          border: "2px solid #C3E6CB",
                        }
                      : record.status === "Failed"
                      ? {
                          backgroundColor: "#F8D7DA",
                          color: "#721C24",
                          border: "2px solid #F5C6CB",
                        }
                      : {
                          backgroundColor: "#FFF3CD",
                          color: "#856404",
                          border: "2px solid #FFEEBA",
                        }),
                  }}
                >
                  {record.status}
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: "#666" }}>
              No attendance records for this course.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


const History = () => {
  const [courses, setCourses] = useState([]);
  const [expandedCourseIds, setExpandedCourseIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  
  useEffect(() => {
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
        setError("Unable to load attendance history.");
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleToggleExpand = (courseId) => {
    setExpandedCourseIds((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#666" }}>Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "#e53e3e" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7FAFC" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#FFC904",
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
        }}
      >
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          style={{ width: "60px", height: "auto", borderRadius: "5px" }}
        />
        <h1 style={{ color: "#000000", fontSize: "20px", fontWeight: "bold", paddingLeft: "15px" }}>
          History
        </h1>
      </header>

      {/* Main Content */}
      <div style={{ padding: "2vh", width: "100%" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center", color: "#333" }}>
          {/* Optional subtitle if desired */}
        </h2>

        {courses.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>No courses found.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                windowWidth <= 430
                  ? "1fr"
                  : windowWidth <= 768
                  ? "1fr 1fr"
                  : "1fr",
              gap: "1rem",
              alignItems: "start",
            }}
          >
            {courses.map((course, index) => (
              <CourseWidget
                key={course.id}
                course={course}
                isExpanded={expandedCourseIds[course.id] || false}
                onToggle={() => handleToggleExpand(course.id)}
                attendanceRecords={attendanceRecords[course.id] || []}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#E2E8F0",
          padding: "0.5rem",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <a href="#" style={{ color: "#4A5568", textAlign: "center" }}>
          <span style={{ display: "block" }}>Dashboard</span>
          <i className="fas fa-home"></i>
        </a>
        <a href="#" style={{ color: "#4A5568", textAlign: "center" }}>
          <span style={{ display: "block" }}>Attendance</span>
          <i className="fas fa-qrcode"></i>
        </a>
        <a href="#" style={{ color: "#3182CE", textAlign: "center" }}>
          <span style={{ display: "block" }}>History</span>
          <i className="fas fa-history"></i>
        </a>
        <a href="#" style={{ color: "#4A5568", textAlign: "center" }}>
          <span style={{ display: "block" }}>Settings</span>
          <i className="fas fa-cog"></i>
        </a>
      </div>
    </div>
  );
};

export default History;