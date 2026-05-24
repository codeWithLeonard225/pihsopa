"use client";

// app/(main)/admindashboard/admin/dashboard2/page.jsx

import React, { useState } from "react";
import {
  MdDashboard,
  MdPeople,
  MdEdit,
  MdCardMembership,
  MdPayments,
  MdArticle,
  MdForum,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
  MdKeyboardArrowDown,
  MdPerson,
  MdCampaign,
  MdAnalytics,
  MdVerified,
  MdNewspaper,
} from "react-icons/md";

import { useRouter } from "next/navigation";

// COMPONENTS
import ClientListPage from "@/app/components/ClientListPage";
import ContributionPage from "@/app/components/ContributionPage";
import RegCodeGen from "@/app/components/RegCodeGen";
import EditMemberPage from "@/app/components/EditMemberPage";
import NewsCommentsAdmin from "@/app/components/NewsCommentsAdmin";
import PostNewsPage from "@/app/components/PostNewsPage";
import ManageNewsPage from "@/app/components/ManageNewsPage";
// import NewsCommentsAdmin from "@/app/components/NewsCommentsAdmin";

// ---------------- NAVIGATION ----------------

const NAV_ITEMS = [
  {
    key: "members",
    label: "Members",
    icon: <MdPeople />,
    children: [
      {
        key: "ClientListPage",
        label: "All Members",
        icon: <MdPerson />,
      },
      {
        key: "EditMemberPage",
        label: "Edit Member",
        icon: <MdEdit />,
      },
      {
        key: "generateCode",
        label: "Generate ID Code",
        icon: <MdCardMembership />,
      },
    ],
  },

  {
    key: "finance",
    label: "Finance",
    icon: <MdPayments />,
    children: [
      {
        key: "contributions",
        label: "Contributions",
        icon: <MdPayments />,
      },
    ],
  },

  {
    key: "news",
    label: "News & Media",
    icon: <MdNewspaper />,
    children: [
      {
        key: "NewsCommentsAdmin",
        label: "News Comments",
        icon: <MdForum />,
      },
      {
        key: "announcements",
        label: "Post News ",
        icon: <MdCampaign />,
      },
      {
        key: "ManageNewsPage",
        label: "update/delete News ",
        icon: <MdCampaign />,
      },
    ],
  },

  {
    key: "analytics",
    label: "Analytics",
    icon: <MdAnalytics />,
  },

  {
    key: "settings",
    label: "Settings",
    icon: <MdSettings />,
  },

  {
    key: "logout",
    label: "Logout",
    icon: <MdLogout />,
  },
];

// ---------------- BUTTON ----------------

