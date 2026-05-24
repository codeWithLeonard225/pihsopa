"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { db } from "@/app/lib/firebase";

import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaTag,
  FaArrowRight,
  FaWhatsapp,
  FaHeart,
  FaRegHeart,
  FaEye,
  FaPlayCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import { motion } from "framer-motion";

export default function NewsArticlePage() {
  const params = useParams();
  const currentId = params.id;

  const [article, setArticle] = useState(null);

  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [metricLoading, setMetricLoading] = useState(true);

  const [relatedNews, setRelatedNews] = useState([]);
  const [loadingArticle, setLoadingArticle] = useState(true);

  /* =====================================================
      FETCH ARTICLE FROM FIRESTORE
  ====================================================== */

  useEffect(() => {
    if (!currentId) return;

    const articleRef = doc(db, "news", currentId);

    const unsubscribe = onSnapshot(
      articleRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const articleData = {
            id: snapshot.id,
            ...snapshot.data(),
          };

          setArticle(articleData);

          // FETCH RELATED NEWS
          const newsRef = collection(db, "news");

          const newsQuery = query(
            newsRef,
            orderBy("createdAt", "desc"),
            limit(6)
          );

          const newsSnapshot = await getDocs(newsQuery);

          const related = newsSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((item) => item.id !== currentId)
            .slice(0, 2);

          setRelatedNews(related);
        } else {
          setArticle(null);
        }

        setLoadingArticle(false);
      },
      (error) => {
        console.error("Error fetching article:", error);
        setLoadingArticle(false);
      }
    );

    return () => unsubscribe();
  }, [currentId]);

  /* =====================================================
      FIRESTORE REAL-TIME ENGAGEMENT HOOK
  ====================================================== */

  useEffect(() => {
    if (!article) return;

    const metricsRef = doc(db, "news_metrics", article.id);

    const initializeMetrics = async () => {
      try {
        const docSnap = await getDoc(metricsRef);

        if (!docSnap.exists()) {
          await setDoc(metricsRef, {
            views: 1,
            likes: 0,
            comments: [],
          });
        } else {
          await updateDoc(metricsRef, {
            views: increment(1),
          });
        }
      } catch (err) {
        console.error("Error setting initial metrics:", err);
      }
    };

    initializeMetrics();

    const unsubscribe = onSnapshot(
      metricsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setViews(data.views || 0);
          setLikes(data.likes || 0);
          setComments(data.comments || []);
        }

        setMetricLoading(false);
      },
      (error) => {
        console.error("Streaming error:", error);
        setMetricLoading(false);
      }
    );

    const localLikedStatus = localStorage.getItem(
      `liked_${article.id}`
    );

    if (localLikedStatus === "true") {
      setIsLiked(true);
    }

    return () => unsubscribe();
  }, [article]);

  /* =====================================================
      LIKE HANDLER
  ====================================================== */

  const toggleLikeHandler = async () => {
    if (!article) return;

    const metricsRef = doc(db, "news_metrics", article.id);

    const checkingNewState = !isLiked;

    setIsLiked(checkingNewState);

    setLikes((prev) =>
      checkingNewState ? prev + 1 : Math.max(0, prev - 1)
    );

    try {
      await updateDoc(metricsRef, {
        likes: increment(checkingNewState ? 1 : -1),
      });

      localStorage.setItem(
        `liked_${article.id}`,
        checkingNewState ? "true" : "false"
      );
    } catch (err) {
      console.error("Like update failed:", err);

      setIsLiked(!checkingNewState);

      setLikes((prev) =>
        checkingNewState ? Math.max(0, prev - 1) : prev + 1
      );
    }
  };

  /* =====================================================
      LOADING SCREEN
  ====================================================== */

  if (loadingArticle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  /* =====================================================
      ARTICLE NOT FOUND
  ====================================================== */

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-4">
          Article Not Found
        </h1>

        <p className="text-gray-600 mb-8">
          The news story you are looking for does not exist.
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

  const articleUrl = `https://pihsopa.vercel.app/news/${article.id}`;

  const whatsappMessage = encodeURIComponent(
    `${article.title}\n\n${article.excerpt}\n\nRead more: ${articleUrl}`
  );

  const whatsappShareLink = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* BACK BUTTON */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold mb-8 transition-colors group text-sm uppercase tracking-wider"
        >
          <FaArrowLeft className="transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* ARTICLE */}
        <article className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

          {/* IMAGE / VIDEO */}
          <div className="relative h-64 sm:h-[450px] w-full bg-black">

            {article.type === "video" || article.video ? (
              <video
                src={article.video}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={article.image || "/images/pihs-meeting1.jpeg"}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>

          {/* CONTENT */}
          <div className="p-6 sm:p-12">

            {/* META */}
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

              <div className="flex items-center gap-4 text-slate-500 text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl">

                <span className="flex items-center gap-1.5">
                  <FaEye className="text-slate-400 text-base" />
                  {metricLoading ? "..." : views}
                </span>

                <span className="text-slate-200">|</span>

                <span className="flex items-center gap-1.5">
                  <FaHeart className="text-rose-500 text-sm" />
                  {metricLoading ? "..." : likes}
                </span>
              </div>
            </div>

            {/* TITLE */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight mb-6">
              {article.title}
            </h1>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3 mb-10 border-b border-slate-100 pb-8">

              {/* LIKE */}
              <button
                onClick={toggleLikeHandler}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all shadow-md active:scale-95 ${
                  isLiked
                    ? "bg-rose-50 text-rose-600 border-2 border-rose-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-transparent"
                }`}
              >
                {isLiked ? (
                  <FaHeart className="text-rose-600 text-base" />
                ) : (
                  <FaRegHeart className="text-base" />
                )}

                {isLiked ? "Liked!" : "Like Update"}
              </button>

              {/* WHATSAPP */}
              <a
                href={whatsappShareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-black text-sm transition-all shadow-md"
              >
                <FaWhatsapp className="text-base" />
                Share on WhatsApp
              </a>

              {/* EDIT */}
              <Link
                href={`/dashboard/news/edit/${article.id}`}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-black text-sm transition-all shadow-md"
              >
                <FaEdit />
                Edit News
              </Link>

              {/* DELETE */}
              <Link
                href="/dashboard/news/manage"
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-black text-sm transition-all shadow-md"
              >
                <FaTrash />
                Manage News
              </Link>
            </div>

            {/* ARTICLE CONTENT */}
            <div className="text-gray-700 text-base sm:text-lg leading-relaxed space-y-6 whitespace-pre-line font-medium">
              {article.content}
            </div>
          </div>
        </article>

        {/* COMMENTS SECTION */}
        <section className="mt-10 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">

          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-black text-slate-800">
              Alumni Comments
            </h2>

            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
              {comments.length} Comments
            </span>
          </div>

          <div className="space-y-4">

            {comments.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  No comments from registered members yet.
                </p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div
                  key={index}
                  className="flex gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4"
                >
                  <img
                    src={comment.photoURL || "/avatar.png"}
                    alt={comment.author}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">

                      <div>
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">
                          {comment.author}
                        </h4>

                        <p className="text-[11px] text-slate-400 font-semibold">
                          Registered Alumni Member
                        </p>
                      </div>

                      <span className="text-[11px] text-slate-400 font-bold">
                        {comment.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* RELATED NEWS */}
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
                  className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold text-xs uppercase tracking-wider"
                >
                  Read Story
                  <FaArrowRight className="text-[9px]" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}