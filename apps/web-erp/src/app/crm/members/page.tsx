"use client";

import { useEffect, useState } from "react";
import { QrCode, RefreshCw } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function MembersDirectoryPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.crm}/members`);
    if (data) setMembers(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" /> Directory Member & Poin Loyalty
          </h1>
          <p className="text-xs text-slate-400">Pengelolaan Database Pelanggan & Program Membership Loyalty</p>
        </div>
        <button onClick={loadMembers} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Kode Member</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Saldo Poin Loyalty</th>
                <th className="p-3">Total Belanja (Akumulasi)</th>
                <th className="p-3">Status Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Memuat data member pelanggan...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Belum ada member terdaftar.</td></tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-blue-400">{m.member_code}</td>
                    <td className="p-3 text-slate-400">{m.user_id}</td>
                    <td className="p-3 font-bold text-emerald-400">{m.total_points} Poin</td>
                    <td className="p-3 text-slate-200">Rp {m.total_spent?.toLocaleString("id-ID")}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase font-bold">{m.current_tier}</span></td>
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
