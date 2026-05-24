"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/lib/firebase";
import { 
  doc, onSnapshot, updateDoc, increment, 
  arrayUnion, collection, query, orderBy
} from "firebase/firestore";
import { newsData as fallbackNewsData } from "@/app/data/newsData"; // Sourcing static titles & descriptions

import { 
  MdDashboard, MdAccountCircle, MdHistory, MdCardMembership, 
  MdLogout, MdMenu, MdClose, MdSchool, MdPhone, MdLocationOn,
  MdNewspaper, MdLayers, MdWork, MdCheckCircle, MdCalendarMonth,
  MdVisibility, MdFavorite, MdFavoriteBorder, MdSend, MdArrowBack,
  MdAutorenew
} from "react-icons/md";
import IDCardModal from "@/app/components/IDCardModalMembers";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedNewsId, setSelectedNewsId] = useState(null); // Triggers detailed view
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showIDModal, setShowIDModal] = useState(false);
  const [newsFeed, setNewsFeed] = useState([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const router = useRouter();

  // Load User Data
  useEffect(() => {
    const storedUser = localStorage.getItem("hloUser");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  // Real-time Database Snapshot Listener for News Collection
  useEffect(() => {
    const newsRef = collection(db, "news");
    const newsQuery = query(newsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(newsQuery, 
      (snapshot) => {
        const liveItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Merge live database nodes directly over static mockup records
        if (liveItems.length > 0) {
          setNewsFeed([...liveItems, ...fallbackNewsData]);
        } else {
          setNewsFeed(fallbackNewsData);
        }
        setIsNewsLoading(false);
      },
      (error) => {
        console.error("Firestore live streaming interruption:", error);
        setNewsFeed(fallbackNewsData);
        setIsNewsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
      case "news":
        if (selectedNewsId) {
          return (
            <NewsDetailView 
              newsId={selectedNewsId} 
              newsFeed={newsFeed}
              user={user} 
              onBack={() => setSelectedNewsId(null)} 
            />
          );
        }
        return (
          <NewsSection 
            newsFeed={newsFeed}
            isLoading={isNewsLoading}
            onSelectArticle={(id) => setSelectedNewsId(id)} 
          />
        );
      case "contributions":
        return (
          <div className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
            <h2 className="text-xl font-black text-blue-900 mb-4 uppercase tracking-tight">My Payment History</h2>
            <p className="text-gray-500 italic text-sm">No recent contributions found.</p>
          </div>
        );
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-sky-950 text-white p-6 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-8 border-b border-sky-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center font-black text-sky-950 shadow-md">PI</div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight leading-none text-amber-400">PIHSOPA</span>
              <span className="text-[9px] font-bold text-sky-300 tracking-wider uppercase mt-1">Alumni Network</span>
            </div>
          </div>
          <button className="md:hidden text-2xl text-amber-400" onClick={() => setSidebarOpen(false)}><MdClose /></button>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          <NavBtn icon={<MdDashboard/>} label="Overview Center" active={activeTab === "overview"} onClick={() => {setActiveTab("overview"); setSelectedNewsId(null); setSidebarOpen(false);}} />
          <NavBtn icon={<MdNewspaper/>} label="News & Updates" active={activeTab === "news"} onClick={() => {setActiveTab("news"); setSidebarOpen(false);}} />
          <NavBtn icon={<MdAccountCircle/>} label="My Personal Profile" active={activeTab === "profile"} onClick={() => {setActiveTab("profile"); setSelectedNewsId(null); setSidebarOpen(false);}} />
          <NavBtn icon={<MdHistory/>} label="Contributions Log" active={activeTab === "contributions"} onClick={() => {setActiveTab("contributions"); setSelectedNewsId(null); setSidebarOpen(false);}} />
          
          <div className="pt-4 border-t border-sky-900/60 mt-4">
            <NavBtn icon={<MdCardMembership/>} label="Digital ID Card" active={false} onClick={() => setShowIDModal(true)} />
          </div>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-2 text-sky-400 hover:text-amber-400 font-black uppercase text-xs tracking-wider transition border-t border-sky-900/60 pt-4 mt-auto">
          <MdLogout size={16} /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center px-6 md:px-8 justify-between shadow-sm z-10">
          <button className="md:hidden text-2xl text-sky-950" onClick={() => setSidebarOpen(true)}><MdMenu /></button>
          <h1 className="font-black text-sky-950 uppercase text-sm tracking-widest hidden sm:block">Alumni Portal</h1>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{user.fullname}</p>
                <p className="text-[9px] text-amber-600 font-black uppercase tracking-wider">{user.membershipTier || "Regular"} Member</p>
             </div>
             <img src={user.photoURL || "/avatar.png"} className="w-11 h-11 rounded-full border-2 border-amber-400 object-cover shadow-sm" alt="profile"/>
          </div>
        </header>

        <section className="p-4 md:p-8 overflow-y-auto h-full bg-slate-50">
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-sky-900 via-sky-950 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-amber-400">
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Welcome, {user.fullname?.split(' ')[0]}!</h2>
          <p className="text-sky-200 text-xs md:text-sm max-w-md font-medium leading-relaxed">Your account portal for Providence International High School Old Pupils Association is certified active.</p>
          <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
             <span className="bg-white/10 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-white/10 flex items-center gap-1"><MdSchool className="text-amber-400"/> Graduation: {user.yearGraduation || "N/A"}</span>
             <span className="bg-white/10 px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-white/10 flex items-center gap-1"><MdCardMembership className="text-amber-400"/> {user.membershipTier || "Regular"} Tier</span>
          </div>
        </div>
        <button onClick={openID} className="bg-amber-400 text-sky-950 px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider hover:bg-amber-500 shadow-md transition-transform active:scale-95 flex-shrink-0">
          View Digital ID Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Contributions" value="Nle 0.00" sub="Year 2026 Summary" color="bg-emerald-500" />
        <StatCard title="Verification Status" value="Verified" sub={`ID: ${user.clientId || "UNASSIGNED"}`} color="bg-amber-500" />
        <StatCard title="Scholastic Tenure" value={`${user.yearAdmission || "?"} - ${user.yearGraduation || "?"}`} sub="Attendance Timeline" color="bg-sky-500" />
      </div>
    </div>
  );
}

// --- MAIN NEWS LIST FEED SECTION ---
function NewsSection({ newsFeed, isLoading, onSelectArticle }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h3 className="text-lg font-black text-sky-950 uppercase tracking-tight flex items-center gap-2">
          <MdNewspaper className="text-amber-500" /> Executive Announcements & News
        </h3>
        <p className="text-xs text-slate-500 font-bold">Click on any story to read details and view forum remarks.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
            <MdAutorenew className="text-sky-900 animate-spin" size={24} />
            <p className="text-xs font-bold text-slate-400 italic">Syncing live announcements feed from Firestore...</p>
          </div>
        ) : newsFeed.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-400 italic">No published articles located on this line path yet.</p>
          </div>
        ) : (
          newsFeed.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelectArticle(item.id)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-3 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-950 group-hover:bg-amber-400 transition-colors"></div>
              <div className="flex items-center justify-between">
                <span className="bg-sky-50 text-sky-900 font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-lg border border-sky-100">{item.category || "General"}</span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><MdCalendarMonth/> {item.date || "Recent"}</span>
              </div>
              <h4 className="text-sm font-black text-sky-950 group-hover:text-amber-600 transition-colors tracking-tight">{item.title}</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">{item.excerpt}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- DEEP DIVE INTERACTIVE VIEW WITH ENGAGEMENT AND COMMENTS ---
function NewsDetailView({ newsId, newsFeed, user, onBack }) {
  const article = newsFeed.find((item) => item.id === newsId);

  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!article) return;
    const metricsRef = doc(db, "news_metrics", article.id);

    // Stream realtime counts and custom array-nested comment threads
    const unsubscribe = onSnapshot(metricsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setViews(data.views || 0);
        setLikes(data.likes || 0);
        setComments(data.comments || []);
      }
    });

    const localLikedStatus = localStorage.getItem(`liked_${article.id}`);
    if (localLikedStatus === "true") setIsLiked(true);

    return () => unsubscribe();
  }, [article]);

  if (!article) return <p className="text-sm text-red-500 font-bold">Loading news content item record...</p>;

  const handleLikeToggle = async () => {
    const metricsRef = doc(db, "news_metrics", article.id);
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikes(p => nextState ? p + 1 : Math.max(0, p - 1));

    try {
      await updateDoc(metricsRef, { likes: increment(nextState ? 1 : -1) });
      localStorage.setItem(`liked_${article.id}`, nextState ? "true" : "false");
    } catch (err) {
      setIsLiked(!nextState);
      setLikes(p => nextState ? Math.max(0, p - 1) : p + 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    const metricsRef = doc(db, "news_metrics", article.id);

    const newCommentPayload = {
      author: user.fullname,
      photoURL: user.photoURL || "",
      text: commentText.trim(),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      })
    };

    try {
      await updateDoc(metricsRef, {
        comments: arrayUnion(newCommentPayload)
      });
      setCommentText("");
    } catch (err) {
      console.error("Failed writing forum message:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto pb-12">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-sky-900 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition active:scale-95">
        <MdArrowBack size={16}/> Back To Feed
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="bg-sky-50 text-sky-900 font-black px-2.5 py-1 rounded-lg border border-sky-100 uppercase text-[9px] tracking-wider">{article.category || "General"}</span>
            <span className="flex items-center gap-1"><MdCalendarMonth/> {article.date || "Recent"}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-sky-950 leading-tight tracking-tight">{article.title}</h2>

          <div className="flex items-center gap-4 py-2 border-y border-slate-100 text-xs font-black text-slate-500">
            <span className="flex items-center gap-1"><MdVisibility size={16} className="text-slate-400"/> {views} Views</span>
            <button onClick={handleLikeToggle} className={`flex items-center gap-1 transition ${isLiked ? 'text-rose-600' : 'text-slate-500'}`}>
              {isLiked ? <MdFavorite size={16}/> : <MdFavoriteBorder size={16}/>} {likes} Likes
            </button>
          </div>

          <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-line pt-2">{article.content || article.excerpt}</p>
        </div>
      </div>

      {/* DISCUSSIONS AND REVIEWS FORUM TIMELINE AREA */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
        <h3 className="text-xs font-black text-sky-950 uppercase tracking-widest border-b pb-3">
          Member Comments Thread ({comments.length})
        </h3>

        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No comments submitted yet. Be the first to express feedback!</p>
          ) : (
            comments.map((cmt, idx) => (
              <div key={idx} className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/60 items-start">
                <img src={cmt.photoURL || "/avatar.png"} className="w-8 h-8 rounded-full object-cover bg-slate-200 border border-slate-300/40" alt="avatar" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-sky-950 uppercase tracking-tight">{cmt.author}</h5>
                    <span className="text-[9px] font-bold text-slate-400">{cmt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-normal">{cmt.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2 border-t border-slate-100">
          <input 
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type your official comment response here..."
            className="flex-1 bg-slate-50 text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all text-slate-800"
            maxLength={300}
          />
          <button 
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="bg-sky-950 hover:bg-amber-400 hover:text-sky-950 text-white px-4 rounded-xl transition flex items-center justify-center disabled:opacity-40 disabled:hover:bg-sky-950 disabled:hover:text-white"
          >
            <MdSend size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- PROFILE SECTION ---
function ProfileSection({ user }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-xs font-black text-sky-950 border-b pb-3 uppercase tracking-wider flex items-center gap-1.5">
          <MdSchool className="text-amber-500 text-lg" /> School Enrollment History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileItem icon={<MdSchool/>} label="Class Admitted" value={user.formAdmitted || "Not Specified"} />
          <ProfileItem icon={<MdSchool/>} label="Class Attained" value={user.formAttained || "Not Specified"} />
          <ProfileItem icon={<MdCalendarMonth/>} label="Year of Admission" value={user.yearAdmission || "Not Specified"} />
          <ProfileItem icon={<MdCalendarMonth/>} label="Year of Graduation" value={user.yearGraduation || "Not Specified"} />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-xs font-black text-sky-950 border-b pb-3 uppercase tracking-wider flex items-center gap-1.5">
          <MdLayers className="text-amber-500 text-lg" /> Higher & Tertiary Education
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <ProfileItem icon={<MdLayers/>} label="College / University" value={user.tertiaryCollege || "None Listed"} />
          </div>
          <div className="md:col-span-2">
            <ProfileItem icon={<MdLayers/>} label="Course of Study" value={user.tertiaryProgram || "None Listed"} />
          </div>
          <ProfileItem icon={<MdCheckCircle/>} label="Qualifications Obtained" value={user.tertiaryQualifications || "None Listed"} />
          <ProfileItem icon={<MdCalendarMonth/>} label="Enrollment - Completion" value={user.tertiaryYearEnrolled ? `${user.tertiaryYearEnrolled} - ${user.tertiaryYearCompleted || "Present"}` : "None Listed"} />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-xs font-black text-sky-950 border-b pb-3 uppercase tracking-wider flex items-center gap-1.5">
          <MdWork className="text-amber-500 text-lg" /> Professional & Contact Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileItem icon={<MdWork/>} label="Employment Status" value={user.professionalStatus || "Not Specified"} />
          <ProfileItem icon={<MdWork/>} label="Place of Work / Enterprise" value={user.placeOfWork || "Not Specified"} />
          <ProfileItem icon={<MdPhone/>} label="Phone Number" value={user.tel || "None"} />
          <ProfileItem icon={<MdLocationOn/>} label="Residential Address" value={user.address || "None Specified"} />
          <ProfileItem icon={<MdAccountCircle/>} label="Full Legal Name" value={user.fullname} />
          <ProfileItem icon={<MdCardMembership/>} label="Unique Member ID" value={user.clientId || "Pending Initialization"} />
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE LEAF COMPONENTS ---
function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
        active ? "bg-amber-400 text-sky-950 font-black shadow-md" : "text-sky-100 hover:bg-white/5"
      }`}>
      <span className="text-lg">{icon}</span> {label}
    </button>
  );
}

function StatCard({ title, value, sub, color }) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-1.5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${color}`}></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-black text-sky-950 tracking-tight">{value}</p>
      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{sub}</p>
    </div>
  );
}

function ProfileItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/40">
      <div className="text-sky-600 text-lg mt-0.5">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1.5">{label}</p>
        <p className="font-bold text-xs text-slate-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}