"use client";

import { useState } from "react";
import { db } from "@/app/lib/firebase";
import { 
  collection, query, where, getDocs, 
  doc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { uploadToCloudinary } from "@/app/lib/cloudinaryUpload";
import imageCompression from 'browser-image-compression';
import { MdSearch, MdSave, MdPerson, MdSchool, MdWarningAmber, MdCheckCircle } from "react-icons/md";

export default function EditMemberPage() {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberDocId, setMemberDocId] = useState(null); // Firebase Auto-ID
  const [formData, setFormData] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Search for Member
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    setLoading(true);
    setMessage({ type: "", text: "" });
    setFormData(null);

    try {
      const q = query(collection(db, "clients"), where("clientId", "==", searchId.toUpperCase().trim()));
      const snap = await getDocs(q);

      if (snap.empty) {
        setMessage({ type: "error", text: "Member not found. Please check the ID." });
      } else {
        const data = snap.docs[0].data();
        setMemberDocId(snap.docs[0].id);
        setFormData(data);
        setPhotoPreview(data.photoURL);
        setMessage({ type: "success", text: "Member found!" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Search failed. Check connection." });
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Photo Update Logic
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = { maxSizeMB: 0.2, maxWidthOrHeight: 600, useWebWorker: true };
    try {
      setLoading(true);
      const compressedFile = await imageCompression(file, options);
      setPhoto(compressedFile);
      setPhotoPreview(URL.createObjectURL(compressedFile));
    } catch (err) {
      setMessage({ type: "error", text: "Image processing failed." });
    } finally {
      setLoading(false);
    }
  };

 
  // 4. Submit Updates
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalPhotoURL = formData.photoURL;

      // Upload new photo if changed
      if (photo) {
        finalPhotoURL = await uploadToCloudinary(photo);
      }

      // Prepare the update data
      const updateData = {
        ...formData,
        // FORCE UPPERCASE AND REMOVE EXTRA SPACES HERE
        fullname: formData.fullname.toUpperCase().trim(), 
        photoURL: finalPhotoURL,
        updatedAt: serverTimestamp(),
      };

      const memberRef = doc(db, "clients", memberDocId);
      await updateDoc(memberRef, updateData);

      // Important: Update the local UI state so the input field also turns uppercase
      setFormData(prev => ({
        ...prev,
        fullname: formData.fullname.toUpperCase().trim()
      }));

      setMessage({ type: "success", text: "Member records updated successfully!" });
    } catch (err) {
      console.error("Update Error:", err);
      setMessage({ type: "error", text: "Update failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border-t-8 border-amber-400">
        
        <h1 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-2">
          <MdPerson className="text-amber-500" /> EDIT MEMBER PROFILE
        </h1>

        {/* SEARCH SECTION */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Membership ID (e.g. SH-1234)"
            className="flex-1 p-4 bg-gray-100 rounded-xl font-bold outline-none focus:ring-2 ring-amber-300 transition-all"
          />
          <button 
            disabled={loading}
            className="bg-blue-900 text-white px-6 rounded-xl font-bold hover:bg-blue-800 flex items-center gap-2"
          >
            <MdSearch size={20} /> {loading ? "..." : "Search"}
          </button>
        </form>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message.type === "success" ? <MdCheckCircle /> : <MdWarningAmber />}
            {message.text}
          </div>
        )}

        {/* EDIT FORM (Only visible if formData exists) */}
        {formData && (
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="md:col-span-2 flex flex-col items-center mb-4">
               <div className="w-28 h-28 rounded-full border-4 border-amber-100 overflow-hidden mb-2 shadow-inner">
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
               </div>
               <input type="file" id="edit-photo" hidden onChange={handlePhotoChange} />
               <label htmlFor="edit-photo" className="text-[10px] font-bold text-amber-600 cursor-pointer hover:underline uppercase">
                 Change Member Photo
               </label>
            </div>

            <div className="md:col-span-2">
              <label className="label-text">Full Name</label>
              <input name="fullname" value={formData.fullname} onChange={handleChange} className="edit-input" />
            </div>

            <div>
              <label className="label-text">Phone Number</label>
              <input name="tel" value={formData.tel} onChange={handleChange} className="edit-input" />
            </div>

            <div>
              <label className="label-text">Occupation</label>
              <input name="occupation" value={formData.occupation} onChange={handleChange} className="edit-input" />
            </div>

            <div className="md:col-span-2">
              <label className="label-text">Residential Address</label>
              <input name="address" value={formData.address} onChange={handleChange} className="edit-input" />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                Academic Records <MdSchool />
              </h3>
            </div>

            <div>
              <label className="label-text">Edu Period</label>
              <input name="eduPeriod" value={formData.eduPeriod} onChange={handleChange} className="edit-input" />
            </div>

            <div>
              <label className="label-text">Graduating Class</label>
              <input name="className" value={formData.className} onChange={handleChange} className="edit-input" />
            </div>

            <div className="md:col-span-2">
              <label className="label-text">Membership Tier</label>
              <select name="membershipTier" value={formData.membershipTier} onChange={handleChange} className="edit-input">
                <option value="Regular">Regular Member</option>
                <option value="Gold">Gold Member</option>
                <option value="Platinum">Platinum Member</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="md:col-span-2 mt-6 bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <MdSave size={20} /> {loading ? "Saving Changes..." : "Update Member Record"}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .label-text {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
          margin-left: 4px;
        }
        .edit-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: #f8fafc;
          border: 2px solid #010911;
          border-radius: 12px;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .edit-input:focus {
          border-color: #fbbf24;
          background: white;
        }
      `}</style>
    </main>
  );
}