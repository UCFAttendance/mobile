import React, { useState, useEffect } from 'react';

const Home = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
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
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the installation');
        } else {
          console.log('User dismissed the installation');
        }
        setDeferredPrompt(null);
      });
    }
  };

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

      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginTop: '10px'
          }}
        >
          Install App
        </button>
      )}
    </div>
  );
};

export default Home;
