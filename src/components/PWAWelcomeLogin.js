import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PWAWelcomeLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  
  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api-auth/v1/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Please check your credentials.');
      }
  
      // Store tokens and user info in localStorage
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user)); // Store user object as a string
  
      console.log('Login successful:', data.user);
      navigate('/student');  // Redirect to student dashboard
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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
      <img
        src="/images/team-logo.png"
        alt="Team Logo"
        style={{
          width: isMobile ? '120px' : '150px',
          height: isMobile ? '120px' : '150px',
          marginBottom: isMobile ? '20px' : '30px',
        }}
      />
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

      <form
        onSubmit={handleLogin}
        style={{
          width: isMobile ? '90%' : '350px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
              boxSizing: 'border-box',
            }}
          />
        </div>

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
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: isMobile ? '12px' : '14px',
            fontSize: isMobile ? '16px' : '18px',
            backgroundColor: loading ? '#999' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px',
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default PWAWelcomeLogin;
