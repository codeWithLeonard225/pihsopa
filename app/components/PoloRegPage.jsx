
"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import {
  MdCheckroom,
  MdPerson,
  MdSchool,
  MdPhone,
  MdColorLens,
  MdHistory,
  MdSearch,
  MdQrCode2,
  MdCalendarToday,
  MdVerified,
} from "react-icons/md";

const ORG_ID = "PIHSOPA";

export default function PoloRegPage() {
  // ============================================================
  // DATA
  // ============================================================

  const [polos, setPolos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ============================================================
  // FORM STATE
  // ============================================================

  const [fullname, setFullname] = useState("");
  const [classOf, setClassOf] = useState("");
  const [houseColor, setHouseColor] = useState("");
  const [size, setSize] = useState("");
  const [telephone, setTelephone] = useState("");

  const [issuedDate, setIssuedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ============================================================
  // SEARCH
  // ============================================================

  const [searchTerm, setSearchTerm] = useState("");

  // ============================================================
  // LOAD POLOS
  // ============================================================

  useEffect(() => {
    const fetchPolos = async () => {
      try {
        setFetching(true);

        const poloQuery = query(
          collection(db, "poloRegistrations"),
          where("orgId", "==", ORG_ID)
        );

        const poloSnap = await getDocs(poloQuery);

        const poloData = poloSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Newest records first
        poloData.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;

          return dateB - dateA;
        });

        setPolos(poloData);
      } catch (error) {
        console.error("Error loading polo registrations:", error);

        alert("Failed to load polo registrations.");
      } finally {
        setFetching(false);
      }
    };

    fetchPolos();
  }, []);

  // ============================================================
  // GENERATE POLO ID
  // ============================================================

  const generatePoloId = () => {
    const year = new Date().getFullYear();

    const nextNumber = polos.length + 1;

    return `PIHSOPA-${year}-${String(nextNumber).padStart(4, "0")}`;
  };

  // ============================================================
  // GENERATE RANDOM VERIFICATION TOKEN
  // ============================================================

  const generateVerificationToken = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let token = "";

    for (let i = 0; i < 24; i++) {
      token += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return token;
  };

  // ============================================================
  // REGISTER POLO
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------------------------------------
    // Validation
    // ---------------------------------------------

    if (!fullname.trim()) {
      alert("Please enter the recipient's full name.");
      return;
    }

    if (!classOf.trim()) {
      alert("Please enter the Class of.");
      return;
    }

    if (!houseColor) {
      alert("Please select a house color.");
      return;
    }

    if (!size) {
      alert("Please select a polo size.");
      return;
    }

    if (!telephone.trim()) {
      alert("Please enter the telephone number.");
      return;
    }

    setLoading(true);

    try {
      // ---------------------------------------------
      // Generate Polo Identity
      // ---------------------------------------------

      const poloId = generatePoloId();

      const verificationToken = generateVerificationToken();

      // ---------------------------------------------
      // Polo Data
      // ---------------------------------------------

      const poloData = {
        orgId: ORG_ID,

        // Unique Polo Identity
        poloId,
        verificationToken,

        // Recipient Information
        fullname: fullname.trim(),
        classOf: classOf.trim(),
        telephone: telephone.trim(),

        // Polo Information
        houseColor,
        size,

        // Status
        status: "ACTIVE",

        // Issue Information
        issuedDate,

        // Firebase timestamp
        createdAt: serverTimestamp(),
      };

      // ---------------------------------------------
      // Save to Firestore
      // ---------------------------------------------

      const docRef = await addDoc(
        collection(db, "poloRegistrations"),
        poloData
      );

      // ---------------------------------------------
      // Add immediately to UI
      // ---------------------------------------------

      const newPolo = {
        id: docRef.id,
        ...poloData,
        createdAt: {
          seconds: Math.floor(Date.now() / 1000),
        },
      };

      setPolos((prev) => [newPolo, ...prev]);

      // ---------------------------------------------
      // Success Message
      // ---------------------------------------------

      alert(
        `Polo ${poloId} has been successfully registered to ${fullname}.`
      );

      // ---------------------------------------------
      // Reset Form
      // ---------------------------------------------

      setFullname("");
      setClassOf("");
      setHouseColor("");
      setSize("");
      setTelephone("");
    } catch (error) {
      console.error("Polo registration error:", error);

      alert("Failed to register polo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FILTER POLOS
  // ============================================================

  const filteredPolos = polos.filter((polo) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      polo.poloId?.toLowerCase().includes(search) ||
      polo.fullname?.toLowerCase().includes(search) ||
      polo.classOf?.toLowerCase().includes(search) ||
      polo.telephone?.toLowerCase().includes(search) ||
      polo.houseColor?.toLowerCase().includes(search) ||
      polo.size?.toLowerCase().includes(search)
    );
  });

  // ============================================================
  // VERIFICATION URL
  // ============================================================

  const getVerificationUrl = (token) => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/verify-polo/${token}`;
  };

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalPolos = polos.length;

  const activePolos = polos.filter(
    (polo) => polo.status === "ACTIVE"
  ).length;

  const uniqueHolders = new Set(
    polos.map((polo) => polo.telephone).filter(Boolean)
  ).size;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex items-center gap-4">

        <div className="p-4 bg-indigo-100 text-indigo-700 rounded-2xl">
          <MdCheckroom size={32} />
        </div>

        <div>

          <h1 className="text-3xl font-black text-gray-800">
            PIHSOPA Polo Registration
          </h1>

          <p className="text-gray-500 mt-1">
            Register and track every polo issued to a recipient.
          </p>

        </div>

      </div>

      {/* ======================================================
          SECTION 1: REGISTER POLO
      ====================================================== */}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

        <div className="flex items-center gap-3 mb-7">

          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <MdVerified size={24} />
          </div>

          <div>

            <h2 className="text-xl font-black text-gray-800">
              Register New Polo
            </h2>

            <p className="text-sm text-gray-500">
              Enter the details of the person receiving the polo.
            </p>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >

          {/* ==================================================
              FULL NAME
          ================================================== */}

          <div>

            <label className="block text-sm font-bold text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <MdPerson />
                Full Name
              </span>
            </label>

            <input
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter full name"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

          </div>

          {/* ==================================================
              CLASS OF
          ================================================== */}

          <div>

            <label className="block text-sm font-bold text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <MdSchool />
                Class of
              </span>
            </label>

            <input
              type="text"
              value={classOf}
              onChange={(e) => setClassOf(e.target.value)}
              placeholder="e.g. 2012"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

          </div>

          {/* ==================================================
              HOUSE COLOR
          ================================================== */}

          <div>

            <label className="block text-sm font-bold text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <MdColorLens />
                House Color
              </span>
            </label>

            <select
              value={houseColor}
              onChange={(e) => setHouseColor(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >

              <option value="">
                Select house color
              </option>

              <option value="Red">
                Red
              </option>

              <option value="Blue">
                Blue
              </option>

              <option value="Green">
                Green
              </option>

              <option value="Yellow">
                Yellow
              </option>

              <option value="Orange">
                Orange
              </option>

              <option value="Purple">
                Purple
              </option>

              <option value="White">
                White
              </option>

              <option value="Black">
                Black
              </option>

            </select>

          </div>

          {/* ==================================================
              SIZE
          ================================================== */}

          <div>

            <label className="block text-sm font-bold text-gray-600 mb-2">
              Polo Size
            </label>

            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >

              <option value="">
                Select size
              </option>

              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>

            </select>

          </div>

          {/* ==================================================
              TELEPHONE
          ================================================== */}

          <div>

            <label className="block text-sm font-bold text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <MdPhone />
                Telephone
              </span>
            </label>

            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="e.g. 076123456"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

          </div>

          {/* ==================================================
              ISSUE DATE
          ================================================== */}

          <div>

            <label className="block text-sm font-bold text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <MdCalendarToday />
                Issue Date
              </span>
            </label>

            <input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

          </div>

          {/* ==================================================
              SUBMIT BUTTON
          ================================================== */}

          <div className="lg:col-span-3">

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
            >

              {loading
                ? "Registering Polo..."
                : "Register Polo"}

            </button>

          </div>

        </form>

      </div>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* TOTAL */}

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Total Polos
          </p>

          <p className="text-3xl font-black text-gray-800 mt-2">
            {totalPolos}
          </p>

        </div>

        {/* ACTIVE */}

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Active Polos
          </p>

          <p className="text-3xl font-black text-green-600 mt-2">
            {activePolos}
          </p>

        </div>

        {/* RECIPIENTS */}

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Recipients
          </p>

          <p className="text-3xl font-black text-indigo-600 mt-2">
            {uniqueHolders}
          </p>

        </div>

      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">

        <div className="relative">

          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={22}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, Polo ID, class, telephone or house color..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />

        </div>

      </div>

      {/* ======================================================
          POLO HISTORY
      ====================================================== */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="p-6 border-b border-gray-50 flex items-center gap-3">

          <MdHistory
            className="text-gray-400"
            size={22}
          />

          <div>

            <h3 className="font-bold text-gray-700">
              Polo Registration History
            </h3>

            <p className="text-xs text-gray-400">
              Every registered polo is assigned a unique identity.
            </p>

          </div>

        </div>

        {/* LOADING */}

        {fetching ? (

          <div className="p-12 text-center text-gray-500">
            Loading polo records...
          </div>

        ) : filteredPolos.length === 0 ? (

          /* EMPTY */

          <div className="p-12 text-center">

            <MdCheckroom
              size={48}
              className="mx-auto text-gray-300 mb-3"
            />

            <p className="font-semibold text-gray-500">
              No polo registrations found.
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Registered polos will appear here.
            </p>

          </div>

        ) : (

          /* TABLE */

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">

                <tr>

                  <th className="px-6 py-4">
                    Polo ID
                  </th>

                  <th className="px-6 py-4">
                    Recipient
                  </th>

                  <th className="px-6 py-4">
                    Class
                  </th>

                  <th className="px-6 py-4">
                    House
                  </th>

                  <th className="px-6 py-4">
                    Size
                  </th>

                  <th className="px-6 py-4">
                    Telephone
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    QR
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredPolos.map((polo) => (

                  <tr
                    key={polo.id}
                    className="hover:bg-gray-50/50 transition"
                  >

                    {/* POLO ID */}

                    <td className="px-6 py-4">

                      <span className="font-mono font-bold text-indigo-600 whitespace-nowrap">
                        {polo.poloId}
                      </span>

                    </td>

                    {/* NAME */}

                    <td className="px-6 py-4">

                      <span className="font-bold text-gray-800 whitespace-nowrap">
                        {polo.fullname}
                      </span>

                    </td>

                    {/* CLASS */}

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {polo.classOf}
                    </td>

                    {/* HOUSE COLOR */}

                    <td className="px-6 py-4">

                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold">
                        {polo.houseColor}
                      </span>

                    </td>

                    {/* SIZE */}

                    <td className="px-6 py-4">

                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold">
                        {polo.size}
                      </span>

                    </td>

                    {/* TELEPHONE */}

                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {polo.telephone}
                    </td>

                    {/* DATE */}

                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {polo.issuedDate}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">

                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">
                        {polo.status}
                      </span>

                    </td>

                    {/* QR */}

                    <td className="px-6 py-4 text-right">

                      <a
                        href={getVerificationUrl(
                          polo.verificationToken
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                        title="Open polo verification page"
                      >

                        <MdQrCode2 size={22} />

                      </a>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}
