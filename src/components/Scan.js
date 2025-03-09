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

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  };

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
          await qrVideoRef.current.play().catch((err) =>
            console.error("[useEffect] Error playing QR video:", err)
          );
          qrScannerRef.current = new QrScanner(
            qrVideoRef.current,
            (result) => handleScan(result.data || result),
            { highlightScanRegion: true, highlightCodeOutline: true }
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
          console.log("Student's location:", locationData);
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
      console.error("[handleScan] Error:", error);
      toast.error("Invalid QR code. Please try again.");
    } finally {
      setTimeout(() => (isProcessingRef.current = false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section from MobileDashboard */}
      <div
        className="bg-yellow-400 h-[60px] flex items-center justify-between w-full sticky top-0 z-50 border-b-2 border-gray-300"
      >
        {/* Team Logo (Left) */}
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          className="w-[60px] h-auto pl-2 rounded-md"
        />
      </div>

      <main className="w-full max-w-3xl mx-auto bg-gray-200 rounded-xl shadow-sm p-6 pb-12 mt-24">
        <div className="flex flex-col items-center">
          <p className="mb-4 text-sm text-gray-600">
            {isFaceMode
              ? "Position your face in the frame and capture the photo."
              : "Point your camera at the QR code to mark attendance."}
          </p>
          {isFaceMode ? (
            <>
              <div className="w-full max-w-3xl aspect-video rounded-md border border-gray-200 bg-white overflow-hidden">
                <video
                  ref={faceVideoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                  playsInline
                />
              </div>
            </>
          ) : (
            <div className="w-full max-w-3xl aspect-video rounded-md border border-gray-200 bg-white overflow-hidden">
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
      <footer className="w-full max-w-4xl mx-auto mt-6 text-center">
        <p className="text-xs text-gray-500">
          Ensure your camera is enabled and has sufficient lighting.
        </p>
      </footer>
    </div>
  );
};

export default Scan;
