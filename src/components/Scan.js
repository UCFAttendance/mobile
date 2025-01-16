import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ScanQR = () => {
  const videoRef = useRef(null); // Reference for the video element
  const qrScannerRef = useRef(null); // Reference for QrScanner instance
  const errorShownRef = useRef(false); // To prevent multiple error toasts
  const [scannedData, setScannedData] = useState(null); // QR code data
  const [loading, setLoading] = useState(false); // API request state
  const [apiCallCount, setApiCallCount] = useState(0); // Count API attempts
  const navigate = useNavigate();

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Use general constraints for both desktop and mobile
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } }, // Prefer back camera, fallback to front
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream; // Attach camera feed to video element
          videoRef.current.play();

          // Initialize QrScanner
          qrScannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              if (result) {
                handleScan(result); // Pass scanned data to handler
              }
            },
            {
              highlightScanRegion: true, // Highlight scanning area
              highlightCodeOutline: true, // Highlight detected code
            }
          );

          qrScannerRef.current.start(); // Start scanning
        }
      } catch (error) {
        console.error('Error accessing the camera:', error);
        if (!errorShownRef.current) {
          toast.error('Error accessing the camera. Please check permissions.');
          errorShownRef.current = true;
        }
      }
    };

    startCamera();

    return () => {
      // Clean up resources
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleScan = async (result) => {
    if (loading) return; // Avoid duplicate API calls
    setLoading(true);

    setApiCallCount((prev) => prev + 1);
    toast.info(`API access attempts: ${apiCallCount + 1}`); // Track API calls

    try {
      console.log('Scanned QR Code:', result.data || result);

      // Send scanned data to the backend
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`,
        { token: result.data || result }
      );

      console.log('Attendance marked successfully:', response.data);
      toast.success('Attendance marked successfully!');

      navigate('/dashboard'); // Redirect to another page
    } catch (error) {
      console.error('Error during attendance marking:', error);
      toast.error('Failed to mark attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Scan QR Code</h2>
      <div style={{ marginTop: '20px', maxWidth: '800px', margin: 'auto' }}>
        {/* Video element for camera feed */}
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '600px',
            border: '2px solid #ddd',
            borderRadius: '10px',
          }}
          playsInline
        />
      </div>
      {loading && <p>Processing...</p>}
      {scannedData && (
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '18px' }}>
          <strong>Scanned Data:</strong> {scannedData}
        </p>
      )}
    </div>
  );
};

export default ScanQR;













// scan doc with signular error message

// import React, { useState, useRef } from 'react';
// import { QrReader } from 'react-qr-reader';
// import { toast } from 'react-toastify';

// const Scan = () => {
//   const [scannedData, setScannedData] = useState(null);
//   const errorShownRef = useRef(false); // Use a ref to track if an error has been shown

//   const handleScan = (result) => {
//     if (result?.text) {
//       setScannedData(result.text);
//       toast.success('QR Code scanned successfully!');
//       errorShownRef.current = false; // Reset error state on success
//     }
//   };

//   const handleError = (err) => {
//     console.error('QR Scanner Error:', err);

//     // Only show the error once per session
//     if (!errorShownRef.current) {
//       errorShownRef.current = true;
//       toast.error('Error accessing the camera. Please check permissions.');
//     }
//   };

//   return (
//     <div>
//       <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>QR Scanner</h2>
//       <div style={{ marginTop: '20px', maxWidth: '800px', margin: 'auto' }}>
//         <QrReader
//           constraints={{
//             video: { facingMode: { exact: "environment" } }
//           }}          
//           onResult={(result, error) => {
//             if (result) handleScan(result); // Handle successful scan
//             if (error) handleError(error); // Handle error gracefully
//           }}
//           containerStyle={{
//             width: '100%',
//             height: '600px', // Increase height for a bigger scanner area
//             border: '2px solid #ddd', // Slightly thicker border for emphasis
//             borderRadius: '10px', // Rounded corners for a modern look
//           }}
//         />
//       </div>
//       {scannedData && (
//         <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '18px' }}>
//           <strong>Scanned Data:</strong> {scannedData}
//         </p>
//       )}
//     </div>
//   );
// };

// export default Scan;







// attempt with background camera

// import React, { useEffect, useRef, useState } from 'react';
// import QrScanner from 'qr-scanner';
// import { toast } from 'react-toastify';

// const Scan = () => {
//   const videoRef = useRef(null);
//   const [scannedData, setScannedData] = useState(null);
//   const errorShownRef = useRef(false); // Prevent multiple error toasts

//   useEffect(() => {
//     let qrScanner;

//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: { exact: "environment" } }, // Use back camera
//         });

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream; // Attach stream to video element
//           videoRef.current.play();

//           // Initialize QR scanner
//           qrScanner = new QrScanner(
//             videoRef.current,
//             (result) => {
//               if (result) {
//                 setScannedData(result);
//                 toast.success('QR Code scanned successfully!');
//               }
//             },
//             {
//               highlightScanRegion: true, // Optional: highlight the scan region
//               highlightCodeOutline: true, // Optional: highlight detected code outline
//             }
//           );
//           qrScanner.start();
//         }
//       } catch (error) {
//         console.error('Error accessing the camera: ', error);

//         if (!errorShownRef.current) {
//           toast.error('Error accessing the camera. Please check permissions.');
//           errorShownRef.current = true;
//         }
//       }
//     };

//     startCamera();

//     return () => {
//       // Cleanup: Stop camera and QR scanner
//       if (qrScanner) {
//         qrScanner.stop();
//       }
//       if (videoRef.current?.srcObject) {
//         const tracks = videoRef.current.srcObject.getTracks();
//         tracks.forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>QR Scanner</h2>
//       <div style={{ marginTop: '20px', maxWidth: '800px', margin: 'auto' }}>
//         {/* Video Element with Styling */}
//         <video
//           ref={videoRef}
//           style={{
//             width: '100%',
//             height: '600px',
//             border: '2px solid #ddd',
//             borderRadius: '10px',
//           }}
//           playsInline
//         />
//       </div>
//       {scannedData && (
//         <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '18px' }}>
//           <strong>Scanned Data:</strong> {scannedData}
//         </p>
//       )}
//     </div>
//   );
// };

// export default Scan;






// keyliz code fixed error message

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { QrReader } from 'react-qr-reader';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const ScanQR = () => {
//   const [loading, setLoading] = useState(false);
//   const [errorHandled, setErrorHandled] = useState(false); // Prevent duplicate error handling
//   const [apiCallCount, setApiCallCount] = useState(0); // Counter for API access attempts
//   const [cameraErrorCount, setCameraErrorCount] = useState(0); // Counter for camera errors
//   const navigate = useNavigate();

//   const handleScan = async (result) => {
//     if (result?.text && !loading) {
//       setLoading(true);
//       setErrorHandled(false);

//       // Increment API access attempt counter
//       setApiCallCount((prevCount) => {
//         const newCount = prevCount + 1;
//         toast.info(`API access attempts: ${newCount}`); // Display updated counter
//         return newCount;
//       });

//       // Check if backend is online
//       if (!process.env.REACT_APP_BASE_URL) {
//         toast.error('Backend is currently offline. Please try again later.');
//         setLoading(false);
//         return;
//       }

//       try {
//         console.log('Scanned QR Code:', result.text);

//         // Send scanned token to the backend
//         const response = await axios.post(
//           `${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`,
//           { token: result.text }
//         );

//         console.log('Attendance marked successfully:', response.data);

//         // Display a success message
//         toast.success('Attendance marked successfully!');

//         // Optionally navigate to another page
//         navigate('/dashboard');
//       } catch (error) {
//         console.error('Error during attendance marking:', error);

//         // Display an error message
//         toast.error('Failed to mark attendance. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleError = (err) => {
//     if (!errorHandled) {
//       console.error('QR Scanner Error:', err);

//       const isCameraError = err.name === 'NotAllowedError' || err.name === 'NotFoundError';

//       if (isCameraError) {
//         // Increment camera error counter without displaying toast.info
//         setCameraErrorCount((prevCount) => prevCount + 1);

//         toast.error('Error accessing the camera. Please check your permissions or try another device.', {
//           toastId: 'cameraErrorToast', // Prevent duplicate error messages
//         });
//       } else {
//         toast.error('No QR code detected. Ensure the QR code is within the frame.', {
//           toastId: 'qrErrorToast', // Prevent duplicate QR error messages
//         });
//       }

//       setErrorHandled(true);

//       // Reset error handling after a delay
//       setTimeout(() => setErrorHandled(false), 3000);
//     }
//   };

//   return (
//     <div style={{ textAlign: 'center', padding: '20px' }}>
//       <h2>Scan QR Code</h2>
//       <div style={{ marginTop: '20px', maxWidth: '500px', margin: 'auto' }}>
//         <QrReader
//           constraints={{
//             video: { facingMode: 'environment' }, // Use the back camera if available
//           }}
//           onResult={(result, error) => {
//             if (result && !errorHandled) {
//               handleScan(result);
//             } else if (error) {
//               // Handle only camera-related errors
//               if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
//                 handleError(error);
//               }
//             }
//           }}
//           containerStyle={{
//             width: '100%',
//             height: '300px',
//             border: '1px solid #ddd',
//             borderRadius: '8px',
//           }}
//         />
//       </div>
//       {loading && <p>Processing...</p>}
//     </div>
//   );
// };

// export default ScanQR;