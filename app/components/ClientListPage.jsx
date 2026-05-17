"use client";
//app/(main)/clientList/ClientListPage
import React, { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { MdSearch, MdPhone, MdDateRange, MdPerson } from "react-icons/md";
import Image from "next/image";

const ORG_ID = "PIHSOPA";


export default function ClientListPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Clients from Firestore
  useEffect(() => {
    const fetchClients = async () => {
      try {

const q = query(
  collection(db, "clients"),
  where("orgId", "==", ORG_ID),

);
        const querySnapshot = await getDocs(q);
        const clientList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientList);
      } catch (error) {
        console.error("Error fetching clients: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // 2. Filter logic for Search
  const filteredClients = clients.filter((client) =>
    client.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.clientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-indigo-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="font-bold">Accessing Database...</p>
      </div>
    );
  }

  const handleDelete = async (clientId, clientOrgId) => {
  if (clientOrgId !== ORG_ID) {
    alert("Unauthorized action");
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to permanently delete this member?"
  );

  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "clients", clientId));

    // Update UI instantly
    setClients((prev) =>
      prev.filter((client) => client.id !== clientId)
    );
  } catch (error) {
    console.error("Error deleting client:", error);
    alert("Failed to delete member");
  }
};


  return (
  <div className="space-y-6">
    {/* Header & Search */}
    <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-800">
          Registered Old Pupils
        </h2>
        <p className="text-gray-500 text-sm font-medium">
          Total: {clients.length} Members
        </p>
      </div>

      <div className="relative w-full">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search name or ID..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

    {/* Client Table */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px] md:min-w-0">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider hidden md:table-header-group">
            <tr>
              <th className="px-6 py-4">Member Info</th>
              <th className="px-6 py-4">Client ID</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Occupation</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Actions</th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="block md:table-row hover:bg-indigo-50/30 transition p-4 md:p-0"
              >
                {/* Member Info */}
                <td className="md:px-6 md:py-4 block md:table-cell">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 md:h-10 md:w-10 rounded-full bg-gray-200 border overflow-hidden">
                      {client.photoURL ? (
                        <img
                          src={client.photoURL}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MdPerson className="w-full h-full text-gray-400 p-2" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{client.fullname}</p>
                      <p className="text-xs text-gray-400">{client.gender}</p>

                      {/* Mobile-only extra info */}
                      <div className="md:hidden mt-2 space-y-1 text-sm text-gray-600">
                        <p><strong>ID:</strong> {client.clientId}</p>
                        <p><strong>Tel:</strong> {client.tel}</p>
                        <p><strong>Occupation:</strong> {client.occupation}</p>
                        <p>
                          <strong>Joined:</strong>{" "}
                          {client.createdAt?.seconds
                            ? new Date(
                                client.createdAt.seconds * 1000
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Desktop-only columns */}
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black font-mono">
                    {client.clientId}
                  </span>
                </td>

                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MdPhone className="text-gray-400" />
                    {client.tel}
                  </div>
                </td>

                <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">
                  {client.occupation}
                </td>

                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <MdDateRange />
                    {client.createdAt?.seconds
                      ? new Date(
                          client.createdAt.seconds * 1000
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
  <button
    onClick={() => handleDelete(client.id, client.orgId)}
    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
  >
    Delete
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredClients.length === 0 && (
        <div className="p-10 text-center">
          <p className="text-gray-400 font-bold">
            No clients found matching your search.
          </p>
        </div>
      )}
    </div>
  </div>
);

}