function Button({
  children,
  onClick,
  active = false,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-black tracking-wide
      ${
        active
          ? "bg-amber-400 text-sky-950 shadow-lg"
          : "text-slate-200 hover:bg-white/10"
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ---------------- DASHBOARD HOME ----------------

function DashboardHome() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HERO */}
      <div className="bg-gradient-to-br from-sky-900 via-sky-950 to-blue-950 rounded-3xl p-8 text-white shadow-xl border-b-4 border-amber-400">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              PIHSOPA ADMIN PORTAL
            </h1>

            <p className="text-sky-100 text-sm max-w-2xl leading-relaxed">
              Providence International High School Old Pupils Association
              management system for alumni records, contributions, news,
              engagement, and administration.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-xl text-[10px] uppercase font-black tracking-wider">
                Alumni Management
              </span>

              <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-xl text-[10px] uppercase font-black tracking-wider">
                News Monitoring
              </span>

              <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-xl text-[10px] uppercase font-black tracking-wider">
                Contribution Tracking
              </span>
            </div>
          </div>

          <div className="bg-white/10 rounded-3xl p-5 border border-white/10 backdrop-blur">
            <div className="text-[10px] uppercase tracking-widest text-sky-200 font-black">
              SYSTEM STATUS
            </div>

            <div className="flex items-center gap-2 mt-2">
              <MdVerified className="text-emerald-400 text-2xl" />
              <span className="font-black text-xl">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Registered Members"
          value="1,240"
          icon={<MdPeople />}
          color="bg-sky-500"
        />

        <StatCard
          title="Contributions"
          value="NLe 24,000"
          icon={<MdPayments />}
          color="bg-emerald-500"
        />

        <StatCard
          title="News Articles"
          value="18"
          icon={<MdArticle />}
          color="bg-amber-500"
        />

        <StatCard
          title="Forum Comments"
          value="325"
          icon={<MdForum />}
          color="bg-rose-500"
        />
      </div>

      {/* QUICK INFO */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-sky-950 mb-4">
          Administrative Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <p className="font-black text-slate-700 mb-2">
              Member Management
            </p>

            <p className="text-slate-500 leading-relaxed">
              Manage alumni records, update profiles, verify graduates,
              generate member codes, and monitor registration activities.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <p className="font-black text-slate-700 mb-2">
              News & Community
            </p>

            <p className="text-slate-500 leading-relaxed">
              Publish alumni news, monitor comments, approve discussions,
              remove spam, and improve community engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- STAT CARD ----------------

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${color}`}></div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            {title}
          </p>

          <h3 className="text-2xl font-black text-sky-950 mt-1">
            {value}
          </h3>
        </div>

        <div className="text-3xl text-slate-300">{icon}</div>
      </div>
    </div>
  );
}

// ---------------- PLACEHOLDER ----------------

function Placeholder({ title }) {
  return (
    <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-black text-sky-950 mb-2">
        {title}
      </h2>

      <p className="text-slate-500">
        This section is under development.
      </p>
    </div>
  );
}

// ---------------- MAIN PANEL ----------------

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();

  // TOGGLE DROPDOWN
  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // SWITCH TAB
  const switchTab = (tab) => {
    if (tab === "logout") {
      localStorage.removeItem("hloUser");
      router.push("/login");
      return;
    }

    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // ---------------- CONTENT ----------------

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardHome />;

      case "EditMemberPage":
        return <EditMemberPage />;

      case "dashboardMembers":
        return <ClientListPage />;

      case "contributions":
        return <ContributionPage />;

      case "generateCode":
        return <RegCodeGen />;

      case "NewsCommentsAdmin":
        return <NewsCommentsAdmin />;

      case "announcements":
        return <PostNewsPage/>;
      case "ManageNewsPage":
        return <ManageNewsPage/>;

      case "analytics":
        return <Placeholder title="Analytics Dashboard" />;

      case "settings":
        return <Placeholder title="System Settings" />;

      default:
        return <ClientListPage />;
    }
  };

  // ---------------- NAV RENDER ----------------

  const renderNavItems = (items, level = 0) =>
    items.map((item) => (
      <div key={item.key}>
        {item.children ? (
          <>
            <Button
              onClick={() => toggleDropdown(item.key)}
              active={openDropdowns[item.key]}
              className={`${level > 0 ? "ml-4" : ""}`}
            >
              <span className="text-xl">{item.icon}</span>

              <span>{item.label}</span>

              <MdKeyboardArrowDown
                className={`ml-auto transition-transform ${
                  openDropdowns[item.key] ? "rotate-180" : ""
                }`}
              />
            </Button>

            {openDropdowns[item.key] && (
              <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                {renderNavItems(item.children, level + 1)}
              </div>
            )}
          </>
        ) : (
          <Button
            onClick={() => switchTab(item.key)}
            active={activeTab === item.key}
            className={`${level > 0 ? "text-xs" : ""}`}
          >
            <span className="text-lg">{item.icon}</span>

            <span>{item.label}</span>
          </Button>
        )}
      </div>
    ));

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-sky-950 text-white p-5 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-amber-400">
              PIHSOPA
            </h1>

            <p className="text-[10px] uppercase tracking-widest text-sky-300 font-black mt-1">
              Admin Dashboard
            </p>
          </div>

          <button
            className="md:hidden text-2xl"
            onClick={() => setSidebarOpen(false)}
          >
            <MdClose />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1">
          <Button
            onClick={() => switchTab("dashboard")}
            active={activeTab === "dashboard"}
          >
            <MdDashboard className="text-xl" />
            Dashboard
          </Button>

          {renderNavItems(NAV_ITEMS)}
        </div>

        {/* FOOTER */}
        <div className="pt-5 border-t border-white/10 mt-5">
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-sky-300 font-black">
              Organization
            </p>

            <h4 className="font-black text-sm mt-1">
              Providence International High School Old Pupils Association
            </h4>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-5 md:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-3xl text-sky-950"
              onClick={() => setSidebarOpen(true)}
            >
              <MdMenu />
            </button>

            <div>
              <h2 className="text-lg md:text-xl font-black text-sky-950 capitalize">
                {activeTab}
              </h2>

              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                PIHSOPA Administrative System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-black text-slate-700 uppercase">
                System Administrator
              </p>

              <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider">
                Full Access
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-sky-950 text-white flex items-center justify-center font-black border-2 border-amber-400">
              AD
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}