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
  const cameraStreamRef = useRef(null);

  const [isFaceMode, setIsFaceMode] = useState(false);
  const [faceImageUploadUrl, setFaceImageUploadUrl] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [forceRender, setForceRender] = useState(false);
  const [apiPayload, setApiPayload] = useState("");
  const [apiError, setApiError] = useState("");

  // Same dark mode check as student dashboard:
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const isProcessingRef = useRef(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // Force a second render on mount.
  useEffect(() => {
    console.log("[useEffect] Forcing second render...");
    setForceRender((prev) => !prev);
  }, []);

  // Helper to get device location.
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

  // Start QR scanning using the back camera (only if not in face mode).
  useEffect(() => {
    if (!isFaceMode) {
      console.log("[useEffect] Starting QR camera (back camera)...");
      const startQrCamera = async () => {
        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
          });
          console.log("[useEffect] Got camera stream:", cameraStream.active);
          cameraStreamRef.current = cameraStream;

          if (qrVideoRef.current) {
            qrVideoRef.current.srcObject = cameraStream;

            qrScannerRef.current = new QrScanner(
              qrVideoRef.current,
              (result) => handleScan(result.data || result),
              { highlightScanRegion: true, highlightCodeOutline: true }
            );

            await qrVideoRef.current.play().catch((err) =>
              console.error("[useEffect] Error playing QR video:", err)
            );
            qrScannerRef.current.start();
          }
        } catch (error) {
          console.error("[useEffect] Error accessing back camera:", error);
          toast.error("Unable to access camera. Check permissions.");
        }
      };
      startQrCamera();

      return () => {
        console.log("[useEffect cleanup] Cleaning up QR camera...");
        if (qrScannerRef.current) {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
          qrScannerRef.current = null;
        }
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach((track) => track.stop());
          cameraStreamRef.current = null;
        }
        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = null;
        }
      };
    }
  }, [forceRender, isFaceMode]);

  // When face mode is activated, switch to the front camera.
  useEffect(() => {
    if (isFaceMode) {
      console.log("[useEffect faceMode] Switching to front camera...");

      // Stop any existing QR scanner.
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
      // Stop old camera stream if it's still running.
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }

      const startFrontCamera = async () => {
        try {
          const frontStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          console.log(
            "[useEffect faceMode] Got front camera stream:",
            frontStream.active
          );
          cameraStreamRef.current = frontStream;

          if (faceVideoRef.current) {
            faceVideoRef.current.srcObject = frontStream;
            await faceVideoRef.current.play().catch((err) =>
              console.error("[useEffect faceMode] Error playing face video:", err)
            );
          }
        } catch (error) {
          console.error("[useEffect faceMode] Error accessing front camera:", error);
          toast.error("Unable to access front camera. Check permissions.");
        }
      };
      startFrontCamera();

      return () => {
        console.log("[useEffect faceMode cleanup] Stopping front camera...");
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach((track) => track.stop());
          cameraStreamRef.current = null;
        }
        if (faceVideoRef.current) {
          faceVideoRef.current.srcObject = null;
        }
      };
    }
  }, [isFaceMode]);

  // Utility to stop any active camera stream.
  const stopCamera = () => {
    console.log("[stopCamera] Stopping camera...");
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (qrVideoRef.current) {
      qrVideoRef.current.srcObject = null;
    }
    if (faceVideoRef.current) {
      faceVideoRef.current.srcObject = null;
    }
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
          toast.error("Unable to get location. Proceeding without it.");
        }
      }

      const payload = JSON.stringify({ token, ...locationData });
      console.log("[handleScan] Sending request with:", { token, ...locationData });
      console.log("[DEBUG] API request payload:", payload);
      setApiPayload(payload);
      setApiError("");

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
            setTimeout(() => {
              window.location.replace("/student/dashboard?refresh=" + Date.now());
            }, 3000);
          }
        }
      } catch (error) {
        console.error("[handleScan] API Error:", error.response?.data || error.message);
        setApiError(JSON.stringify(error.response?.data || error.message));
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("Authentication failed. Please log in again.");
          }
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
            throw new Error("Unable to refresh token. Please log in again.");
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("[handleScan] API Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.detail || error.message || "Failed to mark attendance."
      );
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 3000);
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
    // Overall page container, matching StudentDashboard logic:
    <div
      className={`min-h-screen overflow-y-hidden ${
        isDarkMode ? "bg-[#141414] text-white" : "bg-gray-50 text-gray-900"
      }`}
      style={{ overflowY: "hidden" }}
    >
      {/* Top header (yellow bar) - unchanged, but we handle border color for dark mode */}
      <div
        className="h-[60px] flex items-center justify-between w-full sticky top-0 z-50 border-b-2 border-gray-300"
        style={{
          borderBottomColor: isDarkMode ? "#333" : "#ddd",
          backgroundColor: "#ffce00", // same "bg-yellow-400"
          overflowY: "hidden",
        }}
      >
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          className="w-[60px] h-auto pl-2 rounded-md"
          style={{ overflowY: "hidden" }}
        />
      </div>

      {/* Main 'box' that was gray -- now uses the same logic as "bottom half of widgets" */}
      <main
        className={`w-full mx-auto rounded-xl shadow-sm p-6 pb-12 mt-0 ${
          isDarkMode ? "bg-[#333] text-white" : "bg-white text-black"
        } overflow-y-hidden`}
        style={{ overflowY: "hidden" }}
      >
        <div className="flex flex-col items-center" style={{ overflowY: "hidden" }}>
          <p
            className="mb-4 text-sm"
            style={{ overflowY: "hidden" }}
          >
            {isFaceMode
              ? "Position your face in the frame and capture the photo."
              : "Point your camera at the QR code to mark attendance."}
          </p>
          {isFaceMode ? (
            <div
              className="flex justify-center w-full overflow-y-hidden"
              style={{ overflowY: "hidden" }}
            >
              <video
                ref={faceVideoRef}
                style={{
                  transform: "scaleX(1)",
                  maxWidth: "100%",
                  height: "auto",
                  overflowY: "hidden",
                }}
                playsInline
              />
            </div>
          ) : (
            <div
              className="flex justify-center w-full overflow-y-hidden"
              style={{ overflowY: "hidden" }}
            >
              <video
                ref={qrVideoRef}
                style={{
                  transform: "scaleX(1)",
                  maxWidth: "100%",
                  height: "auto",
                  overflowY: "hidden",
                }}
                playsInline
              />
            </div>
          )}
        </div>
      </main>

      {/* Keep the capture button exactly as before, but fix it above any overflow */}
      {isFaceMode && !isImageUploaded && (
        <div
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50"
          style={{ overflowY: "hidden" }}
        >
          <button
            onClick={handleCapturePhoto}
            disabled={isCapturing}
            className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
            style={{ overflowY: "hidden" }}
          >
            {isCapturing ? "..." : <span role="img" aria-label="capture">📷</span>}
          </button>
        </div>
      )}

      <footer className="w-full mx-auto mt-6 text-center overflow-y-hidden">
        <p
          className="text-xs"
          style={{ overflowY: "hidden" }}
        >
          Ensure your camera is enabled and has sufficient lighting.
        </p>
      </footer>
    </div>
  );
};

export default Scan;
