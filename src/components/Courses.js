import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Temporary mock data while the backend is down
    const mockCourses = [
      { id: 1, name: 'COT 3100 - Fall 23' },
      { id: 2, name: 'CNT 4900 - Fall 23' },
      { id: 3, name: 'COP 3330 - Spring 24' },
      { id: 4, name: 'CIS 4365 - Summer 24' },
    ];

    // Simulate a short delay to mimic an API call
    const fetchCourses = async () => {
      try {
        // Simulated API call delay
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

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{ margin: 0 }}>Courses</h2>
        <button style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '10px 20px',
          cursor: 'pointer',
        }}>
          Add Course
        </button>
      </div>

      {/* Loading State */}
      {loading && <p>Loading courses...</p>}

      {/* Error State */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Courses Table */}
      {!loading && !error && (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <thead style={{
            backgroundColor: '#f8f9fa',
            textAlign: 'left',
            borderBottom: '2px solid #ddd',
          }}>
            <tr>
              <th style={{ padding: '15px', fontWeight: '600' }}>Course ID</th>
              <th style={{ padding: '15px', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '15px', fontWeight: '600', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr
                key={course.id || index}
                style={{
                  borderBottom: '1px solid #ddd',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9', // Alternating row colors
                }}
              >
                <td style={{ padding: '15px' }}>{course.id}</td>
                <td style={{ padding: '15px' }}>{course.name}</td>
                <td style={{
                  padding: '15px',
                  textAlign: 'center',
                }}>
                  <button style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Courses;
