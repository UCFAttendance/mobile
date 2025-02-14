import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { toast } from 'react-toastify';

const Scan = () => {
  const [scannedData, setScannedData] = useState(null);
  const [isMobile, setIsMobile] = useState(false); 
  const errorShownRef = React.useRef(false); 

  useEffect(() => {
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); 
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleScan = (result) => {
    if (result?.text) {
      setScannedData(result.text);
      toast.success('QR Code scanned successfully!');
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    if (!errorShownRef.current) {
      toast.error('Error accessing the camera. Please check permissions.');
      errorShownRef.current = true; 
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden', 
        margin: '0',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!isMobile && (
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>QR Scanner</h2>
      )}
      <div
        style={{
          width: isMobile ? '100%' : '800px',
          height: isMobile ? '100%' : '600px',
          border: '2px solid #ddd',
          borderRadius: '10px',
          overflow: 'hidden', 
        }}
      >
        <QrReader
          constraints={{
            video: { facingMode: 'environment' },
          }}
          onResult={(result, error) => {
            if (result) handleScan(result);
            if (error) handleError(error);
          }}
          containerStyle={{
            width: '100%',
            height: '100%', 
          }}
        />
      </div>
      {scannedData && (
        <p
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '18px',
            width: isMobile ? '90%' : 'auto', // Adjust width for mobile
          }}
        >
          <strong>Scanned Data:</strong> {scannedData}
        </p>
      )}
    </div>
  );
};

export default Scan;
