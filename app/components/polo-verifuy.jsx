"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { MdCheckCircle, MdError, MdHome } from "react-icons/md";

function PoloDetailsContent() {
    const searchParams = useSearchParams();
    const poloId = searchParams.get("id");

    const [polo, setPolo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!poloId) {
            setLoading(false);
            return;
        }

        const fetchPoloDetails = async () => {
            try {
                const q = query(
                    collection(db, "poloRegistrations"),
                    where("poloId", "==", poloId)
                );
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    setPolo(snapshot.docs[0].data());
                }
            } catch (error) {
                console.error("Error fetching polo details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPoloDetails();
    }, [poloId]);

    if (loading) {
        return (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#6b7280", fontFamily: "sans-serif" }}>
                <p>Loading polo registration details...</p>
            </div>
        );
    }

    if (!polo) {
        return (
            <div style={{ width: "100%", maxWidth: "450px", margin: "auto", padding: "30px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", textAlign: "center", fontFamily: "sans-serif" }}>
                <MdError size={50} color="#dc2626" style={{ marginBottom: "15px" }} />
                <h2 style={{ color: "#1f2937", marginBottom: "10px" }}>Verification Failed</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>Polo registration not found or the QR code link is invalid.</p>
                <Link
                    href="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 16px",
                        background: "#2563eb",
                        color: "#fff",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "600"
                    }}
                >
                    <MdHome size={18} /> Go to Home
                </Link>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", maxWidth: "480px", margin: "auto", fontFamily: "sans-serif" }}>
            {/* TOP NAVIGATION / HOME LINK */}
            <div style={{ marginBottom: "15px", display: "flex", justifyContent: "flex-start" }}>
                <Link
                    href="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        background: "#fff",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: "600",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}
                >
                    <MdHome size={16} /> Home
                </Link>
            </div>

            {/* MAIN CARD */}
            <div style={{ padding: "30px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
                <div style={{ textAlign: "center", marginBottom: "25px" }}>
                    <div style={{ display: "inline-flex", padding: "12px", background: "#fef2f2", borderRadius: "50%", marginBottom: "10px" }}>
                        <MdCheckCircle size={40} color="#800000" />
                    </div>
                    <h2 style={{ color: "#800000", fontSize: "22px", fontWeight: "bold", margin: 0 }}>PIHSOPA Polo Verified</h2>
                    <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Official Registration Details</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#f9fafb", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>Polo ID:</span>
                        <strong style={{ color: "#1f2937", fontSize: "14px" }}>{polo.poloId}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>Full Name:</span>
                        <strong style={{ color: "#1f2937", fontSize: "14px" }}>{polo.fullname}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>Class Of:</span>
                        <strong style={{ color: "#1f2937", fontSize: "14px" }}>{polo.classOf || "N/A"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>House Color:</span>
                        <strong style={{ color: "#1f2937", fontSize: "14px" }}>{polo.houseColor || "N/A"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>Size:</span>
                        <strong style={{ color: "#1f2937", fontSize: "14px" }}>{polo.size || "N/A"}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>Telephone:</span>
                        <strong style={{ color: "#1f2937", fontSize: "14px" }}>{polo.telephone || "N/A"}</strong>
                    </div>
                </div>

                {/* DEVELOPER FOOTER ADVERTISEMENT */}
                <div style={{ marginTop: "25px", paddingTop: "15px", borderTop: "1px solid #e5e7eb", textAlign: "center" }}>
                    <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Powered by
                    </p>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#1f2937", margin: "0 0 6px 0" }}>
                        Leonard Sankoh-Kargbo | 078355416
                    </p>
                    <p style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600", margin: 0 }}>
                        Need a digital ticket sales system for your events?<br />Contact me for a digital solution tailored to your needs.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PoloVerifyPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Suspense fallback={<div style={{ textAlign: "center", color: "#6b7280" }}>Loading...</div>}>
                <PoloDetailsContent />
            </Suspense>
        </div>
    );
}