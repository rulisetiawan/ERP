"use client";

import { useState } from "react";
import { ShieldCheck, Plus, Check, X, Users, Lock, Edit, CheckCircle2, Sliders, ShieldAlert } from "lucide-react";

interface RolePermission {
  roleId: string;
  roleName: string;
  roleDesc: string;
  userCount: number;
  permissions: Record<string, { read: boolean; write: boolean; delete: boolean; export: boolean; ownerPrice: boolean }>;
}

export default function RolesPermissionsPage() {
  const [notification, setNotification] = useState("");
  const [activeTab, setActiveTab] = useState<"matrix" | "users">("matrix");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RolePermission | null>(null);

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const modules = [
    { key: "pos", name: "Terminal POS Kasir" },
    { key: "products", name: "Katalog Produk & Variasi" },
    { key: "movements", name: "Stok Opname & Mutasi Gudang" },
    { key: "reports", name: "Laporan Analytics Eksekutif" },
    { key: "finance", name: "Keuangan CoA & Jurnal General" },
    { key: "buy_price", name: "Harga Beli Modal (Hak Privasi Owner)" },
    { key: "customers", name: "Pelanggan & Poin Loyalty" },
    { key: "settings", name: "Pengaturan Parameter & Role Users" },
  ];

  const [roles, setRoles] = useState<RolePermission[]>([
    {
      roleId: "r1",
      roleName: "Owner / Super Administrator",
      roleDesc: "Hak akses penuh seluruh sistem, laporan finansial, & harga beli modal",
      userCount: 2,
      permissions: {
        pos: { read: true, write: true, delete: true, export: true, ownerPrice: true },
        products: { read: true, write: true, delete: true, export: true, ownerPrice: true },
        movements: { read: true, write: true, delete: true, export: true, ownerPrice: true },
        reports: { read: true, write: true, delete: true, export: true, ownerPrice: true },
        finance: { read: true, write: true, delete: true, export: true, ownerPrice: true },
        buy_price: { read: true, write: true, delete: true, export: true, ownerPrice: true },
        customers: { read: true, write: true, delete: true, export: true, ownerPrice: true },
        settings: { read: true, write: true, delete: true, export: true, ownerPrice: true },
      },
    },
    {
      roleId: "r2",
      roleName: "Store Manager (Operasional)",
      roleDesc: "Kelola stok opname, produk, & transaksi POS tanpa akses harga beli modal",
      userCount: 4,
      permissions: {
        pos: { read: true, write: true, delete: false, export: true, ownerPrice: false },
        products: { read: true, write: true, delete: false, export: true, ownerPrice: false },
        movements: { read: true, write: true, delete: false, export: true, ownerPrice: false },
        reports: { read: true, write: false, delete: false, export: true, ownerPrice: false },
        finance: { read: true, write: false, delete: false, export: false, ownerPrice: false },
        buy_price: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        customers: { read: true, write: true, delete: false, export: true, ownerPrice: false },
        settings: { read: false, write: false, delete: false, export: false, ownerPrice: false },
      },
    },
    {
      roleId: "r3",
      roleName: "Kasir / Staf POS",
      roleDesc: "Akses khusus transaksi kasir POS, pembatalan order & voucher promo",
      userCount: 15,
      permissions: {
        pos: { read: true, write: true, delete: false, export: false, ownerPrice: false },
        products: { read: true, write: false, delete: false, export: false, ownerPrice: false },
        movements: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        reports: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        finance: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        buy_price: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        customers: { read: true, write: true, delete: false, export: false, ownerPrice: false },
        settings: { read: false, write: false, delete: false, export: false, ownerPrice: false },
      },
    },
    {
      roleId: "r4",
      roleName: "Staf Gudang & Logistik",
      roleDesc: "Akses mutasi stok barang masuk, barang keluar, & opname fisik gudang",
      userCount: 6,
      permissions: {
        pos: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        products: { read: true, write: true, delete: false, export: false, ownerPrice: false },
        movements: { read: true, write: true, delete: true, export: true, ownerPrice: false },
        reports: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        finance: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        buy_price: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        customers: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        settings: { read: false, write: false, delete: false, export: false, ownerPrice: false },
      },
    },
  ]);

  const [users, setUsers] = useState([
    { id: "u1", name: "Rulli Setiawan", email: "rulli@enterprise.com", role: "Owner / Super Administrator", outlet: "Semua Cabang Toko", status: "Active" },
    { id: "u2", name: "Budi Santoso", email: "budi.kasir@enterprise.com", role: "Kasir / Staf POS", outlet: "Outlet Jakpus #01", status: "Active" },
    { id: "u3", name: "Siti Rahmawati", email: "siti.manager@enterprise.com", role: "Store Manager (Operasional)", outlet: "Outlet Jakbar #02", status: "Active" },
    { id: "u4", name: "Andi Wijaya", email: "andi.gudang@enterprise.com", role: "Staf Gudang & Logistik", outlet: "Gudang Utama Jakpus", status: "Active" },
  ]);

  const togglePermission = (roleId: string, modKey: string, permType: "read" | "write" | "delete" | "export" | "ownerPrice") => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.roleId === roleId) {
          const current = role.permissions[modKey] || { read: false, write: false, delete: false, export: false, ownerPrice: false };
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [modKey]: {
                ...current,
                [permType]: !current[permType],
              },
            },
          };
        }
        return role;
      })
    );
    setNotification("Matriks Hak Akses Berhasil Diperbarui!");
    setTimeout(() => setNotification(""), 3000);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: RolePermission = {
      roleId: `r-${Date.now()}`,
      roleName: newRoleName,
      roleDesc: newRoleDesc || "Role kustom pengguna",
      userCount: 0,
      permissions: {
        pos: { read: true, write: false, delete: false, export: false, ownerPrice: false },
        products: { read: true, write: false, delete: false, export: false, ownerPrice: false },
        movements: { read: true, write: false, delete: false, export: false, ownerPrice: false },
        reports: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        finance: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        buy_price: { read: false, write: false, delete: false, export: false, ownerPrice: false },
        customers: { read: true, write: false, delete: false, export: false, ownerPrice: false },
        settings: { read: false, write: false, delete: false, export: false, ownerPrice: false },
      },
    };

    setRoles((prev) => [...prev, newRole]);
    setNotification(`Role Baru '${newRoleName}' Berhasil Dibuat!`);
    setIsModalOpen(false);
    setNewRoleName("");
    setNewRoleDesc("");
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> Executive Dynamic RBAC Roles & Permissions Engine
          </h1>
          <p className="text-xs text-slate-400">Pengaturan Hak Akses Peran Pengguna, Proteksi Harga Beli Modal, & Scope Cabang</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Buat Role Baru
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit shadow-xl">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "matrix" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" /> Matriks Hak Akses (RBAC)
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "users" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" /> Pengguna & Role Assignment ({users.length})
        </button>
      </div>

      {/* View 1: RBAC Permission Matrix Table */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          {roles.map((role) => (
            <div key={role.roleId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-blue-400" /> {role.roleName}
                  </h3>
                  <p className="text-xs text-slate-400">{role.roleDesc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-500/30">
                    {role.userCount} Pengguna Aktif
                  </span>
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                    <tr>
                      <th className="p-2.5">Modul Sistem</th>
                      <th className="p-2.5 text-center">Read (Lihat)</th>
                      <th className="p-2.5 text-center">Write (Tambah/Edit)</th>
                      <th className="p-2.5 text-center">Delete (Hapus)</th>
                      <th className="p-2.5 text-center">Export (Cetak/XLSX)</th>
                      <th className="p-2.5 text-center">Harga Beli (Modal)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {modules.map((mod) => {
                      const p = role.permissions[mod.key] || { read: false, write: false, delete: false, export: false, ownerPrice: false };
                      return (
                        <tr key={mod.key} className="hover:bg-slate-950/60">
                          <td className="p-2.5 font-sans font-bold text-slate-200">{mod.name}</td>

                          {/* Read Toggle */}
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.read}
                              onChange={() => togglePermission(role.roleId, mod.key, "read")}
                              className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Write Toggle */}
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.write}
                              onChange={() => togglePermission(role.roleId, mod.key, "write")}
                              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Delete Toggle */}
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.delete}
                              onChange={() => togglePermission(role.roleId, mod.key, "delete")}
                              className="rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Export Toggle */}
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.export}
                              onChange={() => togglePermission(role.roleId, mod.key, "export")}
                              className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Owner Price Toggle */}
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.ownerPrice}
                              onChange={() => togglePermission(role.roleId, mod.key, "ownerPrice")}
                              className="rounded bg-slate-950 border-amber-500 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Users & Role Assignment */}
      {activeTab === "users" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-4 h-4 text-blue-400" /> Daftar Pengguna Sistem & Scope Outlet
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="p-3">Nama Pengguna</th>
                  <th className="p-3">Email Login</th>
                  <th className="p-3">Role Akses</th>
                  <th className="p-3">Scope Cabang</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/60">
                    <td className="p-3 font-bold text-slate-100 font-sans">{u.name}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3"><span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-sans font-bold border border-blue-500/30">{u.role}</span></td>
                    <td className="p-3 font-sans text-slate-300">{u.outlet}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form: Create New Role */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> Form Tambah Role Pengguna Baru
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Nama Role *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Auditor Eksternal / Kasir Outlet Jakbar"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Deskripsi Ringkas Peran</label>
                <textarea
                  rows={2}
                  placeholder="Masukkan deskripsi hak akses role baru..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  Simpan Role Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
