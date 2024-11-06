import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);

    try {

      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api-auth/v1/login/`, { email, password }, { headers: { 'Content-Type': 'application/json' } });

      // Store token, navigate to the dashboard
      localStorage.setItem('authToken', response.data.token);
      navigate('/dashboard');

    } catch (err) {
      // Set error message if login fails
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{
        padding: '40px', 
        maxWidth: '400px', 
        width: '100%', 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
        borderRadius: '8px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '10px', 
              marginBottom: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ccc', 
              fontSize: '16px'
            }}
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '10px', 
              marginBottom: '20px', 
              borderRadius: '5px', 
              border: '1px solid #ccc', 
              fontSize: '16px'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '10px', 
              fontSize: '16px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;