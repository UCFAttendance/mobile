import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // firstName: "",
    // lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setDarkMode(theme === "dark");
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api-auth/v1/registration/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // first_name: formData.firstName,
            // last_name: formData.lastName,
            email: formData.email,
            password1: formData.password,
            password2: formData.confirmPassword
          }),
        }
      );

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        // Handle different types of error responses
        if (data.email) {
          throw new Error(Array.isArray(data.email) ? data.email[0] : data.email);
        }
        if (data.password1) {
          throw new Error(Array.isArray(data.password1) ? data.password1[0] : data.password1);
        }
        if (data.password2) {
          throw new Error(Array.isArray(data.password2) ? data.password2[0] : data.password2);
        }
        if (data.non_field_errors) {
          throw new Error(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
        }
        throw new Error(data.detail || "Registration failed. Please try again.");
      }

      // Registration successful
      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: isMobile ? "12px" : "14px",
    borderRadius: "6px",
    border: darkMode ? "1px solid #777" : "1px solid #ccc",
    backgroundColor: darkMode ? "#222" : "#fff",
    color: darkMode ? "#fff" : "#000",
    fontSize: isMobile ? "16px" : "18px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: isMobile ? "14px" : "16px",
    color: darkMode ? "#fff" : "#333",
    marginBottom: "8px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: darkMode ? "#000" : "#fff",
        padding: isMobile ? "20px 15px" : "20px",
      }}
    >
      <img
        src="/images/team-logo.png"
        alt="Team Logo"
        style={{
          width: isMobile ? "100px" : "120px",
          height: isMobile ? "100px" : "120px",
          marginBottom: "20px",
        }}
      />
      <h2
        style={{
          fontSize: isMobile ? "22px" : "28px",
          fontWeight: "bold",
          color: darkMode ? "#fff" : "#333",
          marginBottom: "30px",
        }}
      >
        Create your account
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          width: isMobile ? "90%" : "400px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* First Name */}
        {/* <div style={{ marginBottom: "15px" }}>
          <label htmlFor="firstName" style={labelStyle}>
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div> */}

        {/* Last Name */}
        {/* <div style={{ marginBottom: "15px" }}>
          <label htmlFor="lastName" style={labelStyle}>
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div> */}

        {/* Email */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={labelStyle}>
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            style={inputStyle}
            placeholder="Enter your UCF email"
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password" style={labelStyle}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleInputChange}
              style={{ ...inputStyle, paddingRight: "40px" }}
              placeholder="Create a password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: darkMode ? "#aaa" : "#555",
              }}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: "25px" }}>
          <label htmlFor="confirmPassword" style={labelStyle}>
            Confirm Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              style={{ ...inputStyle, paddingRight: "40px" }}
              placeholder="Confirm password"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: darkMode ? "#aaa" : "#555",
              }}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              color: "#dc3545",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: isMobile ? "12px" : "14px",
            fontSize: isMobile ? "16px" : "18px",
            backgroundColor: loading ? "#999" : "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "20px",
          }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: isMobile ? "14px" : "16px",
            color: darkMode ? "#fff" : "#333",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#0066cc",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp; 