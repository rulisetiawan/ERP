"use client";

import { useEffect, useState } from "react";
import { Truck, RefreshCw } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.purchasing}/orders`);
    if (data) setOrders(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" /> Management Purchase Orders (PO)
          </h1>
          <p className="text-xs text-slate-400">Pengadaan & Pembelian Stok Barang Ke Vendor</p>
        </div>
        <button onClick={loadOrders} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">No. PO</th>
                <th className="p-3">Vendor ID</th>
                <th className="p-3">Gudang Tujuan</th>
                <th className="p-3">Total Nominal</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Memuat Purchase Orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Belum ada Purchase Order (PO).</td></tr>
              ) : (
                orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-blue-400">{po.po_number}</td>
                    <td className="p-3 text-slate-300">{po.vendor_id}</td>
                    <td className="p-3 text-slate-300">{po.warehouse_id}</td>
                    <td className="p-3 font-bold text-emerald-400">Rp {po.total_amount?.toLocaleString("id-ID")}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">{po.status}</span></td>
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
