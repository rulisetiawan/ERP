"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Building2,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  Settings,
  Truck,
  ChevronDown,
  Sparkles,
  Database,
  UserCheck,
  FileText
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("inventory");

  const menuItems = [
    { title: "Dasbor Utama", href: "/dashboard", icon: LayoutDashboard },
    { title: "Asisten Kecerdasan Buatan", href: "/ai-assistant", icon: Sparkles, badge: "AI" },
    { title: "Laporan & Analitik", href: "/reports", icon: FileText, badge: "Pusat" },
    { title: "Kasir POS Penjualan", href: "/pos", icon: ShoppingCart, badge: "POS" },
    { title: "Data Pelanggan & Loyalitas", href: "/crm/customers", icon: UserCheck, badge: "CRM" },
    {
      title: "Inventaris & Stok Barang",
      key: "inventory",
      icon: Package,
      children: [
        { title: "Katalog Produk", href: "/inventory/products" },
        { title: "Barang Masuk & Keluar", href: "/inventory/movements" },
        { title: "Penyesuaian Stok Fisik", href: "/inventory/opnames" },
        { title: "Mutasi Antar Cabang", href: "/inventory/transfers" },
      ],
    },
    {
      title: "Pembelian & Pemasok",
      key: "purchasing",
      icon: Truck,
      children: [
        { title: "Pesanan Pembelian (PO)", href: "/purchasing/orders" },
        { title: "Daftar Pemasok (Vendor)", href: "/purchasing/vendors" },
      ],
    },
    {
      title: "SDM & Penggajian",
      key: "hr",
      icon: Users,
      children: [
        { title: "Data Karyawan", href: "/hr/employees" },
        { title: "Absensi Kehadiran Karyawan", href: "/hr/attendances" },
        { title: "Penggajian (Payroll)", href: "/hr/payrolls" },
      ],
    },
    {
      title: "Keuangan & Akuntansi",
      key: "finance",
      icon: FileSpreadsheet,
      children: [
        { title: "Bagan Akun Keuangan (CoA)", href: "/finance/coa" },
        { title: "Buku Jurnal Umum", href: "/finance/journals" },
        { title: "Laporan Laba Rugi", href: "/finance/reports/pnl" },
      ],
    },
    { title: "Manajemen Aset Tetap", href: "/assets", icon: Building2 },
    { title: "Pengaturan Data Master", href: "/settings/master-data", icon: Database, badge: "Pusat" },
    { title: "Obrolan Tim & WhatsApp", href: "/chat", icon: MessageSquare, badge: "WAHA" },
    {
      title: "Audit & Keamanan Sistem",
      key: "security",
      icon: ShieldCheck,
      children: [
        { title: "Peran & Hak Akses Pengguna", href: "/security/roles" },
        { title: "Log Rekam Jejak Audit", href: "/security/audit-logs" },
        { title: "Log Kesalahan Sistem", href: "/security/error-logs" },
      ],
    },
    { title: "Pengaturan Parameter Sistem", href: "/settings/parameters", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <Link href="/dashboard" className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
          EP
        </div>
        <div>
          <h1 className="font-semibold text-slate-100 text-sm tracking-wide">SISTEM ERP & KASIR POS</h1>
          <p className="text-[11px] text-slate-400">Edisi Perusahaan v1.0</p>
        </div>
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const hasChildren = !!item.children;
          const isSubmenuOpen = openSubmenu === item.key;

          if (hasChildren) {
            return (
              <div key={item.key} className="space-y-1">
                <button
                  onClick={() => setOpenSubmenu(isSubmenuOpen ? null : item.key!)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-blue-400" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`} />
                </button>
                {isSubmenuOpen && (
                  <div className="pl-9 space-y-1">
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          pathname === child.href
                            ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                        }`}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
