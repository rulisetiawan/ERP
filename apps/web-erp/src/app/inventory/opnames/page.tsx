"use client";

import { useState } from "react";
import { RotateCcw, CheckCircle2, AlertTriangle, FileText, Camera, ArrowRight } from "lucide-react";

export default function StockOpnamePage() {
  const [opnames] = useState([
    {
      id: "opname-1",
      number: "SOP-20260807-991A",
      warehouse: "Outlet Jakarta Pusat",
      status: "adjusted",
      date: "07 Aug 2026 10:15",
      totalItems: 45,
      varianceTotal: "-Rp 36.000 (Selisih -2 Pcs)",
      items: [
        { name: "Susu UHT 1L", snapshot: 47, salesDelta: 2, physical: 43, variance: -2, lossRupiah: "-Rp 36.000", photoMinio: "https://minio.local/damaged/susu.jpg" },
        { name: "Roti Tawar 500g", snapshot: 3, salesDelta: 0, physical: 3, variance: 0, lossRupiah: "Rp 0", photoMinio: "" },
      ],
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Stock Opname Delta Compensation</h1>
          <p className="text-xs text-slate-400">Rekonsiliasi stok fisik vs sistem saat jam operasional toko berlangsung</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors">
          + Sesi Opname Baru
        </button>
      </div>

      {/* Opname Cards */}
      {opnames.map((op) => (
        <div key={op.id} className="glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 font-mono text-xs">
                {op.number}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{op.warehouse}</h3>
                <p className="text-[11px] text-slate-400">{op.date} • {op.totalItems} SKU Diperiksa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                Status: Adjusted
              </span>
              <button className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Rollback / Restore Stok
              </button>
            </div>
          </div>

          {/* Opname Item Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="p-2.5">Nama Produk</th>
                  <th className="p-2.5 text-center">Stok Snapshot</th>
                  <th className="p-2.5 text-center">Penjualan Saat Opname</th>
                  <th className="p-2.5 text-center">Stok Efektif</th>
                  <th className="p-2.5 text-center">Fisik HP (Scanner)</th>
                  <th className="p-2.5 text-center">Selisih (Variance)</th>
                  <th className="p-2.5 text-right">Nilai Kerugian</th>
                  <th className="p-2.5 text-center">Foto Barang Rusak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {op.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-medium text-slate-200">{item.name}</td>
                    <td className="p-2.5 text-center font-mono">{item.snapshot} Pcs</td>
                    <td className="p-2.5 text-center font-mono text-blue-400">-{item.salesDelta} Pcs</td>
                    <td className="p-2.5 text-center font-mono text-slate-400">{item.snapshot - item.salesDelta} Pcs</td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-100">{item.physical} Pcs</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.variance === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {item.variance} Pcs
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-semibold text-rose-400">{item.lossRupiah}</td>
                    <td className="p-2.5 text-center">
                      {item.photoMinio ? (
                        <button className="px-2 py-1 rounded bg-slate-800 text-blue-400 text-[10px] flex items-center justify-center gap-1 mx-auto">
                          <Camera className="w-3 h-3" /> MinIO Photo
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
