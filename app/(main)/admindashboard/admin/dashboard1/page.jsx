"use client";
//app/(main)/admindashboard/admin/dashboard1/page.jsx
import React, { useState, useEffect } from "react";
import { 
  MdDashboard, MdPayments, MdLightbulb, MdChatBubble, 
  MdCreditCard, MdLogout, MdMenu, MdClose 
} from "react-icons/md";
import { useRouter } from "next/navigation";

import ClientListPage from "@/app/components/ClientListPage";
import ContributionPage from "@/app/components/ContributionPage";
import RegCodeGen from "@/app/components/RegCodeGen";


export default function dashboard1() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // 1. Data Placeholder
  const clientData = {
    fullname: "John Doe",
    clientId: "HLO-88271",
    initials: "JD"
  };

  // ⭐ Helper: Switch tab and close sidebar on mobile
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); 
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ClientListPage/>;
      case "contributions":
        return <ContributionPage/>;
      case "idea":
        return <div className="p-4 bg-yellow-50 rounded-xl text-yellow-800 font-bold border border-yellow-200">Submit a new idea.</div>;
      case "generateCode":
        return <RegCodeGen/> ;
      default:
        return <div className="p-4">Select a menu item.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      
      {/* ⭐ 1. MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* ⭐ 2. HEADER WITH CLOSE BUTTON */}
        <div className="flex items-center justify-between mb-8 border-b border-indigo-800 pb-4">
          <div className="font-black text-xl tracking-widest">HLO ADMIN</div>
          <button 
            className="md:hidden text-2xl hover:bg-white/10 p-1 rounded-full transition" 
            onClick={() => setSidebarOpen(false)}
          >
            <MdClose />
          </button>
        </div>
        
        <nav className="space-y-2">
          <NavBtn icon={<MdDashboard/>} label="Dashboard" active={activeTab === "dashboard"} onClick={() => switchTab("dashboard")} />
          <NavBtn icon={<MdPayments/>} label="Contributions" active={activeTab === "contributions"} onClick={() => switchTab("contributions")} />
          <NavBtn icon={<MdLightbulb/>} label="Ideas" active={activeTab === "idea"} onClick={() => switchTab("idea")} />
          <NavBtn icon={<MdCreditCard/>} label="GenerateCode" active={activeTab === "generateCode"} onClick={() => switchTab("generateCode")} />
        </nav>

        <button 
          className="mt-auto flex items-center gap-2 text-red-300 hover:text-white pt-10 font-bold transition" 
          onClick={() => router.push('/login')}
        >
          <MdLogout /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between shadow-sm">
          {/* ⭐ 3. MENU TOGGLE */}
          <button 
            className="md:hidden text-2xl text-indigo-900 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition" 
            onClick={() => setSidebarOpen(true)}
          >
            <MdMenu />
          </button>
          
          <h1 className="font-bold text-gray-700 capitalize tracking-tight">{activeTab}</h1>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 hidden sm:block">Admin View</span>
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-black border-2 border-indigo-100 shadow-sm">
              {clientData.initials}
            </div>
          </div>
        </header>

        <section className="p-6 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

// Reusable Button Component for Sidebar
function NavBtn({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
        active 
          ? "bg-white text-indigo-900 shadow-lg scale-105" 
          : "text-indigo-100 hover:bg-white/10 hover:translate-x-1"
      }`}
    >
      <span className="text-lg">{icon}</span> {label}
    </button>
  );
}