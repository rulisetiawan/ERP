"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, RefreshCw, RotateCcw } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function GeneralLedgerJournalsPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJournals();
  }, []);

  async function loadJournals() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.finance}/journals`);
    if (data) setJournals(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> General Ledger Jurnal Umum Akuntansi
          </h1>
          <p className="text-xs text-slate-400">Buku Jurnal Umum Ledger & Pencatatan Transaksi Keuangan</p>
        </div>
        <button onClick={loadJournals} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">No. Jurnal</th>
                <th className="p-3">Tipe Referensi</th>
                <th className="p-3">Tanggal Jurnal</th>
                <th className="p-3">Deskripsi Transaksi</th>
                <th className="p-3">Rincian Item (Debit / Kredit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Memuat data jurnal keuangan...</td></tr>
              ) : journals.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Belum ada entri jurnal terdaftar.</td></tr>
              ) : (
                journals.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-blue-400">{j.journal_number}</td>
                    <td className="p-3 text-slate-300"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{j.ref_type}</span></td>
                    <td className="p-3 text-slate-400">{j.journal_date}</td>
                    <td className="p-3 font-sans text-slate-200">{j.description}</td>
                    <td className="p-3 text-slate-400">{j.journal_items?.length || 0} Akun Berpasangan</td>
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
