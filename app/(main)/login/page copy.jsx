"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/app/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  FaUserCircle,
  FaIdCard,
  FaUser,
  FaSpinner,
  FaShieldAlt,
} from "react-icons/fa";

/* 🔀 Updated Dynamic Route Resolver */
const getRouteByType = (role, userData) => {
  // If Admin, we still use dashboardType
  if (role === "admin") {
    switch (userData.dashboardType) {
      case "AdminDashboard1":
        return "/admindashboard/admin/dashboard1";
      case "AdminDashboard2":
        return "/admindashboard/admin/SHERGOSAdashboard2";
      case "AdminDashboard3":
        return "/admindashboard/admin/PIHSOPAdashboard2";
      default:
        return "/admindashboard/admin/dashboard1";
    }
  }

  // ⭐ Updated: Client login based on orgId
  if (role === "client") {
    if (userData.orgId === "SHERGOSA") {
      return "/StudentDashboard/SHERGOSA"; // Your SHERGOSA Alumni Dashboard
    }
    // 2. Routing for other systems (e.g., Rural School System)
    if (orgId === "RURAL_SCHOOL") {
      return "/dashboard/student";
    }

    // 3. Routing for Microfinance/Banking clients
    if (orgId === "LIL_OTHERS") {
      return "/dashboard/finance";
    }

    // Fallback for other potential organisations
    return "/dashboard/clientdashboard";
  }

  return "/";
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const clientId = e.target.clientId.value.trim().toUpperCase();
    const fullName = e.target.fullName.value.trim().toUpperCase();

    try {
      /* ================= ADMIN LOGIN ================= */
      const adminQuery = query(
        collection(db, "admins"),
        where("adminId", "==", clientId),
        where("fullname", "==", fullName)
      );

      const adminSnap = await getDocs(adminQuery);

      if (!adminSnap.empty) {
        const adminData = adminSnap.docs[0].data();

        localStorage.setItem(
          "hloUser",
          JSON.stringify({ ...adminData, role: "admin" })
        );

        // Pass adminData object to resolver
        router.push(getRouteByType("admin", adminData));
        return;
      }

      /* ================= CLIENT / STUDENT LOGIN ================= */
      const clientQuery = query(
        collection(db, "clients"),
        where("clientId", "==", clientId),
        where("fullname", "==", fullName)
      );

      const clientSnap = await getDocs(clientQuery);

      if (!clientSnap.empty) {
        const clientData = clientSnap.docs[0].data();

        
        localStorage.setItem(
          "hloUser",
          JSON.stringify({ ...clientData, role: "client" })
        );

        // Pass clientData object to resolver to check orgId
        router.push(getRouteByType("client", clientData));
      } else {
        setError(
          "Invalid ID or Name. Ensure details match exactly."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Network or system error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border-t-8 border-indigo-700">
        <div className="p-8 text-center">
          <FaUserCircle className="text-6xl text-indigo-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tighter">SHERGOSA</h1>
          <p className="text-gray-500 text-sm">
            SOS Hermann Gmeiner Old Students' Association
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 pt-0 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-200 text-center">
              {error}
            </div>
          )}

          {/* USER ID */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">
              Membership ID Number
            </label>
            <div className="relative">
              <FaIdCard className="absolute left-3 top-3 text-gray-400" />
              <input
                name="clientId"
                placeholder="e.g. SHG-2026"
                className="pl-10 w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold"
                required
              />
            </div>
          </div>

          {/* FULL NAME */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">
              Full Registered Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                name="fullName"
                placeholder="Full Name"
                className="pl-10 w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold"
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center shadow-lg active:scale-95 transition-all"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : "Sign In to Portal"}
          </button>
        </form>

        <div className="p-6 bg-gray-50 text-center border-t rounded-b-2xl">
          <p className="text-[10px] text-gray-400 flex justify-center items-center gap-1 mb-2 uppercase font-bold">
            <FaShieldAlt /> Secure Alumni Access
          </p>
          <p className="text-sm text-gray-600">
            Not registered yet? 
            <Link
              href="/register"
              className="text-indigo-600 font-black ml-1 hover:underline"
            >
              Join Association
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}