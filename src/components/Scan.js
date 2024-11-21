import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { toast } from 'react-toastify';

const Scan = () => {
  const [scannedData, setScannedData] = useState(null);

  const handleScan = (result) => {
    if (result?.text) {
      setScannedData(result.text);
      toast.success('QR Code scanned successfully!');
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    toast.error('Error accessing the camera. Please check permissions.');
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>QR Scanner</h2>
      <div style={{ marginTop: '20px', maxWidth: '800px', margin: 'auto' }}>
        <QrReader
          constraints={{
            video: { facingMode: 'environment' }, // Use the back camera if available
          }}
          onResult={(result, error) => {
            if (result) handleScan(result);
            if (error) handleError(error);
          }}
          containerStyle={{
            width: '100%',
            height: '600px', // Increase height for a bigger scanner area
            border: '2px solid #ddd', // Slightly thicker border for emphasis
            borderRadius: '10px', // Rounded corners for a modern look
          }}
        />
      </div>
      {scannedData && (
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '18px' }}>
          <strong>Scanned Data:</strong> {scannedData}
        </p>
      )}
    </div>
  );
};

export default Scan;
