"use client";

import { useState, useEffect } from "react";
import { Database, Plus, RefreshCw, Trash2, CheckCircle2, X, Tag, ShieldCheck, Layers, Ruler, Building, CreditCard, Warehouse } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/DataTable";

interface MasterItem {
  id: string;
  type: string;
  code: string;
  name: string;
  parent_key?: string;
  is_active: boolean;
  created_at: string;
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<string>("category");
  const [masterList, setMasterList] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [parentKey, setParentKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tabs = [
    { id: "category", label: "Kategori Produk", icon: Tag },
    { id: "brand", label: "Brand / Model Tipe", icon: Layers },
    { id: "variant", label: "Variasi Warna & Bahan", icon: Layers },
    { id: "size", label: "Sub-Variasi Size / Ukuran", icon: Ruler },
    { id: "uom", label: "Satuan (UOM)", icon: Ruler },
    { id: "department", label: "Departemen HR", icon: Building },
    { id: "payment_method", label: "Metode Bayar POS", icon: CreditCard },
    { id: "warehouse", label: "Gudang & Cabang", icon: Warehouse },
  ];

  useEffect(() => {
    loadMasterData(activeTab);
  }, [activeTab]);

  function loadMasterData(tabKey: string) {
    setLoading(true);

    // Initial Dynamic Master Data Records
    const defaultData: Record<string, MasterItem[]> = {
      category: [
        { id: "c1", type: "category", code: "CAT-FASHION", name: "Sepatu & Fashion", is_active: true, created_at: new Date().toISOString() },
        { id: "c2", type: "category", code: "CAT-FOOD", name: "Makanan", is_active: true, created_at: new Date().toISOString() },
        { id: "c3", type: "category", code: "CAT-DRINK", name: "Minuman", is_active: true, created_at: new Date().toISOString() },
        { id: "c4", type: "category", code: "CAT-SNACK", name: "Snack & Permen", is_active: true, created_at: new Date().toISOString() },
        { id: "c5", type: "category", code: "CAT-BEAUTY", name: "Personal Care & Mandi", is_active: true, created_at: new Date().toISOString() },
        { id: "c6", type: "category", code: "CAT-ATK", name: "ATK & Perlengkapan Kantor", is_active: true, created_at: new Date().toISOString() },
      ],
      brand: [
        { id: "b1", type: "brand", code: "BRD-NIKE", name: "Nike Air Max", parent_key: "Sepatu & Fashion", is_active: true, created_at: new Date().toISOString() },
        { id: "b2", type: "brand", code: "BRD-ADIDAS", name: "Adidas Ultraboost", parent_key: "Sepatu & Fashion", is_active: true, created_at: new Date().toISOString() },
        { id: "b3", type: "brand", code: "BRD-INDOFOOD", name: "Indofood", parent_key: "Makanan", is_active: true, created_at: new Date().toISOString() },
        { id: "b4", type: "brand", code: "BRD-SOSRO", name: "Teh Botol Sosro", parent_key: "Minuman", is_active: true, created_at: new Date().toISOString() },
      ],
      variant: [
        { id: "v1", type: "variant", code: "VAR-BLK-RED", name: "Hitam Red (Leather)", is_active: true, created_at: new Date().toISOString() },
        { id: "v2", type: "variant", code: "VAR-WHT-LEA", name: "Putih Leather", is_active: true, created_at: new Date().toISOString() },
        { id: "v3", type: "variant", code: "VAR-BLU-CAN", name: "Blue Canvas", is_active: true, created_at: new Date().toISOString() },
        { id: "v4", type: "variant", code: "VAR-ORIGINAL", name: "Rasa Original", is_active: true, created_at: new Date().toISOString() },
      ],
      size: [
        { id: "s1", type: "size", code: "SZ-39", name: "Size 39", is_active: true, created_at: new Date().toISOString() },
        { id: "s2", type: "size", code: "SZ-40", name: "Size 40", is_active: true, created_at: new Date().toISOString() },
        { id: "s3", type: "size", code: "SZ-41", name: "Size 41", is_active: true, created_at: new Date().toISOString() },
        { id: "s4", type: "size", code: "SZ-42", name: "Size 42", is_active: true, created_at: new Date().toISOString() },
        { id: "s5", type: "size", code: "SZ-500ML", name: "500 ml", is_active: true, created_at: new Date().toISOString() },
        { id: "s6", type: "size", code: "SZ-1L", name: "1 Liter", is_active: true, created_at: new Date().toISOString() },
      ],
      uom: [
        { id: "u1", type: "uom", code: "UOM-PCS", name: "Pcs (Satuan)", is_active: true, created_at: new Date().toISOString() },
        { id: "u2", type: "uom", code: "UOM-PSG", name: "Pasang", is_active: true, created_at: new Date().toISOString() },
        { id: "u3", type: "uom", code: "UOM-BTL", name: "Botol", is_active: true, created_at: new Date().toISOString() },
        { id: "u4", type: "uom", code: "UOM-PCK", name: "Pack", is_active: true, created_at: new Date().toISOString() },
        { id: "u5", type: "uom", code: "UOM-BOX", name: "Kotak / Dus", is_active: true, created_at: new Date().toISOString() },
        { id: "u6", type: "uom", code: "UOM-KG", name: "Kilogram (Kg)", is_active: true, created_at: new Date().toISOString() },
      ],
      department: [
        { id: "d1", type: "department", code: "DEP-OPS", name: "Operational Store", is_active: true, created_at: new Date().toISOString() },
        { id: "d2", type: "department", code: "DEP-POS", name: "Sales & Kasir", is_active: true, created_at: new Date().toISOString() },
        { id: "d3", type: "department", code: "DEP-LOG", name: "Warehouse & Logistik", is_active: true, created_at: new Date().toISOString() },
        { id: "d4", type: "department", code: "DEP-FIN", name: "Finance & Keuangan", is_active: true, created_at: new Date().toISOString() },
        { id: "d5", type: "department", code: "DEP-HR", name: "Human Resources", is_active: true, created_at: new Date().toISOString() },
      ],
      payment_method: [
        { id: "p1", type: "payment_method", code: "PAY-CASH", name: "Cash (Uang Tunai)", is_active: true, created_at: new Date().toISOString() },
        { id: "p2", type: "payment_method", code: "PAY-QRIS", name: "QRIS All Payment", is_active: true, created_at: new Date().toISOString() },
        { id: "p3", type: "payment_method", code: "PAY-EDC-DEBIT", name: "EDC Debit Card", is_active: true, created_at: new Date().toISOString() },
        { id: "p4", type: "payment_method", code: "PAY-EDC-CREDIT", name: "EDC Credit Card", is_active: true, created_at: new Date().toISOString() },
        { id: "p5", type: "payment_method", code: "PAY-BANK-BCA", name: "Transfer Bank BCA", is_active: true, created_at: new Date().toISOString() },
      ],
      warehouse: [
        { id: "w1", type: "warehouse", code: "WH-JAKPUS", name: "Outlet Jakarta Pusat", parent_key: "Central", is_active: true, created_at: new Date().toISOString() },
        { id: "w2", type: "warehouse", code: "WH-MAIN", name: "Gudang Utama Logistik", parent_key: "Central", is_active: true, created_at: new Date().toISOString() },
        { id: "w3", type: "warehouse", code: "WH-SURABAYA", name: "Store Cabang Surabaya", parent_key: "Branch", is_active: true, created_at: new Date().toISOString() },
      ],
    };

    setMasterList(defaultData[tabKey] || []);
    setLoading(false);
  }

  function handleCreateMasterItem(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const newItem: MasterItem = {
      id: String(Date.now()),
      type: activeTab,
      code: code || `MST-${Math.floor(100 + Math.random() * 900)}`,
      name,
      parent_key: parentKey,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setMasterList((prev) => [newItem, ...prev]);
    setIsModalOpen(false);
    setCode("");
    setName("");
    setParentKey("");
    setNotification(`Data Master ${tabs.find((t) => t.id === activeTab)?.label} Berhasil Ditambahkan!`);
    setTimeout(() => setNotification(""), 3000);
    setSubmitting(false);
  }

  function handleDeleteMasterItem(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus data master ini?")) {
      setMasterList((prev) => prev.filter((item) => item.id !== id));
    }
  }

  const columns: ColumnDef<MasterItem>[] = [
    {
      header: "Kode Master",
      cell: (item) => <span className="font-bold text-blue-400 font-mono">{item.code}</span>,
    },
    {
      header: "Nama Master Record",
      cell: (item) => (
        <div>
          <p className="font-bold text-slate-100 font-sans">{item.name}</p>
          {item.parent_key && <p className="text-[10px] text-amber-400 font-mono">Parent: {item.parent_key}</p>}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-400"}`}>
          {item.is_active ? "● Aktif" : "Non-Aktif"}
        </span>
      ),
    },
    {
      header: "Waktu Buat",
      cell: (item) => <span className="text-slate-400 font-mono text-[11px]">{new Date(item.created_at).toLocaleDateString("id-ID")}</span>,
    },
    {
      header: "Aksi",
      cell: (item) => (
        <button onClick={() => handleDeleteMasterItem(item.id)} className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab);

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
            <Database className="w-6 h-6 text-amber-400" /> Central Master Data Engine (100% Dinamis)
          </h1>
          <p className="text-xs text-slate-400">Pusat Pengelolaan Master Data Kategori, Brand, Variasi, Size, UOM, Departemen, & Pembayaran</p>
        </div>

        <button
          onClick={() => {
            setCode(`MST-${Math.floor(100 + Math.random() * 900)}`);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> + Tambah {currentTabObj?.label} Baru
        </button>
      </div>

      {/* Master Data Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isAct
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Master Data Table */}
      <DataTable
        data={masterList}
        columns={columns}
        searchPlaceholder={`Cari data master ${currentTabObj?.label}...`}
      />

      {/* Add Master Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" /> Tambah {currentTabObj?.label} Baru
                </h3>
                <p className="text-xs text-slate-400">Pengelolaan Master Data Dinamis</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMasterItem} className="space-y-4 text-xs">
              {/* 1. Code */}
              <div className="space-y-1">
                <label className="text-slate-200 font-bold block">Kode Master *</label>
                <input
                  type="text"
                  required
                  placeholder="MST-101"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 2. Name */}
              <div className="space-y-1">
                <label className="text-slate-200 font-bold block">Nama Master Record *</label>
                <input
                  type="text"
                  required
                  placeholder={`Nama ${currentTabObj?.label}...`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              {/* 3. Parent Key (Optional) */}
              <div className="space-y-1">
                <label className="text-slate-200 font-bold block">Parent Group (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Sepatu & Fashion"
                  value={parentKey}
                  onChange={(e) => setParentKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                />
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
                  {submitting ? "Menyimpan..." : "Simpan Master Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
