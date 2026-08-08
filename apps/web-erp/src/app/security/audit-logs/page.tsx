"use client";

import { useState } from "react";
import { ShieldCheck, FileText, Search, Download, Filter, Eye, RefreshCw, X, ArrowRight } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  service: string;
  action: string;
  resource: string;
  user: string;
  role: string;
  ip: string;
  status: string;
  beforeSnapshot: any;
  afterSnapshot: any;
}

export default function SystemAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("Semua");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [notification, setNotification] = useState("");

  const [logs] = useState<AuditLog[]>([
    {
      id: "log-101",
      timestamp: new Date().toLocaleString("id-ID"),
      service: "pos-service",
      action: "order_created",
      resource: "SalesOrder #POS-2026-88401",
      user: "Budi Kasir",
      role: "Kasir / Staf POS",
      ip: "192.168.1.15",
      status: "SUCCESS",
      beforeSnapshot: { cart_items: 0, total: 0 },
      afterSnapshot: { cart_items: 2, total: 769500, payment_method: "QRIS", proof_verified: true },
    },
    {
      id: "log-102",
      timestamp: new Date(Date.now() - 1800000).toLocaleString("id-ID"),
      service: "inventory-service",
      action: "opname_adjusted",
      resource: "StockOpname #SKU-SHOE-NK-42",
      user: "Rulli Setiawan",
      role: "Owner / Super Administrator",
      ip: "192.168.1.10",
      status: "SUCCESS",
      beforeSnapshot: { stock_system: 20, min_stock: 5 },
      afterSnapshot: { stock_physical: 4, min_stock: 10, delta: -16, reason: "Barang Terjual POS & Terpakai" },
    },
    {
      id: "log-103",
      timestamp: new Date(Date.now() - 3600000).toLocaleString("id-ID"),
      service: "auth-service",
      action: "role_permissions_updated",
      resource: "UserRole #store_manager",
      user: "Rulli Setiawan",
      role: "Owner / Super Administrator",
      ip: "192.168.1.10",
      status: "SUCCESS",
      beforeSnapshot: { role: "store_manager", can_view_buy_price: true },
      afterSnapshot: { role: "store_manager", can_view_buy_price: false, updated_by: "Owner" },
    },
    {
      id: "log-104",
      timestamp: new Date(Date.now() - 7200000).toLocaleString("id-ID"),
      service: "finance-service",
      action: "journal_posted",
      resource: "JournalEntry #JRN-2026-004",
      user: "Siti Rahmawati",
      role: "Store Manager (Operasional)",
      ip: "192.168.1.22",
      status: "SUCCESS",
      beforeSnapshot: { status: "DRAFT", debit: 0 },
      afterSnapshot: { status: "POSTED", debit: 14500000, credit: 14500000, account: "5-1001 HPP" },
    },
    {
      id: "log-105",
      timestamp: new Date(Date.now() - 10800000).toLocaleString("id-ID"),
      service: "inventory-service",
      action: "stock_transferred",
      resource: "StockTransfer #TRF-9921",
      user: "Andi Wijaya",
      role: "Staf Gudang & Logistik",
      ip: "192.168.1.35",
      status: "SUCCESS",
      beforeSnapshot: { origin: "Gudang Utama", dest: "Outlet Jakpus", qty: 0 },
      afterSnapshot: { origin: "Gudang Utama", dest: "Outlet Jakpus", qty: 50, sku: "SKU-MILK-01" },
    },
  ]);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = selectedService === "Semua" || l.service === selectedService;
    return matchesSearch && matchesService;
  });

  function handleExportAuditLogs() {
    let csv = "data:text/csv;charset=utf-8,ID,Timestamp,Service,Action,Resource,User,Role,IP,Status\n";
    filteredLogs.forEach((l) => {
      csv += `${l.id},${l.timestamp},${l.service},${l.action},${l.resource},${l.user},${l.role},${l.ip},${l.status}\n`;
    });
    const uri = encodeURI(csv);
    const link = document.createElement("a");
    link.href = uri;
    link.download = `Audit_Trail_Logs_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    setNotification("Log Audit Trail Berhasil Di-export ke File CSV!");
    setTimeout(() => setNotification(""), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> Central Executive Audit Trail Logs Engine
          </h1>
          <p className="text-xs text-slate-400">Monitoring Log Jejak Audit Aktivitas User (Before/After JSON Diff Inspector)</p>
        </div>

        <button
          onClick={handleExportAuditLogs}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export Log Audit (CSV)
        </button>
      </div>

      {/* Filters & Search Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari User, Action, Resource Target, IP Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="Semua">Semua Service Microservices</option>
            <option value="pos-service">pos-service</option>
            <option value="inventory-service">inventory-service</option>
            <option value="auth-service">auth-service</option>
            <option value="finance-service">finance-service</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Waktu Audit</th>
                <th className="p-3">Microservice</th>
                <th className="p-3">Aksi User</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">Pelaku (User & Role)</th>
                <th className="p-3">IP Address</th>
                <th className="p-3 text-center">Before/After Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-950/60">
                  <td className="p-3 text-slate-400 text-[11px]">{l.timestamp}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                      {l.service}
                    </span>
                  </td>
                  <td className="p-3 text-emerald-400 font-bold">{l.action}</td>
                  <td className="p-3 text-slate-200 font-sans font-bold">{l.resource}</td>
                  <td className="p-3 font-sans">
                    <p className="font-bold text-slate-100">{l.user}</p>
                    <p className="text-[10px] text-slate-500">{l.role}</p>
                  </td>
                  <td className="p-3 text-slate-400">{l.ip}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedLog(l)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-sans text-blue-400 hover:text-white flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspeksi JSON Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Before/After Diff Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" /> Audit Log JSON Diff Inspector
                </h3>
                <p className="text-xs text-slate-400">
                  Ref ID: <span className="text-blue-400 font-mono font-bold">{selectedLog.id}</span> • User:{" "}
                  <span className="text-slate-200 font-bold">{selectedLog.user}</span> ({selectedLog.ip})
                </p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* Before Snapshot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-rose-500/20 border border-rose-500/30 text-rose-300 p-2 rounded-xl">
                  <span className="font-bold">BEFORE Snapshot (Sebelum)</span>
                  <span className="text-[10px]">OLD STATE</span>
                </div>
                <pre className="p-3 bg-slate-950 border border-rose-500/30 rounded-xl text-rose-300 text-[11px] overflow-x-auto h-48">
                  {JSON.stringify(selectedLog.beforeSnapshot, null, 2)}
                </pre>
              </div>

              {/* After Snapshot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-2 rounded-xl">
                  <span className="font-bold">AFTER Snapshot (Sesudah)</span>
                  <span className="text-[10px]">NEW STATE</span>
                </div>
                <pre className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px] overflow-x-auto h-48">
                  {JSON.stringify(selectedLog.afterSnapshot, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Tutup Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
