"use client";

import { useState } from "react";
import { DollarSign, FileText, Play } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function PayrollProcessingPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(8);
  const [year, setYear] = useState(2026);

  async function handleRunPayroll() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URLS.hr}/payrolls/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period_month: month, period_year: year }),
      });
      const json = await res.json();
      if (json.data) setPayrolls(json.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Pemrosesan Payroll Gaji (Batch 1-Click)
          </h1>
          <p className="text-xs text-slate-400">Pengolahan Gaji Pokok, Tunjangan, & Potongan Karyawan</p>
        </div>
        <button
          onClick={handleRunPayroll}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Play className="w-3.5 h-3.5" /> {loading ? "Memproses Batch Payroll..." : "JALANKAN BATCH PAYROLL SEKARANG"}
        </button>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Periode</th>
                <th className="p-3">Gaji Pokok</th>
                <th className="p-3">Tunjangan</th>
                <th className="p-3">Potongan BPJS & Pajak</th>
                <th className="p-3">Gaji Bersih (Take Home Pay)</th>
                <th className="p-3">PDF Slip Gaji MinIO</th>
                <th className="p-3">Status Transfer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {payrolls.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-slate-500">Klik 'JALANKAN BATCH PAYROLL' untuk memproses gaji bulan ini.</td></tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-slate-300">{p.period_month}/{p.period_year}</td>
                    <td className="p-3">Rp {p.base_salary?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-emerald-400">+Rp {p.allowances?.toLocaleString("id-ID")}</td>
                    <td className="p-3 text-rose-400">-Rp {p.deductions?.toLocaleString("id-ID")}</td>
                    <td className="p-3 font-bold text-emerald-400 text-sm">Rp {p.net_salary?.toLocaleString("id-ID")}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 text-[10px] flex items-center gap-1"><FileText className="w-3 h-3" /> Auto Slip PDF</span></td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">{p.payment_status}</span></td>
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
