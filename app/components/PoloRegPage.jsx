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
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  MdCheckroom,
  MdPerson,
  MdSchool,
  MdPhone,
  MdColorLens,
  MdHistory,
  MdSearch,
  MdCalendarToday,
  MdVerified,
  MdEdit,
  MdDelete,
  MdCloudUpload,
  MdClose,
  MdSave,
} from "react-icons/md";

import { uploadToCloudinary } from "@/app/lib/cloudinaryUpload";

const ORG_ID = "PIHSOPA";

export default function PoloRegPage() {
  /* =========================================================
     STATE
  ========================================================= */

  const [polos, setPolos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Registration form
  const [fullname, setFullname] = useState("");
  const [classOf, setClassOf] = useState("");
  const [houseColor, setHouseColor] = useState("");
  const [size, setSize] = useState("");
  const [telephone, setTelephone] = useState("");
  const [issuedDate, setIssuedDate] = useState("");

  // Registration photo
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal
  const [editingPolo, setEditingPolo] = useState(null);

  const [editFullname, setEditFullname] = useState("");
  const [editClassOf, setEditClassOf] = useState("");
  const [editHouseColor, setEditHouseColor] = useState("");
  const [editSize, setEditSize] = useState("");
  const [editTelephone, setEditTelephone] = useState("");
  const [editIssuedDate, setEditIssuedDate] = useState("");

  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState("");
  const [editRemovePhoto, setEditRemovePhoto] = useState(false);

  const [savingEdit, setSavingEdit] = useState(false);

  /* =========================================================
     FETCH POLOS
  ========================================================= */

  const fetchPolos = async () => {
    try {
      setFetching(true);

      const polosRef = collection(db, "poloRegistrations");

      const q = query(
        polosRef,
        where("orgId", "==", ORG_ID)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      data.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;

        return dateB - dateA;
      });

      setPolos(data);
    } catch (error) {
      console.error("Error fetching polos:", error);
      alert("Failed to load polo registrations.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPolos();
  }, []);

  /* =========================================================
     GENERATE POLO ID
  ========================================================= */

  const generatePoloId = () => {
    const nextNumber = polos.length + 1;

    return `PIHSOPA-${String(nextNumber).padStart(4, "0")}`;
  };

  /* =========================================================
     PHOTO HANDLING - NEW REGISTRATION
  ========================================================= */

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size must not exceed 5MB.");
      return;
    }

    setPhotoFile(file);

    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
  };

  /* =========================================================
     REGISTER POLO
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname.trim()) {
      alert("Please enter the full name.");
      return;
    }

    if (!classOf.trim()) {
      alert("Please enter the class of.");
      return;
    }

    if (!houseColor) {
      alert("Please select the house color.");
      return;
    }

    if (!size) {
      alert("Please select the polo size.");
      return;
    }

    if (!telephone.trim()) {
      alert("Please enter the telephone number.");
      return;
    }

    if (!issuedDate) {
      alert("Please select the issue date.");
      return;
    }

    try {
      setLoading(true);

      let photoUrl = "";

      if (photoFile) {
        photoUrl = await uploadToCloudinary(photoFile, "image");
      }

      const poloId = generatePoloId();

      const poloData = {
        orgId: ORG_ID,

        poloId,

        fullname: fullname.trim(),

        classOf: classOf.trim(),

        houseColor,

        size,

        telephone: telephone.trim(),

        issuedDate,

        photoUrl,

        status: "Active",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, "poloRegistrations"),
        poloData
      );

      alert(`Polo registered successfully.\nPolo ID: ${poloId}`);

      // Reset form
      setFullname("");
      setClassOf("");
      setHouseColor("");
      setSize("");
      setTelephone("");
      setIssuedDate("");
      setPhotoFile(null);
      setPhotoPreview("");

      await fetchPolos();
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        error?.message ||
          "Failed to register polo. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     EDIT POLO
  ========================================================= */

  const handleEdit = (polo) => {
    setEditingPolo(polo);

    setEditFullname(polo.fullname || "");
    setEditClassOf(polo.classOf || "");
    setEditHouseColor(polo.houseColor || "");
    setEditSize(polo.size || "");
    setEditTelephone(polo.telephone || "");
    setEditIssuedDate(polo.issuedDate || "");

    setEditPhotoFile(null);
    setEditPhotoPreview(polo.photoUrl || "");
    setEditRemovePhoto(false);
  };

  /* =========================================================
     EDIT PHOTO
  ========================================================= */

  const handleEditPhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size must not exceed 5MB.");
      return;
    }

    setEditPhotoFile(file);

    const preview = URL.createObjectURL(file);

    setEditPhotoPreview(preview);

    setEditRemovePhoto(false);
  };

  const handleRemoveEditPhoto = () => {
    setEditPhotoFile(null);
    setEditPhotoPreview("");
    setEditRemovePhoto(true);
  };

  /* =========================================================
     SAVE UPDATED POLO
  ========================================================= */

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editingPolo) return;

    if (!editFullname.trim()) {
      alert("Please enter the full name.");
      return;
    }

    if (!editClassOf.trim()) {
      alert("Please enter the class of.");
      return;
    }

    if (!editHouseColor) {
      alert("Please select the house color.");
      return;
    }

    if (!editSize) {
      alert("Please select the polo size.");
      return;
    }

    if (!editTelephone.trim()) {
      alert("Please enter the telephone number.");
      return;
    }

    if (!editIssuedDate) {
      alert("Please select the issue date.");
      return;
    }

    try {
      setSavingEdit(true);

      let photoUrl = editingPolo.photoUrl || "";

      // Upload replacement photo
      if (editPhotoFile) {
        photoUrl = await uploadToCloudinary(
          editPhotoFile,
          "image"
        );
      }

      // Remove photo
      if (editRemovePhoto) {
        photoUrl = "";
      }

      const updatedData = {
        fullname: editFullname.trim(),

        classOf: editClassOf.trim(),

        houseColor: editHouseColor,

        size: editSize,

        telephone: editTelephone.trim(),

        issuedDate: editIssuedDate,

        photoUrl,

        updatedAt: serverTimestamp(),
      };

      const poloRef = doc(
        db,
        "poloRegistrations",
        editingPolo.id
      );

      await updateDoc(poloRef, updatedData);

      // Update local state
      setPolos((current) =>
        current.map((item) =>
          item.id === editingPolo.id
            ? {
                ...item,
                ...updatedData,
                updatedAt: {
                  seconds: Math.floor(Date.now() / 1000),
                },
              }
            : item
        )
      );

      alert("Polo updated successfully.");

      closeEditModal();
    } catch (error) {
      console.error("Update error:", error);

      alert(
        error?.message ||
          "Failed to update polo. Please try again."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /* =========================================================
     DELETE POLO
  ========================================================= */

  const handleDelete = async (polo) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the polo registration for ${polo.fullname}?\n\nPolo ID: ${polo.poloId}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const poloRef = doc(
        db,
        "poloRegistrations",
        polo.id
      );

      await deleteDoc(poloRef);

      setPolos((current) =>
        current.filter((item) => item.id !== polo.id)
      );

      alert("Polo deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error?.message ||
          "Failed to delete polo. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CLOSE EDIT MODAL
  ========================================================= */

  const closeEditModal = () => {
    setEditingPolo(null);

    setEditFullname("");
    setEditClassOf("");
    setEditHouseColor("");
    setEditSize("");
    setEditTelephone("");
    setEditIssuedDate("");

    setEditPhotoFile(null);
    setEditPhotoPreview("");
    setEditRemovePhoto(false);
  };

  /* =========================================================
     SEARCH
  ========================================================= */

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

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalPolos = polos.length;

  const activePolos = polos.filter(
    (polo) => polo.status === "Active"
  ).length;

  const uniqueHolders = new Set(
    polos.map((polo) => polo.fullname?.toLowerCase())
  ).size;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-lg mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-3 rounded-xl">
                  <MdCheckroom size={32} />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    PIHSOPA Polo Registration
                  </h1>

                  <p className="text-red-100 text-sm">
                    Providence International High School Old Pupils Association
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl px-5 py-3">
              <p className="text-xs text-red-100">
                Organization
              </p>

              <p className="font-bold">
                {ORG_ID}
              </p>
            </div>

          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Polos
                </p>

                <p className="text-3xl font-bold text-gray-900">
                  {totalPolos}
                </p>
              </div>

              <div className="bg-red-100 text-red-700 p-3 rounded-xl">
                <MdCheckroom size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Active Polos
                </p>

                <p className="text-3xl font-bold text-green-600">
                  {activePolos}
                </p>
              </div>

              <div className="bg-green-100 text-green-700 p-3 rounded-xl">
                <MdVerified size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Unique Holders
                </p>

                <p className="text-3xl font-bold text-blue-600">
                  {uniqueHolders}
                </p>
              </div>

              <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                <MdPerson size={28} />
              </div>
            </div>
          </div>

        </div>

        {/* =====================================================
            REGISTRATION FORM
        ===================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-7 mb-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 text-red-700 p-3 rounded-xl">
              <MdCheckroom size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Register New Polo
              </h2>

              <p className="text-sm text-gray-500">
                Enter the old pupil information below.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* FULL NAME */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>

                <div className="relative">
                  <MdPerson
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />

                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) =>
                      setFullname(e.target.value)
                    }
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* CLASS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class of
                </label>

                <div className="relative">
                  <MdSchool
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />

                  <input
                    type="text"
                    value={classOf}
                    onChange={(e) =>
                      setClassOf(e.target.value)
                    }
                    placeholder="e.g. 2012"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* HOUSE COLOR */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  House Color
                </label>

                <div className="relative">
                  <MdColorLens
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />

                  <select
                    value={houseColor}
                    onChange={(e) =>
                      setHouseColor(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                  >
                    <option value="">
                      Select house color
                    </option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Orange">Orange</option>
                    <option value="Purple">Purple</option>
                  </select>
                </div>
              </div>

              {/* SIZE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Polo Size
                </label>

                <select
                  value={size}
                  onChange={(e) =>
                    setSize(e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
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

              {/* TELEPHONE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telephone
                </label>

                <div className="relative">
                  <MdPhone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />

                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) =>
                      setTelephone(e.target.value)
                    }
                    placeholder="Enter telephone"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* ISSUE DATE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Date
                </label>

                <div className="relative">
                  <MdCalendarToday
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={19}
                  />

                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) =>
                      setIssuedDate(e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>

            </div>

            {/* PHOTO */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photo
                <span className="text-gray-400 font-normal">
                  {" "}
                  (Optional)
                </span>
              </label>

              <div className="flex flex-col md:flex-row gap-4 items-start">

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  <MdCloudUpload size={22} />

                  <span className="font-semibold">
                    Upload Photo
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                {photoPreview && (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl border"
                    />

                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                )}

              </div>

              <p className="text-xs text-gray-500 mt-2">
                Maximum file size: 5MB.
              </p>
            </div>

            {/* SUBMIT */}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-700 text-white font-bold rounded-xl hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdCheckroom size={22} />

                {loading
                  ? "Registering..."
                  : "Register Polo"}
              </button>
            </div>

          </form>
        </div>

        {/* =====================================================
            HISTORY
        ===================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          <div className="p-5 md:p-6 border-b">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div className="flex items-center gap-3">
                <div className="bg-gray-100 text-gray-700 p-3 rounded-xl">
                  <MdHistory size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Polo Registration History
                  </h2>

                  <p className="text-sm text-gray-500">
                    Manage registered PIHSOPA polos.
                  </p>
                </div>
              </div>

              {/* SEARCH */}
              <div className="relative w-full md:w-96">

                <MdSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={22}
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search polo ID, name, class..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />

              </div>

            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">

            {fetching ? (
              <div className="p-10 text-center text-gray-500">
                Loading polo registrations...
              </div>
            ) : filteredPolos.length === 0 ? (
              <div className="p-10 text-center">

                <MdCheckroom
                  size={50}
                  className="mx-auto text-gray-300 mb-3"
                />

                <p className="font-semibold text-gray-600">
                  No polo registrations found.
                </p>

                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-1">
                    Try another search term.
                  </p>
                )}

              </div>
            ) : (
              <table className="w-full min-w-[1100px]">

                <thead className="bg-gray-50 border-b">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Polo
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Recipient
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Class
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      House
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Size
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Telephone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredPolos.map((polo) => (

                    <tr
                      key={polo.id}
                      className="hover:bg-gray-50 transition"
                    >

                      {/* POLO ID */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          {polo.photoUrl ? (
                            <img
                              src={polo.photoUrl}
                              alt={polo.fullname}
                              className="w-12 h-12 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              <MdPerson size={25} />
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-gray-900">
                              {polo.poloId}
                            </p>

                            <p className="text-xs text-gray-500">
                              PIHSOPA
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* RECIPIENT */}
                      <td className="px-6 py-4">

                        <p className="font-semibold text-gray-900">
                          {polo.fullname}
                        </p>

                      </td>

                      {/* CLASS */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-700">
                          {polo.classOf}
                        </span>
                      </td>

                      {/* HOUSE */}
                      <td className="px-6 py-4">

                        <span className="inline-flex items-center gap-2">

                          <span
                            className="w-3 h-3 rounded-full border"
                            style={{
                              backgroundColor:
                                polo.houseColor?.toLowerCase(),
                            }}
                          />

                          <span className="font-medium">
                            {polo.houseColor}
                          </span>

                        </span>

                      </td>

                      {/* SIZE */}
                      <td className="px-6 py-4">

                        <span className="px-3 py-1 bg-gray-100 rounded-lg font-bold text-sm">
                          {polo.size}
                        </span>

                      </td>

                      {/* TELEPHONE */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2 text-gray-700">

                          <MdPhone size={18} />

                          {polo.telephone}

                        </div>

                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4">

                        <span className="text-sm text-gray-600">
                          {polo.issuedDate || "-"}
                        </span>

                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">

                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <MdVerified size={15} />
                          {polo.status || "Active"}
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">

                        <div className="flex items-center justify-end gap-2">

                          {/* UPDATE */}
                          <button
                            type="button"
                            onClick={() => handleEdit(polo)}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition font-bold text-xs"
                            title="Update polo"
                          >
                            <MdEdit size={18} />
                            Update
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(polo)
                            }
                            disabled={loading}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-bold text-xs disabled:opacity-50"
                            title="Delete polo"
                          >
                            <MdDelete size={18} />
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            )}

          </div>

          {/* FOOTER */}
          {!fetching && filteredPolos.length > 0 && (
            <div className="px-6 py-4 border-t bg-gray-50">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-bold text-gray-700">
                    {filteredPolos.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-700">
                    {polos.length}
                  </span>{" "}
                  registrations
                </p>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* =====================================================
          UPDATE MODAL
      ===================================================== */}

      {editingPolo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="bg-white w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b px-5 md:px-6 py-4 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Update Polo
                </h2>

                <p className="text-sm text-gray-500">
                  Polo ID:{" "}
                  <span className="font-bold text-red-700">
                    {editingPolo.poloId}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <MdClose size={25} />
              </button>

            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleSaveEdit}>

              <div className="p-5 md:p-6 space-y-6">

                {/* PHOTO SECTION */}
                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Polo Photo
                  </label>

                  <div className="flex flex-col sm:flex-row items-start gap-5">

                    <div className="relative">

                      {editPhotoPreview ? (
                        <img
                          src={editPhotoPreview}
                          alt={editFullname}
                          className="w-32 h-32 object-cover rounded-xl border"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400">
                          <MdPerson size={50} />
                        </div>
                      )}

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl hover:bg-gray-50 transition font-semibold text-sm">

                        <MdCloudUpload size={20} />

                        Replace Photo

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditPhotoChange}
                          className="hidden"
                        />

                      </label>

                      {editPhotoPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveEditPhoto}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition font-semibold text-sm"
                        >
                          <MdDelete size={20} />
                          Remove Photo
                        </button>
                      )}

                    </div>

                  </div>

                </div>

                {/* FORM FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* FULL NAME */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={editFullname}
                      onChange={(e) =>
                        setEditFullname(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>

                  {/* CLASS */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class of
                    </label>

                    <input
                      type="text"
                      value={editClassOf}
                      onChange={(e) =>
                        setEditClassOf(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>

                  {/* HOUSE */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      House Color
                    </label>

                    <select
                      value={editHouseColor}
                      onChange={(e) =>
                        setEditHouseColor(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                    >
                      <option value="">
                        Select house color
                      </option>

                      <option value="Red">Red</option>
                      <option value="Blue">Blue</option>
                      <option value="Green">Green</option>
                      <option value="Yellow">Yellow</option>
                      <option value="Orange">Orange</option>
                      <option value="Purple">Purple</option>
                    </select>
                  </div>

                  {/* SIZE */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Polo Size
                    </label>

                    <select
                      value={editSize}
                      onChange={(e) =>
                        setEditSize(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
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

                  {/* TELEPHONE */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telephone
                    </label>

                    <input
                      type="tel"
                      value={editTelephone}
                      onChange={(e) =>
                        setEditTelephone(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>

                  {/* DATE */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Issue Date
                    </label>

                    <input
                      type="date"
                      value={editIssuedDate}
                      onChange={(e) =>
                        setEditIssuedDate(e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>

                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="sticky bottom-0 bg-white border-t px-5 md:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="px-5 py-3 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-700 text-white font-bold hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdSave size={21} />

                  {savingEdit
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}