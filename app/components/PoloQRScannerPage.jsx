"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import {
    FaCamera,
    FaCheckCircle,
    FaTimesCircle,
    FaUser,
    FaIdCard,
    FaPhone,
    FaTshirt,
    FaHome,
    FaCalendarAlt,
    FaSyncAlt,
} from "react-icons/fa";

const ORG_ID = "PIHSOPA";

const PoloQRScannerPage = () => {
    const scannerRef = useRef(null);
    const processingRef = useRef(false);
    const resumeTimeoutRef = useRef(null);

    const [scannerReady, setScannerReady] = useState(false);
    const [scannerError, setScannerError] = useState("");
    const [processing, setProcessing] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    // =========================================================
    // FORMAT ISSUE DATE
    // =========================================================
    const formatIssueDate = (issuedDate) => {
        if (!issuedDate) {
            return "--";
        }

        try {
            if (issuedDate?.toDate) {
                return issuedDate.toDate().toLocaleDateString();
            }

            if (issuedDate?.seconds) {
                return new Date(
                    issuedDate.seconds * 1000
                ).toLocaleDateString();
            }

            if (typeof issuedDate === "string") {
                const date = new Date(issuedDate);

                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString();
                }

                return issuedDate;
            }

            return "--";
        } catch (error) {
            console.error("Date formatting error:", error);
            return "--";
        }
    };

    // =========================================================
    // STOP SCANNER
    // =========================================================
    const stopScanner = async () => {
        const scanner = scannerRef.current;

        if (!scanner) {
            return;
        }

        try {
            const state = scanner.getState();

            // 2 = SCANNING
            // 3 = PAUSED
            if (state === 2 || state === 3) {
                await scanner.stop();
            }

            scanner.clear();
        } catch (error) {
            console.error("Error stopping scanner:", error);
        } finally {
            scannerRef.current = null;
            setScannerReady(false);
        }
    };

    // =========================================================
    // START SCANNER
    // =========================================================
    const startScanner = async () => {
        try {
            setScannerError("");

            // Prevent multiple scanner instances
            if (scannerRef.current) {
                return;
            }

            const html5QrCode = new Html5Qrcode("polo-qr-reader");

            scannerRef.current = html5QrCode;

            const cameraConfig = {
                facingMode: "environment",
            };

            const config = {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250,
                },
                aspectRatio: 1.0,
            };

            await html5QrCode.start(
                cameraConfig,
                config,
                handleQRCodeSuccess,
                () => {
                    // Ignore normal QR frame decode errors
                }
            );

            setScannerReady(true);

            console.log("Polo QR scanner started.");
        } catch (error) {
            console.error("Unable to start scanner:", error);

            scannerRef.current = null;
            setScannerReady(false);

            setScannerError(
                "Unable to access the camera. Please allow camera permission and try again."
            );
        }
    };

    // =========================================================
    // HANDLE QR CODE
    // =========================================================
    const handleQRCodeSuccess = async (decodedText) => {
        // Prevent the same QR from being processed
        // multiple times while the camera is detecting it.
        if (processingRef.current) {
            return;
        }

        const poloId = decodedText?.trim();

        if (!poloId) {
            return;
        }

        processingRef.current = true;
        setProcessing(true);

        const scanner = scannerRef.current;

        try {
            // Pause scanner briefly while Firebase checks the Polo ID
            if (scanner) {
                try {
                    if (scanner.getState() === 2) {
                        scanner.pause(true);
                    }
                } catch (pauseError) {
                    console.warn(
                        "Unable to pause scanner:",
                        pauseError
                    );
                }
            }

            console.log("Scanned Polo ID:", poloId);

            // =================================================
            // SEARCH POLO REGISTRATION
            // =================================================
            const poloQuery = query(
                collection(db, "poloRegistrations"),
                where("orgId", "==", ORG_ID),
                where("poloId", "==", poloId)
            );

            const snapshot = await getDocs(poloQuery);

            // =================================================
            // INVALID POLO
            // =================================================
            if (snapshot.empty) {
                setScanResult({
                    valid: false,
                    poloId,
                });

                // Resume scanner after showing result
                resumeScanner();
                return;
            }

            // =================================================
            // VALID POLO
            // =================================================
            const poloDoc = snapshot.docs[0];

            const poloData = poloDoc.data();

            setScanResult({
                valid: true,
                poloId: poloData.poloId || poloId,

                fullname: poloData.fullname || "--",
                classOf: poloData.classOf || "--",
                telephone: poloData.telephone || "--",
                houseColor: poloData.houseColor || "--",
                size: poloData.size || "--",
                status: poloData.status || "--",
                issuedDate: poloData.issuedDate || null,

                photoUrl:
                    poloData.photoUrl ||
                    poloData.imageUrl ||
                    poloData.userPhotoUrl ||
                    "",
            });

            resumeScanner();
        } catch (error) {
            console.error("Polo scanning error:", error);

            setScanResult({
                valid: false,
                poloId,
                error: true,
            });

            resumeScanner();
        }
    };

    // =========================================================
    // RESUME SCANNER
    // =========================================================
    const resumeScanner = () => {
        if (resumeTimeoutRef.current) {
            clearTimeout(resumeTimeoutRef.current);
        }

        resumeTimeoutRef.current = setTimeout(() => {
            const scanner = scannerRef.current;

            try {
                if (scanner && scanner.getState() === 3) {
                    scanner.resume();
                }
            } catch (error) {
                console.error(
                    "Unable to resume scanner:",
                    error
                );
            }

            processingRef.current = false;
            setProcessing(false);
        }, 1200);
    };

    // =========================================================
    // START CAMERA WHEN PAGE LOADS
    // =========================================================
    useEffect(() => {
        startScanner();

        return () => {
            if (resumeTimeoutRef.current) {
                clearTimeout(resumeTimeoutRef.current);
            }

            const cleanupScanner = async () => {
                await stopScanner();
            };

            cleanupScanner();
        };
    }, []);

    // =========================================================
    // CLEAR REPORT
    // =========================================================
    const clearReport = () => {
        setScanResult(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-2xl mx-auto">

                {/* =====================================================
                    HEADER
                ===================================================== */}
                <div className="bg-gradient-to-r from-[#800000] to-[#4a0000] text-white rounded-2xl shadow-lg p-5 mb-5">

                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                            <FaCamera className="text-2xl" />
                        </div>

                        <div>
                            <h1 className="text-xl md:text-2xl font-bold">
                                PIHSOPA Polo Scanner
                            </h1>

                            <p className="text-xs md:text-sm text-white/80 mt-1">
                                Scan a polo QR code to verify ownership
                            </p>
                        </div>

                    </div>

                </div>

                {/* =====================================================
                    MAIN CARD
                ===================================================== */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">

                    {/* =================================================
                        CAMERA SECTION
                    ================================================= */}
                    <div className="text-center">

                        <div className="flex items-center justify-between mb-3">

                            <div className="text-left">
                                <h2 className="font-bold text-gray-800">
                                    QR Scanner
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Keep the camera open and scan polos
                                </p>
                            </div>

                            <div
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                    scannerReady
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                }`}
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        scannerReady
                                            ? "bg-green-500 animate-pulse"
                                            : "bg-gray-400"
                                    }`}
                                ></span>

                                {scannerReady
                                    ? "Camera Active"
                                    : "Starting..."}
                            </div>

                        </div>

                        {/* CAMERA */}
                        <div
                            id="polo-qr-reader"
                            className="w-full overflow-hidden rounded-xl border border-gray-200 bg-black"
                        ></div>

                        {/* CAMERA ERROR */}
                        {scannerError && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <FaTimesCircle />
                                    Camera Error
                                </div>

                                <p>{scannerError}</p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setScannerError("");
                                        startScanner();
                                    }}
                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                                >
                                    <FaSyncAlt />
                                    Try Camera Again
                                </button>
                            </div>
                        )}

                        {/* PROCESSING MESSAGE */}
                        {processing && (
                            <div className="mt-3 flex justify-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-xs font-semibold">
                                    <span className="animate-spin">
                                        <FaSyncAlt />
                                    </span>

                                    Checking Polo ID...
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mt-3">
                            Position the QR code inside the scanning box.
                            The camera will remain open for the next scan.
                        </p>

                    </div>

                    {/* =================================================
                        POLO REPORT
                    ================================================= */}
                    {scanResult && (
                        <div className="mt-6">

                            {/* =============================================
                                AUTHENTIC POLO
                            ============================================= */}
                            {scanResult.valid && (
                                <div className="border-2 border-green-200 bg-green-50 rounded-2xl overflow-hidden">

                                    {/* REPORT HEADER */}
                                    <div className="bg-green-600 text-white px-4 py-3">

                                        <div className="flex items-center justify-between">

                                            <div className="flex items-center gap-2">
                                                <FaCheckCircle className="text-xl" />

                                                <div>
                                                    <p className="text-xs uppercase tracking-wider font-bold">
                                                        Authentic Polo
                                                    </p>

                                                    <p className="text-[11px] text-green-100">
                                                        Registered with PIHSOPA
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded">
                                                {scanResult.poloId}
                                            </span>

                                        </div>

                                    </div>

                                    {/* OWNER */}
                                    <div className="p-4">

                                        <div className="flex items-center gap-4 pb-4 border-b border-green-200">

                                            {/* PHOTO */}
                                            {scanResult.photoUrl ? (
                                                <img
                                                    src={scanResult.photoUrl}
                                                    alt={scanResult.fullname}
                                                    className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-white border border-green-200 flex items-center justify-center">
                                                    <FaUser className="text-3xl text-green-500" />
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">
                                                    Polo Belongs To
                                                </p>

                                                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                                                    {scanResult.fullname}
                                                </h3>

                                                <p className="text-sm text-gray-600">
                                                    Class of{" "}
                                                    <span className="font-bold">
                                                        {scanResult.classOf}
                                                    </span>
                                                </p>
                                            </div>

                                        </div>

                                        {/* DETAILS */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">

                                            {/* POLO ID */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-3">

                                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                    <FaIdCard />
                                                    <span className="text-[10px] uppercase font-bold">
                                                        Polo ID
                                                    </span>
                                                </div>

                                                <p className="font-bold text-gray-800 font-mono text-sm">
                                                    {scanResult.poloId}
                                                </p>

                                            </div>

                                            {/* CLASS */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-3">

                                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                    <FaUser />
                                                    <span className="text-[10px] uppercase font-bold">
                                                        Class of
                                                    </span>
                                                </div>

                                                <p className="font-bold text-gray-800 text-sm">
                                                    {scanResult.classOf}
                                                </p>

                                            </div>

                                            {/* HOUSE */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-3">

                                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                    <FaHome />
                                                    <span className="text-[10px] uppercase font-bold">
                                                        House Color
                                                    </span>
                                                </div>

                                                <p className="font-bold text-gray-800 text-sm">
                                                    {scanResult.houseColor}
                                                </p>

                                            </div>

                                            {/* SIZE */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-3">

                                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                    <FaTshirt />
                                                    <span className="text-[10px] uppercase font-bold">
                                                        Polo Size
                                                    </span>
                                                </div>

                                                <p className="font-bold text-gray-800 text-sm">
                                                    {scanResult.size}
                                                </p>

                                            </div>

                                            {/* TELEPHONE */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-3">

                                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                    <FaPhone />
                                                    <span className="text-[10px] uppercase font-bold">
                                                        Telephone
                                                    </span>
                                                </div>

                                                <p className="font-bold text-gray-800 text-sm">
                                                    {scanResult.telephone}
                                                </p>

                                            </div>

                                            {/* ISSUE DATE */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-3">

                                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                    <FaCalendarAlt />
                                                    <span className="text-[10px] uppercase font-bold">
                                                        Issue Date
                                                    </span>
                                                </div>

                                                <p className="font-bold text-gray-800 text-sm">
                                                    {formatIssueDate(
                                                        scanResult.issuedDate
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                        {/* STATUS */}
                                        <div className="mt-4">

                                            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">

                                                <span className="text-xs font-bold text-gray-500 uppercase">
                                                    Status
                                                </span>

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        String(
                                                            scanResult.status
                                                        ).toLowerCase() ===
                                                        "active"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {scanResult.status}
                                                </span>

                                            </div>

                                        </div>

                                        {/* VERIFIED MESSAGE */}
                                        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-xl text-center">

                                            <p className="text-xs font-bold text-green-800">
                                                ✓ This Polo ID is registered
                                                with PIHSOPA.
                                            </p>

                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* =============================================
                                INVALID POLO
                            ============================================= */}
                            {!scanResult.valid && (
                                <div className="border-2 border-red-200 bg-red-50 rounded-2xl overflow-hidden">

                                    {/* HEADER */}
                                    <div className="bg-red-600 text-white px-4 py-3">

                                        <div className="flex items-center gap-2">

                                            <FaTimesCircle className="text-xl" />

                                            <div>
                                                <p className="text-xs uppercase tracking-wider font-bold">
                                                    Invalid Polo
                                                </p>

                                                <p className="text-[11px] text-red-100">
                                                    Polo could not be verified
                                                </p>
                                            </div>

                                        </div>

                                    </div>

                                    {/* BODY */}
                                    <div className="p-5 text-center">

                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                                            Scanned Polo ID
                                        </p>

                                        <p className="font-mono font-bold text-lg text-gray-900 mb-4">
                                            {scanResult.poloId}
                                        </p>

                                        <div className="bg-white border border-red-200 rounded-xl p-4">

                                            <FaTimesCircle className="mx-auto text-3xl text-red-500 mb-2" />

                                            <h3 className="font-bold text-red-700">
                                                Polo Not Registered
                                            </h3>

                                            <p className="text-xs text-gray-600 mt-1">
                                                No registered PIHSOPA polo was
                                                found with this Polo ID.
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* CLEAR REPORT */}
                            <button
                                type="button"
                                onClick={clearReport}
                                className="w-full mt-3 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                            >
                                Clear Current Report
                            </button>

                        </div>
                    )}

                    {/* =================================================
                        NO SCAN YET
                    ================================================= */}
                    {!scanResult && scannerReady && (
                        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">

                            <FaCamera className="mx-auto text-2xl text-gray-400 mb-2" />

                            <p className="text-sm font-semibold text-gray-700">
                                Ready to Scan
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Scan a PIHSOPA polo QR code to display
                                the registered owner.
                            </p>

                        </div>
                    )}

                </div>

                {/* =====================================================
                    FOOTER NOTE
                ===================================================== */}
                <div className="text-center mt-4">

                    <p className="text-[11px] text-gray-400">
                        PIHSOPA • Polo Authenticity Verification
                    </p>

                    <p className="text-[10px] text-gray-400 mt-1">
                        Once a providencial, always a providencial.
                    </p>

                </div>

            </div>
        </div>
    );
};

export default PoloQRScannerPage;