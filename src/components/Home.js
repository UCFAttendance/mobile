import React from 'react';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h1>Welcome to Our App</h1>
      <p>Your one-stop solution for all your needs!</p>
      <p>For the best experience, please install our app.</p>
      <button 
        onClick={() => alert('To install, use your browser’s install option.')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          marginTop: '20px'
        }}
      >
        How to Install
      </button>
    </div>
  );
};

export default Home;