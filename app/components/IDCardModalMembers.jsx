"use client";

import { useRouter } from "next/navigation";
import {
  MdPhone,
  MdLocationOn,
  MdSchool,
  MdWork,
  MdAccountBalance
} from "react-icons/md";

export default function IDCardModal({ client, onClose }) {
  const router = useRouter();

  if (!client) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const hasTertiaryInfo = 
    client.tertiaryCollege && 
    client.tertiaryCollege !== "N/A" && 
    client.tertiaryCollege.trim() !== "";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      
      {/* PERFECTLY BALANCED MOBILE MAX-WIDTH */}
      <div className="relative w-full max-w-[360px] my-auto">

        {/* CARD CONTAINER */}
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100">

          {/* CLOSE BUTTON */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-50 w-7 h-7 rounded-full bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-md text-xs"
          >
            ✕
          </button>

          {/* HEADER BACKGROUND */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 px-4 pt-5 pb-12 text-white">
            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* SCHOOL LOGO */}
              <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg overflow-hidden">
                <img
                  src="/images/schoollogo.jpeg"
                  alt="School Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* SCHOOL NAME */}
              <h1 className="mt-2 text-sm font-black uppercase tracking-wide leading-tight">
                Providence International High School
              </h1>
              <p className="text-sky-100 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                Old Pupils Association
              </p>
            </div>
          </div>

          {/* MAIN PROFILE CARD BODY */}
          <div className="relative px-4 pb-4">

            {/* PROFILE AVATAR */}
            <div className="-mt-9 flex justify-center">
              <img
                src={client.photoURL || "/images/default-avatar.png"}
                alt="Member Photo"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl bg-white"
              />
            </div>

            {/* IDENTITY METADATA */}
            <div className="text-center mt-2 mb-3">
              <h2 className="text-base font-black text-slate-800 uppercase tracking-tight truncate px-1">
                {client.fullname}
              </h2>
              <p className="text-xs text-sky-600 font-extrabold tracking-wide mt-0.5">
                Admission No: {client.clientId}
              </p>
            </div>

            {/* GRID OF DETAILS */}
            <div className="grid grid-cols-2 gap-2 text-xs">

              {/* PHONE BLOCK */}
              <div className="col-span-1 bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-2 min-w-0">
                <MdPhone className="text-sky-600 text-sm shrink-0" />
                <div className="min-w-0">
                  <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider leading-none mb-0.5">Contact</p>
                  <p className="font-bold text-slate-700 truncate text-xs">{client.tel}</p>
                </div>
              </div>

              {/* ADDRESS BLOCK */}
              <div className="col-span-1 bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-2 min-w-0">
                <MdLocationOn className="text-sky-600 text-sm shrink-0" />
                <div className="min-w-0">
                  <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider leading-none mb-0.5">Location</p>
                  <p className="font-bold text-slate-700 truncate text-xs">{client.address}</p>
                </div>
              </div>

              {/* HIGH SCHOOL HISTORY */}
              <div className="col-span-2 bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-2.5 min-w-0">
                <MdSchool className="text-sky-600 text-base shrink-0" />
                <div className="min-w-0 w-full">
                  <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider leading-none mb-1">PIHS Academic Timeline</p>
                  <p className="font-bold text-slate-700 text-xs">
                    Years: {client.yearAdmission || "????"} – {client.yearGraduation || "????"}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-0.5">
                    Forms: <span className="text-slate-700 font-semibold">{client.formAdmitted || "N/A"}</span> to <span className="text-slate-700 font-semibold">{client.formAttained || "N/A"}</span>
                  </p>
                </div>
              </div>

              {/* CLEAN HIGHER EDUCATION SECTION */}
              {hasTertiaryInfo && (
                <div className="col-span-2 bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-2.5 min-w-0">
                  <MdAccountBalance className="text-sky-600 text-base shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider leading-none mb-1">Higher Education</p>
                    <p className="font-bold text-slate-700 truncate text-xs">{client.tertiaryCollege}</p>
                    {client.tertiaryProgram && client.tertiaryProgram !== "N/A" && (
                      <p className="text-slate-500 text-[10px] mt-0.5 truncate">
                        Program: <span className="text-slate-600 font-medium">{client.tertiaryProgram}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

           
             {/* CURRENT PROFESSION DETAILS */}
<div className="col-span-2 bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-2.5 min-w-0">

  <MdWork className="text-sky-600 text-base shrink-0" />

  <div className="min-w-0 w-full">

    <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider leading-none mb-1">
      Current Status
    </p>

    {/* STATUS */}
    <p className="font-bold text-slate-700 text-xs">
      {client.professionalStatus || "N/A"}
    </p>

    {/* SHOW PLACE OF WORK ONLY FOR NON-STUDENTS */}
    {client.professionalStatus !== "Student" &&
      client.placeOfWork &&
      client.placeOfWork !== "N/A" && (
        <p className="text-slate-500 text-[10px] mt-0.5 truncate">
          Organization:{" "}
          <span className="text-slate-600 font-medium">
            {client.placeOfWork}
          </span>
        </p>
    )}

    {/* OPTIONAL: FOR STUDENTS (ONLY SCHOOL NAME, NOT "ORGANIZATION") */}
    {client.professionalStatus === "Student" &&
      client.placeOfWork &&
      client.placeOfWork !== "N/A" && (
        <p className="text-slate-500 text-[10px] mt-0.5 truncate">
          {/* School:{" "} */}
          {/* <span className="text-slate-600 font-medium">
            {client.placeOfWork}
          </span> */}
        </p>
    )}

  </div>
</div>

            </div>

          </div>

          {/* BASE FOOTER */}
          <div className="bg-gradient-to-r from-sky-700 to-cyan-600 py-2.5 text-center">
            <p className="text-white text-[9px] font-black tracking-widest uppercase">
              Official Alumnus Credential
            </p>
          </div>

        </div>

        {/* METADATA ACCENT NOTE */}
        <p className="text-center text-slate-400 text-[10px] mt-3">
          Take a quick screenshot to save your badge instantly.
        </p>

      </div>
    </div>
  );
}