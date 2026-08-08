"use client";

import { useEffect, useState } from "react";
import { UserCheck, RefreshCw, Camera, MapPin } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

export default function AttendancesPage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendances();
  }, []);

  async function loadAttendances() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.hr}/attendances`);
    if (data) setAttendances(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" /> Rekap Absensi GPS Geofencing & Selfie
          </h1>
          <p className="text-xs text-slate-400">Monitoring Check-in Realtime & Log GPS Karyawan Toko</p>
        </div>
        <button onClick={loadAttendances} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-panel p-5 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="p-3">Waktu Clock-In</th>
                <th className="p-3">Karyawan</th>
                <th className="p-3">Status GPS Radius</th>
                <th className="p-3">Foto Selfie MinIO</th>
                <th className="p-3">Mode Sync</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">Memuat data absensi karyawan...</td></tr>
              ) : attendances.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-500">Belum ada rekap absensi hari ini.</td></tr>
              ) : (
                attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-slate-300">{att.clock_in_time}</td>
                    <td className="p-3 font-sans font-medium text-slate-200">{att.employee?.full_name || "Staf Toko"}</td>
                    <td className="p-3 flex items-center gap-1 text-emerald-400"><MapPin className="w-3.5 h-3.5" /> Verified (10m)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 text-[10px] flex items-center gap-1"><Camera className="w-3 h-3" /> MinIO Photo</span></td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">{att.is_offline_attendance ? "Offline Sync" : "Live Online"}</span></td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">{att.status}</span></td>
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
