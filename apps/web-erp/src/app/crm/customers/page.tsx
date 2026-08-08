"use client";

import { useState, useEffect } from "react";
import { Users, Plus, RefreshCw, Star, Gift, Tag, CheckCircle2, X, Award, Percent, DollarSign } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/DataTable";

interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points: number;
  total_spend: number;
  discount_rate: number; // e.g. 0.05 for 5%
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<"Bronze" | "Silver" | "Gold" | "Platinum">("Silver");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  function loadCustomers() {
    setLoading(true);
    // Seed sample customers if backend API empty
    const initialCustomers: Customer[] = [
      {
        id: "c1",
        code: "MBR-001",
        name: "Budi Santoso",
        phone: "081298765432",
        email: "budi.santoso@gmail.com",
        tier: "Gold",
        points: 1250,
        total_spend: 15400000,
        discount_rate: 0.10, // 10%
        created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
      },
      {
        id: "c2",
        code: "MBR-002",
        name: "Siti Rahmawati",
        phone: "085712345678",
        email: "siti.rahma@yahoo.com",
        tier: "Platinum",
        points: 3420,
        total_spend: 42000000,
        discount_rate: 0.15, // 15%
        created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
      },
      {
        id: "c3",
        code: "MBR-003",
        name: "Andi Wijaya",
        phone: "081311223344",
        email: "andi.wijaya@outlook.com",
        tier: "Silver",
        points: 620,
        total_spend: 6800000,
        discount_rate: 0.05, // 5%
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: "c4",
        code: "MBR-004",
        name: "Dewi Lestari",
        phone: "082199887766",
        email: "dewi.lestari@gmail.com",
        tier: "Bronze",
        points: 150,
        total_spend: 1200000,
        discount_rate: 0.00, // 0%
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];
    setCustomers(initialCustomers);
    setLoading(false);
  }

  function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const discountMap = {
      Bronze: 0,
      Silver: 0.05,
      Gold: 0.10,
      Platinum: 0.15,
    };

    const newCust: Customer = {
      id: String(Date.now()),
      code: `MBR-${Math.floor(100 + Math.random() * 900)}`,
      name,
      phone,
      email,
      tier,
      points: tier === "Platinum" ? 1000 : tier === "Gold" ? 500 : tier === "Silver" ? 200 : 50,
      total_spend: 0,
      discount_rate: discountMap[tier],
      created_at: new Date().toISOString(),
    };

    setCustomers((prev) => [newCust, ...prev]);
    setIsModalOpen(false);
    setName("");
    setPhone("");
    setEmail("");
    setNotification(`Member Baru "${name}" (Tier ${tier}) Berhasil Mendaftar!`);
    setTimeout(() => setNotification(""), 4000);
    setSubmitting(false);
  }

  const columns: ColumnDef<Customer>[] = [
    {
      header: "Kode Member",
      cell: (c) => <span className="font-bold text-blue-400 font-mono">{c.code}</span>,
    },
    {
      header: "Nama Pelanggan",
      cell: (c) => (
        <div>
          <p className="font-bold text-slate-100 font-sans">{c.name}</p>
          <p className="text-[10px] text-slate-400 font-mono">{c.email || "-"}</p>
        </div>
      ),
    },
    {
      header: "No. WhatsApp / HP",
      cell: (c) => <span className="text-slate-300 font-mono text-xs">{c.phone}</span>,
    },
    {
      header: "Loyalty Tier",
      cell: (c) => {
        const tierColors = {
          Platinum: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          Gold: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          Silver: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          Bronze: "bg-orange-500/20 text-orange-400 border-orange-500/40",
        };
        return (
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 w-fit ${tierColors[c.tier]}`}>
            <Award className="w-3.5 h-3.5" />
            {c.tier} ({c.discount_rate * 100}% Disc)
          </span>
        );
      },
    },
    {
      header: "Poin Reward",
      cell: (c) => (
        <span className="font-bold text-emerald-400 font-mono text-sm flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
          {c.points.toLocaleString("id-ID")} Pts
        </span>
      ),
    },
    {
      header: "Total Belanja (LTV)",
      cell: (c) => (
        <span className="font-bold text-slate-200 font-mono text-xs">
          Rp {c.total_spend.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      header: "Tanggal Bergabung",
      cell: (c) => <span className="text-slate-400 font-mono text-[11px]">{new Date(c.created_at).toLocaleDateString("id-ID")}</span>,
    },
  ];

  const filterOptions = [
    {
      key: "tier",
      label: "Membership Tier",
      options: [
        { label: "Platinum (15% Disc)", value: "Platinum" },
        { label: "Gold (10% Disc)", value: "Gold" },
        { label: "Silver (5% Disc)", value: "Silver" },
        { label: "Bronze (0% Disc)", value: "Bronze" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" /> Manajemen Pelanggan & Program Loyalty Member
          </h1>
          <p className="text-xs text-slate-400">Database Pelanggan Setia, Poin Reward Belanja, & Diskon Khusus Membership Tier</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadCustomers} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> + Registrasi Member Baru
          </button>
        </div>
      </div>

      {/* Loyalty Program Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Tier Platinum (15% Disc)</p>
            <p className="text-lg font-bold text-slate-100 font-mono">1 Member</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Tier Gold (10% Disc)</p>
            <p className="text-lg font-bold text-slate-100 font-mono">1 Member</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700/40 text-slate-300 flex items-center justify-center font-bold">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Tier Silver (5% Disc)</p>
            <p className="text-lg font-bold text-slate-100 font-mono">1 Member</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Aturan Poin Reward</p>
            <p className="text-xs font-bold text-emerald-400 font-mono">Rp 10.000 = 1 Poin</p>
          </div>
        </div>
      </div>

      {/* Customer Master DataTable */}
      <DataTable
        data={customers}
        columns={columns}
        searchPlaceholder="Cari berdasarkan Nama, WhatsApp, Kode Member, atau Tier..."
        filterOptions={filterOptions}
      />

      {/* Add New Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" /> Registrasi Pelanggan & Loyalty Member Baru
                </h3>
                <p className="text-xs text-slate-400">Pendaftaran Member untuk Mendapatkan Poin Belanja & Auto Diskon POS</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              {/* 1. Name */}
              <div className="space-y-1">
                <label className="text-slate-200 font-bold block">Nama Lengkap Pelanggan *</label>
                <input
                  type="text"
                  required
                  placeholder="Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* 2. Phone */}
              <div className="space-y-1">
                <label className="text-slate-200 font-bold block">No. WhatsApp / HP *</label>
                <input
                  type="text"
                  required
                  placeholder="081298765432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 3. Email */}
              <div className="space-y-1">
                <label className="text-slate-200 font-bold block">Alamat Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="pelanggan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 4. Tier Selection */}
              <div className="space-y-1">
                <label className="text-slate-200 font-bold block">Membership Tier *</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Bronze">Bronze (Diskon 0% • Welcome 50 Poin)</option>
                  <option value="Silver">Silver (Diskon 5% • Welcome 200 Poin)</option>
                  <option value="Gold">Gold (Diskon 10% • Welcome 500 Poin)</option>
                  <option value="Platinum">Platinum (Diskon 15% • Welcome 1000 Poin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/30"
                >
                  {submitting ? "Mendaftarkan..." : "Daftarkan Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
