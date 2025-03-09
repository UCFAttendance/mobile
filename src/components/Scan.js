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

  const isProcessingRef = useRef(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

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
            (result) => handleScan(result.data || result),
            { highlightScanRegion: true, highlightCodeOutline: true }
          );
          await qrVideoRef.current.play().catch((err) =>
            console.error("[useEffect] Error playing QR video:", err)
          );
          qrScannerRef.current.start();
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
  }, []);

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

    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("Authentication error. Please log in.");

      // Parse the QR code data
      let scannedData = JSON.parse(result);
      const { token, locationEnabled = false } = scannedData;

      // Initialize location data
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

      // Make the API request
      const response = await axios.post(
        `${BASE_URL}/api/v1/attendance/`,
        { token, ...locationData },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      console.log("[handleScan] API response:", response.data);
      if (response.data?.id >= 0) {
        toast.success("Attendance marked successfully!");
        if (response.data.session_id?.face_recognition_enabled) {
          console.log("[handleScan] Face mode enabled. Upload URL:", response.data.face_image_upload_url);
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
      toast.error("Invalid QR code. Please try again.");
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
      <div className="bg-yellow-400 h-[60px] flex items-center justify-between w-full sticky top-0 z-50 border-b-2 border-gray-300">
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          className="w-[60px] h-auto pl-2 rounded-md"
        />
      </div>

      {/* Main Content */}
      <main className="p-6 flex-1 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Scan QR Code</h1>
        <div className="flex flex-col items-center">
          <p className="mb-4 text-sm text-gray-600">
            {isFaceMode
              ? "Position your face in the frame and capture the photo."
              : "Point your camera at the QR code to mark attendance."}
          </p>
          {isFaceMode ? (
            <>
              <div className="w-full max-w-md aspect-video rounded-md border border-gray-200 bg-white overflow-hidden">
                <video
                  ref={faceVideoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                  playsInline
                />
              </div>
              {!isImageUploaded && (
                <button
                  onClick={handleCapturePhoto}
                  disabled={isCapturing}
                  className={`mt-6 px-6 py-2 rounded-md text-white font-medium ${
                    isCapturing ? "bg-gray-400" : "bg-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {isCapturing ? "Capturing..." : "Capture Photo"}
                </button>
              )}
            </>
          ) : (
            <div className="w-full max-w-md aspect-video rounded-md border border-gray-200 bg-white overflow-hidden">
              <video
                ref={qrVideoRef}
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
                playsInline
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-200 p-2 flex justify-around">
        <a href="/student/dashboard" className="text-gray-700 text-center">
          <span className="block">Dashboard</span>
          <i className="fas fa-home"></i>
        </a>
        <a href="/student/scan" className="text-blue-600 text-center">
          <span className="block">Scan</span>
          <i className="fas fa-qrcode"></i>
        </a>
        <a href="/student/history" className="text-gray-700 text-center">
          <span className="block">History</span>
          <i className="fas fa-history"></i>
        </a>
        <a href="/student/settings" className="text-gray-700 text-center">
          <span className="block">Settings</span>
          <i className="fas fa-cog"></i>
        </a>
      </div>
    </div>
  );
};

export default Scan;
