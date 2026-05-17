"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/app/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function IDCard() {
  const { clientId } = useParams(); // ✅ Correct way
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!clientId) return;

    const fetchClient = async () => {
      const q = query(
        collection(db, "clients"),
        where("clientId", "==", clientId)
      );

      const snap = await getDocs(q);
      snap.forEach((doc) => setClient(doc.data()));
    };

    fetchClient();
  }, [clientId]);

  if (!client) {
    return <p className="text-center mt-20">Loading ID Card...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-96 bg-white border-2 rounded-xl shadow-lg p-5 print:border-none">
        <h2 className="text-center font-bold text-green-700 mb-2">
          HAPPY LIFE ORGANIZATION
        </h2>

        <img
          src={client.photoURL}
          alt="Client Photo"
          className="w-24 h-24 rounded-full mx-auto border"
        />

        <p className="text-center font-bold mt-2">{client.fullname}</p>
        <p className="text-center text-sm">{client.clientId}</p>

        <p className="text-sm mt-2">
          <b>Gender:</b> {client.gender}
        </p>
        <p className="text-sm">
          <b>Tel:</b> {client.tel}
        </p>

        <button
          onClick={() => window.print()}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded print:hidden"
        >
          Print ID Card
        </button>
      </div>
    </div>
  );
}
