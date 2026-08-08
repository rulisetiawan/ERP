"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function COAPage() {
  const [coas, setCoas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCOA();
  }, []);

  async function loadCOA() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.finance}/coa`);
    if (data) setCoas(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Chart of Accounts (CoA)
          </h1>
          <p className="text-xs text-slate-400">Master Chart of Accounts Akuntansi & Pengelompokan Akun Perusahaan</p>
        </div>
        <button onClick={loadCOA} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Kode Akun</th>
                <th className="p-3">Nama Akun</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Saldo Normal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-slate-500">Memuat Chart of Accounts...</td></tr>
              ) : coas.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-slate-500">Belum ada akun CoA.</td></tr>
              ) : (
                coas.map((coa) => (
                  <tr key={coa.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-blue-400">{coa.code}</td>
                    <td className="p-3 font-sans font-medium text-slate-200">{coa.name}</td>
                    <td className="p-3 text-slate-300">{coa.category}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{coa.normal_balance}</span></td>
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
