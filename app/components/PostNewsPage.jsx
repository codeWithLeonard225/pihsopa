"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FaImage, FaVideo, FaHeading, FaTag, FaFileAlt, 
  FaArrowLeft, FaCloudUploadAlt, FaImages, FaTimes 
} from "react-icons/fa";
import Link from "next/link";
import { uploadToCloudinary } from "@/app/lib/cloudinaryUpload";

// --- FIREBASE IMPORTS ---
import { db } from "@/app/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/* =====================================================
    LIGHTWEIGHT CLIENT-SIDE IMAGE COMPRESSION HELPER
====================================================== */
const compressImage = (file, maxWidth = 1200, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      return resolve(file); // Don't compress video files
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio resizing bounds
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            // Convert blob back into a file object
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
    };
  });
};

export default function PostNewsPage() {
  const router = useRouter();
  
  // State variables for form fields
  const [postType, setPostType] = useState("image"); // "image" or "video"
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PIHSOPA Update");
  const [selectedFile, setSelectedFile] = useState(null);
  const [customCategory, setCustomCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  
  // --- NEW STATES FOR MULTIPLE GALLERY IMAGES ---
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // Media states
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle main cover media upload for previewing
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  // --- HANDLE MULTIPLE GALLERY FILES ---
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Combine existing files with newly chosen ones
    const updatedFiles = [...galleryFiles, ...files];
    setGalleryFiles(updatedFiles);

    // Create and append local object URLs for previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  // --- REMOVE A SINGLE PHOTO FROM THE GALLERY PREVIEW ---
  const removeGalleryImage = (index) => {
    const updatedFiles = galleryFiles.filter((_, i) => i !== index);
    const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryFiles(updatedFiles);
    setGalleryPreviews(updatedPreviews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !excerpt || !content) {
      alert("Please fill in all required fields.");
      return;
    }

    const finalCategory = category === "Custom" ? customCategory.trim() : category;
    if (category === "Custom" && !finalCategory) {
      alert("Please enter a custom category name.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedUrl = "";
      let uploadedGalleryUrls = [];

      // 1. Compress cover photo and gallery photos simultaneously in browser
      const compressPromises = [];
      
      if (selectedFile) {
        compressPromises.push(compressImage(selectedFile).then(res => ({ type: 'cover', file: res })));
      }
      
      if (postType === "image" && galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          compressPromises.push(compressImage(file).then(res => ({ type: 'gallery', file: res })));
        });
      }

      // Execute all localized resizing tasks down to minimal payloads
      const compressedResults = await Promise.all(compressPromises);
      
      const readyCover = compressedResults.find(r => r.type === 'cover')?.file || selectedFile;
      const readyGallery = compressedResults.filter(r => r.type === 'gallery').map(r => r.file);

      // 2. Upload cover and gallery in parallel to Cloudinary
      const uploadPromises = [];

      if (readyCover) {
        uploadPromises.push(uploadToCloudinary(readyCover, postType).then(url => ({ type: 'cover', url })));
      }

      if (postType === "image" && readyGallery.length > 0) {
        readyGallery.forEach((file) => {
          uploadPromises.push(uploadToCloudinary(file, "image").then(url => ({ type: 'gallery', url })));
        });
      }

      // Stream data channels concurrently 
      const uploadResults = await Promise.all(uploadPromises);

      uploadedUrl = uploadResults.find(r => r.type === 'cover')?.url || "";
      uploadedGalleryUrls = uploadResults.filter(r => r.type === 'gallery').map(r => r.url);

      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Date().toLocaleDateString('en-US', options);

      // Structure payload for Firestore
      const newPostData = {
        title,
        date: formattedDate,
        category: finalCategory,
        excerpt,
        content,
        type: postType,
        image: postType === "image" ? (uploadedUrl || "/images/pihs-meeting1.jpeg") : null,
        video: postType === "video" ? (uploadedUrl || "https://www.w3schools.com/html/mov_bbb.mp4") : null,
        gallery: uploadedGalleryUrls,
        createdAt: serverTimestamp()
      };

      const newsCollectionRef = collection(db, "news");
      await addDoc(newsCollectionRef, newPostData);

      setIsSubmitting(false);
      alert("News & Gallery Published Successfully!");

      // Reset form fields
      setTitle("");
      setExcerpt("");
      setContent("");
      setSelectedFile(null);
      setPreviewUrl("");
      setGalleryFiles([]);
      setGalleryPreviews([]);
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
                  onClick={() => { setPostType("video"); setPreviewUrl(""); setSelectedFile(null); setGalleryFiles([]); setGalleryPreviews([]); }}
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

            {/* COVER MEDIA UPLOAD FIELD BOX */}
            <div>
              <label className="block text-slate-700 font-bold text-sm mb-2">
                {postType === "image" ? "Main Article Cover Photo *" : "Featured Video File *"}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-sky-400 transition bg-slate-50">
                <div className="space-y-1 text-center">
                  <FaCloudUploadAlt className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-bold text-sky-600 hover:text-sky-500 focus-within:outline-none">
                      <span>Upload cover resource</span>
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

              {previewUrl && (
                <div className="mt-4 p-2 bg-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Cover File Preview:</p>
                  {postType === "image" ? (
                    <img src={previewUrl} alt="Preview Upload" className="max-h-48 w-full object-cover rounded-lg" />
                  ) : (
                    <video src={previewUrl} controls className="max-h-48 w-full rounded-lg" />
                  )}
                </div>
              )}
            </div>

            {/* --- GALLERY INPUT SECTION --- */}
            {postType === "image" && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-1">
                  <FaImages className="text-sky-600" /> Additional Article Gallery Photos (Optional)
                </label>
                <p className="text-xs text-slate-400 mb-4">
                  Upload multiple photos (recommended: 4 or more) to display at the bottom of your article layout.
                </p>
                
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50/50 transition">
                    <div className="pt-5 pb-6 text-center">
                      <p className="text-sm text-sky-600 font-bold">Click to add multiple files</p>
                    </div>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleGalleryChange}
                    />
                  </label>
                </div>

                {/* Grid Preview Display */}
                {galleryPreviews.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mt-4 mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Gallery Queue ({galleryPreviews.length} selected):
                      </span>
                      {galleryPreviews.length < 4 && (
                        <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                          Tip: Add {4 - galleryPreviews.length} more to meet your target of 4 photos!
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-inner bg-slate-200 group">
                          <img src={preview} alt="Gallery thumb preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow transition active:scale-90"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                {isSubmitting ? "Uploading Assets & Publishing..." : "Publish Live News Update"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </main>
  );
}