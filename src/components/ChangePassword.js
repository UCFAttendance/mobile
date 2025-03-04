import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLock } from "react-icons/fa";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setDarkMode(theme === "dark");
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", isError: false });

    // Validate passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ text: "Passwords do not match", isError: true });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/user/change-password/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            new_password: passwords.newPassword,
          }),
        }
      );

      if (response.ok) {
        setMessage({ text: "Password successfully changed!", isError: false });
        // Clear password fields
        setPasswords({ newPassword: "", confirmPassword: "" });
        // Optionally redirect after successful change
        setTimeout(() => navigate("/settings"), 2000);
      } else {
        const error = await response.json();
        setMessage({
          text: error.message || "Failed to change password",
          isError: true,
        });
      }
    } catch (error) {
      setMessage({ text: "Network error. Please try again.", isError: true });
    }
  };

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#000" : "#f5f5f5",
        minHeight: "100vh",
        overflowY: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          backgroundColor: "#FFD700",
          padding: "85px 20px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Back Button */}
        <div
          style={{
            position: "absolute",
            left: "20px",
            top: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: darkMode ? "#000" : "#fff",
          }}
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft style={{ marginRight: "5px" }} />
          <span>Back</span>
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            color: darkMode ? "#000" : "#fff",
          }}
        >
          Change Password
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: darkMode ? "#000" : "#fff",
          }}
        >
          Enter your new password
        </p>
      </div>

      {/* Form Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 200px)",
          padding: "20px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: darkMode ? "#1e1e1e" : "#fff",
            borderRadius: "10px",
            boxShadow: darkMode
              ? "0 4px 6px rgba(255, 255, 255, 0.1)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          {message.text && (
            <div
              style={{
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                backgroundColor: message.isError ? "#ffebee" : "#e8f5e9",
                color: message.isError ? "#c62828" : "#2e7d32",
                fontSize: "14px",
              }}
            >
              {message.text}
            </div>
          )}

          {/* New Password Input */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  color: "#FFD700",
                  fontSize: "18px",
                  marginRight: "10px",
                }}
              >
                <FaLock />
              </div>
              <label
                style={{
                  fontSize: "16px",
                  color: darkMode ? "#fff" : "#333",
                  fontWeight: "500",
                }}
              >
                New Password
              </label>
            </div>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: darkMode ? "1px solid #444" : "1px solid #ddd",
                backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                color: darkMode ? "#fff" : "#333",
                fontSize: "16px",
                outline: "none",
              }}
            />
          </div>

          {/* Confirm Password Input */}
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  color: "#FFD700",
                  fontSize: "18px",
                  marginRight: "10px",
                }}
              >
                <FaLock />
              </div>
              <label
                style={{
                  fontSize: "16px",
                  color: darkMode ? "#fff" : "#333",
                  fontWeight: "500",
                }}
              >
                Confirm Password
              </label>
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: darkMode ? "1px solid #444" : "1px solid #ddd",
                backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                color: darkMode ? "#fff" : "#333",
                fontSize: "16px",
                outline: "none",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#FFD700",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
