import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ScanQR = () => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const canvasRef = useRef(null); // For capturing images
  const isProcessingRef = useRef(false);
  const lastErrorTimeRef = useRef(0);
  const navigate = useNavigate();

  const [cameraError, setCameraError] = useState(null);
  const [hasSuccessMessageShown, setHasSuccessMessageShown] = useState(false);
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(false);
  const [faceImageUploadUrl, setFaceImageUploadUrl] = useState(null);
  const [showCaptureButton, setShowCaptureButton] = useState(false);

  // Function to validate QR Token with API
  const validateQRToken = async (qrToken) => {
    try {
      let accessToken = localStorage.getItem("accessToken");

      console.log("Sending QR Token to API:", qrToken);

      let response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: qrToken }),
      });

      if (response.status === 401) {
        console.warn("Access token expired. Attempting to refresh...");

        // Attempt to refresh the access token
        accessToken = await refreshAccessToken();

        // Retry the request with the new token
        response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/attendance/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ token: qrToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit attendance after refreshing token.");
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Invalid request: ${errorText}`);
      }

      const data = await response.json();
      console.log("Attendance API Response:", data);


      if (data.session_id.face_recognition_enabled) {
        setFaceRecognitionEnabled(true);
        setFaceImageUploadUrl(data.face_image_upload_url);
        setShowCaptureButton(true);
      }

      return data;
    } catch (error) {
      console.error("Error validating QR code:", error);
      throw error;
    }
  };

  // Function to refresh access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available.");
    }

    console.log("Refreshing Access Token...");
  
    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token.");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.access);
    return data.access;
  };

  // Function to handle QR scan result
  const handleScan = async (result) => {
    if (!result || isProcessingRef.current) return;
    isProcessingRef.current = true;

    console.log("Scanned QR Code:", result);

    try {
      const response = await validateQRToken(result);

      if (response?.status === "success") {
        if (!hasSuccessMessageShown) {
          toast.success("Attendance marked successfully!");
          setHasSuccessMessageShown(true);
        }

        if (!response.session_id.face_recognition_enabled) {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Invalid QR code. Please scan a valid code.");
      }
    } catch (error) {
      const now = Date.now();
      if (now - lastErrorTimeRef.current > 5000) {
        toast.error(error.message || "Invalid QR code. Please try again.");
        lastErrorTimeRef.current = now;
      }
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 5000);
    }
  };

  // Function to capture image and send to API
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !faceImageUploadUrl) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to blob
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob);

      try {
        const response = await fetch(faceImageUploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload face image.");
        
        toast.success("Face verification submitted!");
        navigate("/dashboard");

      } catch (error) {
        console.error("Error uploading face image:", error);
        toast.error("Face image upload failed. Try again.");
      }
    }, "image/jpeg");
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: faceRecognitionEnabled
              ? { ideal: "user" } // Selfie mode for face recognition
              : { ideal: "environment" }, // Default for non-face-recognition
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          if (videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          }

          videoRef.current.srcObject = stream;

          videoRef.current.addEventListener("loadeddata", () => {
            if (videoRef.current.paused) {
              videoRef.current.play().catch((err) => console.error("Error starting video playback:", err));
            }
          });

          qrScannerRef.current = new QrScanner(
            videoRef.current,
            (result) => handleScan(result.data || result),
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
              willReadFrequently: true,
            }
          );

          qrScannerRef.current.start();
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
        setCameraError("Unable to access the camera. Check your device settings.");
      }
    };

    startCamera();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [faceRecognitionEnabled]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Scan QR Code</h2>
      <div>
        {cameraError ? <p style={{ color: "red" }}>{cameraError}</p> : <video ref={videoRef} style={{ transform: "scaleX(-1)", width: "80%" }} playsInline />}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480"></canvas>
      {showCaptureButton && (
        <button onClick={captureImage} style={{ marginTop: "10px", padding: "10px 20px", fontSize: "16px" }}>
          Capture Face Image
        </button>
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