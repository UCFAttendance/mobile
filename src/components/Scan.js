import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
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
      style={{ transform: "translateY(-2.1rem)" }}
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
  const isProcessingRef = useRef(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [forceRender, setForceRender] = useState(false);

  // Force a second render after the initial render
  useEffect(() => {
    console.log("[useEffect] Forcing second render...");
    setForceRender((prev) => !prev);
  }, []);

  // Helper function to get the device's location
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  // Check camera permission state
  const checkCameraPermission = async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      console.log("[checkCameraPermission] Permissions API not supported");
      return "prompt"; // Fallback to prompt if API unavailable
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" });
      console.log("[checkCameraPermission] Camera permission state:", permissionStatus.state);
      return permissionStatus.state; // "granted", "denied", or "prompt"
    } catch (error) {
      console.error("[checkCameraPermission] Error checking permission:", error);
      return "prompt"; // Default to prompt on error
    }
  };

  // Start the camera for QR scanning with permission handling
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");

    const startQrCamera = async () => {
      // Check if we've stored a previous "granted" permission
      const cachedPermission = localStorage.getItem("cameraPermission");
      const permissionState = await checkCameraPermission();

      if (cachedPermission === "granted" && permissionState === "granted") {
        console.log("[startQrCamera] Permission already granted, skipping prompt");
      } else if (permissionState === "denied") {
        toast.error("Camera access denied. Please enable it in your browser settings.");
        return;
      }

      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        setStream(cameraStream);

        // Store permission as granted once user allows it
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
        toast.error("Unable to access camera. Check permissions.");
        localStorage.setItem("cameraPermission", "denied"); // Cache denial
      }
    };

    startQrCamera();

    return () => {
      stopCamera();
    };
  }, [forceRender]);

  // Assign stream to faceVideoRef when isFaceMode changes
  useEffect(() => {
    if (isFaceMode && faceVideoRef.current && stream) {
      faceVideoRef.current.srcObject = stream;
      faceVideoRef.current.play().catch((err) =>
        console.error("[useEffect faceMode] Error playing face video:", err)
      );
    }
  }, [isFaceMode, stream]);

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

      let scannedData = JSON.parse(result);
      const { token, locationEnabled = false } = scannedData;

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
          toast.error("Unable to get location. Proceeding without it.");
        }
      }

      const response = await axios.post(
        `${BASE_URL}/api/v1/attendance/`,
        { token, ...locationData },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data?.id >= 0) {
        toast.success("Attendance marked successfully!");
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
          toast.error("Authentication failed. Please log in again.");
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
            toast.error("Unable to refresh token. Please log in again.");
            setTimeout(() => {
              window.location.replace("/");
            }, 1500);
          }
        }
      } else {
        toast.error("Invalid QR code. Please try again.");
      }
    } finally {
      setTimeout(() => (isProcessingRef.current = false), 3000);
    }
  };

  const handleCapturePhoto = async () => {
    if (!faceImageUploadUrl || !faceVideoRef.current) {
      toast.error("Capture failed: Missing setup.");
      return;
    }

    if (!faceVideoRef.current.srcObject || faceVideoRef.current.readyState === 0) {
      toast.error("No active video stream. Please try again.");
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
      toast.error("Video stream not ready.");
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
        toast.success("Face image uploaded successfully!");
        setIsImageUploaded(true);
        stopCamera();
        setTimeout(() => {
          window.location.replace("/student/dashboard?refresh=" + Date.now());
        }, 3000);
      }
    } catch (error) {
      console.error("[handleCapturePhoto] Error:", error);
      toast.error("Failed to capture or upload photo.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        isDarkMode ? "bg-[#141414] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header className="bg-yellow-400 h-16 flex items-center justify-between w-full flex-shrink-0">
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          className="w-16 h-auto pl-2 rounded-md"
        />
      </header>

      {/* Main Content: Video fills remaining vertical space */}
      <main className="flex-1 relative overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {isFaceMode ? (
            <>
              <video
                ref={faceVideoRef}
                className="h-full w-auto object-contain"
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
                className="h-full w-auto object-contain"
                style={{ transform: "scaleX(-1) translateY(-33px)" }}
                playsInline
              />
              <CustomOverlay />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Scan;