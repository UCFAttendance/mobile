import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const PWAWelcomeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [showPassword, setShowPassword] = useState(false); // Track password visibility
  const navigate = useNavigate();

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

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api-auth/v1/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed. Please check your credentials."
        );
      }

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/student/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: darkMode ? "#000" : "#fff",
        margin: "0",
        overflow: "hidden",
        padding: isMobile ? "0 15px" : "0 20px",
      }}
    >
      <img
        src="/images/team-logo.png"
        alt="Team Logo"
        style={{
          width: isMobile ? "120px" : "150px",
          height: isMobile ? "120px" : "150px",
          marginBottom: isMobile ? "20px" : "30px",
        }}
      />
      <h2
        style={{
          fontSize: isMobile ? "22px" : "28px",
          fontWeight: "bold",
          color: darkMode ? "#fff" : "#333",
          marginBottom: isMobile ? "20px" : "30px",
        }}
      >
        Sign in to your account
      </h2>

      <form
        onSubmit={handleLogin}
        style={{
          width: isMobile ? "90%" : "350px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: isMobile ? "15px" : "20px", width: "100%" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: isMobile ? "14px" : "16px",
              color: darkMode ? "#fff" : "#333",
              marginBottom: "8px",
            }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: isMobile ? "12px" : "14px",
              borderRadius: "6px",
              border: darkMode ? "1px solid #777" : "1px solid #ccc",
              backgroundColor: darkMode ? "#222" : "#fff",
              color: darkMode ? "#fff" : "#000",
              fontSize: isMobile ? "16px" : "18px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: isMobile ? "20px" : "30px", width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: isMobile ? "14px" : "16px",
                color: darkMode ? "#fff" : "#333",
              }}
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="forgot-password"
              style={{
                fontSize: isMobile ? "12px" : "14px",
                textDecoration: "none",
                color: darkMode ? "#fff" : "#0066cc",
              }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Password Input with Eye Icon */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: isMobile ? "12px" : "14px",
                paddingRight: "40px", // Space for the eye icon
                borderRadius: "6px",
                border: darkMode ? "1px solid #777" : "1px solid #ccc",
                backgroundColor: darkMode ? "#222" : "#fff",
                color: darkMode ? "#fff" : "#000",
                fontSize: isMobile ? "16px" : "18px",
                boxSizing: "border-box",
              }}
            />
            {/* Eye Icon */}
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
            marginTop: "10px",
            marginBottom: "20px",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: isMobile ? "14px" : "16px",
            color: darkMode ? "#fff" : "#333",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#0066cc",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Sign up
          </Link>
        </div>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "20px", textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default PWAWelcomeLogin;
