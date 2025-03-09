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
        // Request camera stream
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        console.log("[useEffect] Got camera stream:", cameraStream.active);
        setStream(cameraStream);

        // Assign the stream to our video ref
        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = cameraStream;

          // We'll wait for the "playing" event, which means the video is really playing
          const onPlaying = () => {
            console.log("[onPlaying] Video is actually playing — starting QrScanner...");
            try {
              qrScannerRef.current = new QrScanner(
                qrVideoRef.current,
                (result) => handleScan(result.data || result),
                {
                  highlightScanRegion: true,
                  highlightCodeOutline: true,
                }
              );
              qrScannerRef.current.start();

              // Force the scanner’s overlay to be on top of the video
              // (By default, QrScanner appends a canvas sibling to the video.)
              if (qrScannerRef.current.$canvas) {
                qrScannerRef.current.$canvas.style.position = "absolute";
                qrScannerRef.current.$canvas.style.top = "0";
                qrScannerRef.current.$canvas.style.left = "0";
                qrScannerRef.current.$canvas.style.width = "100%";
                qrScannerRef.current.$canvas.style.height = "100%";
                qrScannerRef.current.$canvas.style.zIndex = "2";
              }
              // Ensure the video is behind the overlay
              qrVideoRef.current.style.zIndex = "1";

              // Let layout settle, then force an overlay update
              setTimeout(() => {
                if (qrScannerRef.current) {
                  console.log("[onPlaying] Forcing overlay update...");
                  qrScannerRef.current._updateOverlay();
                }
              }, 200);
            } catch (err) {
              console.error("[onPlaying] Error starting QrScanner:", err);
            }
          };

          // Listen for the "playing" event once
          qrVideoRef.current.addEventListener("playing", onPlaying, { once: true });

          // Try playing the video (some browsers block until user gesture if not muted)
          await qrVideoRef.current.play().catch((err) => {
            console.warn("[useEffect] Video play() blocked or errored:", err);
          });
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

  // Optionally keep this to restart the scanner if the user switches away and back
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && qrScannerRef.current) {
        console.log("[visibilitychange] Tab became visible, restarting QrScanner...");
        qrScannerRef.current.start();
        // Force overlay update in case it was hidden
        setTimeout(() => {
          if (qrScannerRef.current) {
            qrScannerRef.current._updateOverlay();
          }
        }, 200);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // If we switch to face mode, show the face video
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
      {/* Header Section */}
      <div className="bg-yellow-400 h-[60px] flex items-center justify-between w-full sticky top-0 z-50 border-b-2 border-gray-300">
        <img
          src="/images/team-logo.png"
          alt="Team Logo"
          className="w-[60px] h-auto pl-2 rounded-md"
        />
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Scan QR Code</h1>

      <main className="w-full max-w-3xl mx-auto bg-gray-200 rounded-xl shadow-sm p-6 pb-12 mt-24">
        <div className="flex flex-col items-center">
          <p className="mb-4 text-sm text-gray-600">
            {isFaceMode
              ? "Position your face in the frame and capture the photo."
              : "Point your camera at the QR code to mark attendance."}
          </p>

          {isFaceMode ? (
            <div className="relative w-full max-w-3xl aspect-video rounded-md border border-gray-200 bg-white overflow-hidden">
              <video
                ref={faceVideoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
                playsInline
              />
            </div>
          ) : (
            <div className="relative w-full max-w-3xl aspect-video rounded-md border border-gray-200 bg-white overflow-hidden">
              <video
                ref={qrVideoRef}
                // `playsInline` is important for iOS Safari
                // `muted` can help with auto-play policies in some browsers
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
                playsInline
                muted
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
