"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { newsData } from "@/app/data/newsData";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaTag,
  FaArrowRight,
  FaWhatsapp,
} from "react-icons/fa";

import { motion } from "framer-motion";

export default function NewsArticlePage() {
  const params = useParams();
  const currentId = params.id;

  // Find selected article
  const article = newsData.find((item) => item.id === currentId);

  // Related News
  const relatedNews = newsData
    .filter((item) => item.id !== currentId)
    .slice(0, 2);

  // Fallback if article does not exist
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
    `${article.title}

${article.excerpt}

Read more: ${articleUrl}`
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

        {/* Main Article */}
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

          {/* Content */}
          <div className="p-6 sm:p-12">

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              
              <span className="flex items-center gap-2 bg-sky-50 text-sky-700 font-bold px-3 py-1 rounded-md text-xs uppercase tracking-wider">
                <FaTag className="text-xs" />
                {article.category}
              </span>

              <span className="flex items-center gap-2 text-slate-400">
                <FaCalendarAlt />
                {article.date}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight mb-6">
              {article.title}
            </h1>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              
              <a
                href={whatsappShareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full font-bold text-sm transition-all shadow-lg hover:scale-105"
              >
                <FaWhatsapp className="text-lg" />
                Share on WhatsApp
              </a>

            </div>

            {/* Article Body */}
            <div className="text-gray-700 text-base sm:text-lg leading-relaxed space-y-6 whitespace-pre-line">
              {article.content}
            </div>
          </div>
        </article>

        {/* =====================================================
            RELATED NEWS
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