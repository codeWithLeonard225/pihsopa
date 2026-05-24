"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaImage, FaVideo, FaHeading, FaTag, FaFileAlt, FaArrowLeft, FaCloudUploadAlt } from "react-icons/fa";
import Link from "next/link";
import { uploadToCloudinary } from "@/app/lib/cloudinaryUpload";

// --- FIREBASE IMPORTS ---
import { db } from "@/app/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PostNewsPage() {
  const router = useRouter();
  
  // State variables for form fields
  const [postType, setPostType] = useState("image"); // "image" or "video"
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PIHSOPA Update");
  const [selectedFile, setSelectedFile] = useState(null);
  
  // --- ADDED STATE FOR CUSTOM CATEGORIES ---
  const [customCategory, setCustomCategory] = useState("");
  
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  
  // Media states
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle local file uploads for previewing
  const handleMediaChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !excerpt || !content) {
      alert("Please fill in all required fields.");
      return;
    }

    // Determine the final category value to save
    const finalCategory = category === "Custom" ? customCategory.trim() : category;

    if (category === "Custom" && !finalCategory) {
      alert("Please enter a custom category name.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedUrl = "";

      // Upload file to Cloudinary if one is selected
      if (selectedFile) {
        // Pass the raw file binary and the format type ("image" or "video")
        uploadedUrl = await uploadToCloudinary(selectedFile, postType);
      }

      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Date().toLocaleDateString('en-US', options);

      // Structure the payload for Firestore using the Cloudinary secure URL
      const newPostData = {
        title,
        date: formattedDate,
        category: finalCategory,
        excerpt,
        content,
        type: postType,
        // Fallback to defaults if no file was uploaded
        image: postType === "image" ? (uploadedUrl || "/images/pihs-meeting1.jpeg") : null,
        video: postType === "video" ? (uploadedUrl || "https://www.w3schools.com/html/mov_bbb.mp4") : null,
        createdAt: serverTimestamp()
      };

      const newsCollectionRef = collection(db, "news");
      await addDoc(newsCollectionRef, newPostData);

      setIsSubmitting(false);
      alert("News Published Successfully!");

      // Reset state form fields
      setTitle("");
      setExcerpt("");
      setContent("");
      setSelectedFile(null);
      setPreviewUrl("");
      setCategory("PIHSOPA Update");
      setCustomCategory(""); 
      setPostType("image");

    } catch (error) {
      console.error("Error publishing update to Firestore: ", error);
      alert("Something went wrong saving this post. Check console details.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-bold mb-6 transition">
          <FaArrowLeft className="text-sm" /> Back to Dashboard
        </Link>

        {/* Form Wrapper Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-800 to-cyan-700 p-6 sm:p-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-black">Publish News Update</h1>
            <p className="text-sky-100 text-sm sm:text-base mt-1">Broadcast new stories, meeting notes, or media directly onto the community home feed.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
            
            {/* POST TYPE TOGGLE SETTINGS */}
            <div>
              <label className="block text-slate-700 font-black text-sm uppercase tracking-wider mb-3">
                Select News Media Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setPostType("image"); setPreviewUrl(""); setSelectedFile(null); }}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-bold text-base transition-all ${
                    postType === "image"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <FaImage className="text-xl" /> Standard Image Post
                </button>
                <button
                  type="button"
                  onClick={() => { setPostType("video"); setPreviewUrl(""); setSelectedFile(null); }}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-bold text-base transition-all ${
                    postType === "video"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <FaVideo className="text-xl" /> Video Highlight Post
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* TITLE INPUT FIELD */}
            <div>
              <label className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-2">
                <FaHeading className="text-slate-400" /> News Article Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., PIHSOPA Forms New Committee for Upcoming Anniversary"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-medium"
              />
            </div>

            {/* CATEGORY SELECT */}
            <div>
              <label className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-2">
                <FaTag className="text-slate-400" /> Category Type
              </label>

              <div className="space-y-3">
                {/* Dropdown */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-800 font-medium"
                >
                  <option value="PIHSOPA Update">PIHSOPA Update</option>
                  <option value="Anniversary Planning">Anniversary Planning</option>
                  <option value="Alumni Outreach">Alumni Outreach</option>
                  <option value="Campus Milestones">Campus Milestones</option>
                  <option value="Custom">+ Add Custom Category</option>
                </select>

                {/* Custom Input Field */}
                {category === "Custom" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category name..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-medium bg-sky-50/30"
                  />
                )}
              </div>
            </div>

            {/* DYNAMIC MEDIA UPLOAD FIELD BOX */}
            <div>
              <label className="block text-slate-700 font-bold text-sm mb-2">
                {postType === "image" ? "Upload Article Photo" : "Upload Video File"}
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-sky-400 transition bg-slate-50">
                <div className="space-y-1 text-center">
                  <FaCloudUploadAlt className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-bold text-sky-600 hover:text-sky-500 focus-within:outline-none">
                      <span>Upload file resource</span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept={postType === "image" ? "image/*" : "video/*"}
                        onChange={handleMediaChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    {postType === "image" ? "PNG, JPG, JPEG up to 10MB" : "MP4, WEBM up to 50MB"}
                  </p>
                </div>
              </div>

              {/* Real-time Dynamic Media Preview box */}
              {previewUrl && (
                <div className="mt-4 p-2 bg-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Live Stream Upload Preview File:</p>
                  {postType === "image" ? (
                    <img src={previewUrl} alt="Preview Upload" className="max-h-48 w-full object-cover rounded-lg" />
                  ) : (
                    <video src={previewUrl} controls className="max-h-48 w-full rounded-lg" />
                  )}
                </div>
              )}
            </div>

            {/* SHORT EXCERPT SUMMARY */}
            <div>
              <label className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-2">
                <FaFileAlt className="text-slate-400" /> Short Excerpt Summary *
              </label>
              <input
                type="text"
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a quick 1-sentence headline intro summary..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-medium"
              />
            </div>

            {/* FULL STORY CONTENT BOX */}
            <div>
              <label className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-2">
                <FaFileAlt className="text-slate-400" /> Full Body Story Details *
              </label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste the complete news article details here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-medium leading-relaxed"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-black text-lg py-4 rounded-xl transition duration-300 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Uploading Media & Publishing..." : "Publish Live News Update"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </main>
  );
}