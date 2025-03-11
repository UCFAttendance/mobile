import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ScanQR = () => {
  console.log("[Render] <ScanQR />");

  const qrVideoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [stream, setStream] = useState(null);
  const isProcessingRef = useRef(false);
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // Ensure the worker script is properly referenced
  QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";

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
        if (qrScannerRef.current) {
          console.warn("[WARNING] Stopping and destroying existing QR scanner...");
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
          qrScannerRef.current = null;
        }

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        console.log("[useEffect] Got camera stream:", cameraStream.active);
        setStream(cameraStream);

        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = cameraStream;

          // Ensure the video is playing before initializing the scanner
          await qrVideoRef.current.play();
          console.log("[useEffect] Video stream started.");

          qrScannerRef.current = new QrScanner(
            qrVideoRef.current,
            (result) => handleScan(result.data || result),
            { highlightScanRegion: true, highlightCodeOutline: true }
          );

          console.log("[DEBUG] QR Scanner initialized.");
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

      console.log("[handleScan] Sending request with:", { token, ...locationData });

      const axiosInstance = axios.create({
        baseURL: BASE_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      try {
        const response = await axiosInstance.post(
          "/api/v1/attendance/",
          JSON.stringify({ token, ...locationData })
        );

        console.log("[handleScan] API response:", response.data);
        if (response.data?.id >= 0) {
          toast.success("Attendance marked successfully!");
          stopCamera();
          setTimeout(() => {
            window.location.replace("/student/dashboard?refresh=" + Date.now());
          }, 3000);
        }
      } catch (error) {
        console.error("[handleScan] API Error:", error.response?.data || error.message);
        toast.error(error.response?.data?.detail || error.message || "Invalid QR code. Please try again.");
      }
    } catch (error) {
      console.error("[handleScan] API Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.detail || error.message || "Invalid QR code. Please try again.");
    } finally {
      setTimeout(() => (isProcessingRef.current = false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-50 shadow-sm p-4 w-full">
        <h1 className="text-2xl font-bold text-gray-800">Scan QR Code</h1>
      </header>
      <main className="w-full max-w-3xl mx-auto bg-gray-200 rounded-xl shadow-sm p-6 pb-12 mt-24">
        <div className="flex flex-col items-center">
          <p className="mb-4 text-sm text-gray-600">
            Point your camera at the QR code to mark attendance.
          </p>
          <div className="w-full max-w-3xl aspect-video rounded-md border border-gray-200 bg-white overflow-hidden">
            <video
              ref={qrVideoRef}
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              playsInline
              muted
            />
          </div>
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

export default ScanQR;
