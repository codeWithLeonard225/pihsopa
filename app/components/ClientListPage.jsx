"use client";

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

const ORG_ID = "PIHSOPA";

export default function ClientListPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const q = query(
          collection(db, "clients"),
          where("orgId", "==", ORG_ID)
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

  const filteredClients = clients.filter((client) =>
    (client.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.clientId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (clientId, clientOrgId) => {
    if (clientOrgId !== ORG_ID) {
      alert("Unauthorized action");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete this member?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "clients", clientId));
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete member");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-indigo-600">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="font-bold">Accessing Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
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
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">

            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4">Client ID</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredClients.map((client) => (
                <tr key={client.id} className="block md:table-row p-4 md:p-0">

                  {/* MEMBER INFO */}
                  <td className="md:px-6 md:py-4 block md:table-cell">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                        {client.photoURL ? (
                          <img
                            src={client.photoURL}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <MdPerson className="w-full h-full text-gray-400 p-2" />
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-gray-800">{client.fullname}</p>
                        <p className="text-xs text-gray-400">{client.gender}</p>

                        {/* MOBILE EXTRA */}
                        <div className="md:hidden mt-2 text-sm text-gray-600 space-y-1">
                          <p><strong>ID:</strong> {client.clientId}</p>
                          <p><strong>Tel:</strong> {client.tel}</p>

                          <p>
                            <strong>Status:</strong> {client.professionalStatus}
                          </p>

                          {client.professionalStatus !== "Student" &&
                            client.placeOfWork && (
                              <p>
                                <strong>Work:</strong> {client.placeOfWork}
                              </p>
                            )}

                          <p>
                            <strong>Joined:</strong>{" "}
                            {client.createdAt?.seconds
                              ? new Date(client.createdAt.seconds * 1000).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CLIENT ID */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-mono font-bold">
                      {client.clientId}
                    </span>
                  </td>

                  {/* CONTACT */}
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MdPhone />
                      {client.tel}
                    </div>
                  </td>

                  {/* STATUS (UPDATED FROM occupation → professionalStatus) */}
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-700">
                    <div className="font-semibold">
                      {client.professionalStatus}
                    </div>

                    {/* hide workplace if Student */}
                    {client.professionalStatus !== "Student" &&
                      client.placeOfWork && (
                        <div className="text-xs text-gray-500 mt-1">
                          {client.placeOfWork}
                        </div>
                      )}
                  </td>

                  {/* JOINED */}
                  <td className="px-6 py-4 hidden md:table-cell text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <MdDateRange />
                      {client.createdAt?.seconds
                        ? new Date(client.createdAt.seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <button
                      onClick={() => handleDelete(client.id, client.orgId)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white"
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
          <div className="p-10 text-center text-gray-400 font-bold">
            No clients found
          </div>
        )}
      </div>
    </div>
  );
}