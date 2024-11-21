import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { toast } from 'react-toastify';

const ScanQR = () => {
  const [loading, setLoading] = useState(false);
  const [errorHandled, setErrorHandled] = useState(false); // Prevent duplicate error handling
  const navigate = useNavigate();

  const handleScan = async (result) => {
    if (result?.text && !loading) {
      setLoading(true);
      setErrorHandled(false); // Reset error state for future errors
      try {
        console.log('Scanned QR Code:', result.text);

        // Send scanned token to the backend
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`,
          { token: result.text }
        );

        console.log('Attendance marked successfully:', response.data);

        // Display a success message
        toast.success('Attendance marked successfully!');

        // Optionally navigate to another page
        navigate('/dashboard');
      } catch (error) {
        console.error('Error during attendance marking:', error);

        // Display an error message
        toast.error('Failed to mark attendance. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    // Ensure only one error is displayed
    if (!errorHandled) {
      console.error('QR Scanner Error:', err);

      // Display a camera error message
      toast.error('Error accessing the camera. Please check your permissions or try another device.');
      setErrorHandled(true); // Prevent duplicate error messages
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Scan QR Code</h2>
      <div style={{ marginTop: '20px', maxWidth: '500px', margin: 'auto' }}>
        <QrReader
          constraints={{
            video: { facingMode: 'environment' }, // Use the back camera if available
          }}
          onResult={(result, error) => {
            if (result && !errorHandled) {
              handleScan(result);
            } else if (error) {
              handleError(error);
            }
          }}
          containerStyle={{
            width: '100%',
            height: '300px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        />
      </div>
      {loading && <p>Processing...</p>}
    </div>
  );
};

export default ScanQR;
