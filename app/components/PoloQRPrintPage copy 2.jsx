
"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { MdCheckroom, MdSearch, MdPrint, MdQrCode2, MdFilterList } from "react-icons/md";

const ORG_ID = "PIHSOPA";

// ============================================================
// PRINT / CARD SETTINGS
// ============================================================

const CARD_WIDTH = "3.55in";
const CARD_HEIGHT = "2.25in";
const GAP_BETWEEN_CARDS = "0.25in";
const CARDS_PER_ROW = 2;
const ROWS_PER_PAGE = 4;
const CARDS_PER_BROWSER_PAGE = CARDS_PER_ROW * ROWS_PER_PAGE;

export default function PoloQRPrintPage() {
    // ============================================================
    // DATA
    // ============================================================

    const [polos, setPolos] = useState([]);
    const [loading, setLoading] = useState(true);

    // ============================================================
    // FILTERS
    // ============================================================

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHouse, setSelectedHouse] = useState("All");

    // ============================================================
    // PAGINATION AND PRINT MODE
    // ============================================================

    const [currentPage, setCurrentPage] = useState(1);
    const [printMode, setPrintMode] = useState("page");

    // ============================================================
    // LOAD POLO REGISTRATIONS
    // ============================================================

    useEffect(() => {
        const poloQuery = query(collection(db, "poloRegistrations"), where("orgId", "==", ORG_ID));

        const unsubscribe = onSnapshot(
            poloQuery,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

                // Newest first
                data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

                setPolos(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading polo registrations:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // ============================================================
    // HOUSE COLOR OPTIONS
    // ============================================================

    const houseOptions = ["All", ...new Set(polos.map((polo) => polo.houseColor).filter(Boolean))];

    // ============================================================
    // FILTER POLOS
    // ============================================================

    const filteredPolos = polos.filter((polo) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            polo.poloId?.toLowerCase().includes(search) ||
            polo.fullname?.toLowerCase().includes(search) ||
            polo.classOf?.toLowerCase().includes(search) ||
            polo.telephone?.toLowerCase().includes(search);

        const matchesHouse = selectedHouse === "All" || polo.houseColor === selectedHouse;

        return matchesSearch && matchesHouse;
    });

    // ============================================================
    // PAGINATION
    // ============================================================

    const totalPages = Math.ceil(filteredPolos.length / CARDS_PER_BROWSER_PAGE) || 1;
    const startIndex = (currentPage - 1) * CARDS_PER_BROWSER_PAGE;
    const visiblePolos = filteredPolos.slice(startIndex, startIndex + CARDS_PER_BROWSER_PAGE);

    // ============================================================
    // RESET PAGE WHEN FILTER CHANGES
    // ============================================================

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedHouse]);

    // ============================================================
    // DETERMINE WHAT TO PRINT
    // ============================================================

    const polosToRender = printMode === "all" ? filteredPolos : visiblePolos;

    // ============================================================
    // PAGINATION HANDLERS
    // ============================================================

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // ============================================================
    // PRINT HANDLERS
    // ============================================================

    const handlePrintPage = () => {
        setPrintMode("page");
        setTimeout(() => window.print(), 100);
    };

    const handlePrintAll = () => {
        setPrintMode("all");
        setTimeout(() => window.print(), 100);
    };

    // ============================================================
    // HOUSE COLOR DISPLAY
    // ============================================================

    const getHouseColorStyle = (house) => {
        switch (house?.toLowerCase()) {
            case "red":
                return { background: "#fee2e2", color: "#991b1b", border: "#ef4444" };
            case "blue":
                return { background: "#dbeafe", color: "#1e40af", border: "#3b82f6" };
            case "green":
                return { background: "#dcfce7", color: "#166534", border: "#22c55e" };
            case "yellow":
                return { background: "#fef9c3", color: "#854d0e", border: "#eab308" };
            case "orange":
                return { background: "#ffedd5", color: "#9a3412", border: "#f97316" };
            case "purple":
                return { background: "#f3e8ff", color: "#6b21a8", border: "#a855f7" };
            case "black":
                return { background: "#e5e7eb", color: "#111827", border: "#374151" };
            default:
                return { background: "#f3f4f6", color: "#374151", border: "#9ca3af" };
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", background: "#f3f4f6" }}>
            {/* PRINT CSS */}

            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden !important;
                        }

                        .polo-print-grid, .polo-print-grid * {
                            visibility: visible !important;
                        }

                        .polo-print-grid {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            display: grid !important;
                            grid-template-columns: repeat(${CARDS_PER_ROW}, ${CARD_WIDTH}) !important;
                            gap: ${GAP_BETWEEN_CARDS} !important;
                            justify-content: center !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }

                        .polo-card {
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .polo-card:nth-child(8n) {
                            break-after: page;
                            page-break-after: always;
                        }

                        .print-hidden {
                            display: none !important;
                        }

                        @page {
                            size: A4 portrait;
                            margin: 0.35in;
                        }

                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            margin: 0 !important;
                            background: white !important;
                            overflow: visible !important;
                        }
                    }
                `}
            </style>

            {/* ACTION BAR */}

            <div className="print-hidden" style={{ width: "100%", maxWidth: "1000px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                <div>
                    <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#1f2937" }}>
                        PIHSOPA Polo QR Codes
                    </h2>

                    <p style={{ marginTop: "4px", color: "#6b7280", fontSize: "14px" }}>
                        Print unique QR codes for registered polos.
                    </p>
                </div>

                {/* FILTER / PRINT AREA */}

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {/* SEARCH */}

                    <div style={{ position: "relative" }}>
                        <MdSearch size={19} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search polo..."
                            style={{ width: "190px", padding: "8px 10px 8px 34px", border: "1px solid #d1d5db", borderRadius: "6px", outline: "none", background: "#fff" }}
                        />
                    </div>

                    {/* HOUSE FILTER */}

                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <MdFilterList size={19} color="#6b7280" />

                        <select
                            value={selectedHouse}
                            onChange={(e) => setSelectedHouse(e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff" }}
                        >
                            {houseOptions.map((house) => (
                                <option key={house} value={house}>
                                    {house === "All" ? "All Houses" : house}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PRINT PAGE */}

                    <button
                        onClick={handlePrintPage}
                        disabled={visiblePolos.length === 0}
                        style={{
                            padding: "8px 14px",
                            background: visiblePolos.length === 0 ? "#9ca3af" : "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: visiblePolos.length === 0 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: "600",
                        }}
                    >
                        <MdPrint /> Print Page ({currentPage})
                    </button>

                    {/* PRINT ALL */}

                    <button
                        onClick={handlePrintAll}
                        disabled={filteredPolos.length === 0}
                        style={{
                            padding: "8px 14px",
                            background: filteredPolos.length === 0 ? "#9ca3af" : "#800000",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: filteredPolos.length === 0 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: "600",
                        }}
                    >
                        <MdPrint /> Print All ({filteredPolos.length})
                    </button>
                </div>
            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
                <div className="print-hidden" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        style={{
                            padding: "7px 14px",
                            background: currentPage === 1 ? "#d1d5db" : "#374151",
                            color: currentPage === 1 ? "#6b7280" : "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            fontWeight: "600",
                        }}
                    >
                        Previous
                    </button>

                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: "7px 14px",
                            background: currentPage === totalPages ? "#d1d5db" : "#374151",
                            color: currentPage === totalPages ? "#6b7280" : "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                            fontWeight: "600",
                        }}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* PRINT AREA */}

            <div
                className="polo-print-grid"
                style={{ display: "grid", gridTemplateColumns: `repeat(${CARDS_PER_ROW}, ${CARD_WIDTH})`, gap: GAP_BETWEEN_CARDS, justifyContent: "center", width: "100%", maxWidth: "800px" }}
            >
                {loading ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6b7280", padding: "40px" }}>
                        Loading polo registrations...
                    </div>
                ) : polosToRender.length > 0 ? (
                    polosToRender.map((polo) => {
                        const houseStyle = getHouseColorStyle(polo.houseColor);

                        return (
                            <div
                                key={polo.id}
                                className="polo-card"
                                style={{
                                    width: CARD_WIDTH,
                                    height: CARD_HEIGHT,
                                    boxSizing: "border-box",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                                    pageBreakInside: "avoid",
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* HEADER */}

                                <div style={{ background: "linear-gradient(90deg, #800000 0%, #4a0000 100%)", color: "#fff", padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "38px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                        <MdCheckroom size={23} color="#fff9c4" />

                                        <div>
                                            <div style={{ fontSize: "10px", fontWeight: "900", letterSpacing: "0.4px", lineHeight: "1.1" }}>
                                                PROVIDENCE INTERNATIONAL
                                            </div>

                                            <div style={{ fontSize: "9px", fontWeight: "700", color: "#fff9c4", lineHeight: "1.1" }}>
                                                HIGH SCHOOL OLD PUPILS ASSOCIATION
                                            </div>
                                        </div>
                                    </div>

                                    <MdQrCode2 size={25} color="#fff9c4" />
                                </div>

                                {/* BODY */}

                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px" }}>
                                    {/* QR CODE */}

                                    <div style={{ background: "#fff", padding: "5px", borderRadius: "6px", border: "1px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <div style={{ background: "#ffffff", padding: "5px", borderRadius: "6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: "3px" }}>
                                            <QRCodeSVG value={polo.poloId || ""} size={100} level="H" includeMargin={false} />

                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", lineHeight: "1.2" }}>
                                                <div style={{ fontSize: "10px", fontWeight: "900", color: "#800000", textAlign: "center", letterSpacing: "0.5px" }}>
                                                    PIHSOPA
                                                </div>

                                                <div style={{ fontSize: "9px", fontWeight: "800", color: "#374151", textAlign: "center" }}>
                                                    Size: {polo.size || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* INFORMATION */}

                                    <div style={{ flex: 1, minWidth: 0, lineHeight: "1.35" }}>
                                        <div style={{ fontSize: "7px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                                            AUTHENTIC POLO
                                        </div>

                                        <div style={{ fontSize: "12px", fontWeight: "900", color: "#800000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "5px" }}>
                                            {polo.fullname}
                                        </div>

                                        <div style={{ fontSize: "8.5px", color: "#374151", marginBottom: "3px" }}>
                                            <strong>Polo ID:</strong> {polo.poloId}
                                        </div>

                                        <div style={{ fontSize: "8.5px", color: "#374151", marginBottom: "3px" }}>
                                            <strong>Class of:</strong> {polo.classOf}
                                        </div>

                                        <div style={{ fontSize: "8.5px", color: "#374151", marginBottom: "5px" }}>
                                            <strong>Size:</strong> {polo.size}
                                        </div>

                                        {/* HOUSE */}

                                        <span style={{ display: "inline-block", padding: "3px 7px", borderRadius: "5px", background: houseStyle.background, color: houseStyle.color, border: `1px solid ${houseStyle.border}`, fontSize: "7px", fontWeight: "900", textTransform: "uppercase" }}>
                                            {polo.houseColor} HOUSE
                                        </span>
                                    </div>
                                </div>

                                {/* FOOTER */}

                                <div style={{ background: "linear-gradient(90deg, #800000 0%, #4a0000 100%)", color: "#fff", minHeight: "29px", padding: "5px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "5px" }}>
                                    <div style={{ fontSize: "7px", color: "#fff9c4", fontWeight: "700", letterSpacing: "0.4px" }}>
                                        SCAN TO VERIFY AUTHENTICITY
                                    </div>

                                    <div style={{ fontSize: "7px", color: "#fff", fontWeight: "600", whiteSpace: "nowrap" }}>
                                        PIHSOPA
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* EMPTY STATE */

                    <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6b7280", padding: "50px" }}>
                        <MdQrCode2 size={55} style={{ margin: "0 auto 10px", color: "#d1d5db" }} />

                        <div style={{ fontWeight: "700", fontSize: "16px" }}>
                            No polo registrations found.
                        </div>

                        <div style={{ fontSize: "13px", marginTop: "5px" }}>
                            Register a polo first before printing QR codes.
                        </div>
                    </div>
                )}
            </div>

            {/* PRINT INFORMATION */}

            <div className="print-hidden" style={{ marginTop: "20px", width: "100%", maxWidth: "800px", padding: "12px 15px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#6b7280", fontSize: "12px" }}>
                <strong>{filteredPolos.length}</strong> polo(s) available for printing. Each QR code contains only the unique <strong>Polo ID</strong> for that individual polo.
            </div>
        </div>
    );
}
