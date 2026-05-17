"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { 
  collection, addDoc, getDocs, query, 
  serverTimestamp, deleteDoc, doc, where, updateDoc, writeBatch 
} from "firebase/firestore";
import { 
  MdVpnKey, MdRefresh, MdDelete, 
  MdContentCopy, MdCheckCircle, MdPersonAdd, MdEdit, MdClose, MdSave 
} from "react-icons/md";

const ORG_ID = "PIHSOPA";

export default function RegCodeGen() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState(""); 
  const [copying, setCopying] = useState(null);
  const [membershipId, setMembershipId] = useState("");
  
  // States for Inline Editing
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const fetchCodes = async () => {
    try {
      const q = query(collection(db, "reg_codes"), where("orgId", "==", ORG_ID));
      const snap = await getDocs(q);
      setCodes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

 const generateNewCode = async (e) => {
    e.preventDefault();
    // 1. Force Uppercase and Trim during submission
    const finalMembershipId = membershipId.toUpperCase().trim();

    if (!recipientName.trim() || !finalMembershipId) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const newCode = "SOS-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      await addDoc(collection(db, "reg_codes"), {
        orgId: ORG_ID,
        code: newCode,
        assignedTo: recipientName,
        membershipId: finalMembershipId, // Use the cleaned variable
        status: "active",
        createdAt: serverTimestamp(),
      });
      
      setRecipientName("");
      setMembershipId("");
      fetchCodes(); 
    } catch (err) {
      console.error("Error generating code:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateId = async (codeDocId, oldId) => {
    // 2. Force Uppercase and Trim during update
    const newId = editValue.toUpperCase().trim();
    
    if (!newId || newId === oldId) {
      setEditingId(null);
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      const regCodeRef = doc(db, "reg_codes", codeDocId);
      batch.update(regCodeRef, { membershipId: newId });

      const clientQuery = query(collection(db, "clients"), where("clientId", "==", oldId));
      const clientSnap = await getDocs(clientQuery);

      clientSnap.forEach((clientDoc) => {
        const clientRef = doc(db, "clients", clientDoc.id);
        batch.update(clientRef, { clientId: newId });
      });

      await batch.commit();
      setEditingId(null);
      fetchCodes();
      alert("ID updated successfully.");
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCode = async (id, itemOrgId) => {
    if (itemOrgId !== ORG_ID) return;
    if (confirm("Delete this code?")) {
      try {
        await deleteDoc(doc(db, "reg_codes", id));
        fetchCodes();
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopying(id);
    setTimeout(() => setCopying(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* GENERATOR FORM */}
      <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/10 rounded-2xl">
            <MdVpnKey className="text-yellow-400 text-3xl" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Code Generator</h2>
            <p className="text-indigo-200 text-sm">Assign a Membership ID and generate a registration key.</p>
          </div>
        </div>

        <form onSubmit={generateNewCode} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MdPersonAdd className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-xl" />
            <input 
              type="text"
              placeholder="Recipient Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 text-white placeholder:text-indigo-300 focus:ring-2 focus:ring-yellow-400 outline-none font-bold"
            />
          </div>

          <div className="flex-1 relative">
            <MdVpnKey className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-xl" />
            <input 
              type="text"
              placeholder="Membership ID"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value.toUpperCase())}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 text-white placeholder:text-indigo-300 focus:ring-2 focus:ring-yellow-400 outline-none font-bold"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="bg-yellow-400 text-indigo-950 px-8 py-4 rounded-2xl font-black uppercase hover:bg-white transition-all disabled:opacity-50"
          >
            {loading ? <MdRefresh className="animate-spin" /> : "Generate"}
          </button>
        </form>
      </div>

      {/* KEYS TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Membership ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Key</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/30 transition group">
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                          className="w-32 p-1 border-2 border-yellow-400 rounded bg-white text-sm font-bold outline-none"
                          autoFocus
                        />
                        <button onClick={() => handleUpdateId(item.id, item.membershipId)} className="text-green-600 hover:scale-110"><MdSave size={20}/></button>
                        <button onClick={() => setEditingId(null)} className="text-red-400 hover:scale-110"><MdClose size={20}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/id">
                        <span className="text-sm font-black text-gray-700">{item.membershipId || "-"}</span>
                        <button 
                          onClick={() => { setEditingId(item.id); setEditValue(item.membershipId || ""); }}
                          className="opacity-0 group-hover/id:opacity-100 text-indigo-400 hover:text-indigo-600 transition"
                        >
                          <MdEdit size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600 capitalize">{item.assignedTo}</td>
                  <td className="px-6 py-4 font-mono font-black text-indigo-600 uppercase">{item.code}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {item.status === 'active' ? 'AVAILABLE' : 'USED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => copyToClipboard(item.code, item.id)} className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-indigo-600 hover:text-white transition shadow-sm">
                        {copying === item.id ? <MdCheckCircle /> : <MdContentCopy />}
                      </button>
                      <button onClick={() => deleteCode(item.id, item.orgId)} className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-red-600 hover:text-white transition shadow-sm">
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}