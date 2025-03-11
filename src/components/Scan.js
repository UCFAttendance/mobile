import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomOverlay = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      try {
        svgRef.current.animate(
          { transform: ["scale(.98)", "scale(1.01)"] },
          {
            duration: 600,
            iterations: Infinity,
            direction: "alternate",
            easing: "ease-in-out",
          }
        );
      } catch (error) {
        console.error("Animation error:", error);
      }
    }
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none flex justify-center items-center"
      style={{ transform: "translateY(-5rem)" }}
    >
      <svg
        ref={svgRef}
        className="scan-region-highlight-svg"
        viewBox="0 0 238 238"
        preserveAspectRatio="none"
        style={{
          width: "50%",
          height: "25%",
          fill: "none",
          stroke: "#e9b213",
          strokeWidth: 8,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      >
        <path d="M31 2H10a8 8 0 0 0-8 8v21M207 2h21a8 8 0 0 1 8 8v21m0 176v21a8 8 0 0 1-8 8h-21m-176 0H10a8 8 0 0 1-8-8v-21" />
      </svg>
    </div>
  );
};

const Scan = () => {
  console.log("[Render] <Scan />");

  const qrVideoRef = useRef(null);
  const faceVideoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isFaceMode, setIsFaceMode] = useState(false);
  const [faceImageUploadUrl, setFaceImageUploadUrl] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [errors, setErrors] = useState([]);
  const isProcessingRef = useRef(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [forceRender, setForceRender] = useState(false);

  const addError = (message) => {
    setErrors((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    console.log("[useEffect] Forcing second render...");
    setForceRender((prev) => !prev);
  }, []);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  const checkCameraPermission = async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      console.log("[checkCameraPermission] Permissions API not supported");
      return "prompt";
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" });
      console.log("[checkCameraPermission] Camera permission state:", permissionStatus.state);
      return permissionStatus.state;
    } catch (error) {
      console.error("[checkCameraPermission] Error checking permission:", error);
      return "prompt";
    }
  };

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");

    const startQrCamera = async () => {
      const cachedPermission = localStorage.getItem("cameraPermission");
      const permissionState = await checkCameraPermission();

      if (cachedPermission === "granted" && permissionState === "granted") {
        console.log("[startQrCamera] Permission already granted, skipping prompt");
      } else if (permissionState === "denied") {
        addError("Camera access denied. Please enable it in your browser settings.");
        return;
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        setStream(cameraStream);

        localStorage.setItem("cameraPermission", "granted");
        console.log("[startQrCamera] Camera access granted and cached");

        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = cameraStream;
          qrScannerRef.current = new QrScanner(
            qrVideoRef.current,
            (result) => handleScan(result.data || result),
            { highlightScanRegion: false, highlightCodeOutline: false }
          );
          await qrVideoRef.current.play().catch((err) =>
            console.error("[useEffect] Error playing QR video:", err)
          );
          qrScannerRef.current.start();
        }
      } catch (error) {
        console.error("[useEffect] Error accessing camera:", error);
        addError("Unable to access camera. Check permissions.");
        localStorage.setItem("cameraPermission", "denied");
      }
    };

    startQrCamera();

    return () => {
      stopCamera();
    };
  }, [forceRender]);

  useEffect(() => {
    if (isFaceMode) {
      const switchToFrontCamera = async () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        try {
          const frontCameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          setStream(frontCameraStream);

          if (faceVideoRef.current) {
            faceVideoRef.current.srcObject = frontCameraStream;
            faceVideoRef.current.play().catch((err) =>
              console.error("[useEffect faceMode] Error playing front camera video:", err)
            );
          }
        } catch (error) {
          console.error("[useEffect faceMode] Error switching to front camera:", error);
          addError("Unable to switch to front camera.");
        }
      };

      switchToFrontCamera();
    }
  }, [isFaceMode]);

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (qrVideoRef.current) qrVideoRef.current.srcObject = null;
    if (faceVideoRef.current) faceVideoRef.current.srcObject = null;
  };

  const handleScan = async (result) => {
    if (!result || isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication error. Please log in.");

      let token;
      let locationEnabled = false;

      try {
        const scannedData = JSON.parse(result);
        token = scannedData.token;
        locationEnabled = scannedData.locationEnabled || false;
      } catch (parseError) {
        console.log("[handleScan] QR code is not JSON, treating as plain token:", result);
        token = result;
      }

      if (!token) throw new Error("No token found in QR code.");

      let locationData = {};
      if (locationEnabled) {
        try {
          const position = await getLocation();
          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (error) {
          console.error("Error getting location:", error);
          addError("Unable to get location. Proceeding without it.");
        }
      }

      console.log("[handleScan] Sending payload:", { token, ...locationData });
      const response = await axios.post(
        `${BASE_URL}/api/v1/attendance/`,
        JSON.stringify({ token, ...locationData }), // Stringify payload like ScanQR
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set Content-Type
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.id >= 0) {
        setErrors([]);
        console.log("Attendance marked successfully:", response.data);
        if (response.data.session_id?.face_recognition_enabled) {
          setFaceImageUploadUrl(response.data.face_image_upload_url);
          setIsFaceMode(true);
        } else {
          stopCamera();
          setTimeout(() => {
            window.location.replace("/student/dashboard?refresh=" + Date.now());
          }, 3000);
        }
      }
    } catch (error) {
      console.error("[handleScan] Error:", error);
      if (error.response?.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          addError("Authentication failed. Please log in again.");
          setTimeout(() => {
            window.location.replace("/");
          }, 1500);
        } else {
          try {
            const refreshResponse = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/api-auth/v1/token/refresh/`,
              { refresh: refreshToken }
            );
            const newToken = refreshResponse.data.access;
            localStorage.setItem("accessToken", newToken);
            window.location.reload();
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            addError("Unable to refresh token. Please log in again.");
            setTimeout(() => {
              window.location.replace("/");
            }, 1500);
          }
        }
      } else {
        const errorMessage = error.response?.data?.detail || error.message || "Invalid QR code. Please try again.";
        addError(`Scan error: ${errorMessage}`);
      }
    } finally {
      setTimeout(() => (isProcessingRef.current = false), 3000);
    }
  };

  const handleCapturePhoto = async () => {
    if (!faceImageUploadUrl || !faceVideoRef.current) {
      addError("Capture failed: Missing setup.");
      return;
    }

    if (!faceVideoRef.current.srcObject || faceVideoRef.current.readyState === 0) {
      addError("No active video stream. Please try again.");
      return;
    }

    setIsCapturing(true);
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts && faceVideoRef.current.readyState < 2) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }

    if (faceVideoRef.current.readyState < 2) {
      addError("Video stream not ready.");
      setIsCapturing(false);
      return;
    }

    try {
      const video = faceVideoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );

      const response = await axios.put(faceImageUploadUrl, blob, {
        headers: { "Content-Type": "image/jpeg" },
      });

      if (response.status === 200) {
        setErrors([]);
        console.log("Face image uploaded successfully!");
        setIsImageUploaded(true);
        stopCamera();
        setTimeout(() => {
          window.location.replace("/student/dashboard?refresh=" + Date.now());
        }, 3000);
      }
    } catch (error) {
      console.error("[handleCapturePhoto] Error:", error);
      addError("Failed to capture or upload photo.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        isDarkMode ? "bg-[#141414] text-white" : "bg-gray-50 text-gray-900"
      }`}
      style={{ overflowY: "hidden !important" }}
    >
      <div
        className="bg-yellow-400 h-[60px] flex items-center justify-between w-full sticky top-0 z-50 border-b-2 border-gray-300"
        style={{
          borderBottomColor: isDarkMode ? "#333" : "#ddd",
        }}
      >
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          className="w-[60px] h-auto pl-2 rounded-md"
        />
      </div>

      <main className="flex-1 relative overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {isFaceMode ? (
            <>
              <video
                ref={faceVideoRef}
                className="h-[calc(100vh-4rem)] w-auto object-contain"
                style={{ transform: "scaleX(-1)" }}
                playsInline
              />
              {!isImageUploaded && (
                <div className="absolute bottom-8 w-full flex justify-center">
                  <button
                    onClick={handleCapturePhoto}
                    disabled={isCapturing}
                    className="relative"
                    style={{ width: "72px", height: "72px" }}
                  >
                    <div className="absolute inset-0 rounded-full bg-white" />
                    <div className="absolute w-16 h-16 rounded-full bg-yellow-400 bottom-12 left-2" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <video
                ref={qrVideoRef}
                className="h-[calc(100vh-4rem)] w-auto object-contain"
                style={{ transform: "scaleX(1) translateY(-90px)" }}
                playsInline
              />
              <CustomOverlay />
            </>
          )}
        </div>
      </main>

      {errors.length > 0 && (
        <div className="p-4 text-red-500 text-sm">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scan;