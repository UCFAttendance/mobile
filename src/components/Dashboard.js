import React, { useEffect, useState } from 'react';
import ScanQR from './ScanQR'; // Import the ScanQR component

const Dashboard = () => {
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {


    // Check if authenticated token is available
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No auth token found. Redirecting to login.');
      window.location.href = '/'; 
    }
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      
    </div>
  );
};

export default Dashboard;













// import React from 'react';

// const Dashboard = () => {
//   return (
//     <div style={{ textAlign: 'center', marginTop: '50px' }}>
//       <h1>Welcome to the Dashboard</h1>
//       <p>You are successfully logged in!</p>
//     </div>
//   );
// };

// export default Dashboard;