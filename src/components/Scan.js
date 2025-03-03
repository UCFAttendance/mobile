import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Scan = () => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doneQr, setDoneQr] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [messageDisplayed, setMessageDisplayed] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    // Start in QR mode
    startCamera('qr');
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Attempt to start the camera in either 'qr' or 'face' mode.
   * If environment or user facingMode fails (e.g., no rear camera),
   * fall back to a generic { video: true } constraint.
   */
  const startCamera = async (mode = 'qr') => {
    // Use environment camera for QR scanning, user camera for face capture.
    const constraints =
      mode === 'qr'
        ? { video: { facingMode: { ideal: 'environment' } } }
        : { video: { facingMode: 'user' } };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      handleStream(stream, mode);
    } catch (error) {
      console.warn("Failed environment/user mode, falling back to { video: true }", error);
      // Fallback if environment/user is not available.
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        handleStream(fallbackStream, mode);
      } catch (fallbackErr) {
        console.error("Camera fallback also failed", fallbackErr);
        if (!messageDisplayed) {
          toast.error('No camera available or permission denied.');
          setMessageDisplayed(true);
          resetMessageFlag();
        }
      }
    }
  };

  /**
   * Once we have a valid stream, attach it to the videoRef, call play(),
   * and if it's QR mode, initialize the QrScanner.
   */
  const handleStream = (stream, mode) => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play();

    if (mode === 'qr') {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => result && handleQrScan(result),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      qrScannerRef.current.start();
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  const resetMessageFlag = () => {
    setTimeout(() => {
      setMessageDisplayed(false);
    }, 5000);
  };

  const handleQrScan = async (result) => {
    if (loading) return;
    setLoading(true);
    stopCamera(); // Turn off the current camera stream

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication error. Please log in.');

      const response = await axios.post(
        `${BASE_URL}/api/v1/attendance/`,
        { token: result.data || result },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Attendance API Response:', response.data);
      toast.success('Attendance recorded successfully!');

      // Check if face recognition is required.
      // In your logic, if face_recognition_enabled is false, you do face capture.
      // Adjust if your API does the opposite.
      const faceRecognitionEnabled = response.data?.session_id?.face_recognition_enabled;
      console.log('Face recognition enabled:', faceRecognitionEnabled);

      if (!faceRecognitionEnabled) {
        setScannedData(response.data);
        setDoneQr(true);
        // Slight delay to let the camera release fully before flipping
        setTimeout(() => {
          startCamera('face');
        }, 300);
      }
    } catch (error) {
      setTimeout(() => {
        if (!messageDisplayed) {
          toast.error(
            error.response?.data?.message || 'Invalid QR Code. Please try again.'
          );
          setMessageDisplayed(true);
          resetMessageFlag();
        }
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCapture = async () => {
    try {
      setLoading(true);
      const video = videoRef.current;
      if (!video) {
        toast.error('No video stream available.');
        return;
      }

      // Create a canvas to capture the image.
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg')
      );
      if (!blob) {
        toast.error('Failed to capture image.');
        return;
      }

      setCapturedImage(URL.createObjectURL(blob));

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication error. Please log in.');


      let uploadUrl = scannedData.face_image_upload_url;

      console.log(uploadUrl);

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      });

      toast.success('Image uploaded successfully. Attendance confirmed!');
      setShowResult(true);
    } catch (error) {
      toast.error('Face verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Scan QR Code</h2>
      <div style={{ marginTop: '20px', maxWidth: '800px', margin: 'auto' }}>
        {doneQr ? (
          <div>
            <video ref={videoRef} playsInline style={styles.video} />
            <button onClick={handlePhotoCapture} style={styles.captureButton}>
              Capture Photo
            </button>
            {capturedImage && (
              <img src={capturedImage} alt="Captured" style={styles.imagePreview} />
            )}
          </div>
        ) : (
          <video ref={videoRef} playsInline style={styles.video} />
        )}
      </div>
      {loading && <p>Processing...</p>}
      {showResult && (
        <div>
          <h3>QR Code and Facial Recognition Successful</h3>
          <button onClick={() => navigate('/dashboard')} style={styles.dashboardButton}>
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  video: {
    width: '100%',
    height: '600px',
    border: '2px solid #ddd',
    borderRadius: '10px',
  },
  captureButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#FFD700',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background 0.3s',
    marginTop: '10px',
  },
  imagePreview: {
    width: '100%',
    maxWidth: '300px',
    height: 'auto',
    marginTop: '10px',
  },
  dashboardButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
};

export default Scan;








// import React, { useState, useEffect } from 'react';
// import { QrReader } from 'react-qr-reader';
// import { toast } from 'react-toastify';

// const Scan = () => {
//   const [scannedData, setScannedData] = useState(null);
//   const [isMobile, setIsMobile] = useState(false); 
//   const errorShownRef = React.useRef(false); 

//   useEffect(() => {
    
//     const checkIfMobile = () => {
//       setIsMobile(window.innerWidth <= 768); 
//     };
//     checkIfMobile();
//     window.addEventListener('resize', checkIfMobile);

//     return () => {
//       window.removeEventListener('resize', checkIfMobile);
//     };
//   }, []);

//   const handleScan = (result) => {
//     if (result?.text) {
//       setScannedData(result.text);
//       toast.success('QR Code scanned successfully!');
//     }
//   };

//   const handleError = (err) => {
//     console.error('QR Scanner Error:', err);
//     if (!errorShownRef.current) {
//       toast.error('Error accessing the camera. Please check permissions.');
//       errorShownRef.current = true; 
//     }
//   };

//   return (
//     <div
//       style={{
//         width: '100vw',
//         height: '100vh',
//         overflow: 'hidden', 
//         margin: '0',
//         padding: '0',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//       }}
//     >
//       {!isMobile && (
//         <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>QR Scanner</h2>
//       )}
//       <div
//         style={{
//           width: isMobile ? '100%' : '800px',
//           height: isMobile ? '100%' : '600px',
//           border: '2px solid #ddd',
//           borderRadius: '10px',
//           overflow: 'hidden', 
//         }}
//       >
//         <QrReader
//           constraints={{
//             video: { facingMode: 'environment' },
//           }}
//           onResult={(result, error) => {
//             if (result) handleScan(result);
//             if (error) handleError(error);
//           }}
//           containerStyle={{
//             width: '100%',
//             height: '100%', 
//           }}
//         />
//       </div>
//       {scannedData && (
//         <p
//           style={{
//             marginTop: '20px',
//             textAlign: 'center',
//             fontSize: '18px',
//             width: isMobile ? '90%' : 'auto', // Adjust width for mobile
//           }}
//         >
//           <strong>Scanned Data:</strong> {scannedData}
//         </p>
//       )}
//     </div>
//   );
// };

// export default Scan;