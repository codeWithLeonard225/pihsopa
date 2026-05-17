"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { 
  collection, addDoc, getDocs, query, 
  serverTimestamp, deleteDoc, doc, where, updateDoc, writeBatch 
} from "firebase/firestore";
import { 
  MdVpnKey, MdRefresh, MdDelete, 
  MdContentCopy, MdCheckCircle, MdPersonAdd, MdEdit, MdClose, MdSave, MdBusiness 
} from "react-icons/md";

export default function RegCodeGen() {
  // ⭐ MULTI-TENANT CONFIGURATION
  const [currentOrg, setCurrentOrg] = useState("PIHSOPA"); // Active tracking scope
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState(""); 
  const [copying, setCopying] = useState(null);
  const [membershipId, setMembershipId] = useState("");
  
  // States for Inline Editing
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Available Tenant Systems 
  const organizations = [
    { id: "PIHSOPA", name: "Providence Intl (PIHSOPA)", codePrefix: "PIHS-" },
    { id: "SHERGOSA", name: "SOS Hermann (SHERGOSA)", codePrefix: "SHER-" },
    { id: "RURAL_SCHOOL", name: "Rural School System", codePrefix: "RURL-" },
    { id: "LIL_OTHERS", name: "Lil Others Finance", codePrefix: "LILO-" }
  ];

  // Get current active organization configuration setup
  const activeConfig = organizations.find(o => o.id === currentOrg) || organizations[0];

  const fetchCodes = async () => {
    try {
      // Pull registers filtered dynamically by the chosen tenant index scope
      const q = query(collection(db, "reg_codes"), where("orgId", "==", currentOrg));
      const snap = await getDocs(q);
      setCodes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Re-fetch instantly whenever the administrator switches tenants
  useEffect(() => {
    fetchCodes();
  }, [currentOrg]);

 const generateNewCode = async (e) => {
    e.preventDefault();
    const finalMembershipId = membershipId.toUpperCase().trim();

    if (!recipientName.trim() || !finalMembershipId) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // 1. ⭐ CHECK IF THE MEMBERSHIP ID ALREADY EXISTS FOR THIS ORGANISATION
      const duplicateQuery = query(
        collection(db, "reg_codes"), 
        where("orgId", "==", currentOrg),
        where("membershipId", "==", finalMembershipId)
      );
      
      const duplicateSnap = await getDocs(duplicateQuery);
      
      if (!duplicateSnap.empty) {
        // If snapshot is not empty, it means the ID already exists
        alert(`The Membership ID "${finalMembershipId}" has already been allocated in this system registry.`);
        setLoading(false);
        return; 
      }
      
      // 2. ⭐ Dynamic unique validation code generated using the tenant's custom prefix
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newCode = `${activeConfig.codePrefix}${randomString}`;

      // 3. PROCEED TO ADD DOCUMENT IF UNIQUE
      await addDoc(collection(db, "reg_codes"), {
        orgId: currentOrg,          // ⭐ Dynamic System Tenant Marker
        code: newCode,              // Parsed custom identifier prefix
        assignedTo: recipientName.trim(),
        membershipId: finalMembershipId, 
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
    if (itemOrgId !== currentOrg) return;
    if (confirm("Delete this validation token code?")) {
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
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      
      {/* ⭐ MULTI-TENANT SWITCHER BAR */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700">
          <MdBusiness className="text-xl text-indigo-600" />
          <span className="text-xs font-black uppercase tracking-wider">Viewing System Registry:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setCurrentOrg(org.id);
                setEditingId(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                currentOrg === org.id 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      </div>

      {/* GENERATOR FORM */}
      <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 p-6 opacity-10 text-7xl font-black select-none pointer-events-none">
          {activeConfig.id}
        </div>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-3 bg-white/10 rounded-2xl">
            <MdVpnKey className="text-yellow-400 text-3xl" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Code Generator ({activeConfig.id})</h2>
            <p className="text-indigo-200 text-sm">Assign a Membership ID for {activeConfig.name}.</p>
          </div>
        </div>

        <form onSubmit={generateNewCode} className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative">
            <MdPersonAdd className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-xl" />
            <input 
              type="text"
              placeholder="Recipient Full Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 text-white placeholder:text-indigo-300 focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm"
            />
          </div>

          <div className="flex-1 relative">
            <MdVpnKey className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-xl" />
            <input 
              type="text"
              placeholder={`ID (e.g. ${activeConfig.codePrefix}2010-2012)`}
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 text-white placeholder:text-indigo-300 focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm uppercase"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="bg-yellow-400 text-indigo-950 px-8 py-4 rounded-2xl font-black uppercase hover:bg-white transition-all disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {loading ? <MdRefresh className="animate-spin" /> : "Generate Key"}
          </button>
        </form>
      </div>

      {/* KEYS TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Registered Batches ({codes.length} active allocation records)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Membership ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Key</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 font-medium text-sm">
                    No access key logs found for this tenant registry.
                  </td>
                </tr>
              ) : (
                codes.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition group">
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                            className="w-40 p-1.5 border-2 border-yellow-400 rounded bg-white text-xs font-bold outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleUpdateId(item.id, item.membershipId)} className="text-green-600 hover:scale-110"><MdSave size={18}/></button>
                          <button onClick={() => setEditingId(null)} className="text-red-400 hover:scale-110"><MdClose size={18}/></button>
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
                    <td className="px-6 py-4 font-mono font-black text-indigo-600 uppercase tracking-wider text-sm">{item.code}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wide ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        {item.status === 'active' ? 'AVAILABLE' : 'USED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => copyToClipboard(item.code, item.id)} className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-indigo-600 hover:text-white transition shadow-sm">
                          {copying === item.id ? <MdCheckCircle size={16} /> : <MdContentCopy size={16} />}
                        </button>
                        <button onClick={() => deleteCode(item.id, item.orgId)} className="p-2 bg-gray-100 rounded-lg text-gray-500 hover:bg-red-600 hover:text-white transition shadow-sm">
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}