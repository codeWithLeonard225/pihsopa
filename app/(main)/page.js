"use client";

import Link from "next/link";
import Image from "next/image";

import {
  FaGraduationCap,
  FaHandsHelping,
  FaUsers,
  FaSchool,
  FaAward,
  FaArrowRight,
  FaCalendarAlt,
  FaDonate,
} from "react-icons/fa";

import { motion } from "framer-motion";

/* =====================================================
   ORGANIZATION DETAILS
===================================================== */

const ORGANIZATION_NAME = "PIHS Old Pupils Association";

const aimsAndObjectivesHome = [
  {
    icon: FaUsers,
    title: "Alumni Network",
    description:
      "Reconnecting former students of Providence International High School to build a strong network of friendship, career growth, and support.",
  },

  {
    icon: FaSchool,
    title: "School Development",
    description:
      "Supporting educational and infrastructural development projects for Providence International High School.",
  },

  {
    icon: FaHandsHelping,
    title: "Mentorship",
    description:
      "Guiding and inspiring current students through mentorship, coaching, and leadership development.",
  },

  {
    icon: FaAward,
    title: "Excellence & Legacy",
    description:
      "Promoting discipline, excellence, leadership, and preserving the legacy of Providence International High School.",
  },
];

const activities = [
  {
    title: "Annual Alumni Reunion",
    date: "August 2026",
    icon: FaCalendarAlt,
  },

  {
    title: "Student Mentorship Program",
    date: "September 2026",
    icon: FaHandsHelping,
  },

  {
    title: "School Development Fundraising",
    date: "October 2026",
    icon: FaDonate,
  },
];

