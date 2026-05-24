"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/app/lib/firebase";

import Image from "next/image";

import {
  FaTrash,
  FaEdit,
  FaVideo,
  FaImage,
} from "react-icons/fa";

export default function ManageNewsPage() {

  const [news, setNews] = useState([]);

  useEffect(() => {

    const newsRef = collection(db, "news");

    const unsubscribe = onSnapshot(newsRef, (snapshot) => {

      const newsItems = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setNews(newsItems);
    });

    return () => unsubscribe();

  }, []);

  // DELETE NEWS
  const handleDelete = async (id) => {

    const confirmDelete = confirm(
      "Are you sure you want to delete this news?"
    );

    if (!confirmDelete) return;

    try {

      await deleteDoc(doc(db, "news", id));

      alert("News deleted successfully");

    } catch (error) {

      console.error(error);

      alert("Failed to delete news");

    }

  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">

      <div className="max-w-7xl mx-auto">

        <div className="mb-10">
          <h1 className="text-4xl font-black text-sky-800">
            Manage News
          </h1>

          <p className="text-slate-500 mt-2">
            Update, edit, or remove posted news updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {news.map((item) => (

            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100"
            >

              {/* MEDIA */}
              <div className="relative h-52 bg-slate-100">

                {item.type === "video" ? (

                  <video
                    src={item.video}
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <Image
                    src={item.image || "/images/pihs-meeting1.jpeg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />

                )}

              </div>

              {/* BODY */}
              <div className="p-5">

                <div className="flex items-center gap-2 mb-3">

                  {item.type === "video" ? (
                    <FaVideo className="text-red-500" />
                  ) : (
                    <FaImage className="text-sky-500" />
                  )}

                  <span className="text-xs uppercase font-bold text-slate-500">
                    {item.category}
                  </span>

                </div>

                <h2 className="font-black text-lg text-slate-800 line-clamp-2">
                  {item.title}
                </h2>

                <p className="text-sm text-slate-500 mt-2 line-clamp-3">
                  {item.excerpt}
                </p>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 mt-6">

                  {/* EDIT */}
                  <button
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <FaTrash />
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}