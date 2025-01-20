import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import PWAWelcomeLogin from './components/PWAWelcomeLogin';
import Dashboard from './components/Dashboard';
import { isPWA } from './utils/detectPWA';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import default styles
import StudentDashboard from './components/StudentDashboard';

function App() {
  const isAppPWA = isPWA(); // Detect if app is running as PWA

  return (
    <Router>
      <div>
        {/* ToastContainer for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* App Routes */}
        <Routes>
          <Route path="/" element={<PWAWelcomeLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student/*" element={<StudentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;