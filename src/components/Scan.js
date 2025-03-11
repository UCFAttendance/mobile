import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const [forceRender, setForceRender] = useState(false);

  const isProcessingRef = useRef(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

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

  // Start the camera for QR scanning
  useEffect(() => {
    console.log("[useEffect] Starting QR camera...");
    const startQrCamera = async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        console.log("[useEffect] Got camera stream:", cameraStream.active);
        setStream(cameraStream);

        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = cameraStream;

          qrScannerRef.current = new QrScanner(
            qrVideoRef.current,
            (result) => handleScan(result),
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
              overlay: document.createElement("div"), // Ensure overlay is created
            }
          );

          await qrVideoRef.current.play().catch((err) =>
            console.error("[useEffect] Error playing QR video:", err)
          );

          qrScannerRef.current.start();
          qrScannerRef.current.$overlay.style.zIndex = "30"; // Ensure overlay is above video
          qrScannerRef.current.$overlay.style.position = "absolute";
          qrScannerRef.current.$overlay.style.top = "0";
          qrScannerRef.current.$overlay.style.left = "0";
          qrScannerRef.current.$overlay.style.width = "100%";
          qrScannerRef.current.$overlay.style.height = "100%";
        }
      } catch (error) {
        console.error("[useEffect] Error accessing camera:", error);
        toast.error("Unable to access camera. Check permissions.");
      }
    };
    startQrCamera();

    return () => {
      console.log("[useEffect cleanup] Cleaning up...");
      stopCamera();
    };
  }, [forceRender]);

  // Assign stream to faceVideoRef when isFaceMode changes
  useEffect(() => {
    if (isFaceMode && faceVideoRef.current && stream) {
      console.log("[useEffect faceMode] Stream active:", stream.active);
      if (!stream.active) {
        console.error("[useEffect faceMode] Stream is inactive. Reinitializing...");
        toast.error("Camera stream lost. Please refresh the page.");
        return;
      }
      faceVideoRef.current.srcObject = stream;
      faceVideoRef.current.play().catch((err) =>
        console.error("[useEffect faceMode] Error playing face video:", err)
      );
    }
  }, [isFaceMode, stream]);

  const stopCamera = () => {
    console.log("[stopCamera] Stopping camera...");
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

    console.log("[handleScan] Raw QR scan result:", result);

    let scannedData;
    try {
      scannedData = JSON.parse(result);
    } catch (error) {
      console.error("[handleScan] Error parsing QR code data:", error);
      toast.error("Invalid QR code format. Please try again.");
      isProcessingRef.current = false;
      return;
    }

    const { token, locationEnabled = false } = scannedData;

    if (!token) {
      console.error("[handleScan] No token found in QR data.");
      toast.error("Invalid QR code. Please try again.");
      isProcessingRef.current = false;
      return;
    }

    try {
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication error. Please log in.");

      let locationData = {};
      if (locationEnabled) {
        try {
          const position = await getLocation();
          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log("Student's location:", locationData);
        } catch (error) {
          console.error("Error getting location:", error);
          if (locationEnabled) {
            toast.error("Location access is required to mark attendance.");
            isProcessingRef.current = false;
            return;
          }
        }
      }

      const payload = JSON.stringify({ token, ...locationData });
      console.log("[handleScan] Sending request with:", { token, ...locationData });
      console.log("[DEBUG] API request payload:", payload);

      const axiosInstance = axios.create({
        baseURL: BASE_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      try {
        const response = await axiosInstance.post("/api/v1/attendance/", payload);

        console.log("[handleScan] API response:", response.data);
        if (response.data?.id >= 0) {
          toast.success("Attendance marked successfully!");
          if (response.data.session_id?.face_recognition_enabled) {
            setFaceImageUploadUrl(response.data.face_image_upload_url);
            setIsFaceMode(true);
          } else {
            stopCamera();
            // setTimeout(() => {
            //   window.location.replace("/student/dashboard?refresh=" + Date.now());
            // }, 3000);
          }
        }
      } catch (error) {
        console.error("[handleScan] API Error:", error.response?.data || error.message);
        const status = error.response?.status;
        const detail = error.response?.data?.detail || error.message;
        if (status === 401) {
          toast.error(`401 - ${detail}. Please log in again.`);
        } else if (status === 404) {
          toast.error(`404 - ${detail}. Resource not found.`);
        } else {
          toast.error(`Error: ${detail}`);
        }
        if (status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token available.");

          try {
            const refreshResponse = await axios.post(
              `${BASE_URL}/api-auth/v1/token/refresh/`,
              { refresh: refreshToken }
            );
            accessToken = refreshResponse.data.access;
            localStorage.setItem("accessToken", accessToken);

            const retryResponse = await axios.post(
              `${BASE_URL}/api/v1/attendance/`,
              payload,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            console.log("[handleScan] Retry API response:", retryResponse.data);
            if (retryResponse.data?.id >= 0) {
              toast.success("Attendance marked successfully!");
              if (retryResponse.data.session_id?.face_recognition_enabled) {
                setFaceImageUploadUrl(retryResponse.data.face_image_upload_url);
                setIsFaceMode(true);
              } else {
                stopCamera();
                setTimeout(() => {
                  window.location.replace("/student/dashboard?refresh=" + Date.now());
                }, 3000);
              }
            }
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            toast.error("Unable to refresh token. Please log in again.");
          }
        }
      }
    } catch (error) {
      console.error("[handleScan] API Error:", error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setTimeout(() => (isProcessingRef.current = false), 3000);
    }
  };

  const handleCapturePhoto = async () => {
    if (!faceImageUploadUrl || !faceVideoRef.current) {
      toast.error("Capture failed: Missing setup.");
      return;
    }

    console.log("[handleCapturePhoto] Checking video state...");
    console.log("  srcObject:", faceVideoRef.current.srcObject);
    console.log("  readyState:", faceVideoRef.current.readyState);

    if (!faceVideoRef.current.srcObject || faceVideoRef.current.readyState === 0) {
      toast.error("No active video stream. Please try again.");
      return;
    }

    setIsCapturing(true);
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts && faceVideoRef.current.readyState < 2) {
      console.log("[handleCapturePhoto] Video not ready, waiting...");
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
      console.log("[handleCapturePhoto] Blob created:", blob.size);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div
        className="bg-yellow-400 h-[60px] flex items-center justify-between w-full sticky top-0 z-50 border-b-2 border-gray-300"
      >
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          className="w-[60px] h-auto pl-2 rounded-md"
        />
      </div>

      {/* Main Content - Full-screen video */}
      <div className="flex-1 relative">
        <video
          ref={qrVideoRef}
          className="w-full h-full object-cover fixed top-0 left-0 z-10"
          style={{ transform: "scaleX(1)" }}
          playsInline
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          {isFaceMode ? (
            <>
              <video
                ref={faceVideoRef}
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(1)" }}
                playsInline
              />
              {!isImageUploaded && (
                <button
                  onClick={handleCapturePhoto}
                  disabled={isCapturing}
                  className="relative mx-auto mt-auto mb-16 z-30"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "transparent",
                    border: "4px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <span
                    className={`flex items-center justify-center text-white font-medium rounded-full ${
                      isCapturing ? "bg-gray-400" : "bg-yellow-400 hover:bg-yellow-500"
                    }`}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                    }}
                  >
                    {isCapturing ? "Capturing..." : "Capture"}
                  </span>
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto mt-6 text-center pb-4">
        <p className="text-xs text-gray-500">
          Ensure your camera is enabled and has sufficient lighting.
        </p>
      </footer>
    </div>
  );
};

export default Scan;