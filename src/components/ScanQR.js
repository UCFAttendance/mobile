import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import axios from "axios"; // Added axios for consistency with the working version
import { useNavigate } from "react-router-dom";

const ScanQR = () => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastErrorTimeRef = useRef(0);
  const navigate = useNavigate();
  
  const [cameraError, setCameraError] = useState(null);
  const [hasSuccessMessageShown, setHasSuccessMessageShown] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // Function to handle QR scan result
  const handleScan = async (result) => {
    if (!result || isProcessingRef.current) return;
    isProcessingRef.current = true;

    console.log("Scanned QR Code:", result);

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication error. Please log in.");

      // Parse the scanned QR code data
      let scannedData;
      try {
        scannedData = JSON.parse(result.data || result);
      } catch (parseError) {
        console.error("Error parsing QR data:", parseError);
        toast.error("Invalid QR Code format.");
        isProcessingRef.current = false;
        return;
      }

      const { token, locationEnabled = false } = scannedData;

      // API Request Function
      const sendAttendanceRequest = async (latitude = null, longitude = null) => {
        const payload = { token };
        if (locationEnabled) {
          payload.latitude = latitude;
          payload.longitude = longitude;
        }

        const response = await axios.post(
          `${BASE_URL}/api/v1/attendance/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Attendance API Response:", response.data);
        if (response.data?.status === "success") {
          if (!hasSuccessMessageShown) {
            toast.success("Attendance marked successfully!");
            setHasSuccessMessageShown(true);
          }
          navigate("/dashboard");
        } else {
          throw new Error("Invalid QR code response from server.");
        }
      };

      // Handle location requirement
      if (locationEnabled) {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log("User Location:", latitude, longitude);
              await sendAttendanceRequest(latitude, longitude);
            },
            (error) => {
              console.error("Geolocation error:", error);
              toast.error("Location access denied. Enable GPS to proceed.");
              isProcessingRef.current = false;
            }
          );
        } else {
          toast.error("Geolocation is not supported in this browser.");
          isProcessingRef.current = false;
        }
      } else {
        await sendAttendanceRequest();
      }
    } catch (error) {
      const now = Date.now();
      if (now - lastErrorTimeRef.current > 5000) {
        toast.error(
          error.response?.data?.message || error.message || "Invalid QR code. Please try again."
        );
        lastErrorTimeRef.current = now;
      }
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 5000);
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });

        if (videoRef.current) {
          if (videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
          }

          videoRef.current.srcObject = stream;

          videoRef.current.addEventListener('loadeddata', () => {
            if (videoRef.current.paused) {
              videoRef.current.play().catch((err) => console.error('Error starting video playback:', err));
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
        setCameraError(
          error.name === "NotAllowedError"
            ? "Camera access denied. Please allow access."
            : error.name === "NotFoundError"
            ? "No camera found on this device."
            : "Unable to access the camera. Check your device settings."
        );
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
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Scan QR Code</h2>
      <div style={styles.videoContainer}>
        {cameraError ? <p style={styles.errorText}>{cameraError}</p> : <video ref={videoRef} style={styles.video} playsInline />}
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  videoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
    maxWidth: "100%",
    overflow: "hidden",
    border: "none",
  },
  video: {
    width: "clamp(300px, 80%, 800px)",
    height: "auto",
    aspectRatio: "16 / 9",
    display: "block",
    margin: "0",
    border: "none",
    transform: "scaleX(-1)",
  },
  errorText: {
    color: "red",
    fontSize: "18px",
  },
};

export default ScanQR;