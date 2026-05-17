"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic links updated to match standard alumni routing ecosystems
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Activities", href: "/activities" },
    { name: "Gallery", href: "/gallery" },
    { name: "Donate", href: "/donate" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* =====================================================
              LOGO & BRANDING SECTION
          ====================================================== */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sky-500 shadow-sm transition group-hover:scale-105">
              <Image 
                src="/images/schoollogo.jpeg" // Pointing straight to your dedicated PIHS logo file
                alt="PIHS Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="hidden sm:block text-xl font-black text-slate-800 leading-none tracking-tight">
              PIHS OPA <br />
              <span className="text-sky-600 text-[10px] font-black uppercase tracking-widest block mt-1">
                Providence International High School
              </span>
            </span>
          </Link>

          {/* =====================================================
              DESKTOP NAVIGATION MENU
          ====================================================== */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex space-x-8 font-semibold text-slate-600">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="hover:text-sky-600 transition-colors duration-200 relative py-2 group text-sm uppercase tracking-wider font-bold"
                >
                  {link.name}
                  {/* Premium underline hover effect */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>
            
            {/* Restored Portal Gateway Launcher */}
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-sky-600 transition-all shadow-md hover:shadow-sky-500/10 active:scale-95"
            >
              <FaSignInAlt className="text-xs text-sky-400" />
              Portal Login
            </Link>
          </div>

          {/* Mobile Hamburg Trigger Toggle */}
          <button
            className="lg:hidden text-xl text-slate-700 p-2 hover:bg-slate-50 rounded-xl transition-all focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE SIDEBAR MODAL MENU
          ====================================================== */}
      <div 
        className={`lg:hidden fixed inset-y-0 right-0 w-72 bg-white shadow-2xl transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-6 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-8">
              <span className="font-black text-slate-800 tracking-tight">Navigation</span>
              <button 
                className="text-xl text-slate-500 p-2 hover:bg-slate-50 rounded-xl transition"
                onClick={() => setIsOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="flex flex-col space-y-4 font-bold text-slate-700">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base uppercase tracking-wider font-black hover:text-sky-600 border-b pb-3 border-slate-50 text-slate-800 block"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Action trigger locked to bottom of mobile layout drawer */}
          <div className="pt-6 border-t border-slate-100">
            <Link
              href="/login"
              className="bg-sky-500 hover:bg-sky-600 text-white text-center font-bold tracking-wider uppercase py-4 rounded-xl block w-full transition shadow-lg shadow-sky-500/20"
              onClick={() => setIsOpen(false)}
            >
              Portal Login
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop Glass Mask for Mobile Layout Drawer */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}