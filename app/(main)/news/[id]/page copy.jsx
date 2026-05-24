//app/news/[id]/NewsArticleContent.jsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { newsData } from "@/app/data/newsData";

// Import your verified Firebase configuration desk
import { db } from "@/app/lib/firebase";
import { doc, onSnapshot, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaTag,
  FaArrowRight,
  FaWhatsapp,
  FaHeart,
  FaRegHeart,
  FaEye,
} from "react-icons/fa";

import { motion } from "framer-motion";

export default function NewsArticlePage() {
  const params = useParams();
  const currentId = params.id;

  // Find selected static article asset metadata
  const article = newsData.find((item) => item.id === currentId);

  // Dynamic state hooks for live engagement data metrics
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [metricLoading, setMetricLoading] = useState(true);

  // Related News
  const relatedNews = newsData
    .filter((item) => item.id !== currentId)
    .slice(0, 2);

  /* =====================================================
      FIRESTORE REAL-TIME ENGAGEMENT HOOK
  ====================================================== */
  useEffect(() => {
    if (!article) return;

    const metricsRef = doc(db, "news_metrics", article.id);

    // 1. Initialize or increment the view count instantly on mount
    const initializeMetrics = async () => {
      try {
        const docSnap = await getDoc(metricsRef);
        
        if (!docSnap.exists()) {
          // Create entry document if this is the very first visit
          await setDoc(metricsRef, { views: 1, likes: 0 });
        } else {
          // Atomic incremental step up prevent write collision races
          await updateDoc(metricsRef, {
            views: increment(1)
          });
        }
      } catch (err) {
        console.error("Error setting initial metrics:", err);
      }
    };

    initializeMetrics();

    // 2. Stream real-time balance data for likes and views
    const unsubscribe = onSnapshot(metricsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setViews(data.views || 0);
        setLikes(data.likes || 0);
      }
      setMetricLoading(false);
    }, (error) => {
      console.error("Streaming error on metrics channel:", error);
      setMetricLoading(false);
    });

    // Local storage check to remember if this device already liked it
    const localLikedStatus = localStorage.getItem(`liked_${article.id}`);
    if (localLikedStatus === "true") {
      setIsLiked(true);
    }

    return () => unsubscribe();
  }, [article]);

  /* =====================================================
      INTERACTIVE LIKE HANDLER
  ====================================================== */
  const toggleLikeHandler = async () => {
    if (!article) return;
    
    const metricsRef = doc(db, "news_metrics", article.id);
    const checkingNewState = !isLiked;
    
    // Optimistic UI change update for instantaneous feedback loop response
    setIsLiked(checkingNewState);
    setLikes((prev) => checkingNewState ? prev + 1 : Math.max(0, prev - 1));

    try {
      await updateDoc(metricsRef, {
        likes: increment(checkingNewState ? 1 : -1)
      });
      // Lock status in client storage registry
      localStorage.setItem(`liked_${article.id}`, checkingNewState ? "true" : "false");
    } catch (err) {
      console.error("Failed to commit database transaction interaction:", err);
      // Revert if network drops
      setIsLiked(!checkingNewState);
      setLikes((prev) => checkingNewState ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  // Fallback view layer check if item key identifier cannot resolve
  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-4">
          Article Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The news story you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-sky-600 text-white px-6 py-3 rounded-full font-bold hover:bg-sky-700 transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  /* =====================================================
      WHATSAPP SHARE LOGIC
  ====================================================== */
  const articleUrl = `https://pihsopa.vercel.app/news/${article.id}`;
  const whatsappMessage = encodeURIComponent(
    `${article.title}\n\n${article.excerpt}\n\nRead more: ${articleUrl}`
  );
  const whatsappShareLink = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold mb-8 transition-colors group text-sm uppercase tracking-wider"
        >
          <FaArrowLeft className="transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Main Article Card element layout stack wrapper */}
        <article className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          
          {/* Image Banner */}
          <div className="relative h-64 sm:h-[400px] w-full bg-slate-200">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Core Panel Content body details */}
          <div className="p-6 sm:p-12">

            {/* Metadata Section */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2 bg-sky-50 text-sky-700 font-bold px-3 py-1 rounded-md text-xs uppercase tracking-wider">
                  <FaTag className="text-xs" />
                  {article.category}
                </span>

                <span className="flex items-center gap-2 text-slate-400 font-medium">
                  <FaCalendarAlt />
                  {article.date}
                </span>
              </div>

              {/* Dynamic Live Counter Indicators */}
              <div className="flex items-center gap-4 text-slate-500 text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl">
                <span className="flex items-center gap-1.5" title="Total Views Verified">
                  <FaEye className="text-slate-400 text-base" />
                  {metricLoading ? "..." : views}
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1.5" title="Total Likes Submitted">
                  <FaHeart className="text-rose-500 text-sm" />
                  {metricLoading ? "..." : likes}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight mb-6">
              {article.title}
            </h1>

            {/* Interactivity Bar Segment (Share and Like Panel Action Handles) */}
            <div className="flex flex-wrap items-center gap-3 mb-10 border-b border-slate-100 pb-8">
              
              {/* Like Action Toggle Button */}
              <button
                onClick={toggleLikeHandler}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all shadow-md active:scale-95 ${
                  isLiked 
                    ? "bg-rose-50 text-rose-600 border-2 border-rose-200" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-transparent"
                }`}
              >
                {isLiked ? (
                  <FaHeart className="text-rose-600 scale-110 transition-transform text-base" />
                ) : (
                  <FaRegHeart className="text-base" />
                )}
                {isLiked ? "Liked!" : "Like Update"}
              </button>

              {/* Whatsapp Platform Share Interface Launcher */}
              <a
                href={whatsappShareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-black text-sm transition-all shadow-md hover:shadow-green-500/10 active:scale-95"
              >
                <FaWhatsapp className="text-base" />
                Share on WhatsApp
              </a>

            </div>

            {/* Content Display Node */}
            <div className="text-gray-700 text-base sm:text-lg leading-relaxed space-y-6 whitespace-pre-line font-medium">
              {article.content}
            </div>
          </div>
        </article>

        {/* =====================================================
            RELATED NEWS SECTION
        ====================================================== */}
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-black text-slate-800 mb-8">
            Related News & Updates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedNews.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <span className="text-slate-400 text-xs font-semibold block mb-2">
                    {item.date}
                  </span>

                  <h3 className="text-base font-black text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 text-xs line-clamp-3 mb-4 leading-relaxed">
                    {item.excerpt}
                  </p>
                </div>

                <Link
                  href={`/news/${item.id}`}
                  className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold text-xs uppercase tracking-wider group/link mt-2"
                >
                  Read Story
                  <FaArrowRight className="text-[9px] transform group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}