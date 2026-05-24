"use client";

import { useState } from "react";
import { db } from "@/app/lib/firebase";
import {
  collection, query, where, getDocs,
  doc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { uploadToCloudinary } from "@/app/lib/cloudinaryUpload";
import imageCompression from "browser-image-compression";
import {
  MdSearch, MdSave, MdPerson, MdSchool,
  MdWarningAmber, MdCheckCircle, MdWork, MdLayers
} from "react-icons/md";

export default function EditMemberPage() {

  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberDocId, setMemberDocId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const q = query(
        collection(db, "clients"),
        where("clientId", "==", searchId.toUpperCase().trim())
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setMessage({ type: "error", text: "Member not found." });
      } else {
        const data = snap.docs[0].data();
        setMemberDocId(snap.docs[0].id);
        setFormData(data);
        setPhotoPreview(data.photoURL);
        setMessage({ type: "success", text: "Member loaded." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Search failed." });
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPhotoURL = formData.photoURL;

      if (photo) {
        finalPhotoURL = await uploadToCloudinary(photo);
      }

      const updateData = {
        ...formData,
        fullname: formData.fullname.toUpperCase().trim(),
        photoURL: finalPhotoURL,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "clients", memberDocId), updateData);

      setMessage({ type: "success", text: "Updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: "Update failed." });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8 border-t-8 border-amber-400">

        <h1 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-2">
          <MdPerson /> EDIT MEMBER FULL PROFILE
        </h1>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Member ID"
            className="flex-1 p-4 bg-gray-100 rounded-xl font-bold"
          />
          <button className="bg-blue-900 text-white px-6 rounded-xl">
            Search
          </button>
        </form>

        {/* MESSAGE */}
        {message.text && (
          <div className="mb-4 p-3 rounded bg-gray-100 text-sm font-bold">
            {message.text}
          </div>
        )}

        {/* FORM */}
        {formData && (
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* PHOTO */}
            <div className="md:col-span-2 text-center">
              <img src={photoPreview} className="w-24 h-24 rounded-full mx-auto" />
              <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
            </div>

            {/* BASIC INFO */}
            <input name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Full Name" className="edit-input md:col-span-2" />
            <input name="tel" value={formData.tel} onChange={handleChange} placeholder="Phone" className="edit-input" />
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="edit-input" />

            {/* PROFESSIONAL STATUS */}
            <select name="professionalStatus" value={formData.professionalStatus} onChange={handleChange} className="edit-input md:col-span-2">
              <option value="Student">Student</option>
              <option value="Employed">Employed</option>
              <option value="Private Business">Private Business</option>
              <option value="Unemployed">Unemployed</option>
            </select>

            {/* CONDITIONAL WORK */}
            {formData.professionalStatus !== "Student" && (
              <input
                name="placeOfWork"
                value={formData.placeOfWork}
                onChange={handleChange}
                placeholder="Place of Work / Business"
                className="edit-input md:col-span-2"
              />
            )}

            {/* ACADEMIC */}
            <input name="yearAdmission" value={formData.yearAdmission} onChange={handleChange} placeholder="Year Admission" className="edit-input" />
            <input name="formAdmitted" value={formData.formAdmitted} onChange={handleChange} placeholder="Form Admitted" className="edit-input" />
            <input name="formAttained" value={formData.formAttained} onChange={handleChange} placeholder="Form Attained" className="edit-input" />
            <input name="yearGraduation" value={formData.yearGraduation} onChange={handleChange} placeholder="Year Graduation" className="edit-input" />

            {/* TERTIARY */}
            <input name="tertiaryCollege" value={formData.tertiaryCollege} onChange={handleChange} placeholder="University" className="edit-input md:col-span-2" />
            <input name="tertiaryProgram" value={formData.tertiaryProgram} onChange={handleChange} placeholder="Program" className="edit-input md:col-span-2" />
            <input name="tertiaryYearEnrolled" value={formData.tertiaryYearEnrolled} onChange={handleChange} placeholder="Year Enrolled" className="edit-input" />
            <input name="tertiaryYearCompleted" value={formData.tertiaryYearCompleted} onChange={handleChange} placeholder="Year Completed" className="edit-input" />
            <input name="tertiaryQualifications" value={formData.tertiaryQualifications} onChange={handleChange} placeholder="Qualification" className="edit-input md:col-span-2" />

            {/* SAVE */}
            <button className="md:col-span-2 bg-amber-500 text-white py-4 rounded-xl font-black">
              SAVE UPDATE
            </button>

          </form>
        )}
      </div>

      <style jsx>{`
        .edit-input {
          padding: 12px;
          border-radius: 12px;
          background: #f1f5f9;
          font-weight: 600;
          border: 1px solid #ddd;
        }
      `}</style>

    </main>
  );
}