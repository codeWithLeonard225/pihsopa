"use client";

import { useRouter } from "next/navigation";
import {
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdWork,
  MdCake
} from "react-icons/md";

export default function IDCardModal({ client, onClose }) {
  const router = useRouter();

  if (!client) return null;

  const closeModal = () => {
    router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
      
      {/* COMPACT CARD CONTAINER */}
      <div className="relative w-full max-w-xs sm:max-w-sm my-auto">

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-sky-400 blur-2xl opacity-10 rounded-[32px] animate-pulse" />

        {/* CARD GRAPHIC */}
        <div className="relative bg-white rounded-[24px] overflow-hidden shadow-2xl border border-slate-100">

          {/* CLOSE BUTTON */}
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 z-50 w-7 h-7 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 transition-all duration-300 flex items-center justify-center shadow-md text-xs"
          >
            ✕
          </button>

          {/* TOP HEADER */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 px-4 pt-6 pb-14 text-white">

            {/* Subtle Design Elements */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse" />

            <div className="relative z-10 flex flex-col items-center text-center">

              {/* LOGO */}
              <div className="w-16 h-16 rounded-full bg-white p-1.5 shadow-xl border-2 border-white/50 overflow-hidden">
                <img
                  src="/images/schoollogo.jpeg"
                  alt="School Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* SCHOOL NAME */}
              <h1 className="mt-2.5 text-sm font-black uppercase tracking-wide leading-tight">
                Providence International
                <br />
                High School
              </h1>

              <p className="text-sky-100 text-[9px] font-bold mt-1 uppercase tracking-[0.2em]">
                Old Pupils Association
              </p>

              {/* COMPACT BADGE */}
              <div className="mt-2 inline-flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                💡 Alumni Member
              </div>
            </div>
          </div>

          {/* PROFILE SECTION */}
          <div className="relative px-4 pb-5">

            {/* PROFILE IMAGE */}
            <div className="-mt-10 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-sky-300 border-dashed animate-spin-slow" />
                <img
                  src={client.photoURL || "/images/default-avatar.png"}
                  alt="Member Photo"
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                />
              </div>
            </div>

            {/* IDENTITY DETAILS */}
            <div className="text-center mt-3">
              <h2 className="text-lg font-black text-slate-800 uppercase leading-tight tracking-tight truncate px-2">
                {client.fullname}
              </h2>

              <p className="mt-0.5 text-sky-600 font-extrabold text-xs tracking-wider">
                Admission No: {client.clientId}
              </p>
            </div>

            {/* RECORDS BLOCK LIST */}
            <div className="mt-4 space-y-2 text-xs">

              {/* CONTACT & DOB INFO ROW */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2 border border-slate-100/70 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 text-sm shrink-0">
                    <MdPhone />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider leading-none mb-0.5">Contact</p>
                    <p className="font-bold text-slate-700 text-[11px] truncate">{client.tel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2 border border-slate-100/70 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 text-sm shrink-0">
                    <MdCake />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider leading-none mb-0.5">Birth Date</p>
                    <p className="font-bold text-slate-700 text-[11px] truncate">{client.dob || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100/70">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 text-base shrink-0">
                  <MdLocationOn />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none mb-0.5">
                    Current Address
                  </p>
                  <p className="font-bold text-slate-700 text-xs truncate">
                    {client.address}
                  </p>
                </div>
              </div>

              {/* ACADEMIC TIMELINE */}
              <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100/70">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 text-base shrink-0 mt-0.5">
                  <MdSchool />
                </div>
                <div className="w-full min-w-0 text-xs">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">
                    Academic History
                  </p>
                  <p className="font-bold text-slate-700 leading-tight">
                    Timeline: {client.yearAdmission || "????"} – {client.yearGraduation || "????"}
                  </p>
                  <p className="text-slate-500 font-medium text-[10px] mt-0.5">
                    Admitted: <span className="text-slate-700 font-semibold">{client.formAdmitted || "N/A"}</span> • Attained: <span className="text-slate-700 font-semibold">{client.formAttained || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* PROFESSIONAL PROFILE SECTION */}
              <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100/70">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 text-base shrink-0 mt-0.5">
                  <MdWork />
                </div>
                <div className="w-full min-w-0 text-xs">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">
                    Professional Status
                  </p>
                  <p className="font-bold text-slate-700 capitalize leading-tight">
                    {client.professionalStatus || "Unspecified"}
                  </p>
                  {client.placeOfWork && client.placeOfWork !== "N/A" && (
                    <p className="text-slate-500 font-medium text-[10px] mt-0.5 truncate">
                      Loc: <span className="text-slate-600">{client.placeOfWork}</span>
                    </p>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* LOWER FOOTER SPLIT */}
          <div className="relative overflow-hidden bg-gradient-to-r from-sky-700 to-cyan-600 py-3 text-center">
            <div className="relative px-2">
              <p className="text-white text-[9px] font-black tracking-[0.2em] uppercase">
                Official Identification Card
              </p>
              <p className="text-sky-100/80 text-[8px] font-medium mt-0.5 truncate">
                PIHS Old Pupils Association
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER CAPTION */}
        <p className="text-center text-slate-400 text-[10px] mt-3 tracking-tight">
          Save, print, or take a screenshot of your digital credential token.
        </p>

      </div>

      <style jsx>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin-slow {
          animation: spinSlow 16s linear infinite;
        }
      `}</style>

    </div>
  );
}