"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { 
  collection, query, orderBy, doc, onSnapshot, updateDoc 
} from "firebase/firestore";
import { newsData as fallbackNewsData } from "@/app/data/newsData"; // Sourcing backup elements
import { 
  MdNewspaper, MdCalendarMonth, MdVisibility, 
  MdFavorite, MdForum, MdDelete, MdArrowBack, MdShield,
  MdBarChart, MdAutorenew
} from "react-icons/md";

export default function NewsCommentsAdmin() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL");

  // 1. Realtime sub loop hook fetching live updates from Firebase
  useEffect(() => {
    const newsRef = collection(db, "news");
    const newsQuery = query(newsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(newsQuery, 
      (snapshot) => {
        const liveItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Merge live DB data ahead of our static array backup elements
        if (liveItems.length > 0) {
          setNewsFeed([...liveItems, ...fallbackNewsData]);
        } else {
          setNewsFeed(fallbackNewsData);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading updates from Firestore:", error);
        // Fallback gracefully on local asset array if permissions drop
        setNewsFeed(fallbackNewsData);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute unique categories dynamically from active feed dataset
  const categories = ["ALL", ...new Set(newsFeed.map(item => item.category).filter(Boolean))];

  // Filter local state tracking array
  const filteredNews = activeCategory === "ALL" 
    ? newsFeed 
    : newsFeed.filter(item => item.category === activeCategory);

  if (selectedNewsId) {
    return (
      <AdminNewsDetailView 
        newsId={selectedNewsId} 
        newsFeed={newsFeed}
        onBack={() => setSelectedNewsId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <h3 className="text-lg font-black text-sky-950 uppercase tracking-tight flex items-center gap-2">
          <MdShield className="text-amber-500" /> News Moderation & Engagement Hub
        </h3>
        <p className="text-xs text-slate-500 font-bold">
          Select an article down below to audit user metrics, monitor discussions, and moderate community text responses.
        </p>
      </div>

      {/* AGGREGATED METRICS SUMMARY TRACKER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-900 rounded-xl border border-sky-100">
            <MdNewspaper size={18} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Feed</span>
            <span className="text-sm font-black text-sky-950">
              {isLoading ? "..." : `${newsFeed.length} Articles`}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <MdBarChart size={18} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Channels</span>
            <span className="text-sm font-black text-sky-950">
              {isLoading ? "..." : `${categories.length - 1} Categories`}
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      {!isLoading && newsFeed.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 MaskScrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase border transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-sky-950 text-white border-sky-950 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ARTICLE FEED GRID */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
            <MdAutorenew className="text-sky-900 animate-spin" size={24} />
            <p className="text-xs font-bold text-slate-400 italic">Syncing live collection channels from Firestore...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-400 italic">No news logs or timeline items matching this query path.</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <AdminNewsCard 
              key={item.id} 
              item={item} 
              onSelect={() => setSelectedNewsId(item.id)} 
            />
          ))
        )}
      </div>
    </div>
  );
}

// --- STREAMING INTERACTIVE DATA FEED CARD ---
function AdminNewsCard({ item, onSelect }) {
  const [metrics, setMetrics] = useState({ views: 0, likes: 0, comments: [] });

  useEffect(() => {
    const metricsRef = doc(db, "news_metrics", item.id);
    const unsubscribe = onSnapshot(metricsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setMetrics({
          views: data.views || 0,
          likes: data.likes || 0,
          comments: data.comments || []
        });
      }
    });
    return () => unsubscribe();
  }, [item.id]);

  return (
    <div 
      onClick={onSelect}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-950 group-hover:bg-amber-400 transition-colors"></div>
      
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-3">
          <span className="bg-sky-50 text-sky-900 font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-lg border border-sky-100">
            {item.category || "General"}
          </span>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <MdCalendarMonth/> {item.date || "Recent"}
          </span>
        </div>
        <h4 className="text-sm font-black text-sky-950 group-hover:text-amber-600 transition-colors tracking-tight">
          {item.title}
        </h4>
        <p className="text-xs text-slate-500 font-medium line-clamp-1 max-w-xl">
          {item.excerpt}
        </p>
      </div>

      {/* ENGAGEMENT METRICS OVERVIEW */}
      <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 self-start md:self-auto">
        <div className="text-center px-2">
          <span className="block text-slate-400 text-[9px] font-black uppercase tracking-wider">Views</span>
          <span className="text-xs font-black text-sky-950 flex items-center gap-0.5 justify-center mt-0.5">
            <MdVisibility className="text-slate-400" /> {metrics.views}
          </span>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="text-center px-2">
          <span className="block text-slate-400 text-[9px] font-black uppercase tracking-wider">Likes</span>
          <span className="text-xs font-black text-rose-600 flex items-center gap-0.5 justify-center mt-0.5">
            <MdFavorite /> {metrics.likes}
          </span>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="text-center px-2">
          <span className="block text-slate-400 text-[9px] font-black uppercase tracking-wider">Threads</span>
          <span className="text-xs font-black text-sky-900 flex items-center gap-0.5 justify-center mt-0.5">
            <MdForum /> {metrics.comments.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN DETAILED AUDIT AND COMMENT DELETION VIEW ---
function AdminNewsDetailView({ newsId, newsFeed, onBack }) {
  const article = newsFeed.find((item) => item.id === newsId);
  const [metrics, setMetrics] = useState({ views: 0, likes: 0, comments: [] });

  useEffect(() => {
    if (!article) return;
    const metricsRef = doc(db, "news_metrics", article.id);

    const unsubscribe = onSnapshot(metricsRef, (snapshot) => {
      if (snapshot.exists()) {
        setMetrics(snapshot.data());
      }
    });
    return () => unsubscribe();
  }, [article]);

  if (!article) return <p className="text-sm text-red-500 font-bold">Loading media parameters...</p>;

  // MODERATION ACTION: DELETE COMMENT BY INDEX FROM ARRAY
  const handleDeleteComment = async (commentIndex) => {
    const confirmation = window.confirm("Are you absolutely sure you want to remove this member comment response from the system logs?");
    if (!confirmation) return;

    const metricsRef = doc(db, "news_metrics", article.id);
    const updatedComments = [...(metrics.comments || [])];
    
    // Splice target comment
    updatedComments.splice(commentIndex, 1);

    try {
      await updateDoc(metricsRef, {
        comments: updatedComments
      });
    } catch (err) {
      console.error("Critical error auditing or cleaning collection index:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto pb-12">
      <button 
        onClick={onBack} 
        className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-sky-900 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition active:scale-95"
      >
        <MdArrowBack size={16}/> Back To Panel Feed
      </button>

      {/* ARTICLE BODY PREVIEW CONTAINER */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="bg-sky-50 text-sky-900 font-black px-2.5 py-1 rounded-lg border border-sky-100 uppercase text-[9px] tracking-wider">
              {article.category || "General"}
            </span>
            <span className="flex items-center gap-1"><MdCalendarMonth/> {article.date || "Recent"}</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-sky-950 leading-tight tracking-tight">
            {article.title}
          </h2>

          <div className="flex items-center gap-4 py-2 border-y border-slate-100 text-xs font-black text-slate-500">
            <span className="flex items-center gap-1"><MdVisibility size={16}/> {metrics.views || 0} Total Reads</span>
            <span className="flex items-center gap-1 text-rose-600"><MdFavorite size={16}/> {metrics.likes || 0} Active Endorsements</span>
          </div>

          <p className="text-slate-600 text-xs font-medium leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-dashed">
            {article.content || article.excerpt}
          </p>
        </div>
      </div>

      {/* MODERATION AREA */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="border-b pb-3 flex justify-between items-center">
          <h3 className="text-xs font-black text-sky-950 uppercase tracking-widest">
            Audit Forum Discussions ({metrics.comments?.length || 0})
          </h3>
          <span className="bg-amber-100 text-amber-900 font-black text-[9px] tracking-wide uppercase px-2 py-0.5 rounded-md">
            Moderator Access Mode
          </span>
        </div>

        {/* FEED RENDER STACK */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {!metrics.comments || metrics.comments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No community comments logged under this article timeline tracker.</p>
          ) : (
            metrics.comments.map((cmt, idx) => (
              <div 
                key={idx} 
                className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-start justify-between group"
              >
                <div className="flex gap-3 items-start flex-1">
                  <img 
                    src={cmt.photoURL || "/avatar.png"} 
                    className="w-8 h-8 rounded-full object-cover bg-slate-200 border border-slate-300" 
                    alt="avatar" 
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-black text-sky-950 uppercase tracking-tight">{cmt.author}</h5>
                      <span className="text-[9px] font-bold text-slate-400">{cmt.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-normal">{cmt.text}</p>
                  </div>
                </div>

                {/* CRITICAL DELETE BUTTON TRIGGER ACTION */}
                <button
                  onClick={() => handleDeleteComment(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-sm flex-shrink-0"
                  title="Remove response comment text payload immediately"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}