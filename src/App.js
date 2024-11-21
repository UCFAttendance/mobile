import React, { useEffect, useState } from 'react';
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
  const [isAppPWA, setIsAppPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    setIsAppPWA(isPWA());

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <Router>
      <div>
        {/* ToastContainer to display notifications */}
        <ToastContainer
          position="top-right" // Position of the toast
          autoClose={3000} // Automatically close after 3 seconds
          hideProgressBar={false} // Show progress bar
          newestOnTop={true} // Display newest notifications on top
          closeOnClick // Allow close on click
          rtl={false} // Left-to-right alignment
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {/* Install button for PWA */}
        {!isAppPWA && deferredPrompt && (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <button
              onClick={handleInstallClick}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                marginTop: '10px',
              }}
            >
              Install App
            </button>
          </div>
        )}

        {/* App Routes */}
        <Routes>
          <Route path="/" element={isAppPWA ? <PWAWelcomeLogin /> : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student/*" element={<StudentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
