"use client";
//app/component/ClientContributionHistory.jsx
import React, { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { MdHistory, MdAccountBalanceWallet, MdEventAvailable, MdTrendingUp } from "react-icons/md";

export default function ClientContributionHistory() {
  const [myRecords, setMyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPaid: 0, totalMonths: 0 });

  useEffect(() => {
    const fetchMyRecords = async () => {
      try {
        const storedUser = localStorage.getItem("hloUser");
        if (!storedUser) {
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(storedUser);

        // ⭐ REMOVED orderBy here to bypass the Index requirement
        const q = query(
          collection(db, "contributions"),
          where("clientId", "==", user.clientId)
          
        );

        const snap = await getDocs(q);
        
        // ⭐ SORT MANUALLY in JS to avoid the Firebase Index Error
        const records = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        const totalAmount = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        const totalMonths = records.reduce((sum, r) => sum + (parseFloat(r.monthsCovered) || 0), 0);

        setMyRecords(records);
        setStats({
          totalPaid: totalAmount,
          totalMonths: totalMonths.toFixed(1),
        });
      } catch (err) {
        console.error("Error fetching records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecords();
  }, []); // Empty array is stable, prevents the "size changed" error

  if (loading) return <div className="p-10 text-center animate-pulse font-bold text-indigo-400">Loading your financial records...</div>;

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-indigo-600">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <MdAccountBalanceWallet /> <span className="text-xs font-bold uppercase">Total Contributed</span>
          </div>
          <p className="text-2xl font-black text-gray-800">NLE {stats.totalPaid}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <MdTrendingUp /> <span className="text-xs font-bold uppercase">Months Covered</span>
          </div>
          <p className="text-2xl font-black text-gray-800">{stats.totalMonths} Months</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-orange-500">
          <div className="flex items-center gap-3 text-gray-400 mb-2">
            <MdEventAvailable /> <span className="text-xs font-bold uppercase">Status</span>
          </div>
          <p className="text-2xl font-black text-green-600">Active</p>
        </div>
      </div>

      {/* 2. Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex items-center gap-2">
          <MdHistory className="text-indigo-600" size={20} />
          <h3 className="font-black text-gray-700 uppercase tracking-tighter">Your Payment History</h3>
        </div>
        
        {myRecords.length === 0 ? (
          <div className="p-20 text-center text-gray-400">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{item.paymentDate}</td>
                    <td className="px-6 py-4 font-black text-gray-800 text-sm">NLE {item.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">
                        +{item.monthsCovered} MONTHS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}