/* =====================================================
   HOME PAGE
===================================================== */

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 animate-wave"
          style={{
            backgroundImage: "url('/images/school-bg.jpg')",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-sky-950/80" />

        {/* Animated Floating Backgrounds */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-float" />

        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-float" />

        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-slow-spin" />

        {/* Floating Small Circles */}
        <div className="absolute top-40 right-20 w-20 h-20 bg-sky-300/20 rounded-full animate-bounce blur-xl" />

        <div className="absolute bottom-40 left-20 w-16 h-16 bg-cyan-200/20 rounded-full animate-pulse blur-xl" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="relative z-10 max-w-6xl mx-auto px-6"
        >

          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-[40px] shadow-2xl p-10 md:p-16 text-center animate-glow">

            {/* Logo */}
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="flex justify-center mb-8"
            >

              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-sky-300 shadow-2xl">

                <Image
                  src="/images/schoollogo.jpeg"
                  alt="School Logo"
                  fill
                  priority
                  className="object-cover"
                />

              </div>

            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 1,
              }}
              className="text-5xl md:text-7xl font-black text-white leading-tight"
            >
              Welcome to <br />

              <span className="bg-gradient-to-r from-sky-300 to-cyan-200 bg-clip-text text-transparent animate-bg">
                {ORGANIZATION_NAME}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.5,
                duration: 1,
              }}
              className="mt-8 text-lg md:text-2xl text-sky-100 max-w-4xl mx-auto leading-relaxed"
            >
              A united platform for former students of Providence
              International High School to reconnect, inspire,
              support current students, and strengthen the alumni community.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1,
                duration: 1,
              }}
              className="mt-12 flex flex-wrap justify-center gap-5"
            >

              <Link
                href="/about"
                className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-full font-bold text-lg transition duration-300 shadow-xl hover:scale-110 hover:shadow-sky-500/50"
              >
                Learn More
              </Link>

              <Link
                href="/login"
                className="bg-white text-sky-700 hover:bg-sky-100 px-8 py-4 rounded-full font-bold text-lg transition duration-300 shadow-xl hover:scale-110"
              >
                Join Alumni
              </Link>

            </motion.div>

          </div>

        </motion.div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-[120px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L80,122.7C160,149,320,203,480,208C640,213,800,171,960,144C1120,117,1280,107,1360,101.3L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            />
          </svg>
        </div>

      </section>

      {/* =====================================================
          STATS SECTION
      ====================================================== */}

      <section className="py-24 px-6 bg-white">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {[
            {
              number: "5,000+",
              label: "Registered Alumni",
            },

            {
              number: "20+",
              label: "Graduating Batches",
            },

            {
              number: "15+",
              label: "Community Projects",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{
                y: -15,
                scale: 1.05,
                rotate: 1,
              }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-3xl p-10 shadow-lg text-center border border-sky-100 hover:shadow-2xl"
            >

              <h2 className="text-5xl font-black text-sky-700">
                {item.number}
              </h2>

              <p className="mt-4 text-gray-600 text-lg">
                {item.label}
              </p>

            </motion.div>
          ))}

        </div>

      </section>

      {/* =====================================================
          MISSION SECTION
      ====================================================== */}

      <section className="py-24 px-6 bg-sky-50">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-5xl mx-auto text-center"
        >

          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >

            <FaGraduationCap className="text-7xl text-sky-500 mx-auto mb-8" />

          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black text-sky-800 mb-10">
            Our Mission
          </h2>

          <blockquote className="text-xl md:text-2xl italic text-gray-700 leading-relaxed">
            “To unite former students of Providence International
            High School, promote networking, mentorship, and lifelong
            relationships among alumni, while supporting educational
            excellence, leadership development, and positive community impact.”
          </blockquote>

        </motion.div>

      </section>

      {/* =====================================================
          WHY WE ARE HERE
      ====================================================== */}

      <section className="py-24 px-6 bg-white">

        <div className="max-w-7xl mx-auto">

          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-black text-center text-sky-800 mb-16"
          >
            Why We Are Here
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {aimsAndObjectivesHome.map((aim, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -15,
                  scale: 1.05,
                  rotate: 1,
                }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition duration-500 border border-sky-100"
              >

                <motion.div
                  whileHover={{
                    rotate: 10,
                    scale: 1.1,
                  }}
                  className="w-20 h-20 rounded-2xl bg-sky-100 flex items-center justify-center mb-6"
                >

                  <aim.icon className="text-4xl text-sky-700" />

                </motion.div>

                <h3 className="text-2xl font-bold text-sky-800 mb-4">
                  {aim.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {aim.description}
                </p>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          UPCOMING ACTIVITIES
      ====================================================== */}

      <section className="py-24 px-6 bg-sky-50">

        <div className="max-w-7xl mx-auto">

          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-5xl font-black text-center text-sky-800 mb-16"
          >
            Upcoming Activities
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {activities.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-lg p-8 border border-sky-100 hover:shadow-2xl"
              >

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >

                  <event.icon className="text-5xl text-sky-500 mb-6" />

                </motion.div>

                <h3 className="text-2xl font-bold text-sky-800 mb-3">
                  {event.title}
                </h3>

                <p className="text-gray-600 text-lg">
                  {event.date}
                </p>

              </motion.div>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA SECTION
      ====================================================== */}

      <section className="relative py-32 px-6 overflow-hidden">

        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-700 to-cyan-600 animate-bg" />

        {/* Floating Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 blur-3xl rounded-full animate-float" />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-300/10 blur-3xl rounded-full animate-float" />

        {/* Content */}
        <div className="relative max-w-5xl mx-auto text-center text-white">

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >

            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
            >

              <FaGraduationCap className="text-7xl mx-auto text-white mb-8" />

            </motion.div>

            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Once a Providence Student,
              <br />
              Always a Providence Ambassador
            </h2>

            <p className="text-xl text-sky-100 leading-relaxed mb-10 max-w-3xl mx-auto">
              Join hands with fellow alumni to empower students,
              organize impactful programs, and support the future
              of Providence International High School.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-5">

              <Link
                href="/activities"
                className="inline-flex items-center gap-3 bg-white text-sky-700 hover:bg-sky-100 px-10 py-5 rounded-full font-bold text-lg transition duration-300 shadow-2xl hover:scale-110"
              >
                View Activities
                <FaArrowRight />
              </Link>

              <Link
                href="/donate"
                className="inline-flex items-center gap-3 bg-sky-500 hover:bg-sky-600 text-white px-10 py-5 rounded-full font-bold text-lg transition duration-300 shadow-2xl hover:scale-110"
              >
                Support The School
              </Link>

            </div>

          </motion.div>

        </div>

      </section>

    </main>
  );
}