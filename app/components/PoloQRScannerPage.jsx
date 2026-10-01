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
    MdQrCodeScanner,
    MdCheckCircle,
    MdCancel,
    MdPerson,
    MdSchool,
    MdPhone,
    MdStraighten,
    MdCalendarToday,
    MdHome,
    MdRefresh,
    MdVerified,
    MdInfo,
} from "react-icons/md";

const ORG_ID = "PIHSOPA";

const PoloQRScannerPage = () => {
    const scannerRef = useRef(null);
    const processingRef = useRef(false);

    const [scannerStarted, setScannerStarted] =
        useState(false);

    const [processing, setProcessing] =
        useState(false);

    const [scanResult, setScanResult] =
        useState(null);

    const [errorMessage, setErrorMessage] =
        useState("");

    // ============================================================
    // START SCANNER
    // ============================================================

    const startScanner = async () => {
        if (scannerStarted || scannerRef.current) {
            return;
        }

        setErrorMessage("");
        setScanResult(null);
        setProcessing(false);
        processingRef.current = false;

        try {
            const html5QrCode =
                new Html5Qrcode("polo-qr-reader");

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
                    // Ignore normal QR frame decode errors.
                }
            );

            setScannerStarted(true);
        } catch (error) {
            console.error(
                "Unable to start QR scanner:",
                error
            );

            scannerRef.current = null;

            setScannerStarted(false);

            setErrorMessage(
                "Unable to access the camera. Please allow camera permission and try again."
            );
        }
    };

    // ============================================================
    // STOP SCANNER
    // ============================================================

    const stopScanner = async () => {
        const scanner = scannerRef.current;

        if (!scanner) {
            setScannerStarted(false);
            return;
        }

        try {
            const state = scanner.getState();

            // 2 = SCANNING
            // 3 = PAUSED
            if (state === 2 || state === 3) {
                await scanner.stop();
            }

            await scanner.clear();
        } catch (error) {
            console.error(
                "Error stopping QR scanner:",
                error
            );
        } finally {
            scannerRef.current = null;
            setScannerStarted(false);
        }
    };

    // ============================================================
    // QR SCAN SUCCESS
    // ============================================================

    const handleQRCodeSuccess = async (decodedText) => {
        if (processingRef.current) {
            return;
        }

        const poloId = decodedText.trim();

        if (!poloId) {
            return;
        }

        processingRef.current = true;
        setProcessing(true);
        setErrorMessage("");

        // Pause scanner while checking Firestore
        try {
            const scanner = scannerRef.current;

            if (
                scanner &&
                scanner.getState() === 2
            ) {
                scanner.pause(true);
            }
        } catch (error) {
            console.error(
                "Unable to pause scanner:",
                error
            );
        }

        try {
            // ====================================================
            // SEARCH POLO REGISTRATION
            // ====================================================

            const poloQuery = query(
                collection(
                    db,
                    "poloRegistrations"
                ),
                where(
                    "orgId",
                    "==",
                    ORG_ID
                ),
                where(
                    "poloId",
                    "==",
                    poloId
                )
            );

            const snapshot =
                await getDocs(poloQuery);

            // ====================================================
            // INVALID POLO
            // ====================================================

            if (snapshot.empty) {
                setScanResult({
                    valid: false,
                    poloId,
                });

                setProcessing(false);

                return;
            }

            // ====================================================
            // AUTHENTIC POLO
            // ====================================================

            const poloData =
                snapshot.docs[0].data();

            setScanResult({
                valid: true,
                poloId,
                ...poloData,
            });

            setProcessing(false);
        } catch (error) {
            console.error(
                "Error verifying polo:",
                error
            );

            setErrorMessage(
                "Unable to verify this polo. Please check your internet connection and try again."
            );

            setProcessing(false);
        }
    };

    // ============================================================
    // SCAN ANOTHER POLO
    // ============================================================

    const handleScanAnother = async () => {
        setScanResult(null);
        setErrorMessage("");
        setProcessing(false);
        processingRef.current = false;

        const scanner = scannerRef.current;

        try {
            if (
                scanner &&
                scanner.getState() === 3
            ) {
                scanner.resume();
            } else if (!scanner) {
                await startScanner();
            }
        } catch (error) {
            console.error(
                "Unable to resume scanner:",
                error
            );

            await startScanner();
        }
    };

    // ============================================================
    // FORMAT ISSUE DATE
    // ============================================================

    const formatIssueDate = (issuedDate) => {
        if (!issuedDate) {
            return "--";
        }

        try {
            // Firestore Timestamp
            if (
                issuedDate &&
                typeof issuedDate.toDate ===
                    "function"
            ) {
                return issuedDate
                    .toDate()
                    .toLocaleDateString(
                        "en-GB",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }
                    );
            }

            // JavaScript Date
            if (
                issuedDate instanceof Date
            ) {
                return issuedDate.toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }
                );
            }

            // String date
            if (
                typeof issuedDate ===
                "string"
            ) {
                const date =
                    new Date(issuedDate);

                if (
                    !isNaN(
                        date.getTime()
                    )
                ) {
                    return date.toLocaleDateString(
                        "en-GB",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }
                    );
                }

                return issuedDate;
            }

            return "--";
        } catch (error) {
            console.error(
                "Date formatting error:",
                error
            );

            return "--";
        }
    };

    // ============================================================
    // CLEAN UP SCANNER
    // ============================================================

    useEffect(() => {
        startScanner();

        return () => {
            const cleanupScanner =
                async () => {
                    const scanner =
                        scannerRef.current;

                    if (!scanner) {
                        return;
                    }

                    try {
                        const state =
                            scanner.getState();

                        if (
                            state === 2 ||
                            state === 3
                        ) {
                            await scanner.stop();
                        }

                        await scanner.clear();
                    } catch (error) {
                        console.error(
                            "Scanner cleanup error:",
                            error
                        );
                    } finally {
                        scannerRef.current =
                            null;
                    }
                };

            cleanupScanner();
        };
    }, []);

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

                    <div className="bg-gradient-to-r from-[#800000] to-[#4a0000] text-white p-5 md:p-6">

                        <div className="flex items-center gap-3">

                            <div className="bg-white/10 p-3 rounded-xl">
                                <MdQrCodeScanner
                                    size={32}
                                    className="text-[#fff9c4]"
                                />
                            </div>

                            <div>
                                <h1 className="text-xl md:text-2xl font-bold">
                                    PIHSOPA Polo Scanner
                                </h1>

                                <p className="text-sm text-red-100 mt-1">
                                    Verify a polo and identify
                                    its registered owner.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        SCANNER SECTION
                    ================================================== */}

                    {!scanResult && (
                        <div className="p-5 md:p-6">

                            <div className="text-center mb-5">

                                <h2 className="text-lg font-bold text-gray-800">
                                    Scan Polo QR Code
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Point the camera at the QR
                                    code printed on the polo.
                                </p>

                            </div>

                            {/* CAMERA */}

                            <div
                                id="polo-qr-reader"
                                className="w-full max-w-md mx-auto overflow-hidden rounded-xl border-2 border-gray-200 bg-black"
                            ></div>

                            {/* PROCESSING */}

                            {processing && (
                                <div className="mt-4 text-center">

                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

                                        Verifying polo...
                                    </div>

                                </div>
                            )}

                            {/* CAMERA ERROR */}

                            {errorMessage && (
                                <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">

                                    <div className="flex items-start gap-3">

                                        <MdCancel
                                            size={22}
                                            className="flex-shrink-0"
                                        />

                                        <div>
                                            <p className="font-bold text-sm">
                                                Scanner Error
                                            </p>

                                            <p className="text-sm mt-1">
                                                {errorMessage}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* START CAMERA BUTTON */}

                            {!scannerStarted && !errorMessage && (
                                <div className="text-center mt-5">

                                    <button
                                        onClick={startScanner}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#800000] text-white font-bold text-sm shadow-md hover:bg-[#650000] transition"
                                    >
                                        <MdQrCodeScanner
                                            size={20}
                                        />

                                        Start Scanner
                                    </button>

                                </div>
                            )}

                            {/* CAMERA PERMISSION RETRY */}

                            {errorMessage && (
                                <div className="text-center mt-5">

                                    <button
                                        onClick={() => {
                                            setErrorMessage(
                                                ""
                                            );
                                            startScanner();
                                        }}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#800000] text-white font-bold text-sm shadow-md hover:bg-[#650000] transition"
                                    >
                                        <MdRefresh
                                            size={20}
                                        />

                                        Try Camera Again
                                    </button>

                                </div>
                            )}

                            {/* INFORMATION */}

                            <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">

                                <div className="flex items-start gap-3">

                                    <MdInfo
                                        size={22}
                                        className="text-yellow-700 flex-shrink-0"
                                    />

                                    <div>

                                        <p className="text-sm font-bold text-yellow-900">
                                            How verification works
                                        </p>

                                        <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                                            Each PIHSOPA polo has a
                                            unique QR code containing
                                            its Polo ID. Scan the code
                                            to see the person the polo
                                            was registered to.
                                        </p>

                                    </div>

                                </div>
                            </div>

                        </div>
                    )}

                    {/* ==================================================
                        SCAN RESULT
                    ================================================== */}

                    {scanResult && (
                        <div className="p-5 md:p-6">

                            {/* ==================================================
                                AUTHENTIC
                            ================================================== */}

                            {scanResult.valid ? (
                                <div>

                                    <div className="text-center mb-6">

                                        <div className="flex justify-center mb-3">

                                            <div className="bg-green-100 p-4 rounded-full">

                                                <MdCheckCircle
                                                    size={55}
                                                    className="text-green-600"
                                                />

                                            </div>

                                        </div>

                                        <h2 className="text-2xl font-black text-green-700">
                                            AUTHENTIC POLO
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            This Polo ID is registered
                                            with PIHSOPA.
                                        </p>

                                    </div>

                                    {/* OWNER CARD */}

                                    <div className="border border-green-200 rounded-2xl overflow-hidden bg-white shadow-sm">

                                        {/* CARD HEADER */}

                                        <div className="bg-gradient-to-r from-[#800000] to-[#4a0000] p-5 text-white">

                                            <div className="flex items-center gap-4">

                                                {scanResult.photoUrl ||
                                                scanResult.imageUrl ||
                                                scanResult.userPhotoUrl ? (
                                                    <img
                                                        src={
                                                            scanResult.photoUrl ||
                                                            scanResult.imageUrl ||
                                                            scanResult.userPhotoUrl
                                                        }
                                                        alt={
                                                            scanResult.fullname
                                                        }
                                                        className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center border-2 border-white/30">
                                                        <MdPerson
                                                            size={45}
                                                            className="text-[#fff9c4]"
                                                        />
                                                    </div>
                                                )}

                                                <div className="min-w-0">

                                                    <div className="flex items-center gap-2 mb-1">

                                                        <MdVerified
                                                            size={20}
                                                            className="text-[#fff9c4]"
                                                        />

                                                        <span className="text-xs font-bold text-[#fff9c4] uppercase tracking-wider">
                                                            Registered Owner
                                                        </span>

                                                    </div>

                                                    <h3 className="text-xl font-black break-words">
                                                        {scanResult.fullname ||
                                                            "--"}
                                                    </h3>

                                                </div>

                                            </div>
                                        </div>

                                        {/* DETAILS */}

                                        <div className="p-5">

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                                {/* POLO ID */}

                                                <div className="bg-gray-50 rounded-xl p-3">

                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                        Polo ID
                                                    </p>

                                                    <p className="text-sm font-black text-[#800000] mt-1 break-all">
                                                        {scanResult.poloId ||
                                                            "--"}
                                                    </p>

                                                </div>

                                                {/* CLASS */}

                                                <div className="bg-gray-50 rounded-xl p-3">

                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                        Class of
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1">

                                                        <MdSchool
                                                            size={18}
                                                            className="text-[#800000]"
                                                        />

                                                        <p className="text-sm font-bold text-gray-800">
                                                            {scanResult.classOf ||
                                                                "--"}
                                                        </p>

                                                    </div>

                                                </div>

                                                {/* HOUSE */}

                                                <div className="bg-gray-50 rounded-xl p-3">

                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                        House Color
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1">

                                                        <MdHome
                                                            size={18}
                                                            className="text-[#800000]"
                                                        />

                                                        <p className="text-sm font-bold text-gray-800">
                                                            {scanResult.houseColor ||
                                                                "--"}
                                                        </p>

                                                    </div>

                                                </div>

                                                {/* SIZE */}

                                                <div className="bg-gray-50 rounded-xl p-3">

                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                        Polo Size
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1">

                                                        <MdStraighten
                                                            size={18}
                                                            className="text-[#800000]"
                                                        />

                                                        <p className="text-sm font-bold text-gray-800">
                                                            {scanResult.size ||
                                                                "--"}
                                                        </p>

                                                    </div>

                                                </div>

                                                {/* TELEPHONE */}

                                                <div className="bg-gray-50 rounded-xl p-3">

                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                        Telephone
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1">

                                                        <MdPhone
                                                            size={18}
                                                            className="text-[#800000]"
                                                        />

                                                        <p className="text-sm font-bold text-gray-800 break-all">
                                                            {scanResult.telephone ||
                                                                "--"}
                                                        </p>

                                                    </div>

                                                </div>

                                                {/* ISSUE DATE */}

                                                <div className="bg-gray-50 rounded-xl p-3">

                                                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                                        Issue Date
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1">

                                                        <MdCalendarToday
                                                            size={18}
                                                            className="text-[#800000]"
                                                        />

                                                        <p className="text-sm font-bold text-gray-800">
                                                            {formatIssueDate(
                                                                scanResult.issuedDate
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* STATUS */}

                                            <div className="mt-4">

                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                                                    Polo Status
                                                </p>

                                                <span
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase ${
                                                        scanResult.status ===
                                                        "active"
                                                            ? "bg-green-100 text-green-700"
                                                            : scanResult.status ===
                                                              "cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {scanResult.status ||
                                                        "Registered"}
                                                </span>

                                            </div>

                                        </div>
                                    </div>

                                    {/* SCAN ANOTHER */}

                                    <button
                                        onClick={
                                            handleScanAnother
                                        }
                                        className="w-full mt-5 py-3.5 rounded-xl bg-[#800000] text-white font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#650000] transition"
                                    >
                                        <MdRefresh
                                            size={21}
                                        />

                                        Scan Another Polo
                                    </button>

                                </div>
                            ) : (
                                /* ==================================================
                                    INVALID POLO
                                ================================================== */

                                <div>

                                    <div className="text-center">

                                        <div className="flex justify-center mb-4">

                                            <div className="bg-red-100 p-4 rounded-full">

                                                <MdCancel
                                                    size={60}
                                                    className="text-red-600"
                                                />

                                            </div>

                                        </div>

                                        <h2 className="text-2xl font-black text-red-700">
                                            INVALID POLO
                                        </h2>

                                        <p className="text-sm text-gray-600 mt-2">
                                            This Polo ID could not be
                                            found in the PIHSOPA
                                            registration records.
                                        </p>

                                    </div>

                                    {/* INVALID ID */}

                                    <div className="mt-6 p-5 rounded-2xl bg-red-50 border border-red-200">

                                        <p className="text-xs uppercase tracking-wider font-bold text-red-500">
                                            Scanned Polo ID
                                        </p>

                                        <p className="text-xl font-black text-red-800 mt-2 break-all">
                                            {scanResult.poloId ||
                                                "--"}
                                        </p>

                                    </div>

                                    {/* WARNING */}

                                    <div className="mt-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">

                                        <p className="text-sm font-bold text-yellow-900">
                                            Verification failed
                                        </p>

                                        <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                                            No registered polo belongs
                                            to this Polo ID. Check the
                                            QR code or contact PIHSOPA
                                            for verification.
                                        </p>

                                    </div>

                                    {/* SCAN ANOTHER */}

                                    <button
                                        onClick={
                                            handleScanAnother
                                        }
                                        className="w-full mt-5 py-3.5 rounded-xl bg-[#800000] text-white font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#650000] transition"
                                    >
                                        <MdRefresh
                                            size={21}
                                        />

                                        Scan Another Polo
                                    </button>

                                </div>
                            )}

                        </div>
                    )}

                </div>

                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="text-center mt-5">

                    <p className="text-xs text-gray-500">
                        Providence International High School
                        Old Pupils Association
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        Once a providencial, always a providencial.
                    </p>

                </div>

            </div>
        </div>
    );
};

export default PoloQRScannerPage;