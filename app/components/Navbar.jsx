"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/" },
    { name: "Activities", href: "/" },
    { name: "Gallery", href: "/" },
    { name: "Donate", href: "/" },
  ];

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* ================= LOGO ================= */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 min-w-0"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-sky-500 shrink-0">
                <Image
                  src="/images/schoollogo.jpeg"
                  alt="PIHS Logo"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* TEXT */}
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg md:text-xl font-black text-slate-800 truncate leading-tight">
                  PIHSOPA
                </h1>

                <p className="hidden sm:block text-[9px] md:text-[10px] uppercase tracking-wider font-bold text-sky-600 truncate">
                  Providence International High School
                </p>
              </div>
            </Link>

            {/* ================= DESKTOP MENU ================= */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              
              <div className="flex items-center gap-4 lg:gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative text-xs lg:text-sm uppercase font-bold tracking-wider text-slate-700 hover:text-sky-600 transition"
                  >
                    {link.name}

                    <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-sky-500 transition-all duration-300 hover:w-full" />
                  </Link>
                ))}
              </div>

              {/* LOGIN BUTTON */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-xs lg:text-sm font-bold uppercase tracking-wider transition"
              >
                <FaSignInAlt className="text-[10px]" />
                Portal
              </Link>
            </div>

            {/* ================= MOBILE BUTTON ================= */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-slate-700 text-xl p-2 rounded-lg hover:bg-slate-100 transition"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>

          </div>
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white z-50 shadow-2xl transform transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b pb-5">
            {/* <h2 className="font-black text-slate-800">
              Navigation
            </h2> */}

            <button
              onClick={() => setIsOpen(false)}
              className="text-xl text-slate-600"
            >
              <FaTimes />
            </button>
          </div>

          {/* LINKS */}
          <div className="flex flex-col mt-8 space-y-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm uppercase tracking-wider font-black text-slate-700 hover:text-sky-600 transition"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* BUTTON */}
          <div className="mt-auto pt-8">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-xl font-black uppercase tracking-wider transition"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </div>

      {/* ================= OVERLAY ================= */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}