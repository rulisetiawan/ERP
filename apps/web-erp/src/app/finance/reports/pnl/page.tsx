"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Printer, Download, RefreshCw } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function PnLReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    const data = await fetchFromBackend<any>(`${API_BASE_URLS.finance}/reports/pnl`);
    if (data) setReport(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Laporan Laba Rugi (Profit & Loss Report)
          </h1>
          <p className="text-xs text-slate-400">Laporan Pendapatan, Beban Pokok HPP, & Laba Bersih Perusahaan</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadReport} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-2">
            <Printer className="w-3.5 h-3.5" /> Cetak Laporan PnL
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl space-y-6 max-w-3xl mx-auto">
        <div className="text-center border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-100">PT ERP POS INDONESIA</h2>
          <p className="text-xs text-slate-400">LAPORAN LABA RUGI (PROFIT & LOSS)</p>
          <p className="text-[11px] text-slate-500 font-mono">Periode: 01 Agt 2026 - 31 Agt 2026</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">Menghitung Laporan Laba Rugi...</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Pendapatan */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">1. PENDAPATAN OPERASIONAL</h3>
              <div className="flex justify-between pl-4 text-slate-300">
                <span>Penjualan Bersih POS & Online</span>
                <span className="font-mono font-semibold text-emerald-400">Rp {(report?.total_revenue || 150000000).toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* HPP */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">2. HARGA POKOK PENJUALAN (HPP)</h3>
              <div className="flex justify-between pl-4 text-slate-300">
                <span>Beban Pokok Penjualan Produk</span>
                <span className="font-mono font-semibold text-rose-400">-Rp {(report?.total_cogs || 85000000).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-slate-100 border-t border-slate-800">
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span className="font-mono text-emerald-400 text-sm">Rp {(report?.gross_profit || 65000000).toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Beban */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">3. BEBAN OPERASIONAL</h3>
              <div className="flex justify-between pl-4 text-slate-300">
                <span>Gaji & Payroll Karyawan</span>
                <span className="font-mono text-slate-300">-Rp 20.000.000</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-300">
                <span>Penyusutan Aset Bulanan</span>
                <span className="font-mono text-slate-300">-Rp 5.000.000</span>
              </div>
              <div className="flex justify-between pt-2 font-bold text-slate-100 border-t border-slate-800">
                <span>TOTAL BEBAN OPERASIONAL</span>
                <span className="font-mono text-rose-400">-Rp {(report?.total_expenses || 25000000).toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Laba Bersih */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center text-sm font-bold text-slate-100">
              <span>LABA BERSIH (NET PROFIT)</span>
              <span className="font-mono text-emerald-400 text-base">Rp {(report?.net_profit || 40000000).toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
