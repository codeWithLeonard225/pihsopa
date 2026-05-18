"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { newsData } from "@/app/data/newsData";
import { FaArrowLeft, FaCalendarAlt, FaTag, FaArrowRight, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

export default function NewsArticlePage() {
  const params = useParams();
  const currentId = params.id;

  // Find the targeted article matching the ID parameter
  const article = newsData.find((item) => item.id === currentId);

  // Filter out the current article to display the other items as Relative News
  const relatedNews = newsData.filter((item) => item.id !== currentId).slice(0, 2);

  // Simple Fallback fallback if the URL ID doesn't exist in the data file
  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">The news story you are looking for does not exist or has been moved.</p>
        <Link href="/" className="bg-sky-600 text-white px-6 py-3 rounded-full font-bold hover:bg-sky-700 transition">
          Return Home
        </Link>
      </div>
    );
  }

  // Explicitly building the dynamic production URL using your Vercel deployment domain
  const shareUrl = `https://pihsopa.vercel.app/news/${article.id}`;
  
  // Constructing the dynamic pre-formatted WhatsApp share message string
  const whatsappMessage = `*${article.title}*\n\nRead the full update on the PIHSOPA Portal:\n${shareUrl}`;
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold mb-8 transition-colors group text-sm uppercase tracking-wider"
        >
          <FaArrowLeft className="transform group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>

        {/* Full Article Card Wrapper */}
        <article className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          
          {/* Main Visual Image Banner Container */}
          <div className="relative h-64 sm:h-[400px] w-full bg-slate-200">
            <Image 
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Body Elements Content Box */}
          <div className="p-6 sm:p-12">
            
            {/* Metadata Badges line */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-2 bg-sky-50 text-sky-700 font-bold px-3 py-1 rounded-md text-xs uppercase tracking-wider">
                <FaTag className="text-xs" /> {article.category}
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <FaCalendarAlt /> {article.date}
              </span>
            </div>

            {/* Core News Header Heading Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight mb-8">
              {article.title}
            </h1>

            {/* Core News Detailed Paragraph Body Text Area */}
            <div className="text-gray-700 text-base sm:text-lg leading-relaxed space-y-6 whitespace-pre-line mb-10">
              {article.content}
            </div>

            {/* WHATSAPP SHARE BLOCK BAR */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Share this update</h4>
                <p className="text-xs text-slate-400">Keep other old pupils informed in your batch groups.</p>
              </div>
              <a 
                href={whatsappShareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3 rounded-xl font-bold transition shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaWhatsapp className="text-xl" /> Share to WhatsApp
              </a>
            </div>

          </div>
        </article>

        {/* RELATED NEWS SIDEBAR SUGGESTIONS BAR SECTION */}
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-black text-slate-800 mb-8">Related News & Updates</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedNews.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <span className="text-slate-400 text-xs font-semibold block mb-2">{item.date}</span>
                  <h3 className="text-base font-black text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-4 leading-relaxed">
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
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}