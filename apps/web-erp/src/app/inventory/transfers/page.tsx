"use client";

import { useState } from "react";
import { ArrowRightLeft, Plus } from "lucide-react";

export default function StockTransfersPage() {
  const [transfers] = useState([
    { id: "TRF-001", from: "Gudang Utama Pusat", to: "Outlet Jakarta Pusat", item: "Susu UHT 1L (50 Pcs)", status: "Completed", date: "07 Aug 2026" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" /> Transfer Stok Antar Gudang & Outlet
          </h1>
          <p className="text-xs text-slate-400">Pengiriman & Mutasi Produk Inter-Cabang Toko</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white">
          + Buat Transfer Stok Baru
        </button>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">No. Transfer</th>
                <th className="p-3">Gudang Asal</th>
                <th className="p-3">Tujuan Outlet</th>
                <th className="p-3">Rincian Item</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-blue-400">{t.id}</td>
                  <td className="p-3 text-slate-200">{t.from}</td>
                  <td className="p-3 text-slate-200">{t.to}</td>
                  <td className="p-3 text-slate-400">{t.item}</td>
                  <td className="p-3 text-slate-400">{t.date}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                      {t.status}
                    </span>
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
