"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MdDashboard, MdAccountCircle, MdHistory, MdCardMembership, 
  MdLogout, MdMenu, MdClose, MdSchool, MdPhone, MdLocationOn 
} from "react-icons/md";
import IDCardModal from "@/app/components/IDCardModalMembers";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showIDModal, setShowIDModal] = useState(false);
  const router = useRouter();

  // Load user data from localStorage (set during login)
  useEffect(() => {
    const storedUser = localStorage.getItem("hloUser");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("hloUser");
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection user={user} openID={() => setShowIDModal(true)} />;
      case "profile":
        return <ProfileSection user={user} />;
      case "contributions":
        return <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">My Payment History</h2>
          <p className="text-gray-500 italic">No recent contributions found.</p>
        </div>;
      default:
        return <div className="p-4 text-gray-500">Coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-sky-900 text-white p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-8 border-b border-sky-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-400 rounded-lg flex items-center justify-center font-black text-sky-900">SG</div>
            <span className="font-black text-lg tracking-tight">SHERGOSA</span>
          </div>
          <button className="md:hidden text-2xl" onClick={() => setSidebarOpen(false)}><MdClose /></button>
        </div>
        
        <nav className="space-y-2">
          <NavBtn icon={<MdDashboard/>} label="Overview" active={activeTab === "overview"} onClick={() => {setActiveTab("overview"); setSidebarOpen(false);}} />
          <NavBtn icon={<MdAccountCircle/>} label="My Profile" active={activeTab === "profile"} onClick={() => {setActiveTab("profile"); setSidebarOpen(false);}} />
          <NavBtn icon={<MdHistory/>} label="Contributions" active={activeTab === "contributions"} onClick={() => {setActiveTab("contributions"); setSidebarOpen(false);}} />
          <NavBtn icon={<MdCardMembership/>} label="Digital ID Card" active={false} onClick={() => setShowIDModal(true)} />
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 text-sky-300 hover:text-white pt-10 font-bold transition">
          <MdLogout /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center px-8 justify-between shadow-sm">
          <button className="md:hidden text-2xl text-sky-900" onClick={() => setSidebarOpen(true)}><MdMenu /></button>
          <h1 className="font-black text-blue-900 uppercase tracking-tighter hidden sm:block">Alumni Portal</h1>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user.fullname}</p>
                <p className="text-[10px] text-sky-600 font-bold uppercase">{user.membershipTier} Member</p>
             </div>
             <img src={user.photoURL || "/avatar.png"} className="w-12 h-12 rounded-full border-2 border-sky-100 object-cover shadow-sm" alt="profile"/>
          </div>
        </header>

        <section className="p-6 md:p-10 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-200">
          {renderContent()}
        </section>
      </main>

      {showIDModal && <IDCardModal client={user} onClose={() => setShowIDModal(false)} />}
    </div>
  );
}

// --- OVERVIEW SECTION ---
function OverviewSection({ user, openID }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* WELCOME CARD */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tight">Hello, {user.fullname.split(' ')[0]}!</h2>
          <p className="text-sky-100 opacity-90 max-w-md">Welcome back to the SHERGOSA portal. Your membership is active and your records are up to date.</p>
          <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1"><MdSchool/> Batch: {user.className}</span>
             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1"><MdCardMembership/> {user.membershipTier} Member</span>
          </div>
        </div>
        <button onClick={openID} className="bg-white text-blue-900 px-8 py-3 rounded-2xl font-black uppercase text-sm hover:bg-sky-50 shadow-lg transition-transform active:scale-95">
          View ID Card
        </button>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Contributions" value="Nle 0.00" sub="Year 2026" color="bg-emerald-500" />
        <StatCard title="Membership Status" value="Verified" sub={user.clientId} color="bg-blue-500" />
        <StatCard title="Edu. Period" value={user.eduPeriod} sub="Years in School" color="bg-orange-500" />
      </div>
    </div>
  );
}

// --- PROFILE SECTION ---
function ProfileSection({ user }) {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-500">
            <h3 className="text-lg font-black text-blue-900 border-b pb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProfileItem icon={<MdAccountCircle/>} label="Full Name" value={user.fullname} />
                <ProfileItem icon={<MdSchool/>} label="Graduating Year" value={user.className} />
                <ProfileItem icon={<MdPhone/>} label="Phone Number" value={user.tel} />
                <ProfileItem icon={<MdLocationOn/>} label="Residential Address" value={user.address} />
                <ProfileItem icon={<MdCardMembership/>} label="Member ID" value={user.clientId} />
                <ProfileItem icon={<MdAccountCircle/>} label="Occupation" value={user.occupation} />
            </div>
        </div>
    )
}

// --- REUSABLE COMPONENTS ---
function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
        active ? "bg-white text-sky-900 shadow-xl" : "text-sky-100 hover:bg-white/10"
      }`}>
      <span className="text-xl">{icon}</span> {label}
    </button>
  );
}

function StatCard({ title, value, sub, color }) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-1">
        <div className={`w-2 h-8 rounded-full ${color} mb-2`}></div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-gray-800 tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-gray-500 uppercase">{sub}</p>
      </div>
    );
}

function ProfileItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="text-sky-500 text-xl mt-1">{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
                <p className="font-bold text-gray-800">{value}</p>
            </div>
        </div>
    )
}