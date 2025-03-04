import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api-auth/v1/password/reset/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        setMessage("Password reset instructions have been sent to your email.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();
        setMessage(data.detail || "An error occurred. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        margin: "0",
        padding: isMobile ? "0 15px" : "0 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "384px", // sm:max-w-sm
        }}
      >
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          style={{
            width: isMobile ? "120px" : "150px",
            height: isMobile ? "120px" : "150px",
            marginBottom: "20px",
          }}
        />
        <h2
          style={{
            fontSize: isMobile ? "22px" : "28px",
            fontWeight: "bold",
            color: darkMode ? "#fff" : "#333",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          Reset your password
        </h2>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "384px",
          marginTop: "40px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
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
              type="email"
              id="email"
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

          {message && (
            <div
              style={{
                padding: "10px",
                marginBottom: "20px",
                borderRadius: "5px",
                backgroundColor: message.includes("error")
                  ? "#ffebee"
                  : "#e8f5e9",
                color: message.includes("error") ? "#c62828" : "#2e7d32",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: isMobile ? "12px" : "14px",
              backgroundColor: isLoading ? "#999" : "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: isMobile ? "16px" : "18px",
              marginBottom: "20px",
            }}
          >
            {isLoading ? "Sending..." : "Send reset instructions"}
          </button>

          <div
            style={{
              textAlign: "center",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            <Link
              to="/#"
              style={{
                color: "#0066cc",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
