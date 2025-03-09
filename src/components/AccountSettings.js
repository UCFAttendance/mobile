import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
} from "react-icons/fa";

const AccountSettings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ text: "", isError: false });
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setDarkMode(theme === "dark");

    // Fetch user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData((prevState) => ({
          ...prevState,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        }));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      // Email regex pattern
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailPattern.test(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }

    if (name === "phone") {
      // Remove any non-numeric characters for storage
      const numericValue = value.replace(/\D/g, "");

      // Phone regex pattern (XXX-XXX-XXXX)
      const phonePattern = /^\d{10}$/;

      if (!phonePattern.test(numericValue)) {
        setPhoneError("Please enter a valid 10-digit phone number");
      } else {
        setPhoneError("");
      }

      // Format the phone number as user types
      let formattedPhone = numericValue;
      if (numericValue.length > 0) {
        formattedPhone = numericValue.replace(
          /(\d{3})(\d{3})(\d{4})/,
          "$1-$2-$3"
        );
      }

      // Update with formatted value
      setUserData((prevState) => ({
        ...prevState,
        [name]: formattedPhone,
      }));
      return; // Exit early as we've already updated the phone value
    }

    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", isError: false });

    // Validate passwords match if being changed
    if (userData.password || userData.confirmPassword) {
      if (userData.password !== userData.confirmPassword) {
        setMessage({ text: "Passwords do not match", isError: true });
        return;
      }
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/v1/user/update/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            ...(userData.password && { password: userData.password }),
          }),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setMessage({ text: "Profile updated successfully!", isError: false });

        // Clear password fields after successful update
        setUserData((prevState) => ({
          ...prevState,
          password: "",
          confirmPassword: "",
        }));
      } else {
        const error = await response.json();
        setMessage({
          text: error.message || "Failed to update profile",
          isError: true,
        });
      }
    } catch (error) {
      setMessage({ text: "Network error. Please try again.", isError: true });
    }
  };

  const InputField = ({
    icon,
    label,
    name,
    type = "text",
    value,
    onChange,
  }) => (
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
          {icon}
        </div>
        <label
          style={{
            fontSize: "16px",
            color: darkMode ? "#fff" : "#333",
            fontWeight: "500",
          }}
        >
          {label}
        </label>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: darkMode ? "1px solid #444" : "1px solid #ddd",
          backgroundColor: darkMode ? "#2a2a2a" : "#fff",
          color: darkMode ? "#fff" : "#333",
          fontSize: "16px",
          outline: "none",
          transition: "border-color 0.3s ease",
        }}
      />
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#141414" : "#f5f5f5",
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
          color: darkMode ? "#000" : "#fff", // Changes based on mode
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
            color: "#fff", 
            fontWeight: "bold"
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
            color: darkMode ? "#fff" : "#fff",
            fontWeight: "bold"
          }}
        >
          Account Settings
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: darkMode ? "#fff" : "#fff",
            fontWeight: "bold"
          }}
        >
          Manage your account information
        </p>
      </div>

      {/* Settings Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 200px)", // Subtract header height
          padding: "20px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: darkMode ? "#333" : "#fff",
            borderRadius: "10px",
            boxShadow: darkMode
              ? "0 4px 6px rgba(255, 255, 255, 0.1)"
              : "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            width: "100%",
            maxWidth: "500px", // Limit maximum width
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
                <FaUser />
              </div>
              <label
                style={{
                  fontSize: "16px",
                  color: darkMode ? "#fff" : "#333",
                  fontWeight: "500",
                }}
              >
                Name
              </label>
            </div>
            <input
              type="text"
              name="name"
              value={userData.name}
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
                transition: "border-color 0.3s ease",
              }}
            />
          </div>

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
                <FaPhone />
              </div>
              <label
                style={{
                  fontSize: "16px",
                  color: darkMode ? "#fff" : "#333",
                  fontWeight: "500",
                }}
              >
                Phone Number
              </label>
            </div>
            <input
              type="tel"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              placeholder="XXX-XXX-XXXX"
              maxLength="12"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: phoneError
                  ? "1px solid #ff4444"
                  : darkMode
                  ? "1px solid #444"
                  : "1px solid #ddd",
                backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                color: darkMode ? "#fff" : "#333",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.3s ease",
              }}
            />
            {phoneError && (
              <div
                style={{
                  color: "#ff4444",
                  fontSize: "12px",
                  marginTop: "4px",
                  paddingLeft: "4px",
                }}
              >
                {phoneError}
              </div>
            )}
          </div>

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
                <FaEnvelope />
              </div>
              <label
                style={{
                  fontSize: "16px",
                  color: darkMode ? "#fff" : "#333",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
            </div>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: emailError
                  ? "1px solid #ff4444"
                  : darkMode
                  ? "1px solid #444"
                  : "1px solid #ddd",
                backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                color: darkMode ? "#fff" : "#333",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.3s ease",
              }}
            />
            {emailError && (
              <div
                style={{
                  color: "#ff4444",
                  fontSize: "12px",
                  marginTop: "4px",
                  paddingLeft: "4px",
                }}
              >
                {emailError}
              </div>
            )}
          </div>

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
              marginTop: "20px",
              transition: "background-color 0.3s ease",
            }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
