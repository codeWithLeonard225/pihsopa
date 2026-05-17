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

/* 🔀 Dynamic Route Resolver */
const getRouteByType = (role, userData) => {
  // 1. Admin Routing
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

  // 2. Client / Old Pupil Routing
  if (role === "client") {
    // Providence International High School Route
    if (userData.orgId === "PIHSOPA") {
      return "/StudentDashboard/PIHSOPA";
    }
    
    // SHERGOSA Alumni Route
    if (userData.orgId === "SHERGOSA") {
      return "/StudentDashboard/SHERGOSA";
    }

    // Rural School System Route (Fixed variable source)
    if (userData.orgId === "RURAL_SCHOOL") {
      return "/dashboard/student";
    }

    // Microfinance/Banking clients Route (Fixed variable source)
    if (userData.orgId === "LIL_OTHERS") {
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
   const fullName = normalizeName(
  e.target.fullName.value
);

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

const normalizeName = (name) => {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border-t-8 border-blue-600 transition-all duration-300">
        
        {/* Branding Header */}
        <div className="p-8 text-center">
          <div className="inline-flex p-4 bg-blue-50 rounded-full text-blue-600 mb-4">
            <FaUserCircle className="text-5xl" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">PIHSOPA</h1>
          <p className="text-slate-500 text-sm mt-1">
            Providence International High School Old Pupils Association
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className="p-8 pt-0 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-200 text-center animate-shake">
              {error}
            </div>
          )}

          {/* USER ID */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 ml-1">
              Membership ID Number
            </label>
            <div className="relative">
              <FaIdCard className="absolute left-4 top-4 text-slate-400" />
              <input
                name="clientId"
                placeholder="e.g. PIHS-2026"
                className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>
          </div>

          {/* FULL NAME */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2 ml-1">
              Full Registered Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-slate-400" />
              <input
                name="fullName"
                placeholder="Firstname Lastname"
                className="pl-12 w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                required
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-xl flex justify-center items-center shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : "Sign In to Portal"}
          </button>
        </form>

        {/* Bottom Navigation Utilities */}
        <div className="p-6 bg-slate-50 text-center border-t border-slate-100 rounded-b-2xl">
          <p className="text-[10px] text-slate-400 flex justify-center items-center gap-1 mb-2 uppercase font-black tracking-wider">
            <FaShieldAlt className="text-blue-500" /> Secure Alumni Access
          </p>
          <p className="text-sm text-slate-600">
            Not registered yet? 
            <Link
              href="/register"
              className="text-blue-600 font-black ml-1 hover:underline"
            >
              Join Association
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}