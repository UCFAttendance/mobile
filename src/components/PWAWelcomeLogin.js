import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PWAWelcomeLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detect if the device is mobile based on screen width
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // Mock successful login for testing
      localStorage.setItem('authToken', 'mock-auth-token');
      console.log('Login bypassed for testing.');
      navigate('/student');
    } catch (error) {
      console.error('Error during login bypass:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#fff',
        margin: '0',
        overflow: 'hidden',
        padding: isMobile ? '0 15px' : '0 20px',
      }}
    >
      {/* Team Logo */}
      <img
        src="/images/team-logo.png"
        alt="Team Logo"
        style={{
          width: isMobile ? '120px' : '150px',
          height: isMobile ? '120px' : '150px',
          marginBottom: isMobile ? '20px' : '30px',
        }}
      />

      {/* Title */}
      <h2
        style={{
          fontSize: isMobile ? '22px' : '28px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: isMobile ? '20px' : '30px',
        }}
      >
        Sign in to your account
      </h2>

      {/* Form */}
      <form
        onSubmit={handleLogin}
        style={{
          width: isMobile ? '90%' : '350px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Email Field */}
        <div style={{ marginBottom: isMobile ? '15px' : '20px', width: '100%' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: isMobile ? '14px' : '16px',
              color: '#333',
              marginBottom: '8px',
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
              width: '100%',
              padding: isMobile ? '12px' : '14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: isMobile ? '16px' : '18px',
              boxSizing: 'border-box', // Ensures width includes padding and border
            }}
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: isMobile ? '20px' : '30px', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: isMobile ? '14px' : '16px',
                color: '#333',
              }}
            >
              Password
            </label>
            <a
              href="#"
              style={{
                fontSize: isMobile ? '12px' : '14px',
                color: '#007bff',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: isMobile ? '12px' : '14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: isMobile ? '16px' : '18px',
              boxSizing: 'border-box', // Ensures width includes padding and border
            }}
          />
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          style={{
            width: '100%', // Match the input fields
            padding: isMobile ? '12px' : '14px',
            fontSize: isMobile ? '16px' : '18px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Sign in
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <p style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default PWAWelcomeLogin;