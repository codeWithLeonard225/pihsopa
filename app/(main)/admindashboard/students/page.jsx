"use client";
//app/(main)/admindashboard/students/page.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FaUserCircle, FaIdCard, FaHistory, FaCreditCard, 
  FaCalendarAlt, FaNewspaper, FaSignOutAlt 
} from "react-icons/fa";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("hloUser");
    if (!storedUser) {
      router.push("/login"); // Redirect if not logged in
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("hloUser");
    router.push("/");
  };

  if (!user) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* --- Sidebar --- */}
      <aside className="w-full md:w-64 bg-indigo-900 text-white p-6">
        <div className="text-xl font-bold mb-8 flex items-center gap-2">
          <div className="bg-white text-indigo-900 p-1 rounded-md text-sm">SG</div>
          SHERGOSA
        </div>
        <nav className="space-y-4">
          <button className="flex items-center gap-3 w-full p-3 bg-indigo-800 rounded-lg text-left">
            <FaUserCircle /> My Profile
          </button>
          <button className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded-lg text-left transition">
            <FaCreditCard /> Dues & Payments
          </button>
          <button className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded-lg text-left transition">
            <FaCalendarAlt /> Events
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-300 hover:bg-red-900/30 rounded-lg text-left transition mt-10">
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back, {user.fullname.split(' ')[0]}!</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase">
              {user.role} Member
            </span>
          </div>
        </header>

        {/* --- Dashboard Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Digital ID Card Section */}
          <div className="md:col-span-2 bg-gradient-to-r from-indigo-700 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between h-full">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-indigo-200 text-sm uppercase tracking-widest">Digital Alumni Card</p>
                  <h2 className="text-2xl font-bold mt-1">{user.fullname}</h2>
                  <p className="text-indigo-100 opacity-80 mt-1">ID: {user.clientId}</p>
                </div>
                <div className="mt-8">
                  <p className="text-xs opacity-70">Member Since</p>
                  <p className="font-mono">{new Date().getFullYear()}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 bg-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col items-center justify-center border border-white/20">
                <FaIdCard className="text-5xl mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Verified Member</span>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Quick Stats / Dues */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FaHistory className="text-indigo-600" /> Payment Status
            </h3>
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">Annual Dues 2026</p>
              <h4 className="text-3xl font-black text-gray-800 mt-1">Pending</h4>
              <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition">
                Pay Now
              </button>
            </div>
          </div>

          {/* News Feed */}
          <div className="md:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FaNewspaper className="text-indigo-600" /> Latest Announcements
            </h3>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-indigo-500 bg-gray-50 rounded-r-lg">
                <p className="text-xs text-gray-500">May 10, 2026</p>
                <h4 className="font-bold text-gray-800">Annual General Meeting (AGM)</h4>
                <p className="text-sm text-gray-600">Join us for the 2026 AGM at the main campus hall...</p>
              </div>
              <div className="p-4 border-l-4 border-blue-400 bg-gray-50 rounded-r-lg opacity-75">
                <p className="text-xs text-gray-500">April 22, 2026</p>
                <h4 className="font-bold text-gray-800">Scholarship Fund Drive</h4>
                <p className="text-sm text-gray-600">The 2026 scholarship fund is now open for donations.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}