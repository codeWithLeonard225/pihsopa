
"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { MdSearch, MdPrint, MdQrCode2, MdFilterList } from "react-icons/md";

const ORG_ID = "PIHSOPA";

// PRINT / CARD SETTINGS
const CARD_WIDTH = "1.8in";
const CARD_HEIGHT = "2in";
const GAP_BETWEEN_CARDS = "0.1in";
const CARDS_PER_ROW = 4;
const ROWS_PER_PAGE = 5;
const CARDS_PER_BROWSER_PAGE = CARDS_PER_ROW * ROWS_PER_PAGE;

export default function PoloQRPrintPage() {
    const [polos, setPolos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedHouse, setSelectedHouse] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [printMode, setPrintMode] = useState("page");

    // LOAD POLO REGISTRATIONS
    useEffect(() => {
        const poloQuery = query(
            collection(db, "poloRegistrations"),
            where("orgId", "==", ORG_ID)
        );

        const unsubscribe = onSnapshot(
            poloQuery,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                data.sort(
                    (a, b) =>
                        (b.createdAt?.seconds || 0) -
                        (a.createdAt?.seconds || 0)
                );

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

    // HOUSE COLOR OPTIONS
    const houseOptions = [
        "All",
        ...new Set(polos.map((polo) => polo.houseColor).filter(Boolean)),
    ];

    // FILTER POLOS
    const filteredPolos = polos.filter((polo) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            polo.poloId?.toLowerCase().includes(search) ||
            polo.fullname?.toLowerCase().includes(search) ||
            polo.classOf?.toLowerCase().includes(search) ||
            polo.telephone?.toLowerCase().includes(search);

        const matchesHouse =
            selectedHouse === "All" || polo.houseColor === selectedHouse;

        return matchesSearch && matchesHouse;
    });

    // PAGINATION
    const totalPages =
        Math.ceil(filteredPolos.length / CARDS_PER_BROWSER_PAGE) || 1;

    const startIndex = (currentPage - 1) * CARDS_PER_BROWSER_PAGE;

    const visiblePolos = filteredPolos.slice(
        startIndex,
        startIndex + CARDS_PER_BROWSER_PAGE
    );

    // RESET PAGE WHEN FILTERS CHANGE
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedHouse]);

    // DETERMINE WHAT TO PRINT
    const polosToRender = printMode === "all" ? filteredPolos : visiblePolos;

    // PAGINATION HANDLERS
    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // PRINT HANDLERS
    const handlePrintPage = () => {
        setPrintMode("page");
        setTimeout(() => window.print(), 100);
    };

    const handlePrintAll = () => {
        setPrintMode("all");
        setTimeout(() => window.print(), 100);
    };

    return (
        <div
            style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                background: "#f3f4f6",
            }}
        >
            {/* PRINT CSS */}
            <style>
                {`
                    .polo-print-grid {
                        display: grid;
                        grid-template-columns: repeat(${CARDS_PER_ROW}, ${CARD_WIDTH});
                        grid-auto-rows: ${CARD_HEIGHT};
                        gap: ${GAP_BETWEEN_CARDS};
                        justify-content: center;
                        align-content: start;
                        width: 100%;
                        max-width: 800px;
                    }

                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 0.35in;
                        }

                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: #fff !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }

                        body * {
                            visibility: hidden !important;
                        }

                        .polo-print-grid,
                        .polo-print-grid * {
                            visibility: visible !important;
                        }

                        .polo-print-grid {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            display: grid !important;
                            grid-template-columns: repeat(4, 1.8in) !important;
                            grid-auto-rows: 2in !important;
                            column-gap: 0.1in !important;
                            row-gap: 0.1in !important;
                            justify-content: center !important;
                            align-content: start !important;
                            width: 100% !important;
                            max-width: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }

                        .polo-card {
                            width: 1.8in !important;
                            height: 2in !important;
                            box-sizing: border-box !important;
                            border: 1px solid #d1d5db !important;
                            border-radius: 0 !important;
                            box-shadow: none !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .polo-card:nth-child(20n) {
                            break-after: page !important;
                            page-break-after: always !important;
                        }

                        .print-hidden {
                            display: none !important;
                        }
                    }
                `}
            </style>

            {/* ACTION BAR */}
            <div
                className="print-hidden"
                style={{
                    width: "100%",
                    maxWidth: "1000px",
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            margin: 0,
                            color: "#1f2937",
                        }}
                    >
                        PIHSOPA Polo QR Codes
                    </h2>

                    <p
                        style={{
                            marginTop: "4px",
                            color: "#6b7280",
                            fontSize: "14px",
                        }}
                    >
                        Print QR codes for registered polos.
                    </p>
                </div>

                {/* FILTER / PRINT AREA */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {/* SEARCH */}
                    <div style={{ position: "relative" }}>
                        <MdSearch
                            size={19}
                            style={{
                                position: "absolute",
                                left: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#9ca3af",
                            }}
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search polo..."
                            style={{
                                width: "190px",
                                padding: "8px 10px 8px 34px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                outline: "none",
                                background: "#fff",
                            }}
                        />
                    </div>

                    {/* HOUSE FILTER */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                        }}
                    >
                        <MdFilterList size={19} color="#6b7280" />

                        <select
                            value={selectedHouse}
                            onChange={(e) => setSelectedHouse(e.target.value)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                background: "#fff",
                            }}
                        >
                            {houseOptions.map((house) => (
                                <option key={house} value={house}>
                                    {house === "All" ? "All Houses" : house}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PRINT CURRENT PAGE */}
                    <button
                        onClick={handlePrintPage}
                        disabled={visiblePolos.length === 0}
                        style={{
                            padding: "8px 14px",
                            background:
                                visiblePolos.length === 0 ? "#9ca3af" : "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor:
                                visiblePolos.length === 0
                                    ? "not-allowed"
                                    : "pointer",
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
                            background:
                                filteredPolos.length === 0 ? "#9ca3af" : "#800000",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor:
                                filteredPolos.length === 0
                                    ? "not-allowed"
                                    : "pointer",
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
                <div
                    className="print-hidden"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "15px",
                        marginBottom: "20px",
                    }}
                >
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        style={{
                            padding: "7px 14px",
                            background:
                                currentPage === 1 ? "#d1d5db" : "#374151",
                            color: currentPage === 1 ? "#6b7280" : "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor:
                                currentPage === 1 ? "not-allowed" : "pointer",
                            fontWeight: "600",
                        }}
                    >
                        Previous
                    </button>

                    <span
                        style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#374151",
                        }}
                    >
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: "7px 14px",
                            background:
                                currentPage === totalPages
                                    ? "#d1d5db"
                                    : "#374151",
                            color: currentPage === totalPages ? "#6b7280" : "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor:
                                currentPage === totalPages
                                    ? "not-allowed"
                                    : "pointer",
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
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${CARDS_PER_ROW}, ${CARD_WIDTH})`,
                    gridAutoRows: CARD_HEIGHT,
                    gap: GAP_BETWEEN_CARDS,
                    justifyContent: "center",
                    width: "100%",
                    maxWidth: "800px",
                }}
            >
                {loading ? (
                    <div
                        style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            color: "#6b7280",
                            padding: "40px",
                        }}
                    >
                        Loading polo registrations...
                    </div>
                ) : polosToRender.length > 0 ? (
                    polosToRender.map((polo) => (
                        <div
                            key={polo.id}
                            className="polo-card"
                            style={{
                                width: CARD_WIDTH,
                                height: CARD_HEIGHT,
                                boxSizing: "border-box",
                                border: "1px solid #d1d5db",
                                borderRadius: "10px",
                                background: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: "5px",
                                pageBreakInside: "avoid",
                            }}
                        >
                            {/* <QRCodeSVG
                                value={polo.poloId || ""}
                                size={80}
                                level="H"
                                includeMargin={false}
                            /> */}

                            <QRCodeSVG
                                value={`https://pihsopa.vercel.app/components/polo-verify?id=${encodeURIComponent(polo.poloId || polo.id)}`}
                                size={80}
                                level="H"
                                includeMargin={false}
                            />

                            <div
                                style={{
                                    fontSize: "12px",
                                    fontWeight: "900",
                                    color: "#800000",
                                    letterSpacing: "0.5px",
                                    textAlign: "center",
                                }}
                            >
                                PIHSOPA
                            </div>

                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    color: "#374151",
                                    textAlign: "center",
                                }}
                            >
                                Size: {polo.size || "N/A"}
                            </div>
                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    color: "#374151",
                                    textAlign: "center",
                                }}
                            >
                                Size: {polo.fullname || "N/A"}
                            </div>
                        </div>
                    ))
                ) : (
                    <div
                        style={{
                            gridColumn: "1 / -1",
                            textAlign: "center",
                            color: "#6b7280",
                            padding: "50px",
                        }}
                    >
                        <MdQrCode2
                            size={55}
                            style={{ margin: "0 auto 10px", color: "#d1d5db" }}
                        />

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
            <div
                className="print-hidden"
                style={{
                    marginTop: "20px",
                    width: "100%",
                    maxWidth: "800px",
                    padding: "12px 15px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    color: "#6b7280",
                    fontSize: "12px",
                }}
            >
                <strong>{filteredPolos.length}</strong> polo(s) available for
                printing. Each QR code contains only the unique{" "}
                <strong>Polo ID</strong> for that individual polo.
            </div>
        </div>
    );
}
