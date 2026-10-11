"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { MdCheckCircle, MdError } from "react-icons/md";

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
            <div style={{ maxWidth: "450px", margin: "60px auto", padding: "30px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", textAlign: "center", fontFamily: "sans-serif" }}>
                <MdError size={50} color="#dc2626" style={{ marginBottom: "15px" }} />
                <h2 style={{ color: "#1f2937", marginBottom: "10px" }}>Verification Failed</h2>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>Polo registration not found or the QR code link is invalid.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "480px", margin: "40px auto", padding: "30px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", fontFamily: "sans-serif" }}>
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