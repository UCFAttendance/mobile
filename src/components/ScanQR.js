import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { toast } from "react-toastify";

const ScanQR = () => {
    console.log("[Render] <ScanQR />");

    const qrVideoRef = useRef(null);
    const qrScannerRef = useRef(null);
    const isProcessingRef = useRef(false);
    const [stream, setStream] = useState(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    useEffect(() => {
        console.log("[useEffect] Initializing QR Scanner...");

        const startQrCamera = async () => {
            console.log("[Step 1] Attempting to access camera...");
            try {
                if (qrScannerRef.current) {
                    console.warn("[Step 2] Stopping and destroying existing QR scanner...");
                    qrScannerRef.current.stop();
                    qrScannerRef.current.destroy();
                    qrScannerRef.current = null;
                }

                const cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });

                console.log("[Step 3] Camera stream obtained:", cameraStream.active);
                setStream(cameraStream);

                if (qrVideoRef.current) {
                    qrVideoRef.current.srcObject = cameraStream;
                    await qrVideoRef.current.play();
                    console.log("[Step 4] Video stream started.");
                }

                console.log("[Step 5] Initializing QR Scanner...");
                qrScannerRef.current = new QrScanner(
                    qrVideoRef.current,
                    (result) => handleScan(result.data || result),
                    { highlightScanRegion: true, highlightCodeOutline: true }
                );

                console.log("[Step 6] Starting QR scanner...");
                qrScannerRef.current.start();

                // Force scanning frames if needed
                setInterval(() => {
                    if (qrScannerRef.current) {
                        console.log("[DEBUG] Manually requesting a scan...");
                        qrScannerRef.current.scanFrame().catch(err => console.warn("[DEBUG] No QR code detected yet"));
                    }
                }, 1000); // Scan every second
                
                setIsOverlayVisible(true); // Ensure overlay is visible

                // Ensure scanner is running after a delay
                setTimeout(() => {
                    if (!qrScannerRef.current) {
                        console.error("[ERROR] Scanner not initialized properly.");
                    } else {
                        console.log("[Step 7] QR Scanner is running.");
                    }
                }, 2000);
            } catch (error) {
                console.error("[Step X] Error accessing camera:", error);
                toast.error("Unable to access camera. Check permissions.");
            }
        };

        startQrCamera();

        return () => {
            console.log("[Cleanup] Stopping camera and destroying scanner...");
            stopCamera();
        };
    }, []);

    const stopCamera = () => {
        console.log("[Stopping Camera] Stopping camera...");
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
            qrScannerRef.current.destroy();
            qrScannerRef.current = null;
            console.log("[Stopping Camera] Scanner stopped.");
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            console.log("[Stopping Camera] Camera stream stopped.");
        }
        if (qrVideoRef.current) qrVideoRef.current.srcObject = null;
    };

    const handleScan = async (result) => {
        console.log("[Step 8] Handling QR scan...");
        if (!result || isProcessingRef.current) return;

        isProcessingRef.current = true;
        console.log("[Step 9] QR Code detected:", result);

        let scannedData;
        try {
            scannedData = JSON.parse(result);
        } catch (error) {
            console.error("[Step 10] Error parsing QR code data:", error);
            toast.error("Invalid QR code format. Please try again.");
            isProcessingRef.current = false;
            return;
        }

        console.log("[Step 11] Successfully scanned QR code:", scannedData);
        qrScannerRef.current.stop();

        setTimeout(() => {
            console.log("[Step 12] Restarting scanner after successful scan...");
            qrScannerRef.current.start();
        }, 3000);

        isProcessingRef.current = false;
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
                    <div className="relative w-full max-w-3xl aspect-video rounded-md border border-gray-200 bg-white overflow-hidden">
                        <video
                            ref={qrVideoRef}
                            className="w-full h-full object-cover"
                            style={{ transform: "scaleX(-1)" }}
                            playsInline
                            muted
                        />
                        {isOverlayVisible && (
                            <div className="absolute inset-0 border-4 border-red-500 pointer-events-none"></div>
                        )}
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
