import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import PWAWelcomeLogin from './components/PWAWelcomeLogin';
import Dashboard from './components/Dashboard';
import { isPWA } from './utils/detectPWA';

function App() {
  const [isAppPWA, setIsAppPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if the app is running as a PWA
    setIsAppPWA(isPWA());

    // Add event listener for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent the default prompt
      setDeferredPrompt(e); // Store the event to trigger later
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Show the install prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null); // Clear the deferred prompt after use
      });
    }
  };

  return (
    <Router>
      <div>
        {/* Show the install button only in the browser, not in the PWA */}
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
                marginTop: '10px'
              }}
            >
              Install App
            </button>
          </div>
        )}
        <Routes>
          {/* Route for the home page */}
          <Route path="/" element={isAppPWA ? <PWAWelcomeLogin /> : <Home />} />
          {/* Standard login route */}
          <Route path="/login" element={<Login />} />
          {/* Route for the dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
