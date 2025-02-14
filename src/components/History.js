import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiCalendar } from "react-icons/fi";
import "./History.css";

// Mock data
const mockCourses = [
  { id: 1, name: "COT 3100 - Fall 23", attendancePercentage: 85 },
  { id: 2, name: "CNT 4900 - Fall 23", attendancePercentage: 90 },
  { id: 3, name: "COP 3330 - Spring 24", attendancePercentage: 75 },
  { id: 4, name: "CIS 1000 - Summer 24", attendancePercentage: 0 },
  { id: 5, name: "CIS 2000 - Fall 24", attendancePercentage: null }, // no attendance yet
];

const mockAttendanceHistory = [
  { date: "2023-01-20", status: "Present" },
  { date: "2023-01-19", status: "Absent" },
  { date: "2023-01-18", status: "Present" },
  { date: "2023-01-17", status: "Present" },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * pageIndex: 
 *   0 => Courses list
 *   1 => Details page
 *   2 => Calendar page
 */
const History = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progress, setProgress] = useState(0);

  // Animate the attendance circle each time we pick a course
  useEffect(() => {
    if (selectedCourse && selectedCourse.attendancePercentage != null) {
      let current = 0;
      const target = selectedCourse.attendancePercentage;
      const timer = setInterval(() => {
        current++;
        if (current > target) {
          clearInterval(timer);
        } else {
          setProgress(current);
        }
      }, 10);
      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [selectedCourse]);

  // ====== Navigation Handlers ======
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setPageIndex(1); // Slide to Details
  };

  // From Details -> back to Courses
  const goBackToCourses = () => {
    setPageIndex(0);
    // Optionally unselect the course after transition
    setTimeout(() => setSelectedCourse(null), 300);
  };

  // From Details -> Calendar
  const goToCalendar = () => {
    setPageIndex(2);
  };

  // From Calendar -> back to Details
  const goBackToDetails = () => {
    setPageIndex(1);
  };

  return (
    <div
      className="history-container"
      style={{
        /* Slide horizontally in increments of 100vw */
        transform: `translateX(-${pageIndex * 100}vw)`,
      }}
    >
      {/* ========== PAGE 0: COURSES ========== */}
      <div className="page course-list">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Your Courses</h2>
        <div className="vertical-courses">
          {mockCourses.map((course) => (
            <div
              key={course.id}
              className="course-widget"
              onClick={() => handleCourseSelect(course)}
            >
              <span className="course-text">{course.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========== PAGE 1: DETAILS ========== */}
      <div className="page course-details">
        {selectedCourse && (
          <>
            {/* Top bar with a bigger back arrow + calendar icon */}
            <div className="top-bar">
              {/* Larger back arrow, a bit lower by using margin-top */}
              <FiChevronLeft 
                className="icon back-icon" 
                onClick={goBackToCourses} 
              />
              <FiCalendar 
                className="icon calendar-icon"
                onClick={goToCalendar}
              />
            </div>

            <div className="details-content">
              {/* Attendance Circle */}
              <div className="progress-circle">
                <div
                  className="progress-inner"
                  style={{
                    background: `conic-gradient(#d4a72c ${progress}%, #e0e0e0 ${progress}%)`,
                  }}
                >
                  <div className="progress-content">
                    <h3>{progress}%</h3>
                    <p>Attendance</p>
                  </div>
                </div>
              </div>

              {/* Attendance History Listing */}
              <div className="attendance-list">
                <h3>Attendance History</h3>
                {mockAttendanceHistory.map((item) => (
                  <div key={item.date} className="attendance-item">
                    <span className="attendance-date">{item.date}</span>
                    <span className={`status-pill ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========== PAGE 2: CALENDAR ========== */}
      <div className="page course-calendar">
        <div className="top-bar">
          {/* Larger back arrow to return from Calendar -> Details */}
          <FiChevronLeft 
            className="icon back-icon" 
            onClick={goBackToDetails} 
          />
          <h3 style={{ marginLeft: "10px" }}>
            {selectedCourse ? selectedCourse.name : "Attendance Calendar"}
          </h3>
        </div>

        {/* Rough Canvas-style monthly calendar */}
        <div className="calendar-container">
          <div className="calendar-header">
            <span className="month-label">April ▼</span>
            <span className="year-label">2025</span>
            <span className="right-link">Calendars</span>
          </div>
          {/* Days-of-week row */}
          <div className="days-of-week">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          {/* Dates grid: placeholder 30 days */}
          <div className="dates-grid">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((dateNum) => (
              <div className="date-cell" key={dateNum}>
                {dateNum}
              </div>
            ))}
          </div>
          {/* Example "events" or attendance notes */}
          <div className="calendar-events">
            <div className="event">
              <h4>Biology 101</h4>
              <p>Group Assignment Week 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
