import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null); 
  const [attendanceHistory, setAttendanceHistory] = useState([]); 




  useEffect(() => {


    // Temporary mock data while the backend is down
    const mockCourses = [
      { id: 1, name: 'COT 3100 - Fall 23' },
      { id: 2, name: 'CNT 4900 - Fall 23' },
      { id: 3, name: 'COP 3330 - Spring 24' },
      { id: 4, name: 'CIS 4365 - Summer 24' },
    ];

    const fetchCourses = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCourses(mockCourses);
      } catch (err) {
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleViewClick = async (courseId) => {
    if (expandedCourseId === courseId) {

      setExpandedCourseId(null);
      return;
    }

    try {

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockHistory = [
        { date: '2023-09-01', status: 'Present' },
        { date: '2023-09-02', status: 'Absent' },
        { date: '2023-09-03', status: 'Present' },
      ];

      setAttendanceHistory(mockHistory);
      setExpandedCourseId(courseId); 
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setAttendanceHistory([
        { date: 'Mock-01', status: 'Present' },
        { date: 'Mock-02', status: 'Absent' },
      ]);
      setExpandedCourseId(courseId);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Courses</h2>
        <button
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Add Course
        </button>
      </div>

      {/* Loading State */}
      {loading && <p>Loading courses...</p>}

      {/* Error State */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Courses Table */}
      {!loading && !error && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <thead
            style={{
              backgroundColor: '#f8f9fa',
              textAlign: 'left',
              borderBottom: '2px solid #ddd',
            }}
          >
            <tr>
              <th style={{ padding: '15px', fontWeight: '600' }}>Course ID</th>
              <th style={{ padding: '15px', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '15px', fontWeight: '600', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <React.Fragment key={course.id}>
                {/* Main Course Row */}
                <tr
                  style={{
                    borderBottom: '1px solid #ddd',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                  }}
                >
                  <td style={{ padding: '15px' }}>{course.id}</td>
                  <td style={{ padding: '15px' }}>{course.name}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleViewClick(course.id)}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      {expandedCourseId === course.id ? 'Close' : 'View'}
                    </button>
                  </td>
                </tr>

                {/* Attendance History Row */}
                {expandedCourseId === course.id && (
                  <tr style={{ transition: 'all 0.3s ease' }}>
                    <td colSpan="3" style={{ padding: '15px', backgroundColor: '#f1f1f1' }}>
                      <strong>Attendance History</strong>
                      <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceHistory.map((entry, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                              <td style={{ padding: '8px' }}>{entry.date}</td>
                              <td style={{ padding: '8px' }}>{entry.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Courses;