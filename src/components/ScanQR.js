import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ScanQR = () => {
  console.log("[Render] <ScanQR />");

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

  useEffect(() => {
    console.log("[useEffect] Starting environment camera for QR scanning...");

    const startQrCamera = async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        console.log("  -> Got environment camera stream.");
        setStream(cameraStream);

        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = cameraStream;
          qrVideoRef.current.play().catch((err) =>
            console.error("Error playing QR video:", err)
          );

          qrScannerRef.current = new QrScanner(
            qrVideoRef.current,
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
        console.error("Error accessing camera:", error);
        toast.error("Unable to access the camera. Check permissions.");
      }
    };

    startQrCamera();

    return () => {
      console.log("[useEffect cleanup] Stopping QrScanner & camera streams...");
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => {
          console.log("Stopping track:", track);
          track.stop();
        });
        setStream(null);
      }
      if (qrVideoRef.current) {
        qrVideoRef.current.srcObject = null;
      }
      if (faceVideoRef.current) {
        faceVideoRef.current.srcObject = null;
      }
      console.log("[useEffect cleanup] Camera cleanup complete.");
    };
  }, []);

  const stopCamera = () => {
    console.log("[stopCamera] Stopping camera streams...");
    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log("Stopping track:", track);
        track.stop();
      });
      setStream(null);
    }
    if (qrVideoRef.current) {
      qrVideoRef.current.srcObject = null;
    }
    if (faceVideoRef.current) {
      faceVideoRef.current.srcObject = null;
    }
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    console.log("[stopCamera] Camera cleanup complete.");
  };

  const handleScan = async (result) => {
    console.log("[handleScan] -> result:", result);
    if (!result || isProcessingRef.current) return;

    isProcessingRef.current = true;

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication error. Please log in.");

      let scannedData = JSON.parse(result);
      const { token, locationEnabled = false } = scannedData;

      const response = await axios.post(
        `${BASE_URL}/api/v1/attendance/`,
        { token },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      console.log("Attendance API response:", response.data);

      if (response.data?.id >= 0) {
        toast.success("Attendance marked successfully!");

        if (response.data.session_id?.face_recognition_enabled) {
          console.log("Face upload URL received:", response.data.face_image_upload_url);
          setFaceImageUploadUrl(response.data.face_image_upload_url);
          setIsFaceMode(true);

          if (faceVideoRef.current) {
            faceVideoRef.current.srcObject = stream;
            await faceVideoRef.current.play().catch((err) =>
              console.error("Error playing face video:", err)
            );
          }
        } else {
          stopCamera(); 
          navigate("/student/dashboard");
        }
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Invalid QR code. Please try again.");
    } finally {
      setTimeout(() => (isProcessingRef.current = false), 3000);
    }
  };

  const handleCapturePhoto = async () => {
    console.log("[handleCapturePhoto] -> User clicked capture.");

    if (!faceImageUploadUrl) {
      toast.error("Photo capture failed: Missing upload URL.");
      console.error("No faceImageUploadUrl available");
      return;
    }
    if (!faceVideoRef.current || !faceVideoRef.current.srcObject) {
      toast.error("Photo capture failed: No active video stream.");
      console.error(
        "Capture failed: faceVideoRef.current.srcObject:",
        faceVideoRef.current?.srcObject,
        "faceVideoRef.current.readyState:",
        faceVideoRef.current?.readyState
      );
      return;
    }

    setIsCapturing(true);
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      if (faceVideoRef.current.readyState >= 2) break;

      console.log("  -> Face video not ready, waiting 500ms...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      toast.error("Face video stream not ready after multiple attempts.");
      setIsCapturing(false);
      return;
    }

    try {
      console.log("  -> Capturing photo...");
      const video = faceVideoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9)
      );
      console.log("Blob size:", blob.size, "Blob type:", blob.type);

      console.log("  -> Uploading face image to:", faceImageUploadUrl);
      const response = await axios.put(faceImageUploadUrl, blob, {
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      console.log("Upload response:", response.status, response.data);
      if (response.status === 200) {
        toast.success("Face image uploaded successfully!");
        setIsImageUploaded(true);
        stopCamera(); 
        setTimeout(() => {
          navigate("/student/dashboard");
        }, 5000);
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      toast.error("Failed to capture or upload face image.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-8 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-10 w-full text-left mt-8 ml-6">
        Scan QR Code
      </h2>
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          {isFaceMode ? (
            <>
              <video
                ref={faceVideoRef}
                className="w-full max-w-2xl aspect-video rounded-lg shadow-lg"
                playsInline
              />
              {!isImageUploaded && (
                <button
                  onClick={handleCapturePhoto}
                  disabled={isCapturing}
                  className={`mt-4 px-6 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                    isCapturing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isCapturing ? "Capturing..." : "Capture Photo"}
                </button>
              )}
            </>
          ) : (
            <video
              ref={qrVideoRef}
              className="w-full max-w-2xl aspect-video rounded-lg shadow-lg"
              playsInline
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanQR;