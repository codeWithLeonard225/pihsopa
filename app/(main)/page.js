"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// 1. Firebase Imports for DB Syncing
import { db } from "@/app/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Central backup dataset file
import { newsData as fallbackNewsData } from "@/app/data/newsData"; 

import {
  FaGraduationCap,
  FaHandsHelping,
  FaUsers,
  FaSchool,
  FaAward,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserAlt,
  FaClock,
  FaNewspaper,
  FaPlayCircle,
} from "react-icons/fa";

import { motion } from "framer-motion";

const ORGANIZATION_NAME = "PIHS Old Pupils Association";

const aimsAndObjectivesHome = [
  {
    icon: FaUsers,
    title: "Alumni Network",
    description: "Reconnecting former students of Providence International High School to build a strong network of friendship, career growth, and support.",
  },
  {
    icon: FaSchool,
    title: "School Development",
    description: "Supporting educational and infrastructural development projects for Providence International High School.",
  },
  {
    icon: FaHandsHelping,
    title: "Mentorship",
    description: "Guiding and inspiring current students through mentorship, coaching, and leadership development.",
  },
  {
    icon: FaAward,
    title: "Excellence & Legacy",
    description: "Promoting discipline, excellence, leadership, and preserving the legacy of Providence International High School.",
  },
];

const activities = [
  {
    title: "3rd General Meeting",
    date: "Sunday, 31st May 2026",
    time: "3:30 PM",
    location: "School Compound",
    host: "Mr. Bangura (Proprietor)",
    icon: FaUsers,
  },
  {
    title: "Scripture Union Visitation",
    date: "Monday, 18th May 2026",
    time: "3:00 PM",
    location: "School Compound",
    host: "Meeting with Rev. Koroma",
    icon: FaHandsHelping,
  },
];

export default function HomePage() {
  // Seed the state immediately with fallback data so the layout renders instantly
  const [newsFeed, setNewsFeed] = useState(fallbackNewsData);

  // Realtime sub loop hook fetching live updates from Firebase
  useEffect(() => {
    const newsRef = collection(db, "news");
    const newsQuery = query(newsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(newsQuery, 
      (snapshot) => {
        const liveItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Merge live DB data ahead of our static array backup elements safely
        if (liveItems.length > 0) {
          setNewsFeed([...liveItems, ...fallbackNewsData]);
        } else {
          setNewsFeed(fallbackNewsData);
        }
      },
      (error) => {
        console.error("Error loading updates from Firestore:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="overflow-hidden bg-white w-full">

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center py-20 sm:py-24 px-4 sm:px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 animate-wave"
          style={{ backgroundImage: "url('/images/school-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-sky-950/80" />

        <div className="hidden sm:block absolute top-10 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-float" />
        <div className="hidden sm:block absolute bottom-10 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="relative z-10 w-full max-w-4xl mx-auto"
        >
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-[24px] sm:rounded-[40px] shadow-2xl p-6 sm:p-10 md:p-16 text-center">
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex justify-center mb-6 sm:mb-8"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-sky-300 shadow-2xl">
                <Image
                  src="/images/schoollogo.jpeg"
                  alt="School Logo"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </motion.div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
              Welcome to <br />
              <span className="bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent block mt-2">
                {ORGANIZATION_NAME}
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-sky-100 max-w-2xl mx-auto leading-relaxed">
              A united platform for former students of Providence International High School to reconnect, inspire, support current students, and strengthen the alumni community.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5">
              <Link
                href="/about"
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition duration-300 text-center shadow-xl hover:scale-105"
              >
                Learn More
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white text-sky-700 hover:bg-sky-100 px-8 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg transition duration-300 text-center shadow-xl hover:scale-105"
              >
                Join Alumni
              </Link>
            </div>

          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-full h-[50px] sm:h-[90px] md:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L80,122.7C160,149,320,203,480,208C640,213,800,171,960,144C1120,117,1280,107,1360,101.3L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
          </svg>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            { number: "100+", label: "Registered Alumni" },
            { number: "700+", label: "Graduating Batches" },
            { number: "4+", label: "Community Projects" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-md text-center border border-sky-100"
            >
              <h2 className="text-4xl sm:text-5xl font-black text-sky-700">{item.number}</h2>
              <p className="mt-2 text-gray-600 text-base sm:text-lg">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-sky-50">
        <div className="max-w-3xl mx-auto text-center">
          <FaGraduationCap className="text-5xl sm:text-7xl text-sky-500 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black text-sky-800 mb-6 sm:mb-8">Our Mission</h2>
          <blockquote className="text-lg sm:text-xl md:text-2xl italic text-gray-700 leading-relaxed">
            “To unite former students of Providence International High School, promote networking, mentorship, and lifelong relationships among alumni, while supporting educational excellence, leadership development, and positive community impact.”
          </blockquote>
        </div>
      </section>

      {/* WHY WE ARE HERE SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center text-sky-800 mb-12">
            Why We Are Here
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {aimsAndObjectivesHome.map((aim, index) => (
              <div key={index} className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-md border border-sky-100 transition duration-300 hover:shadow-xl">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-sky-100 flex items-center justify-center mb-6">
                  <aim.icon className="text-2xl sm:text-3xl text-sky-700" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-sky-800 mb-3">{aim.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{aim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING ACTIVITIES SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-sky-50">
        <div className="max-w-7xl mx-auto">
          
          <h2 className="text-3xl sm:text-4xl font-black text-center text-sky-800 mb-4">
            Upcoming Activities
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-md mx-auto text-sm sm:text-base">
            Stay updated and participate in our upcoming community meetings and functions.
          </p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4 sm:gap-6 text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
                🎉
              </div>
              <div>
                <span className="bg-white/20 text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full">
                  Big Milestone
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mt-2">PIHS 20th Anniversary Celebration!</h3>
                <p className="text-sm sm:text-base mt-1 text-orange-100">
                  Get ready! We will be proudly celebrating our school's 20 years of academic excellence next year in **February 2027**. 
                </p>
              </div>
            </div>
            <Link 
              href="/" 
              className="w-full md:w-auto bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-3 rounded-xl transition text-center whitespace-nowrap shadow-md"
            >
              Anniversary Details
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {activities.map((event, index) => (
              <div key={index} className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-6 sm:p-8 border border-sky-100 transition duration-300 hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-4 text-xl">
                    <event.icon />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-sky-800 mb-4">{event.title}</h3>
                  
                  <div className="space-y-3 text-gray-600 text-sm sm:text-base">
                    <p className="flex items-center gap-3">
                      <FaCalendarAlt className="text-sky-500 flex-shrink-0" />
                      <span>{event.date}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <FaClock className="text-sky-500 flex-shrink-0" />
                      <span>{event.time}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-sky-500 flex-shrink-0" />
                      <span>{event.location}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-sm sm:text-base text-gray-700">
                  <FaUserAlt className="text-slate-400 text-xs" />
                  <span><strong>Host:</strong> {event.host}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* LATEST NEWS & UPDATES SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="text-left">
              <h2 className="text-3xl sm:text-4xl font-black text-sky-800 flex items-center gap-3">
                <FaNewspaper className="text-sky-500 text-2xl sm:text-3xl" />
                Latest News & Updates
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-md">
                Follow recent happenings, celebrations, and foundational developments across our global alumni community.
              </p>
            </div>
            <Link 
              href="/news" 
              className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-2 group transition text-sm sm:text-base whitespace-nowrap self-start sm:self-auto"
            >
              View All News 
              <FaArrowRight className="text-xs transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {newsFeed.map((item, index) => (
              <motion.article 
                key={item.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300"
              >
                {/* News Media Container */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <span className="absolute top-4 left-4 z-10 bg-sky-600/90 backdrop-blur-sm text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-md">
                    {item.category}
                  </span>
                  
                  {/* FIXED SCHEMA MATCHER & VIDEO ELEMENT HOOK */}
                  {item.type === "video" && item.video ? (
                    <div className="relative w-full h-full bg-black flex items-center justify-center">
                      <video 
                        src={item.video} 
                        className="w-full h-full object-cover opacity-90"
                        controls
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    <Image 
                      src={item.image || "/images/pihs-meeting1.jpeg"} 
                      alt={item.title || "News media image"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                      unoptimized={item.image?.disabled || item.image?.startsWith("http")}
                    />
                  )}
                </div>

                {/* News Content Body */}
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 block">
                    {item.date}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                    {item.excerpt}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <Link 
                      href={`/news/${item.id}`}
                      className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold text-sm uppercase tracking-wider group/link"
                    >
                      Read Full Story
                      <FaArrowRight className="text-[10px] transform group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 overflow-hidden text-white text-center bg-gradient-to-r from-sky-700 to-cyan-600">
        <div className="relative max-w-3xl mx-auto z-10">
          <FaGraduationCap className="text-6xl sm:text-7xl mx-auto mb-6" />
          <h2 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 leading-tight">
            Once a Providence Student, <br /> Always a Providence Ambassador
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-sky-100 leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
            Join hands with fellow alumni to empower students, organize impactful programs, and support the future of Providence International High School.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5">
            <Link
              href="/activities"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-sky-700 hover:bg-sky-100 px-8 py-4 rounded-full font-bold text-base sm:text-lg transition duration-300 shadow-xl"
            >
              View Activities <FaArrowRight />
            </Link>
            <Link
              href="/donate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg transition duration-300 shadow-xl"
            >
              Support The School
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}