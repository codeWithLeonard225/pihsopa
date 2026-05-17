"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  where
} from "firebase/firestore";
import { MdPayments, MdPerson, MdAttachMoney, MdEventNote, MdHistory } from "react-icons/md";

const ORG_ID = "PIHSOPA";

export default function ContributionPage() {
  const [clients, setClients] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [selectedClient, setSelectedClient] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // 1. Load Clients for the Dropdown & Recent Contributions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Clients
     const clientQuery = query(
  collection(db, "clients"),
  where("orgId", "==", ORG_ID)
);

const clientSnap = await getDocs(clientQuery);
        setClients(clientSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Recent Contributions
       const contribQuery = query(
  collection(db, "contributions"),
  where("orgId", "==", ORG_ID),
  // orderBy("createdAt", "desc")
);
        const contribSnap = await getDocs(contribQuery);
        setContributions(contribSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient || !amount) return alert("Please fill all fields");

    setLoading(true);
    const client = clients.find(c => c.clientId === selectedClient);
    
    const monthsCovered = parseFloat(amount) / 50;

    const paymentData = {
      clientId: client.clientId,
      fullname: client.fullname,
      amount: parseFloat(amount),
      paymentDate: date,
      monthsCovered: monthsCovered.toFixed(1),
      createdAt: new Date(), // Using local date for the immediate UI update
    };

    try {
      // 1. Save to Firebase and get the reference back
     await addDoc(collection(db, "contributions"), {
  ...paymentData,
  orgId: ORG_ID,
  createdAt: serverTimestamp(),
});

      alert(`Payment of NLE ${amount} recorded for ${client.fullname}`);
      
      // 2. ⭐ THE FIX: Include the new ID from docRef.id so React has a unique key
  setContributions([{ id: docRef.id, orgId: ORG_ID, ...paymentData }, ...contributions]);

      // Reset Form
      setAmount("");
      setSelectedClient("");
      
    } catch (err) {
      console.error(err);
      alert("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* SECTION 1: RECORD PAYMENT FORM */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            <MdPayments size={24} />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Record Contribution</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Client Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
              <MdPerson /> Select Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Choose a registered member...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.clientId}>
                  {c.fullname} ({c.clientId})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-1">
              <MdAttachMoney /> Amount (NLE)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 150"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            {amount && (
              <p className="text-[10px] mt-1 text-green-600 font-bold uppercase tracking-wider">
                Covers {(parseFloat(amount) / 50).toFixed(1)} Months
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            {loading ? "Processing..." : "Submit Payment"}
          </button>
        </form>
      </div>

      {/* SECTION 2: CONTRIBUTION HISTORY TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-2">
          <MdHistory className="text-gray-400" size={20} />
          <h3 className="font-bold text-gray-700">Recent Payment Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">ID Number</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Coverage</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contributions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-bold text-gray-800">{item.fullname}</td>
                  <td className="px-6 py-4 font-mono text-sm text-indigo-600">{item.clientId}</td>
                  <td className="px-6 py-4 font-black text-green-700">NLE {item.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">
                      {item.monthsCovered} MONTHS
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {item.paymentDate}
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