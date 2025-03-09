import React, { useState, useEffect } from "react";
import axios from "axios";

const Courses = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const response = await instance.get("/api/v1/attendance/");
        const attendanceData = response.data;

        const sortedRecords = attendanceData
          .map((entry) => ({
            courseName: entry.session_id.course_id.name,
            date: new Date(entry.created_at).toLocaleDateString(),
            time: new Date(entry.created_at).toLocaleTimeString(),
            status:
              entry.is_present === true
                ? "Success"
                : entry.face_recognition_status === "PENDING"
                ? "Processing"
                : "Failed",
            createdAt: new Date(entry.created_at),
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

        setAttendanceRecords(sortedRecords);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            setError("Authentication failed. Please log in again.");
            setLoading(false);
            return;
          }

          try {
            const refreshResponse = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`,
              { refresh: refreshToken }
            );
            const newToken = refreshResponse.data.access;
            localStorage.setItem("accessToken", newToken);
            window.location.reload();
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            setError("Unable to refresh token. Please log in again.");
            setLoading(false);
          }
        } else {
          console.error("Error fetching attendance data:", err);
          setError("Unable to load courses.");
          setLoading(false);
        }
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading courses...</p>
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
      {/* Header Section - Fixed to top of content area */}
      <header className="bg-gray-50 shadow-sm p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
      </header>

      {/* Main Content */}
      <main className="p-6 mt-4">
        {attendanceRecords.length === 0 ? (
          <p className="text-center text-gray-600">No attendance records found.</p>
        ) : (
          <div className="max-w-4xl mx-auto space-y-2">
            {attendanceRecords.map((record, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-white rounded-lg shadow-md"
              >
                <div>
                  <p className="font-bold text-gray-800">{record.courseName}</p>
                  <p className="text-gray-500 text-sm">{`${record.date}, ${record.time}`}</p>
                </div>
                <span
                  className="px-2 py-1 rounded-full font-medium"
                  style={{
                    ...(record.status === "Success"
                      ? {
                          backgroundColor: "#D4EDDA",
                          color: "#155724",
                          border: "2px solid #4A9A6E",
                        }
                      : record.status === "Failed"
                      ? {
                          backgroundColor: "#F8D7DA",
                          color: "#721C24",
                          border: "2px solid #A84444",
                        }
                      : {
                          backgroundColor: "#FFF3CD",
                          color: "#856404",
                          border: "2px solid #A68A1A",
                        }),
                  }}
                >
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;