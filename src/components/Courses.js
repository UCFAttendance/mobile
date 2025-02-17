import React, { useState, useRef, useEffect } from "react";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// Fetch attendance data from API
useEffect(() => {
  const fetchAttendanceData = async () => {
    try {
      let token = localStorage.getItem("accessToken"); // Get the stored auth token
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

      const attendanceData = await response.json();

      // Extract unique course names from attendance data
      const uniqueCourses = {};
      attendanceData.forEach((entry) => {
        const courseId = entry.session_id.course_id.id;
        const courseName = entry.session_id.course_id.name;
        if (!uniqueCourses[courseId]) {
          uniqueCourses[courseId] = { id: courseId, name: courseName };
        }
      });

      setCourses(Object.values(uniqueCourses)); // Convert object back to array
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Unable to load courses.");
      setLoading(false);
    }
  };

  fetchAttendanceData();
}, []);

  // Fetch attendance records when expanding a course
  const handleToggleExpand = async (courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
    } else {
      if (!attendanceRecords[courseId]) {
        const token = localStorage.getItem('accessToken');
        try {
          const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch attendance records.");
          }

          const attendanceData = await response.json();

          // Filter attendance records for the selected course
          const filteredAttendance = attendanceData
            .filter(entry => entry.session_id.course_id.id === courseId)
            .map(entry => ({
              date: new Date(entry.created_at).toLocaleDateString(), // Format date
              status: entry.is_present ? "Present" : "Absent",
            }));

          setAttendanceRecords((prev) => ({
            ...prev,
            [courseId]: filteredAttendance,
          }));
        } catch (err) {
          console.error("Error fetching attendance records:", err);
        }
      }
      setExpandedCourseId(courseId);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Courses</h2>

      {loading ? (
        <p>Loading courses...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f8f9fa",
              textAlign: "left",
              borderBottom: "2px solid #ddd",
            }}
          >
            <tr>
              <th style={{ padding: "10px", fontWeight: "600" }}>Course ID</th>
              <th style={{ padding: "10px", fontWeight: "600" }}>Name</th>
              <th style={{ padding: "10px", fontWeight: "600", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <React.Fragment key={course.id}>
                  <tr
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <td style={{ padding: "10px" }}>{course.id}</td>
                    <td style={{ padding: "10px" }}>{course.name}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <button
                        onClick={() => handleToggleExpand(course.id)}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "5px 10px",
                          cursor: "pointer",
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        {expandedCourseId === course.id ? "Close" : "View"}
                      </button>
                    </td>
                  </tr>
                  <ExpandableRow
                    isExpanded={expandedCourseId === course.id}
                    content={
                      <div
                        style={{
                          marginTop: "15px",
                          marginBottom: "15px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {attendanceRecords[course.id] ? (
                          <table
                            style={{
                              width: "90%",
                              borderCollapse: "collapse",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <thead>
                              <tr
                                style={{
                                  backgroundColor: "#f8f9fa",
                                  borderBottom: "2px solid #ddd",
                                }}
                              >
                                <th style={{ textAlign: "left", padding: "8px", fontWeight: "600" }}>Date</th>
                                <th style={{ textAlign: "left", padding: "8px", fontWeight: "600" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceRecords[course.id].map((record, index) => (
                                <tr
                                  key={index}
                                  style={{
                                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                                    borderBottom: "1px solid #ddd",
                                  }}
                                >
                                  <td style={{ padding: "8px" }}>{record.date}</td>
                                  <td style={{ padding: "8px" }}>{record.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>Loading attendance records...</p>
                        )}
                      </div>
                    }
                  />
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>No courses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const ExpandableRow = ({ isExpanded, content }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isExpanded
        ? `${contentRef.current.scrollHeight}px`
        : "0";
    }
  }, [isExpanded]);

  return (
    <tr style={{ backgroundColor: "#f1f1f1", borderBottom: isExpanded ? "1px solid #ddd" : "none" }}>
      <td colSpan="3" style={{ border: "none", padding: "0" }}>
        <div
          ref={contentRef}
          style={{
            overflow: "hidden",
            maxHeight: "0",
            transition: "max-height 0.3s ease-out",
            padding: "0 10px",
            boxSizing: "border-box",
          }}
        >
          {content}
        </div>
      </td>
    </tr>
  );
};

export default Courses;
